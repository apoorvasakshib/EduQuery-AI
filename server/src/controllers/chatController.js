const Conversation = require('../models/Conversation');
const { answerQuery } = require('../services/ragService');

const askQuestion = async (req, res) => {
  try {
    const { query, conversationId, language = 'en', departmentId = null } = req.body;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a valid question' });
    }

    console.log('[QUESTION] Student question received');
    console.log(`[QUESTION] Query text: "${query}" (Language: ${language})`);

    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : 'student';
    const userDepartmentId = departmentId || (req.user ? req.user.departmentId : null);
    const accessibleCollectionIds = req.user ? req.user.accessibleCollectionIds : [];

    // 1. Execute RAG Pipeline with Hybrid Search & Re-ranking
    const ragResult = await answerQuery({
      query,
      departmentId: userDepartmentId,
      accessibleCollectionIds,
      userRole,
      language,
    });

    // 2. Save/Update Conversation Thread
    let conversation;
    if (userId) {
      if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, userId });
      }

      if (!conversation) {
        conversation = await Conversation.create({
          userId,
          departmentId: userDepartmentId,
          language,
          title: query.slice(0, 40) + '...',
          messages: [],
        });
      }

      // Append user prompt
      conversation.messages.push({
        role: 'user',
        content: query,
        language,
        timestamp: new Date(),
      });

      // Append assistant answer
      conversation.messages.push({
        role: 'assistant',
        content: ragResult.answer,
        language,
        confidenceScore: ragResult.confidenceScore,
        confidenceLevel: ragResult.confidenceLevel,
        sources: ragResult.sources,
        suggestedQuestions: ragResult.suggestedQuestions,
        timestamp: new Date(),
      });

      await conversation.save();
    }

    res.status(200).json({
      success: true,
      data: {
        answer: ragResult.answer,
        confidenceScore: ragResult.confidenceScore,
        confidenceLevel: ragResult.confidenceLevel,
        sources: ragResult.sources,
        suggestedQuestions: ragResult.suggestedQuestions,
        grounded: ragResult.grounded,
        conversationId: conversation ? conversation._id : null,
      },
    });
  } catch (error) {
    console.error('[Chat Controller Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing query through RAG pipeline',
    });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { conversationId, messageIndex, rating, reason, comment } = req.body;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found' });
    }

    if (messageIndex >= 0 && messageIndex < conversation.messages.length) {
      conversation.messages[messageIndex].feedback = {
        rating,
        reason,
        comment,
        createdAt: new Date(),
      };
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(30);

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const renameConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const conv = await Conversation.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title },
      { new: true }
    );
    res.status(200).json({ success: true, data: conv });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await Conversation.findOneAndDelete({ _id: id, userId: req.user.id });
    res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const format = req.query.format || 'json';
    const conversation = await Conversation.findOne({ _id: id, userId: req.user.id });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (format === 'txt') {
      let txtContent = `=== EDUQUERY AI CONVERSATION EXPORT ===\nTitle: ${conversation.title}\nDate: ${conversation.createdAt}\n\n`;
      conversation.messages.forEach((msg) => {
        txtContent += `[${msg.role.toUpperCase()}] (${new Date(msg.timestamp).toLocaleString()}):\n${msg.content}\n`;
        if (msg.sources && msg.sources.length > 0) {
          txtContent += `Sources: ${msg.sources.map((s) => `${s.documentTitle} (Page ${s.pageNumber})`).join(', ')}\n`;
        }
        txtContent += `\n----------------------------------------\n\n`;
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="conversation_${id}.txt"`);
      return res.send(txtContent);
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  askQuestion,
  submitFeedback,
  getHistory,
  renameConversation,
  deleteConversation,
  exportConversation,
};
