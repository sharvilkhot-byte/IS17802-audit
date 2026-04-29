import { runAudit } from './runner';
import { generateHTMLReport } from './reporter/htmlReporter';
import { generateCSVReport } from './reporter/csvReporter';
import { generateJSONReport } from './reporter/jsonReporter';
import { buildCoverage } from './coverage';
import { AuditReport, AuditConfig, PageAuditResult, AuditViolation } from './types';
import config from './config';
import fs from 'fs';
import path from 'path';

function buildDynamicConfig(targetUrl: string): AuditConfig {
  const outputDir = process.env.OUTPUT_DIR ?? path.join(process.cwd(), 'audit-results');
  const csvDir = path.join(outputDir, 'crawled-urls');
  const csvPath = path.join(csvDir, 'urls.csv');

  const pages = fs.existsSync(csvPath)
    ? fs.readFileSync(csvPath, 'utf8')
        .split('\n')
        .map(l => l.trim().replace(/^"|"$/g, ''))
        .filter(l => l.startsWith('http'))
        .map((url, i) => ({ name: `Page ${i + 1}`, url, waitFor: 'body' as const }))
    : [{ name: 'Homepage', url: targetUrl, waitFor: 'body' as const }];

  return {
    ...config,
    outputDir,
    pages,
    coverageSourceDir: fs.existsSync(csvDir) ? csvDir : undefined,
  };
}

async function main(): Promise<void> {
  const targetUrl = process.env.TARGET_URL;
  const auditConfig: AuditConfig = targetUrl ? buildDynamicConfig(targetUrl) : config;
  const reportTargetUrl = targetUrl ?? 'https://www.cibil.com';

  // Ensure output directory exists
  fs.mkdirSync(auditConfig.outputDir, { recursive: true });

  const startTime = Date.now();

  // Run the audit
  const pageResults: PageAuditResult[] = await runAudit(auditConfig);

  // Build summary
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
      targetUrl: reportTargetUrl,
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
    coverage: buildCoverage(auditConfig),
  };

  // Generate reports
  const htmlPath = generateHTMLReport(report, config.outputDir);
  const csvPath = generateCSVReport(report, config.outputDir);
  const jsonPath = generateJSONReport(report, config.outputDir);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n${'='.repeat(60)}`);
  console.log('  AUDIT COMPLETE');
  console.log(`${'='.repeat(60)}`);
  console.log(`\nTotal violations found: ${report.summary.totalViolations}`);
  console.log(`  Critical : ${report.summary.critical}`);
  console.log(`  Serious  : ${report.summary.serious}`);
  console.log(`  Moderate : ${report.summary.moderate}`);
  console.log(`  Minor    : ${report.summary.minor}`);
  console.log(`\nTop violated clauses:`);

  const topClauses = Object.entries(byClause)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  for (const [clause, count] of topClauses) {
    console.log(`  IS 17802 / ${clause} — ${count} violation(s)`);
  }

  console.log(`\nReports saved to: ${auditConfig.outputDir}`);
  console.log(`  HTML   : ${path.basename(htmlPath)}`);
  console.log(`  CSV    : ${path.basename(csvPath)}`);
  console.log(`  JSON   : ${path.basename(jsonPath)}`);
  console.log(`\nTime elapsed: ${elapsed}s`);
  console.log(`\nNOTE: Automated tools detect ~30-40% of issues.`);
  console.log(`Manual testing with NVDA/VoiceOver is required for full IS 17802 conformance.\n`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
