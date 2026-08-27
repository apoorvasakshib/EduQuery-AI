const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const { processPDFDocument } = require('../services/pdfService');
const { generateEmbedding } = require('../services/vectorService');

const getDocumentVersions = async (req, res) => {
  try {
    const { documentId } = req.params;
    const versions = await DocumentVersion.find({ documentId })
      .select('versionNumber filename fileSize status chunkCount pageCount hasOCR createdAt')
      .sort({ versionNumber: -1 });

    res.status(200).json({ success: true, count: versions.length, data: versions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const uploadNewVersion = async (req, res) => {
  try {
    const { documentId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Process PDF via pdfService
    const processed = await processPDFDocument(req.file.buffer, req.file.originalname);

    // Embed chunks
    const embeddedChunks = [];
    for (const chunk of processed.chunks) {
      const embedding = await generateEmbedding(chunk.text);
      embeddedChunks.push({
        ...chunk,
        embedding,
      });
    }

    const nextVersionNumber = document.currentVersion + 1;

    // Archive previous active versions
    await DocumentVersion.updateMany({ documentId }, { status: 'archived' });

    // Create new Version record
    const newVersion = await DocumentVersion.create({
      documentId,
      versionNumber: nextVersionNumber,
      filename: req.file.originalname,
      fileSize: req.file.size,
      status: 'active',
      chunkCount: embeddedChunks.length,
      pageCount: processed.numPages,
      hasOCR: processed.requiresOCR,
      chunks: embeddedChunks,
      uploadedBy: req.user ? req.user.id : null,
    });

    // Update parent Document record
    document.currentVersion = nextVersionNumber;
    document.activeVersionId = newVersion._id;
    document.filename = req.file.originalname;
    document.fileSize = req.file.size;
    document.status = 'processed';
    await document.save();

    res.status(201).json({
      success: true,
      message: `Successfully uploaded Version ${nextVersionNumber}`,
      data: newVersion,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const setActiveVersion = async (req, res) => {
  try {
    const { documentId, versionId } = req.params;

    // Archive all versions of this document
    await DocumentVersion.updateMany({ documentId }, { status: 'archived' });

    // Set selected version as active
    const activeVersion = await DocumentVersion.findByIdAndUpdate(
      versionId,
      { status: 'active' },
      { new: true }
    );

    if (!activeVersion) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    // Update parent Document
    await Document.findByIdAndUpdate(documentId, {
      activeVersionId: activeVersion._id,
      currentVersion: activeVersion.versionNumber,
      filename: activeVersion.filename,
    });

    res.status(200).json({
      success: true,
      message: `Version ${activeVersion.versionNumber} marked as active`,
      data: activeVersion,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDocumentVersions,
  uploadNewVersion,
  setActiveVersion,
};
