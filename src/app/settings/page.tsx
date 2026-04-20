'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    results: string[];
    counts: { taxonomy: number; scenarios: number; treatments: number };
  } | null>(null);

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
            <dd>AGPL-3.0</dd>
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
