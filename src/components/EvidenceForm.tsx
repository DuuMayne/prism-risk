'use client';

import { useState } from 'react';
import { EVIDENCE_TYPES } from '@/lib/remediation-types';

interface EvidenceFormData {
  evidence_type: string;
  description: string;
  file_url: string;
  source_system: string;
  uploaded_by: string;
}

interface Props {
  onSave: (data: EvidenceFormData) => void;
  onCancel: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  screenshot: 'Screenshot',
  log_export: 'Log Export',
  config_change: 'Config Change',
  attestation: 'Attestation',
  external_link: 'External Link',
};

export default function EvidenceForm({ onSave, onCancel }: Props) {
  const [form, setForm] = useState<EvidenceFormData>({
    evidence_type: 'screenshot',
    description: '',
    file_url: '',
    source_system: '',
    uploaded_by: '',
  });

  const set = (key: keyof EvidenceFormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 bg-gray-50">
      <h3 className="text-sm font-semibold">Add Evidence</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">Evidence Type *</label>
          <select className="input" value={form.evidence_type} onChange={(e) => set('evidence_type', e.target.value)}>
            {EVIDENCE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Source System</label>
          <input className="input" value={form.source_system} onChange={(e) => set('source_system', e.target.value)}
            placeholder="e.g., Okta, AWS Console, Jira" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description *</label>
          <textarea className="input" rows={2} required value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="Describe what this evidence shows and how it supports remediation..." />
        </div>
        <div>
          <label className="label">File URL / Path</label>
          <input className="input" value={form.file_url} onChange={(e) => set('file_url', e.target.value)}
            placeholder="https://... or local file path" />
        </div>
        <div>
          <label className="label">Uploaded By</label>
          <input className="input" value={form.uploaded_by} onChange={(e) => set('uploaded_by', e.target.value)}
            placeholder="Your name" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary text-sm" disabled={!form.description}>
          Add Evidence
        </button>
        <button type="button" className="btn btn-secondary text-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
