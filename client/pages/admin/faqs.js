import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import { useChatStore } from '../../store/useChatStore';
import api from '../../services/api';
import { HelpCircle, Sparkles, Check, Trash2, Edit2 } from 'lucide-react';

export default function AdminFAQs() {
  const { documents, fetchDocuments } = useChatStore();
  const [faqs, setFaqs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDocuments();
    loadFAQs();
  }, [fetchDocuments]);

  const loadFAQs = async () => {
    try {
      const res = await api.get('/faqs');
      setFaqs(res.data.data || []);
    } catch (err) {}
  };

  const handleGenerateFAQs = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    try {
      await api.post('/faqs/generate', { documentId: selectedDocId });
      loadFAQs();
    } catch (err) {}
    setGenerating(false);
  };

  const handleUpdateStatus = async (faqId, status) => {
    try {
      await api.patch(`/faqs/${faqId}/status`, { status });
      loadFAQs();
    } catch (err) {}
  };

  const handleDelete = async (faqId) => {
    try {
      await api.delete(`/faqs/${faqId}`);
      loadFAQs();
    } catch (err) {}
  };

  return (
    <>
      <Head>
        <title>AI-Generated FAQs | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-purple-600" /> AI-Generated FAQs Manager
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate, review, approve, and publish FAQs extracted from official college PDFs
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="console-input text-xs"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
              >
                <option value="">Select Document to Extract FAQs</option>
                {documents.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateFAQs}
                disabled={!selectedDocId || generating}
                className="console-btn-primary text-xs"
              >
                <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Extracting FAQs...' : 'Generate FAQs'}
              </button>
            </div>
          </div>

          <div className="console-card overflow-hidden">
            <div className="console-card-header">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">FAQ Knowledge Items</h3>
              <span className="text-xs font-mono text-slate-400">{faqs.length} FAQs total</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {faqs.map((faq) => (
                <div key={faq._id} className="p-4 space-y-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Q: {faq.question}
                    </h4>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                          faq.status === 'published'
                            ? 'console-badge-processed'
                            : 'console-badge-pending'
                        }`}
                      >
                        {faq.status}
                      </span>

                      {faq.status !== 'published' && (
                        <button
                          onClick={() => handleUpdateStatus(faq._id, 'published')}
                          className="console-btn-secondary py-0.5 text-xs text-emerald-600"
                        >
                          Approve & Publish
                        </button>
                      )}

                      <button onClick={() => handleDelete(faq._id)} className="console-btn-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                    A: {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
