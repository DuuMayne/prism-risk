export interface Scenario {
  id: string;
  scenario_family: string;
  scenario_title: string;
  scenario_pattern: string;
  scenario_statement: string;
  threat_community: string;
  threat_action: string;
  loss_event_type: string;
  affected_asset_or_service: string;
  business_process: string;
  loss_forms: string;
  existing_controls: string;
  control_gaps_or_assumptions: string;
  data_quality: string;
  input_sources: string;
  owner: string;
  treatment_status: string;
  treatment_determination: string;
  time_horizon_months: number;
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
  ale_low_bound: number;
  ale_ml_bound: number;
  ale_high_bound: number;
  quant_readiness: string;
  review_cadence: string;
  created_at: string;
  updated_at: string;
}

export interface TaxonomyEntry {
  id: number;
  dimension: string;
  code: string;
  value: string;
  definition: string;
  usage_notes: string;
  example: string;
}

export interface Treatment {
  id: number;
  scenario_id: string;
  treatment_name: string;
  treatment_cost: number;
  implementation_confidence: string;
  tef_reduction: number;
  vuln_reduction: number;
  primary_loss_reduction: number;
  secondary_prob_reduction: number;
  secondary_loss_reduction: number;
  notes: string;
  created_at: string;
}
