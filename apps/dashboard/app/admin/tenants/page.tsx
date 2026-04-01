'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data.data);
    } catch (err) {
      console.error('Failed to fetch tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tenants', newTenant);
      setShowModal(false);
      setNewTenant({ name: '', code: '' });
      fetchTenants();
    } catch (err) {
      alert('Failed to create tenant. Ensure the code is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Active</span>;
      case 'onboarding':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider border border-blue-500/20"><Clock className="w-3 h-3" /> Onboarding</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-500 text-[10px] font-black uppercase tracking-wider border border-zinc-500/20"><AlertCircle className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#09090B]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500">
                <Building2 className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Tenant Ecosystem</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Provision and manage isolated client environments</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)] active:scale-95 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          Propose New Tenant
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Filter by name or code..." 
                    className="w-full bg-black/40 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-zinc-500 hover:text-white transition-colors border border-white/5 rounded-xl bg-white/[0.01]">
                <Filter className="w-4 h-4" />
                Advanced Filters
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] w-1/3">Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Slug</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Created</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8 h-16 bg-white/[0.01]" />
                  </tr>
                ))
              ) : tenants.map((tenant) => (
                <tr key={tenant.id} className="group hover:bg-white/[0.02] transition-all cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center font-black text-zinc-400 group-hover:text-blue-500 group-hover:border-blue-500/20 transition-all">
                            {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{tenant.name}</span>
                            <span className="text-[10px] text-zinc-600 font-medium tracking-wide">ID: {tenant.id.substring(0, 8)}...</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-zinc-500 uppercase tracking-widest">{tenant.code}</code>
                  </td>
                  <td className="px-8 py-6">
                    {getStatusBadge(tenant.status)}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-bold text-zinc-500">{new Date(tenant.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button className="p-2 hover:text-blue-500 transition-colors" title="View Records"><ExternalLink className="w-4 h-4" /></button>
                        <button className="p-2 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                        <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-zinc-600" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!isLoading && tenants.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-6 rounded-full bg-white/[0.02] border border-white/5 text-zinc-800">
                    <Building2 className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-white font-bold tracking-tight">No Tenants Initialized</h3>
                    <p className="text-zinc-600 text-sm max-w-xs">Kickstart your ecosystem by provisioning your first isolation unit.</p>
                </div>
            </div>
        )}

        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Global Infrastructure Oversight</span>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Systems Operational</span>
            </div>
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animation-in fade-in duration-300">
           <div className="w-full max-w-lg bg-[#18181B] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transform transition-all scale-in duration-300">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-blue-600 border border-white/10 shadow-lg shadow-blue-600/30">
                        <Plus className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight">New Isolation Unit</h2>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Organization Name</label>
                    <input 
                        type="text" 
                        required
                        value={newTenant.name}
                        onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                        placeholder="e.g. Refine Portfolio Services"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium placeholder:text-zinc-700"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Unique Slug / Code</label>
                    <input 
                        type="text" 
                        required
                        value={newTenant.code}
                        onChange={(e) => setNewTenant({...newTenant, code: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                        placeholder="e.g. REFINE"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium placeholder:text-zinc-700 uppercase"
                    />
                    <p className="text-[9px] text-zinc-600 font-bold px-1 tracking-tight">Used as identification in URLs and API calls. Must be unique.</p>
                 </div>

                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-500 transition-all shadow-[0_15px_40px_-5px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
                 >
                    {isSubmitting ? 'Provisioning...' : 'Initialize Infrastructure'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
