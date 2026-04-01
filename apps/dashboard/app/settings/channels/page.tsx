'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Zap, 
  MessageSquare, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Save,
  ShieldCheck,
  Smartphone,
  Mail,
  PhoneCall,
  Loader2,
  ExternalLink
} from 'lucide-react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
});

export default function ChannelsPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/channel-configs');
      setConfigs(response.data.data);
    } catch (err) {
      console.error('Failed to fetch configs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (config: any) => {
    setIsSaving(config.channel);
    try {
      await api.post('/channel-configs', config);
      fetchConfigs();
    } catch (err) {
      alert('Failed to save configuration.');
    } finally {
      setIsSaving(null);
    }
  };

  const channels = [
    { 
        id: 'sms', 
        name: 'SMS Channel', 
        icon: Smartphone, 
        vendor: 'MSG91', 
        desc: 'Global SMS delivery with transactional priorities',
        color: 'blue'
    },
    { 
        id: 'whatsapp', 
        name: 'WhatsApp Business', 
        icon: MessageSquare, 
        vendor: 'Meta / Infobip', 
        desc: 'Rich media communication and interactive flows',
        color: 'emerald'
    },
    { 
        id: 'ivr', 
        name: 'Interactive Voice', 
        icon: PhoneCall, 
        vendor: 'Twilio / Exotel', 
        desc: 'Automated outgoing calls with text-to-speech',
        color: 'indigo'
    }
  ];

  return (
    <div className="p-10 space-y-10 min-h-screen bg-[#09090B]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500">
                <Zap className="w-6 h-6" />
             </div>
             <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Communication Gateways</h1>
          </div>
          <p className="text-zinc-500 text-sm font-medium">Configure delivery vendors and infrastructure credentials</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/40 rounded-xl border border-white/5 space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Encrypted at Rest</span>
        </div>
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 gap-8">
        {channels.map((channel) => {
          const config = configs.find(c => c.channel === channel.id) || { channel: channel.id, isEnabled: false, providerConfig: {} };
          const isSms = channel.id === 'sms';

          return (
            <div key={channel.id} className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group transition-all hover:border-white/10">
               <div className={`absolute top-0 right-0 w-64 h-64 bg-${channel.color}-500/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-${channel.color}-500/10`} />
               
               <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                  {/* Left Side: Info */}
                  <div className="lg:w-1/3 space-y-8">
                     <div className="space-y-4">
                        <div className={`w-16 h-16 rounded-3xl bg-${channel.color}-600/10 border border-${channel.color}-600/20 flex items-center justify-center text-${channel.color}-500 shadow-xl shadow-${channel.color}-600/10`}>
                           <channel.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">{channel.name}</h3>
                            <p className="text-zinc-500 text-sm mt-2">{channel.desc}</p>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${config.isEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'} `} />
                                <span className={`text-[11px] font-black uppercase tracking-tight ${config.isEnabled ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                    {config.isEnabled ? 'Active' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Provider</span>
                            <span className="text-[11px] font-black text-white uppercase tracking-tight">{channel.vendor}</span>
                        </div>
                     </div>
                  </div>

                  {/* Right Side: Config */}
                  <div className="flex-1 bg-black/40 rounded-[32px] border border-white/5 p-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5 text-zinc-600" />
                            <h4 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">Credential Infrastructure</h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={config.isEnabled}
                                onChange={(e) => handleUpdate({ ...config, isEnabled: e.target.checked })}
                                className="sr-only peer" 
                            />
                            <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white peer-checked:after:shadow-lg peer-checked:after:shadow-blue-600/50"></div>
                            <span className="ml-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Enabled</span>
                        </label>
                    </div>

                    {!config.isEnabled ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="p-6 rounded-full bg-white/[0.02] border border-white/5 text-zinc-800 transform transition-transform group-hover:scale-110">
                                <channel.icon className="w-10 h-10" />
                            </div>
                            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest max-w-xs">Gateway currently offline. Toggle activation to begin configuration.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {isSms ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">MSG91 Auth Key</label>
                                        <input 
                                            type="password" 
                                            value={config.providerConfig?.authKey || ''}
                                            onChange={(e) => setConfigs(configs.map(c => c.channel === 'sms' ? { ...c, providerConfig: { ...c.providerConfig, authKey: e.target.value } } : c))}
                                            placeholder="••••••••••••••••"
                                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-black tracking-widest text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Global Sender ID</label>
                                        <input 
                                            type="text" 
                                            value={config.providerConfig?.senderId || ''}
                                            onChange={(e) => setConfigs(configs.map(c => c.channel === 'sms' ? { ...c, providerConfig: { ...c.providerConfig, senderId: e.target.value } } : c))}
                                            placeholder="e.g. CLEERO"
                                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-black text-sm uppercase"
                                        />
                                    </div>
                                    <div className="col-span-full pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-zinc-700" />
                                            <span className="text-[10px] text-zinc-600 font-bold uppercase">Dynamic Template Mapping Required in Next Step</span>
                                        </div>
                                        <button 
                                            onClick={() => handleUpdate(config)}
                                            disabled={isSaving === 'sms'}
                                            className="flex items-center gap-2 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl shadow-white/10"
                                        >
                                            {isSaving === 'sms' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Commit Changes
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[32px] space-y-4">
                                     <div className="p-4 rounded-xl bg-white/[0.01] text-zinc-800">
                                        <ExternalLink className="w-8 h-8" />
                                     </div>
                                     <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest text-center">Implementation in Draft Status.<br/>Contact Support for Early Access.</p>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
