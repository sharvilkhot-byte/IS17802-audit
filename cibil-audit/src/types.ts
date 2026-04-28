export interface AuditConfig {
  pages: PageConfig[];
  outputDir: string;
  headless: boolean;
  viewport: { width: number; height: number };
  timeout: number;
  coverageSourceDir?: string; // path to folder containing urls.csv etc.
}

export type CoverageStatus =
  | 'audited'
  | 'skipped-auth'
  | 'skipped-external'
  | 'skipped-anchor'
  | 'skipped-duplicate'
  | 'manual-pdf';

export interface CoverageEntry {
  url: string;
  normalised: string;
  status: CoverageStatus;
  lang: 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'other';
  auditedAs?: string;   // config page name when status === 'audited'
  reason: string;       // human-readable explanation
}

export interface CoverageSummary {
  total: number;
  audited: number;
  skippedAuth: number;
  skippedExternal: number;
  skippedAnchor: number;
  skippedDuplicate: number;
  manualPdf: number;
  entries: CoverageEntry[];
}

export interface PageConfig {
  name: string;
  url: string;
  waitFor?: string;         // CSS selector to wait for before auditing
  requiresAuth?: boolean;
  actions?: PageAction[];   // steps to take before auditing (e.g. click, fill)
}

export interface PageAction {
  type: 'click' | 'fill' | 'wait' | 'hover' | 'press';
  selector?: string;
  value?: string;
  ms?: number;
}

export interface IS17802Clause {
  clause: string;           // e.g. "9.1.1.1"
  wcag: string;             // e.g. "1.1.1"
  title: string;            // e.g. "Non-text Content"
  level: 'A' | 'AA' | 'AAA';
  principle: 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';
}

export interface AuditViolation {
  id: string;               // issue ID (auto-generated)
  ruleId: string;           // axe rule id or custom check id
  clause: IS17802Clause;
  page: string;             // page name
  url: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: ViolationNode[];
  source: 'axe' | 'ibm' | 'custom';
}

export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
}

export interface CustomCheckResult {
  ruleId: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  nodes: ViolationNode[];
}

export interface PageAuditResult {
  page: string;
  url: string;
  timestamp: string;
  violations: AuditViolation[];
  incomplete: AuditViolation[];
  passes: number;
  screenshotPath?: string;
  pageTitle: string;
  loadTimeMs: number;
}

export interface AuditReport {
  meta: {
    auditedAt: string;
    toolVersion: string;
    standard: string;
    targetUrl: string;
    totalPages: number;
  };
  summary: {
    totalViolations: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    byClause: Record<string, number>;
    byPage: Record<string, number>;
  };
  pages: PageAuditResult[];
  coverage?: CoverageSummary;
}
