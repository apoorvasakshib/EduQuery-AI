import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useChatStore } from '../store/useChatStore';
import ChatMessage from './ChatMessage';
import { ChatSkeleton } from './SkeletonLoader';
import { VoiceInputButton } from './VoiceInputOutput';
import SourceHighlightModal from './SourceHighlightModal';
import {
  Send,
  Trash2,
  Sparkles,
  MessageSquare,
  Globe,
  Download,
  AlertCircle,
  ArrowLeft,
  History,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X
} from 'lucide-react';

export default function ChatBox() {
  const router = useRouter();
  const {
    messages,
    isAsking,
    language,
    setLanguage,
    askQuestion,
    clearChat,
    fetchHistory,
    fetchHistoryList,
    conversationsList,
    loadConversation,
    conversationId,
    error,
  } = useChatStore();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    fetchHistoryList();
  }, [fetchHistory, fetchHistoryList]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAsking) return;
    const query = inputQuery;
    setInputQuery('');
    askQuestion(query);
  };

  const handleSpeechRecorded = (transcript) => {
    setInputQuery(transcript);
  };

  const handleExportTXT = () => {
    if (!conversationId) return;
    window.open(`http://localhost:5000/api/chat/export/${conversationId}?format=txt`, '_blank');
  };

  const handlePreviousNavigation = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/student/dashboard');
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="console-card flex flex-col h-[82vh] relative overflow-hidden">
      {/* Header */}
      <div className="console-card-header flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Previous / Back Button */}
          <button
            onClick={handlePreviousNavigation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
            title="Go back to previous page or dashboard"
            id="btn-previous-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous / Back</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          <MessageSquare className="w-5 h-5 text-sky-700 dark:text-sky-400 hidden sm:block" />
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              <span>Academic Guidance Console</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
              Grounded strictly in verified college documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Previous Questions / History Toggle Button */}
          <button
            onClick={() => {
              fetchHistoryList();
              setShowHistoryDrawer(!showHistoryDrawer);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors shadow-2xs ${
              showHistoryDrawer
                ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="View previous questions and conversation history"
            id="btn-previous-questions"
          >
            <History className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Previous Questions</span>
            {conversationsList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200 font-bold">
                {conversationsList.length}
              </span>
            )}
          </button>

          {/* New Question / Clear */}
          <button
            onClick={() => {
              clearChat();
              focusInput();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs"
            title="Start a new question thread"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Question</span>
          </button>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">English</option>
              <option value="kn" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">ಕನ್ನಡ (Kannada)</option>
              <option value="hi" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">हिन्दी (Hindi)</option>
            </select>
          </div>

          {conversationId && (
            <button
              onClick={handleExportTXT}
              className="console-btn-secondary py-1 text-xs hidden sm:flex items-center gap-1"
              title="Export thread as text file"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={() => clearChat()}
              className="console-btn-secondary py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
              title="Clear current thread"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Welcome to EduQuery AI 2.0</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1">
                Ask questions regarding regulations, exam dates, fee deadlines, or department notices in English, Kannada, or Hindi.
              </p>
            </div>

            {/* Quick Suggested Questions */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Sample Questions
              </span>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {[
                  "What is the minimum attendance required for exam eligibility?",
                  "What is the weightage breakdown for internal marks?",
                  "What is the late fee payment penalty?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => askQuestion(prompt)}
                    className="text-xs bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-800 dark:hover:text-sky-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full transition-colors text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => <ChatMessage key={idx} message={msg} index={idx} />)
        )}

        {isAsking && <ChatSkeleton />}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Slide-over Previous Questions / Conversation History Drawer */}
      {showHistoryDrawer && (
        <div className="absolute inset-y-0 right-0 w-80 max-w-[90%] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Previous Questions</h3>
            </div>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversationsList.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No previous questions recorded yet.</p>
              </div>
            ) : (
              conversationsList.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => {
                    loadConversation(conv);
                    setShowHistoryDrawer(false);
                  }}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    conv._id === conversationId
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-semibold text-xs truncate">{conv.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>{conv.messages?.length || 0} messages</span>
                    <span>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setShowHistoryDrawer(false);
                clearChat();
                focusInput();
              }}
              className="console-btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Start New Question Thread
            </button>
          </div>
        </div>
      )}

      {/* Query Input Footer */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <VoiceInputButton
            onSpeechRecorded={handleSpeechRecorded}
            isListening={isListening}
            setIsListening={setIsListening}
          />
          <input
            ref={inputRef}
            id="chat-query-input"
            type="text"
            className="console-input flex-1 py-2.5 text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:border-sky-400"
            placeholder={isListening ? "Listening to your voice..." : "Ask a question about college guidelines..."}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isAsking}
            autoComplete="off"
          />
          <button
            type="submit"
            className="console-btn-primary px-5"
            disabled={!inputQuery.trim() || isAsking}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>

      <SourceHighlightModal />
    </div>
  );
}
