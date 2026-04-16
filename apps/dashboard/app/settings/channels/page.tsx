'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Mail, MessageSquare, Phone, Radio, Loader2, Settings, X, Save, Plus } from 'lucide-react';

const channelIcons: Record<string, any> = {
  sms: MessageSquare,
  whatsapp: MessageSquare,
  ivr: Phone,
  voice_bot: Radio,
  email: Mail,
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannelType, setNewChannelType] = useState('sms');

  // Form State
  const [providerName, setProviderName] = useState('');
  const [dispatchApiTemplate, setDispatchApiTemplate] = useState('');
  const [curlInput, setCurlInput] = useState('');

  useEffect(() => { fetchChannels(); }, []);

  const fetchChannels = async () => {
    try {
      const response = await api.get('/channel-configs');
      setChannels(response.data.data || []);
    } catch (err) { 
      console.error('Failed to fetch channels'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const toggleChannel = async (channel: any) => {
    setUpdating(channel.channel);
    try {
      await api.put(`/channel-configs/${channel.channel}`, { isEnabled: !channel.isEnabled });
      fetchChannels();
    } catch (err) { alert('Failed to update channel.'); }
    finally { setUpdating(null); }
  };

  const handleEditClick = (channel: any) => {
    setEditingChannel(channel);
    setProviderName(channel.providerName || '');
    setDispatchApiTemplate(channel.dispatchApiTemplate ? JSON.stringify(channel.dispatchApiTemplate, null, 2) : '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    setIsSubmitting(true);
    let parsedTemplate = {};
    try {
      if (dispatchApiTemplate.trim()) {
        parsedTemplate = JSON.parse(dispatchApiTemplate);
      }
    } catch (err) {
      alert('Invalid JSON in API Template.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.put(`/channel-configs/${editingChannel.channel}`, {
        providerName,
        dispatchApiTemplate: parsedTemplate,
      });
      setEditingChannel(null);
      fetchChannels();
    } catch (err) { alert('Failed to update channel config.'); }
    finally { setIsSubmitting(false); }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/channel-configs', {
        channel: newChannelType,
        isEnabled: false,
      });
      setShowAddModal(false);
      fetchChannels(); // Refresh the list
    } catch (err) {
      alert('Failed to add channel. It might already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseCurlToJSON = () => {
    if (!curlInput.trim()) return;
    try {
      let extractUrl = curlInput.match(/curl\s+(?:'|")?(https?:\/\/[^\s\'\"]+)(?:'|")?/i);
      if (!extractUrl) {
         // Some curl formats place the URL at the end or have flags. Fallback generic match:
         const urlMatches = curlInput.match(/https?:\/\/[^\s\'\"]+/i);
         extractUrl = urlMatches ? urlMatches : null;
      }
      const url = extractUrl ? extractUrl[1] || extractUrl[0] : '';
      
      let methodMatch = curlInput.match(/-X\s+([A-Z]+)/i) || curlInput.match(/--request\s+([A-Z]+)/i);
      let method = methodMatch ? methodMatch[1] : 'GET';
      
      let headers: Record<string, string> = {};
      const headerMatches = [...curlInput.matchAll(/-H\s+'([^']+)'/gi), ...curlInput.matchAll(/-H\s+"([^"]+)"/gi)];
      headerMatches.forEach(m => {
        const [key, ...rest] = m[1].split(':');
        if (key && rest.length) {
          headers[key.trim()] = rest.join(':').trim();
        }
      });

      let bodyTemplate: any = {};
      let bodyMatch = curlInput.match(/--data(?:-raw)?\s+'([^']+)'/i) || curlInput.match(/-d\s+'([^']+)'/i) || curlInput.match(/--data(?:-raw)?\s+"([^"]+)"/i) || curlInput.match(/-d\s+"([^"]+)"/i);
      
      if (bodyMatch) {
         try {
           bodyTemplate = JSON.parse(bodyMatch[1]);
         } catch(e) {
           bodyTemplate = bodyMatch[1]; // Fallback to raw string if not JSON
         }
         if (method === 'GET') method = 'POST'; // cURL implies POST when data is present natively
      }

      const generatedTemplate = {
        url,
        method,
        headers,
        bodyTemplate
      };

      setDispatchApiTemplate(JSON.stringify(generatedTemplate, null, 2));
      setCurlInput('');
    } catch (e) {
      alert("Could not parse cURL string correctly.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <PageHeader
        title="Channel Configuration"
        subtitle="Manage communication channels for debt collection outreach."
        actions={
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Channel
          </button>
        }
      />

      {isLoading ? (
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((ch) => {
            const Icon = channelIcons[ch.channel] || Mail;
            return (
              <div key={ch.id} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${ch.isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] capitalize">{ch.channel.replace('_', ' ')}</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {ch.providerName || 'No provider'} · Daily cap: {ch.dailyCap || '∞'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleEditClick(ch)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <StatusBadge label={ch.isEnabled ? 'Active' : 'Disabled'} variant={ch.isEnabled ? 'success' : 'neutral'} />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={ch.isEnabled} onChange={() => toggleChannel(ch)} className="sr-only peer" disabled={updating === ch.channel} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]" />
                  </label>
                </div>
              </div>
            );
          })}
          {channels.length === 0 && (
            <div className="card py-16 flex flex-col items-center text-center space-y-3">
              <Mail className="w-10 h-10 text-[var(--text-tertiary)]" />
              <h4 className="text-base font-semibold text-[var(--text-primary)]">No Channels Configured</h4>
              <p className="text-sm text-[var(--text-secondary)]">Channels are seeded by the platform. Contact admin to set up.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Settings className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Configure <span className="capitalize">{editingChannel.channel.replace('_', ' ')}</span></h2>
              </div>
              <button onClick={() => setEditingChannel(null)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Provider Name</label>
                <input type="text" value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="e.g. MSG91, Twilio, WATI" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
              </div>

              <div className="p-4 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)] flex items-center justify-between">
                    <span>Quick Start: Paste cURL Request</span>
                  </label>
                  <p className="text-xs text-[var(--text-tertiary)]">Paste a standard cURL command from your provider's API docs. We will auto-extract the URL, Method, Headers, and Body for you.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={curlInput} 
                      onChange={(e) => setCurlInput(e.target.value)} 
                      placeholder="curl -X POST https://api.twil..." 
                      className="flex-1 bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20" 
                    />
                    <button 
                      type="button" 
                      onClick={parseCurlToJSON}
                      disabled={!curlInput.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      Extract JSON
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">API Blueprint (JSON Template)</label>
                <p className="text-xs text-[var(--text-tertiary)] mb-2">Paste a JSON structure that represents the HTTP request to the provider. Use {'{{api_key}}'}, {'{{mobile}}'}, and {'{{TEMPLATE_ID}}'} as placeholders.</p>
                <textarea 
                  value={dispatchApiTemplate} 
                  onChange={(e) => setDispatchApiTemplate(e.target.value)} 
                  rows={10} 
                  placeholder={"{\n  \"url\": \"https://api.provider.com/send\",\n  \"method\": \"POST\",\n  \"headers\": {},\n  \"bodyTemplate\": {}\n}"}
                  className="w-full font-mono bg-gray-50 border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20" 
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add New Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] grid place-items-center h-[100dvh] w-full p-6 bg-black/40 backdrop-blur-sm overflow-hidden">
          <div className="w-full max-w-md bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Add New Channel</h2>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateChannel} className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Channel Type</label>
                <p className="text-xs text-[var(--text-tertiary)]">Select the unified channel archetype.</p>
                <select value={newChannelType} onChange={(e) => setNewChannelType(e.target.value)} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]">
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="ivr">IVR</option>
                  <option value="voice_bot">Voice Bot</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Creating...' : 'Create Channel Base'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
