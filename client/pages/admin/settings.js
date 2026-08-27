import React, { useState } from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [minConfidence, setMinConfidence] = useState(70);
  const [maxChunks, setMaxChunks] = useState(6);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are EduQuery AI. You answer questions using only the official retrieved college documents. Never invent facts. If the retrieved context does not contain the answer, clearly state: 'I couldn't find this information in the available official college documents.'"
  );

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Head>
        <title>Chatbot Settings | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-6 h-6 text-sky-600" /> Chatbot & RAG Engine Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure system prompts, retrieval confidence thresholds, and candidate re-ranking limits
            </p>
          </div>

          <form onSubmit={handleSave} className="max-w-2xl console-card p-6 space-y-5">
            {saved && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-700 text-xs rounded flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> RAG parameters updated successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                System Prompt Grounding Instructions
              </label>
              <textarea
                rows="4"
                className="console-input font-mono text-xs"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Minimum Confidence Threshold ({minConfidence}%)
              </label>
              <input
                type="range"
                min="40"
                max="90"
                value={minConfidence}
                onChange={(e) => setMinConfidence(e.target.value)}
                className="w-full cursor-pointer accent-sky-600"
              />
              <span className="text-[11px] text-slate-400">
                Queries returning confidence below {minConfidence}% will trigger the strict fallback response.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Max Retrieved Candidate Chunks (Top K: {maxChunks})
              </label>
              <input
                type="number"
                min="3"
                max="12"
                value={maxChunks}
                onChange={(e) => setMaxChunks(e.target.value)}
                className="console-input text-xs"
              />
            </div>

            <button type="submit" className="console-btn-primary">
              <Save className="w-4 h-4" /> Save RAG Configuration
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
