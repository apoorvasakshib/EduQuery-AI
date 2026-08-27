const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const Department = require('../models/Department');
const Collection = require('../models/Collection');
const { processDocument } = require('../services/pdfService');
const { generateEmbedding } = require('../services/vectorService');
const { generateDocumentSummary } = require('../services/summaryService');

const uploadDocument = async (req, res) => {
  let documentRecord = null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('[UPLOAD] Document received');
    console.log(`[UPLOAD] File name: ${req.file.originalname}`);
    console.log(`[UPLOAD] File type: ${req.file.mimetype}`);

    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const hasAllowedExt = /\.(pdf|png|jpe?g)$/i.test(req.file.originalname);

    if (!allowedMimeTypes.includes(req.file.mimetype) && !hasAllowedExt) {
      return res.status(400).json({
        success: false,
        errorType: 'Unsupported File Type',
        message: 'Unsupported File Type. Only PDF, PNG, JPG, and JPEG documents are allowed.',
      });
    }

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        errorType: 'File Too Large',
        message: 'File Too Large. Maximum allowed file size is 10MB.',
      });
    }

    if (req.file.size === 0) {
      return res.status(400).json({
        success: false,
        errorType: 'Empty File',
        message: 'The uploaded file is empty.',
      });
    }

    // Default Department & Collection if omitted
    let departmentId = req.body.departmentId;
    let collectionId = req.body.collectionId;

    if (!departmentId) {
      const defaultDept = (await Department.findOne()) || (await Department.create({ name: 'General College', code: 'GEN' }));
      departmentId = defaultDept._id;
    }

    if (!collectionId) {
      const defaultColl =
        (await Collection.findOne({ code: 'GEN-REG' })) ||
        (await Collection.findOne({ departmentId })) ||
        (await Collection.create({ name: 'General Regulations', code: 'GEN-REG', departmentId }));
      collectionId = defaultColl._id;
    }

    const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');

    // 1. Create Document Parent Record
    documentRecord = await Document.create({
      title,
      filename: req.file.originalname,
      departmentId,
      collectionId,
      fileSize: req.file.size,
      status: 'processing',
      processingStep: 'text_extraction',
      uploadedBy: req.user ? req.user.id : null,
    });

    console.log('[UPLOAD] Document stored successfully');

    // 2. Extract text & Chunk content (PDF or OCR for images/scanned PDFs)
    const processed = await processDocument(req.file.buffer, req.file.originalname, req.file.mimetype);
    documentRecord.processingStep = processed.requiresOCR ? 'ocr' : 'chunking';
    documentRecord.hasOCR = processed.requiresOCR;
    await documentRecord.save();

    // 3. Generate Embeddings & Index Chunks
    console.log('[INDEXING] Starting document indexing');
    documentRecord.processingStep = 'embedding';
    await documentRecord.save();

    const embeddedChunks = [];
    for (const chunk of processed.chunks) {
      const embedding = await generateEmbedding(chunk.text);
      embeddedChunks.push({
        ...chunk,
        embedding,
      });
    }

    // 4. Create DocumentVersion V1 Record
    documentRecord.processingStep = 'indexing';
    await documentRecord.save();

    const versionRecord = await DocumentVersion.create({
      documentId: documentRecord._id,
      versionNumber: 1,
      filename: req.file.originalname,
      fileSize: req.file.size,
      status: 'active',
      chunkCount: embeddedChunks.length,
      pageCount: processed.numPages,
      hasOCR: processed.requiresOCR,
      chunks: embeddedChunks,
      uploadedBy: req.user ? req.user.id : null,
    });

    console.log('[INDEXING] Document indexed successfully');
    console.log(`[INDEXING] Number of chunks: ${embeddedChunks.length}`);

    // 5. Generate AI Document Summary
    const summaryData = await generateDocumentSummary(processed.rawText, title);

    documentRecord.activeVersionId = versionRecord._id;
    documentRecord.currentVersion = 1;
    documentRecord.status = 'processed';
    documentRecord.processingStep = 'ready';
    documentRecord.summary = summaryData;
    await documentRecord.save();

    res.status(201).json({
      success: true,
      message: 'Document successfully uploaded, extracted, indexed, and vectorized!',
      data: {
        id: documentRecord._id,
        title: documentRecord.title,
        filename: documentRecord.filename,
        status: documentRecord.status,
        chunkCount: embeddedChunks.length,
        version: 1,
        hasOCR: documentRecord.hasOCR,
        summary: documentRecord.summary,
      },
    });
  } catch (error) {
    console.error('[Admin Upload Error]:', error.message);
    if (documentRecord) {
      try {
        documentRecord.status = 'failed';
        documentRecord.processingStep = 'failed';
        documentRecord.processingError = error.message;
        await documentRecord.save();
      } catch (saveErr) {
        console.warn('Failed to update document status to failed:', saveErr.message);
      }
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process and vectorize document',
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) filter.departmentId = req.query.departmentId;
    if (req.query.collectionId) filter.collectionId = req.query.collectionId;

    const documents = await Document.find(filter)
      .populate('departmentId', 'name code')
      .populate('collectionId', 'name code')
      .populate('activeVersionId', 'chunkCount pageCount hasOCR')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Delete associated versions
    await DocumentVersion.deleteMany({ documentId: id });
    await Document.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Document '${document.title}' and all versions deleted successfully`,
      deletedId: id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
};
