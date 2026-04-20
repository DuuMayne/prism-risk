'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scenario, Treatment } from '@/lib/types';
import { runSimulation, applyTreatment, SimulationResult, ScenarioInputs } from '@/lib/monte-carlo';
import MonteCarloChart from '@/components/MonteCarloChart';
import SimulationSummaryPanel from '@/components/SimulationSummary';
import DecisionFraming from '@/components/DecisionFraming';
import TreatmentForm from '@/components/TreatmentForm';

function fmt(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

function pct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

export default function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [treatedResult, setTreatedResult] = useState<SimulationResult | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [tab, setTab] = useState<'overview' | 'simulation' | 'treatment'>('overview');


  useEffect(() => {
    fetch(`/api/scenarios/${id}`).then((r) => r.json()).then(setScenario);
    fetch(`/api/treatments?scenario_id=${id}`).then((r) => r.json()).then(setTreatments);
  }, [id]);

  const getInputs = useCallback((s: Scenario): ScenarioInputs => ({
    tef_low: s.tef_low, tef_ml: s.tef_ml, tef_high: s.tef_high,
    vuln_low: s.vuln_low, vuln_ml: s.vuln_ml, vuln_high: s.vuln_high,
    primary_loss_low: s.primary_loss_low, primary_loss_ml: s.primary_loss_ml, primary_loss_high: s.primary_loss_high,
    secondary_event_prob: s.secondary_event_prob, secondary_loss_low: s.secondary_loss_low,
    secondary_loss_ml: s.secondary_loss_ml, secondary_loss_high: s.secondary_loss_high,
  }), []);

  const runSim = useCallback(() => {
    if (!scenario) return;
    const result = runSimulation(getInputs(scenario));
    setSimResult(result);
    setTreatedResult(null);
    setSelectedTreatment(null);
  }, [scenario, getInputs]);

  const runComparison = useCallback((treatment: Treatment) => {
    if (!scenario) return;
    const inputs = getInputs(scenario);
    const currentResult = runSimulation(inputs);
    setSimResult(currentResult);
    const treatedInputs = applyTreatment(inputs, {
      tef_reduction: treatment.tef_reduction,
      vuln_reduction: treatment.vuln_reduction,
      primary_loss_reduction: treatment.primary_loss_reduction,
      secondary_prob_reduction: treatment.secondary_prob_reduction,
      secondary_loss_reduction: treatment.secondary_loss_reduction,
    });
    setTreatedResult(runSimulation(treatedInputs));
    setSelectedTreatment(treatment);
    setTab('treatment');
  }, [scenario, getInputs]);

  const saveTreatment = async (formData: {
    treatment_name: string; treatment_cost: number; implementation_confidence: string;
    tef_reduction: number; vuln_reduction: number; primary_loss_reduction: number;
    secondary_prob_reduction: number; secondary_loss_reduction: number; notes: string;
  }) => {
    const res = await fetch('/api/treatments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, scenario_id: id }),
    });
    const t = await res.json();
    setTreatments((prev) => [t, ...prev]);
    setShowTreatmentForm(false);
  };

  const deleteTreatment = async (tid: number) => {
    await fetch(`/api/treatments?id=${tid}`, { method: 'DELETE' });
    setTreatments((prev) => prev.filter((t) => t.id !== tid));
    if (selectedTreatment?.id === tid) {
      setTreatedResult(null);
      setSelectedTreatment(null);
    }
  };

  const deleteScenario = async () => {
    if (!confirm('Delete this scenario? This cannot be undone.')) return;
    await fetch(`/api/scenarios/${id}`, { method: 'DELETE' });
    router.push('/scenarios');
  };

  if (!scenario) {
    return <div className="text-center py-12 text-[var(--muted)]">Loading scenario...</div>;
  }

  const hasQuant = scenario.tef_ml > 0 && scenario.vuln_ml > 0 && scenario.primary_loss_ml > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-[var(--muted)]">{scenario.id}</span>
            <span className={`badge ${scenario.treatment_status === 'Mitigating' ? 'badge-yellow' : scenario.treatment_status === 'Accepted' ? 'badge-green' : scenario.treatment_status === 'Monitoring' ? 'badge-purple' : 'badge-blue'}`}>
              {scenario.treatment_status}
            </span>
            <span className={`badge ${scenario.data_quality === 'High' ? 'badge-green' : scenario.data_quality === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>
              {scenario.data_quality} confidence
            </span>
          </div>
          <h1 className="text-2xl font-bold">{scenario.scenario_title}</h1>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-3xl">{scenario.scenario_statement}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/scenarios/${id}/edit`} className="btn btn-secondary">Edit</Link>
          <button onClick={deleteScenario} className="btn btn-danger">Delete</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {(['overview', 'simulation', 'treatment'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {t === 'overview' ? 'Overview' : t === 'simulation' ? 'Monte Carlo' : 'Treatment Comparison'}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW TAB ============ */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold mb-3">Classification</h3>
              <dl className="space-y-2 text-sm">
                {[
                  ['Family', scenario.scenario_family],
                  ['Threat Community', scenario.threat_community],
                  ['Threat Action', scenario.threat_action],
                  ['Loss Event Type', scenario.loss_event_type],
                  ['Asset / Service', scenario.affected_asset_or_service],
                  ['Business Process', scenario.business_process],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-[var(--muted)]">{label}</dt>
                    <dd>{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold mb-3">Governance</h3>
              <dl className="space-y-2 text-sm">
                {[
                  ['Owner', scenario.owner],
                  ['Quant Readiness', scenario.quant_readiness],
                  ['Review Cadence', scenario.review_cadence],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-[var(--muted)]">{label}</dt>
                    <dd>{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {scenario.existing_controls && (
            <div className="card">
              <h3 className="text-sm font-semibold mb-2">Existing Controls</h3>
              <p className="text-sm">{scenario.existing_controls}</p>
            </div>
          )}
          {scenario.control_gaps_or_assumptions && (
            <div className="card">
              <h3 className="text-sm font-semibold mb-2">Control Gaps / Assumptions</h3>
              <p className="text-sm">{scenario.control_gaps_or_assumptions}</p>
            </div>
          )}

          {hasQuant && (
            <>
              <div className="card">
                <h3 className="text-sm font-semibold mb-3">Quantification Inputs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left">Factor</th>
                        <th className="text-right">Low</th>
                        <th className="text-right">Most Likely</th>
                        <th className="text-right">High</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1.5">Threat Event Frequency (events/yr)</td>
                        <td className="py-1.5 text-right font-mono">{scenario.tef_low}</td>
                        <td className="py-1.5 text-right font-mono">{scenario.tef_ml}</td>
                        <td className="py-1.5 text-right font-mono">{scenario.tef_high}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">Vulnerability (probability)</td>
                        <td className="py-1.5 text-right font-mono">{pct(scenario.vuln_low)}</td>
                        <td className="py-1.5 text-right font-mono">{pct(scenario.vuln_ml)}</td>
                        <td className="py-1.5 text-right font-mono">{pct(scenario.vuln_high)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">Primary Loss (USD/event)</td>
                        <td className="py-1.5 text-right font-mono">{fmt(scenario.primary_loss_low)}</td>
                        <td className="py-1.5 text-right font-mono">{fmt(scenario.primary_loss_ml)}</td>
                        <td className="py-1.5 text-right font-mono">{fmt(scenario.primary_loss_high)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">Secondary Loss (USD/event)</td>
                        <td className="py-1.5 text-right font-mono">{fmt(scenario.secondary_loss_low)}</td>
                        <td className="py-1.5 text-right font-mono">{fmt(scenario.secondary_loss_ml)}</td>
                        <td className="py-1.5 text-right font-mono">{fmt(scenario.secondary_loss_high)}</td>
                      </tr>
                      <tr>
                        <td className="py-1.5">Secondary Event Probability</td>
                        <td className="py-1.5 text-right font-mono" colSpan={3}>{pct(scenario.secondary_event_prob)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card bg-gray-50">
                <h3 className="text-sm font-semibold mb-1">ALE Quick Check (Deterministic)</h3>
                <p className="text-xs text-[var(--muted)] mb-3">
                  Point estimates using TEF x Vuln x (Primary + SecProb x Secondary). Use Monte Carlo for proper distribution analysis.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="label">Low Bound</div>
                    <div className="text-lg font-semibold">{fmt(scenario.ale_low_bound)}</div>
                  </div>
                  <div>
                    <div className="label">Most Likely</div>
                    <div className="text-lg font-semibold">{fmt(scenario.ale_ml_bound)}</div>
                  </div>
                  <div>
                    <div className="label">High Bound</div>
                    <div className="text-lg font-semibold text-[var(--danger)]">{fmt(scenario.ale_high_bound)}</div>
                  </div>
                </div>
              </div>

              <DecisionFraming scenario={scenario} />
            </>
          )}
        </div>
      )}

      {/* ============ SIMULATION TAB ============ */}
      {tab === 'simulation' && (
        <div className="space-y-4">
          {!hasQuant ? (
            <div className="card text-center py-8">
              <p className="text-[var(--muted)]">This scenario needs quantification inputs before running Monte Carlo.</p>
              <Link href={`/scenarios/${id}/edit`} className="btn btn-primary mt-3">Add Quantification</Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <button onClick={runSim} className="btn btn-primary">
                  {simResult && !treatedResult ? 'Re-run Simulation' : 'Run Monte Carlo (1,000 iterations)'}
                </button>
                {simResult && !treatedResult && (
                  <span className="text-xs text-[var(--muted)]">
                    Each run uses fresh random samples. Re-run to see natural variation in results.
                  </span>
                )}
              </div>

              {simResult && !treatedResult && (
                <>
                  <MonteCarloChart result={simResult} />
                  <SimulationSummaryPanel
                    summary={simResult.summary}
                    dataQuality={scenario.data_quality}
                  />
                  <DecisionFraming scenario={scenario} currentSummary={simResult.summary} />
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ============ TREATMENT TAB ============ */}
      {tab === 'treatment' && (
        <div className="space-y-4">
          {!hasQuant ? (
            <div className="card text-center py-8">
              <p className="text-[var(--muted)]">Add quantification inputs before comparing treatments.</p>
              <Link href={`/scenarios/${id}/edit`} className="btn btn-primary mt-3">Add Quantification</Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Treatment Options</h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Define treatments with reduction percentages (0-1 scale), then compare against current state via Monte Carlo.
                  </p>
                </div>
                <button onClick={() => setShowTreatmentForm(!showTreatmentForm)} className="btn btn-secondary">
                  {showTreatmentForm ? 'Cancel' : '+ Add Treatment'}
                </button>
              </div>

              {showTreatmentForm && (
                <TreatmentForm
                  onSave={saveTreatment}
                  onCancel={() => setShowTreatmentForm(false)}
                />
              )}

              {treatments.length > 0 && (
                <div className="card p-0 overflow-hidden">
                  <table>
                    <thead>
                      <tr>
                        <th>Treatment</th>
                        <th>Cost</th>
                        <th>TEF Red.</th>
                        <th>Vuln Red.</th>
                        <th>Loss Red.</th>
                        <th>Confidence</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {treatments.map((t) => (
                        <tr key={t.id} className={selectedTreatment?.id === t.id ? 'bg-blue-50' : ''}>
                          <td className="font-medium">{t.treatment_name}</td>
                          <td className="font-mono">{fmt(t.treatment_cost)}</td>
                          <td>{pct(t.tef_reduction)}</td>
                          <td>{pct(t.vuln_reduction)}</td>
                          <td>{pct(t.primary_loss_reduction)}</td>
                          <td><span className="badge badge-gray">{t.implementation_confidence}</span></td>
                          <td>
                            <div className="flex gap-2">
                              <button onClick={() => runComparison(t)} className="btn btn-primary text-xs py-1 px-2">
                                {selectedTreatment?.id === t.id ? 'Re-run' : 'Compare'}
                              </button>
                              <button onClick={() => deleteTreatment(t.id)} className="btn btn-danger text-xs py-1 px-2">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {treatments.length === 0 && !showTreatmentForm && (
                <div className="card text-center py-8 text-[var(--muted)]">
                  <p>No treatments defined yet. Add a treatment to compare its impact via Monte Carlo simulation.</p>
                </div>
              )}

              {simResult && treatedResult && selectedTreatment && (
                <div className="space-y-4">
                  <MonteCarloChart result={simResult} comparisonResult={treatedResult} />
                  <SimulationSummaryPanel
                    summary={simResult.summary}
                    comparisonSummary={treatedResult.summary}
                    treatmentCost={selectedTreatment.treatment_cost}
                    treatmentName={selectedTreatment.treatment_name}
                    dataQuality={scenario.data_quality}
                  />
                  <DecisionFraming
                    scenario={scenario}
                    currentSummary={simResult.summary}
                    treatedSummary={treatedResult.summary}
                    treatment={selectedTreatment}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
