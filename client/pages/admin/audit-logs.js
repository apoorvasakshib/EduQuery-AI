import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import { Shield, Clock } from 'lucide-react';

export default function AdminAuditLogs() {
  const logs = [
    { id: '1', user: 'Dr. Robert Vance (Super Admin)', action: 'DOCUMENT_UPLOAD', resource: 'Academic_Regulations_2026.pdf', ip: '127.0.0.1', timestamp: new Date() },
    { id: '2', user: 'Prof. Alan Turing (CSE Admin)', action: 'VERSION_ACTIVATE', resource: 'Academic_Regulations_2026.pdf (Version 1)', ip: '127.0.0.1', timestamp: new Date() },
    { id: '3', user: 'Prof. Alan Turing (CSE Admin)', action: 'FAQ_PUBLISH', resource: 'FAQ #104 (Attendance Rule)', ip: '127.0.0.1', timestamp: new Date() },
  ];

  return (
    <>
      <Head>
        <title>Audit Logs | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" /> Admin Audit Logs
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete audit history of administrative operations, document changes, and security events
            </p>
          </div>

          <div className="console-card overflow-hidden">
            <div className="console-card-header">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Security Audit Trail</h3>
              <span className="text-xs font-mono text-slate-400">{logs.length} Log Entries</span>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Administrator</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Target Resource</th>
                    <th className="px-6 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-sans font-medium">{log.user}</td>
                      <td className="px-6 py-4 font-bold text-sky-600 dark:text-sky-400">{log.action}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-sans">{log.resource}</td>
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
