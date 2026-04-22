/**
 * FAIR (Factor Analysis of Information Risk) Monte Carlo Engine
 *
 * The model decomposes risk into frequency and magnitude:
 *
 *   Annual Loss = Loss Event Frequency (LEF) × Loss Magnitude (LM)
 *
 * Where:
 *   LEF = Threat Event Frequency (TEF) × Vulnerability (Vuln)
 *     - TEF: how many times per year a threat agent acts against the asset
 *     - Vuln: probability that a threat event becomes an actual loss event
 *       (i.e., the threat succeeds given existing controls)
 *
 *   LM = Primary Loss + (Secondary Event Probability × Secondary Loss)
 *     - Primary Loss: direct cost of the event (response, recovery, replacement)
 *     - Secondary Loss: downstream costs that may or may not materialize
 *       (regulatory fines, lawsuits, reputation damage)
 *
 * Each input is specified as a three-point estimate (low, most likely, high)
 * and sampled from a triangular distribution per iteration. We run the model
 * 1,000 times to produce a distribution of possible annual outcomes rather
 * than a single point estimate.
 */

export interface ScenarioInputs {
  /** Threat Event Frequency — events per year (low bound) */
  tef_low: number;
  /** Threat Event Frequency — events per year (most likely) */
  tef_ml: number;
  /** Threat Event Frequency — events per year (high bound) */
  tef_high: number;
  /** Vulnerability — probability a threat event results in loss (low bound, 0-1) */
  vuln_low: number;
  /** Vulnerability — probability a threat event results in loss (most likely, 0-1) */
  vuln_ml: number;
  /** Vulnerability — probability a threat event results in loss (high bound, 0-1) */
  vuln_high: number;
  /** Primary loss magnitude per event in USD (low bound) */
  primary_loss_low: number;
  /** Primary loss magnitude per event in USD (most likely) */
  primary_loss_ml: number;
  /** Primary loss magnitude per event in USD (high bound) */
  primary_loss_high: number;
  /** Probability that a loss event triggers secondary losses (0-1) */
  secondary_event_prob: number;
  /** Secondary loss magnitude per event in USD (low bound) */
  secondary_loss_low: number;
  /** Secondary loss magnitude per event in USD (most likely) */
  secondary_loss_ml: number;
  /** Secondary loss magnitude per event in USD (high bound) */
  secondary_loss_high: number;
}

export interface SimulationResult {
  iterations: IterationResult[];
  summary: SimulationSummary;
}

export interface IterationResult {
  iter: number;
  sampled_tef: number;
  sampled_vuln: number;
  sampled_lef: number;
  sampled_primary_loss: number;
  secondary_triggered: boolean;
  sampled_secondary_loss: number;
  total_loss: number;
  annual_loss: number;
}

export interface SimulationSummary {
  mean_annual_loss: number;
  median_annual_loss: number;
  p90_annual_loss: number;
  p95_annual_loss: number;
  mean_lef: number;
  mean_total_loss: number;
  mean_secondary_loss_when_triggered: number;
  prob_above_thresholds: { threshold: number; probability: number }[];
}

/**
 * Samples from a triangular distribution defined by (low, mode, high).
 *
 * Triangular distributions are used here because they match how FAIR inputs
 * are elicited: "what's the lowest plausible value, the most likely, and the
 * highest plausible?" The shape naturally concentrates samples around the
 * mode while allowing values anywhere in [low, high]. This captures
 * uncertainty without requiring the precise parameterization that normal
 * or lognormal distributions need.
 */
function sampleTriangular(low: number, mode: number, high: number): number {
  if (low === high) return low;
  const u = Math.random();
  const fc = (mode - low) / (high - low);
  if (u < fc) {
    return low + Math.sqrt(u * (high - low) * (mode - low));
  } else {
    return high - Math.sqrt((1 - u) * (high - low) * (high - mode));
  }
}

export function runSimulation(
  inputs: ScenarioInputs,
  iterations: number = 1000,
  thresholds: number[] = [100000, 500000, 1000000]
): SimulationResult {
  const results: IterationResult[] = [];

  for (let i = 0; i < iterations; i++) {
    // Step 1: How often do threats appear this year?
    // Clamped to >= 0 since negative frequency is meaningless.
    const sampled_tef = Math.max(0,
      sampleTriangular(inputs.tef_low, inputs.tef_ml, inputs.tef_high));

    // Step 2: What fraction of those threats succeed (get past controls)?
    // Clamped to [0, 1] since this is a probability.
    const sampled_vuln = Math.min(1, Math.max(0,
      sampleTriangular(inputs.vuln_low, inputs.vuln_ml, inputs.vuln_high)));

    // Step 3: Loss Event Frequency = TEF × Vulnerability
    // This is the expected number of actual loss events this year.
    // E.g., 10 threat events × 30% vulnerability = 3 loss events expected.
    const sampled_lef = sampled_tef * sampled_vuln;

    // Step 4: How much does each loss event cost directly?
    const sampled_primary_loss = sampleTriangular(
      inputs.primary_loss_low,
      inputs.primary_loss_ml,
      inputs.primary_loss_high
    );

    // Step 5: Does this event trigger secondary/downstream losses?
    // (e.g., regulatory fine, lawsuit, brand damage)
    const secondary_triggered = Math.random() < inputs.secondary_event_prob;
    const sampled_secondary_loss = secondary_triggered
      ? sampleTriangular(inputs.secondary_loss_low, inputs.secondary_loss_ml, inputs.secondary_loss_high)
      : 0;

    // Step 6: Total loss per event = direct cost + any secondary costs
    const total_loss = sampled_primary_loss + sampled_secondary_loss;

    // Step 7: Annual loss = frequency × per-event loss
    const annual_loss = sampled_lef * total_loss;

    results.push({
      iter: i + 1,
      sampled_tef,
      sampled_vuln,
      sampled_lef,
      sampled_primary_loss,
      secondary_triggered,
      sampled_secondary_loss,
      total_loss,
      annual_loss,
    });
  }

  const annual_losses = results.map((r) => r.annual_loss).sort((a, b) => a - b);
  const mean_annual_loss = annual_losses.reduce((a, b) => a + b, 0) / iterations;
  const midIdx = Math.floor(iterations / 2);
  const median_annual_loss = iterations % 2 === 0
    ? (annual_losses[midIdx - 1] + annual_losses[midIdx]) / 2
    : annual_losses[midIdx];
  const p90_annual_loss = annual_losses[Math.floor(iterations * 0.9)];
  const p95_annual_loss = annual_losses[Math.floor(iterations * 0.95)];
  const mean_lef = results.reduce((a, r) => a + r.sampled_lef, 0) / iterations;
  const mean_total_loss = results.reduce((a, r) => a + r.total_loss, 0) / iterations;

  const triggered = results.filter((r) => r.secondary_triggered);
  const mean_secondary_loss_when_triggered =
    triggered.length > 0
      ? triggered.reduce((a, r) => a + r.sampled_secondary_loss, 0) / triggered.length
      : 0;

  const prob_above_thresholds = thresholds.map((t) => ({
    threshold: t,
    probability: annual_losses.filter((l) => l > t).length / iterations,
  }));

  return {
    iterations: results,
    summary: {
      mean_annual_loss,
      median_annual_loss,
      p90_annual_loss,
      p95_annual_loss,
      mean_lef,
      mean_total_loss,
      mean_secondary_loss_when_triggered,
      prob_above_thresholds,
    },
  };
}

/**
 * Produces a new set of scenario inputs with treatment reductions applied.
 *
 * Each reduction is a factor from 0 to 1, applied as: new_value = old_value × (1 - reduction).
 * A 0.3 TEF reduction means "this treatment reduces how often threats appear by 30%."
 * The reduction scales all three bounds (low, most likely, high) proportionally — it
 * shifts the entire distribution rather than changing its shape.
 *
 * Treatment comparison works by running the simulation twice (before and after) on
 * the same iteration count, then comparing the two output distributions.
 */
export function applyTreatment(
  inputs: ScenarioInputs,
  treatment: {
    tef_reduction: number;
    vuln_reduction: number;
    primary_loss_reduction: number;
    secondary_prob_reduction: number;
    secondary_loss_reduction: number;
  }
): ScenarioInputs {
  return {
    tef_low: inputs.tef_low * (1 - treatment.tef_reduction),
    tef_ml: inputs.tef_ml * (1 - treatment.tef_reduction),
    tef_high: inputs.tef_high * (1 - treatment.tef_reduction),
    vuln_low: inputs.vuln_low * (1 - treatment.vuln_reduction),
    vuln_ml: inputs.vuln_ml * (1 - treatment.vuln_reduction),
    vuln_high: inputs.vuln_high * (1 - treatment.vuln_reduction),
    primary_loss_low: inputs.primary_loss_low * (1 - treatment.primary_loss_reduction),
    primary_loss_ml: inputs.primary_loss_ml * (1 - treatment.primary_loss_reduction),
    primary_loss_high: inputs.primary_loss_high * (1 - treatment.primary_loss_reduction),
    secondary_event_prob: Math.min(1, Math.max(0, inputs.secondary_event_prob * (1 - treatment.secondary_prob_reduction))),
    secondary_loss_low: inputs.secondary_loss_low * (1 - treatment.secondary_loss_reduction),
    secondary_loss_ml: inputs.secondary_loss_ml * (1 - treatment.secondary_loss_reduction),
    secondary_loss_high: inputs.secondary_loss_high * (1 - treatment.secondary_loss_reduction),
  };
}
