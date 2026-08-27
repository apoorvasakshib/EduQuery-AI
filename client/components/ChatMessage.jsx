import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { VoiceReaderButton } from './VoiceInputOutput';
import FeedbackModal from './FeedbackModal';
import { User, Bot, BookOpen, AlertCircle, ThumbsUp, ThumbsDown, ShieldCheck } from 'lucide-react';

export default function ChatMessage({ message, index }) {
  const { openSourceModal, submitFeedback } = useChatStore();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const isUser = message.role === 'user';
  const isHallucinationFallback = message.content.includes("couldn't find");

  const handleThumbsUp = () => {
    submitFeedback(index, 'thumbs_up', null, 'Helpful answer');
  };

  return (
    <>
      <div
        className={`flex gap-3 p-4 rounded-xl border transition-all ${
          isUser
            ? 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 ml-auto max-w-[85%]'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm mr-auto max-w-[92%]'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-xs ${
            isUser ? 'bg-slate-700 dark:bg-slate-600' : 'bg-sky-700 dark:bg-sky-600'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isUser ? 'You (Student)' : 'EduQuery Assistant'}
              </span>
              {!isUser && message.confidenceScore > 0 && (
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    message.confidenceScore >= 85
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                  title="Retrieval Confidence Score"
                >
                  Confidence: {message.confidenceScore}% ({message.confidenceLevel || 'High'})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isUser && <VoiceReaderButton text={message.content} />}
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Grounded Source Attribution Badges (Spec 12) */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-1.5">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Grounded Document Sources:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => openSourceModal(src)}
                    className="bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs transition-all"
                    title="Click to view highlighted document text passage"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    <span>📄 {src.documentTitle}</span>
                    <span className="text-[10px] font-mono opacity-80">P.{src.pageNumber || 1}</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {src.relevanceScore}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hallucination Control Banner */}
          {!isUser && isHallucinationFallback && (
            <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Strict Grounding Active: Information was not found in official college documents.</span>
            </div>
          )}

          {/* Feedback & Navigation Actions */}
          {!isUser && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Was this helpful?</span>
                <button
                  onClick={handleThumbsUp}
                  className={`p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors ${
                    message.feedback?.rating === 'thumbs_up' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className={`p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors ${
                    message.feedback?.rating === 'thumbs_down' ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                  }`}
                  title="Not helpful / incorrect response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Buttons for easy navigation after reading */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.history.length > 1) {
                      window.history.back();
                    } else {
                      window.location.href = '/student/dashboard';
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors shadow-2xs"
                  title="Go back to previous page"
                >
                  <span>← Previous</span>
                </button>

                <button
                  onClick={() => {
                    const inputEl = document.getElementById('chat-query-input');
                    if (inputEl) {
                      inputEl.focus();
                      inputEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 text-[11px] font-semibold border border-sky-200 dark:border-sky-800 flex items-center gap-1 transition-colors shadow-2xs"
                  title="Ask another question"
                >
                  <span>Ask Another Question ↓</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        messageIndex={index}
      />
    </>
  );
}
