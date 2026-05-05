/**
 * crawl-urls.ts — Fast parallel URL crawler for IS 17802 accessibility audit
 *
 * Uses Node fetch (no browser) for 10-50x faster crawling than Playwright.
 * Discovers all HTML pages reachable from TARGET_URL within the same origin,
 * streams results to crawled-urls/urls.csv as they're found.
 *
 * Env vars:
 *   TARGET_URL          Required. Starting URL to crawl.
 *   OUTPUT_DIR          Where to write urls.csv (default: ./audit-results)
 *   CRAWL_CONCURRENCY   Parallel fetch workers (default: 10)
 *   MAX_PAGES           Stop after N pages (default: 1500)
 *   CRAWL_TIMEOUT_MS    Per-request timeout in ms (default: 15000)
 */

import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const TARGET_URL  = process.env.TARGET_URL;
const OUTPUT_DIR  = process.env.OUTPUT_DIR  ?? path.join(process.cwd(), 'audit-results');
const CONCURRENCY = parseInt(process.env.CRAWL_CONCURRENCY ?? '10', 10);
const MAX_PAGES   = parseInt(process.env.MAX_PAGES         ?? '1500', 10);
const TIMEOUT_MS  = parseInt(process.env.CRAWL_TIMEOUT_MS  ?? '15000', 10);

const SKIP_EXT = /\.(pdf|jpg|jpeg|png|gif|svg|webp|ico|css|js|mjs|woff|woff2|ttf|eot|otf|mp4|webm|ogg|wav|zip|gz|tar|xml|rss|atom|txt|csv|xlsx|docx|pptx)(\?.*)?$/i;
const SKIP_SCHEME = /^(mailto|tel|javascript|data|ftp|sms):/i;

const UA = 'Mozilla/5.0 (compatible; IS17802-Audit-Crawler/1.0)';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeUrl(raw: string, base: string): string | null {
  try {
    if (SKIP_SCHEME.test(raw.trim())) return null;
    const u = new URL(raw.trim(), base);
    u.hash = ''; // strip fragments — same page, different anchor
    return u.toString();
  } catch { return null; }
}

function isSameOrigin(url: string, origin: string): boolean {
  try { return new URL(url).origin === origin; } catch { return false; }
}

function isHtmlResponse(contentType: string | null): boolean {
  if (!contentType) return false;
  return contentType.includes('text/html') || contentType.includes('application/xhtml');
}

/** Extract all navigable URLs from raw HTML */
function extractHrefs(html: string): string[] {
  const hrefs: string[] = [];

  // <a href="...">, <link href="...">
  const hrefRe = /href=["']([^"'#][^"']*?)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(html)) !== null) hrefs.push(m[1]);

  // <form action="...">
  const actionRe = /action=["']([^"']+)["']/gi;
  while ((m = actionRe.exec(html)) !== null) hrefs.push(m[1]);

  return hrefs;
}

/** Parse URLs out of an XML sitemap (sitemap index or urlset) */
function extractSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  // <loc>https://...</loc>
  const locRe = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = locRe.exec(xml)) !== null) urls.push(m[1]);
  return urls;
}

/** Fetch and parse a sitemap (or sitemap index). Returns discovered page URLs. */
async function crawlSitemap(sitemapUrl: string, origin: string, seen: Set<string>): Promise<string[]> {
  const discovered: string[] = [];
  const visited = new Set<string>();

  async function fetchSitemap(url: string): Promise<void> {
    if (visited.has(url)) return;
    visited.add(url);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return;
      const text = await res.text();
      const urls = extractSitemapUrls(text);
      for (const u of urls) {
        if (u.includes('/sitemap') && (u.endsWith('.xml') || u.includes('sitemap'))) {
          // Nested sitemap index — recurse
          await fetchSitemap(u);
        } else {
          const normalized = normalizeUrl(u, url);
          if (normalized && isSameOrigin(normalized, origin) && !seen.has(normalized)) {
            seen.add(normalized);
            discovered.push(normalized);
          }
        }
      }
    } catch { /* unreachable sitemap — skip */ }
  }

  await fetchSitemap(sitemapUrl);
  return discovered;
}

// ─── Crawler ──────────────────────────────────────────────────────────────────

async function crawl(startUrl: string): Promise<string[]> {
  const origin = new URL(startUrl).origin;
  const seen   = new Set<string>([startUrl]);   // URLs added to queue
  const queue  = [startUrl];                    // pending fetch queue
  const found: string[] = [];                   // successfully fetched HTML pages
  const pending = new Set<Promise<void>>();      // in-flight requests

  // ── Seed from sitemap.xml before regular crawl ───────────────────────────
  const sitemapUrl = `${origin}/sitemap.xml`;
  process.stdout.write(`  Checking sitemap: ${sitemapUrl}\n`);
  const sitemapUrls = await crawlSitemap(sitemapUrl, origin, seen);
  if (sitemapUrls.length > 0) {
    queue.push(...sitemapUrls);
    process.stdout.write(`  Sitemap seeded ${sitemapUrls.length} URLs into queue\n`);
  } else {
    process.stdout.write(`  No sitemap found — crawling via href links only\n`);
  }

  const csvDir  = path.join(OUTPUT_DIR, 'crawled-urls');
  const csvPath = path.join(csvDir, 'urls.csv');
  fs.mkdirSync(csvDir, { recursive: true });
  const csvStream = fs.createWriteStream(csvPath, { encoding: 'utf-8' });

  function record(url: string) {
    found.push(url);
    csvStream.write(`"${url}"\n`);
    process.stdout.write(`  [${String(found.length).padStart(4)}] ${url}\n`);
  }

  async function fetchPage(url: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(url, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timer);

      const ct = res.headers.get('content-type') ?? '';
      if (!isHtmlResponse(ct)) return;

      const finalUrl = res.url; // follow redirects
      record(finalUrl);

      if (found.length >= MAX_PAGES) return;

      const html = await res.text();

      for (const href of extractHrefs(html)) {
        const normalized = normalizeUrl(href, finalUrl);
        if (!normalized) continue;
        if (SKIP_EXT.test(normalized)) continue;
        if (!isSameOrigin(normalized, origin)) continue;
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        queue.push(normalized);
      }
    } catch {
      // Timeout, DNS failure, SSL error — skip silently, continue crawl
    }
  }

  // Pump the queue: keep CONCURRENCY fetches in-flight at all times
  while ((queue.length > 0 || pending.size > 0) && found.length < MAX_PAGES) {
    // Fill up to concurrency limit
    while (queue.length > 0 && pending.size < CONCURRENCY && found.length < MAX_PAGES) {
      const url = queue.shift()!;
      const p: Promise<void> = fetchPage(url).finally(() => pending.delete(p));
      pending.add(p);
    }
    // Wait for the fastest in-flight request to finish before looping
    if (pending.size > 0) await Promise.race([...pending]);
  }

  // Drain any remaining in-flight requests
  if (pending.size > 0) await Promise.all([...pending]);

  await new Promise<void>(resolve => csvStream.end(resolve));
  return found;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!TARGET_URL) {
    console.error('ERROR: TARGET_URL environment variable is required');
    process.exit(1);
  }

  let origin: string;
  try {
    origin = new URL(TARGET_URL).origin;
  } catch {
    console.error(`ERROR: Invalid TARGET_URL: ${TARGET_URL}`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('  URL Crawler');
  console.log(`${'='.repeat(60)}`);
  console.log(`Target      : ${TARGET_URL}`);
  console.log(`Origin scope: ${origin}`);
  console.log(`Concurrency : ${CONCURRENCY} parallel requests`);
  console.log(`Max pages   : ${MAX_PAGES}`);
  console.log('');

  const start = Date.now();
  const urls  = await crawl(TARGET_URL);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const csvPath = path.join(OUTPUT_DIR, 'crawled-urls', 'urls.csv');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Crawl complete`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  Pages found : ${urls.length}`);
  console.log(`  Time elapsed: ${elapsed}s`);
  console.log(`  Output      : ${csvPath}\n`);
}

main().catch(err => {
  console.error('Crawl failed:', err);
  process.exit(1);
});
