import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import DocumentManager from '../../components/DocumentManager';
import ProcessingPipeline from '../../components/ProcessingPipeline';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import api from '../../services/api';
import { FileText, Layers, Eye, RefreshCw, CheckCircle2, History, X } from 'lucide-react';

export default function AdminDocuments() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { documents, fetchDocuments } = useChatStore();

  const [selectedSummaryDoc, setSelectedSummaryDoc] = useState(null);
  const [selectedVersionsDoc, setSelectedVersionsDoc] = useState(null);
  const [versionsList, setVersionsList] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role === 'student'))) {
      router.push('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  const loadVersions = async (docId) => {
    setLoadingVersions(true);
    try {
      const res = await api.get(`/documents/${docId}/versions`);
      setVersionsList(res.data.data || []);
    } catch (err) {}
    setLoadingVersions(false);
  };

  const handleActivateVersion = async (docId, versionId) => {
    try {
      await api.patch(`/documents/${docId}/versions/${versionId}/activate`);
      await loadVersions(docId);
      await fetchDocuments();
    } catch (err) {}
  };

  if (isLoading || !isAuthenticated || !user) return null;

  return (
    <>
      <Head>
        <title>Document Management | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-6 h-6 text-sky-600" /> Document & Version Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload PDFs, manage active/archived versions, inspect pipeline steps & AI summaries
              </p>
            </div>

            <button onClick={() => fetchDocuments()} className="console-btn-secondary">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          <ProcessingPipeline currentStep="ready" />

          <DocumentManager />

          {/* Version History Modal (Spec 7) */}
          {selectedVersionsDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-600" /> Version History: {selectedVersionsDoc.title}
                  </h3>
                  <button onClick={() => setSelectedVersionsDoc(null)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loadingVersions ? (
                  <div className="p-6 text-center font-mono text-xs text-slate-400">Loading versions...</div>
                ) : (
                  <div className="space-y-3">
                    {versionsList.map((ver) => (
                      <div key={ver._id} className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            Version {ver.versionNumber} ({ver.filename})
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {ver.chunkCount} chunks • {ver.pageCount} pages • Uploaded {new Date(ver.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {ver.status === 'active' ? (
                            <span className="console-badge-processed">Active Version</span>
                          ) : (
                            <button
                              onClick={() => handleActivateVersion(selectedVersionsDoc._id, ver._id)}
                              className="console-btn-secondary py-1 text-xs"
                            >
                              Make Active
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
