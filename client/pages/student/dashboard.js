import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import Sidebar from '../../components/Sidebar';
import { MessageSquare, BookOpen, Clock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !user) {
    return <div className="p-8 text-center text-slate-500 font-mono animate-pulse">Loading Student Dashboard...</div>;
  }

  return (
    <>
      <Head>
        <title>Student Dashboard | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome back, {user.name} 👋
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student Access Portal • {user.email}
              </p>
            </div>

            <Link href="/student/chat" className="console-btn-primary">
              <MessageSquare className="w-4 h-4" /> Open Chatbot
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="console-card p-5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Permitted Collections</h3>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">4 Active</p>
              <p className="text-xs text-slate-500">CSE & General College Knowledge Bases</p>
            </div>

            <div className="console-card p-5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">RAG Grounding</h3>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">Strict (100%)</p>
              <p className="text-xs text-slate-500">Official PDFs only, zero hallucination</p>
            </div>

            <div className="console-card p-5 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Language Engine</h3>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">EN / KN / HI</p>
              <p className="text-xs text-slate-500">English, Kannada, Hindi supported</p>
            </div>
          </div>

          <div className="console-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Quick Start Student Enquiries</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <Link href="/student/chat" className="p-3.5 bg-slate-50 dark:bg-slate-800/70 hover:bg-sky-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 rounded-lg flex justify-between items-center transition-colors">
                <span>"What is the minimum attendance required for semester exams?"</span>
                <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 ml-2" />
              </Link>
              <Link href="/student/chat" className="p-3.5 bg-slate-50 dark:bg-slate-800/70 hover:bg-sky-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 rounded-lg flex justify-between items-center transition-colors">
                <span>"What is the penalty for late fee payment?"</span>
                <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 ml-2" />
              </Link>
              <Link href="/student/chat" className="p-3.5 bg-slate-50 dark:bg-slate-800/70 hover:bg-sky-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 rounded-lg flex justify-between items-center transition-colors">
                <span>"How is the internal assessment score calculated?"</span>
                <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 ml-2" />
              </Link>
              <Link href="/student/chat" className="p-3.5 bg-slate-50 dark:bg-slate-800/70 hover:bg-sky-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70 text-slate-800 dark:text-slate-200 rounded-lg flex justify-between items-center transition-colors">
                <span>"Where can I get my hostel leave approval form?"</span>
                <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 ml-2" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
