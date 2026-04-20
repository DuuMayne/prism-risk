'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ScenarioForm from '@/components/ScenarioForm';
import { SCENARIO_TEMPLATES, TEMPLATE_CATEGORIES, ScenarioTemplate } from '@/lib/templates';
import { Scenario } from '@/lib/types';

export default function NewScenarioPage() {
  const [mode, setMode] = useState<'choose' | 'template' | 'blank'>('choose');
  const [selectedTemplate, setSelectedTemplate] = useState<ScenarioTemplate | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const router = useRouter();

  const filtered = categoryFilter
    ? SCENARIO_TEMPLATES.filter((t) => t.category === categoryFilter)
    : SCENARIO_TEMPLATES;

  if (mode === 'blank') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('choose')} className="btn btn-secondary text-sm">Back</button>
          <h1 className="text-2xl font-bold">New Risk Scenario</h1>
        </div>
        <ScenarioForm />
      </div>
    );
  }

  if (mode === 'template' && selectedTemplate) {
    const prefilled = {
      scenario_family: selectedTemplate.scenario_family,
      scenario_title: '',
      scenario_pattern: selectedTemplate.scenario_pattern,
      scenario_statement: selectedTemplate.scenario_statement,
      threat_community: selectedTemplate.threat_community,
      threat_action: selectedTemplate.threat_action,
      loss_event_type: selectedTemplate.loss_event_type,
      loss_forms: selectedTemplate.loss_forms,
      existing_controls: selectedTemplate.existing_controls_hint,
      tef_low: selectedTemplate.tef_low,
      tef_ml: selectedTemplate.tef_ml,
      tef_high: selectedTemplate.tef_high,
      vuln_low: selectedTemplate.vuln_low,
      vuln_ml: selectedTemplate.vuln_ml,
      vuln_high: selectedTemplate.vuln_high,
      primary_loss_low: selectedTemplate.primary_loss_low,
      primary_loss_ml: selectedTemplate.primary_loss_ml,
      primary_loss_high: selectedTemplate.primary_loss_high,
      secondary_event_prob: selectedTemplate.secondary_event_prob,
      secondary_loss_low: selectedTemplate.secondary_loss_low,
      secondary_loss_ml: selectedTemplate.secondary_loss_ml,
      secondary_loss_high: selectedTemplate.secondary_loss_high,
    } as unknown as Scenario;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setMode('choose'); setSelectedTemplate(null); }} className="btn btn-secondary text-sm">Back</button>
          <div>
            <h1 className="text-2xl font-bold">New Scenario from Template</h1>
            <p className="text-sm text-[var(--muted)]">Based on: {selectedTemplate.name}</p>
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm">
            This form is pre-filled with typical values for this scenario type. Adjust the title, quantification inputs, and controls to match your specific environment.
            The numbers are starting estimates — refine them based on your organization&#39;s data and context.
          </p>
        </div>
        <ScenarioForm scenario={prefilled} />
      </div>
    );
  }

  // Choose mode
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Scenario</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Start from a template or create from scratch</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setMode('blank')}
          className="card text-left hover:border-[var(--accent)] transition-colors cursor-pointer"
        >
          <h3 className="text-base font-semibold mb-1">Start from Scratch</h3>
          <p className="text-sm text-[var(--muted)]">
            Create a blank scenario and fill in all fields yourself. Best if you have a specific risk in mind that doesn&#39;t match a template.
          </p>
        </button>
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-base font-semibold mb-1">Start from a Template</h3>
          <p className="text-sm text-[var(--muted)]">
            Choose a common risk pattern below. The form will be pre-filled with typical classification and starting quantification estimates that you can adjust.
          </p>
        </div>
      </div>

      {/* Template browser */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Scenario Templates</h2>
          <div className="flex gap-1">
            <button
              onClick={() => setCategoryFilter('')}
              className={`btn text-xs ${!categoryFilter ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`btn text-xs ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => { setSelectedTemplate(tmpl); setMode('template'); }}
              className="card text-left hover:border-[var(--accent)] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold">{tmpl.name}</h4>
                  <p className="text-xs text-[var(--muted)] mt-1">{tmpl.description}</p>
                </div>
                <span className="badge badge-blue shrink-0">{tmpl.category}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{tmpl.scenario_family}</span>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{tmpl.threat_community}</span>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{tmpl.loss_event_type}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
