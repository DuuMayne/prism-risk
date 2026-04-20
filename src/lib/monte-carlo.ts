export interface ScenarioInputs {
  tef_low: number;
  tef_ml: number;
  tef_high: number;
  vuln_low: number;
  vuln_ml: number;
  vuln_high: number;
  primary_loss_low: number;
  primary_loss_ml: number;
  primary_loss_high: number;
  secondary_event_prob: number;
  secondary_loss_low: number;
  secondary_loss_ml: number;
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
    const sampled_tef = sampleTriangular(inputs.tef_low, inputs.tef_ml, inputs.tef_high);
    const sampled_vuln = sampleTriangular(inputs.vuln_low, inputs.vuln_ml, inputs.vuln_high);
    const sampled_lef = sampled_tef * sampled_vuln;
    const sampled_primary_loss = sampleTriangular(
      inputs.primary_loss_low,
      inputs.primary_loss_ml,
      inputs.primary_loss_high
    );
    const secondary_triggered = Math.random() < inputs.secondary_event_prob;
    const sampled_secondary_loss = secondary_triggered
      ? sampleTriangular(inputs.secondary_loss_low, inputs.secondary_loss_ml, inputs.secondary_loss_high)
      : 0;
    const total_loss = sampled_primary_loss + sampled_secondary_loss;
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
  const median_annual_loss = annual_losses[Math.floor(iterations / 2)];
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
    secondary_event_prob: inputs.secondary_event_prob * (1 - treatment.secondary_prob_reduction),
    secondary_loss_low: inputs.secondary_loss_low * (1 - treatment.secondary_loss_reduction),
    secondary_loss_ml: inputs.secondary_loss_ml * (1 - treatment.secondary_loss_reduction),
    secondary_loss_high: inputs.secondary_loss_high * (1 - treatment.secondary_loss_reduction),
  };
}
