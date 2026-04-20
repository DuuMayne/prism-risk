import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const format = req.nextUrl.searchParams.get('format') || 'json';

  const items = db.prepare('SELECT * FROM remediation_items ORDER BY created_at DESC').all() as Record<string, unknown>[];

  if (format === 'csv') {
    const headers = [
      'ID', 'Title', 'Finding Type', 'Severity', 'Status', 'Resolution Type',
      'Application', 'Entitlement', 'Affected User', 'Owner', 'Scenario',
      'Due Date', 'Created', 'Resolved', 'Verified', 'Closed', 'Evidence Count',
    ];

    const rows = items.map((item) => {
      const evidenceCount = (db.prepare(
        'SELECT COUNT(*) as count FROM evidence WHERE remediation_item_id = ?'
      ).get(item.id as string) as { count: number }).count;

      return [
        item.id, item.title, item.finding_type, item.severity, item.status,
        item.resolution_type || '', item.application_name || '', item.entitlement_name || '',
        item.affected_user || '', item.owner || '', item.scenario_id || '',
        item.due_date || '', item.created_at || '', item.resolved_at || '',
        item.verified_at || '', item.closed_at || '', evidenceCount,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="remediation-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  // JSON format — include history and evidence
  const enriched = items.map((item) => {
    const history = db.prepare(
      'SELECT * FROM status_history WHERE remediation_item_id = ? ORDER BY created_at DESC'
    ).all(item.id as string);
    const evidence = db.prepare(
      'SELECT * FROM evidence WHERE remediation_item_id = ? ORDER BY created_at DESC'
    ).all(item.id as string);
    return { ...item, status_history: history, evidence };
  });

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    item_count: enriched.length,
    items: enriched,
  });
}
