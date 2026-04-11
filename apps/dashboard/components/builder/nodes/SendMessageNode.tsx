'use client';
import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Send, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const channelIcons: Record<string, string> = { sms: '💬', whatsapp: '📱', ivr: '📞', voice_bot: '🤖' };
const channelColors: Record<string, string> = {
  sms: 'from-blue-500 to-blue-400',
  whatsapp: 'from-green-500 to-green-400',
  ivr: 'from-indigo-500 to-indigo-400',
  voice_bot: 'from-pink-500 to-pink-400',
};

export function SendMessageNode({ data, id, selected }: any) {
  const { updateNodeData } = useReactFlow();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/comm-templates')
      .then(res => setTemplates(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateNodeData(id, { 
        templateId: template.id, 
        templateName: template.name,
        templatePreview: template.body,
        channel: template.channel
      });
    } else {
      updateNodeData(id, { templateId: '', templateName: '', templatePreview: '', channel: 'sms' });
    }
  };

  const channel = data.channel || 'sms';
  const gradientClass = channelColors[channel] || 'from-blue-500 to-blue-400';

  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[240px] overflow-hidden transition-all ${selected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-blue-300'}`}>
      <div className={`bg-gradient-to-r ${gradientClass} px-4 py-2.5 flex items-center gap-2`}>
        <Send className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Send {channel.toUpperCase()}
        </span>
        <span className="ml-auto text-lg">{channelIcons[channel] || '📤'}</span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Message Template</label>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
          </div>
        ) : (
          <select 
            value={data.templateId || ''} 
            onChange={handleChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
          >
            <option value="">-- Select Template --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.channel})
              </option>
            ))}
          </select>
        )}
        {data.templatePreview && (
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1 line-clamp-2 italic border-l-2 border-blue-200 pl-2">"{data.templatePreview}"</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
    </div>
  );
}
