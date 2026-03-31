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
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InsightsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [distribution, setDistribution] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const [sumRes, distRes] = await Promise.all([
          axios.get('http://localhost:3000/reports/portfolio-summary', { headers }),
          axios.get('http://localhost:3000/reports/dpd-distribution', { headers }),
        ]);
        setSummary(sumRes.data.data);
        setDistribution(distRes.data.data);
      } catch (err) {
        console.error('Failed to fetch intelligence reports');
      }
    };
    fetchReports();
  }, []);

  const stats = [
    { name: 'Total Outstanding', value: `$${summary?.totalOutstanding || '0'}`, change: '+12.5%', type: 'up', icon: DollarSign },
    { name: 'Active Borrowers', value: summary?.activeBorrowers || '0', change: '+2.3%', type: 'up', icon: Users },
    { name: 'Recovery Rate', value: '64.2%', change: '-0.4%', type: 'down', icon: TrendingUp },
    { name: 'Avg. DPD', value: '42 Days', change: '+1.2%', type: 'up', icon: Activity },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] p-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
           <h1 className="text-2xl font-black tracking-tight text-[#111827]">Portfolio Intelligence</h1>
           <p className="text-sm text-zinc-500 font-medium tracking-tight mt-1">Real-time recovery performance and exposure insights.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#111827] text-white rounded-xl text-xs font-bold shadow-xl shadow-zinc-950/10 hover:bg-zinc-800 transition-all">
           Export Report PDF
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
             <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-zinc-50 text-zinc-600 border border-zinc-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <stat.icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black",
                  stat.type === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                )}>
                   {stat.type === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                   {stat.change}
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{stat.name}</span>
                <span className="text-2xl font-black text-[#111827] tracking-tighter mt-1">{stat.value}</span>
             </div>
          </div>
        ))}
      </div>

      {/* DPD Distribution & Detailed List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-1 bg-white border border-[#E4E4E7] rounded-[32px] p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
               <Layers className="h-5 w-5 text-blue-600" />
               <h2 className="text-sm font-black uppercase tracking-widest text-[#111827]">Risk Exposure</h2>
            </div>
            
            <div className="space-y-4">
               {distribution.map((item, idx) => {
                 const percentage = ((Number(item.count) / Number(summary?.totalRecords || 1)) * 100).toFixed(1);
                 return (
                   <div key={idx} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                         <span className="font-bold text-zinc-600">{item.bucket || 'UNASSIGNED'}</span>
                         <span className="font-black text-zinc-900">{percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                           style={{ width: `${percentage}%` }}
                         />
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>

         <div className="lg:col-span-2 bg-[#111827] rounded-[32px] p-10 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Activity className="w-64 h-64 text-white" />
            </div>
            <div className="flex flex-col gap-6 relative z-10">
                <h2 className="text-lg font-black text-white italic">AI Strategy Effectiveness</h2>
                <div className="grid grid-cols-2 gap-10">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Negotitation Yield</span>
                      <span className="text-4xl font-black text-emerald-400 tracking-tighter transition-all hover:scale-110">72.4%</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Self-Service Rate</span>
                      <span className="text-4xl font-black text-blue-400 tracking-tighter transition-all hover:scale-110">48.2%</span>
                   </div>
                </div>
                <p className="max-w-md text-sm text-zinc-400 font-medium leading-relaxed mt-4">
                   Your current orchestration strategy has recovered <span className="text-white font-bold">$124k</span> across 432 accounts in the last 24 hours. Consider increasing persuasion on Bucket 3.
                </p>
                <button className="mt-4 px-6 py-3 rounded-2xl bg-white text-[#111827] text-xs font-black shadow-xl hover:bg-zinc-100 transition-all w-fit">
                   Optimize Strategy
                </button>
            </div>
         </div>
      </div>
    </div>
  );
}
