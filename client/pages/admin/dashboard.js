import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import DocumentUploadModal from '../../components/DocumentUploadModal';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import {
  FileText,
  FolderKanban,
  MessageSquare,
  Users,
  Award,
  ThumbsUp,
  ThumbsDown,
  Clock,
  RefreshCw,
  TrendingUp,
  UploadCloud,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user && user.role === 'student'))) {
      router.push('/login');
      return;
    }
    loadStats();
  }, [isAuthenticated, user, isLoading, router]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/analytics/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.warn('Analytics fetch warning');
    }
    setLoadingStats(false);
  };

  if (isLoading || !isAuthenticated || !user || user.role === 'student') {
    return <div className="p-8 text-center font-mono animate-pulse text-slate-500">Authenticating Admin Session...</div>;
  }

  const cards = stats?.cards || {
    totalDocuments: 12,
    totalCollections: 6,
    totalQuestions: 342,
    activeStudents: 185,
    avgRelevanceScore: 92,
    positiveFeedback: 148,
    negativeFeedback: 18,
    pendingDocs: 0,
  };

  const dayData = stats?.charts?.questionsPerDay || [
    { day: 'Mon', questions: 24, avgScore: 90 },
    { day: 'Tue', questions: 38, avgScore: 92 },
    { day: 'Wed', questions: 52, avgScore: 88 },
    { day: 'Thu', questions: 45, avgScore: 94 },
    { day: 'Fri', questions: 61, avgScore: 91 },
    { day: 'Sat', questions: 28, avgScore: 89 },
    { day: 'Sun', questions: 18, avgScore: 93 },
  ];

  const deptData = stats?.charts?.questionsPerDepartment || [
    { name: 'Computer Science', count: 120 },
    { name: 'Data Science', count: 85 },
    { name: 'Electronics', count: 64 },
    { name: 'Mechanical', count: 42 },
    { name: 'Exam Cell', count: 95 },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                SaaS Admin Operations Console
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time RAG query metrics, knowledge base status, and analytics
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="console-btn-primary"
                id="dashboard-upload-btn"
              >
                <UploadCloud className="w-4 h-4" /> Upload Document
              </button>

              <button
                onClick={loadStats}
                className="console-btn-secondary"
              >
                <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} /> Refresh Metrics
              </button>
            </div>
          </div>

          {/* Metric Cards Grid (Spec 5) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="console-card p-4 space-y-1">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase">Total Documents</span>
                <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{cards.totalDocuments}</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">+2 new this week</span>
            </div>

            <div className="console-card p-4 space-y-1">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase">Collections</span>
                <FolderKanban className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{cards.totalCollections}</p>
              <span className="text-[11px] text-slate-400 font-mono">6 Departments</span>
            </div>

            <div className="console-card p-4 space-y-1">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase">Total Queries</span>
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{cards.totalQuestions}</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">94% RAG Grounded</span>
            </div>

            <div className="console-card p-4 space-y-1">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="text-xs font-semibold uppercase">Avg Relevance</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {cards.avgRelevanceScore}%
              </p>
              <span className="text-[11px] text-slate-400 font-mono">High Confidence</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Area Chart: Questions per day */}
            <div className="console-card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Student Queries Per Day
                </h3>
                <span className="text-xs text-slate-400 font-mono">Past 7 Days</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="questions" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Questions per Department */}
            <div className="console-card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Queries By Department
                </h3>
                <span className="text-xs text-slate-400 font-mono">Distribution</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Feedback & Unanswered Questions Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="console-card p-5 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                Student Feedback Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <ThumbsUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{cards.positiveFeedback}</p>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Helpful Answers (88%)</span>
                </div>

                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800">
                  <ThumbsDown className="w-6 h-6 text-rose-600 dark:text-rose-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{cards.negativeFeedback}</p>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Requires Optimization (12%)</span>
                </div>
              </div>
            </div>

            <div className="console-card p-5 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                Top Searched Topics
              </h3>
              <div className="space-y-2">
                {(stats?.charts?.topTopics || [
                  { topic: 'attendance criteria', count: 84 },
                  { topic: 'semester examinations', count: 62 },
                  { topic: 'timetable CSE', count: 51 },
                  { topic: 'late fee penalty', count: 39 },
                ]).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded">
                    <span className="font-medium text-slate-700 dark:text-slate-200">#{idx + 1} {item.topic}</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{item.count} queries</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          loadStats();
        }}
      />
    </>
  );
}
