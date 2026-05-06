/**
 * crawl-urls.ts — Fast parallel URL crawler for IS 17802 accessibility audit
 *
 * Uses Node fetch (no browser) for 10-50x faster crawling than Playwright.
 * Discovers all HTML pages reachable from TARGET_URL within the same origin,
 * streams results to crawled-urls/urls.csv as they're found.
 *
 * URL sources extracted per page:
 *   - <a href>, <link href>, <area href>
 *   - <form action>
 *   - <iframe src> (same-origin)
 *   - data-href, data-url, data-link, data-src attributes
 *   - <link rel="next|prev|alternate"> (pagination + hreflang)
 *   - <meta http-equiv="refresh" content="0;url=...">
 *   - <meta property="og:url">, <meta name="twitter:url">
 *   - <script type="application/ld+json"> — "@id" and "url" fields
 *   - Inline <script> content — absolute URLs and same-origin paths
 *   - sitemap.xml (urlset + sitemap index recursion)
 *   - robots.txt Sitemap: directives
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
    if (!raw || SKIP_SCHEME.test(raw.trim())) return null;
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

// ─── URL extraction from HTML ─────────────────────────────────────────────────

/**
 * Extract all potential navigable URLs from a raw HTML string.
 * Covers every common source so we miss as few pages as possible.
 */
function extractAllUrls(html: string, pageUrl: string, origin: string): string[] {
  const raw: string[] = [];

  // 1. Standard href attributes: <a>, <link>, <area>
  const hrefRe = /href=["']([^"']+?)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(html)) !== null) raw.push(m[1]);

  // 2. Form action attributes
  const actionRe = /action=["']([^"']+?)["']/gi;
  while ((m = actionRe.exec(html)) !== null) raw.push(m[1]);

  // 3. iframe src (same-origin iframes contain auditable pages)
  const iframeSrcRe = /<iframe[^>]+\bsrc=["']([^"']+?)["']/gi;
  while ((m = iframeSrcRe.exec(html)) !== null) raw.push(m[1]);

  // 4. data-href, data-url, data-link, data-src (used by JS frameworks / SPAs)
  const dataAttrRe = /\bdata-(?:href|url|link|src)=["']([^"']+?)["']/gi;
  while ((m = dataAttrRe.exec(html)) !== null) raw.push(m[1]);

  // 5. <meta http-equiv="refresh" content="0; url=...">
  const metaRefreshRe = /<meta[^>]+http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"'\s;]+)/gi;
  while ((m = metaRefreshRe.exec(html)) !== null) raw.push(m[1]);
  // Also the reverse attribute order: content first, http-equiv second
  const metaRefreshRe2 = /<meta[^>]+content=["'][^"']*url=([^"'\s;]+)[^>]+http-equiv=["']refresh["']/gi;
  while ((m = metaRefreshRe2.exec(html)) !== null) raw.push(m[1]);

  // 6. <meta property="og:url"> and <meta name="twitter:url">
  const metaUrlRe = /<meta[^>]+(?:property=["']og:url["']|name=["']twitter:url["'])[^>]+content=["']([^"']+?)["']/gi;
  while ((m = metaUrlRe.exec(html)) !== null) raw.push(m[1]);
  // Reverse attr order
  const metaUrlRe2 = /<meta[^>]+content=["']([^"']+?)["'][^>]+(?:property=["']og:url["']|name=["']twitter:url["'])/gi;
  while ((m = metaUrlRe2.exec(html)) !== null) raw.push(m[1]);

  // 7. JSON-LD structured data: "@id" and "url" fields
  const jsonldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = jsonldRe.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]);
      extractJsonLdUrls(obj, raw);
    } catch { /* malformed JSON-LD — skip */ }
  }

  // 8. Inline <script> content — extract absolute URLs and same-origin paths
  const scriptRe = /<script(?![^>]+type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = scriptRe.exec(html)) !== null) {
    extractScriptUrls(m[1], pageUrl, origin, raw);
  }

  // Normalize and deduplicate
  const seen = new Set<string>();
  const results: string[] = [];
  for (const u of raw) {
    const normalized = normalizeUrl(u, pageUrl);
    if (!normalized) continue;
    if (SKIP_EXT.test(normalized)) continue;
    if (!isSameOrigin(normalized, origin)) continue;
    if (!seen.has(normalized)) {
      seen.add(normalized);
      results.push(normalized);
    }
  }
  return results;
}

/** Recursively walk a JSON-LD object and collect string values for "url" and "@id" keys */
function extractJsonLdUrls(obj: unknown, out: string[]): void {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (const item of obj) extractJsonLdUrls(item, out);
    return;
  }
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if ((key === 'url' || key === '@id') && typeof val === 'string') {
      out.push(val);
    } else {
      extractJsonLdUrls(val, out);
    }
  }
}

/**
 * Extract URLs from inline script text.
 * Looks for absolute URLs starting with the same origin, and
 * same-origin path strings like "/some/path" (quoted).
 */
function extractScriptUrls(scriptText: string, pageUrl: string, origin: string, out: string[]): void {
  // Absolute URLs matching the same origin
  const absoluteRe = new RegExp(
    `["'\`](${escapeRegex(origin)}/[^"'\`\\s<>{}|\\\\^\\[\\]]{1,500})["'\`]`,
    'g',
  );
  let m: RegExpExecArray | null;
  while ((m = absoluteRe.exec(scriptText)) !== null) {
    out.push(m[1]);
  }

  // Quoted path strings starting with / — e.g. "/products/list"
  // Only include paths that look like pages (no obvious asset extensions)
  const pathRe = /["'\`](\/[a-zA-Z0-9/_\-%.~?=&]{2,300})["'\`]/g;
  while ((m = pathRe.exec(scriptText)) !== null) {
    const candidate = m[1];
    if (!SKIP_EXT.test(candidate)) {
      out.push(candidate);
    }
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Sitemap & robots.txt ─────────────────────────────────────────────────────

/** Parse URLs out of an XML sitemap (sitemap index or urlset) */
function extractSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
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

/**
 * Fetch robots.txt and return all Sitemap: directive URLs.
 * Many sites list multiple sitemaps (news, images, video, index) in robots.txt.
 */
async function getSitemapsFromRobots(origin: string): Promise<string[]> {
  const robotsUrl = `${origin}/robots.txt`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(robotsUrl, { headers: { 'User-Agent': UA }, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const text = await res.text();
    const sitemaps: string[] = [];
    const re = /^Sitemap:\s*(.+)$/gim;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const url = m[1].trim();
      if (url) sitemaps.push(url);
    }
    return sitemaps;
  } catch {
    return [];
  }
}

// ─── Crawler ──────────────────────────────────────────────────────────────────

async function crawl(startUrl: string): Promise<string[]> {
  const origin = new URL(startUrl).origin;
  const seen   = new Set<string>([startUrl]);
  const queue  = [startUrl];
  const found: string[] = [];
  const pending = new Set<Promise<void>>();

  // ── 1. Seed from robots.txt sitemaps ────────────────────────────────────────
  process.stdout.write(`  Checking robots.txt for Sitemap directives…\n`);
  const robotsSitemaps = await getSitemapsFromRobots(origin);
  if (robotsSitemaps.length > 0) {
    process.stdout.write(`  robots.txt listed ${robotsSitemaps.length} sitemap(s)\n`);
  } else {
    process.stdout.write(`  No Sitemap directives in robots.txt\n`);
  }

  // ── 2. Seed from all discovered sitemaps ────────────────────────────────────
  // Always try /sitemap.xml; also process any from robots.txt
  const sitemapsToCrawl = new Set<string>([
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    ...robotsSitemaps,
  ]);

  let totalSitemapUrls = 0;
  for (const sitemapUrl of sitemapsToCrawl) {
    process.stdout.write(`  Checking sitemap: ${sitemapUrl}\n`);
    const sitemapUrls = await crawlSitemap(sitemapUrl, origin, seen);
    if (sitemapUrls.length > 0) {
      queue.push(...sitemapUrls);
      totalSitemapUrls += sitemapUrls.length;
      process.stdout.write(`  → ${sitemapUrls.length} URLs added from ${sitemapUrl}\n`);
    }
  }

  if (totalSitemapUrls > 0) {
    process.stdout.write(`  Sitemaps seeded ${totalSitemapUrls} URLs into queue\n`);
  } else {
    process.stdout.write(`  No sitemap URLs found — crawling via page links only\n`);
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

      const finalUrl = res.url;
      record(finalUrl);

      if (found.length >= MAX_PAGES) return;

      const html = await res.text();

      for (const candidate of extractAllUrls(html, finalUrl, origin)) {
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        queue.push(candidate);
      }
    } catch {
      // Timeout, DNS failure, SSL error — skip silently, continue crawl
    }
  }

  // Pump the queue: keep CONCURRENCY fetches in-flight at all times
  while ((queue.length > 0 || pending.size > 0) && found.length < MAX_PAGES) {
    while (queue.length > 0 && pending.size < CONCURRENCY && found.length < MAX_PAGES) {
      const url = queue.shift()!;
      const p: Promise<void> = fetchPage(url).finally(() => pending.delete(p));
      pending.add(p);
    }
    if (pending.size > 0) await Promise.race([...pending]);
  }

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
