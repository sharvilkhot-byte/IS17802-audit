/**
 * Regenerates the HTML report from the existing accessibility-report.json
 * without re-running the full browser audit.
 * Usage: npx ts-node regen-html.ts
 */
import fs from 'fs';
import path from 'path';
import { generateHTMLReport } from './src/reporter/htmlReporter';
import { buildCoverage } from './src/coverage';
import { AuditReport } from './src/types';
import config from './src/config';

const jsonPath = path.join(process.cwd(), 'audit-results', 'accessibility-report.json');
const report: AuditReport = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Re-build coverage from CSV files (in case config changed)
report.coverage = buildCoverage(config);

const htmlPath = generateHTMLReport(report, path.join(process.cwd(), 'audit-results'));
console.log(`\nHTML report regenerated: ${htmlPath}\n`);
