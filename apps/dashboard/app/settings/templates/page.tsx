'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText,
  Variable,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Zap,
  Code
} from 'lucide-react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ 
    name: '', 
    channel: 'sms', 
    body: '', 
    variables: [] as string[],
    mediaUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/comm-templates');
      setTemplates(response.data.data);
    } catch (err) {
      console.error('Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Extract variables using regex {{variable}}
    const variables = Array.from(newTemplate.body.matchAll(/{{(.*?)}}/g)).map(match => match[1].trim());
    
    try {
      await api.post('/comm-templates', { ...newTemplate, variables });
      setShowModal(false);
      setNewTemplate({ name: '', channel: 'sms', body: '', variables: [], mediaUrl: '' });
      fetchTemplates();
    } catch (err) {
      alert('Failed to save template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'ivr': return <PhoneCall className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const commonVariables = ['borrower_name', 'amount_due', 'due_date', 'payment_link', 'loan_id', 'dpd_days'];

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#09090B]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-orange-600/10 border border-orange-600/20 text-orange-500">
                <FileText className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Message Architect</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Design and standardize communication templates with dynamic injection</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2.5 px-6 py-3 bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-orange-500 transition-all shadow-[0_10px_25px_-5px_rgba(234,88,12,0.5)] active:scale-95 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          Draft Template
        </button>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 rounded-[40px] bg-white/[0.02] border border-white/5 animate-pulse" />
          ))
        ) : templates.map((template) => (
          <div key={template.id} className="group bg-zinc-900/40 border border-white/5 rounded-[40px] p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all hover:border-orange-500/30">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none mb-2">{template.channel} Gateway</span>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight truncate max-w-[180px]">{template.name}</h3>
                </div>
                <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-tighter border border-emerald-500/20 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Ready</span>
                </div>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 ring-1 ring-white/5 mb-8 min-h-[120px] relative z-10">
                <p className="text-zinc-400 text-[11px] font-medium leading-relaxed italic line-clamp-4">
                  {template.body.split(/({{.*?}})/g).map((part: string, i: number) => 
                    part.match(/{{.*?}}/) 
                        ? <span key={i} className="px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 font-black tracking-tighter uppercase text-[9px] mx-0.5 border border-orange-500/10">{part}</span> 
                        : part
                  )}
                </p>
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <Variable className="w-4 h-4 text-zinc-700" />
                    <div className="flex -space-x-1">
                        {(template.variables || []).slice(0, 3).map((v: string, i: number) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-950 flex items-center justify-center text-[8px] font-black text-zinc-500 uppercase" title={v}>
                                {v.charAt(0)}
                            </div>
                        ))}
                    </div>
                </div>
                <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-400 transition-colors">Edit Source</button>
            </div>
          </div>
        ))}

        {!isLoading && templates.length === 0 && (
           <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[48px]">
              <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/5 text-zinc-800">
                <FileText className="w-16 h-16" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Zero Drafts Identified</h3>
                <p className="text-zinc-600 text-sm max-w-xs font-medium">Standardize your outgoing narrative across all delivery channels.</p>
              </div>
           </div>
        )}
      </div>

      {/* Draft Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 shadow-2xl">
           <div className="w-full max-w-2xl bg-[#0D0D10] border border-white/10 rounded-[48px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-5 text-white">
                    <div className="p-3.5 rounded-2xl bg-orange-600 shadow-[0_15px_40px_-5px_rgba(234,88,12,0.4)]">
                        <FileText className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">Draft Narrative</h2>
                        <span className="text-[10px] font-black text-orange-500 tracking-[0.3em] uppercase">Communication Schema v2.1</span>
                    </div>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-2 text-zinc-600 hover:text-white transition-colors cursor-pointer"><X className="w-7 h-7" /></button>
              </div>
              
              <form onSubmit={handleCreate} className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Template Identifier</label>
                        <input 
                            type="text" 
                            required
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                            placeholder="e.g. WELCOME_SMS_HDFC"
                            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-bold placeholder:text-zinc-800 uppercase"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Infrastructure Gateway</label>
                        <select 
                            value={newTemplate.channel}
                            onChange={(e) => setNewTemplate({...newTemplate, channel: e.target.value})}
                            className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-bold uppercase"
                        >
                            <option value="sms">SMS Gateway (MSG91)</option>
                            <option value="whatsapp">WhatsApp Business</option>
                            <option value="ivr">IVR Voice Engine</option>
                        </select>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Narrative Body</label>
                        <div className="flex gap-2">
                            {['borrower_name', 'amount_due'].map(v => (
                                <button 
                                    key={v}
                                    type="button"
                                    onClick={() => setNewTemplate({...newTemplate, body: newTemplate.body + `{{${v}}}`})}
                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black text-zinc-400 border border-white/5 transition-all"
                                >
                                    +{v}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <textarea 
                            required
                            rows={5}
                            value={newTemplate.body}
                            onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                            placeholder="Type your message narrative here... Use {{variable_name}} for dynamic data."
                            className="w-full bg-black/50 border border-white/5 rounded-[24px] px-6 py-5 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-medium leading-relaxed resize-none italic placeholder:text-zinc-800"
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-2 py-1 rounded-md bg-black/60 border border-white/5">
                            <Code className="w-3 h-3 text-orange-500/40" />
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{newTemplate.body.length} Chars</span>
                        </div>
                    </div>
                 </div>

                 <div className="p-6 rounded-[24px] bg-orange-600/5 border border-orange-600/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">MSG91 Specific Meta</span>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1 italic">MSG91 Template ID (if pre-configured)</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-xs text-white focus:outline-none font-black tracking-widest"
                            placeholder="TPL_658291..."
                        />
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-orange-600 text-white font-black py-6 rounded-[24px] hover:bg-orange-500 transition-all shadow-[0_20px_50px_-10px_rgba(234,88,12,0.5)] disabled:opacity-50 flex items-center justify-center gap-4 active:scale-[0.98] mt-4 overflow-hidden relative group"
                 >
                    <span className="relative z-10 flex items-center gap-3">
                        <Save className="w-5 h-5" />
                        Commit to Infrastructure
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

function Smartphone({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
      <path d="M12 18h.01"/>
    </svg>
  );
}
