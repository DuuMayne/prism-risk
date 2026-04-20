'use client';

import { useEffect, useState, useMemo } from 'react';
import { Scenario } from '@/lib/types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, PieChart, Pie, Cell, Treemap,
} from 'recharts';

function fmt(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

function fmtShort(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

const DIMENSION_OPTIONS = [
  { key: 'scenario_family', label: 'Scenario Family' },
  { key: 'threat_community', label: 'Threat Community' },
  { key: 'threat_action', label: 'Threat Action' },
  { key: 'loss_event_type', label: 'Loss Event Type' },
  { key: 'treatment_status', label: 'Treatment Status' },
  { key: 'data_quality', label: 'Data Quality' },
  { key: 'owner', label: 'Owner' },
  { key: 'business_process', label: 'Business Process' },
];

const STATUS_COLORS: Record<string, string> = {
  'Identified': '#94a3b8',
  'Assessing': '#3b82f6',
  'Accepted': '#10b981',
  'Mitigating': '#f59e0b',
  'Monitoring': '#8b5cf6',
};

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#e11d48', '#a855f7', '#0ea5e9', '#d946ef',
];

type ViewMode = 'exposure' | 'treatment' | 'heatmap';

export default function PortfolioPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryDimension, setPrimaryDimension] = useState('scenario_family');
  const [secondaryDimension, setSecondaryDimension] = useState('treatment_status');
  const [viewMode, setViewMode] = useState<ViewMode>('exposure');

  useEffect(() => {
    fetch('/api/scenarios').then((r) => r.json()).then((data) => {
      setScenarios(data);
      setLoading(false);
    });
  }, []);

  const quantified = useMemo(() => scenarios.filter((s) => s.ale_ml_bound > 0), [scenarios]);

  // Group by primary dimension
  const groupedData = useMemo(() => {
    const groups: Record<string, { scenarios: Scenario[]; aleMl: number; aleHigh: number; count: number }> = {};
    for (const s of quantified) {
      const key = (s as unknown as Record<string, unknown>)[primaryDimension] as string || 'Unclassified';
      if (!groups[key]) groups[key] = { scenarios: [], aleMl: 0, aleHigh: 0, count: 0 };
      groups[key].scenarios.push(s);
      groups[key].aleMl += s.ale_ml_bound;
      groups[key].aleHigh += s.ale_high_bound;
      groups[key].count++;
    }
    return Object.entries(groups)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.aleMl - a.aleMl);
  }, [quantified, primaryDimension]);

  // Treatment breakdown per primary dimension group
  const treatmentBreakdown = useMemo(() => {
    return groupedData.map((group) => {
      const statusCounts: Record<string, number> = {};
      const statusAle: Record<string, number> = {};
      for (const s of group.scenarios) {
        const status = s.treatment_status || 'Identified';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        statusAle[status] = (statusAle[status] || 0) + s.ale_ml_bound;
      }
      return {
        name: group.name,
        total: group.count,
        totalAle: group.aleMl,
        ...statusCounts,
        ale_Identified: statusAle['Identified'] || 0,
        ale_Assessing: statusAle['Assessing'] || 0,
        ale_Accepted: statusAle['Accepted'] || 0,
        ale_Mitigating: statusAle['Mitigating'] || 0,
        ale_Monitoring: statusAle['Monitoring'] || 0,
      };
    });
  }, [groupedData]);

  // Cross-dimension heatmap data
  const heatmapData = useMemo(() => {
    const matrix: Record<string, Record<string, { count: number; aleMl: number }>> = {};
    const rowKeys = new Set<string>();
    const colKeys = new Set<string>();

    for (const s of quantified) {
      const row = (s as unknown as Record<string, unknown>)[primaryDimension] as string || 'Unclassified';
      const col = (s as unknown as Record<string, unknown>)[secondaryDimension] as string || 'Unclassified';
      rowKeys.add(row);
      colKeys.add(col);
      if (!matrix[row]) matrix[row] = {};
      if (!matrix[row][col]) matrix[row][col] = { count: 0, aleMl: 0 };
      matrix[row][col].count++;
      matrix[row][col].aleMl += s.ale_ml_bound;
    }

    return {
      matrix,
      rows: [...rowKeys].sort(),
      cols: [...colKeys].sort(),
    };
  }, [quantified, primaryDimension, secondaryDimension]);

  // Portfolio-level treatment summary
  const treatmentSummary = useMemo(() => {
    const summary = {
      total: scenarios.length,
      quantified: quantified.length,
      totalAleMl: quantified.reduce((a, s) => a + s.ale_ml_bound, 0),
      byStatus: {} as Record<string, { count: number; aleMl: number }>,
    };
    for (const s of quantified) {
      const status = s.treatment_status || 'Identified';
      if (!summary.byStatus[status]) summary.byStatus[status] = { count: 0, aleMl: 0 };
      summary.byStatus[status].count++;
      summary.byStatus[status].aleMl += s.ale_ml_bound;
    }
    return summary;
  }, [scenarios, quantified]);

  const pieData = useMemo(() => {
    return Object.entries(treatmentSummary.byStatus).map(([status, data]) => ({
      name: status,
      value: data.aleMl,
      count: data.count,
    }));
  }, [treatmentSummary]);

  if (loading) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading portfolio...</div>;
  }

  if (quantified.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Portfolio Analysis</h1>
        <div className="card text-center py-12 text-[var(--muted)]">
          <p>No quantified scenarios to analyze. Add scenarios with quantification inputs to see portfolio comparisons.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Analysis</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Compare risk exposure across classification dimensions and treatment coverage</p>
      </div>

      {/* Portfolio treatment summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <h3 className="text-sm font-semibold mb-3">Treatment Coverage by ALE</h3>
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || PALETTE[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmtShort(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {pieData.map((entry) => {
                const pct = (entry.value / treatmentSummary.totalAleMl * 100).toFixed(0);
                return (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: STATUS_COLORS[entry.name] || '#94a3b8' }} />
                      <span>{entry.name}</span>
                      <span className="text-xs text-[var(--muted)]">({entry.count} scenarios)</span>
                    </div>
                    <div className="font-mono text-right">
                      <span>{fmtShort(entry.value)}</span>
                      <span className="text-xs text-[var(--muted)] ml-2">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Coverage Gaps</h3>
          <div className="space-y-3">
            {(() => {
              const untreated = (treatmentSummary.byStatus['Identified']?.aleMl || 0) +
                               (treatmentSummary.byStatus['Assessing']?.aleMl || 0);
              const untreatedPct = treatmentSummary.totalAleMl > 0 ? (untreated / treatmentSummary.totalAleMl * 100) : 0;
              const treated = (treatmentSummary.byStatus['Mitigating']?.aleMl || 0) +
                             (treatmentSummary.byStatus['Monitoring']?.aleMl || 0) +
                             (treatmentSummary.byStatus['Accepted']?.aleMl || 0);
              const treatedPct = treatmentSummary.totalAleMl > 0 ? (treated / treatmentSummary.totalAleMl * 100) : 0;
              return (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Unaddressed exposure</span>
                      <span className="font-semibold text-[var(--danger)]">{fmtShort(untreated)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-red-400 h-2 rounded-full" style={{ width: `${untreatedPct}%` }} />
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-0.5">{untreatedPct.toFixed(0)}% of portfolio ALE</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Addressed / accepted</span>
                      <span className="font-semibold text-[var(--success)]">{fmtShort(treated)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${treatedPct}%` }} />
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-0.5">{treatedPct.toFixed(0)}% of portfolio ALE</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* View controls */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Primary Dimension</label>
            <select className="input w-auto" value={primaryDimension}
              onChange={(e) => setPrimaryDimension(e.target.value)}>
              {DIMENSION_OPTIONS.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
          {viewMode === 'heatmap' && (
            <div>
              <label className="label">Secondary Dimension</label>
              <select className="input w-auto" value={secondaryDimension}
                onChange={(e) => setSecondaryDimension(e.target.value)}>
                {DIMENSION_OPTIONS.filter((d) => d.key !== primaryDimension).map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-1">
            {([
              { key: 'exposure' as const, label: 'Exposure' },
              { key: 'treatment' as const, label: 'Treatment Status' },
              { key: 'heatmap' as const, label: 'Cross-Dimension' },
            ]).map((v) => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className={`btn text-sm ${viewMode === v.key ? 'btn-primary' : 'btn-secondary'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============ EXPOSURE VIEW ============ */}
      {viewMode === 'exposure' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold mb-4">
              Annualized Loss Exposure by {DIMENSION_OPTIONS.find((d) => d.key === primaryDimension)?.label}
            </h3>
            <ResponsiveContainer width="100%" height={Math.max(250, groupedData.length * 45)}>
              <BarChart data={groupedData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 160 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => fmtShort(v)} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={155} />
                <Tooltip
                  formatter={(v) => fmt(Number(v))}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Bar dataKey="aleMl" name="ALE Most Likely" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="aleHigh" name="ALE High Bound" fill="#fee2e2" stroke="#ef4444" strokeWidth={1} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary table */}
          <div className="card p-0 overflow-hidden">
            <table>
              <thead>
                <tr>
                  <th>{DIMENSION_OPTIONS.find((d) => d.key === primaryDimension)?.label}</th>
                  <th className="text-right">Scenarios</th>
                  <th className="text-right">ALE (Most Likely)</th>
                  <th className="text-right">ALE (High)</th>
                  <th className="text-right">% of Portfolio</th>
                </tr>
              </thead>
              <tbody>
                {groupedData.map((g) => {
                  const pct = treatmentSummary.totalAleMl > 0
                    ? (g.aleMl / treatmentSummary.totalAleMl * 100).toFixed(1)
                    : '0';
                  return (
                    <tr key={g.name}>
                      <td className="font-medium">{g.name}</td>
                      <td className="text-right">{g.count}</td>
                      <td className="text-right font-mono">{fmtShort(g.aleMl)}</td>
                      <td className="text-right font-mono text-[var(--danger)]">{fmtShort(g.aleHigh)}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ TREATMENT VIEW ============ */}
      {viewMode === 'treatment' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold mb-4">
              Treatment Status Distribution by {DIMENSION_OPTIONS.find((d) => d.key === primaryDimension)?.label}
            </h3>
            <ResponsiveContainer width="100%" height={Math.max(250, treatmentBreakdown.length * 45)}>
              <BarChart data={treatmentBreakdown} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 160 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => fmtShort(v)} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={155} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend />
                <Bar dataKey="ale_Identified" name="Identified" stackId="a" fill={STATUS_COLORS['Identified']} />
                <Bar dataKey="ale_Assessing" name="Assessing" stackId="a" fill={STATUS_COLORS['Assessing']} />
                <Bar dataKey="ale_Mitigating" name="Mitigating" stackId="a" fill={STATUS_COLORS['Mitigating']} />
                <Bar dataKey="ale_Monitoring" name="Monitoring" stackId="a" fill={STATUS_COLORS['Monitoring']} />
                <Bar dataKey="ale_Accepted" name="Accepted" stackId="a" fill={STATUS_COLORS['Accepted']} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Treatment gap analysis */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Treatment Gap Analysis</h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Identifies which groups have the most unaddressed exposure (Identified + Assessing status).
            </p>
            <div className="space-y-3">
              {groupedData.map((group) => {
                const unaddressed = group.scenarios
                  .filter((s) => s.treatment_status === 'Identified' || s.treatment_status === 'Assessing')
                  .reduce((a, s) => a + s.ale_ml_bound, 0);
                const addressed = group.aleMl - unaddressed;
                const unaddressedPct = group.aleMl > 0 ? (unaddressed / group.aleMl * 100) : 0;
                return (
                  <div key={group.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{group.name}</span>
                      <span className="text-xs text-[var(--muted)]">
                        {fmtShort(unaddressed)} unaddressed / {fmtShort(group.aleMl)} total
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 flex overflow-hidden">
                      <div className="bg-emerald-400 h-3" style={{ width: `${100 - unaddressedPct}%` }} />
                      <div className="bg-red-300 h-3" style={{ width: `${unaddressedPct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--muted)] mt-0.5">
                      <span>{(100 - unaddressedPct).toFixed(0)}% addressed</span>
                      <span>{unaddressedPct.toFixed(0)}% unaddressed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ HEATMAP VIEW ============ */}
      {viewMode === 'heatmap' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold mb-1">
              Cross-Dimension Risk Concentration
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Shows where risk concentrates at the intersection of two classification dimensions.
              Darker cells indicate higher aggregate ALE exposure.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left p-2 min-w-[140px]">
                      {DIMENSION_OPTIONS.find((d) => d.key === primaryDimension)?.label} ↓ / {DIMENSION_OPTIONS.find((d) => d.key === secondaryDimension)?.label} →
                    </th>
                    {heatmapData.cols.map((col) => (
                      <th key={col} className="p-2 text-center min-w-[80px] max-w-[120px] truncate" title={col}>
                        {col.length > 15 ? col.slice(0, 13) + '...' : col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.rows.map((row) => (
                    <tr key={row}>
                      <td className="p-2 font-medium truncate max-w-[160px]" title={row}>{row}</td>
                      {heatmapData.cols.map((col) => {
                        const cell = heatmapData.matrix[row]?.[col];
                        if (!cell) {
                          return <td key={col} className="p-2 text-center bg-gray-50 text-[var(--muted)]">—</td>;
                        }
                        const maxAle = Math.max(...Object.values(heatmapData.matrix).flatMap((r) =>
                          Object.values(r).map((c) => c.aleMl)
                        ));
                        const intensity = maxAle > 0 ? cell.aleMl / maxAle : 0;
                        const bgColor = intensity > 0.7 ? 'bg-red-200' :
                                       intensity > 0.4 ? 'bg-amber-100' :
                                       intensity > 0.1 ? 'bg-blue-50' : 'bg-gray-50';
                        return (
                          <td key={col} className={`p-2 text-center ${bgColor} border border-white rounded`}>
                            <div className="font-mono font-medium">{fmtShort(cell.aleMl)}</div>
                            <div className="text-[var(--muted)]">{cell.count} scn</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-2">Reading This View</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Cell Color Intensity</p>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-4 rounded bg-gray-50 border border-gray-200" />
                  <span className="text-xs">Low exposure</span>
                  <span className="w-6 h-4 rounded bg-blue-50 border border-blue-100" />
                  <span className="w-6 h-4 rounded bg-amber-100 border border-amber-200" />
                  <span className="w-6 h-4 rounded bg-red-200 border border-red-300" />
                  <span className="text-xs">High exposure</span>
                </div>
              </div>
              <div>
                <p className="font-medium mb-1">What to Look For</p>
                <ul className="text-xs text-[var(--muted)] space-y-1">
                  <li>Clusters of dark cells = concentrated exposure</li>
                  <li>Empty columns = threat types not yet modeled</li>
                  <li>Compare with Treatment Status view to find unaddressed hotspots</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
