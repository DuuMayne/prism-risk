'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scenario } from '@/lib/types';

function fmt(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/scenarios').then((r) => r.json()).then((data) => {
      setScenarios(data);
      setLoading(false);
    });
  }, []);

  const families = [...new Set(scenarios.map((s) => s.scenario_family).filter(Boolean))];
  const statuses = [...new Set(scenarios.map((s) => s.treatment_status).filter(Boolean))];

  const filtered = scenarios.filter((s) => {
    if (search && !s.scenario_title.toLowerCase().includes(search.toLowerCase()) &&
        !s.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (familyFilter && s.scenario_family !== familyFilter) return false;
    if (statusFilter && s.treatment_status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading scenarios...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Risk Scenarios</h1>
        <Link href="/scenarios/new" className="btn btn-primary">+ New Scenario</Link>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3">
          <input
            className="input flex-1 min-w-[200px]"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-auto" value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
            <option value="">All Families</option>
            {families.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            {scenarios.length === 0 ? 'No scenarios yet.' : 'No scenarios match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Family</th>
                  <th>Threat</th>
                  <th>Owner</th>
                  <th>ALE (ML)</th>
                  <th>Status</th>
                  <th>Readiness</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="cursor-pointer" onClick={() => router.push(`/scenarios/${s.id}`)}>
                    <td className="font-mono text-xs">{s.id}</td>
                    <td className="font-medium max-w-[250px] truncate">{s.scenario_title}</td>
                    <td><span className="badge badge-blue">{s.scenario_family || '-'}</span></td>
                    <td className="text-sm">{s.threat_community || '-'}</td>
                    <td className="text-sm">{s.owner || '-'}</td>
                    <td className="font-mono">{s.ale_ml_bound ? fmt(s.ale_ml_bound) : '-'}</td>
                    <td>
                      <span className={`badge ${
                        s.treatment_status === 'Mitigating' ? 'badge-yellow' :
                        s.treatment_status === 'Monitoring' ? 'badge-purple' :
                        s.treatment_status === 'Accepted' ? 'badge-green' :
                        s.treatment_status === 'Assessing' ? 'badge-blue' : 'badge-gray'
                      }`}>{s.treatment_status || '-'}</span>
                    </td>
                    <td className="text-sm">{s.quant_readiness || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
