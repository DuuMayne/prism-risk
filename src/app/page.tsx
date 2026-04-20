'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Scenario } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

function fmt(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Identified: 'badge-gray', Assessing: 'badge-blue', Accepted: 'badge-green',
    Mitigating: 'badge-yellow', Monitoring: 'badge-purple',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

function riskSignal(aleHigh: number): { label: string; color: string; badge: string } {
  if (aleHigh >= 5_000_000) return { label: 'Severe tail risk', color: '#dc2626', badge: 'badge-red' };
  if (aleHigh >= 1_000_000) return { label: 'Elevated exposure', color: '#f59e0b', badge: 'badge-yellow' };
  if (aleHigh >= 100_000) return { label: 'Watch exposure', color: '#3b82f6', badge: 'badge-blue' };
  return { label: 'Lower modeled baseline', color: '#10b981', badge: 'badge-green' };
}

export default function Dashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scenarios').then((r) => r.json()).then((data) => {
      setScenarios(data);
      setLoading(false);
    });
  }, []);

  const populated = useMemo(() => scenarios.filter((s) => s.ale_ml_bound > 0), [scenarios]);
  const totalAleML = useMemo(() => populated.reduce((a, s) => a + s.ale_ml_bound, 0), [populated]);
  const totalAleHigh = useMemo(() => populated.reduce((a, s) => a + s.ale_high_bound, 0), [populated]);
  const avgDataQuality = useMemo(() => {
    const map: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    if (!populated.length) return 'N/A';
    const avg = populated.reduce((a, s) => a + (map[s.data_quality] || 0), 0) / populated.length;
    return avg >= 2.5 ? 'High' : avg >= 1.5 ? 'Medium' : 'Low';
  }, [populated]);

  const chartData = useMemo(
    () => populated
      .sort((a, b) => b.ale_ml_bound - a.ale_ml_bound)
      .slice(0, 15)
      .map((s) => ({
        name: s.scenario_title.length > 30 ? s.scenario_title.slice(0, 28) + '...' : s.scenario_title,
        id: s.id,
        ale_ml: s.ale_ml_bound,
        ale_high: s.ale_high_bound,
        signal: riskSignal(s.ale_high_bound),
      })),
    [populated]
  );

  if (loading) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Risk Portfolio Dashboard</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Predictive Risk Intelligence and Scoring Model</p>
        </div>
        <Link href="/scenarios/new" className="btn btn-primary">+ New Scenario</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="label">Total Scenarios</div>
          <div className="text-2xl font-bold">{scenarios.length}</div>
          <div className="text-xs text-[var(--muted)]">{populated.length} quantified</div>
        </div>
        <div className="card">
          <div className="label">Portfolio ALE (Most Likely)</div>
          <div className="text-2xl font-bold">{fmt(totalAleML)}</div>
          <div className="text-xs text-[var(--muted)]">Sum of all ML bounds</div>
        </div>
        <div className="card">
          <div className="label">Portfolio ALE (High Bound)</div>
          <div className="text-2xl font-bold text-[var(--danger)]">{fmt(totalAleHigh)}</div>
          <div className="text-xs text-[var(--muted)]">Sum of all high bounds</div>
        </div>
        <div className="card">
          <div className="label">Avg Data Quality</div>
          <div className="text-2xl font-bold">{avgDataQuality}</div>
          <div className="text-xs text-[var(--muted)]">Across quantified scenarios</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold mb-4">Top Risk Scenarios by ALE (Most Likely)</h2>
          <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 180 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={175} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Bar dataKey="ale_ml" name="ALE Most Likely" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.signal.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold">Scenario Portfolio</h2>
        </div>
        {scenarios.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <p>No scenarios yet.</p>
            <Link href="/scenarios/new" className="btn btn-primary mt-3">Create your first scenario</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Family</th>
                  <th>ALE (ML)</th>
                  <th>ALE (High)</th>
                  <th>Data Quality</th>
                  <th>Status</th>
                  <th>Risk Signal</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => {
                  const signal = riskSignal(s.ale_high_bound);
                  return (
                    <tr key={s.id} className="cursor-pointer" onClick={() => window.location.href = `/scenarios/${s.id}`}>
                      <td className="font-mono text-xs">{s.id}</td>
                      <td className="font-medium">{s.scenario_title}</td>
                      <td><span className="badge badge-blue">{s.scenario_family}</span></td>
                      <td className="font-mono">{s.ale_ml_bound ? fmt(s.ale_ml_bound) : '-'}</td>
                      <td className="font-mono">{s.ale_high_bound ? fmt(s.ale_high_bound) : '-'}</td>
                      <td>
                        <span className={`badge ${s.data_quality === 'High' ? 'badge-green' : s.data_quality === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>
                          {s.data_quality}
                        </span>
                      </td>
                      <td>{statusBadge(s.treatment_status)}</td>
                      <td><span className={`badge ${signal.badge}`}>{signal.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
