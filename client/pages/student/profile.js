import React from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import { useAuthStore } from '../../store/useAuthStore';
import { User, ShieldCheck, Mail, Calendar, Key } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Student Profile | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-6 h-6 text-sky-600" /> User Profile & Security
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Account session and department permissions</p>
          </div>

          <div className="max-w-2xl console-card p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-14 h-14 rounded-full bg-sky-700 dark:bg-sky-600 text-white font-bold text-xl flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{user.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="console-badge-student">{user.role}</span>
                  <span className="text-xs font-mono text-slate-400">ID: {user.id}</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-1">Email Address</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{user.email}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 uppercase font-semibold block mb-1">Role Authorization</span>
                <span className="font-semibold text-sky-700 dark:text-sky-300">
                  {user.role === 'super_admin' ? 'Super Admin' : user.role === 'dept_admin' ? 'Dept Admin' : 'Student Access'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-sky-50 dark:bg-slate-800/70 rounded-lg border border-sky-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Active RAG Security Restrictions
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                As a student, your query sessions are filtered strictly against public and department-authorized document collections. Document upload, modification, or deletion operations are restricted to administrative accounts.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
