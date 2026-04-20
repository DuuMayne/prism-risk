import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  const scenario = db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id);
  if (!scenario) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(scenario);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const aleLow = (body.tef_low * body.vuln_low) * (body.primary_loss_low + (body.secondary_event_prob || 0) * (body.secondary_loss_low || 0));
  const aleMl = (body.tef_ml * body.vuln_ml) * (body.primary_loss_ml + (body.secondary_event_prob || 0) * (body.secondary_loss_ml || 0));
  const aleHigh = (body.tef_high * body.vuln_high) * (body.primary_loss_high + (body.secondary_event_prob || 0) * (body.secondary_loss_high || 0));

  db.prepare(`UPDATE scenarios SET
    scenario_family = ?, scenario_title = ?, scenario_pattern = ?, scenario_statement = ?,
    threat_community = ?, threat_action = ?, loss_event_type = ?, affected_asset_or_service = ?,
    business_process = ?, loss_forms = ?, existing_controls = ?, control_gaps_or_assumptions = ?,
    data_quality = ?, input_sources = ?, owner = ?, treatment_status = ?,
    time_horizon_months = ?,
    tef_low = ?, tef_ml = ?, tef_high = ?, vuln_low = ?, vuln_ml = ?, vuln_high = ?,
    primary_loss_low = ?, primary_loss_ml = ?, primary_loss_high = ?,
    secondary_event_prob = ?, secondary_loss_low = ?, secondary_loss_ml = ?, secondary_loss_high = ?,
    ale_low_bound = ?, ale_ml_bound = ?, ale_high_bound = ?,
    quant_readiness = ?, review_cadence = ?, updated_at = datetime('now')
  WHERE id = ?`).run(
    body.scenario_family, body.scenario_title, body.scenario_pattern, body.scenario_statement,
    body.threat_community, body.threat_action, body.loss_event_type, body.affected_asset_or_service,
    body.business_process, body.loss_forms, body.existing_controls, body.control_gaps_or_assumptions,
    body.data_quality, body.input_sources, body.owner, body.treatment_status,
    body.time_horizon_months,
    body.tef_low, body.tef_ml, body.tef_high, body.vuln_low, body.vuln_ml, body.vuln_high,
    body.primary_loss_low, body.primary_loss_ml, body.primary_loss_high,
    body.secondary_event_prob, body.secondary_loss_low, body.secondary_loss_ml, body.secondary_loss_high,
    aleLow, aleMl, aleHigh,
    body.quant_readiness, body.review_cadence,
    id
  );

  const scenario = db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id);
  return NextResponse.json(scenario);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM scenarios WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
