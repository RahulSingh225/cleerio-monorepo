'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';

interface DragDropUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  label?: string;
  sublabel?: string;
}

export function DragDropUpload({
  onUpload,
  accept = '.csv,.xlsx',
  label = 'Drop your file here',
  sublabel = 'or click to browse. Supports CSV and XLSX.',
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  }, []);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  }, []);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setError(null);
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200 group
        ${isDragging
          ? 'border-[var(--primary)] bg-[var(--primary-light)] scale-[1.01]'
          : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-secondary)]'
        }
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Uploading {fileName}...</p>
        </div>
      ) : fileName && !error ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{fileName}</p>
            <p className="text-xs text-emerald-600 mt-1">Uploaded successfully</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isDragging ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)] group-hover:bg-[var(--primary-light)] group-hover:text-[var(--primary)]'
          }`}>
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">{sublabel}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
