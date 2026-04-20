import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { calculateDueDate } from '@/lib/sla';

export async function GET(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const params = req.nextUrl.searchParams;
  const status = params.get('status');
  const severity = params.get('severity');
  const scenarioId = params.get('scenario_id');
  const findingType = params.get('finding_type');

  let sql = 'SELECT * FROM remediation_items WHERE 1=1';
  const args: string[] = [];

  if (status) { sql += ' AND status = ?'; args.push(status); }
  if (severity) { sql += ' AND severity = ?'; args.push(severity); }
  if (scenarioId) { sql += ' AND scenario_id = ?'; args.push(scenarioId); }
  if (findingType) { sql += ' AND finding_type = ?'; args.push(findingType); }

  sql += ' ORDER BY created_at DESC';
  const items = db.prepare(sql).all(...args);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const body = await req.json();

  const lastId = db.prepare("SELECT id FROM remediation_items ORDER BY id DESC LIMIT 1").get() as { id: string } | undefined;
  let nextNum = 1;
  if (lastId) {
    const num = parseInt(lastId.id.replace('REM-', ''), 10);
    nextNum = num + 1;
  }
  const id = `REM-${String(nextNum).padStart(4, '0')}`;

  db.prepare(`INSERT INTO remediation_items (
    id, scenario_id, title, description, finding_type, severity,
    source_system, application_name, entitlement_name, affected_user,
    owner, due_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id,
    body.scenario_id || null,
    body.title,
    body.description || '',
    body.finding_type,
    body.severity,
    body.source_system || '',
    body.application_name || '',
    body.entitlement_name || '',
    body.affected_user || '',
    body.owner || '',
    body.due_date || calculateDueDate(body.finding_type, body.severity)
  );

  // Insert initial status history entry
  db.prepare(`INSERT INTO status_history (remediation_item_id, from_status, to_status, comment)
    VALUES (?, 'new', 'open', 'Item created')`).run(id);

  const item = db.prepare('SELECT * FROM remediation_items WHERE id = ?').get(id);
  return NextResponse.json(item, { status: 201 });
}
