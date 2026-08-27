import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuthStore } from '../store/useAuthStore';
import { GraduationCap, UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { register: registerStore, isAuthenticated, user, isLoading, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
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

    if (!name || !email || !password) {
      setLocalError('Please complete all required fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const res = await registerStore(name, email, password, role);
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
        <title>Register | EduQuery AI</title>
      </Head>

      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full console-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-sky-700 dark:bg-sky-600 text-white mx-auto flex items-center justify-center shadow-sm">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create EduQuery Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Register as Student or Administrator</p>
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
                Full Name
              </label>
              <input
                type="text"
                required
                className="console-input"
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="console-input"
                placeholder="sarah@college.edu"
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border transition-all flex items-center justify-center gap-1.5 ${
                    role === 'student'
                      ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-500 text-sky-800 dark:text-sky-300 ring-1 ring-sky-500'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 text-xs font-semibold rounded-md border transition-all flex items-center justify-center gap-1.5 ${
                    role === 'admin'
                      ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 text-purple-800 dark:text-purple-300 ring-1 ring-purple-500'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="console-btn-primary w-full py-2.5"
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-sky-700 dark:text-sky-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
