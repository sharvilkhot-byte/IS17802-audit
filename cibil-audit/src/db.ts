import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// Only connect when DATABASE_URL is set
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null;

export function hasDb(): boolean {
  return pool !== null;
}

export async function initDb(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audits (
      id          SERIAL PRIMARY KEY,
      target_url  TEXT        NOT NULL,
      hostname    TEXT        NOT NULL,
      audited_at  TIMESTAMPTZ NOT NULL,
      total_pages INTEGER     DEFAULT 0,
      total_violations INTEGER DEFAULT 0,
      critical    INTEGER     DEFAULT 0,
      serious     INTEGER     DEFAULT 0,
      moderate    INTEGER     DEFAULT 0,
      minor       INTEGER     DEFAULT 0,
      report_html TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export interface AuditRow {
  id: number;
  target_url: string;
  hostname: string;
  audited_at: string;
  total_pages: number;
  total_violations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

export async function saveAudit(params: {
  targetUrl: string;
  hostname: string;
  auditedAt: string;
  totalPages: number;
  totalViolations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  reportHtml: string;
}): Promise<number | null> {
  if (!pool) return null;
  const res = await pool.query<{ id: number }>(
    `INSERT INTO audits
       (target_url, hostname, audited_at, total_pages, total_violations, critical, serious, moderate, minor, report_html)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      params.targetUrl, params.hostname, params.auditedAt,
      params.totalPages, params.totalViolations,
      params.critical, params.serious, params.moderate, params.minor,
      params.reportHtml,
    ]
  );
  return res.rows[0].id;
}

export async function listAudits(): Promise<AuditRow[]> {
  if (!pool) return [];
  const res = await pool.query<AuditRow>(
    `SELECT id, target_url, hostname, audited_at, total_pages, total_violations,
            critical, serious, moderate, minor
     FROM audits ORDER BY audited_at DESC`
  );
  return res.rows;
}

export async function getAuditHtml(id: number): Promise<string | null> {
  if (!pool) return null;
  const res = await pool.query<{ report_html: string }>(
    `SELECT report_html FROM audits WHERE id = $1`,
    [id]
  );
  return res.rows[0]?.report_html ?? null;
}

/** Read report HTML from filesystem (fallback when no DB) */
export function getReportFromFs(dir: string): string | null {
  const htmlPath = path.join(dir, 'accessibility-report.html');
  if (!fs.existsSync(htmlPath)) return null;
  return fs.readFileSync(htmlPath, 'utf-8');
}
