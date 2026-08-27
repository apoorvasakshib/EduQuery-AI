import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthStore } from '../store/useAuthStore';
import ChatBox from '../components/ChatBox';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-sm font-mono text-slate-500 animate-pulse">Loading EduQuery Console...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Student Chat Console | EduQuery AI</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <ChatBox />
      </div>
    </>
  );
}
