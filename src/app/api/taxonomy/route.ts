import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  seedDatabase();
  const db = getDb();
  const entries = db.prepare('SELECT * FROM taxonomy ORDER BY dimension, code').all();
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const body = await req.json();

  const result = db.prepare(
    'INSERT INTO taxonomy (dimension, code, value, definition, usage_notes, example) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(body.dimension, body.code, body.value, body.definition || null, body.usage_notes || null, body.example || null);

  const entry = db.prepare('SELECT * FROM taxonomy WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(entry, { status: 201 });
}

export async function PUT(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const body = await req.json();

  db.prepare(
    'UPDATE taxonomy SET dimension = ?, code = ?, value = ?, definition = ?, usage_notes = ?, example = ? WHERE id = ?'
  ).run(body.dimension, body.code, body.value, body.definition || null, body.usage_notes || null, body.example || null, body.id);

  const entry = db.prepare('SELECT * FROM taxonomy WHERE id = ?').get(body.id);
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  seedDatabase();
  const db = getDb();
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    db.prepare('DELETE FROM taxonomy WHERE id = ?').run(id);
  }
  return NextResponse.json({ ok: true });
}
