import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/useAuthStore';
import Head from 'next/head';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/chat');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  return (
    <>
      <Head>
        <title>EduQuery AI – College RAG Knowledge Base</title>
        <meta name="description" content="AI-powered college information assistant using Retrieval-Augmented Generation." />
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="w-16 h-16 rounded-2xl bg-sky-700 dark:bg-sky-600 text-white mx-auto flex items-center justify-center shadow-md">
          <GraduationCap className="w-10 h-10" />
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider">
            Operator-Console RAG Engine
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight sm:text-5xl">
            EduQuery AI Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Instant, strict-grounded answers to official college guidelines, FAQs, and notices powered by Retrieval-Augmented Generation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          <div className="console-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Administrator Portal</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload PDF notices and guidelines, track text extraction and vector chunking status, and manage the knowledge base.
            </p>
            <Link href="/login" className="inline-flex items-center text-sm font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 gap-1 pt-2">
              Admin Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="console-card p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Student Chat Console</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ask questions with real-time AI responses, source document citations, and zero external hallucination.
            </p>
            <Link href="/login" className="inline-flex items-center text-sm font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 gap-1 pt-2">
              Student Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-wrap justify-center gap-6 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Vector Similarity Search</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Hallucination Prevention</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Source Citation Badges</span>
        </div>
      </div>
    </>
  );
}
