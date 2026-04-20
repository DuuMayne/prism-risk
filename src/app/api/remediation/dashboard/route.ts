import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

interface CountRow { count: number }
interface StatusCountRow { status: string; count: number }
interface SeverityCountRow { severity: string; count: number }
interface OwnerCountRow { owner: string; count: number }
interface AppCountRow { application_name: string; count: number }
interface TtrRow { days: number }
interface RecentRow { id: string; title: string; severity: string; closed_at: string; created_at: string }

export async function GET() {
  seedDatabase();
  const db = getDb();

  const totalItems = (db.prepare('SELECT COUNT(*) as count FROM remediation_items').get() as CountRow).count;

  const byStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM remediation_items GROUP BY status'
  ).all() as StatusCountRow[];

  const openBySeverity = db.prepare(
    "SELECT severity, COUNT(*) as count FROM remediation_items WHERE status NOT IN ('verified','closed') GROUP BY severity"
  ).all() as SeverityCountRow[];

  const overdueCount = (db.prepare(
    "SELECT COUNT(*) as count FROM remediation_items WHERE due_date < datetime('now') AND status NOT IN ('verified','closed')"
  ).get() as CountRow).count;

  // Mean time to remediate: average days from created_at to resolved_at
  const ttrRows = db.prepare(
    "SELECT ROUND(julianday(resolved_at) - julianday(created_at), 1) as days FROM remediation_items WHERE resolved_at IS NOT NULL"
  ).all() as TtrRow[];
  const meanTimeToRemediate = ttrRows.length > 0
    ? Math.round((ttrRows.reduce((sum, r) => sum + r.days, 0) / ttrRows.length) * 10) / 10
    : null;

  const byOwner = db.prepare(
    "SELECT owner, COUNT(*) as count FROM remediation_items WHERE owner != '' GROUP BY owner ORDER BY count DESC LIMIT 10"
  ).all() as OwnerCountRow[];

  const byApplication = db.prepare(
    "SELECT application_name, COUNT(*) as count FROM remediation_items WHERE application_name != '' GROUP BY application_name ORDER BY count DESC LIMIT 10"
  ).all() as AppCountRow[];

  const recentlyClosed = db.prepare(
    "SELECT id, title, severity, closed_at, created_at FROM remediation_items WHERE closed_at IS NOT NULL ORDER BY closed_at DESC LIMIT 10"
  ).all() as RecentRow[];

  // Aging buckets for open items
  const agingRows = db.prepare(
    "SELECT ROUND(julianday('now') - julianday(created_at)) as age FROM remediation_items WHERE status NOT IN ('verified','closed')"
  ).all() as { age: number }[];

  const aging = { '0-7': 0, '8-30': 0, '31-90': 0, '90+': 0 };
  for (const r of agingRows) {
    if (r.age <= 7) aging['0-7']++;
    else if (r.age <= 30) aging['8-30']++;
    else if (r.age <= 90) aging['31-90']++;
    else aging['90+']++;
  }

  return NextResponse.json({
    totalItems,
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.count])),
    openBySeverity: Object.fromEntries(openBySeverity.map((r) => [r.severity, r.count])),
    overdueCount,
    meanTimeToRemediate,
    byOwner,
    byApplication,
    recentlyClosed,
    aging,
  });
}
