'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RemediationItem, StatusHistoryEntry, EvidenceRecord,
  SEVERITY_BADGES, STATUS_BADGES, RESOLUTION_TYPES,
  formatStatus, formatFindingType,
} from '@/lib/remediation-types';
import {
  getAvailableTransitions, transitionLabel, transitionColor,
  type Status,
} from '@/lib/workflow';
import EvidenceForm from '@/components/EvidenceForm';

interface ItemDetail extends RemediationItem {
  status_history: StatusHistoryEntry[];
  evidence: EvidenceRecord[];
}

export default function RemediationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [tab, setTab] = useState<'overview' | 'history' | 'evidence'>('overview');
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  // Transition form state
  const [transitionTarget, setTransitionTarget] = useState<Status | null>(null);
  const [transitionComment, setTransitionComment] = useState('');
  const [transitionActor, setTransitionActor] = useState('');
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [transitionError, setTransitionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadItem = useCallback(() => {
    fetch(`/api/remediation/${id}`).then((r) => r.json()).then(setItem);
  }, [id]);

  useEffect(() => { loadItem(); }, [loadItem]);

  const deleteItem = async () => {
    if (!confirm('Delete this remediation item? This cannot be undone.')) return;
    await fetch(`/api/remediation/${id}`, { method: 'DELETE' });
    router.push('/remediation');
  };

  const resetTransitionForm = () => {
    setTransitionTarget(null);
    setTransitionComment('');
    setTransitionActor('');
    setResolutionType('');
    setResolutionNotes('');
    setTransitionError('');
  };

  const submitTransition = async () => {
    if (!transitionTarget) return;
    setTransitionError('');
    setSubmitting(true);

    const res = await fetch(`/api/remediation/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: transitionTarget,
        comment: transitionComment || undefined,
        actor: transitionActor || undefined,
        resolution_type: resolutionType || undefined,
        resolution_notes: resolutionNotes || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setTransitionError(data.error || 'Transition failed');
      setSubmitting(false);
      return;
    }

    resetTransitionForm();
    setSubmitting(false);
    loadItem();
  };

  const saveEvidence = async (formData: { evidence_type: string; description: string; file_url: string; source_system: string; uploaded_by: string }) => {
    await fetch(`/api/remediation/${id}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setShowEvidenceForm(false);
    loadItem();
  };

  const deleteEvidence = async (evidenceId: number) => {
    await fetch(`/api/remediation/${id}/evidence?evidence_id=${evidenceId}`, { method: 'DELETE' });
    loadItem();
  };

  if (!item) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading remediation item...</div>;
  }

  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && !['verified', 'closed'].includes(item.status);

  const daysUntilDue = item.due_date
    ? Math.ceil((new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const availableTransitions = getAvailableTransitions(item.status as Status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-[var(--muted)]">{item.id}</span>
            <span className={`badge ${SEVERITY_BADGES[item.severity] || 'badge-gray'}`}>{item.severity}</span>
            <span className={`badge ${STATUS_BADGES[item.status] || 'badge-gray'}`}>{formatStatus(item.status)}</span>
            {isOverdue && <span className="badge badge-red">Overdue</span>}
          </div>
          <h1 className="text-2xl font-bold">{item.title}</h1>
          {item.description && (
            <p className="text-sm text-[var(--muted)] mt-1 max-w-3xl">{item.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {item.status !== 'closed' && (
            <Link href={`/remediation/${id}/edit`} className="btn btn-secondary">Edit</Link>
          )}
          <button onClick={deleteItem} className="btn btn-danger">Delete</button>
        </div>
      </div>

      {/* Status Actions */}
      {availableTransitions.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Actions</h3>
          {!transitionTarget ? (
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((target) => (
                <button
                  key={target}
                  onClick={() => setTransitionTarget(target)}
                  className={`btn ${transitionColor(target)} text-sm`}
                >
                  {transitionLabel(target)}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Transitioning to:</span>
                <span className={`badge ${STATUS_BADGES[transitionTarget]}`}>{formatStatus(transitionTarget)}</span>
              </div>

              {/* Resolution type — required when resolving */}
              {transitionTarget === 'resolved' && (
                <div>
                  <label className="label">Resolution Type *</label>
                  <select
                    className={`input ${!resolutionType ? 'border-[var(--danger)]' : ''}`}
                    value={resolutionType}
                    onChange={(e) => setResolutionType(e.target.value)}
                  >
                    <option value="">Select resolution type...</option>
                    {RESOLUTION_TYPES.map((rt) => (
                      <option key={rt} value={rt}>{formatStatus(rt)}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Resolution notes — optional, shown when resolving */}
              {transitionTarget === 'resolved' && (
                <div>
                  <label className="label">Resolution Notes</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="How was this resolved?"
                  />
                </div>
              )}

              {/* Comment — required when blocking, optional otherwise */}
              <div>
                <label className="label">
                  Comment {transitionTarget === 'blocked' ? '*' : ''}
                </label>
                <textarea
                  className={`input ${transitionTarget === 'blocked' && !transitionComment ? 'border-[var(--danger)]' : ''}`}
                  rows={2}
                  value={transitionComment}
                  onChange={(e) => setTransitionComment(e.target.value)}
                  placeholder={transitionTarget === 'blocked' ? 'Explain why this is blocked (required)...' : 'Optional comment...'}
                />
              </div>

              {/* Actor name — optional */}
              <div>
                <label className="label">Your Name</label>
                <input
                  className="input"
                  value={transitionActor}
                  onChange={(e) => setTransitionActor(e.target.value)}
                  placeholder="Who is making this change?"
                />
              </div>

              {transitionError && (
                <div className="text-sm text-[var(--danger)] bg-red-50 p-2 rounded-md">
                  {transitionError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={submitTransition}
                  disabled={submitting || (transitionTarget === 'blocked' && !transitionComment) || (transitionTarget === 'resolved' && !resolutionType)}
                  className={`btn ${transitionColor(transitionTarget)} text-sm`}
                >
                  {submitting ? 'Saving...' : `Confirm: ${transitionLabel(transitionTarget)}`}
                </button>
                <button onClick={resetTransitionForm} className="btn btn-secondary text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {(['overview', 'history', 'evidence'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {t === 'overview' ? 'Overview' : t === 'history' ? `History (${item.status_history.length})` : `Evidence (${item.evidence.length})`}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW TAB ============ */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Finding Details */}
            <div className="card">
              <h3 className="text-sm font-semibold mb-3">Finding Details</h3>
              <dl className="space-y-2 text-sm">
                {([
                  ['Finding Type', formatFindingType(item.finding_type)],
                  ['Severity', item.severity],
                  ['Source System', item.source_system],
                  ['Application', item.application_name],
                  ['Entitlement', item.entitlement_name],
                  ['Affected User', item.affected_user],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-[var(--muted)]">{label}</dt>
                    <dd>{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Tracking */}
            <div className="card">
              <h3 className="text-sm font-semibold mb-3">Tracking</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted)]">Status</dt>
                  <dd><span className={`badge ${STATUS_BADGES[item.status]}`}>{formatStatus(item.status)}</span></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted)]">Owner</dt>
                  <dd>{item.owner || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted)]">Due Date</dt>
                  <dd className={isOverdue ? 'text-[var(--danger)] font-semibold' : ''}>
                    {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
                    {daysUntilDue !== null && !['verified', 'closed'].includes(item.status) && (
                      <span className={`ml-1 text-xs ${daysUntilDue < 0 ? 'text-[var(--danger)]' : daysUntilDue <= 3 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                        ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d left`})
                      </span>
                    )}
                  </dd>
                </div>
                {item.resolution_type && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted)]">Resolution</dt>
                    <dd>{formatStatus(item.resolution_type)}</dd>
                  </div>
                )}
                {item.resolution_notes && (
                  <div className="flex justify-between">
                    <dt className="text-[var(--muted)]">Resolution Notes</dt>
                    <dd className="text-right max-w-[200px]">{item.resolution_notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Timestamps */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Timeline</h3>
            <dl className="space-y-2 text-sm">
              {([
                ['Created', item.created_at],
                ['Updated', item.updated_at],
                ['Resolved', item.resolved_at],
                ['Verified', item.verified_at],
                ['Closed', item.closed_at],
              ] as [string, string | null][]).map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-[var(--muted)]">{label}</dt>
                  <dd>{value ? new Date(value).toLocaleString() : '-'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Linked Scenario */}
          {item.scenario_id && (
            <div className="card">
              <h3 className="text-sm font-semibold mb-2">Linked Scenario</h3>
              <Link href={`/scenarios/${item.scenario_id}`} className="text-[var(--accent)] hover:underline font-mono text-sm">
                {item.scenario_id}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ============ HISTORY TAB ============ */}
      {tab === 'history' && (
        <div className="space-y-3">
          {item.status_history.length === 0 ? (
            <div className="card text-center py-8 text-[var(--muted)]">
              No status history recorded.
            </div>
          ) : (
            item.status_history.map((entry) => (
              <div key={entry.id} className={`card flex items-start gap-3 ${entry.to_status === 'blocked' ? 'border-l-4 border-l-[var(--danger)]' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${STATUS_BADGES[entry.from_status] || 'badge-gray'}`}>{formatStatus(entry.from_status)}</span>
                    <span className="text-[var(--muted)]">&rarr;</span>
                    <span className={`badge ${STATUS_BADGES[entry.to_status] || 'badge-gray'}`}>{formatStatus(entry.to_status)}</span>
                    {entry.actor && <span className="text-xs text-[var(--muted)]">by {entry.actor}</span>}
                  </div>
                  {entry.comment && <p className="text-sm">{entry.comment}</p>}
                  {entry.resolution_type && (
                    <p className="text-xs text-[var(--muted)]">Resolution: {formatStatus(entry.resolution_type)}</p>
                  )}
                </div>
                <span className="text-xs text-[var(--muted)] shrink-0">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============ EVIDENCE TAB ============ */}
      {tab === 'evidence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted)]">
                Attach evidence to support remediation. Evidence is required before resolving an item (except for false positives).
              </p>
            </div>
            {item.status !== 'closed' && (
              <button
                onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                className="btn btn-secondary text-sm"
              >
                {showEvidenceForm ? 'Cancel' : '+ Add Evidence'}
              </button>
            )}
          </div>

          {showEvidenceForm && (
            <EvidenceForm onSave={saveEvidence} onCancel={() => setShowEvidenceForm(false)} />
          )}

          {item.evidence.length === 0 && !showEvidenceForm ? (
            <div className="card text-center py-8 text-[var(--muted)]">
              <p>No evidence attached yet.</p>
              {item.status !== 'closed' && (
                <button onClick={() => setShowEvidenceForm(true)} className="btn btn-primary mt-3 text-sm">
                  Add your first evidence record
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {item.evidence.map((ev) => (
                <div key={ev.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-blue">{ev.evidence_type.replace(/_/g, ' ')}</span>
                        {ev.source_system && <span className="text-xs text-[var(--muted)]">from {ev.source_system}</span>}
                      </div>
                      <p className="text-sm">{ev.description}</p>
                      {ev.file_url && (
                        <a
                          href={ev.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--accent)] hover:underline mt-1 inline-block"
                        >
                          {ev.file_url}
                        </a>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted)]">
                        {ev.uploaded_by && <span>by {ev.uploaded_by}</span>}
                        <span>{new Date(ev.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    {item.status !== 'closed' && (
                      <button
                        onClick={() => deleteEvidence(ev.id)}
                        className="btn btn-danger text-xs py-1 px-2 shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
