'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scenario, TaxonomyEntry } from '@/lib/types';
import Tooltip, { InfoIcon } from './Tooltip';

function FieldLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <label className="label flex items-center gap-1.5">
      {label}
      <Tooltip content={tooltip}>
        <InfoIcon />
      </Tooltip>
    </label>
  );
}

interface Props {
  scenario?: Scenario;
  isEdit?: boolean;
}

export default function ScenarioForm({ scenario, isEdit }: Props) {
  const router = useRouter();
  const [taxonomy, setTaxonomy] = useState<TaxonomyEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    scenario_family: scenario?.scenario_family || '',
    scenario_title: scenario?.scenario_title || '',
    scenario_pattern: scenario?.scenario_pattern || '',
    scenario_statement: scenario?.scenario_statement || '',
    threat_community: scenario?.threat_community || '',
    threat_action: scenario?.threat_action || '',
    loss_event_type: scenario?.loss_event_type || '',
    affected_asset_or_service: scenario?.affected_asset_or_service || '',
    business_process: scenario?.business_process || '',
    loss_forms: scenario?.loss_forms || '',
    existing_controls: scenario?.existing_controls || '',
    control_gaps_or_assumptions: scenario?.control_gaps_or_assumptions || '',
    data_quality: scenario?.data_quality || 'Medium',
    input_sources: scenario?.input_sources || '',
    owner: scenario?.owner || '',
    treatment_status: scenario?.treatment_status || 'Identified',
    time_horizon_months: scenario?.time_horizon_months || 12,
    tef_low: scenario?.tef_low || 0,
    tef_ml: scenario?.tef_ml || 0,
    tef_high: scenario?.tef_high || 0,
    vuln_low: scenario?.vuln_low || 0,
    vuln_ml: scenario?.vuln_ml || 0,
    vuln_high: scenario?.vuln_high || 0,
    primary_loss_low: scenario?.primary_loss_low || 0,
    primary_loss_ml: scenario?.primary_loss_ml || 0,
    primary_loss_high: scenario?.primary_loss_high || 0,
    secondary_event_prob: scenario?.secondary_event_prob || 0,
    secondary_loss_low: scenario?.secondary_loss_low || 0,
    secondary_loss_ml: scenario?.secondary_loss_ml || 0,
    secondary_loss_high: scenario?.secondary_loss_high || 0,
    quant_readiness: scenario?.quant_readiness || 'Backlog',
    review_cadence: scenario?.review_cadence || 'Quarterly',
  });

  useEffect(() => {
    fetch('/api/taxonomy').then((r) => r.json()).then(setTaxonomy);
  }, []);

  const getValues = (dimension: string) =>
    taxonomy.filter((t) => t.dimension === dimension).map((t) => t.value);

  const set = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/scenarios/${scenario!.id}` : '/api/scenarios';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      router.push(`/scenarios/${data.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Scenario Identity */}
      <div className="card">
        <h2 className="text-base font-semibold mb-4">Scenario Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Scenario Title *</label>
            <input className="input" required value={form.scenario_title}
              onChange={(e) => set('scenario_title', e.target.value)} />
          </div>
          <div>
            <label className="label">Scenario Family *</label>
            <select className="input" required value={form.scenario_family}
              onChange={(e) => set('scenario_family', e.target.value)}>
              <option value="">Select...</option>
              {getValues('Scenario Family').map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Scenario Pattern</label>
            <input className="input" value={form.scenario_pattern}
              onChange={(e) => set('scenario_pattern', e.target.value)}
              placeholder="Threat + action + asset + effect" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Scenario Statement *</label>
            <textarea className="input" rows={3} required value={form.scenario_statement}
              onChange={(e) => set('scenario_statement', e.target.value)}
              placeholder="Threat community + action + asset/service + business effect" />
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="card">
        <h2 className="text-base font-semibold mb-4">Classification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Threat Community *</label>
            <select className="input" required value={form.threat_community}
              onChange={(e) => set('threat_community', e.target.value)}>
              <option value="">Select...</option>
              {getValues('Threat Community').map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Threat Action *</label>
            <select className="input" required value={form.threat_action}
              onChange={(e) => set('threat_action', e.target.value)}>
              <option value="">Select...</option>
              {getValues('Threat Action').map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Loss Event Type *</label>
            <select className="input" required value={form.loss_event_type}
              onChange={(e) => set('loss_event_type', e.target.value)}>
              <option value="">Select...</option>
              {getValues('Loss Event Family').map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Affected Asset or Service</label>
            <input className="input" value={form.affected_asset_or_service}
              onChange={(e) => set('affected_asset_or_service', e.target.value)} />
          </div>
          <div>
            <label className="label">Business Process</label>
            <input className="input" value={form.business_process}
              onChange={(e) => set('business_process', e.target.value)} />
          </div>
          <div>
            <label className="label">Loss Forms</label>
            <input className="input" value={form.loss_forms}
              onChange={(e) => set('loss_forms', e.target.value)}
              placeholder="Semicolon-separated loss forms" />
          </div>
        </div>
      </div>

      {/* Governance */}
      <div className="card">
        <h2 className="text-base font-semibold mb-4">Governance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Existing Controls</label>
            <textarea className="input" rows={2} value={form.existing_controls}
              onChange={(e) => set('existing_controls', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Control Gaps / Assumptions</label>
            <textarea className="input" rows={2} value={form.control_gaps_or_assumptions}
              onChange={(e) => set('control_gaps_or_assumptions', e.target.value)} />
          </div>
          <div>
            <label className="label">Owner</label>
            <input className="input" value={form.owner}
              onChange={(e) => set('owner', e.target.value)} />
          </div>
          <div>
            <label className="label">Data Quality</label>
            <select className="input" value={form.data_quality}
              onChange={(e) => set('data_quality', e.target.value)}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="label">Treatment Status</label>
            <select className="input" value={form.treatment_status}
              onChange={(e) => set('treatment_status', e.target.value)}>
              {['Identified', 'Assessing', 'Accepted', 'Mitigating', 'Monitoring'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quant Readiness</label>
            <select className="input" value={form.quant_readiness}
              onChange={(e) => set('quant_readiness', e.target.value)}>
              {['Backlog', 'Seeded', 'Calibrating', 'Quantified', 'Maintained'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Review Cadence</label>
            <select className="input" value={form.review_cadence}
              onChange={(e) => set('review_cadence', e.target.value)}>
              {['Quarterly', 'Semiannual', 'Annual', 'Event-driven'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Input Sources</label>
            <input className="input" value={form.input_sources}
              onChange={(e) => set('input_sources', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Quantification */}
      <div className="card">
        <h2 className="text-base font-semibold mb-4">Quantification Inputs</h2>
        <div className="space-y-5">
          <div>
            <FieldLabel label="Time Horizon (Months)" tooltip="The modeling period for this scenario. Typically 12 months for annualized loss estimates." />
            <input className="input w-32" type="number" value={form.time_horizon_months}
              onChange={(e) => set('time_horizon_months', parseInt(e.target.value) || 12)} />
          </div>

          <div>
            <FieldLabel
              label="Threat Event Frequency (events/year)"
              tooltip="How many times per year does this type of threat event attempt to occur? Use a triangular estimate: the lowest reasonable count, most likely count, and highest plausible count. Example: phishing campaigns targeting your admins might range from 2 (quiet year) to 18 (active campaign)."
            />
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div>
                <label className="label">Low</label>
                <input className="input" type="number" step="any" value={form.tef_low}
                  onChange={(e) => set('tef_low', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Most Likely</label>
                <input className="input" type="number" step="any" value={form.tef_ml}
                  onChange={(e) => set('tef_ml', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">High</label>
                <input className="input" type="number" step="any" value={form.tef_high}
                  onChange={(e) => set('tef_high', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div>
            <FieldLabel
              label="Vulnerability (probability 0-1)"
              tooltip="Given a threat event occurs, what is the probability it succeeds and becomes a loss event? 0.05 = 5% chance of success per attempt. Consider your existing controls when estimating. Example: with MFA in place, phishing success rate might be 5-15% per attempt."
            />
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div>
                <label className="label">Low</label>
                <input className="input" type="number" step="any" min="0" max="1" value={form.vuln_low}
                  onChange={(e) => set('vuln_low', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Most Likely</label>
                <input className="input" type="number" step="any" min="0" max="1" value={form.vuln_ml}
                  onChange={(e) => set('vuln_ml', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">High</label>
                <input className="input" type="number" step="any" min="0" max="1" value={form.vuln_high}
                  onChange={(e) => set('vuln_high', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div>
            <FieldLabel
              label="Primary Loss Magnitude (USD/event)"
              tooltip="Direct costs per loss event: incident response, productivity loss, containment, system restoration. Does NOT include secondary costs like fines or lawsuits. Estimate the range of costs for a single event occurrence."
            />
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div>
                <label className="label">Low</label>
                <input className="input" type="number" step="any" value={form.primary_loss_low}
                  onChange={(e) => set('primary_loss_low', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Most Likely</label>
                <input className="input" type="number" step="any" value={form.primary_loss_ml}
                  onChange={(e) => set('primary_loss_ml', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">High</label>
                <input className="input" type="number" step="any" value={form.primary_loss_high}
                  onChange={(e) => set('primary_loss_high', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div>
            <FieldLabel
              label="Secondary Loss"
              tooltip="Secondary losses are downstream consequences that may or may not materialize: regulatory fines, lawsuits, customer restitution, reputational damage. Not every loss event triggers these -- estimate the probability separately from the magnitude."
            />
            <div className="grid grid-cols-4 gap-3 mt-2">
              <div>
                <FieldLabel label="Event Probability" tooltip="The chance that a primary loss event escalates to trigger secondary consequences (0-1). Example: 0.20 means 20% of events lead to regulatory/legal/reputational impact." />
                <input className="input" type="number" step="any" min="0" max="1" value={form.secondary_event_prob}
                  onChange={(e) => set('secondary_event_prob', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Loss Low</label>
                <input className="input" type="number" step="any" value={form.secondary_loss_low}
                  onChange={(e) => set('secondary_loss_low', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Loss Most Likely</label>
                <input className="input" type="number" step="any" value={form.secondary_loss_ml}
                  onChange={(e) => set('secondary_loss_ml', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Loss High</label>
                <input className="input" type="number" step="any" value={form.secondary_loss_high}
                  onChange={(e) => set('secondary_loss_high', parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Update Scenario' : 'Create Scenario'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
