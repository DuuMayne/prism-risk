import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'prism.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS taxonomy (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dimension TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      definition TEXT,
      usage_notes TEXT,
      example TEXT
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      scenario_family TEXT,
      scenario_title TEXT NOT NULL,
      scenario_pattern TEXT,
      scenario_statement TEXT,
      threat_community TEXT,
      threat_action TEXT,
      loss_event_type TEXT,
      affected_asset_or_service TEXT,
      business_process TEXT,
      loss_forms TEXT,
      existing_controls TEXT,
      control_gaps_or_assumptions TEXT,
      data_quality TEXT DEFAULT 'Medium',
      input_sources TEXT,
      owner TEXT,
      treatment_status TEXT DEFAULT 'Identified',
      treatment_determination TEXT,
      time_horizon_months INTEGER DEFAULT 12,
      tef_low REAL,
      tef_ml REAL,
      tef_high REAL,
      vuln_low REAL,
      vuln_ml REAL,
      vuln_high REAL,
      primary_loss_low REAL,
      primary_loss_ml REAL,
      primary_loss_high REAL,
      secondary_event_prob REAL,
      secondary_loss_low REAL,
      secondary_loss_ml REAL,
      secondary_loss_high REAL,
      ale_low_bound REAL,
      ale_ml_bound REAL,
      ale_high_bound REAL,
      quant_readiness TEXT DEFAULT 'Backlog',
      review_cadence TEXT DEFAULT 'Quarterly',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
      treatment_name TEXT NOT NULL,
      treatment_cost REAL DEFAULT 0,
      implementation_confidence TEXT DEFAULT 'Medium',
      tef_reduction REAL DEFAULT 0,
      vuln_reduction REAL DEFAULT 0,
      primary_loss_reduction REAL DEFAULT 0,
      secondary_prob_reduction REAL DEFAULT 0,
      secondary_loss_reduction REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}
