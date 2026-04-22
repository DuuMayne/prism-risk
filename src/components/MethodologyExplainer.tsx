'use client';

import { useState } from 'react';

export default function MethodologyExplainer({ mode }: { mode: 'simulation' | 'treatment' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card bg-gray-50 border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-sm font-semibold">How to read these results</h3>
        <span className="text-xs text-[var(--accent)]">{expanded ? 'Collapse' : 'Expand'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 text-sm leading-relaxed">
          {/* Core methodology */}
          <div>
            <h4 className="font-semibold mb-1">What the simulation does</h4>
            <p>
              The simulation runs 1,000 &quot;hypothetical years&quot; for this risk scenario. In each year it randomly
              samples from your input ranges to answer four questions:
            </p>
            <ol className="list-decimal ml-5 mt-2 space-y-1.5">
              <li>
                <span className="font-medium">How often does the threat show up?</span>{' '}
                <span className="text-[var(--muted)]">
                  (Threat Event Frequency &mdash; sampled from your low/likely/high estimate)
                </span>
              </li>
              <li>
                <span className="font-medium">What fraction of those attempts succeed?</span>{' '}
                <span className="text-[var(--muted)]">
                  (Vulnerability &mdash; reflects how well current controls hold up)
                </span>
              </li>
              <li>
                <span className="font-medium">How much does each successful attack cost directly?</span>{' '}
                <span className="text-[var(--muted)]">
                  (Primary Loss &mdash; response, recovery, downtime)
                </span>
              </li>
              <li>
                <span className="font-medium">Do downstream costs materialize?</span>{' '}
                <span className="text-[var(--muted)]">
                  (Secondary Loss &mdash; regulatory fines, lawsuits, reputation damage; triggered probabilistically)
                </span>
              </li>
            </ol>
            <p className="mt-2">
              For each simulated year: <span className="font-mono text-xs bg-gray-200 rounded px-1.5 py-0.5">Annual Loss = (TEF &times; Vulnerability) &times; (Primary Loss + Secondary Loss)</span>.
              The first product gives the number of actual loss events; the second gives how much each one costs.
            </p>
          </div>

          {/* Why not a single number */}
          <div>
            <h4 className="font-semibold mb-1">Why a distribution instead of a single number</h4>
            <p>
              A single &quot;expected loss&quot; hides the spread of outcomes. The simulation produces a full range &mdash;
              from quiet years with little or no loss to bad years where multiple events compound with secondary impacts.
              The <span className="font-medium">mean</span> (average) captures the long-run expectation, but the{' '}
              <span className="font-medium">P90</span> and <span className="font-medium">P95</span> tell you how bad it
              gets in the unluckiest 10% or 5% of years. Risk decisions often hinge on these tail values, not the average.
            </p>
          </div>

          {/* Key metrics */}
          <div>
            <h4 className="font-semibold mb-1">Key metrics explained</h4>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Mean Annual Loss</dt>
                <dd className="text-[var(--muted)]">
                  Average across all 1,000 simulated years. Think of this as &quot;if we ran this risk for 1,000 years,
                  what would we pay per year on average?&quot; Useful for budgeting and ROI calculations.
                </dd>
              </div>
              <div>
                <dt className="font-medium">Median Annual Loss</dt>
                <dd className="text-[var(--muted)]">
                  The midpoint &mdash; half of simulated years fall below this, half above. When the median is much lower
                  than the mean, it means a few very expensive years are pulling the average up. The median better
                  represents &quot;what a typical year actually looks like.&quot;
                </dd>
              </div>
              <div>
                <dt className="font-medium">P90 / P95 Annual Loss</dt>
                <dd className="text-[var(--muted)]">
                  The 90th and 95th percentile &mdash; &quot;in 90% (or 95%) of simulated years, losses stayed below this
                  amount.&quot; These capture tail risk: the realistic worst-case range. P95 is a common benchmark for
                  insurance and capital reserve decisions.
                </dd>
              </div>
              <div>
                <dt className="font-medium">Threshold Exceedance Probabilities</dt>
                <dd className="text-[var(--muted)]">
                  &quot;What percentage of simulated years exceeded $100K / $500K / $1M?&quot; These map directly to
                  risk appetite statements &mdash; e.g., &quot;we are comfortable if there is less than a 10% chance of
                  exceeding $1M in any year.&quot;
                </dd>
              </div>
              <div>
                <dt className="font-medium">Mean Loss Events/Year</dt>
                <dd className="text-[var(--muted)]">
                  Average number of times a threat actually succeeds per year (TEF &times; Vulnerability, averaged across
                  simulations). This separates &quot;how often bad things happen&quot; from &quot;how much they cost when
                  they do.&quot;
                </dd>
              </div>
            </dl>
          </div>

          {mode === 'treatment' && (
            <div>
              <h4 className="font-semibold mb-1">How treatment comparison works</h4>
              <p>
                We run the full 1,000-iteration simulation twice: once with your current inputs and once with inputs
                reduced by the treatment&apos;s claimed effect. A treatment with &quot;30% TEF reduction&quot; scales
                your entire threat frequency range down by 30% &mdash; fewer threat events per year. A &quot;20%
                vulnerability reduction&quot; means 20% fewer of those events succeed.
              </p>
              <p className="mt-2">
                The comparison then shows how the output distribution shifts. Key things to look for:
              </p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>
                  <span className="font-medium">Does the mean drop meaningfully?</span> That&apos;s the long-run savings.
                  Compare it against treatment cost for ROI.
                </li>
                <li>
                  <span className="font-medium">Does P95 drop?</span> If the mean improves but P95 barely moves, the
                  treatment helps in normal years but doesn&apos;t protect against worst-case scenarios.
                </li>
                <li>
                  <span className="font-medium">Do threshold probabilities change?</span> Dropping from &quot;25%
                  chance of exceeding $1M&quot; to &quot;8%&quot; may matter more than the dollar reduction alone.
                </li>
              </ul>
            </div>
          )}

          {/* Natural variation caveat */}
          <div className="text-xs text-[var(--muted)] border-t border-gray-200 pt-3">
            Because each run uses fresh random samples, results will vary slightly between runs.
            This is expected &mdash; it reflects genuine uncertainty in the inputs. If results
            swing dramatically between runs, your input ranges may be very wide, which itself is
            a finding worth noting.
          </div>
        </div>
      )}
    </div>
  );
}
