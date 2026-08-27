import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthStore } from '../../store/useAuthStore';
import Sidebar from '../../components/Sidebar';
import ChatBox from '../../components/ChatBox';

export default function StudentChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return <div className="p-8 text-center text-slate-500 font-mono animate-pulse">Loading Chat Console...</div>;
  }

  return (
    <>
      <Head>
        <title>AI Chatbot Console | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <ChatBox />
        </main>
      </div>
    </>
  );
}
