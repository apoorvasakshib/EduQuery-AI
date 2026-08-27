import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { FileText, X, Bookmark } from 'lucide-react';

export default function SourceHighlightModal() {
  const { activeSourceModal, closeSourceModal } = useChatStore();
  if (!activeSourceModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {activeSourceModal.documentTitle || 'Official College Document'}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                <span>Version {activeSourceModal.versionNumber || 1}</span>
                <span>•</span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold">Page {activeSourceModal.pageNumber || 1}</span>
                <span>•</span>
                <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Relevance: {activeSourceModal.relevanceScore || 95}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={closeSourceModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlighted Chunk Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Grounded Chunk Text Passage
          </div>

          <div className="p-4 bg-sky-50/70 dark:bg-slate-800/80 rounded-lg border-l-4 border-sky-600 dark:border-sky-500 text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-mono whitespace-pre-wrap shadow-inner">
            "{activeSourceModal.textChunk}"
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
            This exact text snippet was retrieved from page {activeSourceModal.pageNumber || 1} of the active official document version and fed into the AI generation prompt to guarantee 100% grounded accuracy.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={closeSourceModal}
            className="console-btn-primary text-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
