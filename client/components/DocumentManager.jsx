import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { FileText, Trash2, UploadCloud, RefreshCw, CheckCircle2, Clock, AlertCircle, FileWarning, Tag } from 'lucide-react';
import DocumentUploadModal from './DocumentUploadModal';

export default function DocumentManager() {
  const { documents, isLoadingDocs, fetchDocuments, deleteDocument } = useChatStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete '${title}' and all its vector embeddings?`)) {
      setDeletingId(id);
      await deleteDocument(id);
      setDeletingId(null);
    }
  };

  const renderStatusBadge = (doc) => {
    if (doc.status === 'processed') {
      return (
        <span className="console-badge-processed">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (doc.status === 'failed') {
      return (
        <span className="console-badge-failed" title={doc.processingError || 'Processing failed'}>
          <AlertCircle className="w-3 h-3" /> Failed
        </span>
      );
    }
    return (
      <span className="console-badge-pending">
        <Clock className="w-3 h-3 animate-spin" /> Processing
      </span>
    );
  };

  return (
    <div className="console-card">
      <div className="console-card-header">
        <div>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-700 dark:text-sky-400" /> Knowledge Base Documents
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official PDF documents indexed for RAG vector retrieval and chatbot answers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDocuments()}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Refresh documents list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingDocs ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="upload-document-btn"
            onClick={() => setIsModalOpen(true)}
            className="console-btn-primary"
          >
            <UploadCloud className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-3">Document Name</th>
              <th className="px-6 py-3">Department / Category</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Vector Chunks</th>
              <th className="px-6 py-3">File Size</th>
              <th className="px-6 py-3">Upload Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  <FileWarning className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No college documents ingested yet.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Upload official PDF notices, guidelines, or FAQs to train EduQuery AI.</p>
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{doc.title}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">{doc.filename}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      <Tag className="w-3 h-3" />
                      {doc.departmentId?.name || 'General College'}
                    </span>
                    {doc.collectionId?.name && (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {doc.collectionId.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {renderStatusBadge(doc)}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300 text-xs">
                    {doc.activeVersionId?.chunkCount ?? doc.chunkCount ?? 0} chunks
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    {((doc.fileSize || 0) / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : '—'}{' '}
                    {doc.uploadDate ? new Date(doc.uploadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(doc._id, doc.title)}
                      disabled={deletingId === doc._id}
                      className="console-btn-danger ml-auto"
                      title="Delete document & vectors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === doc._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DocumentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
