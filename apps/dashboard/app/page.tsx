'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { 
  Zap, 
  Shield, 
  Activity, 
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
  Database
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const handleEnter = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role === 'platform_admin') {
      router.push('/admin/tenants');
    } else {
      router.push('/insights');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white selection:bg-blue-500/30 overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-10 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 shadow-xl shadow-blue-600/20">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter">Cleerio</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {['Infrastructure', 'Efficacy', 'Security', 'Telemetry'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>

        <button 
          onClick={handleEnter}
          className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
        >
          {isAuthenticated ? 'Enter Portal' : 'Access System'}
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-10 pt-32 pb-40 text-center md:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Debt Resolution</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9]">
                    Orchestrate <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Resolution</span> <br />
                    at Scale.
                </h1>

                <p className="max-w-lg text-lg text-zinc-400 font-bold tracking-tight leading-relaxed">
                    Cleerio is the hyper-autonomous debt recovery infrastructure designed for modern NBFCs. Map portfolios, design AI strategies, and automate resolution across global channels.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                    <button 
                        onClick={handleEnter}
                        className="group flex items-center gap-6 px-10 py-6 bg-white text-black rounded-3xl hover:bg-zinc-200 transition-all shadow-[0_30px_70px_-10px_rgba(255,255,255,0.2)] active:scale-[0.98]"
                    >
                        <span className="text-sm font-black uppercase tracking-[0.2em]">Launch Infrastructure</span>
                        <div className="p-2 rounded-xl bg-black text-white group-hover:translate-x-2 transition-transform">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </button>
                    
                    <button className="flex items-center gap-3 px-8 py-5 text-zinc-500 hover:text-white transition-colors">
                        <Activity className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">View System Health</span>
                    </button>
                </div>
            </div>

            <div className="relative group hidden lg:block">
               <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-all duration-700" />
               <div className="bg-[#0D0D10] border border-white/5 rounded-[48px] p-2 overflow-hidden shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-all duration-1000">
                  <div className="bg-[#18181B] rounded-[40px] p-10 space-y-8 h-full min-h-[500px] flex flex-col justify-between">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-600 shadow-xl flex items-center justify-center">
                              <Layers className="w-6 h-6 text-white" />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-white uppercase italic">Strategy Builder</span>
                              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">v4.2 Internal</span>
                           </div>
                        </div>
                        <div className="flex gap-1.5">
                           {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-zinc-800" />)}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Resolution Telemetry</span>
                              <span className="text-[10px] font-black text-emerald-500">72.4%</span>
                           </div>
                           <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 w-[72%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                              <Globe className="w-4 h-4 text-violet-500" />
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-black text-zinc-700 uppercase">Latency</span>
                                 <span className="text-lg font-black text-white italic">24ms</span>
                              </div>
                           </div>
                           <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                              <Database className="w-4 h-4 text-blue-500" />
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-black text-zinc-700 uppercase">Records</span>
                                 <span className="text-lg font-black text-white italic">432k</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Shield className="w-4 h-4 text-emerald-500" />
                           <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Encrypted Tunnel Active</span>
                        </div>
                        <div className="w-20 h-8 rounded-lg bg-zinc-900 border border-white/5 animate-pulse" />
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </main>

      {/* Decorative Gradient Line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Footer Stats? */}
      <footer className="max-w-7xl mx-auto px-10 py-20">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left opacity-40 hover:opacity-100 transition-opacity duration-700">
            {[
               { label: 'Total Volume', value: '$420M+' },
               { label: 'Active NBFCs', value: '18' },
               { label: 'AI Resolution', value: '64%' },
               { label: 'System Uptime', value: '99.9%' }
            ].map((stat, i) => (
               <div key={i} className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</p>
               </div>
            ))}
         </div>
      </footer>
    </div>
  );
}
