import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_RESULTS_DIR = path.join(process.cwd(), 'audit-results');
const PUBLIC_DIR       = path.join(process.cwd(), 'public');

app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use('/audit-results', express.static(BASE_RESULTS_DIR));

function resultsDirFor(targetUrl?: string | null): string {
  if (!targetUrl) return BASE_RESULTS_DIR;
  try {
    const hostname = new URL(targetUrl).hostname.replace(/[^a-z0-9.-]/gi, '_');
    return path.join(BASE_RESULTS_DIR, hostname);
  } catch { return BASE_RESULTS_DIR; }
}

// ─── Audit state ─────────────────────────────────────────────────────────────

interface AuditState {
  running: boolean;
  phase: 'idle' | 'crawling' | 'auditing' | 'generating' | 'complete' | 'error';
  startedAt: string | null;
  completedAt: string | null;
  lastError: string | null;
  targetUrl: string | null;
  log: string[];
}

const state: AuditState = {
  running: false,
  phase: 'idle',
  startedAt: null,
  completedAt: null,
  lastError: null,
  targetUrl: null,
  log: [],
};

const progressBus = new EventEmitter();
progressBus.setMaxListeners(50);

function push(type: string, message: string, extra: object = {}) {
  const entry = { type, message, ts: new Date().toISOString(), ...extra };
  if (type === 'log') state.log.push(message);
  progressBus.emit('event', JSON.stringify(entry));
}

// ─── Report meta ──────────────────────────────────────────────────────────────

function getReportMeta(dir?: string) {
  const d = dir ?? BASE_RESULTS_DIR;
  const jsonPath = path.join(d, 'accessibility-report.json');
  const htmlPath = path.join(d, 'accessibility-report.html');
  if (!fs.existsSync(jsonPath)) return null;
  try {
    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    return {
      auditedAt:      report.meta?.auditedAt ?? null,
      targetUrl:      report.meta?.targetUrl ?? null,
      totalPages:     report.meta?.totalPages ?? 0,
      totalViolations:report.summary?.totalViolations ?? 0,
      critical:       report.summary?.critical ?? 0,
      serious:        report.summary?.serious ?? 0,
      moderate:       report.summary?.moderate ?? 0,
      minor:          report.summary?.minor ?? 0,
      reportExists:   fs.existsSync(htmlPath),
      reportPath:     path.relative(BASE_RESULTS_DIR, htmlPath).replace(/\\/g, '/'),
    };
  } catch { return null; }
}

/** Return meta for every site that has a completed report */
function getAllReports() {
  const reports = [];
  // CIBIL default
  const cibil = getReportMeta(BASE_RESULTS_DIR);
  if (cibil) reports.push(cibil);
  // Per-hostname subdirs
  if (fs.existsSync(BASE_RESULTS_DIR)) {
    for (const entry of fs.readdirSync(BASE_RESULTS_DIR, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const meta = getReportMeta(path.join(BASE_RESULTS_DIR, entry.name));
        if (meta) reports.push(meta);
      }
    }
  }
  return reports;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Landing page
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Report page — ?site=hostname for per-site reports
app.get('/report', (req: Request, res: Response) => {
  const site = req.query.site as string | undefined;
  const dir = site ? path.join(BASE_RESULTS_DIR, site) : BASE_RESULTS_DIR;
  const htmlPath = path.join(dir, 'accessibility-report.html');
  if (!fs.existsSync(htmlPath)) {
    return res.status(404).send('No report found. Run an audit first.');
  }
  res.sendFile(htmlPath);
});

// Current state + report meta for active/last audit
app.get('/api/status', (_req: Request, res: Response) => {
  const dir = resultsDirFor(state.targetUrl);
  res.json({ ...state, meta: getReportMeta(dir), reports: getAllReports() });
});

// All completed reports
app.get('/api/reports', (_req: Request, res: Response) => {
  res.json(getAllReports());
});

// SSE — live progress stream
app.get('/api/progress', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current state immediately on connect
  res.write(`data: ${JSON.stringify({ type: 'state', ...state, meta: getReportMeta() })}\n\n`);

  const onEvent = (data: string) => res.write(`data: ${data}\n\n`);
  progressBus.on('event', onEvent);

  req.on('close', () => progressBus.off('event', onEvent));
});

// Trigger new audit
app.post('/api/audit/start', (req: Request, res: Response) => {
  if (state.running) {
    return res.status(409).json({ error: 'Audit already running' });
  }

  const targetUrl: string | undefined = req.body?.url;
  if (targetUrl) {
    try { new URL(targetUrl); } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }
  }

  state.running   = true;
  state.phase     = 'crawling';
  state.startedAt = new Date().toISOString();
  state.completedAt = null;
  state.lastError = null;
  state.targetUrl = targetUrl ?? null;
  state.log       = [];

  res.json({ started: true });

  runAudit(targetUrl);
});

// ─── Audit runner ─────────────────────────────────────────────────────────────

function runAudit(targetUrl?: string) {
  const label = targetUrl ? targetUrl : 'CIBIL website';
  push('phase', `Crawling ${label} for URLs…`, { phase: 'crawling', targetUrl: targetUrl ?? null });
  state.phase = 'crawling';

  const outputDir = resultsDirFor(targetUrl);
  const extraEnv: Record<string, string> = {
    ...(targetUrl ? { TARGET_URL: targetUrl } : {}),
    OUTPUT_DIR: outputDir,
  };

  runProcess('node', ['dist/crawl-urls.js'], 'crawling', extraEnv)
    .then(() => {
      push('phase', 'Running IS 17802 accessibility audit on all pages…', { phase: 'auditing' });
      state.phase = 'auditing';
      return runProcess('node', ['dist/src/index.js'], 'auditing', extraEnv);
    })
    .then(() => {
      push('phase', 'Generating HTML report…', { phase: 'generating' });
      state.phase = 'generating';
      return runProcess('node', ['dist/regen-html.js'], 'generating', extraEnv);
    })
    .then(() => {
      state.phase       = 'complete';
      state.running     = false;
      state.completedAt = new Date().toISOString();
      push('complete', 'Audit complete — report is ready.', {
        phase: 'complete',
        meta: getReportMeta(outputDir),
      });
    })
    .catch((err: Error) => {
      state.phase     = 'error';
      state.running   = false;
      state.lastError = err.message;
      push('error', `Audit failed: ${err.message}`, { phase: 'error' });
    });
}

function runProcess(cmd: string, args: string[], phase: string, extraEnv: Record<string, string> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: process.cwd(),
      shell: true,
      env: { ...process.env, HEADLESS: 'true', ...extraEnv },
    });

    child.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        push('log', line.trim(), { phase });
      }
    });

    child.stderr.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        if (!line.includes('ExperimentalWarning') && !line.includes('DeprecationWarning')) {
          push('log', line.trim(), { phase });
        }
      }
    });

    child.on('close', (code: number) => {
      if (code === 0) resolve();
      else reject(new Error(`Process exited with code ${code}`));
    });

    child.on('error', reject);
  });
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  IS 17802 Audit Tool`);
  console.log(`${'='.repeat(50)}`);
  console.log(`  Server running at http://localhost:${PORT}`);
  console.log(`  Open the URL above in your browser\n`);
});
