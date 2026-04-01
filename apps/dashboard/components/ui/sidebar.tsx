'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Workflow, 
  Database, 
  Settings, 
  Users, 
  Layers,
  Activity,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  Cpu,
  LogOut
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

  const navigation = [
    // Platform Level
    { 
      name: 'Tenants', 
      href: '/admin/tenants', 
      icon: ShieldCheck, 
      show: isPlatformAdmin 
    },
    { 
      name: 'System Jobs', 
      href: '/admin/jobs', 
      icon: Cpu, 
      show: isPlatformAdmin 
    },
    
    // Tenant Level
    { 
      name: 'Intelligence', 
      href: '/insights', 
      icon: BarChart3, 
      show: true 
    },
    { 
      name: 'Orchestration', 
      href: '/workflows', 
      icon: Workflow, 
      show: !isPlatformAdmin 
    },
    { 
      name: 'Portfolios', 
      href: '/portfolios', 
      icon: Database, 
      show: !isPlatformAdmin 
    },
    { 
      name: 'Risk Buckets', 
      href: '/settings/buckets', 
      icon: Layers, 
      show: !isPlatformAdmin 
    },
    { 
      name: 'Channels', 
      href: '/settings/channels', 
      icon: Zap, 
      show: user?.role === 'tenant_admin' 
    },
    { 
      name: 'Team', 
      href: '/team', 
      icon: Users, 
      show: user?.role === 'tenant_admin' 
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings, 
      show: !isPlatformAdmin 
    },
  ];

  return (
    <div className="flex flex-col h-full w-64 border-r border-white/5 bg-[#09090B] backdrop-blur-3xl shadow-[20px_0_40px_-20px_rgba(0,0,0,0.5)]">
      {/* Brand Header */}
      <div className="flex h-20 items-center px-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[14px] bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-white/10 ring-1 ring-white/5">
             <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter text-white uppercase italic">Cleerio.ai</span>
            <span className="text-[9px] text-blue-500 font-black tracking-[0.2em] leading-none uppercase">
                {isPlatformAdmin ? 'Platform' : 'Tenant'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8 space-y-1.5 custom-scrollbar">
        {navigation.filter(item => item.show).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all duration-300 border border-transparent
                ${isActive 
                  ? 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] border-white/10' 
                  : 'text-zinc-600 hover:text-zinc-200 hover:bg-white/[0.03] hover:border-white/5'
                }
              `}
            >
              <item.icon className={`
                 mr-4 h-4 w-4 flex-shrink-0 transition-all
                 ${isActive ? 'text-white' : 'text-zinc-700 group-hover:text-blue-500 group-hover:scale-110'}
              `} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 bg-gradient-to-t from-white/[0.01] to-transparent">
        <div className="flex items-center gap-3 px-4 py-3 rounded-[20px] bg-zinc-900/40 border border-white/5 relative group">
           <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl border border-white/10 flex items-center justify-center font-black text-[10px] text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
           </div>
           <div className="flex flex-col overflow-hidden flex-1">
              <span className="text-[11px] font-black text-white truncate uppercase tracking-tight">
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter truncate">
                {user?.role || 'User'}
              </span>
           </div>
           <button 
             onClick={handleLogout}
             className="p-2 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
             title="Secure Log Out"
           >
             <LogOut className="h-4 w-4" />
           </button>
        </div>
      </div>
    </div>
  );
}
