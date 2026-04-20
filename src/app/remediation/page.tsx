'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RemediationItem, STATUSES, SEVERITIES, FINDING_TYPES, SEVERITY_BADGES, STATUS_BADGES, formatStatus, formatFindingType } from '@/lib/remediation-types';

export default function RemediationListPage() {
  const [items, setItems] = useState<RemediationItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/remediation').then((r) => r.json()).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter((item) => {
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) &&
        !item.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && item.status !== statusFilter) return false;
    if (severityFilter && item.severity !== severityFilter) return false;
    if (typeFilter && item.finding_type !== typeFilter) return false;
    return true;
  });

  const isOverdue = (item: RemediationItem) =>
    item.due_date && new Date(item.due_date) < new Date() && !['verified', 'closed'].includes(item.status);

  if (loading) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading remediation items...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Remediation Tracking</h1>
        <div className="flex gap-2">
          <Link href="/remediation/dashboard" className="btn btn-secondary">Dashboard</Link>
          <Link href="/remediation/new" className="btn btn-primary">+ New Item</Link>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3">
          <input
            className="input flex-1 min-w-[200px]"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
          </select>
          <select className="input w-auto" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="">All Severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select className="input w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Finding Types</option>
            {FINDING_TYPES.map((t) => <option key={t} value={t}>{formatFindingType(t)}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            {items.length === 0 ? (
              <>
                <p>No remediation items yet.</p>
                <Link href="/remediation/new" className="btn btn-primary mt-3">Create your first item</Link>
              </>
            ) : 'No items match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Finding Type</th>
                  <th>Scenario</th>
                  <th>Owner</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="cursor-pointer" onClick={() => router.push(`/remediation/${item.id}`)}>
                    <td className="font-mono text-xs">{item.id}</td>
                    <td className="font-medium max-w-[250px] truncate">{item.title}</td>
                    <td><span className={`badge ${SEVERITY_BADGES[item.severity] || 'badge-gray'}`}>{item.severity}</span></td>
                    <td><span className={`badge ${STATUS_BADGES[item.status] || 'badge-gray'}`}>{formatStatus(item.status)}</span></td>
                    <td className="text-sm">{formatFindingType(item.finding_type)}</td>
                    <td className="font-mono text-xs">{item.scenario_id || '-'}</td>
                    <td className="text-sm">{item.owner || '-'}</td>
                    <td className={`text-sm font-mono ${isOverdue(item) ? 'text-[var(--danger)] font-semibold' : ''}`}>
                      {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
                      {isOverdue(item) && ' (overdue)'}
                    </td>
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
