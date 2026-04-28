/**
 * Regenerate HTML/CSV reports from existing JSON without re-running the audit.
 * Usage: npx ts-node src/regenerate.ts
 */
import { generateHTMLReport } from './reporter/htmlReporter';
import { generateCSVReport } from './reporter/csvReporter';
import { AuditReport } from './types';
import path from 'path';
import fs from 'fs';

const outputDir = path.join(process.cwd(), 'audit-results');
const jsonPath = path.join(outputDir, 'accessibility-report.json');

if (!fs.existsSync(jsonPath)) {
  console.error('No existing report found at', jsonPath);
  process.exit(1);
}

const report: AuditReport = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const htmlPath = generateHTMLReport(report, outputDir);
const csvPath = generateCSVReport(report, outputDir);

console.log('Reports regenerated:');
console.log(' HTML:', htmlPath);
console.log(' CSV: ', csvPath);
