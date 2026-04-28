import { AuditReport } from '../types';
import path from 'path';
import fs from 'fs';

export function generateCSVReport(report: AuditReport, outputDir: string): string {
  const rows: string[] = [];

  // Header
  rows.push([
    'Issue ID',
    'Page',
    'URL',
    'IS 17802 Clause',
    'WCAG SC',
    'WCAG Title',
    'Level',
    'Principle',
    'Impact / Severity',
    'Source',
    'Description',
    'Help / Guidance',
    'Element HTML (excerpt)',
    'Failure Summary',
    'Reference URL',
    'Status',
    'Assigned To',
    'Fix Due Date',
    'Notes',
  ].map(csvEscape).join(','));

  for (const page of report.pages) {
    for (const v of page.violations) {
      const firstNode = v.nodes[0];
      rows.push([
        v.id,
        page.page,
        page.url,
        `IS 17802 / ${v.clause.clause}`,
        `WCAG ${v.clause.wcag}`,
        v.clause.title,
        v.clause.level,
        v.clause.principle,
        v.impact.toUpperCase(),
        v.source,
        v.description,
        v.help,
        firstNode?.html?.substring(0, 200) ?? '',
        firstNode?.failureSummary ?? '',
        v.helpUrl,
        'Open',           // Status — for tracking
        '',               // Assigned To — fill manually
        '',               // Fix Due Date — fill manually
        '',               // Notes — fill manually
      ].map(csvEscape).join(','));
    }
  }

  const outputPath = path.join(outputDir, 'accessibility-findings.csv');
  fs.writeFileSync(outputPath, rows.join('\n'), 'utf-8');
  return outputPath;
}

function csvEscape(value: string): string {
  const str = String(value ?? '').replace(/"/g, '""');
  return `"${str}"`;
}
