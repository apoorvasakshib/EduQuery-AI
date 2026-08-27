import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthStore } from '../../store/useAuthStore';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { History, Search, Download, Trash2, Edit2, MessageSquare, Check, X } from 'lucide-react';

export default function StudentConversations() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    loadHistory();
  }, [isAuthenticated, isLoading, router]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      setConversations(res.data.data || []);
    } catch (err) {}
  };

  const handleRename = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await api.patch(`/chat/history/${id}`, { title: editTitle });
      setEditingId(null);
      loadHistory();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this conversation thread permanently?')) {
      try {
        await api.delete(`/chat/history/${id}`);
        loadHistory();
      } catch (err) {}
    }
  };

  const handleExport = (id, format) => {
    window.open(`http://localhost:5000/api/chat/export/${id}?format=${format}`, '_blank');
  };

  const filteredConversations = conversations.filter(
    (c) => c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Conversation History | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-6 h-6 text-sky-600" /> Saved Conversations
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review past student query threads and export records
              </p>
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                className="console-input pl-9 text-xs"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="console-card overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredConversations.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-medium">No saved conversation threads found.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div key={conv._id} className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      {editingId === conv._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="console-input text-xs py-1"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                          <button onClick={() => handleRename(conv._id)} className="p-1 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-slate-400">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                          <span>{conv.title}</span>
                          <button
                            onClick={() => {
                              setEditingId(conv._id);
                              setEditTitle(conv.title);
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </h3>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        {conv.messages?.length || 0} messages • {new Date(conv.updatedAt).toLocaleDateString()} {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExport(conv._id, 'txt')}
                        className="console-btn-secondary py-1 text-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> Export TXT
                      </button>
                      <button
                        onClick={() => handleDelete(conv._id)}
                        className="console-btn-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
