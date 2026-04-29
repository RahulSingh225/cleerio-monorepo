'use client';

import { PageHeader } from '@/components/ui/page-header';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { api } from '@/lib/api';

export default function IvrSyncsPage() {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload CSV
    await api.post('/ivr-syncs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="IVR Syncs" 
        subtitle="Upload IVR call feedback and outcomes to sync with borrower cases."
      />

      <div className="bg-[var(--surface-primary)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upload IVR Data</h2>
        <DragDropUpload 
          onUpload={handleUpload}
          accept=".csv"
          label="Drop your IVR sync CSV here"
          sublabel="or click to browse. Only CSV files are supported."
        />
      </div>
    </div>
  );
}
