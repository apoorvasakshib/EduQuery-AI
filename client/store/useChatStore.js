import { create } from 'zustand';
import api from '../services/api';

export const useChatStore = create((set, get) => ({
  messages: [],
  conversationId: null,
  isAsking: false,
  language: 'en',
  activeSourceModal: null, // { title, pageNumber, textChunk, relevanceScore }
  departments: [],
  collections: [],
  selectedDepartmentId: '',
  selectedCollectionId: '',
  documents: [],
  isLoadingDocs: false,
  uploadingDoc: false,
  error: null,

  setLanguage: (lang) => set({ language: lang }),
  openSourceModal: (source) => set({ activeSourceModal: source }),
  closeSourceModal: () => set({ activeSourceModal: null }),

  // RAG Query
  askQuestion: async (queryText) => {
    if (!queryText.trim()) return;

    const userMsg = {
      role: 'user',
      content: queryText,
      language: get().language,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isAsking: true,
      error: null,
    }));

    try {
      const res = await api.post('/chat/ask', {
        query: queryText,
        conversationId: get().conversationId,
        language: get().language,
        departmentId: get().selectedDepartmentId || undefined,
      });

      const { answer, confidenceScore, confidenceLevel, sources, suggestedQuestions, conversationId } = res.data.data;

      const aiMsg = {
        role: 'assistant',
        content: answer,
        confidenceScore,
        confidenceLevel,
        sources: sources || [],
        suggestedQuestions: suggestedQuestions || [],
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        conversationId: conversationId || state.conversationId,
        isAsking: false,
      }));
    } catch (err) {
      set({
        isAsking: false,
        error: err.message,
      });
    }
  },

  // Submit Feedback (thumbs_up / thumbs_down)
  submitFeedback: async (messageIndex, rating, reason = null, comment = '') => {
    try {
      const convId = get().conversationId;
      if (!convId) return;

      await api.post('/chat/feedback', {
        conversationId: convId,
        messageIndex,
        rating,
        reason,
        comment,
      });

      set((state) => {
        const updatedMsgs = [...state.messages];
        if (updatedMsgs[messageIndex]) {
          updatedMsgs[messageIndex].feedback = { rating, reason, comment };
        }
        return { messages: updatedMsgs };
      });
    } catch (err) {
      console.warn('Feedback submit error:', err.message);
    }
  },

  conversationsList: [],

  fetchHistoryList: async () => {
    try {
      const res = await api.get('/chat/history');
      if (res.data.success) {
        set({ conversationsList: res.data.data || [] });
      }
    } catch (err) {}
  },

  loadConversation: (conv) => {
    if (conv) {
      set({
        conversationId: conv._id,
        messages: conv.messages || [],
      });
    }
  },

  fetchHistory: async () => {
    try {
      const res = await api.get('/chat/history');
      if (res.data.success && res.data.data.length > 0) {
        const latestConv = res.data.data[0];
        set({
          conversationsList: res.data.data,
          conversationId: latestConv._id,
          messages: latestConv.messages || [],
        });
      }
    } catch (err) {
      console.warn('Failed to load chat history:', err.message);
    }
  },

  clearChat: async () => {
    set({ messages: [], conversationId: null });
  },

  // Department & Collection Selectors
  fetchDepartments: async () => {
    try {
      const res = await api.get('/departments');
      set({ departments: res.data.data || [] });
    } catch (err) {}
  },

  fetchCollections: async () => {
    try {
      const res = await api.get('/collections');
      set({ collections: res.data.data || [] });
    } catch (err) {}
  },

  fetchDocuments: async () => {
    set({ isLoadingDocs: true });
    try {
      const res = await api.get('/admin/documents');
      set({ documents: res.data.data || [], isLoadingDocs: false });
    } catch (err) {
      set({ isLoadingDocs: false, error: err.message });
    }
  },

  uploadDocument: async (file, title, departmentId, collectionId) => {
    set({ uploadingDoc: true, error: null });
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (departmentId) formData.append('departmentId', departmentId);
    if (collectionId) formData.append('collectionId', collectionId);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ uploadingDoc: false });
      await get().fetchDocuments();
      return { success: true, data: res.data.data };
    } catch (err) {
      set({ uploadingDoc: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  deleteDocument: async (docId) => {
    try {
      await api.delete(`/admin/documents/${docId}`);
      set((state) => ({
        documents: state.documents.filter((d) => d._id !== docId),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
}));
