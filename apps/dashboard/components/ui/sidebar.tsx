'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Workflow, 
  Database, 
  Settings, 
  Users, 
  Layers,
  Activity,
  Zap
} from 'lucide-react';

const navigation = [
  { name: 'Intelligence', href: '/insights', icon: BarChart3 },
  { name: 'Strategy Orchestration', href: '/workflows', icon: Workflow },
  { name: 'Portfolios', href: '/portfolios', icon: Database },
  { name: 'Risk Buckets', href: '/buckets', icon: Layers },
  { name: 'Audit Trail', href: '/audits', icon: Activity },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-64 border-r border-white/5 bg-[#18181B] backdrop-blur-xl">
      {/* Figma Logo Section */}
      <div className="flex h-20 items-center px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
             <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter text-white uppercase">Cleerio.ai</span>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest leading-none">CORE PLATFORM</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                }
              `}
            >
              <item.icon className={`
                 mr-4 h-5 w-5 flex-shrink-0
                 ${isActive ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}
              `} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 ring-1 ring-white/5 ring-inset">
           <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 shadow-inner" />
           <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-bold text-white truncate">NBFC Admin</span>
              <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-tight truncate">Production Env</span>
           </div>
        </div>
      </div>
    </div>
  );
}
