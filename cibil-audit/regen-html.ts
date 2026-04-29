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

const outputDir = process.env.OUTPUT_DIR ?? path.join(process.cwd(), 'audit-results');
const jsonPath = path.join(outputDir, 'accessibility-report.json');
const report: AuditReport = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Re-build coverage from CSV files (in case config changed)
report.coverage = buildCoverage(config);

const htmlPath = generateHTMLReport(report, outputDir);
console.log(`\nHTML report regenerated: ${htmlPath}\n`);
