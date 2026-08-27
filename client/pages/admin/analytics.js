import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { BarChart3, AlertCircle, Award, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setData(res.data.data);
    } catch (err) {}
  };

  const unanswered = data?.unansweredQuestions || [
    { content: "What is the procedure for hostel fee refund after withdrawal?", confidenceScore: 42, timestamp: new Date() },
    { content: "Are laptop specifications mandated for first year CSE?", confidenceScore: 38, timestamp: new Date() },
  ];

  return (
    <>
      <Head>
        <title>Analytics & Quality Insights | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-sky-600" /> Analytics & Retrieval Quality Report
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect low confidence questions, un-answered queries, and RAG search performance
            </p>
          </div>

          <div className="console-card overflow-hidden">
            <div className="console-card-header">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Low Confidence / Unanswered Questions Log
              </h3>
              <span className="text-xs text-amber-600 font-mono font-semibold">Action Required (Upload missing PDFs)</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {unanswered.map((q, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      "{q.content}"
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      Timestamp: {new Date(q.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <span className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded text-xs font-mono font-bold border border-amber-200 dark:border-amber-800">
                    Score: {q.confidenceScore}% (Low)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
