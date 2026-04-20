'use client';

import { useState } from 'react';
import Tooltip, { InfoIcon } from './Tooltip';

interface TreatmentFormData {
  treatment_name: string;
  treatment_cost: number;
  implementation_confidence: string;
  tef_reduction: number;
  vuln_reduction: number;
  primary_loss_reduction: number;
  secondary_prob_reduction: number;
  secondary_loss_reduction: number;
  notes: string;
}

interface Props {
  onSave: (data: TreatmentFormData) => void;
  onCancel: () => void;
}

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

export default function TreatmentForm({ onSave, onCancel }: Props) {
  const [form, setForm] = useState<TreatmentFormData>({
    treatment_name: '',
    treatment_cost: 0,
    implementation_confidence: 'Medium',
    tef_reduction: 0,
    vuln_reduction: 0,
    primary_loss_reduction: 0,
    secondary_prob_reduction: 0,
    secondary_loss_reduction: 0,
    notes: '',
  });

  const set = (key: keyof TreatmentFormData, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {/* Treatment Identity */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Treatment Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <FieldLabel
              label="Treatment Name *"
              tooltip="A short, descriptive name for this control or mitigation action (e.g., 'Deploy phishing-resistant MFA for all admins')."
            />
            <input className="input" required value={form.treatment_name}
              onChange={(e) => set('treatment_name', e.target.value)}
              placeholder="e.g., Phishing-resistant MFA rollout" />
          </div>
          <div>
            <FieldLabel
              label="Treatment Cost ($)"
              tooltip="Total one-time implementation cost including tooling, licensing, labor, and onboarding. Used to calculate payback period and net value."
            />
            <input className="input" type="number" min="0" step="1000" value={form.treatment_cost}
              onChange={(e) => set('treatment_cost', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <FieldLabel
              label="Implementation Confidence"
              tooltip="How confident are you that this treatment will achieve its stated reductions? High = proven solution with clear implementation path. Medium = reasonable estimate but some uncertainty. Low = aspirational or untested approach."
            />
            <select className="input" value={form.implementation_confidence}
              onChange={(e) => set('implementation_confidence', e.target.value)}>
              <option value="High">High - Proven, clear path</option>
              <option value="Medium">Medium - Reasonable estimate</option>
              <option value="Low">Low - Aspirational / untested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Frequency Reductions */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Frequency Reduction</h3>
        <p className="text-xs text-[var(--muted)] mb-3">
          How much does this treatment reduce how often threat events occur or succeed?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <FieldLabel
              label="Threat Event Frequency Reduction"
              tooltip="The proportional reduction in how often threat events attempt to occur. A value of 0.15 means 15% fewer threat events per year. Example: deploying email gateway filtering might reduce phishing attempts reaching users by 30% (enter 0.30)."
            />
            <div className="flex items-center gap-2">
              <input className="input" type="number" step="0.01" min="0" max="1" value={form.tef_reduction}
                onChange={(e) => set('tef_reduction', parseFloat(e.target.value) || 0)} />
              <span className="text-sm text-[var(--muted)] shrink-0 w-12 text-right">{(form.tef_reduction * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <FieldLabel
              label="Vulnerability Reduction"
              tooltip="The proportional reduction in the probability that a threat event becomes a loss event. A value of 0.25 means 25% lower chance of successful compromise per attempt. Example: MFA might reduce the probability that a phished credential leads to account takeover by 80% (enter 0.80)."
            />
            <div className="flex items-center gap-2">
              <input className="input" type="number" step="0.01" min="0" max="1" value={form.vuln_reduction}
                onChange={(e) => set('vuln_reduction', parseFloat(e.target.value) || 0)} />
              <span className="text-sm text-[var(--muted)] shrink-0 w-12 text-right">{(form.vuln_reduction * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Magnitude Reductions */}
      <div>
        <h3 className="text-sm font-semibold mb-1">Magnitude Reduction</h3>
        <p className="text-xs text-[var(--muted)] mb-3">
          How much does this treatment reduce the financial impact when a loss event does occur?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <FieldLabel
              label="Primary Loss Reduction"
              tooltip="The proportional reduction in direct loss per event (response costs, productivity loss, immediate remediation). A value of 0.10 means each event costs 10% less to handle. Example: an automated incident response playbook might reduce containment and recovery costs by 20% (enter 0.20)."
            />
            <div className="flex items-center gap-2">
              <input className="input" type="number" step="0.01" min="0" max="1" value={form.primary_loss_reduction}
                onChange={(e) => set('primary_loss_reduction', parseFloat(e.target.value) || 0)} />
              <span className="text-sm text-[var(--muted)] shrink-0 w-12 text-right">{(form.primary_loss_reduction * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <FieldLabel
              label="Secondary Event Probability Reduction"
              tooltip="The proportional reduction in the chance that a loss event triggers secondary consequences (regulatory action, litigation, customer redress). A value of 0.20 means 20% less likely to escalate. Example: faster breach notification might reduce regulatory penalty likelihood by 30% (enter 0.30)."
            />
            <div className="flex items-center gap-2">
              <input className="input" type="number" step="0.01" min="0" max="1" value={form.secondary_prob_reduction}
                onChange={(e) => set('secondary_prob_reduction', parseFloat(e.target.value) || 0)} />
              <span className="text-sm text-[var(--muted)] shrink-0 w-12 text-right">{(form.secondary_prob_reduction * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <FieldLabel
              label="Secondary Loss Reduction"
              tooltip="The proportional reduction in the magnitude of secondary losses when they do occur (fines, settlements, customer restitution). A value of 0.10 means 10% lower secondary cost. Example: cyber insurance might cover 40% of regulatory fines and legal costs (enter 0.40)."
            />
            <div className="flex items-center gap-2">
              <input className="input" type="number" step="0.01" min="0" max="1" value={form.secondary_loss_reduction}
                onChange={(e) => set('secondary_loss_reduction', parseFloat(e.target.value) || 0)} />
              <span className="text-sm text-[var(--muted)] shrink-0 w-12 text-right">{(form.secondary_loss_reduction * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <FieldLabel
          label="Notes / Rationale"
          tooltip="Document assumptions, evidence sources, or reasoning behind your reduction estimates. This helps with future calibration and audit trail."
        />
        <textarea className="input" rows={2} value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Document your assumptions and evidence for these estimates..." />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={!form.treatment_name}>
          Save Treatment
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
