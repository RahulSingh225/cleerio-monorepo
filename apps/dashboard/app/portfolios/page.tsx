'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Database,
  Trash2,
  Download,
  BarChart,
  History,
  X,
  FileSpreadsheet,
  ArrowUpCircle
} from 'lucide-react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await api.get('/portfolios');
      setPortfolios(response.data.data);
    } catch (err) {
      console.error('Failed to fetch portfolios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/portfolios/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchPortfolios();
    } catch (err) {
      alert('Failed to upload portfolio. Ensure backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Ingested</span>;
      case 'processing':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider border border-blue-500/20"><Clock className="w-3 h-3 animate-pulse" /> Processing</span>;
      case 'failed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider border border-red-500/20"><AlertCircle className="w-3 h-3" /> Error</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#09090B]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-violet-600/10 border border-violet-600/20 text-violet-500">
                <Database className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Portfolio Repository</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Ingest and analyze debt allocation cohorts for strategy triggering</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-zinc-400 text-xs font-black uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all">
                <Download className="w-4 h-4" />
                Sample Schema
            </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={`group relative rounded-[48px] border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          dragActive 
            ? 'border-violet-500 bg-violet-500/5 shadow-[0_0_80px_-20px_rgba(139,92,246,0.2)]' 
            : 'border-white/5 bg-zinc-900/20 hover:border-white/10 hover:bg-white/[0.02]'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        
        <div className="py-24 px-10 flex flex-col items-center text-center space-y-8 relative z-10">
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center transition-all duration-500 ${
                isUploading ? 'bg-violet-600 animate-bounce' : 'bg-black/40 border border-white/5 group-hover:scale-110 group-hover:bg-violet-600/10 group-hover:border-violet-600/20 group-hover:text-violet-500'
            }`}>
               {isUploading ? <ArrowUpCircle className="w-10 h-10 text-white" /> : <Upload className="w-10 h-10" />}
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                    {isUploading ? 'Transmission in Progress...' : 'Inject Portfolio Data'}
                </h2>
                <p className="text-zinc-600 text-sm font-medium max-w-sm">
                    Drag and drop your debt allocation CSV or click to browse. System will automatically parse and map fields based on registry.
                </p>
            </div>

            <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    CSV Format Only
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <Database className="w-3.5 h-3.5" />
                    Max 50k Records
                </div>
            </div>
        </div>
        
        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* History Table */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-2xl shadow-2xl">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
                <History className="w-5 h-5 text-zinc-600" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Allocation History</h3>
            </div>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-violet-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search by ID or Month..." 
                    className="bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-2 text-xs text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all font-medium w-64"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Deployment</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Source</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Telemetry</th>
                <th className="px-10 py-6 text-right w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-10 h-20 bg-white/[0.01]" />
                  </tr>
                ))
              ) : portfolios.map((p) => (
                <tr key={p.id} className="group hover:bg-white/[0.03] transition-all cursor-pointer">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:border-violet-500/30 group-hover:text-violet-500 transition-all">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase italic tracking-tight">{p.allocationMonth} Deployment</span>
                            <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">ID: {p.id.substring(0, 8)}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[11px] font-black text-zinc-500 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 uppercase tracking-widest">{p.sourceType}</span>
                  </td>
                  <td className="px-10 py-8">
                    {getStatusBadge(p.status)}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Uploaded</span>
                            <span className="text-xs font-bold text-zinc-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.01] border border-white/5 group-hover:bg-violet-600/10 transition-all">
                            <BarChart className="w-4 h-4 text-zinc-700 group-hover:text-violet-500" />
                            <span className="text-[10px] font-black text-zinc-500 group-hover:text-violet-400 uppercase">View Audit</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="p-3 text-zinc-800 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {portfolios.length === 0 && !isLoading && (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 text-zinc-800">
                    <History className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-white font-bold uppercase italic tracking-tighter">No Active Allocations</h4>
                    <p className="text-zinc-600 text-sm font-medium">Inject your first portfolio batch to begin orchestrating collections.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
