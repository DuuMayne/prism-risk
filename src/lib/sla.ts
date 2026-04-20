import { getDb } from './db';

interface SlaPolicyRow {
  due_in_days: number;
  escalation_after_days: number;
}

const DEFAULT_SLA: Record<string, { due: number; escalation: number }> = {
  critical: { due: 3, escalation: 1 },
  high:     { due: 7, escalation: 3 },
  medium:   { due: 30, escalation: 14 },
  low:      { due: 90, escalation: 45 },
};

/**
 * Calculate due date for a remediation item based on SLA policies.
 * Checks for a specific findingType+severity policy first, falls back to severity defaults.
 */
export function calculateDueDate(findingType: string, severity: string, createdAt?: string): string {
  const db = getDb();
  const policy = db.prepare(
    'SELECT due_in_days, escalation_after_days FROM sla_policies WHERE finding_type = ? AND severity = ?'
  ).get(findingType, severity) as SlaPolicyRow | undefined;

  const dueInDays = policy?.due_in_days ?? DEFAULT_SLA[severity]?.due ?? 30;

  const base = createdAt ? new Date(createdAt) : new Date();
  const due = new Date(base.getTime() + dueInDays * 24 * 60 * 60 * 1000);
  return due.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Check if a due date has passed.
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

/**
 * Calculate days remaining (negative = overdue).
 */
export function daysRemaining(dueDate: string | null): number | null {
  if (!dueDate) return null;
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
