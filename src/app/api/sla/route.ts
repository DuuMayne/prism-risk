import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  seedDatabase();
  const db = getDb();
  const policies = db.prepare('SELECT * FROM sla_policies ORDER BY finding_type, severity').all();
  return NextResponse.json(policies);
}

export async function POST(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const body = await req.json();

  db.prepare(
    `INSERT INTO sla_policies (finding_type, severity, due_in_days, escalation_after_days)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(finding_type, severity)
     DO UPDATE SET due_in_days = excluded.due_in_days, escalation_after_days = excluded.escalation_after_days`
  ).run(body.finding_type, body.severity, body.due_in_days, body.escalation_after_days);

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    db.prepare('DELETE FROM sla_policies WHERE id = ?').run(id);
  }
  return NextResponse.json({ ok: true });
}
