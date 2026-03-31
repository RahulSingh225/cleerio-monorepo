'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';
import { Zap, Command, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push('/workflows');
    } catch (err) {
      alert('Login failed. Check your NBFC credentials.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        {/* Figma Brand Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 transform -rotate-6">
             <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Cleerio.ai</h1>
            <p className="text-xs text-zinc-500 font-bold tracking-[0.3em] uppercase mt-1">Intelligence Dashboard</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-[24px] p-8 shadow-2xl shadow-black/50 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Command className="w-20 h-20" />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nbfc.com"
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all placeholder:text-zinc-700"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all placeholder:text-zinc-700"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 group mt-4"
            >
              Access Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
           Secure Infrastructure provided by Cleerio AI
        </p>
      </div>
    </div>
  );
}
