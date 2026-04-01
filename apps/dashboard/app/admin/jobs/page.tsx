'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Cpu, 
  Search, 
  Filter, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PlayCircle,
  Terminal,
  ChevronRight,
  Database,
  History,
  FileJson
} from 'lucide-react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Auto refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.data);
    } catch (err) {
      console.error('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'running':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider border border-blue-500/20"><RotateCw className="w-3 h-3 animate-spin" /> Processing</span>;
      case 'failed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider border border-red-500/20"><AlertCircle className="w-3 h-3" /> Failed</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-500 text-[10px] font-black uppercase tracking-wider border border-zinc-500/20"><Clock className="w-3 h-3" /> Queued</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredJobs = jobs.filter(job => filter === 'all' || job.status === filter);

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#09090B]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-500">
                <Cpu className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Job Oversight</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Real-time monitoring of global ingestion and automation pipelines</p>
        </div>
        
        <div className="flex items-center gap-3 bg-zinc-900/40 p-1 rounded-2xl border border-white/5">
            {['all', 'pending', 'running', 'completed', 'failed'].map((s) => (
                <button 
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                    {s}
                </button>
            ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Job Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Telemetry</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-8 py-5 text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && jobs.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8 h-16 bg-white/[0.01]" />
                  </tr>
                ))
              ) : filteredJobs.map((job) => (
                <tr key={job.id} className="group hover:bg-white/[0.02] transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:border-indigo-400/20 transition-all">
                            <Terminal className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-tighter">JOB-{job.id.substring(0, 8)}</span>
                            <span className="text-[9px] text-zinc-600 font-bold tracking-widest leading-none">TID: {job.tenantId?.substring(0, 8) || 'GLOBAL'}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-black text-zinc-400 px-3 py-1 rounded-lg bg-zinc-800/50 border border-white/5 uppercase tracking-widest">{job.jobType}</span>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tight">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                            <RotateCw className="w-3 h-3" />
                            {job.attempts}/{job.maxAttempts}
                        </div>
                        {job.status === 'failed' && (
                            <div className="flex items-center gap-1.5 text-red-500">
                                <AlertCircle className="w-3 h-3" />
                                ERR-LOG
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                            <Clock className="w-3 h-3" />
                            {new Date(job.createdAt).toLocaleTimeString()}
                        </div>
                        {job.completedAt && (
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-700">
                                <History className="w-3 h-3" />
                                Finished {new Date(job.completedAt).toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 text-zinc-800 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && !isLoading && (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-6 rounded-full bg-white/[0.02] border border-white/5 text-zinc-800">
                    <PlayCircle className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-white font-bold tracking-tight">System Idle</h3>
                    <p className="text-zinc-600 text-sm max-w-xs">No active processes matching your filters at this time.</p>
                </div>
            </div>
        )}

        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-zinc-700" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">PostgreSQL Primary</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-zinc-700" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Metadata Cluster</span>
                </div>
            </div>
            <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-tighter italic">Secured by Cleerio.ai Runtime</span>
        </div>
      </div>
    </div>
  );
}
