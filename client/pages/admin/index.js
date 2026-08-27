import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthStore } from '../../store/useAuthStore';
import DocumentManager from '../../components/DocumentManager';
import { ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && !['admin', 'super_admin', 'dept_admin'].includes(user.role)))) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        router.push('/chat');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-sm font-mono text-slate-500 animate-pulse">Authenticating Admin Session...</div>
      </div>
    );
  }

  if (!['admin', 'super_admin', 'dept_admin'].includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 console-card text-center space-y-3 border-rose-200 bg-rose-50/30">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="font-bold text-slate-900 text-lg">Access Restricted</h2>
        <p className="text-xs text-slate-600">
          The Admin Portal is restricted to authorized college administrators.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Document Portal | EduQuery AI</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Operations Portal</h1>
            <p className="text-sm text-slate-500">
              Manage official college PDFs, inspect vectorization status, and maintain RAG context quality.
            </p>
          </div>
        </div>

        <DocumentManager />
      </div>
    </>
  );
}
