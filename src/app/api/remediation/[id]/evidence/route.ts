import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { logger, getClientIp } from '@/lib/logger';

interface ItemRow {
  status: string;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  const records = db.prepare(
    'SELECT * FROM evidence WHERE remediation_item_id = ? ORDER BY created_at DESC'
  ).all(id);
  return NextResponse.json(records);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  const ip = getClientIp(req);

  try {
    const item = db.prepare('SELECT status FROM remediation_items WHERE id = ?').get(id) as ItemRow | undefined;
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (item.status === 'closed') return NextResponse.json({ error: 'Closed items are read-only' }, { status: 400 });

    const body = await req.json();

    const result = db.prepare(`INSERT INTO evidence (
      remediation_item_id, evidence_type, description, file_url, source_system, uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?)`).run(
      id,
      body.evidence_type,
      body.description,
      body.file_url || null,
      body.source_system || null,
      body.uploaded_by || null
    );

    db.prepare(`INSERT INTO audit_log (action, resource_type, resource_id, actor, ip_address, details)
      VALUES (?, ?, ?, ?, ?, ?)`).run(
      'evidence_add', 'remediation_item', id, body.uploaded_by || null, ip,
      JSON.stringify({ evidence_type: body.evidence_type, evidence_id: result.lastInsertRowid })
    );

    logger.audit('remediation_item.evidence_add', {
      resource_id: id, evidence_id: result.lastInsertRowid, actor: body.uploaded_by || null, ip,
    });

    const record = db.prepare('SELECT * FROM evidence WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    logger.error('remediation_item.evidence_add.failed', { resource_id: id, error: String(err), ip });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  const ip = getClientIp(req);

  try {
    const item = db.prepare('SELECT status FROM remediation_items WHERE id = ?').get(id) as ItemRow | undefined;
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (item.status === 'closed') return NextResponse.json({ error: 'Closed items are read-only' }, { status: 400 });

    const evidenceId = req.nextUrl.searchParams.get('evidence_id');
    if (evidenceId) {
      db.transaction(() => {
        db.prepare('DELETE FROM evidence WHERE id = ? AND remediation_item_id = ?').run(evidenceId, id);

        db.prepare(`INSERT INTO audit_log (action, resource_type, resource_id, actor, ip_address, details)
          VALUES (?, ?, ?, ?, ?, ?)`).run(
          'evidence_delete', 'remediation_item', id, null, ip,
          JSON.stringify({ evidence_id: evidenceId })
        );
      })();

      logger.audit('remediation_item.evidence_delete', { resource_id: id, evidence_id: evidenceId, ip });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('remediation_item.evidence_delete.failed', { resource_id: id, error: String(err), ip });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
