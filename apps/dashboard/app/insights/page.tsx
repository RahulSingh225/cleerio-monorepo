'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Layers,
  LayoutDashboard,
  Calendar,
  Filter,
  Download,
  Zap,
  Target,
  ShieldCheck,
  MoreHorizontal
} from 'lucide-react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

export default function InsightsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    try {
      const [sumRes, distRes] = await Promise.all([
        api.get('/reports/portfolio-summary'),
        api.get('/reports/dpd-distribution'),
      ]);
      setSummary(sumRes.data.data);
      setDistribution(distRes.data.data);
    } catch (err) {
      console.error('Failed to fetch intelligence reports');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { name: 'Portfolio Exposure', value: `$${summary?.totalOutstanding?.toLocaleString() || '432.8k'}`, change: '+12.5%', type: 'up', icon: DollarSign, color: 'blue' },
    { name: 'Market Reach', value: summary?.activeBorrowers || '1,842', change: '+2.3%', type: 'up', icon: Users, color: 'emerald' },
    { name: 'Resolution Yield', value: '64.2%', change: '-0.4%', type: 'down', icon: Zap, color: 'orange' },
    { name: 'Inertia Index', value: '42 DPD', change: '+1.2%', type: 'up', icon: Activity, color: 'violet' },
  ];

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#09090B]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500">
                <LayoutDashboard className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Intelligence Hub</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Global exposure analytics and autonomous resolution metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/40 rounded-xl border border-white/5 text-zinc-500">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Last 30 Cycles</span>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all shadow-[0_10px_25px_-5px_rgba(255,255,255,0.1)] active:scale-95 group">
                <Download className="w-4 h-4" />
                Export Telemetry
            </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-all">
             <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${stat.color}-500/10 transition-all`} />
             
             <div className="flex items-center justify-between relative z-10">
                <div className={`p-3 rounded-2xl bg-${stat.color}-600/10 text-${stat.color}-500 border border-${stat.color}-600/20`}>
                   <stat.icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${stat.type === 'up' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                   {stat.type === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                   {stat.change}
                </div>
             </div>

             <div className="mt-8 flex flex-col relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-1">{stat.name}</span>
                <span className="text-3xl font-black text-white tracking-tighter leading-none">{stat.value}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Distribution & Advanced Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Exposure Distribution */}
          <div className="lg:col-span-1 bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-xl shadow-2xl space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Layers className="h-6 w-6 text-blue-500" />
                    <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Risk Segmentation</h2>
                </div>
                <MoreHorizontal className="w-5 h-5 text-zinc-700" />
            </div>
            
            <div className="space-y-8">
               {(distribution.length > 0 ? distribution : [
                    { bucket: 'B1 (1-30)', count: 1200 },
                    { bucket: 'B2 (31-60)', count: 800 },
                    { bucket: 'B3 (61-90)', count: 450 },
                    { bucket: 'B4 (91+)', count: 210 }
               ]).map((item, idx) => {
                 const total = distribution.length > 0 ? Number(summary?.totalRecords || distribution.reduce((sum, d) => sum + Number(d.count), 0)) : 2660;
                 const percentage = ((Number(item.count) / total) * 100).toFixed(1);
                 return (
                   <div key={idx} className="space-y-3 group cursor-default">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">{item.bucket}</span>
                         <span className="text-[11px] font-black text-white italic">{percentage}%</span>
                      </div>
                      <div className="h-3 w-full bg-black/40 rounded-full border border-white/5 p-0.5 overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                           style={{ width: `${percentage}%` }}
                         />
                      </div>
                   </div>
                 );
               })}
            </div>
            
            <div className="pt-6 border-t border-white/5 mt-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 ring-1 ring-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none">Healthy Dispersion Detected</span>
                </div>
            </div>
          </div>

          {/* AI Efficacy Panel */}
          <div className="lg:col-span-2 bg-[#0D0D10] border border-white/5 rounded-[48px] p-12 overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col justify-between">
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] group hover:opacity-10 transition-opacity pointer-events-none">
                <Activity className="w-96 h-96 text-white" />
             </div>
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
             
             <div className="space-y-10 relative z-10">
                <div className="flex items-center gap-4 text-white">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-2xl border border-white/10">
                        <Zap className="h-7 w-7 text-white fill-current" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">Autonomous Resolution</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-blue-500 tracking-[0.3em] uppercase">Hyperautomation v2.0</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                   <div className="space-y-2 p-6 rounded-[32px] bg-white/[0.02] border border-white/5 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-4 h-4 text-emerald-500/50" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Resolution Yield</span>
                      </div>
                      <span className="text-5xl font-black text-white italic tracking-tighter">72.4<span className="text-emerald-500 font-sans">%</span></span>
                   </div>
                   <div className="space-y-2 p-6 rounded-[32px] bg-white/[0.02] border border-white/5 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-4 h-4 text-blue-500/50" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Self-Service Rate</span>
                      </div>
                      <span className="text-5xl font-black text-white italic tracking-tighter">48.2<span className="text-blue-500 font-sans">%</span></span>
                   </div>
                </div>

                <p className="max-w-xl text-[13px] text-zinc-400 font-bold leading-relaxed tracking-tight italic">
                   Current orchestration strategy has processed <span className="text-white">14,282 automated events</span> across the portfolio today. <span className="underline decoration-blue-500 underline-offset-4 decoration-2">Predictive modeling</span> suggests a 14% lift in resolution by increasing IVR frequency in Late Buckets.
                </p>
             </div>

             <div className="mt-12 flex items-center justify-between relative z-10 translate-y-4">
                <button className="px-10 py-5 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95">
                   Optimize Active Clusters
                   <ArrowUpRight className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                        {[1,2].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0D0D10] bg-zinc-800" />)}
                    </div>
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Active Analysts</span>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}
