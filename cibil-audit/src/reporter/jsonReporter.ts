import { AuditReport } from '../types';
import path from 'path';
import fs from 'fs';

export function generateJSONReport(report: AuditReport, outputDir: string): string {
  const outputPath = path.join(outputDir, 'accessibility-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  return outputPath;
}
