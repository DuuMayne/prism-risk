'use client';

import { useState } from 'react';
import { SimulationSummary as SummaryType } from '@/lib/monte-carlo';

function fmt(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

function fmtShort(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function pct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

export default function SimulationSummaryPanel({
  summary,
  comparisonSummary,
  treatmentCost,
  treatmentName,
  dataQuality,
}: {
  summary: SummaryType;
  comparisonSummary?: SummaryType;
  treatmentCost?: number;
  treatmentName?: string;
  dataQuality?: string;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const isComparison = !!comparisonSummary;

  return (
    <div className="space-y-4">
      {/* Headline metric */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <div className="label">Expected Annual Loss (Mean)</div>
            <div className="text-3xl font-bold mt-1">{fmt(summary.mean_annual_loss)}</div>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-md">
              Averaging across 1,000 simulated years. Half of years fall below {fmtShort(summary.median_annual_loss)} (median),
              but tail events push the average higher.
            </p>
          </div>
          <div className="text-right">
            <div className="label">Worst-Case Exposure (P95)</div>
            <div className="text-2xl font-bold text-[var(--danger)] mt-1">{fmt(summary.p95_annual_loss)}</div>
            <p className="text-xs text-[var(--muted)] mt-1">
              In 5% of simulated years, losses exceed this amount.
            </p>
          </div>
        </div>
      </div>

      {/* Threshold exceedance - visual */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-1">How likely is this loss to exceed key thresholds?</h3>
        <p className="text-xs text-[var(--muted)] mb-4">
          Based on 1,000 simulated years, the probability that annual loss crosses each threshold.
        </p>
        <div className="space-y-3">
          {summary.prob_above_thresholds.map((t, i) => {
            const cProb = comparisonSummary?.prob_above_thresholds[i]?.probability;
            const color = t.probability > 0.5 ? 'bg-red-500' :
                          t.probability > 0.2 ? 'bg-amber-500' :
                          t.probability > 0.05 ? 'bg-blue-500' : 'bg-emerald-500';
            const cColor = 'bg-emerald-400';
            return (
              <div key={t.threshold}>
                <div className="flex justify-between text-sm mb-1">
                  <span>Loss exceeds <span className="font-semibold">{fmtShort(t.threshold)}</span></span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{pct(t.probability)}</span>
                    {cProb !== undefined && (
                      <span className="text-xs text-[var(--success)]">
                        Treated: {pct(cProb)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 relative">
                  <div className={`h-2.5 rounded-full ${color} transition-all`}
                    style={{ width: `${Math.max(t.probability * 100, 1)}%` }} />
                  {cProb !== undefined && (
                    <div className={`h-2.5 rounded-full ${cColor} opacity-70 absolute top-0 left-0 transition-all`}
                      style={{ width: `${Math.max(cProb * 100, 0.5)}%` }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable detail metrics */}
      <div className="card">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-sm font-semibold">Detailed Simulation Metrics</h3>
          <span className="text-xs text-[var(--accent)]">{showDetails ? 'Hide' : 'Show'}</span>
        </button>
        {showDetails && (
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left pb-2">Metric</th>
                  <th className="text-right pb-2">Current State</th>
                  {isComparison && <th className="text-right pb-2">Treated State</th>}
                  {isComparison && <th className="text-right pb-2">Change</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {[
                  { label: 'Mean Annual Loss', cur: summary.mean_annual_loss, tre: comparisonSummary?.mean_annual_loss },
                  { label: 'Median Annual Loss', cur: summary.median_annual_loss, tre: comparisonSummary?.median_annual_loss },
                  { label: 'P90 Annual Loss', cur: summary.p90_annual_loss, tre: comparisonSummary?.p90_annual_loss },
                  { label: 'P95 Annual Loss', cur: summary.p95_annual_loss, tre: comparisonSummary?.p95_annual_loss },
                  { label: 'Mean Loss Events/Year', cur: summary.mean_lef, tre: comparisonSummary?.mean_lef, isCurrency: false, precision: 2 },
                  { label: 'Mean Loss per Event', cur: summary.mean_total_loss, tre: comparisonSummary?.mean_total_loss },
                  { label: 'Mean Secondary Loss (when triggered)', cur: summary.mean_secondary_loss_when_triggered, tre: comparisonSummary?.mean_secondary_loss_when_triggered },
                ].map((row) => {
                  const isCurrency = row.isCurrency !== false;
                  const fmtVal = (v: number) => isCurrency ? fmt(v) : v.toFixed(row.precision ?? 0);
                  const change = row.tre !== undefined ? row.cur - row.tre : undefined;
                  return (
                    <tr key={row.label}>
                      <td className="py-2 text-[var(--muted)]">{row.label}</td>
                      <td className="py-2 text-right font-mono">{fmtVal(row.cur)}</td>
                      {isComparison && <td className="py-2 text-right font-mono">{row.tre !== undefined ? fmtVal(row.tre) : '-'}</td>}
                      {isComparison && change !== undefined && (
                        <td className={`py-2 text-right font-mono ${change > 0 ? 'text-[var(--success)]' : change < 0 ? 'text-[var(--danger)]' : ''}`}>
                          {change > 0 ? '-' : '+'}{isCurrency ? fmtShort(Math.abs(change)) : Math.abs(change).toFixed(row.precision ?? 0)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data quality caveat */}
      {dataQuality && (
        <div className={`card text-sm ${dataQuality === 'Low' ? 'bg-amber-50 border-amber-200' : dataQuality === 'Medium' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex gap-2">
            <span className="font-semibold shrink-0">Data Confidence:</span>
            <span>
              {dataQuality === 'Low' && 'Inputs are based on limited evidence (SME judgment, sparse data). Treat these results as directional, not precise. Ranges may be significantly under- or over-calibrated.'}
              {dataQuality === 'Medium' && 'Inputs draw on some empirical data mixed with expert judgment. Results are useful for prioritization but may shift with better calibration.'}
              {dataQuality === 'High' && 'Inputs are grounded in empirical data (incident history, telemetry, calibrated estimates). Results are suitable for decision-making with normal caveats.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
