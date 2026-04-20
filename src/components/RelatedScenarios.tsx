'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Scenario } from '@/lib/types';

function fmtShort(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

const STATUS_COLORS: Record<string, string> = {
  'Identified': 'badge-gray',
  'Assessing': 'badge-blue',
  'Accepted': 'badge-green',
  'Mitigating': 'badge-yellow',
  'Monitoring': 'badge-purple',
};

interface Props {
  scenario: Scenario;
}

interface SimilarScenario extends Scenario {
  matchReasons: string[];
  matchScore: number;
}

export default function RelatedScenarios({ scenario }: Props) {
  const [allScenarios, setAllScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scenarios').then((r) => r.json()).then((data) => {
      setAllScenarios(data);
      setLoading(false);
    });
  }, []);

  const related = useMemo(() => {
    const others = allScenarios.filter((s) => s.id !== scenario.id);
    const scored: SimilarScenario[] = [];

    for (const s of others) {
      const reasons: string[] = [];
      let score = 0;

      if (s.scenario_family && s.scenario_family === scenario.scenario_family) {
        reasons.push('Same family');
        score += 3;
      }
      if (s.threat_community && s.threat_community === scenario.threat_community) {
        reasons.push('Same threat community');
        score += 2;
      }
      if (s.threat_action && s.threat_action === scenario.threat_action) {
        reasons.push('Same threat action');
        score += 2;
      }
      if (s.loss_event_type && s.loss_event_type === scenario.loss_event_type) {
        reasons.push('Same loss event type');
        score += 2;
      }
      if (s.business_process && s.business_process === scenario.business_process) {
        reasons.push('Same business process');
        score += 1;
      }
      if (s.owner && s.owner === scenario.owner) {
        reasons.push('Same owner');
        score += 1;
      }

      if (score > 0) {
        scored.push({ ...s, matchReasons: reasons, matchScore: score });
      }
    }

    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }, [allScenarios, scenario]);

  const treatmentInsights = useMemo(() => {
    if (related.length === 0) return null;

    const total = related.length;
    const byStatus: Record<string, number> = {};
    for (const s of related) {
      const status = s.treatment_status || 'Identified';
      byStatus[status] = (byStatus[status] || 0) + 1;
    }

    const treated = (byStatus['Mitigating'] || 0) + (byStatus['Monitoring'] || 0) + (byStatus['Accepted'] || 0);
    const untreated = total - treated;

    return { total, byStatus, treated, untreated, treatedPct: (treated / total * 100) };
  }, [related]);

  if (loading) return null;
  if (related.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold mb-1">Related Scenarios</h3>
      <p className="text-xs text-[var(--muted)] mb-4">
        Scenarios sharing classification attributes — see how similar risks are being handled across the portfolio.
      </p>

      {/* Treatment insight summary */}
      {treatmentInsights && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Treatment coverage across {treatmentInsights.total} related scenarios</span>
            <span className="text-xs text-[var(--muted)]">
              {treatmentInsights.treated} addressed, {treatmentInsights.untreated} unaddressed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
            {Object.entries(treatmentInsights.byStatus).sort(([a], [b]) => {
              const order = ['Monitoring', 'Mitigating', 'Accepted', 'Assessing', 'Identified'];
              return order.indexOf(a) - order.indexOf(b);
            }).map(([status, count]) => (
              <div
                key={status}
                className="h-2.5 first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${(count / treatmentInsights.total) * 100}%`,
                  backgroundColor: status === 'Monitoring' ? '#8b5cf6' :
                    status === 'Mitigating' ? '#f59e0b' :
                    status === 'Accepted' ? '#10b981' :
                    status === 'Assessing' ? '#3b82f6' : '#94a3b8',
                }}
                title={`${status}: ${count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {Object.entries(treatmentInsights.byStatus).map(([status, count]) => (
              <span key={status} className="text-xs flex items-center gap-1">
                <span className={`badge ${STATUS_COLORS[status] || 'badge-gray'}`}>{status}</span>
                <span className="text-[var(--muted)]">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related scenarios list */}
      <div className="space-y-2">
        {related.map((s) => (
          <Link
            key={s.id}
            href={`/scenarios/${s.id}`}
            className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-gray-50 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--muted)]">{s.id}</span>
                <span className={`badge ${STATUS_COLORS[s.treatment_status] || 'badge-gray'}`}>
                  {s.treatment_status}
                </span>
              </div>
              <div className="text-sm font-medium mt-0.5 truncate">{s.scenario_title}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {s.matchReasons.map((reason) => (
                  <span key={reason} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right ml-4 shrink-0">
              {s.ale_ml_bound > 0 && (
                <div className="text-sm font-mono">{fmtShort(s.ale_ml_bound)}</div>
              )}
              <div className="text-xs text-[var(--muted)]">ALE (ML)</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
