/**
 * CIBIL URL Crawler
 * Crawls cibil.com + transunioncibil.com, follows internal links up to a
 * configurable depth, and writes per-language CSV files to the output folder.
 *
 * Usage:  npx ts-node crawl-urls.ts
 * Output: C:\Users\<user>\OneDrive\Desktop\cibil url\urls.csv  (+ hi/ta/te/bn)
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const TARGET_URL = process.env.TARGET_URL;

const MAX_DEPTH   = 3;       // how many link-hops to follow from seed pages
const CONCURRENCY = 4;       // pages visited in parallel
const PAGE_TIMEOUT = 30000;  // ms per page load

// Dynamic config: if TARGET_URL is provided, derive hosts/seeds from it
let OUTPUT_DIR: string;
let ALLOWED_HOSTS: Set<string>;
let SEEDS_LIST: string[];

if (TARGET_URL) {
  const targetHost = new URL(TARGET_URL).hostname;
  const rootDomain = targetHost.replace(/^www\./, '');
  const siteOutputDir = process.env.OUTPUT_DIR ?? path.join(process.cwd(), 'audit-results');
  OUTPUT_DIR = path.join(siteOutputDir, 'crawled-urls');
  ALLOWED_HOSTS = new Set([targetHost, rootDomain, `www.${rootDomain}`]);
  SEEDS_LIST = [TARGET_URL];
} else {
  OUTPUT_DIR = process.env.COVERAGE_SOURCE_DIR
    ?? path.join(process.cwd(), 'audit-results', 'cibil-urls');
  ALLOWED_HOSTS = new Set([
    'www.cibil.com',
    'cibil.com',
    'www.transunioncibil.com',
    'transunioncibil.com',
    'myscore.cibil.com',
    'documentupload.cibil.com',
    'cibilrankccr.cibil.com',
  ]);
  SEEDS_LIST = [] as string[]; // filled below
}

// URL patterns to skip (login walls, file downloads, JS triggers, etc.)
// Binary / non-HTML assets — skip from crawl queue but PDFs are collected separately
const SKIP_CRAWL_PATTERNS = [
  /\.(docx?|xlsx?|pptx?|zip|jpg|jpeg|png|gif|svg|ico|woff2?|ttf|eot|mp4|mp3|webp|avif)(\?|$)/i,
  /^mailto:/,
  /^tel:/,
  /^javascript:/,
  /\/logout/,
  /\/resetpassword/,
  /\/changepwd/,
  /\?.*token=/,
  /\?.*session=/,
];

// Tracking params to strip before dedup (don't affect page content)
const TRACKING_PARAMS = new Set([
  'utm_source','utm_medium','utm_campaign','utm_term','utm_content',
  'gclid','fbclid','msclkid','ref','referrer','source','medium',
  'campaign','affiliate','cid','sid','pid',
]);

// Query params that represent distinct pages — keep these
const MEANINGFUL_PARAMS = new Set([
  'enterprise','offer','tab','type','lang','page','category',
]);

// External domains always skipped
const EXTERNAL_SKIP = [
  'youtube.com', 'facebook.com', 'twitter.com', 'linkedin.com',
  'instagram.com', 'hackerone.com', 'transunion.com', 'urldefense.com',
  'google.com', 'apple.com', 'play.google.com', 'apps.apple.com',
];

// Seed pages — CIBIL defaults (used only when TARGET_URL is not set)
const CIBIL_SEEDS: string[] = [
  // English
  'https://www.cibil.com/',
  'https://www.cibil.com/consumer',
  'https://www.cibil.com/loans',
  'https://www.cibil.com/credit-cards',
  'https://www.cibil.com/blog',
  'https://www.cibil.com/faq/credit-score-and-loan-basics',
  'https://www.cibil.com/contact-us',
  'https://www.cibil.com/sitemap',
  'https://www.transunioncibil.com/',
  // Hindi
  'https://www.cibil.com/hi',
  'https://www.cibil.com/hi/consumer',
  'https://www.cibil.com/hi/sitemap',
  // Tamil
  'https://www.cibil.com/ta',
  'https://www.cibil.com/ta/consumer',
  // Telugu
  'https://www.cibil.com/te',
  'https://www.cibil.com/te/consumer',
  // Bengali
  'https://www.cibil.com/bn',
  'https://www.cibil.com/bn/consumer',
];

if (!TARGET_URL) {
  SEEDS_LIST.push(...CIBIL_SEEDS);
}

const SEEDS = SEEDS_LIST;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalise(raw: string, base?: string): string | null {
  try {
    const url = new URL(raw, base);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    url.protocol = 'https:';
    url.hash = '';

    // Keep only meaningful query params, strip tracking ones
    const kept: Array<[string, string]> = [];
    url.searchParams.forEach((val, key) => {
      const k = key.toLowerCase();
      if (!TRACKING_PARAMS.has(k) && MEANINGFUL_PARAMS.has(k)) kept.push([k, val]);
    });
    const search = kept.length > 0
      ? '?' + kept.sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';

    const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
    return ('https://' + url.hostname + pathname + search).toLowerCase();
  } catch {
    return null;
  }
}

// All 22 scheduled Indian languages (ISO 639-1 / BCP-47 codes)
const INDIAN_LANG_CODES = new Set([
  'hi', // Hindi
  'ta', // Tamil
  'te', // Telugu
  'bn', // Bengali
  'mr', // Marathi
  'gu', // Gujarati
  'kn', // Kannada
  'ml', // Malayalam
  'pa', // Punjabi
  'or', // Odia
  'as', // Assamese
  'ur', // Urdu
  'sa', // Sanskrit
  'ks', // Kashmiri
  'sd', // Sindhi
  'ne', // Nepali
  'kok', // Konkani
  'mni', // Manipuri
  'doi', // Dogri
  'mai', // Maithili
  'sat', // Santali
  'brx', // Bodo
]);

function detectLang(url: string): string {
  // Match /<langcode>/ or /<langcode> at end of path, e.g. /hi/, /ta/, /kok/
  const m = url.match(/\/\/(www\.)?[^/]+\/([a-z]{2,4})(\/|$)/);
  const code = m?.[2];
  if (code && INDIAN_LANG_CODES.has(code)) return code;
  return 'en';
}

function isPdf(url: string): boolean {
  try { return /\.pdf(\?|$)/i.test(new URL(url).pathname); } catch { return false; }
}

function shouldSkipCrawl(url: string): boolean {
  if (EXTERNAL_SKIP.some(d => url.includes(d))) return true;
  if (SKIP_CRAWL_PATTERNS.some(p => p.test(url))) return true;
  try {
    const { hostname } = new URL(url);
    if (!ALLOWED_HOSTS.has(hostname)) return true;
  } catch {
    return true;
  }
  return false;
}

// Broader check used only for final CSV filtering (PDFs are kept, not skipped)
function shouldExcludeFromCSV(url: string): boolean {
  if (EXTERNAL_SKIP.some(d => url.includes(d))) return true;
  if (/\.(docx?|xlsx?|pptx?|zip|jpg|jpeg|png|gif|svg|ico|woff2?|ttf|eot|mp4|mp3|webp|avif)(\?|$)/i.test(url)) return true;
  try {
    const { hostname } = new URL(url);
    if (!ALLOWED_HOSTS.has(hostname)) return true;
  } catch { return true; }
  return false;
}

function writeCSV(lang: string, urls: string[], filename: string): void {
  const lines = ['url', ...urls].map(u => `"${u}"`).join('\n');
  fs.writeFileSync(filename, lines, 'utf-8');
  console.log(`  Wrote ${urls.length} URLs → ${path.basename(filename)}`);
}

// ─── Crawler ─────────────────────────────────────────────────────────────────

async function crawl(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('  CIBIL URL Crawler');
  console.log('='.repeat(60));
  console.log(`Max depth: ${MAX_DEPTH}  |  Concurrency: ${CONCURRENCY}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // visited: normalised URL → true
  const visited  = new Set<string>();
  // discovered: normalised URL → lang
  const found    = new Map<string, string>();
  // queue: [normUrl, depth]
  const queue: Array<[string, number]> = [];

  // Seed the queue
  for (const seed of SEEDS) {
    const norm = normalise(seed);
    if (norm && !visited.has(norm)) {
      queue.push([norm, 0]);
      found.set(norm, detectLang(norm));
    }
  }

  let processed = 0;

  while (queue.length > 0) {
    // Take up to CONCURRENCY items
    const batch = queue.splice(0, CONCURRENCY);
    const contexts = await Promise.all(batch.map(async ([url, depth]) => {
      if (visited.has(url)) return [];
      visited.add(url);
      processed++;

      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        ignoreHTTPSErrors: true,
      });
      const page = await context.newPage();

      const links: string[] = [];
      try {
        await page.goto(url, { timeout: PAGE_TIMEOUT, waitUntil: 'domcontentloaded' });
        // Wait for network to settle (SPA hydration), with a generous fallback
        await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(500);

        // Extract all href attributes
        const hrefs: string[] = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href]'))
            .map(a => (a as HTMLAnchorElement).href)
            .filter(Boolean),
        );

        for (const raw of hrefs) {
          const norm = normalise(raw, url);
          if (!norm) continue;

          // Collect PDFs as separate entries (not crawled but recorded)
          if (isPdf(norm)) {
            if (!found.has(norm)) found.set(norm, detectLang(norm));
            continue;
          }

          if (shouldSkipCrawl(norm)) continue;
          if (!found.has(norm)) found.set(norm, detectLang(norm));
          if (!visited.has(norm) && depth < MAX_DEPTH) links.push(norm);
        }

        process.stdout.write(`  [${processed}] ${url.replace('https://','').substring(0,70)}\n`);
      } catch (err) {
        process.stdout.write(`  [ERR] ${url.substring(0, 60)}: ${(err as Error).message.substring(0, 50)}\n`);
      } finally {
        await context.close();
      }
      return links.map(l => [l, depth + 1] as [string, number]);
    }));

    // Flatten and enqueue new URLs
    for (const links of contexts) {
      for (const [link, nextDepth] of links) {
        if (!visited.has(link) && !queue.some(([u]) => u === link)) {
          queue.push([link, nextDepth]);
        }
      }
    }

    console.log(`  Queue: ${queue.length} remaining  |  Found: ${found.size} unique URLs`);
  }

  await browser.close();

  // ─── Write CSVs ───────────────────────────────────────────────────────────

  console.log('\n' + '='.repeat(60));
  console.log('  Writing CSV files...');
  console.log('='.repeat(60));

  // Collect all valid URLs and group by detected language
  const allUrls: string[] = [];
  const byLang: Record<string, string[]> = {};

  for (const [url] of found.entries()) {
    if (shouldExcludeFromCSV(url)) continue;
    allUrls.push(url);
    const lang = detectLang(url);
    (byLang[lang] = byLang[lang] ?? []).push(url);
  }
  allUrls.sort();
  for (const urls of Object.values(byLang)) urls.sort();

  // urls.csv = ALL pages (every language) — this is what the audit engine reads
  writeCSV('all', allUrls, path.join(OUTPUT_DIR, 'urls.csv'));

  // Per-language CSVs — only written for languages actually found on this site
  const langNames: Record<string, string> = {
    hi: 'hindi', ta: 'tamil', te: 'telugu', bn: 'bengali',
    mr: 'marathi', gu: 'gujarati', kn: 'kannada', ml: 'malayalam',
    pa: 'punjabi', or: 'odia', as: 'assamese', ur: 'urdu',
    sa: 'sanskrit', ks: 'kashmiri', sd: 'sindhi', ne: 'nepali',
    kok: 'konkani', mni: 'manipuri', doi: 'dogri', mai: 'maithili',
    sat: 'santali', brx: 'bodo',
  };
  for (const [lang, urls] of Object.entries(byLang)) {
    if (lang === 'en' || urls.length === 0) continue;
    const name = langNames[lang] ?? lang;
    writeCSV(lang, urls, path.join(OUTPUT_DIR, `urls-${name}.csv`));
  }

  const total = allUrls.length;

  console.log(`\nCrawl complete.`);
  console.log(`  Pages visited : ${processed}`);
  console.log(`  Unique URLs   : ${total}`);
  console.log(`  Output dir    : ${OUTPUT_DIR}\n`);
  console.log('Run `npx ts-node regen-html.ts` to update the report.\n');
}

crawl().catch(err => {
  console.error('Crawler failed:', err);
  process.exit(1);
});
