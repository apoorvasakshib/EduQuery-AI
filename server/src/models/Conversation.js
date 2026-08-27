const mongoose = require('mongoose');

const SourceCitationSchema = new mongoose.Schema({
  documentId: { type: String },
  documentTitle: { type: String, required: true },
  versionNumber: { type: Number, default: 1 },
  pageNumber: { type: Number, default: 1 },
  relevanceScore: { type: Number, default: 0 },
  textChunk: { type: String, default: '' },
});

const FeedbackSchema = new mongoose.Schema({
  rating: {
    type: String,
    enum: ['thumbs_up', 'thumbs_down', null],
    default: null,
  },
  reason: {
    type: String,
    enum: ['Incorrect answer', 'Not relevant', 'Missing information', 'Source problem', 'Other', null],
    default: null,
  },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'en',
  },
  confidenceScore: {
    type: Number,
    default: 0,
  },
  confidenceLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High',
  },
  sources: [SourceCitationSchema],
  suggestedQuestions: [String],
  feedback: FeedbackSchema,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    title: {
      type: String,
      default: 'College Query Session',
    },
    language: {
      type: String,
      default: 'en',
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);
