import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { hasDb, initDb, saveAudit, listAudits, getAuditHtml, getReportFromFs } from './db';

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_RESULTS_DIR = path.join(process.cwd(), 'audit-results');
const PUBLIC_DIR       = path.join(process.cwd(), 'public');
const STATE_FILE       = path.join(BASE_RESULTS_DIR, '.audit-state.json');

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
  auditId: string | null;
  reportId: number | null;
  log: string[];
}

const state: AuditState = {
  running: false,
  phase: 'idle',
  startedAt: null,
  completedAt: null,
  lastError: null,
  targetUrl: null,
  auditId: null,
  reportId: null,
  log: [],
};

// ─── State persistence ────────────────────────────────────────────────────────
// Saves state to disk so progress survives container restarts and page refreshes.
// Writes are debounced to avoid hammering the filesystem on every log line.

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function persistState() {
  if (persistTimer) return; // already scheduled
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      fs.mkdirSync(BASE_RESULTS_DIR, { recursive: true });
      const tmp = STATE_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(state), 'utf-8');
      fs.renameSync(tmp, STATE_FILE); // atomic replace — prevents corrupt reads
    } catch { /* non-fatal */ }
  }, 500);
}

function restoreState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return;
    const raw = fs.readFileSync(STATE_FILE, 'utf-8').trim();
    if (!raw || !raw.startsWith('{')) return; // guard against empty/corrupt file
    const saved = JSON.parse(raw) as AuditState;
    // If process was killed mid-run, mark as error so UI doesn't show stuck spinner
    Object.assign(state, {
      ...saved,
      running: false,
      phase: saved.running ? 'error' : (saved.phase ?? 'idle'),
      lastError: saved.running ? 'Server restarted mid-audit — please run again' : saved.lastError,
    });
  } catch { /* ignore any corrupt/missing file */ }
}

const progressBus = new EventEmitter();
progressBus.setMaxListeners(50);

function push(type: string, message: string, extra: object = {}) {
  const entry = { type, message, ts: new Date().toISOString(), ...extra };
  if (type === 'log') state.log.push(message);
  progressBus.emit('event', JSON.stringify(entry));
  persistState();
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

// Unique audit progress page — /audit/:id
app.get('/audit/:id', (req: Request, res: Response) => {
  if (state.auditId === req.params.id) {
    // Audit is complete — redirect straight to the report
    if (state.phase === 'complete' && state.reportId) {
      return res.redirect(`/report?id=${state.reportId}`);
    }
    // Audit still in progress — serve the progress UI
    return res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  }
  // Unknown/old audit ID — serve the app (will show current state)
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Report page — ?id=123 (DB) or ?site=hostname (filesystem fallback)
app.get('/report', async (req: Request, res: Response) => {
  const id = req.query.id ? parseInt(req.query.id as string, 10) : null;

  if (id && hasDb()) {
    const html = await getAuditHtml(id);
    if (!html) return res.status(404).send('Report not found.');
    return res.type('html').send(html);
  }

  // Filesystem fallback
  const site = req.query.site as string | undefined;
  const dir = site ? path.join(BASE_RESULTS_DIR, site) : BASE_RESULTS_DIR;
  const html = getReportFromFs(dir);
  if (!html) return res.status(404).send('No report found. Run an audit first.');
  res.type('html').send(html);
});

// Current state
app.get('/api/status', (_req: Request, res: Response) => {
  const dir = resultsDirFor(state.targetUrl);
  res.json({ ...state, meta: getReportMeta(dir) });
});

// All completed reports
app.get('/api/reports', async (_req: Request, res: Response) => {
  if (hasDb()) {
    const rows = await listAudits();
    res.json(rows.map(r => ({
      id:              r.id,
      targetUrl:       r.target_url,
      hostname:        r.hostname,
      auditedAt:       r.audited_at,
      totalPages:      r.total_pages,
      totalViolations: r.total_violations,
      critical:        r.critical,
      serious:         r.serious,
      moderate:        r.moderate,
      minor:           r.minor,
    })));
  } else {
    res.json(getAllReports());
  }
});

// SSE — live progress stream
app.get('/api/progress', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Railway/nginx proxy buffering
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send current state immediately on connect
  res.write(`data: ${JSON.stringify({ type: 'state', ...state, meta: getReportMeta() })}\n\n`);

  const onEvent = (data: string) => res.write(`data: ${data}\n\n`);
  progressBus.on('event', onEvent);

  // Keepalive heartbeat every 15s — prevents Railway/HTTP2 from closing idle SSE connections
  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    progressBus.off('event', onEvent);
    clearInterval(heartbeat);
  });
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

  const auditId = randomUUID().slice(0, 8); // short 8-char ID
  state.running   = true;
  state.phase     = 'crawling';
  state.startedAt = new Date().toISOString();
  state.completedAt = null;
  state.lastError = null;
  state.targetUrl = targetUrl ?? null;
  state.auditId   = auditId;
  state.reportId  = null;
  state.log       = [];
  persistState();

  res.json({ started: true, auditId });

  runAudit(targetUrl);
});

// ─── Audit runner ─────────────────────────────────────────────────────────────

function runAudit(targetUrl?: string) {
  const label = targetUrl ?? 'the target site';
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
    .then(async () => {
      state.phase       = 'complete';
      state.running     = false;
      state.completedAt = new Date().toISOString();

      // Save to DB if configured
      let savedId: number | null = null;
      if (hasDb()) {
        try {
          const meta = getReportMeta(outputDir);
          const html = getReportFromFs(outputDir);
          if (meta && html) {
            const hostname = (() => { try { return new URL(targetUrl ?? '').hostname; } catch { return 'unknown'; } })();
            state.reportId = null; // will be set below
            savedId = await saveAudit({
              targetUrl:       targetUrl ?? meta.targetUrl ?? 'unknown',
              hostname,
              auditedAt:       meta.auditedAt ?? new Date().toISOString(),
              totalPages:      meta.totalPages ?? 0,
              totalViolations: meta.totalViolations ?? 0,
              critical:        meta.critical ?? 0,
              serious:         meta.serious ?? 0,
              moderate:        meta.moderate ?? 0,
              minor:           meta.minor ?? 0,
              reportHtml:      html,
            });
            state.reportId = savedId;
            push('log', `Report saved to database (id: ${savedId})`, { phase: 'complete' });
          }
        } catch (dbErr) {
          push('log', `Warning: DB save failed — ${(dbErr as Error).message}`, { phase: 'complete' });
        }
      }

      push('complete', 'Audit complete — report is ready.', {
        phase: 'complete',
        meta:  getReportMeta(outputDir),
        reportId: savedId,
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
      shell: false,
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

restoreState();

initDb()
  .then(() => {
    if (hasDb()) console.log('  Database connected and schema ready');
  })
  .catch(err => console.warn('  DB init warning:', err.message));

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  IS 17802 Audit Tool`);
  console.log(`${'='.repeat(50)}`);
  console.log(`  Server running at http://localhost:${PORT}`);
  console.log(`  Database: ${hasDb() ? 'PostgreSQL' : 'filesystem (no DATABASE_URL set)'}`);
  console.log(`  Open the URL above in your browser\n`);
});
