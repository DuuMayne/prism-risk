'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Scenario } from '@/lib/types';
import { SEVERITIES, FINDING_TYPES, formatFindingType } from '@/lib/remediation-types';

interface FormData {
  title: string;
  description: string;
  finding_type: string;
  severity: string;
  scenario_id: string;
  source_system: string;
  application_name: string;
  entitlement_name: string;
  affected_user: string;
  owner: string;
  due_date: string;
}

export default function NewRemediationPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-[var(--muted)]">Loading...</div>}>
      <NewRemediationForm />
    </Suspense>
  );
}

function NewRemediationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillScenario = searchParams.get('scenario_id') || '';

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    finding_type: 'other',
    severity: 'medium',
    scenario_id: prefillScenario,
    source_system: '',
    application_name: '',
    entitlement_name: '',
    affected_user: '',
    owner: '',
    due_date: '',
  });

  const set = (key: keyof FormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    fetch('/api/scenarios').then((r) => r.json()).then(setScenarios);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/remediation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        scenario_id: form.scenario_id || null,
        due_date: form.due_date || null,
      }),
    });
    const data = await res.json();
    router.push(`/remediation/${data.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn btn-secondary text-sm">Back</button>
        <h1 className="text-2xl font-bold">New Remediation Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Title *</label>
            <input className="input" required value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g., Revoke excessive admin access for service account" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Detailed description of the finding and what needs to be remediated..." />
          </div>

          <div>
            <label className="label">Finding Type *</label>
            <select className="input" value={form.finding_type} onChange={(e) => set('finding_type', e.target.value)}>
              {FINDING_TYPES.map((t) => <option key={t} value={t}>{formatFindingType(t)}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Severity *</label>
            <select className="input" value={form.severity} onChange={(e) => set('severity', e.target.value)}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Linked Scenario</label>
            <select className="input" value={form.scenario_id} onChange={(e) => set('scenario_id', e.target.value)}>
              <option value="">None</option>
              {scenarios.map((s) => <option key={s.id} value={s.id}>{s.id} - {s.scenario_title}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Owner</label>
            <input className="input" value={form.owner} onChange={(e) => set('owner', e.target.value)}
              placeholder="Person responsible for remediation" />
          </div>

          <div>
            <label className="label">Source System</label>
            <input className="input" value={form.source_system} onChange={(e) => set('source_system', e.target.value)}
              placeholder="e.g., Okta, AWS IAM, GitHub" />
          </div>

          <div>
            <label className="label">Application Name</label>
            <input className="input" value={form.application_name} onChange={(e) => set('application_name', e.target.value)}
              placeholder="Human-readable application name" />
          </div>

          <div>
            <label className="label">Entitlement / Permission</label>
            <input className="input" value={form.entitlement_name} onChange={(e) => set('entitlement_name', e.target.value)}
              placeholder="e.g., Super Admin, ReadWrite access" />
          </div>

          <div>
            <label className="label">Affected User</label>
            <input className="input" value={form.affected_user} onChange={(e) => set('affected_user', e.target.value)}
              placeholder="User or account affected by this finding" />
          </div>

          <div>
            <label className="label">Due Date</label>
            <input className="input" type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
            <p className="text-xs text-[var(--muted)] mt-1">Leave blank to auto-calculate from SLA policy</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary" disabled={saving || !form.title}>
            {saving ? 'Creating...' : 'Create Remediation Item'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
