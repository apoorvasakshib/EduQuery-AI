import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuthStore } from '../store/useAuthStore';
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (['admin', 'super_admin', 'dept_admin'].includes(user.role)) {
        router.push('/admin/dashboard');
      } else {
        router.push('/chat');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      if (['admin', 'super_admin', 'dept_admin'].includes(res.user.role)) {
        router.push('/admin/dashboard');
      } else {
        router.push('/chat');
      }
    }
  };

  return (
    <>
      <Head>
        <title>Login | EduQuery AI</title>
      </Head>

      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full console-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-sky-700 dark:bg-sky-600 text-white mx-auto flex items-center justify-center shadow-sm">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sign In to EduQuery</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Access college RAG Knowledge Base and Assistant</p>
          </div>

          {(localError || error) && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="console-input"
                placeholder="student@college.edu or admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="console-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="console-btn-primary w-full py-2.5"
              disabled={isLoading}
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-sky-700 dark:text-sky-400 font-semibold hover:underline">
                Register New Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
