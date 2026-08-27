import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/useAuthStore';
import {
  LayoutDashboard,
  MessageSquare,
  History,
  FileText,
  FolderKanban,
  Building2,
  BarChart3,
  HelpCircle,
  Users,
  Settings,
  Shield,
  User,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const { user } = useAuthStore();
  if (!user) return null;

  const isAdmin = user.role === 'super_admin' || user.role === 'dept_admin';

  const studentLinks = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Chat Console', href: '/student/chat', icon: MessageSquare },
    { name: 'Conversations', href: '/student/conversations', icon: History },
    { name: 'My Profile', href: '/student/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Overview Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Documents Manager', href: '/admin/documents', icon: FileText },
    { name: 'Collections', href: '/admin/collections', icon: FolderKanban },
    { name: 'Departments', href: '/admin/departments', icon: Building2 },
    { name: 'Analytics & Insights', href: '/admin/analytics', icon: BarChart3 },
    { name: 'AI FAQs Manager', href: '/admin/faqs', icon: HelpCircle },
    { name: 'User & Role Access', href: '/admin/users', icon: Users },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
  ];

  const links = isAdmin && router.pathname.startsWith('/admin') ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {isAdmin && router.pathname.startsWith('/admin') ? 'ADMIN NAVIGATION' : 'STUDENT PORTAL'}
        </div>

        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border-l-4 border-sky-600 dark:border-sky-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : ''}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {isAdmin && !router.pathname.startsWith('/admin') && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50"
            >
              <Shield className="w-4 h-4" /> Switch to Admin Dashboard
            </Link>
          </div>
        )}

        {!isAdmin && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/student/chat"
              className="flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50"
            >
              <MessageSquare className="w-4 h-4" /> Launch AI Chatbot
            </Link>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300">Grounding Protection</div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          AI responses strictly cite official college PDFs. Zero hallucination guarantee.
        </p>
      </div>
    </aside>
  );
}
