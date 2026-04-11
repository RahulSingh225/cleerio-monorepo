'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Cpu,
  Radio,
  FileText,
  ClipboardList,
  Target,
  Route,
  MessageSquare,
  CreditCard,
  Sparkles,
  Briefcase,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isPlatformAdmin = user?.role === 'platform_admin' || user?.isPlatformUser;

  const navGroups = [
    {
      label: isPlatformAdmin ? 'Platform' : 'Operations',
      items: isPlatformAdmin
        ? [
            { name: 'Tenants', href: '/admin/tenants', icon: ShieldCheck },
            { name: 'System Jobs', href: '/admin/jobs', icon: Cpu },
            { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
          ]
        : [
            { name: 'Dashboard', href: '/insights', icon: LayoutDashboard },
            { name: 'Portfolio Records', href: '/cases', icon: Briefcase },
            { name: 'Upload Portfolio', href: '/cases/upload', icon: Upload },
          ],
    },
    ...(!isPlatformAdmin
      ? [
          {
            label: 'Strategy',
            items: [
              { name: 'Segments', href: '/segments', icon: Target },
              { name: 'Journeys', href: '/journeys', icon: Route },
              { name: 'Templates', href: '/settings/templates', icon: FileText },
            ],
          },
          {
            label: 'Communications',
            items: [
              { name: 'Comm Events', href: '/communications', icon: Radio },
              { name: 'Delivery Logs', href: '/delivery-logs', icon: MessageSquare },
              { name: 'Interactions', href: '/interactions', icon: Bot },
            ],
          },
          {
            label: 'Analytics',
            items: [
              { name: 'Reports', href: '/reports', icon: BarChart3 },
              { name: 'Repayments', href: '/repayments', icon: CreditCard },
              { name: 'AI Insights', href: '/ai-insights', icon: Sparkles },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col h-full w-60 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
      {/* Brand */}
      <div className="flex h-16 items-center px-5 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">Cleerio.ai</span>
            <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
              {isPlatformAdmin ? 'Platform Admin' : 'Collections Hub'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 pt-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-3">
              {group.label}
            </span>
            <div className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150
                      ${isActive
                        ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]'
                        : 'text-[var(--sidebar-text)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                      }
                    `}
                  >
                    <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${
                      isActive ? 'text-[var(--sidebar-text-active)]' : 'text-[var(--text-tertiary)]'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Settings link */}
      <div className="px-3 pb-3 pt-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${
            pathname === '/settings'
              ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]'
              : 'text-[var(--sidebar-text)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Settings className="h-[18px] w-[18px] text-[var(--text-tertiary)]" />
          Settings
        </Link>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[11px] text-[var(--text-tertiary)] capitalize truncate">
              {user?.role?.replace('_', ' ') || 'User'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
