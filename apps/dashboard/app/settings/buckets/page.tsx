'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Layers, 
  Trash2, 
  CheckCircle2, 
  Settings, 
  Save,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

export default function BucketsPage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBucket, setNewBucket] = useState({ 
    bucketName: '', 
    dpdMin: 0, 
    dpdMax: 30, 
    displayLabel: '',
    priority: 0 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchBuckets = async () => {
    try {
      const response = await api.get('/dpd-bucket-configs');
      setBuckets(response.data.data);
    } catch (err) {
      console.error('Failed to fetch buckets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/dpd-bucket-configs', newBucket);
      setShowModal(false);
      setNewBucket({ bucketName: '', dpdMin: 0, dpdMax: 30, displayLabel: '', priority: 0 });
      fetchBuckets();
    } catch (err) {
      alert('Failed to create bucket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bucket configuration?')) return;
    try {
      await api.delete(`/dpd-bucket-configs/${id}`);
      fetchBuckets();
    } catch (err) {
      alert('Failed to delete bucket.');
    }
  };

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#09090B]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-emerald-600/10 border border-emerald-600/20 text-emerald-500">
                <Layers className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Risk Segmentation</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Define DPD buckets to categorize delinquent accounts</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] active:scale-95 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          Add Segmentation
        </button>
      </div>

      {/* Grid of Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-[32px] bg-white/[0.02] border border-white/5 animate-pulse" />
          ))
        ) : buckets.map((bucket) => (
          <div key={bucket.id} className="group bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all hover:border-emerald-500/30">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-2">Segment PR-{bucket.priority}</span>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{bucket.bucketName}</h3>
                </div>
                <button 
                  onClick={() => handleDelete(bucket.id)}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-zinc-700 hover:text-red-500 hover:bg-red-500/5 transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 ring-1 ring-white/5">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Min DPD</span>
                        <span className="text-lg font-black text-white">{bucket.dpdMin}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-700" />
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Max DPD</span>
                        <span className="text-lg font-black text-white">{bucket.dpdMax || '∞'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/40" />
                    <span className="text-[10px] font-bold text-zinc-400">Status: <span className="text-emerald-400">ACTIVE SEGMENT</span></span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-zinc-700" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{bucket.displayLabel || 'Standard Pool'}</span>
                </div>
                <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">Edit Config</button>
            </div>
          </div>
        ))}

        {!isLoading && buckets.length === 0 && (
           <div className="col-span-full py-40 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.01]">
              <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 text-zinc-800">
                <Layers className="w-16 h-16" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">No Risk Tiers Defined</h3>
                <p className="text-zinc-600 text-sm max-w-xs">Create DPD buckets to enable targeted collection automation strategies.</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all active:scale-95"
              >
                Initialize First Tier
              </button>
           </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 shadow-2xl">
           <div className="w-full max-w-xl bg-[#121214] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,1)]">
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-4 text-white">
                    <div className="p-3 rounded-2xl bg-emerald-600 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)]">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">Define Segment</h2>
                        <p className="text-[10px] font-black text-emerald-500 tracking-[0.2em] uppercase leading-none mt-1">Risk Architecture v1</p>
                    </div>
                 </div>
              </div>
              
              <form onSubmit={handleCreate} className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Segment Machine Name</label>
                        <input 
                            type="text" 
                            required
                            value={newBucket.bucketName}
                            onChange={(e) => setNewBucket({...newBucket, bucketName: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                            placeholder="e.g. EARLY_BUCKET"
                            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold uppercase placeholder:text-zinc-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Display Descriptor</label>
                        <input 
                            type="text" 
                            value={newBucket.displayLabel}
                            onChange={(e) => setNewBucket({...newBucket, displayLabel: e.target.value})}
                            placeholder="e.g. 1-30 Days DPD"
                            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold placeholder:text-zinc-800"
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Min DPD Threshold</label>
                        <input 
                            type="number" 
                            required
                            value={newBucket.dpdMin}
                            onChange={(e) => setNewBucket({...newBucket, dpdMin: parseInt(e.target.value)})}
                            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Max DPD Threshold</label>
                        <input 
                            type="number" 
                            required
                            value={newBucket.dpdMax}
                            onChange={(e) => setNewBucket({...newBucket, dpdMax: parseInt(e.target.value)})}
                            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-bold"
                        />
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 text-white font-black py-6 rounded-[24px] hover:bg-emerald-500 transition-all shadow-[0_20px_50px_-10px_rgba(16,185,129,0.4)] disabled:opacity-50 flex items-center justify-center gap-4 transform active:scale-[0.98] mt-4"
                 >
                    {isSubmitting ? 'Syncing Schema...' : (
                        <>
                            <Save className="w-5 h-5" />
                            Finalize Segment Configuration
                        </>
                    )}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
