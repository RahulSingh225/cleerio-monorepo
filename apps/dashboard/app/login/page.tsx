'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';
import { Zap, Command, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [isPlatform, setIsPlatform] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ 
        email, 
        password, 
        tenantId: isPlatform ? undefined : tenantId 
      });
      router.push('/insights');
    } catch (err) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] space-y-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] transform -rotate-6 border border-white/10">
             <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">Cleerio.ai</h1>
            <p className="text-[10px] text-zinc-500 font-bold tracking-[0.4em] uppercase mt-1">Intelligence Orchestration</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
          
          <div className="flex items-center justify-between mb-8 p-1 bg-black/40 rounded-2xl border border-white/5">
            <button 
              onClick={() => setIsPlatform(false)}
              className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${!isPlatform ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Tenant
            </button>
            <button 
              onClick={() => setIsPlatform(true)}
              className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${isPlatform ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Platform
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {!isPlatform && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Tenant ID / Code</label>
                <input 
                  type="text" 
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="REFINE"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-medium"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Identity</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-medium"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Security Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-700 font-medium"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-black py-5 rounded-[20px] hover:bg-blue-500 transition-all shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)] active:scale-[0.98] flex items-center justify-center gap-3 group mt-4 overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-3">
                Unlock Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.3em]">
             Quantum Encrypted Session
          </p>
          <div className="flex gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse [animation-delay:200ms]" />
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse [animation-delay:400ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
