import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { ThumbsDown, X, Send } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, messageIndex }) {
  const { submitFeedback } = useChatStore();
  const [reason, setReason] = useState('Incorrect answer');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitFeedback(messageIndex, 'thumbs_down', reason, comment);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Provide Response Feedback</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Thank you! Your feedback has been recorded to improve RAG accuracy.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                What went wrong with this answer?
              </label>
              <div className="space-y-2">
                {[
                  'Incorrect answer',
                  'Not relevant',
                  'Missing information',
                  'Source problem',
                  'Other',
                ].map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-2 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                      reason === item
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-semibold'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback-reason"
                      checked={reason === item}
                      onChange={() => setReason(item)}
                      className="text-rose-600 focus:ring-rose-500 dark:accent-rose-500"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                rows="3"
                className="console-input text-xs"
                placeholder="Detail what expected information was missing..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={onClose} className="console-btn-secondary py-1.5 text-xs">
                Cancel
              </button>
              <button type="submit" className="console-btn-danger py-1.5 text-xs">
                <Send className="w-3.5 h-3.5" /> Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
