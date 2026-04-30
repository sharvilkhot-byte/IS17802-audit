import { chromium, Browser, Page } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { runCustomChecks } from './checks/customChecks';
import { runIbmChecks } from './checks/ibmChecker';
import { getClause } from './mapper/clauseMapper';
import { AuditConfig, PageAuditResult, AuditViolation, PageConfig } from './types';
import path from 'path';
import fs from 'fs';

let issueCounter = 0;

function nextId(): string {
  return `A${String(++issueCounter).padStart(4, '0')}`;
}

// Restart browser every N pages to prevent GPU/memory accumulation crashes
const BROWSER_RESTART_INTERVAL = 50;

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

const CHECKPOINT_FILE = (outputDir: string) => path.join(outputDir, '.audit-checkpoint.json');

function loadCheckpoint(outputDir: string): Record<string, PageAuditResult> {
  try {
    const file = CHECKPOINT_FILE(outputDir);
    if (!fs.existsSync(file)) return {};
    const raw = fs.readFileSync(file, 'utf-8').trim();
    if (!raw || !raw.startsWith('{')) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function saveCheckpoint(outputDir: string, results: Record<string, PageAuditResult>) {
  try {
    const tmp = CHECKPOINT_FILE(outputDir) + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(results), 'utf-8');
    fs.renameSync(tmp, CHECKPOINT_FILE(outputDir));
  } catch { /* non-fatal */ }
}

export function clearCheckpoint(outputDir: string) {
  try { fs.unlinkSync(CHECKPOINT_FILE(outputDir)); } catch { /* already gone */ }
}

export async function runAudit(config: AuditConfig): Promise<PageAuditResult[]> {
  const results: PageAuditResult[] = [];

  // Ensure screenshots directory exists
  const screenshotDir = path.join(config.outputDir, 'screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });

  // Load checkpoint — resume from where a previous crashed audit left off
  const checkpoint = loadCheckpoint(config.outputDir);
  const resuming = Object.keys(checkpoint).length > 0;

  console.log(`\n${'='.repeat(60)}`);
  console.log('  IS 17802 Accessibility Audit — CIBIL Website');
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Mode: ${config.headless ? 'Headless' : 'Visible browser'}`);
  console.log(`Pages to audit: ${config.pages.length}`);
  if (resuming) {
    console.log(`Resuming from checkpoint — ${Object.keys(checkpoint).length} pages already done\n`);
  } else {
    console.log('');
  }

  let browser = await launchBrowser(config.headless);
  let pagesSinceRestart = 0;

  try {
    for (const pageConfig of config.pages) {
      if (pageConfig.requiresAuth) {
        console.log(`⚠  Skipping "${pageConfig.name}" — requires authentication`);
        continue;
      }

      // Resume: use checkpointed result if this page was already audited
      if (checkpoint[pageConfig.url]) {
        results.push(checkpoint[pageConfig.url]);
        process.stdout.write(`  ↩ ${pageConfig.name} (restored from checkpoint)\n`);
        continue;
      }

      // Restart browser periodically to clear accumulated memory
      if (pagesSinceRestart > 0 && pagesSinceRestart % BROWSER_RESTART_INTERVAL === 0) {
        await browser.close().catch(() => {});
        browser = await launchBrowser(config.headless);
        pagesSinceRestart = 0;
      }

      const result = await auditPage(browser, pageConfig, config, screenshotDir);
      results.push(result);
      pagesSinceRestart++;

      // Save to checkpoint immediately after each page
      checkpoint[pageConfig.url] = result;
      saveCheckpoint(config.outputDir, checkpoint);

      const criticalCount = result.violations.filter(v => v.impact === 'critical').length;
      const seriousCount = result.violations.filter(v => v.impact === 'serious').length;

      console.log(`  ✓ ${pageConfig.name}`);
      console.log(`    Violations: ${result.violations.length} (Critical: ${criticalCount}, Serious: ${seriousCount})\n`);
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return results;
}

async function auditPage(
  browser: Browser,
  pageConfig: PageConfig,
  config: AuditConfig,
  screenshotDir: string,
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

    // Additional wait for dynamic content
    await page.waitForTimeout(2000);

    // Run any configured page actions (click cookie banners, etc.)
    if (pageConfig.actions) {
      for (const action of pageConfig.actions) {
        await performAction(page, action);
      }
    }

    // Get page title
    pageTitle = await page.title();

    // Take screenshot — use viewport-only (not fullPage) to avoid GPU memory exhaustion on large pages
    const screenshotPath = path.join(screenshotDir, `${sanitizeFilename(pageConfig.name)}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

    // ── Run axe-core ──────────────────────────────────────────────────────
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze()
      .catch(err => {
        console.error(`  axe error on ${pageConfig.name}:`, err.message);
        return { violations: [], incomplete: [], passes: [] };
      });

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
          html: n.html,
          target: n.target.map(t => String(t)),
          failureSummary: n.failureSummary ?? '',
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
          html: n.html,
          target: n.target.map(t => String(t)),
          failureSummary: n.failureSummary ?? '',
        })),
      });
    }

    // ── Run custom checks ─────────────────────────────────────────────────
    const customResults = await runCustomChecks(page, pageConfig.url);
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

    // ── Run IBM Equal Access checks ───────────────────────────────────────
    const ibmResults = await runIbmChecks(page);
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
    screenshotPath: path.join('screenshots', `${sanitizeFilename(pageConfig.name)}.png`),
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

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}
