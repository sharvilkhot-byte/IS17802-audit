import { chromium, Browser, Page } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { runCustomChecks } from './checks/customChecks';
import { runIbmChecks } from './checks/ibmChecker';
import { getClause } from './mapper/clauseMapper';
import { AuditConfig, PageAuditResult, AuditViolation, PageConfig } from './types';
import { hasDb, saveCheckpointDb, loadCheckpointDb, clearCheckpointDb } from './db';
import path from 'path';
import fs from 'fs';

let issueCounter = 0;

function nextId(): string {
  return `A${String(++issueCounter).padStart(4, '0')}`;
}

// Restart browser every N pages to prevent GPU/memory accumulation crashes
const BROWSER_RESTART_INTERVAL = 50;

// Number of pages to audit concurrently (tune based on RAM & target rate limits)
const CONCURRENCY = parseInt(process.env.AUDIT_CONCURRENCY ?? '4', 10);

function launchBrowser(headless: boolean) {
  return chromium.launch({
    headless,
    args: [
      '--disable-web-security',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',                        // prevents GPU process crashes
      '--disable-software-rasterizer',
      '--disable-dev-shm-usage',              // use /tmp instead of /dev/shm
      '--disable-background-networking',
      '--disable-extensions',
      '--disable-default-apps',
      '--mute-audio',
      '--no-first-run',
      '--js-flags=--max-old-space-size=512',  // cap JS heap per browser instance
    ],
  });
}

/** Close a browser with a hard 10-second timeout.
 *  Playwright's browser.close() can hang indefinitely if the browser process
 *  gets stuck — without a timeout Promise.all(workers) never resolves. */
async function closeBrowser(browser: import('playwright').Browser): Promise<void> {
  await Promise.race([
    browser.close(),
    new Promise<void>(resolve => setTimeout(resolve, 10_000)),
  ]).catch(() => {});
}

const CHECKPOINT_FILE = (outputDir: string) => path.join(outputDir, '.audit-checkpoint.json');

/** Derive a stable hostname key from the output directory path */
function hostnameKey(outputDir: string): string {
  return path.basename(outputDir) || 'default';
}

/** Load checkpoint — DB first (survives container restarts), filesystem fallback */
async function loadCheckpoint(outputDir: string): Promise<Record<string, PageAuditResult>> {
  if (hasDb()) {
    try {
      const data = await loadCheckpointDb(hostnameKey(outputDir));
      if (Object.keys(data).length > 0) return data as Record<string, PageAuditResult>;
    } catch { /* fall through to filesystem */ }
  }
  // Filesystem fallback (local dev / no DB)
  try {
    const file = CHECKPOINT_FILE(outputDir);
    if (!fs.existsSync(file)) return {};
    const raw = fs.readFileSync(file, 'utf-8').trim();
    if (!raw || !raw.startsWith('{')) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

// Checkpoint save throttle — serialize at most once every N completions.
// With 1000+ pages, JSON.stringify(results) can be 100-200 MB and takes
// several seconds, blocking the Node.js event loop and preventing timers
// (e.g. closeBrowser timeout) from firing. Saving every 20 pages reduces
// I/O by 50× with at most 20-page rollback on crash.
const CHECKPOINT_EVERY_N = 20;
let _checkpointCounter = 0;

/** Save checkpoint — throttled filesystem write + fire-and-forget DB upsert */
async function saveCheckpoint(
  outputDir: string,
  results: Record<string, PageAuditResult>,
  force = false,
): Promise<void> {
  _checkpointCounter++;
  const shouldWrite = force || (_checkpointCounter % CHECKPOINT_EVERY_N === 0);

  // Filesystem — only on throttle ticks to avoid blocking the event loop.
  // Skip entirely for large audits (>500 pages): the DB handles persistence.
  if (shouldWrite && Object.keys(results).length <= 500) {
    try {
      const tmp = CHECKPOINT_FILE(outputDir) + '.tmp';
      // Yield to the event loop before the synchronous JSON.stringify so
      // pending timer callbacks (e.g. closeBrowser timeout) can fire first.
      await new Promise<void>(r => setImmediate(r));
      fs.writeFileSync(tmp, JSON.stringify(results), 'utf-8');
      fs.renameSync(tmp, CHECKPOINT_FILE(outputDir));
    } catch { /* non-fatal */ }
  }

  // Database (persists across container restarts) — fire-and-forget.
  // Also throttled: avoids sending a 100-200 MB JSONB payload to Postgres
  // on every single page completion.
  if (shouldWrite && hasDb()) {
    saveCheckpointDb(hostnameKey(outputDir), results).catch(() => { /* non-fatal */ });
  }
}

/** Clear checkpoint on successful audit completion */
export async function clearCheckpoint(outputDir: string): Promise<void> {
  try { fs.unlinkSync(CHECKPOINT_FILE(outputDir)); } catch { /* already gone */ }
  if (hasDb()) {
    clearCheckpointDb(hostnameKey(outputDir)).catch(() => { /* non-fatal */ });
  }
}

export async function runAudit(config: AuditConfig): Promise<PageAuditResult[]> {
  // Load checkpoint — DB-backed so it survives container restarts on Railway
  const checkpoint = await loadCheckpoint(config.outputDir);
  const restoredCount = Object.keys(checkpoint).length;
  const resuming = restoredCount > 0;

  console.log(`\n${'='.repeat(60)}`);
  console.log('  IS 17802 Accessibility Audit');
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Mode: ${config.headless ? 'Headless' : 'Visible browser'}`);
  console.log(`Concurrency: ${CONCURRENCY} parallel workers`);

  // Total auditable pages (excludes requiresAuth)
  const auditablePages = config.pages.filter(p => !p.requiresAuth);
  const totalPages = auditablePages.length;

  // Collect already-completed results from checkpoint (no per-page log spam)
  const results: PageAuditResult[] = [];
  for (const pageConfig of auditablePages) {
    if (checkpoint[pageConfig.url]) {
      results.push(checkpoint[pageConfig.url]);
    }
  }

  if (resuming) {
    console.log(`Resuming — ${restoredCount}/${totalPages} pages restored from checkpoint, ${totalPages - restoredCount} remaining\n`);
  } else {
    console.log(`Pages to audit: ${totalPages}\n`);
  }

  // Emit initial progress so the UI immediately shows the restored count
  process.stdout.write(`[PROGRESS] ${results.length}/${totalPages}\n`);

  // Build queue of pages that still need auditing
  const queue: PageConfig[] = auditablePages.filter(p => !checkpoint[p.url]);

  // Shared state — safe in single-threaded Node.js
  const checkpointData: Record<string, PageAuditResult> = { ...checkpoint };
  let doneCount = results.length; // includes restored pages

  // Worker: pulls pages from the shared queue until empty
  async function worker(): Promise<void> {
    let browser = await launchBrowser(config.headless);
    let pagesSinceRestart = 0;

    try {
      while (queue.length > 0) {
        const pageConfig = queue.shift();
        if (!pageConfig) break;

        // Restart browser periodically to clear accumulated memory
        if (pagesSinceRestart > 0 && pagesSinceRestart % BROWSER_RESTART_INTERVAL === 0) {
          await closeBrowser(browser);
          browser = await launchBrowser(config.headless);
          pagesSinceRestart = 0;
        }

        // Hard 90-second per-page timeout — last resort if any engine stalls.
        // The inner check-engine timeouts (axe: 45s, custom: 60s, ibm: 35s)
        // should fire first; this catches anything else (page.goto hang, etc.).
        const PAGE_TIMEOUT_MS = 90_000;
        const result = await Promise.race([
          auditPage(browser, pageConfig, config),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Page audit timed out after ${PAGE_TIMEOUT_MS / 1000}s`)), PAGE_TIMEOUT_MS),
          ),
        ]).catch(err => {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`  Timeout/error on ${pageConfig.name}: ${errorMsg}`);
          return {
            page: pageConfig.name,
            url: pageConfig.url,
            timestamp: new Date().toISOString(),
            violations: [{
              id: nextId(),
              ruleId: 'page-audit-timeout',
              clause: { clause: '9.4.1.2', wcag: '4.1.2', title: 'Name, Role, Value', level: 'AA' as const, principle: 'Robust' as const },
              page: pageConfig.name,
              url: pageConfig.url,
              impact: 'critical' as const,
              description: `Page audit timed out: ${errorMsg}`,
              help: 'Page could not be fully audited — manual review required.',
              helpUrl: '',
              source: 'custom' as const,
              nodes: [{ html: '', target: ['body'], failureSummary: errorMsg }],
            }],
            incomplete: [],
            passes: 0,
            pageTitle: pageConfig.name,
            loadTimeMs: PAGE_TIMEOUT_MS,
            screenshotPath: '',
          };
        });
        results.push(result);
        pagesSinceRestart++;
        doneCount++;

        // Save checkpoint (throttled — see CHECKPOINT_EVERY_N above).
        // Force-save on the last page so no work is lost if we crash after.
        checkpointData[pageConfig.url] = result;
        const isLastPage = queue.length === 0;
        await saveCheckpoint(config.outputDir, checkpointData, isLastPage);

        const criticalCount = result.violations.filter(v => v.impact === 'critical').length;
        const seriousCount = result.violations.filter(v => v.impact === 'serious').length;

        console.log(`  ✓ ${pageConfig.name}`);
        console.log(`    Violations: ${result.violations.length} (Critical: ${criticalCount}, Serious: ${seriousCount})`);
        // Structured progress line — parsed by server.ts to update state.pagesAudited
        process.stdout.write(`[PROGRESS] ${doneCount}/${totalPages}\n`);
      }
    } finally {
      await closeBrowser(browser);
    }
  }

  // Launch CONCURRENCY workers in parallel
  const workersFinished = Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  // Watchdog: once every page is accounted for, give workers 30 s to finish
  // browser cleanup — then return regardless. This prevents a hung browser.close()
  // or blocked event-loop from requiring a manual force-stop + rerun.
  const watchdog = new Promise<void>(resolve => {
    const interval = setInterval(() => {
      if (doneCount >= totalPages) {
        clearInterval(interval);
        // Grace period: let workers close browsers before we bail out
        setTimeout(() => {
          if (doneCount >= totalPages) {
            console.log('[runner] All pages done — watchdog releasing after grace period');
            resolve();
          }
        }, 30_000);
      }
    }, 2_000);
  });

  await Promise.race([workersFinished, watchdog]);

  return results;
}

async function auditPage(
  browser: Browser,
  pageConfig: PageConfig,
  config: AuditConfig,
): Promise<PageAuditResult> {
  const context = await browser.newContext({
    viewport: config.viewport,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'Accept-Language': 'en-IN,en;q=0.9',
    },
  });

  const page = await context.newPage();

  // Block resources that don't affect accessibility checks.
  // Images, fonts, media, and tracking beacons are not needed for
  // axe-core / IBM / custom DOM checks — skipping them cuts load time 30–50%.
  // Stylesheets and scripts are kept: CSS is needed for contrast/visibility
  // checks, scripts for dynamic ARIA states and live regions.
  await page.route('**/*', route => {
    const type = route.request().resourceType();
    if (['image', 'media', 'font', 'other'].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  console.log(`→ Auditing: ${pageConfig.name} (${pageConfig.url})`);

  const startTime = Date.now();
  let pageTitle = pageConfig.name;
  const violations: AuditViolation[] = [];
  const incomplete: AuditViolation[] = [];

  try {
    await page.goto(pageConfig.url, {
      timeout: config.timeout,
      waitUntil: 'domcontentloaded',
    });

    // Wait for content to load
    if (pageConfig.waitFor) {
      await page.waitForSelector(pageConfig.waitFor, { timeout: 10000 }).catch(() => {});
    }

    // Wait for dynamic content — use networkidle (up to 2s) instead of a fixed sleep
    await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});

    // Run any configured page actions (click cookie banners, etc.)
    if (pageConfig.actions) {
      for (const action of pageConfig.actions) {
        await performAction(page, action);
      }
    }

    // Get page title
    pageTitle = await page.title();

    // ── Run all three check engines in parallel ───────────────────────────
    // Each engine gets its own hard timeout so a stalled browser tab can't
    // block the worker indefinitely (runCustomChecks runs 18 sequential
    // page.evaluate calls — if the page hangs mid-check it would otherwise
    // wait up to 18 × 30s = 9 minutes before Playwright's defaults fire).
    function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
      return Promise.race([p, new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))]);
    }

    const [axeResults, customResults, ibmResults] = await Promise.all([
      withTimeout(
        new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
          .analyze()
          .catch(err => {
            console.error(`  axe error on ${pageConfig.name}:`, err.message);
            return { violations: [], incomplete: [], passes: [] };
          }),
        45_000,
        { violations: [], incomplete: [], passes: [] },
      ),
      withTimeout(runCustomChecks(page, pageConfig.url), 60_000, []),
      withTimeout(runIbmChecks(page), 35_000, []),
    ]);

    // Map axe violations to IS 17802
    for (const v of axeResults.violations) {
      violations.push({
        id: nextId(),
        ruleId: v.id,
        clause: getClause(v.id),
        page: pageConfig.name,
        url: pageConfig.url,
        impact: (v.impact ?? 'minor') as AuditViolation['impact'],
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        source: 'axe',
        nodes: v.nodes.slice(0, 5).map(n => ({
          html: n.html.substring(0, 500),
          target: n.target.map(t => String(t)),
          failureSummary: (n.failureSummary ?? '').substring(0, 400),
        })),
      });
    }

    // Map axe incomplete (needs review)
    for (const v of axeResults.incomplete.slice(0, 20)) {
      incomplete.push({
        id: nextId(),
        ruleId: v.id,
        clause: getClause(v.id),
        page: pageConfig.name,
        url: pageConfig.url,
        impact: (v.impact ?? 'minor') as AuditViolation['impact'],
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        source: 'axe',
        nodes: v.nodes.slice(0, 3).map(n => ({
          html: n.html.substring(0, 500),
          target: n.target.map(t => String(t)),
          failureSummary: (n.failureSummary ?? '').substring(0, 400),
        })),
      });
    }

    // Map custom check results
    for (const c of customResults) {
      violations.push({
        id: nextId(),
        ruleId: c.ruleId,
        clause: getClause(c.ruleId),
        page: pageConfig.name,
        url: pageConfig.url,
        impact: c.impact,
        description: c.description,
        help: c.help,
        helpUrl: `https://www.w3.org/WAI/WCAG21/Understanding/${getClause(c.ruleId).wcag.replace(/\./g, '-')}`,
        source: 'custom',
        nodes: c.nodes,
      });
    }

    // Map IBM Equal Access results
    for (const r of ibmResults) {
      const clause = getClause(r.ruleId);
      violations.push({
        id: nextId(),
        ruleId: r.ruleId,
        clause,
        page: pageConfig.name,
        url: pageConfig.url,
        impact: r.impact,
        description: r.message,
        help: r.message,
        helpUrl: `https://www.ibm.com/able/requirements/checker-rule-sets#${encodeURIComponent(r.ruleId)}`,
        source: 'ibm',
        nodes: r.snippet ? [{ html: r.snippet, target: [], failureSummary: r.message }] : [],
      });
    }

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`  Error loading ${pageConfig.url}: ${errorMsg}`);
    violations.push({
      id: nextId(),
      ruleId: 'page-load-error',
      clause: getClause('document-title'),
      page: pageConfig.name,
      url: pageConfig.url,
      impact: 'critical',
      description: `Page failed to load: ${errorMsg}`,
      help: 'Page must be accessible and load correctly.',
      helpUrl: '',
      source: 'custom',
      nodes: [{ html: '', target: ['body'], failureSummary: errorMsg }],
    });
  } finally {
    await context.close();
  }

  const loadTimeMs = Date.now() - startTime;

  return {
    page: pageConfig.name,
    url: pageConfig.url,
    timestamp: new Date().toISOString(),
    violations,
    incomplete,
    passes: 0,
    pageTitle,
    loadTimeMs,
    screenshotPath: '',
  };
}

async function performAction(page: Page, action: { type: string; selector?: string; value?: string; ms?: number }): Promise<void> {
  try {
    switch (action.type) {
      case 'click':
        if (action.selector) await page.click(action.selector, { timeout: 5000 });
        break;
      case 'fill':
        if (action.selector && action.value) await page.fill(action.selector, action.value);
        break;
      case 'wait':
        await page.waitForTimeout(action.ms ?? 1000);
        break;
      case 'hover':
        if (action.selector) await page.hover(action.selector, { timeout: 5000 });
        break;
      case 'press':
        if (action.selector && action.value) await page.press(action.selector, action.value);
        break;
    }
  } catch {
    // Action failed — continue audit
  }
}
