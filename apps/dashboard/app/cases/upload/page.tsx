'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Database, TableProperties, FolderOpen, Sparkles, Plus } from 'lucide-react';
import { api } from '@/lib/api';

export default function PortfolioUploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Saved profiles from server
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Profile naming
  const [profileName, setProfileName] = useState('');

  // Mapping state: { headerName: mappedFieldName }
  const [mappings, setMappings] = useState<Record<string, string>>({});

  const CORE_FIELDS = [
    { value: 'userId', label: 'Borrower ID (Required)' },
    { value: 'mobile', label: 'Mobile Number (Required)' },
    { value: 'name', label: 'Borrower Name' },
    { value: 'product', label: 'Product / Loan Type' },
    { value: 'currentDpd', label: 'Current DPD' },
    { value: 'outstanding', label: 'Outstanding Amount' },
  ];

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a valid CSV file.');
    }
  };

  const processFileForMapping = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await api.post('/portfolios/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const { portfolioId, headers, previewRows, savedProfiles: profiles } = res.data.data;
      setPortfolioId(portfolioId);
      setHeaders(headers);
      setPreviewRows(previewRows);
      setSavedProfiles(profiles || []);
      
      // Auto-initialize mappings (naive snake_case)
      const initialMappings: Record<string, string> = {};
      headers.forEach((h: string) => {
        initialMappings[h] = h.toLowerCase().trim().replace(/\s+/g, '_');
      });
      setMappings(initialMappings);
      
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process file.');
    } finally {
      setUploading(false);
    }
  };

  // When a saved profile is selected, pre-fill mappings
  const applyProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = savedProfiles.find(p => p.id === profileId);
    if (profile?.mappings) {
      const profileMappings = profile.mappings as Record<string, string>;
      // Merge: for headers present in the profile, use its mapping; for new headers, keep the auto-generated one
      const merged: Record<string, string> = { ...mappings };
      for (const header of headers) {
        if (profileMappings[header]) {
          merged[header] = profileMappings[header];
        }
      }
      setMappings(merged);
    }
  };

  const handleIngest = async () => {
    if (!file || !portfolioId) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mappings', JSON.stringify(mappings));
      if (selectedProfileId) {
        formData.append('profileId', selectedProfileId);
      }
      if (profileName) {
        formData.append('profileName', profileName);
      }

      await api.post(`/portfolios/${portfolioId}/ingest`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setStep(3); // Show Success Phase
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to ingest portfolio.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader 
        title="Upload Portfolio" 
        subtitle="Ingest new cases via CSV and configure field mappings." 
      />

      {/* Progress Wizard Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm">
        <WizardStep num={1} title="Upload CSV" active={step >= 1} current={step === 1} icon={<Upload className="w-4 h-4" />} />
        <div className="h-px flex-1 bg-[var(--border)] mx-4"></div>
        <WizardStep num={2} title="Map Fields & Preview" active={step >= 2} current={step === 2} icon={<TableProperties className="w-4 h-4" />} />
        <div className="h-px flex-1 bg-[var(--border)] mx-4"></div>
        <WizardStep num={3} title="Ingest & Segment" active={step === 3} current={step === 3} icon={<Database className="w-4 h-4" />} />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card p-12 text-center border-dashed border-2 border-[var(--border)] bg-[var(--surface-hover)]">
          <div 
            className="flex flex-col items-center justify-center p-8 space-y-4 cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('csv-upload')?.click()}
          >
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Drag and drop your CSV here</h3>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">or click to browse files (max 100MB)</p>
            </div>
            
            {file && (
              <div className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] mt-4 shadow-sm w-full max-w-sm justify-center">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">{file.name}</span>
                <span className="text-[var(--text-tertiary)] ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}

            <input 
              id="csv-upload" 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setError(null);
                }
              }}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <button
              onClick={processFileForMapping}
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto shadow-sm"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {uploading ? 'Processing File...' : 'Upload & Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Mapping & Preview */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Saved Profiles Selector */}
          {savedProfiles.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Reuse Saved Mapping Profile</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {savedProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => applyProfile(profile.id)}
                    className={`flex-shrink-0 p-3 border rounded-xl text-left transition-all hover:shadow-sm min-w-[180px] ${
                      selectedProfileId === profile.id
                        ? 'border-[var(--primary)] bg-blue-50 ring-2 ring-[var(--primary)] ring-opacity-30'
                        : 'border-[var(--border)] bg-white hover:border-[var(--primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {selectedProfileId === profile.id && <CheckCircle className="w-4 h-4 text-[var(--primary)]" />}
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{profile.name}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-medium">{profile.fieldCount || 0} fields</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
                {/* New profile option */}
                <button
                  onClick={() => setSelectedProfileId(null)}
                  className={`flex-shrink-0 p-3 border rounded-xl text-left transition-all hover:shadow-sm min-w-[180px] border-dashed ${
                    selectedProfileId === null
                      ? 'border-[var(--primary)] bg-blue-50 ring-2 ring-[var(--primary)] ring-opacity-30'
                      : 'border-[var(--border)] bg-white hover:border-[var(--primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Plus className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">New Profile</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-medium">Create fresh mapping</p>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Field Mapping</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Map your CSV columns to standard database fields.
              </p>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {headers.map((h, i) => {
                  const mappedTo = mappings[h] || '';
                  const isCoreField = CORE_FIELDS.some(cf => cf.value === mappedTo);
                  
                  return (
                  <div key={i} className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${isCoreField ? 'bg-blue-50/40 border-blue-200' : 'bg-[var(--surface-hover)] border-[var(--border)]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 w-1/2">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate" title={h}>{h}</span>
                      </div>
                      <div className="w-1/2 relative">
                        <select 
                          value={isCoreField ? mappedTo : 'dynamic'}
                          onChange={(e) => {
                            if (e.target.value === 'dynamic') {
                              setMappings({ ...mappings, [h]: h.toLowerCase().trim().replace(/\s+/g, '_') });
                            } else {
                              setMappings({ ...mappings, [h]: e.target.value });
                            }
                          }}
                          className={`text-sm px-3 py-1.5 rounded w-full border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            isCoreField ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' : 'bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border)]'
                          }`}
                        >
                          <option value="dynamic">Treat as Custom Field</option>
                          <optgroup label="Core Identifiers">
                            {CORE_FIELDS.map(cf => (
                              <option key={cf.value} value={cf.value}>{cf.label}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    {!isCoreField && (
                        <div className="flex justify-end mt-1">
                          <div className="flex items-center gap-2 w-1/2">
                            <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">Internal URL/Key:</span>
                            <input 
                              type="text" 
                              value={mappedTo}
                              onChange={(e) => setMappings({ ...mappings, [h]: e.target.value })}
                              placeholder="my_custom_field"
                              className="text-xs px-2 py-1 w-full rounded bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                            />
                          </div>
                        </div>
                    )}
                  </div>
                )})}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Data Preview</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                First 5 rows from your file.
              </p>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr>
                      {headers.slice(0, 5).map((h, i) => (
                        <th key={i} className="pb-3 pr-4 font-medium text-[var(--text-tertiary)] border-b border-[var(--border)] whitespace-nowrap">{h}</th>
                      ))}
                      {headers.length > 5 && <th className="pb-3 font-medium text-[var(--text-tertiary)] border-b border-[var(--border)]">...</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                        {headers.slice(0, 5).map((h, j) => (
                          <td key={j} className="py-3 pr-4 text-[var(--text-secondary)] truncate max-w-[150px]">{row[h] || '-'}</td>
                        ))}
                        {headers.length > 5 && <td className="py-3 text-[var(--text-secondary)]">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Profile Naming */}
          {!selectedProfileId && (
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Save as Profile (Optional)</span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 mb-3">
                Name this mapping to reuse it for future uploads with the same CSV format.
              </p>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder='e.g., "Home Loan Portfolio" or "Personal Loan Format"'
                className="w-full max-w-md text-sm border border-[var(--border)] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)]"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--surface-hover)]"
              disabled={uploading}
            >
              Back
            </button>
            <button
              onClick={handleIngest}
              disabled={uploading}
              className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {uploading ? 'Ingesting...' : 'Confirm & Ingest'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="card p-12 flex flex-col items-center justify-center text-center space-y-4 border border-emerald-100 bg-emerald-50">
          <div className="rounded-full bg-emerald-100 p-3">
             <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900">Portfolio Processing Started</h3>
          <p className="text-emerald-700 max-w-md">
            The CSV is currently being parsed and records are being inserted. 
            Once completed, the <span className="font-mono bg-emerald-100 px-1 rounded text-xs">segmentation.run</span> task will assign borrowers to journeys.
          </p>
          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => router.push('/cases')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-sm"
            >
              Go to Case Overview
            </button>
            <button
              onClick={() => router.push('/segments')}
              className="px-6 py-2 border border-emerald-300 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100"
            >
              View Segments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WizardStep({ num, title, active, current, icon }: { num: number; title: string; active: boolean; current: boolean; icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-3 ${active ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold ${
        current ? 'border-[var(--primary)] bg-blue-50' : 
        active ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--text-tertiary)] bg-transparent'
      }`}>
        {active && !current ? <CheckCircle className="w-5 h-5" /> : num}
      </div>
      <span className={`text-sm font-semibold ${current ? 'text-[var(--text-primary)]' : ''}`}>{title}</span>
    </div>
  );
}
