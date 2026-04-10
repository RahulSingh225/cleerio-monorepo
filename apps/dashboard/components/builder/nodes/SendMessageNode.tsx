'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Send } from 'lucide-react';

const channelIcons: Record<string, string> = { sms: '💬', whatsapp: '📱', ivr: '📞', voice_bot: '🤖' };
const channelColors: Record<string, string> = {
  sms: 'from-blue-500 to-blue-400',
  whatsapp: 'from-green-500 to-green-400',
  ivr: 'from-indigo-500 to-indigo-400',
  voice_bot: 'from-pink-500 to-pink-400',
};

export function SendMessageNode({ data, id, selected }: any) {
  const channel = data.channel || 'sms';
  const gradientClass = channelColors[channel] || 'from-blue-500 to-blue-400';
  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[220px] overflow-hidden transition-all ${selected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-blue-300'}`}>
      <div className={`bg-gradient-to-r ${gradientClass} px-4 py-2.5 flex items-center gap-2`}>
        <Send className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Send {channel.toUpperCase()}
        </span>
        <span className="ml-auto text-lg">{channelIcons[channel] || '📤'}</span>
      </div>
      <div className="p-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">{data.templateName || 'No template selected'}</p>
        {data.templatePreview && (
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1 line-clamp-2">{data.templatePreview}</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
    </div>
  );
}
