import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { validateTransition, Status } from '@/lib/workflow';

interface ItemRow {
  id: string;
  status: string;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const item = db.prepare('SELECT id, status FROM remediation_items WHERE id = ?').get(id) as ItemRow | undefined;
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (item.status === 'closed') {
    return NextResponse.json({ error: 'Closed items are read-only' }, { status: 400 });
  }

  const fromStatus = item.status as Status;
  const toStatus = body.status as Status;

  // Check evidence count for resolution validation
  const evidenceCount = (db.prepare(
    'SELECT COUNT(*) as count FROM evidence WHERE remediation_item_id = ?'
  ).get(id) as { count: number }).count;

  const validation = validateTransition(fromStatus, toStatus, {
    comment: body.comment,
    resolutionType: body.resolution_type,
    hasEvidence: evidenceCount > 0,
  });

  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const transition = db.transaction(() => {
    // Build SET clause based on target status
    let extraSets = '';
    const extraArgs: (string | null)[] = [];

    if (toStatus === 'resolved') {
      extraSets = ', resolution_type = ?, resolution_notes = ?, resolved_at = datetime(\'now\')';
      extraArgs.push(body.resolution_type || null, body.resolution_notes || null);
    } else if (toStatus === 'verified') {
      extraSets = ', verified_at = datetime(\'now\')';
    } else if (toStatus === 'closed') {
      extraSets = ', closed_at = datetime(\'now\')';
    }

    // If rejection (resolved -> in_progress), clear resolution fields
    if (fromStatus === 'resolved' && toStatus === 'in_progress') {
      extraSets = ', resolution_type = NULL, resolution_notes = NULL, resolved_at = NULL';
    }

    db.prepare(
      `UPDATE remediation_items SET status = ?, updated_at = datetime('now')${extraSets} WHERE id = ?`
    ).run(toStatus, ...extraArgs, id);

    // Insert status history record
    db.prepare(
      `INSERT INTO status_history (remediation_item_id, from_status, to_status, actor, comment, resolution_type)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, fromStatus, toStatus, body.actor || null, body.comment || null, body.resolution_type || null);
  });

  transition();

  return NextResponse.json({ id, status: toStatus });
}
