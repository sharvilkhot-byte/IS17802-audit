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
  pagesAudited: number;
  totalPages: number;
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
  pagesAudited: 0,
  totalPages: 0,
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

// Track the currently running child process so it can be killed on demand
let currentChild: ReturnType<typeof spawn> | null = null;

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

// Report page — ?id=123 (DB lookup for hostname → filesystem) or ?site=hostname
app.get('/report', async (req: Request, res: Response) => {
  const id = req.query.id ? parseInt(req.query.id as string, 10) : null;

  // If DB id provided, look up the hostname to find the right output directory
  if (id && hasDb()) {
    const rows = await listAudits();
    const row = rows.find(r => r.id === id);
    if (row) {
      const dir = path.join(BASE_RESULTS_DIR, row.hostname);
      const html = getReportFromFs(dir) ?? getReportFromFs(BASE_RESULTS_DIR);
      if (html) return res.type('html').send(html);
    }
    return res.status(404).send('Report not found.');
  }

  // Filesystem fallback — ?site=hostname or default dir
  const site = req.query.site as string | undefined;
  const dir = site ? path.join(BASE_RESULTS_DIR, site) : BASE_RESULTS_DIR;
  const html = getReportFromFs(dir);
  if (!html) return res.status(404).send('No report found. Run an audit first.');
  res.type('html').send(html);
});

// Current state
app.get('/api/status', (_req: Request, res: Response) => {
  const dir = resultsDirFor(state.targetUrl);
  // storageType tells the frontend whether reports will survive a restart.
  // 'database'   — DATABASE_URL is set, reports stored in PostgreSQL (persistent)
  // 'volume'     — RAILWAY_VOLUME_MOUNT_PATH is set, filesystem is a mounted volume (persistent)
  // 'filesystem' — no persistent storage configured, reports lost on container restart
  const storageType = hasDb()
    ? 'database'
    : process.env.RAILWAY_VOLUME_MOUNT_PATH
      ? 'volume'
      : 'filesystem';
  res.json({ ...state, meta: getReportMeta(dir), storageType });
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
  state.running      = true;
  state.phase        = 'crawling';
  state.startedAt    = new Date().toISOString();
  state.completedAt  = null;
  state.lastError    = null;
  state.targetUrl    = targetUrl ?? null;
  state.auditId      = auditId;
  state.reportId     = null;
  state.pagesAudited = 0;
  state.totalPages   = 0;
  state.log          = [];
  persistState();

  res.json({ started: true, auditId });

  runAudit(targetUrl);
});

// Force-stop a running audit and reset state to idle
app.post('/api/audit/stop', (_req: Request, res: Response) => {
  if (!state.running) {
    return res.status(400).json({ error: 'No audit is running' });
  }

  // Kill the child process if still alive
  if (currentChild) {
    try { currentChild.kill('SIGTERM'); } catch { /* already dead */ }
    currentChild = null;
  }

  state.running     = false;
  state.phase       = 'idle';
  state.lastError   = 'Audit stopped by user';
  state.completedAt = new Date().toISOString();
  persistState();

  push('error', 'Audit stopped by user.', { phase: 'idle' });
  res.json({ stopped: true });
});

// ─── Audit runner ─────────────────────────────────────────────────────────────

function runAudit(targetUrl?: string) {
  const label = targetUrl ?? 'the target site';
  const outputDir = resultsDirFor(targetUrl);
  const extraEnv: Record<string, string> = {
    ...(targetUrl ? { TARGET_URL: targetUrl } : {}),
    OUTPUT_DIR: outputDir,
  };

  // Skip re-crawl if urls.csv already exists from a previous run —
  // saves 30-120 seconds when resuming after a crash or force-stop.
  const urlsCsv = path.join(outputDir, 'crawled-urls', 'urls.csv');
  const hasCrawl = fs.existsSync(urlsCsv);

  if (hasCrawl) {
    push('phase', `Skipping crawl — using existing ${path.basename(urlsCsv)} (${fs.statSync(urlsCsv).size} bytes). Delete it to re-crawl.`, { phase: 'auditing', targetUrl: targetUrl ?? null });
    state.phase = 'auditing';
  } else {
    push('phase', `Crawling ${label} for URLs…`, { phase: 'crawling', targetUrl: targetUrl ?? null });
    state.phase = 'crawling';
  }

  const crawlStep = hasCrawl
    ? Promise.resolve()
    : runProcess('node', ['dist/crawl-urls.js'], 'crawling', extraEnv);

  crawlStep
    .then(() => {
      push('phase', 'Running IS 17802 accessibility audit on all pages…', { phase: 'auditing' });
      state.phase = 'auditing';
      return runProcess('node', ['dist/src/index.js'], 'auditing', extraEnv);
    })
    .then(async () => {
      state.phase       = 'complete';
      state.running     = false;
      state.completedAt = new Date().toISOString();

      // Save audit metadata to DB if configured.
      // We do NOT store the full HTML in the DB — large reports (10–100 MB)
      // would cause the insert to hang or time out. The HTML is already on disk;
      // the /report route serves it from the filesystem directly.
      let savedId: number | null = null;
      if (hasDb()) {
        try {
          const meta = getReportMeta(outputDir);
          if (meta) {
            const hostname = (() => { try { return new URL(targetUrl ?? '').hostname; } catch { return 'unknown'; } })();
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
              reportHtml:      '', // stored on filesystem, not in DB
            });
            state.reportId = savedId;
            push('log', `Audit metadata saved to database (id: ${savedId})`, { phase: 'complete' });
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
    currentChild = child;

    child.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        const trimmed = line.trim();
        // Structured progress from runner — update counters, don't add to log
        if (trimmed.startsWith('[PROGRESS] ')) {
          const m = trimmed.match(/\[PROGRESS\] (\d+)\/(\d+)/);
          if (m) {
            state.pagesAudited = parseInt(m[1], 10);
            state.totalPages   = parseInt(m[2], 10);
            persistState();
          }
          continue;
        }
        push('log', trimmed, { phase });
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
      if (currentChild === child) currentChild = null;
      if (code === 0) resolve();
      else reject(new Error(`Process exited with code ${code}`));
    });

    child.on('error', (err) => {
      if (currentChild === child) currentChild = null;
      reject(err);
    });
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
