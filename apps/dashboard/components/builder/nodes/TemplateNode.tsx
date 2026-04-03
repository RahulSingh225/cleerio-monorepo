'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';
import { api } from '@/lib/api';

export function TemplateNode({ data, id }: { data: any; id: string }) {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    api.get('/comm-templates').then(res => setTemplates(res.data.data || [])).catch(() => {});
  }, []);

  const selected = templates.find(t => t.id === data.templateId);

  return (
    <div className="bg-white border-2 border-violet-300 rounded-xl shadow-lg min-w-[220px] overflow-hidden">
      <div className="bg-violet-50 px-4 py-2 flex items-center gap-2 border-b border-violet-100">
        <FileText className="w-4 h-4 text-violet-600" />
        <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Template</span>
      </div>
      <div className="p-4">
        <select
          value={data.templateId || ''}
          onChange={(e) => data.onChange?.(id, { templateId: e.target.value, templateName: e.target.options[e.target.selectedIndex].text })}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 bg-white"
        >
          <option value="">Select template...</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
          ))}
        </select>
        {selected && (
          <div className="mt-2 p-2 bg-violet-50 rounded-lg border border-violet-100">
            <p className="text-[10px] text-violet-600 font-mono leading-relaxed line-clamp-3">{selected.body}</p>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white" />
    </div>
  );
}
