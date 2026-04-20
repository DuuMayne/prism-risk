'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid,
} from 'recharts';
import { SimulationResult } from '@/lib/monte-carlo';

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export default function MonteCarloChart({
  result,
  comparisonResult,
  thresholds = [100000, 500000, 1000000],
}: {
  result: SimulationResult;
  comparisonResult?: SimulationResult;
  thresholds?: number[];
}) {
  const histogram = useMemo(() => {
    const allLosses = result.iterations.map((r) => r.annual_loss);
    if (comparisonResult) {
      allLosses.push(...comparisonResult.iterations.map((r) => r.annual_loss));
    }
    const max = Math.max(...allLosses);
    const binCount = 50;
    const binWidth = max / binCount;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: formatCurrency(i * binWidth + binWidth / 2),
      rangeStart: i * binWidth,
      rangeEnd: (i + 1) * binWidth,
      current: 0,
      treated: 0,
    }));

    for (const loss of result.iterations.map((r) => r.annual_loss)) {
      const idx = Math.min(Math.floor(loss / binWidth), binCount - 1);
      bins[idx].current++;
    }

    if (comparisonResult) {
      for (const loss of comparisonResult.iterations.map((r) => r.annual_loss)) {
        const idx = Math.min(Math.floor(loss / binWidth), binCount - 1);
        bins[idx].treated++;
      }
    }

    return bins;
  }, [result, comparisonResult]);

  const activeThresholds = thresholds.filter(
    (t) => t < histogram[histogram.length - 1]?.rangeEnd
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold">Loss Exceedance Distribution</h3>
        <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-400 opacity-70" /> Current State
          </span>
          {comparisonResult && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400 opacity-70" /> Treated State
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--muted)] mb-4">
        Each bar shows how many of 1,000 simulated years produced an annual loss in that range.
        Taller bars to the right mean more exposure to large losses.
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={histogram} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 10 }}
            interval={Math.floor(histogram.length / 6)}
          />
          <YAxis tick={{ fontSize: 11 }} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94a3b8' } }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-[var(--border)] rounded-lg p-2 shadow-lg text-xs">
                  <div className="font-medium mb-1">{label}</div>
                  {payload.map((p) => (
                    <div key={p.dataKey as string} className="flex justify-between gap-4">
                      <span style={{ color: p.color }}>{p.dataKey === 'current' ? 'Current' : 'Treated'}:</span>
                      <span className="font-mono">{p.value} iterations</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="current"
            fill="#3b82f6"
            fillOpacity={0.3}
            stroke="#3b82f6"
            strokeWidth={1.5}
            name="Current"
          />
          {comparisonResult && (
            <Area
              type="monotone"
              dataKey="treated"
              fill="#10b981"
              fillOpacity={0.25}
              stroke="#10b981"
              strokeWidth={1.5}
              name="Treated"
            />
          )}
          {activeThresholds.map((t, i) => {
            const idx = histogram.findIndex((b) => b.rangeEnd >= t);
            if (idx < 0) return null;
            return (
              <ReferenceLine
                key={t}
                x={histogram[idx].range}
                stroke={['#f59e0b', '#ef4444', '#7c3aed'][i]}
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: formatCurrency(t),
                  position: 'top',
                  fontSize: 10,
                  fill: ['#f59e0b', '#ef4444', '#7c3aed'][i],
                }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
