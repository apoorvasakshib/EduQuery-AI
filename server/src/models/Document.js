const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    activeVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentVersion',
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed', 'archived'],
      default: 'uploaded',
    },
    processingStep: {
      type: String,
      enum: ['upload', 'text_extraction', 'ocr', 'chunking', 'embedding', 'indexing', 'ready', 'failed'],
      default: 'upload',
    },
    processingError: {
      type: String,
      default: '',
    },
    hasOCR: {
      type: Boolean,
      default: false,
    },
    summary: {
      shortSummary: { type: String, default: '' },
      keyPoints: { type: [String], default: [] },
      importantDates: { type: [String], default: [] },
      importantRules: { type: [String], default: [] },
      mainTopics: { type: [String], default: [] },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
