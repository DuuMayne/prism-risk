'use client';

import { SimulationSummary } from '@/lib/monte-carlo';
import { Scenario, Treatment } from '@/lib/types';

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

interface Props {
  scenario: Scenario;
  currentSummary?: SimulationSummary;
  treatedSummary?: SimulationSummary;
  treatment?: Treatment;
}

function getRiskPosture(summary: SimulationSummary, dataQuality: string) {
  const p95 = summary.p95_annual_loss;
  const probHigh = summary.prob_above_thresholds[2]?.probability ?? 0; // > $1M
  const probMid = summary.prob_above_thresholds[1]?.probability ?? 0;  // > $500K

  if (p95 >= 5_000_000 || probHigh > 0.3) {
    return {
      level: 'critical' as const,
      signal: 'Severe tail risk',
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
      posture: 'Escalate to leadership. Consider funded treatment, risk transfer (insurance), or explicit executive acceptance this cycle.',
      question: 'Can we fund a treatment to materially reduce the P95 exposure, transfer part of the tail via insurance, or do we formally accept this level of exposure?',
    };
  }
  if (p95 >= 2_000_000 || probMid > 0.5) {
    return {
      level: 'elevated' as const,
      signal: 'Elevated exposure',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      posture: 'Prioritize for treatment evaluation. Identify controls that target the dominant loss driver (frequency, vulnerability, or magnitude).',
      question: 'Which treatment option offers the best reduction in expected loss relative to cost, and should we act this cycle or next?',
    };
  }
  if (p95 >= 500_000 || probMid > 0.1) {
    return {
      level: 'moderate' as const,
      signal: 'Moderate exposure',
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      posture: 'Monitor and reassess. Current controls may be adequate, but watch for changes in threat landscape or control effectiveness.',
      question: 'Are existing controls performing as assumed? Has the threat environment changed since last assessment?',
    };
  }
  return {
    level: 'low' as const,
    signal: 'Lower modeled baseline',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    posture: 'Accept with normal monitoring cadence. Existing controls appear sufficient for current exposure.',
    question: 'Is the current review cadence appropriate, or can we extend it to free capacity for higher-priority scenarios?',
  };
}

function getTreatmentAssessment(
  current: SimulationSummary,
  treated: SimulationSummary,
  treatment: Treatment,
) {
  const meanReduction = current.mean_annual_loss - treated.mean_annual_loss;
  const p95Reduction = current.p95_annual_loss - treated.p95_annual_loss;
  const medianReduction = current.median_annual_loss - treated.median_annual_loss;
  const cost = treatment.treatment_cost;
  const paybackYears = cost > 0 && meanReduction > 0 ? cost / meanReduction : null;

  const findings: { type: 'positive' | 'caution' | 'negative'; text: string }[] = [];

  // Mean loss reduction
  if (meanReduction > 0) {
    const pctReduction = meanReduction / current.mean_annual_loss;
    findings.push({
      type: 'positive',
      text: `Expected annual loss drops by ${fmtShort(meanReduction)}/year (${pct(pctReduction)} reduction). ${
        paybackYears !== null
          ? paybackYears < 1 ? `Treatment pays for itself in under a year.`
            : paybackYears < 3 ? `Treatment cost recovers in ~${paybackYears.toFixed(1)} years.`
            : `Treatment cost takes ~${paybackYears.toFixed(1)} years to recover from loss reduction alone.`
          : ''
      }`,
    });
  } else {
    findings.push({
      type: 'negative',
      text: `Treatment does not reduce expected annual loss. Verify that the reduction percentages are applied to the correct FAIR factors.`,
    });
  }

  // Tail risk
  if (p95Reduction > 0) {
    const tailPctReduction = p95Reduction / current.p95_annual_loss;
    findings.push({
      type: tailPctReduction > 0.2 ? 'positive' : 'caution',
      text: `P95 (worst-case) drops by ${fmtShort(p95Reduction)} (${pct(tailPctReduction)}). ${
        tailPctReduction < 0.15
          ? 'Tail risk remains largely intact -- this treatment primarily helps the average case, not worst-case scenarios.'
          : 'This meaningfully reduces worst-case exposure.'
      }`,
    });
  } else {
    findings.push({
      type: 'negative',
      text: `P95 exposure does not improve. Tail risk remains at ${fmt(treated.p95_annual_loss)}. Consider whether additional or different controls are needed for catastrophic scenarios.`,
    });
  }

  // Threshold probabilities
  const currentProbHigh = current.prob_above_thresholds[2]?.probability ?? 0;
  const treatedProbHigh = treated.prob_above_thresholds[2]?.probability ?? 0;
  if (currentProbHigh > 0.1) {
    const probDrop = currentProbHigh - treatedProbHigh;
    if (probDrop > 0.05) {
      findings.push({
        type: 'positive',
        text: `Probability of exceeding $1M drops from ${pct(currentProbHigh)} to ${pct(treatedProbHigh)}.`,
      });
    } else {
      findings.push({
        type: 'caution',
        text: `Probability of exceeding $1M barely changes (${pct(currentProbHigh)} to ${pct(treatedProbHigh)}). The treatment may not address the drivers of large losses.`,
      });
    }
  }

  // Median vs mean skew
  if (medianReduction > 0 && meanReduction > 0) {
    const medianPct = medianReduction / current.median_annual_loss;
    const meanPct = meanReduction / current.mean_annual_loss;
    if (meanPct > medianPct * 1.5) {
      findings.push({
        type: 'caution',
        text: `The mean improves more than the median, suggesting the treatment mainly helps in higher-loss scenarios rather than the typical year.`,
      });
    }
  }

  // Cost-benefit
  if (cost > 0 && paybackYears !== null && paybackYears > 5) {
    findings.push({
      type: 'caution',
      text: `At ${fmt(cost)}, the treatment takes over 5 years to pay back through loss reduction alone. Consider whether non-financial benefits (compliance, reputation, audit posture) justify the investment.`,
    });
  }

  // Residual risk
  const treatedPosture = getRiskPosture(treated, 'Medium');
  findings.push({
    type: treatedPosture.level === 'critical' ? 'negative' :
          treatedPosture.level === 'elevated' ? 'caution' : 'positive',
    text: `After treatment, residual risk is "${treatedPosture.signal}". ${
      treatedPosture.level === 'critical' || treatedPosture.level === 'elevated'
        ? 'Residual risk remains material -- consider additional controls, risk transfer, or layered treatment.'
        : 'Residual risk reaches an acceptable baseline.'
    }`,
  });

  // Net value
  const netYear1 = meanReduction - cost;

  return { findings, meanReduction, p95Reduction, paybackYears, netYear1 };
}

export default function DecisionFraming({ scenario, currentSummary, treatedSummary, treatment }: Props) {
  // Deterministic-only framing (no Monte Carlo)
  if (!currentSummary) {
    const aleMl = scenario.ale_ml_bound;
    const aleHigh = scenario.ale_high_bound;
    return (
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold mb-3">Decision Framing (Deterministic)</h3>
        <p className="text-sm mb-3">
          Based on point estimates, this scenario has an expected annualized loss of <span className="font-semibold">{fmt(aleMl)}</span> at
          the most-likely bound, with a high bound of <span className="font-semibold text-[var(--danger)]">{fmt(aleHigh)}</span>.
        </p>
        <p className="text-sm text-[var(--muted)]">
          Run Monte Carlo simulation for a more complete picture with probability distributions, percentile analysis, and threshold exceedance.
        </p>
      </div>
    );
  }

  const posture = getRiskPosture(currentSummary, scenario.data_quality);
  const hasTreatment = treatedSummary && treatment;
  const assessment = hasTreatment
    ? getTreatmentAssessment(currentSummary, treatedSummary, treatment)
    : null;

  return (
    <div className="space-y-4">
      {/* Risk posture */}
      <div className={`card ${posture.bg}`}>
        <div className="flex items-start gap-3">
          <div className={`text-2xl font-bold ${posture.color} shrink-0 mt-0.5`}>
            {posture.level === 'critical' ? '!!' :
             posture.level === 'elevated' ? '!' :
             posture.level === 'moderate' ? '--' : ''}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-base font-semibold ${posture.color}`}>{posture.signal}</h3>
            </div>
            <p className="text-sm mb-2">{posture.posture}</p>
            <div className="text-sm">
              <span className="font-medium">Leadership question: </span>
              <span className="italic">{posture.question}</span>
            </div>
          </div>
        </div>
      </div>

      {/* What the numbers mean */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-2">What these results tell us</h3>
        <ul className="space-y-2 text-sm">
          <li>
            In a <span className="font-medium">typical year</span>, this scenario costs around <span className="font-semibold">{fmtShort(currentSummary.median_annual_loss)}</span> (median).
            The average is pulled to <span className="font-semibold">{fmtShort(currentSummary.mean_annual_loss)}</span> by
            occasional high-impact events.
          </li>
          <li>
            There is a <span className="font-semibold">{pct(currentSummary.prob_above_thresholds[0]?.probability ?? 0)}</span> chance
            of exceeding {fmtShort(currentSummary.prob_above_thresholds[0]?.threshold ?? 0)} in any given year,
            and a <span className="font-semibold">{pct(currentSummary.prob_above_thresholds[2]?.probability ?? 0)}</span> chance
            of exceeding {fmtShort(currentSummary.prob_above_thresholds[2]?.threshold ?? 0)}.
          </li>
          <li>
            On average, <span className="font-semibold">{currentSummary.mean_lef.toFixed(1)}</span> loss events
            occur per year, each costing around <span className="font-semibold">{fmtShort(currentSummary.mean_total_loss)}</span>.
            {currentSummary.mean_secondary_loss_when_triggered > 0 && (
              <> When secondary impacts trigger (legal, regulatory, reputational), they add an
                average of <span className="font-semibold">{fmtShort(currentSummary.mean_secondary_loss_when_triggered)}</span> per event.</>
            )}
          </li>
        </ul>
      </div>

      {/* Treatment assessment */}
      {hasTreatment && assessment && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-1">
            Treatment Assessment: &quot;{treatment.treatment_name}&quot;
          </h3>
          {treatment.treatment_cost > 0 && (
            <p className="text-xs text-[var(--muted)] mb-3">
              Investment: {fmt(treatment.treatment_cost)} | Confidence: {treatment.implementation_confidence}
            </p>
          )}

          {/* Summary numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gray-50 text-center">
              <div className="text-xs text-[var(--muted)]">Mean Loss Reduction</div>
              <div className={`text-lg font-bold ${assessment.meanReduction > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {assessment.meanReduction > 0 ? '-' : '+'}{fmtShort(Math.abs(assessment.meanReduction))}
              </div>
              <div className="text-xs text-[var(--muted)]">per year</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 text-center">
              <div className="text-xs text-[var(--muted)]">P95 Reduction</div>
              <div className={`text-lg font-bold ${assessment.p95Reduction > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {assessment.p95Reduction > 0 ? '-' : '+'}{fmtShort(Math.abs(assessment.p95Reduction))}
              </div>
              <div className="text-xs text-[var(--muted)]">worst-case</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 text-center">
              <div className="text-xs text-[var(--muted)]">Net Value (Year 1)</div>
              <div className={`text-lg font-bold ${assessment.netYear1 > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {assessment.netYear1 >= 0 ? '+' : ''}{fmtShort(assessment.netYear1)}
              </div>
              <div className="text-xs text-[var(--muted)]">savings - cost</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 text-center">
              <div className="text-xs text-[var(--muted)]">Payback Period</div>
              <div className="text-lg font-bold">
                {assessment.paybackYears !== null
                  ? assessment.paybackYears < 1 ? '<1 yr' : `${assessment.paybackYears.toFixed(1)} yr`
                  : 'N/A'}
              </div>
              <div className="text-xs text-[var(--muted)]">to recover cost</div>
            </div>
          </div>

          {/* Findings */}
          <div className="space-y-2">
            {assessment.findings.map((f, i) => (
              <div key={i} className={`flex gap-2 text-sm p-2 rounded ${
                f.type === 'positive' ? 'bg-emerald-50' :
                f.type === 'caution' ? 'bg-amber-50' : 'bg-red-50'
              }`}>
                <span className="shrink-0 mt-0.5">
                  {f.type === 'positive' ? '+' : f.type === 'caution' ? '~' : '-'}
                </span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
