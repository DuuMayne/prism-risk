'use client';

import { useState } from 'react';
import Tooltip, { InfoIcon } from './Tooltip';

interface QuantValues {
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

interface Props {
  values: QuantValues;
  onChange: (values: QuantValues) => void;
}

const TEF_PRESETS = [
  { label: 'Rarely (1-2x per year)', low: 0.5, ml: 1, high: 2 },
  { label: 'Occasionally (2-5x per year)', low: 2, ml: 4, high: 6 },
  { label: 'Regularly (5-15x per year)', low: 5, ml: 10, high: 15 },
  { label: 'Frequently (15-50x per year)', low: 10, ml: 25, high: 50 },
  { label: 'Constantly (50+ per year)', low: 30, ml: 60, high: 100 },
];

const VULN_PRESETS = [
  { label: 'Very unlikely to succeed (<5%)', low: 0.01, ml: 0.03, high: 0.05 },
  { label: 'Unlikely but possible (5-15%)', low: 0.03, ml: 0.08, high: 0.15 },
  { label: 'Moderate chance (15-35%)', low: 0.10, ml: 0.20, high: 0.35 },
  { label: 'Likely to succeed (35-60%)', low: 0.25, ml: 0.45, high: 0.60 },
  { label: 'Very likely to succeed (60%+)', low: 0.50, ml: 0.70, high: 0.85 },
];

const LOSS_PRESETS = [
  { label: 'Minor ($5K - $25K)', low: 5000, ml: 15000, high: 25000 },
  { label: 'Moderate ($25K - $150K)', low: 25000, ml: 75000, high: 150000 },
  { label: 'Significant ($150K - $500K)', low: 100000, ml: 250000, high: 500000 },
  { label: 'Major ($500K - $2M)', low: 300000, ml: 1000000, high: 2000000 },
  { label: 'Severe ($2M+)', low: 1000000, ml: 3000000, high: 8000000 },
];

const SEC_PROB_PRESETS = [
  { label: 'Very unlikely (<5%)', value: 0.03 },
  { label: 'Unlikely (5-15%)', value: 0.10 },
  { label: 'Possible (15-30%)', value: 0.20 },
  { label: 'Likely (30-50%)', value: 0.40 },
  { label: 'Very likely (50%+)', value: 0.60 },
];

const SEC_LOSS_PRESETS = [
  { label: 'Minor ($10K - $100K)', low: 10000, ml: 50000, high: 100000 },
  { label: 'Moderate ($100K - $500K)', low: 50000, ml: 250000, high: 500000 },
  { label: 'Significant ($500K - $2M)', low: 250000, ml: 1000000, high: 2000000 },
  { label: 'Major ($2M - $10M)', low: 1000000, ml: 5000000, high: 10000000 },
  { label: 'Catastrophic ($10M+)', low: 5000000, ml: 15000000, high: 30000000 },
];

function PresetButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
        active
          ? 'border-[var(--accent)] bg-blue-50 text-[var(--accent)] font-medium'
          : 'border-[var(--border)] hover:border-gray-300 text-[var(--foreground)]'
      }`}
    >
      {label}
    </button>
  );
}

export default function GuidedQuantification({ values, onChange }: Props) {
  const [mode, setMode] = useState<'guided' | 'manual'>('guided');

  const findTefPreset = () => TEF_PRESETS.findIndex((p) => p.ml === values.tef_ml);
  const findVulnPreset = () => VULN_PRESETS.findIndex((p) => Math.abs(p.ml - values.vuln_ml) < 0.01);
  const findLossPreset = () => LOSS_PRESETS.findIndex((p) => p.ml === values.primary_loss_ml);
  const findSecProbPreset = () => SEC_PROB_PRESETS.findIndex((p) => Math.abs(p.value - values.secondary_event_prob) < 0.02);
  const findSecLossPreset = () => SEC_LOSS_PRESETS.findIndex((p) => p.ml === values.secondary_loss_ml);

  if (mode === 'manual') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Quantification Inputs (Manual)</h3>
          <button type="button" onClick={() => setMode('guided')} className="btn btn-secondary text-xs">
            Switch to Guided
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Threat Event Frequency (events/year): Low / Most Likely / High</label>
            <div className="grid grid-cols-3 gap-2">
              <input className="input" type="number" step="any" value={values.tef_low}
                onChange={(e) => onChange({ ...values, tef_low: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="any" value={values.tef_ml}
                onChange={(e) => onChange({ ...values, tef_ml: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="any" value={values.tef_high}
                onChange={(e) => onChange({ ...values, tef_high: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="label">Vulnerability (0-1): Low / Most Likely / High</label>
            <div className="grid grid-cols-3 gap-2">
              <input className="input" type="number" step="0.01" min="0" max="1" value={values.vuln_low}
                onChange={(e) => onChange({ ...values, vuln_low: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="0.01" min="0" max="1" value={values.vuln_ml}
                onChange={(e) => onChange({ ...values, vuln_ml: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="0.01" min="0" max="1" value={values.vuln_high}
                onChange={(e) => onChange({ ...values, vuln_high: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="label">Primary Loss ($/event): Low / Most Likely / High</label>
            <div className="grid grid-cols-3 gap-2">
              <input className="input" type="number" step="any" value={values.primary_loss_low}
                onChange={(e) => onChange({ ...values, primary_loss_low: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="any" value={values.primary_loss_ml}
                onChange={(e) => onChange({ ...values, primary_loss_ml: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="any" value={values.primary_loss_high}
                onChange={(e) => onChange({ ...values, primary_loss_high: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="label">Secondary Event Probability</label>
            <input className="input w-32" type="number" step="0.01" min="0" max="1" value={values.secondary_event_prob}
              onChange={(e) => onChange({ ...values, secondary_event_prob: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Secondary Loss ($/event): Low / Most Likely / High</label>
            <div className="grid grid-cols-3 gap-2">
              <input className="input" type="number" step="any" value={values.secondary_loss_low}
                onChange={(e) => onChange({ ...values, secondary_loss_low: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="any" value={values.secondary_loss_ml}
                onChange={(e) => onChange({ ...values, secondary_loss_ml: parseFloat(e.target.value) || 0 })} />
              <input className="input" type="number" step="any" value={values.secondary_loss_high}
                onChange={(e) => onChange({ ...values, secondary_loss_high: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Quantification (Guided)</h3>
        <button type="button" onClick={() => setMode('manual')} className="btn btn-secondary text-xs">
          Switch to Manual Input
        </button>
      </div>

      <div className="space-y-6">
        {/* TEF */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-medium">How often does this type of event attempt to occur?</span>
            <Tooltip content="Think about how many times per year this threat event is attempted or could plausibly occur against your organization. Consider industry data, your incident history, and threat intelligence.">
              <InfoIcon />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {TEF_PRESETS.map((preset, i) => (
              <PresetButton
                key={i}
                label={preset.label}
                active={findTefPreset() === i}
                onClick={() => onChange({ ...values, tef_low: preset.low, tef_ml: preset.ml, tef_high: preset.high })}
              />
            ))}
          </div>
        </div>

        {/* Vulnerability */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-medium">When it&#39;s attempted, how likely is it to succeed (given current controls)?</span>
            <Tooltip content="Consider your existing defenses. If someone attempts this attack, what percentage of the time would it actually result in a loss? Strong controls = low percentage. Weak or missing controls = high percentage.">
              <InfoIcon />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {VULN_PRESETS.map((preset, i) => (
              <PresetButton
                key={i}
                label={preset.label}
                active={findVulnPreset() === i}
                onClick={() => onChange({ ...values, vuln_low: preset.low, vuln_ml: preset.ml, vuln_high: preset.high })}
              />
            ))}
          </div>
        </div>

        {/* Primary Loss */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-medium">When a loss event occurs, what are the direct costs?</span>
            <Tooltip content="Direct costs include: incident response labor, system restoration, operational disruption, immediate remediation. Do NOT include fines, lawsuits, or reputational damage here — those go in secondary loss.">
              <InfoIcon />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {LOSS_PRESETS.map((preset, i) => (
              <PresetButton
                key={i}
                label={preset.label}
                active={findLossPreset() === i}
                onClick={() => onChange({ ...values, primary_loss_low: preset.low, primary_loss_ml: preset.ml, primary_loss_high: preset.high })}
              />
            ))}
          </div>
        </div>

        {/* Secondary Probability */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-medium">How likely is it that a loss event escalates to regulatory, legal, or reputational consequences?</span>
            <Tooltip content="Not every incident triggers secondary effects. A small data exposure might not lead to a fine, but a large breach probably will. Consider: Would this reach the threshold for regulatory notification? Could it lead to a lawsuit? Would the media cover it?">
              <InfoIcon />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SEC_PROB_PRESETS.map((preset, i) => (
              <PresetButton
                key={i}
                label={preset.label}
                active={findSecProbPreset() === i}
                onClick={() => onChange({ ...values, secondary_event_prob: preset.value })}
              />
            ))}
          </div>
        </div>

        {/* Secondary Loss */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-medium">If secondary consequences occur, how costly are they?</span>
            <Tooltip content="Secondary losses include: regulatory fines, legal settlements, customer restitution (credit monitoring, refunds), reputational impact (lost business, partner attrition). These can dwarf primary losses in severe scenarios.">
              <InfoIcon />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SEC_LOSS_PRESETS.map((preset, i) => (
              <PresetButton
                key={i}
                label={preset.label}
                active={findSecLossPreset() === i}
                onClick={() => onChange({ ...values, secondary_loss_low: preset.low, secondary_loss_ml: preset.ml, secondary_loss_high: preset.high })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
