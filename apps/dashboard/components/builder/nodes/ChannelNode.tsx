'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Radio } from 'lucide-react';

const channels = [
  { value: 'sms', label: 'SMS', icon: '💬', color: 'bg-blue-50 border-blue-300 text-blue-700' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '📱', color: 'bg-green-50 border-green-300 text-green-700' },
  { value: 'ivr', label: 'IVR', icon: '📞', color: 'bg-orange-50 border-orange-300 text-orange-700' },
  { value: 'voice_bot', label: 'Voice Bot', icon: '🤖', color: 'bg-purple-50 border-purple-300 text-purple-700' },
];

export function ChannelNode({ data, id }: { data: any; id: string }) {
  return (
    <div className="bg-white border-2 border-blue-300 rounded-xl shadow-lg min-w-[220px] overflow-hidden">
      <div className="bg-blue-50 px-4 py-2 flex items-center gap-2 border-b border-blue-100">
        <Radio className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Channel</span>
      </div>
      <div className="p-4 space-y-2">
        {channels.map(ch => (
          <button
            key={ch.value}
            onClick={() => data.onChange?.(id, { channel: ch.value })}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
              data.channel === ch.value 
                ? `${ch.color} border-2 scale-[1.02] shadow-sm` 
                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="text-base">{ch.icon}</span>
            {ch.label}
          </button>
        ))}
      </div>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" />
    </div>
  );
}
