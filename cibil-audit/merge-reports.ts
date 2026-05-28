/**
 * Merges results from three sources:
 *  1. audit-results/doc-upload-flow/violations.json  — standalone doc upload (good data)
 *  2. audit-results/combined-report/violations.json  — CIBIL web pages (skip failed ones)
 *  3. audit-results/combined-report/login-result.json — Login page (re-audited standalone)
 *
 * Reconstructs PageAuditResult[] from slim violations and generates a single combined report.
 */
import { generateHTMLReport } from './src/reporter/htmlReporter';
import { generateCSVReport } from './src/reporter/csvReporter';
import { generateJSONReport } from './src/reporter/jsonReporter';
import { AuditReport, AuditViolation, PageAuditResult, IS17802Clause } from './src/types';
import path from 'path';
import fs from 'fs';

const BASE = path.join(process.cwd(), 'audit-results');
const OUTPUT_DIR = path.join(BASE, 'combined-report');

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface SlimViolation {
  id: string; clause: string; wcag: string; level: string;
  title: string; principle: string; page: string; url: string;
  impact: string; desc: string; help: string; helpUrl: string;
  source: string; nodes: { html: string; target: string[]; failureSummary: string }[];
}

const FAILED_RULE_IDS = new Set(['page-audit-timeout', 'page-load-error']);

function slimToAuditViolation(v: SlimViolation): AuditViolation {
  return {
    id: v.id,
    ruleId: `${v.source}-${v.clause}`,
    clause: {
      clause: v.clause, wcag: v.wcag,
      level: v.level as IS17802Clause['level'],
      title: v.title,
      principle: v.principle as IS17802Clause['principle'],
    },
    page: v.page,
    url: v.url,
    impact: v.impact as AuditViolation['impact'],
    description: v.desc,
    help: v.help,
    helpUrl: v.helpUrl,
    source: v.source as AuditViolation['source'],
    nodes: (v.nodes || []).map(n => ({
      html: n.html || '',
      target: n.target || [],
      failureSummary: n.failureSummary || '',
    })),
  };
}

function isFailedViolation(v: SlimViolation): boolean {
  // Slim format doesn't store ruleId directly — detect by description pattern
  return v.desc.includes('Page failed to load:') ||
         v.desc.includes('audit timed out') ||
         v.impact === 'critical' && v.desc.startsWith('Page ');
}

function groupViolationsToPages(violations: SlimViolation[]): PageAuditResult[] {
  const pageMap = new Map<string, SlimViolation[]>();
  for (const v of violations) {
    if (!pageMap.has(v.page)) pageMap.set(v.page, []);
    pageMap.get(v.page)!.push(v);
  }

  const pages: PageAuditResult[] = [];
  for (const [pageName, pvs] of pageMap) {
    const url = pvs[0]?.url ?? '';
    const auditViolations = pvs.map(slimToAuditViolation);
    pages.push({
      page: pageName,
      url,
      timestamp: new Date().toISOString(),
      violations: auditViolations,
      incomplete: [],
      passes: 0,
      pageTitle: pageName,
      loadTimeMs: 0,
      screenshotPath: '',
    });
  }
  return pages;
}

// ─── Load data ────────────────────────────────────────────────────────────────

// 1. Doc upload standalone
const docViolationsRaw: SlimViolation[] = JSON.parse(
  fs.readFileSync(path.join(BASE, 'doc-upload-flow', 'violations.json'), 'utf-8')
).violations;

// Filter out any failed pages (shouldn't be any — standalone run was clean)
const docViolations = docViolationsRaw.filter(v => !isFailedViolation(v));
const docPages = groupViolationsToPages(docViolations);

// 2. CIBIL web from combined run — only [CIBIL Web]* pages, skip failed ones
const combinedViolationsRaw: SlimViolation[] = JSON.parse(
  fs.readFileSync(path.join(OUTPUT_DIR, 'violations.json'), 'utf-8')
).violations;

const cibilViolations = combinedViolationsRaw.filter(v =>
  v.page.startsWith('[CIBIL Web]') &&
  !v.page.includes('Login') &&       // Login was re-audited separately
  !isFailedViolation(v)
);
const cibilPages = groupViolationsToPages(cibilViolations);

// 3. Login page — full PageAuditResult from standalone re-audit
const loginPages: PageAuditResult[] = JSON.parse(
  fs.readFileSync(path.join(OUTPUT_DIR, 'login-result.json'), 'utf-8')
);

// 4. Missing states — 23 additional pages audited separately
const missingStatesViolations: SlimViolation[] = JSON.parse(
  fs.readFileSync(path.join(BASE, 'missing-states', 'violations.json'), 'utf-8')
).violations;
const missingStatesPages = groupViolationsToPages(missingStatesViolations);

// ─── Report pages that got skipped ────────────────────────────────────────────
const allCibilPageNames = new Set(
  combinedViolationsRaw.filter(v => v.page.startsWith('[CIBIL Web]')).map(v => v.page)
);
const auditedCibilPageNames = new Set([
  ...cibilPages.map(p => p.page),
  ...loginPages.map(p => p.page),
]);
const skipped = [...allCibilPageNames].filter(n => !auditedCibilPageNames.has(n));

// ─── Merge ────────────────────────────────────────────────────────────────────
const allPages: PageAuditResult[] = [
  ...docPages,
  ...loginPages,
  ...cibilPages,
  ...missingStatesPages,
];

const allViolations: AuditViolation[] = allPages.flatMap(p => p.violations);
const byClause: Record<string, number> = {};
const byPage:   Record<string, number> = {};
for (const v of allViolations) {
  byClause[v.clause.clause] = (byClause[v.clause.clause] ?? 0) + 1;
  byPage[v.page]             = (byPage[v.page]             ?? 0) + 1;
}

const merged: AuditReport = {
  meta: {
    auditedAt:   new Date().toISOString(),
    toolVersion: '1.0.0',
    standard:    'IS 17802 / WCAG 2.1 AA',
    targetUrl:   'Document Upload Flow + CIBIL Web HTML',
    totalPages:  allPages.length,
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
  pages: allPages,
};

// ─── Generate reports ─────────────────────────────────────────────────────────
const relDir = path.relative(BASE, OUTPUT_DIR).replace(/\\/g, '/');
const violationsUrl = `/audit-results/${relDir}/violations.json`;

console.log('\n── Generating combined report ────────────────────────────────');
const htmlPath = generateHTMLReport(merged, OUTPUT_DIR, violationsUrl);
generateCSVReport(merged, OUTPUT_DIR);
generateJSONReport(merged, OUTPUT_DIR);

console.log('\n' + '='.repeat(65));
console.log('  COMBINED REPORT READY');
console.log('='.repeat(65));
console.log(`\nPages included : ${allPages.length}`);
console.log(`  Doc Upload Flow    : ${docPages.length} pages`);
console.log(`  CIBIL Web Login    : ${loginPages.length} page (standalone re-audit)`);
console.log(`  CIBIL Web HTML     : ${cibilPages.length} pages`);
console.log(`  Missing states     : ${missingStatesPages.length} pages/states`);
if (skipped.length > 0) {
  console.log(`  ⚠ Skipped          : ${skipped.length} pages (had audit errors)`);
  skipped.forEach(n => console.log(`      - ${n}`));
}
console.log(`\nTotal violations : ${merged.summary.totalViolations}`);
console.log(`  Critical : ${merged.summary.critical}`);
console.log(`  Serious  : ${merged.summary.serious}`);
console.log(`  Moderate : ${merged.summary.moderate}`);
console.log(`  Minor    : ${merged.summary.minor}`);
console.log('\nTop violated clauses:');
Object.entries(byClause)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([c, n]) => console.log(`  IS 17802 / ${c} — ${n} violation(s)`));
console.log(`\nReport: ${htmlPath}\n`);
