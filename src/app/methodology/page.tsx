export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Methodology</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          How PRISM quantifies risk, runs simulations, and evaluates treatments.
        </p>
      </div>

      {/* FAIR Overview */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">The FAIR Model</h2>
        <p className="text-sm leading-relaxed">
          PRISM uses the{' '}
          <span className="font-semibold">Factor Analysis of Information Risk (FAIR)</span>{' '}
          framework to decompose risk into measurable components. Instead of qualitative labels
          (high/medium/low), FAIR expresses risk as a financial quantity: how much loss a scenario
          is likely to produce over a given period.
        </p>
        <p className="text-sm leading-relaxed">
          The core equation is:
        </p>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-center">
          Annual Loss Exposure (ALE) = Loss Event Frequency (LEF) &times; Loss Magnitude (LM)
        </div>
        <p className="text-sm leading-relaxed">
          Each of these factors decomposes further:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">Factor</th>
                <th className="text-left py-2">Definition</th>
                <th className="text-left py-2">Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="py-2 font-medium">Threat Event Frequency (TEF)</td>
                <td className="py-2">How often a threat agent acts against the asset per year</td>
                <td className="py-2 text-[var(--muted)]">Events / year</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Vulnerability (Vuln)</td>
                <td className="py-2">
                  Probability that a threat event results in an actual loss event, given existing controls.
                  A vulnerability of 0.3 means 30% of threat events succeed.
                </td>
                <td className="py-2 text-[var(--muted)]">Probability (0&ndash;1)</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Loss Event Frequency (LEF)</td>
                <td className="py-2">TEF &times; Vulnerability. The expected number of actual loss events per year.</td>
                <td className="py-2 text-[var(--muted)]">Events / year</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Primary Loss</td>
                <td className="py-2">
                  Direct cost of responding to and recovering from a loss event &mdash; incident response,
                  system restoration, operational downtime.
                </td>
                <td className="py-2 text-[var(--muted)]">USD / event</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Secondary Event Probability</td>
                <td className="py-2">
                  Likelihood that a loss event triggers downstream consequences
                  (regulatory action, litigation, reputational harm). Not every incident escalates.
                </td>
                <td className="py-2 text-[var(--muted)]">Probability (0&ndash;1)</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Secondary Loss</td>
                <td className="py-2">
                  Cost of downstream consequences when they do materialize &mdash; fines,
                  legal fees, customer churn, brand damage.
                </td>
                <td className="py-2 text-[var(--muted)]">USD / event</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Inputs */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">How Inputs Are Specified</h2>
        <p className="text-sm leading-relaxed">
          Each quantitative factor (TEF, Vulnerability, Primary Loss, Secondary Loss) is specified
          as a <span className="font-semibold">three-point estimate</span>:
        </p>
        <ul className="list-disc ml-5 text-sm space-y-1.5">
          <li>
            <span className="font-medium">Low</span> &mdash; the minimum plausible value.
            &quot;It&apos;s very unlikely to be less than this.&quot;
          </li>
          <li>
            <span className="font-medium">Most Likely</span> &mdash; your best single-point estimate.
            If you had to pick one number, this is it.
          </li>
          <li>
            <span className="font-medium">High</span> &mdash; the maximum plausible value.
            &quot;It&apos;s very unlikely to be more than this.&quot;
          </li>
        </ul>
        <p className="text-sm leading-relaxed">
          These three values define a{' '}
          <span className="font-semibold">triangular distribution</span> &mdash; a probability
          shape that peaks at the most likely value and tapers toward the low and high bounds.
          Triangular distributions are standard in FAIR because they map directly to how subject
          matter experts express uncertainty (&quot;between X and Y, probably around Z&quot;) without
          requiring statistical fitting.
        </p>
        <p className="text-sm leading-relaxed">
          Secondary Event Probability is a single value (not a range) because it represents a
          binary outcome: after a loss event occurs, do downstream consequences materialize or not?
        </p>
      </section>

      {/* Monte Carlo */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Monte Carlo Simulation</h2>
        <p className="text-sm leading-relaxed">
          Rather than calculating a single expected loss, PRISM runs{' '}
          <span className="font-semibold">1,000 simulated years</span> to produce a full
          distribution of possible outcomes. Each iteration works as follows:
        </p>
        <ol className="list-decimal ml-5 text-sm space-y-2">
          <li>
            <span className="font-medium">Sample TEF</span> from its triangular distribution.
            This gives one possible value for how many threat events occur this year.
          </li>
          <li>
            <span className="font-medium">Sample Vulnerability</span> from its triangular distribution.
            This gives how likely each threat event is to succeed. Clamped to [0, 1].
          </li>
          <li>
            <span className="font-medium">Compute LEF = TEF &times; Vulnerability.</span>{' '}
            This is the expected number of actual loss events this year. For example, 10 threat
            events &times; 0.3 vulnerability = 3 loss events.
          </li>
          <li>
            <span className="font-medium">Sample Primary Loss</span> from its triangular distribution.
            This is how much one loss event costs directly.
          </li>
          <li>
            <span className="font-medium">Flip a coin for secondary losses.</span>{' '}
            With probability equal to Secondary Event Probability, downstream costs are triggered.
            If triggered, sample their magnitude from the secondary loss distribution. Otherwise, secondary loss is $0.
          </li>
          <li>
            <span className="font-medium">Compute total loss per event</span> = Primary Loss + Secondary Loss (if triggered).
          </li>
          <li>
            <span className="font-medium">Compute annual loss</span> = LEF &times; total loss per event.
          </li>
        </ol>
        <p className="text-sm leading-relaxed">
          After 1,000 iterations, we have 1,000 possible annual loss values. These are sorted
          and analyzed to produce the summary statistics.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
          <h3 className="font-semibold">Modeling simplification</h3>
          <p>
            Each iteration samples <em>one</em> loss magnitude and multiplies it by LEF (a continuous value).
            A higher-fidelity approach would draw an integer number of events from a Poisson distribution
            and sample a separate loss for each. The simplified approach produces the same expected value
            but slightly underestimates variance when LEF is large (many events per year). For most
            information security scenarios where LEF is low-to-moderate, the difference is negligible.
          </p>
        </div>
      </section>

      {/* Output metrics */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Output Metrics</h2>

        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold">Mean Annual Loss</h3>
            <p className="text-[var(--muted)]">
              The arithmetic average across all 1,000 simulated years. This is the best metric for
              long-run budgeting (&quot;what should we expect to spend per year on this risk over
              time?&quot;) and for ROI calculations on treatments. It is pulled upward by expensive
              tail events, so it may exceed what a &quot;normal&quot; year actually costs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Median Annual Loss</h3>
            <p className="text-[var(--muted)]">
              The 50th percentile &mdash; half of simulated years fall below this value. This
              better represents what a typical year looks like. When the median is much lower
              than the mean, the distribution is right-skewed: most years are relatively cheap,
              but a minority of expensive years drag the average up.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">P90 and P95 Annual Loss</h3>
            <p className="text-[var(--muted)]">
              The 90th and 95th percentiles. &quot;In 90% (or 95%) of simulated years, losses stayed
              below this amount.&quot; These capture tail risk &mdash; the realistic worst-case range.
              P95 is commonly used for worst-case planning, insurance sizing, and capital reserve
              decisions. The gap between P90 and P95 indicates how steeply losses escalate in the
              worst scenarios.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Threshold Exceedance Probabilities</h3>
            <p className="text-[var(--muted)]">
              The percentage of simulated years where annual loss exceeded $100K, $500K, and $1M
              (configurable thresholds). These map directly to organizational risk appetite
              statements &mdash; e.g., &quot;we accept this risk if there is less than a 10% chance
              of exceeding $1M in any year.&quot;
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Mean Loss Events/Year</h3>
            <p className="text-[var(--muted)]">
              The average LEF across all iterations. Separates frequency from magnitude. If this
              number is high, controls that reduce how often attacks succeed (TEF or Vulnerability
              reduction) will have the most impact. If this number is low but losses are still high,
              the problem is magnitude per event.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Mean Loss per Event</h3>
            <p className="text-[var(--muted)]">
              Average total cost (primary + secondary) when a loss event occurs. Helps identify
              whether the risk is primarily a frequency problem or a magnitude problem.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Mean Secondary Loss (when triggered)</h3>
            <p className="text-[var(--muted)]">
              Average downstream cost specifically in iterations where secondary losses materialized.
              Shows the cost of escalation. If this is high relative to primary loss, preventing
              or containing secondary impacts (legal preparation, communication plans, insurance)
              may be the highest-leverage intervention.
            </p>
          </div>
        </div>
      </section>

      {/* Treatment comparison */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Treatment Comparison</h2>
        <p className="text-sm leading-relaxed">
          To evaluate a treatment (control, process change, insurance, etc.), PRISM runs the
          simulation twice:
        </p>
        <ol className="list-decimal ml-5 text-sm space-y-1.5">
          <li>Once with the <span className="font-medium">current inputs</span> (baseline risk).</li>
          <li>
            Once with <span className="font-medium">inputs reduced by the treatment&apos;s claimed effect</span>.
          </li>
        </ol>
        <p className="text-sm leading-relaxed">
          Treatment effects are specified as reduction percentages on each FAIR factor:
        </p>
        <ul className="list-disc ml-5 text-sm space-y-1.5">
          <li>
            <span className="font-medium">TEF Reduction</span> &mdash; decreases how often threats appear.
            A 30% reduction scales all three TEF bounds (low, most likely, high) to 70% of their original values.
          </li>
          <li>
            <span className="font-medium">Vulnerability Reduction</span> &mdash; decreases how often threats succeed.
            Reflects controls that block or detect attacks.
          </li>
          <li>
            <span className="font-medium">Primary Loss Reduction</span> &mdash; decreases direct event cost.
            Reflects containment, backup, or response improvements.
          </li>
          <li>
            <span className="font-medium">Secondary Probability Reduction</span> &mdash; decreases the chance
            of downstream escalation.
          </li>
          <li>
            <span className="font-medium">Secondary Loss Reduction</span> &mdash; decreases the cost of
            downstream impacts when they do occur.
          </li>
        </ul>
        <p className="text-sm leading-relaxed">
          Each reduction scales the <em>entire</em> input distribution proportionally (all three bounds
          move together). This shifts the distribution without changing its shape &mdash; equivalent to
          saying &quot;this treatment makes everything X% better across the board.&quot;
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
          <h3 className="font-semibold">Key comparison metrics</h3>
          <ul className="list-disc ml-5 space-y-1.5">
            <li>
              <span className="font-medium">Mean Loss Reduction</span> &mdash; the difference in average annual
              loss between baseline and treated simulations. This is the expected annual savings.
            </li>
            <li>
              <span className="font-medium">P95 Reduction</span> &mdash; how much the worst-case exposure drops.
              If the mean improves but P95 doesn&apos;t, the treatment helps in normal years but doesn&apos;t
              protect against catastrophic scenarios.
            </li>
            <li>
              <span className="font-medium">Net Value (Year 1)</span> &mdash; mean annual savings minus treatment
              cost. Positive means the treatment pays for itself in the first year from expected loss reduction alone.
            </li>
            <li>
              <span className="font-medium">Payback Period</span> &mdash; treatment cost divided by annual savings.
              How many years of expected loss reduction it takes to recover the investment.
            </li>
          </ul>
        </div>
      </section>

      {/* Decision framing */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Risk Posture Classification</h2>
        <p className="text-sm leading-relaxed">
          PRISM classifies simulation results into risk postures to support decision-making.
          These are based on P95 exposure and threshold exceedance probabilities:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">Posture</th>
                <th className="text-left py-2">Triggers</th>
                <th className="text-left py-2">Suggested Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="py-2 font-medium text-red-700">Critical</td>
                <td className="py-2">P95 &ge; $5M or &gt;30% chance of exceeding $1M</td>
                <td className="py-2">Escalate to leadership. Fund treatment, transfer risk, or formally accept.</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-amber-700">Elevated</td>
                <td className="py-2">P95 &ge; $2M or &gt;50% chance of exceeding $500K</td>
                <td className="py-2">Prioritize for treatment evaluation. Identify dominant loss driver.</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-blue-700">Moderate</td>
                <td className="py-2">P95 &ge; $500K or &gt;10% chance of exceeding $500K</td>
                <td className="py-2">Monitor and reassess. Watch for changes in threat landscape.</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-emerald-700">Low</td>
                <td className="py-2">Below all elevated thresholds</td>
                <td className="py-2">Accept with normal monitoring cadence.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-[var(--muted)]">
          These thresholds are defaults. Organizations should calibrate them to their own risk
          appetite and materiality thresholds.
        </p>
      </section>

      {/* Limitations */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Limitations and Caveats</h2>
        <ul className="list-disc ml-5 text-sm space-y-2">
          <li>
            <span className="font-medium">Input quality determines output quality.</span>{' '}
            The simulation cannot compensate for poorly calibrated inputs. PRISM displays a
            data confidence indicator (Low/Medium/High) to flag when inputs are based primarily
            on expert judgment vs. empirical data.
          </li>
          <li>
            <span className="font-medium">Independence assumption.</span>{' '}
            Each iteration samples all factors independently. In reality, a successful attack
            may change the threat landscape for subsequent events. The model does not capture
            correlated or cascading scenarios within a single year.
          </li>
          <li>
            <span className="font-medium">Static annual snapshot.</span>{' '}
            The simulation models one year at a time. It does not account for multi-year
            trends, compounding effects, or changing threat environments over time.
          </li>
          <li>
            <span className="font-medium">Treatment effects are estimates.</span>{' '}
            Reduction percentages reflect how much a treatment is <em>expected</em> to reduce
            each factor. Actual effectiveness depends on implementation quality, which is why
            PRISM tracks implementation confidence separately.
          </li>
          <li>
            <span className="font-medium">Run-to-run variation is expected.</span>{' '}
            Because each simulation uses fresh random samples, results vary slightly between
            runs. Large variation between runs suggests wide input ranges, which is itself a
            useful finding about input uncertainty.
          </li>
        </ul>
      </section>
    </div>
  );
}
