import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  const item = db.prepare('SELECT * FROM remediation_items WHERE id = ?').get(id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const history = db.prepare(
    'SELECT * FROM status_history WHERE remediation_item_id = ? ORDER BY created_at DESC'
  ).all(id);

  const evidenceRecords = db.prepare(
    'SELECT * FROM evidence WHERE remediation_item_id = ? ORDER BY created_at DESC'
  ).all(id);

  return NextResponse.json({ ...item as object, status_history: history, evidence: evidenceRecords });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const existing = db.prepare('SELECT status FROM remediation_items WHERE id = ?').get(id) as { status: string } | undefined;
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.status === 'closed') return NextResponse.json({ error: 'Closed items are read-only' }, { status: 400 });

  db.prepare(`UPDATE remediation_items SET
    title = ?, description = ?, finding_type = ?, severity = ?,
    source_system = ?, application_name = ?, entitlement_name = ?,
    affected_user = ?, owner = ?, due_date = ?, scenario_id = ?,
    updated_at = datetime('now')
  WHERE id = ?`).run(
    body.title, body.description || '', body.finding_type, body.severity,
    body.source_system || '', body.application_name || '', body.entitlement_name || '',
    body.affected_user || '', body.owner || '', body.due_date || null, body.scenario_id || null,
    id
  );

  const item = db.prepare('SELECT * FROM remediation_items WHERE id = ?').get(id);
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM remediation_items WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
