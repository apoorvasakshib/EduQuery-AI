const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  chunkId: { type: String, required: true },
  text: { type: String, required: true },
  pageNumber: { type: Number, default: 1 },
  embedding: { type: [Number], default: [] },
  keywords: { type: [String], default: [] },
  chunkIndex: { type: Number, required: true },
});

const DocumentVersionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    filename: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    hasOCR: {
      type: Boolean,
      default: false,
    },
    chunks: [ChunkSchema],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentVersion', DocumentVersionSchema);
