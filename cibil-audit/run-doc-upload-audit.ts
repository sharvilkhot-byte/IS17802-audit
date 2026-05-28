/**
 * One-off audit runner for the Document Upload Flow prototype.
 * Covers both HTML files and all 3 tab states in index.html.
 */
import { runAudit } from './src/runner';
import { generateHTMLReport } from './src/reporter/htmlReporter';
import { generateCSVReport } from './src/reporter/csvReporter';
import { generateJSONReport } from './src/reporter/jsonReporter';
import { AuditReport, AuditConfig, AuditViolation } from './src/types';
import { clearCheckpoint } from './src/runner';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:9191';
const OUTPUT_DIR = path.join(process.cwd(), 'audit-results', 'doc-upload-flow');

const config: AuditConfig = {
  outputDir: OUTPUT_DIR,
  headless: false,
  viewport: { width: 1280, height: 800 },
  timeout: 30000,
  pages: [
    // Page 1: index.html — default state (Company tab)
    {
      name: 'Document Upload — Company Tab',
      url: `${BASE_URL}/index.html`,
      waitFor: '.page',
    },
    // Page 2: index.html — Partnership tab
    {
      name: 'Document Upload — Partnership Tab',
      url: `${BASE_URL}/index.html`,
      waitFor: '.page',
      actions: [
        { type: 'click', selector: '[data-tab="partnership"]' },
        { type: 'wait', ms: 500 },
      ],
    },
    // Page 3: index.html — Proprietorship tab
    {
      name: 'Document Upload — Proprietorship Tab',
      url: `${BASE_URL}/index.html`,
      waitFor: '.page',
      actions: [
        { type: 'click', selector: '[data-tab="proprietorship"]' },
        { type: 'wait', ms: 500 },
      ],
    },
    // Page 4: upload-without-email.html
    {
      name: 'Document Upload — Without Email Flow',
      url: `${BASE_URL}/upload-without-email.html`,
      waitFor: '.page',
    },
  ],
};

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('\n' + '='.repeat(60));
  console.log('  IS 17802 Audit — Document Upload Flow');
  console.log('='.repeat(60));
  console.log(`Pages: ${config.pages.length}`);
  config.pages.forEach(p => console.log(`  • ${p.name}`));
  console.log('');

  const startTime = Date.now();
  const pageResults = await runAudit(config);

  const allViolations: AuditViolation[] = pageResults.flatMap(p => p.violations);
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
      targetUrl: BASE_URL,
      totalPages: pageResults.length,
    },
    summary: {
      totalViolations: allViolations.length,
      critical: allViolations.filter(v => v.impact === 'critical').length,
      serious: allViolations.filter(v => v.impact === 'serious').length,
      moderate: allViolations.filter(v => v.impact === 'moderate').length,
      minor: allViolations.filter(v => v.impact === 'minor').length,
      byClause,
      byPage,
    },
    pages: pageResults,
  };

  const BASE_RESULTS_DIR = path.join(process.cwd(), 'audit-results');
  const relDir = path.relative(BASE_RESULTS_DIR, OUTPUT_DIR).replace(/\\/g, '/');
  const violationsUrl = `/audit-results/${relDir}/violations.json`;

  const htmlPath = generateHTMLReport(report, OUTPUT_DIR, violationsUrl);
  generateCSVReport(report, OUTPUT_DIR);
  generateJSONReport(report, OUTPUT_DIR);

  await clearCheckpoint(OUTPUT_DIR);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('  AUDIT COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nTotal violations: ${report.summary.totalViolations}`);
  console.log(`  Critical : ${report.summary.critical}`);
  console.log(`  Serious  : ${report.summary.serious}`);
  console.log(`  Moderate : ${report.summary.moderate}`);
  console.log(`  Minor    : ${report.summary.minor}`);
  console.log('\nTop violated clauses:');
  Object.entries(byClause)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .forEach(([c, n]) => console.log(`  IS 17802 / ${c} — ${n} violation(s)`));
  console.log(`\nReport: ${htmlPath}`);
  console.log(`Time elapsed: ${elapsed}s\n`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
