'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { SEVERITY_BADGES, STATUS_BADGES, formatStatus } from '@/lib/remediation-types';

interface DashboardData {
  totalItems: number;
  byStatus: Record<string, number>;
  openBySeverity: Record<string, number>;
  overdueCount: number;
  meanTimeToRemediate: number | null;
  byOwner: { owner: string; count: number }[];
  byApplication: { application_name: string; count: number }[];
  recentlyClosed: { id: string; title: string; severity: string; closed_at: string; created_at: string }[];
  aging: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  open: '#3b82f6',
  in_progress: '#f59e0b',
  blocked: '#ef4444',
  resolved: '#8b5cf6',
  verified: '#10b981',
  closed: '#94a3b8',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#94a3b8',
};

export default function RemediationDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/remediation/dashboard').then((r) => r.json()).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const exportCsv = () => {
    window.location.href = '/api/remediation/export?format=csv';
  };

  if (loading || !data) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading dashboard...</div>;
  }

  const openCount = (data.byStatus.open || 0) + (data.byStatus.in_progress || 0) + (data.byStatus.blocked || 0);
  const statusChartData = Object.entries(data.byStatus).map(([status, count]) => ({
    name: formatStatus(status), value: count, fill: STATUS_COLORS[status] || '#94a3b8',
  }));
  const severityChartData = Object.entries(data.openBySeverity).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1), value: count, fill: SEVERITY_COLORS[severity] || '#94a3b8',
  }));
  const agingChartData = Object.entries(data.aging).map(([bucket, count]) => ({
    name: bucket + 'd', count,
  }));
  const appChartData = data.byApplication.map((a) => ({
    name: a.application_name.length > 20 ? a.application_name.slice(0, 18) + '...' : a.application_name,
    count: a.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Remediation Dashboard</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Overview of remediation tracking metrics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn btn-secondary text-sm">Export CSV</button>
          <Link href="/remediation" className="btn btn-secondary text-sm">View All Items</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-[var(--muted)] mb-1">Total Items</div>
          <div className="text-2xl font-bold">{data.totalItems}</div>
        </div>
        <div className="card">
          <div className="text-xs text-[var(--muted)] mb-1">Open Items</div>
          <div className="text-2xl font-bold text-[var(--accent)]">{openCount}</div>
        </div>
        <div className="card">
          <div className="text-xs text-[var(--muted)] mb-1">Overdue</div>
          <div className={`text-2xl font-bold ${data.overdueCount > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
            {data.overdueCount}
          </div>
        </div>
        <div className="card">
          <div className="text-xs text-[var(--muted)] mb-1">Mean Time to Remediate</div>
          <div className="text-2xl font-bold">
            {data.meanTimeToRemediate !== null ? `${data.meanTimeToRemediate}d` : '-'}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Status Distribution</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {statusChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--muted)] text-center py-8">No data</p>
          )}
        </div>

        {/* Open by Severity */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Open Items by Severity</h3>
          {severityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {severityChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--muted)] text-center py-8">No open items</p>
          )}
        </div>

        {/* Aging */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Open Item Aging</h3>
          {agingChartData.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agingChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--muted)] text-center py-8">No open items</p>
          )}
        </div>

        {/* By Application */}
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Items by Application</h3>
          {appChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={appChartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--muted)] text-center py-8">No application data</p>
          )}
        </div>
      </div>

      {/* By Owner */}
      {data.byOwner.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Items by Owner</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Owner</th>
                  <th className="text-right">Items</th>
                </tr>
              </thead>
              <tbody>
                {data.byOwner.map((o) => (
                  <tr key={o.owner}>
                    <td className="text-sm">{o.owner}</td>
                    <td className="text-right font-mono">{o.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recently Closed */}
      {data.recentlyClosed.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Recently Closed</h3>
          <div className="space-y-2">
            {data.recentlyClosed.map((item) => (
              <Link
                key={item.id}
                href={`/remediation/${item.id}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[var(--muted)]">{item.id}</span>
                  <span className={`badge ${SEVERITY_BADGES[item.severity] || 'badge-gray'}`}>{item.severity}</span>
                  <span className="text-sm">{item.title}</span>
                </div>
                <span className="text-xs text-[var(--muted)]">
                  {new Date(item.closed_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
