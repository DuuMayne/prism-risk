'use client';

import { useEffect, useState } from 'react';
import { SlaPolicy, FINDING_TYPES, SEVERITIES, formatFindingType } from '@/lib/remediation-types';

export default function SettingsPage() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    results: string[];
    counts: { taxonomy: number; scenarios: number; treatments: number };
  } | null>(null);

  // SLA state
  const [slaPolicies, setSlaPolicies] = useState<SlaPolicy[]>([]);
  const [slaEditing, setSlaEditing] = useState(false);
  const [slaForm, setSlaForm] = useState({ finding_type: 'other', severity: 'medium', due_in_days: 30, escalation_after_days: 14 });
  const [slaSaving, setSlaSaving] = useState(false);

  useEffect(() => {
    fetch('/api/sla').then((r) => r.json()).then(setSlaPolicies);
  }, []);

  const saveSla = async () => {
    setSlaSaving(true);
    await fetch('/api/sla', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slaForm),
    });
    const updated = await fetch('/api/sla').then((r) => r.json());
    setSlaPolicies(updated);
    setSlaEditing(false);
    setSlaSaving(false);
  };

  const deleteSla = async (id: number) => {
    await fetch(`/api/sla?id=${id}`, { method: 'DELETE' });
    setSlaPolicies((prev) => prev.filter((p) => p.id !== id));
  };

  const editSla = (policy: SlaPolicy) => {
    setSlaForm({
      finding_type: policy.finding_type,
      severity: policy.severity,
      due_in_days: policy.due_in_days,
      escalation_after_days: policy.escalation_after_days,
    });
    setSlaEditing(true);
  };

  const runMigration = async () => {
    if (!confirm('Refresh the database? This will update taxonomy entries and mark the seed scenario. Your scenarios and treatments will be preserved.')) return;
    setMigrating(true);
    setResult(null);
    try {
      const res = await fetch('/api/migrate', { method: 'POST' });
      const data = await res.json();
      setResult(data);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Application configuration and maintenance</p>
      </div>

      {/* Database section */}
      <div className="card">
        <h2 className="text-base font-semibold mb-1">Database</h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Refresh the database to apply the latest taxonomy definitions and system updates.
          This preserves all your scenarios and treatments.
        </p>

        <div className="flex items-center gap-3">
          <button onClick={runMigration} className="btn btn-primary" disabled={migrating}>
            {migrating ? 'Refreshing...' : 'Refresh Database'}
          </button>
          <span className="text-xs text-[var(--muted)]">
            Updates taxonomy entries, removes obsolete codes, and applies system patches.
          </span>
        </div>

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-semibold ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.success ? 'Refresh complete' : 'Refresh failed'}
              </span>
            </div>
            <ul className="space-y-1 text-sm text-[var(--muted)]">
              {result.results.map((r, i) => (
                <li key={i}>- {r}</li>
              ))}
            </ul>
            <div className="flex gap-4 mt-3 text-xs">
              <span className="badge badge-blue">{result.counts.taxonomy} taxonomy entries</span>
              <span className="badge badge-green">{result.counts.scenarios} scenarios</span>
              <span className="badge badge-purple">{result.counts.treatments} treatments</span>
            </div>
          </div>
        )}
      </div>

      {/* SLA Policies section */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold">SLA Policies</h2>
          <button
            onClick={() => { setSlaForm({ finding_type: 'other', severity: 'medium', due_in_days: 30, escalation_after_days: 14 }); setSlaEditing(true); }}
            className="btn btn-secondary text-xs"
          >
            + Add Policy
          </button>
        </div>
        <p className="text-sm text-[var(--muted)] mb-4">
          Configure due date and escalation timelines for remediation items by finding type and severity.
        </p>

        {slaEditing && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="label">Finding Type</label>
                <select className="input" value={slaForm.finding_type} onChange={(e) => setSlaForm((f) => ({ ...f, finding_type: e.target.value }))}>
                  {FINDING_TYPES.map((t) => <option key={t} value={t}>{formatFindingType(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Severity</label>
                <select className="input" value={slaForm.severity} onChange={(e) => setSlaForm((f) => ({ ...f, severity: e.target.value }))}>
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Due In (days)</label>
                <input className="input" type="number" min={1} value={slaForm.due_in_days}
                  onChange={(e) => setSlaForm((f) => ({ ...f, due_in_days: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="label">Escalate After (days)</label>
                <input className="input" type="number" min={1} value={slaForm.escalation_after_days}
                  onChange={(e) => setSlaForm((f) => ({ ...f, escalation_after_days: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveSla} disabled={slaSaving} className="btn btn-primary text-sm">
                {slaSaving ? 'Saving...' : 'Save Policy'}
              </button>
              <button onClick={() => setSlaEditing(false)} className="btn btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        {slaPolicies.length > 0 ? (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Finding Type</th>
                  <th>Severity</th>
                  <th>Due In (days)</th>
                  <th>Escalate After (days)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slaPolicies.map((p) => (
                  <tr key={p.id}>
                    <td className="text-sm">{formatFindingType(p.finding_type)}</td>
                    <td><span className={`badge ${p.severity === 'critical' ? 'badge-red' : p.severity === 'high' ? 'badge-yellow' : p.severity === 'medium' ? 'badge-blue' : 'badge-gray'}`}>{p.severity}</span></td>
                    <td className="font-mono text-sm">{p.due_in_days}</td>
                    <td className="font-mono text-sm">{p.escalation_after_days}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => editSla(p)} className="btn btn-secondary text-xs py-1 px-2">Edit</button>
                        <button onClick={() => deleteSla(p.id)} className="btn btn-danger text-xs py-1 px-2">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No SLA policies configured. Default severity-based timelines will be used.</p>
        )}
      </div>

      {/* About section */}
      <div className="card">
        <h2 className="text-base font-semibold mb-1">About PRISM</h2>
        <p className="text-sm text-[var(--muted)] mb-3">
          Predictive Risk Intelligence and Scoring Model
        </p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Version</dt>
            <dd>0.1.0</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">License</dt>
            <dd>Apache 2.0 + Commons Clause</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Database</dt>
            <dd>SQLite (local file)</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Monte Carlo Engine</dt>
            <dd>Client-side (1,000 iterations)</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
