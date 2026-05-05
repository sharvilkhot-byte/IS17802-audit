import { AuditReport } from '../types';
import path from 'path';
import fs from 'fs';

export function generateJSONReport(report: AuditReport, outputDir: string): string {
  // Write only meta + summary + coverage — NOT pages/violations.
  // Full violation data lives in violations.json (slim) and the HTML report.
  // getReportMeta() on the server only reads meta/summary, so pages are not needed here.
  // Writing JSON.stringify(report) with all pages would create a 50-200 MB string
  // for large audits (uncapped node HTML), blocking the Node.js event loop until OOM.
  const outputPath = path.join(outputDir, 'accessibility-report.json');
  const slim = { meta: report.meta, summary: report.summary, coverage: report.coverage };
  fs.writeFileSync(outputPath, JSON.stringify(slim, null, 2), 'utf-8');
  return outputPath;
}
