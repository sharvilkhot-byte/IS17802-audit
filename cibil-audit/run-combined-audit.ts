/**
 * Combined IS 17802 audit:
 * 1. Document Upload Flow (port 9191) — 4 pages (3 tabs + without-email)
 * 2. CIBIL Web HTML (port 9192)       — 17 pages
 *
 * Produces one unified HTML/CSV/JSON report.
 */
import { runAudit, clearCheckpoint } from './src/runner';
import { generateHTMLReport } from './src/reporter/htmlReporter';
import { generateCSVReport } from './src/reporter/csvReporter';
import { generateJSONReport } from './src/reporter/jsonReporter';
import { AuditReport, AuditConfig, AuditViolation, PageAuditResult } from './src/types';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = path.join(process.cwd(), 'audit-results', 'combined-report');

// ─── Flow 1: Document Upload (port 9191) ─────────────────────────────────────
const DOC_UPLOAD_BASE = 'http://localhost:9191';

const docUploadConfig: AuditConfig = {
  outputDir: path.join(OUTPUT_DIR, 'checkpoint-doc-upload'),
  headless: false,
  viewport: { width: 1280, height: 800 },
  timeout: 30000,
  pages: [
    {
      name: '[Doc Upload] Company Tab',
      url: `${DOC_UPLOAD_BASE}/index.html`,
      waitFor: '.page',
    },
    {
      name: '[Doc Upload] Partnership Tab',
      url: `${DOC_UPLOAD_BASE}/index.html`,
      waitFor: '.page',
      actions: [
        { type: 'click', selector: '[data-tab="partnership"]' },
        { type: 'wait', ms: 500 },
      ],
    },
    {
      name: '[Doc Upload] Proprietorship Tab',
      url: `${DOC_UPLOAD_BASE}/index.html`,
      waitFor: '.page',
      actions: [
        { type: 'click', selector: '[data-tab="proprietorship"]' },
        { type: 'wait', ms: 500 },
      ],
    },
    {
      name: '[Doc Upload] Without Email Flow',
      url: `${DOC_UPLOAD_BASE}/upload-without-email.html`,
      waitFor: '.page',
    },
  ],
};

// ─── Flow 2: CIBIL Web HTML (port 9192) ──────────────────────────────────────
const CIBIL_WEB_BASE = 'http://localhost:9192';

const cibilWebConfig: AuditConfig = {
  outputDir: path.join(OUTPUT_DIR, 'checkpoint-cibil-web'),
  headless: false,
  viewport: { width: 1280, height: 800 },
  timeout: 30000,
  pages: [
    { name: '[CIBIL Web] Login',                      url: `${CIBIL_WEB_BASE}/login.html`,                              waitFor: 'body' },
    { name: '[CIBIL Web] Dashboard',                  url: `${CIBIL_WEB_BASE}/dashboard.html`,                          waitFor: 'body' },
    { name: '[CIBIL Web] Manual',                     url: `${CIBIL_WEB_BASE}/manual.html`,                             waitFor: 'body' },
    { name: '[CIBIL Web] Home (Index)',                url: `${CIBIL_WEB_BASE}/index.html`,                              waitFor: 'body' },
    { name: '[CIBIL Web] Error — Account Locked',     url: `${CIBIL_WEB_BASE}/errors/account-locked.html`,              waitFor: 'body' },
    { name: '[CIBIL Web] Error — Company Exists',     url: `${CIBIL_WEB_BASE}/errors/company-already-exists.html`,      waitFor: 'body' },
    { name: '[CIBIL Web] Error — Connection Timeout', url: `${CIBIL_WEB_BASE}/errors/connection-timeout.html`,          waitFor: 'body' },
    { name: '[CIBIL Web] Error — Link Expired',       url: `${CIBIL_WEB_BASE}/errors/link-expired.html`,                waitFor: 'body' },
    { name: '[CIBIL Web] Error — No Records',         url: `${CIBIL_WEB_BASE}/errors/norecords.html`,                   waitFor: 'body' },
    { name: '[CIBIL Web] Error — OTP Exceeded',       url: `${CIBIL_WEB_BASE}/errors/otp-attempts-exceeded.html`,       waitFor: 'body' },
    { name: '[CIBIL Web] Error — Payment Cancelled',  url: `${CIBIL_WEB_BASE}/errors/payment-cancelled.html`,           waitFor: 'body' },
    { name: '[CIBIL Web] Error — Report Slow',        url: `${CIBIL_WEB_BASE}/errors/report-longer-than-usual.html`,   waitFor: 'body' },
    { name: '[CIBIL Web] Error — Request Timed Out',  url: `${CIBIL_WEB_BASE}/errors/request-timed-out.html`,          waitFor: 'body' },
    { name: '[CIBIL Web] Error — Session Expired',    url: `${CIBIL_WEB_BASE}/errors/session-expired.html`,             waitFor: 'body' },
    { name: '[CIBIL Web] Error — System Down',        url: `${CIBIL_WEB_BASE}/errors/system-down.html`,                 waitFor: 'body' },
    { name: '[CIBIL Web] Error — Timeout',            url: `${CIBIL_WEB_BASE}/errors/timeout.html`,                     waitFor: 'body' },
    { name: '[CIBIL Web] Error — Try Again',          url: `${CIBIL_WEB_BASE}/errors/try-again.html`,                   waitFor: 'body' },
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(docUploadConfig.outputDir, { recursive: true });
  fs.mkdirSync(cibilWebConfig.outputDir, { recursive: true });

  const totalPages = docUploadConfig.pages.length + cibilWebConfig.pages.length;

  console.log('\n' + '='.repeat(65));
  console.log('  IS 17802 Combined Audit — Document Upload + CIBIL Web');
  console.log('='.repeat(65));
  console.log(`Total pages: ${totalPages}\n`);
  console.log('Flow 1 — Document Upload Flow:');
  docUploadConfig.pages.forEach(p => console.log(`  • ${p.name}`));
  console.log('\nFlow 2 — CIBIL Web HTML:');
  cibilWebConfig.pages.forEach(p => console.log(`  • ${p.name}`));
  console.log('');

  const startTime = Date.now();

  // Run both flows sequentially (memory constraint — one browser at a time)
  console.log('\n── Running Flow 1: Document Upload ──────────────────────────');
  const docResults: PageAuditResult[] = await runAudit(docUploadConfig);

  console.log('\n── Running Flow 2: CIBIL Web HTML ───────────────────────────');
  const cibilResults: PageAuditResult[] = await runAudit(cibilWebConfig);

  // Merge all results
  const allResults = [...docResults, ...cibilResults];
  const allViolations: AuditViolation[] = allResults.flatMap(p => p.violations);

  const byClause: Record<string, number> = {};
  const byPage: Record<string, number> = {};
  for (const v of allViolations) {
    byClause[v.clause.clause] = (byClause[v.clause.clause] ?? 0) + 1;
    byPage[v.page] = (byPage[v.page] ?? 0) + 1;
  }

  const report: AuditReport = {
    meta: {
      auditedAt: new Date().toISOString(),
      toolVersion: '1.0.0',
      standard: 'IS 17802 / WCAG 2.1 AA',
      targetUrl: 'Document Upload Flow + CIBIL Web HTML',
      totalPages: allResults.length,
    },
    summary: {
      totalViolations: allViolations.length,
      critical: allViolations.filter(v => v.impact === 'critical').length,
      serious:  allViolations.filter(v => v.impact === 'serious').length,
      moderate: allViolations.filter(v => v.impact === 'moderate').length,
      minor:    allViolations.filter(v => v.impact === 'minor').length,
      byClause,
      byPage,
    },
    pages: allResults,
  };

  // Write violations.json for lazy loading in the HTML report
  const BASE_RESULTS_DIR = path.join(process.cwd(), 'audit-results');
  const relDir = path.relative(BASE_RESULTS_DIR, OUTPUT_DIR).replace(/\\/g, '/');
  const violationsUrl = `/audit-results/${relDir}/violations.json`;

  console.log('\n── Generating reports ────────────────────────────────────────');
  const htmlPath = generateHTMLReport(report, OUTPUT_DIR, violationsUrl);
  generateCSVReport(report, OUTPUT_DIR);
  generateJSONReport(report, OUTPUT_DIR);

  // Cleanup checkpoints
  await clearCheckpoint(docUploadConfig.outputDir);
  await clearCheckpoint(cibilWebConfig.outputDir);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(65));
  console.log('  COMBINED AUDIT COMPLETE');
  console.log('='.repeat(65));
  console.log(`\nPages audited : ${allResults.length}`);
  console.log(`Total violations: ${report.summary.totalViolations}`);
  console.log(`  Critical : ${report.summary.critical}`);
  console.log(`  Serious  : ${report.summary.serious}`);
  console.log(`  Moderate : ${report.summary.moderate}`);
  console.log(`  Minor    : ${report.summary.minor}`);
  console.log('\nTop violated clauses:');
  Object.entries(byClause)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([c, n]) => console.log(`  IS 17802 / ${c} — ${n} violation(s)`));
  console.log(`\nReport saved: ${htmlPath}`);
  console.log(`Time elapsed: ${elapsed}s\n`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
