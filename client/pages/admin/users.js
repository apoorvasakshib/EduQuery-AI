import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Users, Shield, CheckCircle2 } from 'lucide-react';

export default function AdminUsers() {
  const [usersList, setUsersList] = useState([
    { id: '1', name: 'Dr. Robert Vance', email: 'superadmin@college.edu', role: 'super_admin', status: 'active' },
    { id: '2', name: 'Prof. Alan Turing', email: 'cseadmin@college.edu', role: 'dept_admin', status: 'active' },
    { id: '3', name: 'Sarah Jenkins', email: 'student@college.edu', role: 'student', status: 'active' },
  ]);

  return (
    <>
      <Head>
        <title>User & Role Access | EduQuery AI</title>
      </Head>

      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" /> Role-Based Access Control (RBAC)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage user roles: Super Admin, Department Admin, and Student permissions
            </p>
          </div>

          <div className="console-card overflow-hidden">
            <div className="console-card-header">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">System Users & Roles</h3>
              <span className="text-xs font-mono text-slate-400">{usersList.length} Registered Users</span>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3">User Name</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Assigned Role</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            u.role === 'super_admin'
                              ? 'console-badge-superadmin'
                              : u.role === 'dept_admin'
                              ? 'console-badge-admin'
                              : 'console-badge-student'
                          }
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="console-badge-processed">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </td>
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
