import React from 'react';
import { Bot, Sparkles, Database } from 'lucide-react';

export function ChatSkeleton() {
  return (
    <div className="flex gap-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse my-3">
      <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
        <Bot className="w-4 h-4 animate-spin" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" /> Querying Vector Knowledge Base...
          </span>
        </div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function DocumentProcessingSkeleton() {
  return (
    <div className="p-6 bg-sky-50/70 dark:bg-slate-800/60 rounded-lg border border-sky-200 dark:border-sky-800/80 animate-pulse my-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sky-200 dark:bg-sky-900 flex items-center justify-center text-sky-700 dark:text-sky-300">
          <Database className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="h-4 bg-sky-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-sky-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-sky-800 dark:text-sky-300 font-mono">
          <span>Processing PDF & Extracting Chunks (1000-char window)...</span>
          <span>Computing Gemini Embeddings</span>
        </div>
        <div className="w-full bg-sky-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div className="bg-sky-600 dark:bg-sky-500 h-full w-2/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
