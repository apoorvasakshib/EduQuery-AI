const FAQ = require('../models/FAQ');
const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const { generateFAQsFromText } = require('../services/summaryService');

const getFAQs = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.role === 'student') {
      filter.status = 'published';
      if (req.user.departmentId) filter.departmentId = req.user.departmentId;
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    const faqs = await FAQ.find(filter)
      .populate('departmentId', 'name code')
      .populate('collectionId', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: faqs.length, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const generateFAQsForDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    const document = await Document.findById(documentId).populate('activeVersionId');
    if (!document || !document.activeVersionId) {
      return res.status(404).json({ success: false, message: 'Document or active version not found' });
    }

    const version = document.activeVersionId;
    const fullText = version.chunks.map((c) => c.text).join('\n');
    const faqsData = await generateFAQsFromText(fullText, document.title);

    const createdFaqs = [];
    for (const item of faqsData) {
      const faq = await FAQ.create({
        question: item.question,
        answer: item.answer,
        departmentId: document.departmentId,
        collectionId: document.collectionId,
        documentId: document._id,
        status: 'draft',
        createdBy: req.user ? req.user.id : null,
      });
      createdFaqs.push(faq);
    }

    res.status(201).json({
      success: true,
      message: `Generated ${createdFaqs.length} draft FAQs successfully`,
      data: createdFaqs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateFAQStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, question, answer } = req.body;
    const faq = await FAQ.findByIdAndUpdate(
      id,
      { status, ...(question && { question }), ...(answer && { answer }) },
      { new: true }
    );
    res.status(200).json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteFAQ = async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getFAQs,
  generateFAQsForDocument,
  updateFAQStatus,
  deleteFAQ,
};
