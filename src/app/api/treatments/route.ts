import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const scenarioId = req.nextUrl.searchParams.get('scenario_id');
  if (scenarioId) {
    const treatments = db.prepare('SELECT * FROM treatments WHERE scenario_id = ? ORDER BY created_at DESC').all(scenarioId);
    return NextResponse.json(treatments);
  }
  const treatments = db.prepare('SELECT * FROM treatments ORDER BY created_at DESC').all();
  return NextResponse.json(treatments);
}

export async function POST(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const body = await req.json();

  const result = db.prepare(`INSERT INTO treatments (
    scenario_id, treatment_name, treatment_cost, implementation_confidence,
    tef_reduction, vuln_reduction, primary_loss_reduction,
    secondary_prob_reduction, secondary_loss_reduction, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    body.scenario_id, body.treatment_name, body.treatment_cost || 0,
    body.implementation_confidence || 'Medium',
    body.tef_reduction || 0, body.vuln_reduction || 0, body.primary_loss_reduction || 0,
    body.secondary_prob_reduction || 0, body.secondary_loss_reduction || 0,
    body.notes || ''
  );

  const treatment = db.prepare('SELECT * FROM treatments WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(treatment, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    db.prepare('DELETE FROM treatments WHERE id = ?').run(id);
  }
  return NextResponse.json({ ok: true });
}
