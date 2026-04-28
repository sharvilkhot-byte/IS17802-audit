import fs from 'fs';
import path from 'path';
import { AuditConfig, CoverageEntry, CoverageSummary, CoverageStatus } from './types';

const EXTERNAL_DOMAINS = [
  'youtube.com', 'facebook.com', 'twitter.com', 'linkedin.com',
  'instagram.com', 'hackerone.com', 'transunion.com', 'urldefense.com',
  'google.com', 'apple.com', 'play.google.com', 'apps.apple.com',
];

// Query params that represent genuinely distinct pages / content states
const MEANINGFUL_PARAMS = new Set([
  'enterprise',   // myscore.cibil.com login variant (CIBIL vs MFI vs CIBILCOMM)
  'offer',        // enrolment offer variant
  'tab',          // tabbed content (different viewable section)
  'type',         // content type filter
  'lang',         // explicit language override
  'page',         // paginated content (page 2, 3…)
  'category',     // blog/FAQ category filter
]);

// Tracking / analytics params that don't change page content — always strip
const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'msclkid', 'ref', 'referrer', 'source', 'medium',
  'campaign', 'affiliate', 'cid', 'sid', 'pid',
]);

const CSV_FILES: Record<string, 'en' | 'hi' | 'ta' | 'te' | 'bn'> = {
  'urls.csv':        'en',
  'urlshindi.csv':   'hi',
  'urlstamil.csv':   'ta',
  'urlstelgu.csv':   'te',
  'urlsbengali.csv': 'bn',
};

/** Detect language from URL path prefix */
function detectLang(url: string): CoverageEntry['lang'] {
  const m = url.match(/\/\/(www\.)?[^/]+\/(hi|ta|te|bn)(\/|$)/);
  const code = m?.[2] as 'hi' | 'ta' | 'te' | 'bn' | undefined;
  return code ?? 'en';
}

/**
 * Normalise a URL:
 * - Force https
 * - Lowercase host + path
 * - Strip trailing slash on non-root paths
 * - Strip tracking query params; keep meaningful ones sorted
 * - Strip fragment
 */
function normalise(raw: string): string | null {
  try {
    const p = new URL(raw);
    p.protocol = 'https:';
    p.hash = '';

    // Filter query params
    const kept: Array<[string, string]> = [];
    p.searchParams.forEach((val, key) => {
      const k = key.toLowerCase();
      if (!TRACKING_PARAMS.has(k) && MEANINGFUL_PARAMS.has(k)) {
        kept.push([k, val]);
      }
    });

    // Rebuild search string with only kept params (sorted for stable key)
    const search = kept.length > 0
      ? '?' + kept.sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';

    const pathname = p.pathname === '/' ? '/' : p.pathname.replace(/\/+$/, '');
    return ('https://' + p.hostname + pathname + search).toLowerCase();
  } catch {
    return null;
  }
}

/** Return true if URL points to a PDF */
function isPdf(url: string): boolean {
  try {
    const p = new URL(url);
    return /\.pdf(\?|$)/i.test(p.pathname);
  } catch {
    return false;
  }
}

export function buildCoverage(config: AuditConfig): CoverageSummary | undefined {
  const sourceDir = config.coverageSourceDir;
  if (!sourceDir || !fs.existsSync(sourceDir)) return undefined;

  // Build normalised → page-name map from config
  const configMap = new Map<string, string>();
  const authSet   = new Set<string>();
  for (const pg of config.pages) {
    const n = normalise(pg.url);
    if (n) {
      configMap.set(n, pg.name);
      if (pg.requiresAuth) authSet.add(n);
    }
  }

  const seen = new Map<string, CoverageEntry>(); // normalised → first entry

  for (const [filename, _lang] of Object.entries(CSV_FILES)) {
    const filePath = path.join(sourceDir, filename);
    if (!fs.existsSync(filePath)) continue;

    const lines = fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .map(l => l.trim().replace(/^"|"$/g, ''))
      .filter(l => l.startsWith('http'));

    for (const raw of lines) {
      if (raw.includes('mailto:')) continue;

      const norm = normalise(raw);
      if (!norm || seen.has(norm)) continue; // deduplicate

      let status: CoverageStatus;
      let reason: string;
      let auditedAs: string | undefined;

      // 1 — PDF documents → manual review required
      if (isPdf(raw)) {
        status = 'manual-pdf';
        reason = 'PDF document — must be manually reviewed for accessibility using Adobe Acrobat Accessibility Checker or PAC 3. Check for tags, reading order, alt text, and document language.';
        seen.set(norm, { url: raw, normalised: norm, status, lang: detectLang(raw), reason });
        continue;
      }

      // 2 — pure anchor / fragment-only URLs
      try {
        const p = new URL(raw);
        if (p.hash && (p.pathname === '/' || p.pathname === '')) {
          status = 'skipped-anchor';
          reason = 'Anchor-only URL — targets an element on the current page, not a separate page';
          seen.set(norm, { url: raw, normalised: norm, status, lang: detectLang(raw), reason });
          continue;
        }
      } catch { continue; }

      // 3 — external domain
      if (EXTERNAL_DOMAINS.some(d => norm.includes(d))) {
        status = 'skipped-external';
        reason = `External domain — outside CIBIL/TransUnion scope (${new URL(raw).hostname}). IS 17802 clause 9.3.2.2 requires warning users before opening external links.`;
        seen.set(norm, { url: raw, normalised: norm, status, lang: 'other', reason });
        continue;
      }

      // 4 — covered by config
      if (configMap.has(norm)) {
        auditedAs = configMap.get(norm)!;
        if (authSet.has(norm)) {
          status = 'skipped-auth';
          reason = 'Authentication required — post-login pages cannot be audited automatically. Requires manual testing with a real user session.';
        } else {
          status = 'audited';
          reason = `Audited as "${auditedAs}"`;
        }
        seen.set(norm, { url: raw, normalised: norm, status, lang: detectLang(raw), auditedAs, reason });
        continue;
      }

      // 5 — not in config
      status = 'skipped-duplicate';
      reason = 'Not in audit config — resolves to a page not explicitly scheduled for audit (query-string variant, redirect target, or new page added after config was written)';
      seen.set(norm, { url: raw, normalised: norm, status, lang: detectLang(raw), reason });
    }
  }

  const entries = [...seen.values()];

  return {
    total:            entries.length,
    audited:          entries.filter(e => e.status === 'audited').length,
    skippedAuth:      entries.filter(e => e.status === 'skipped-auth').length,
    skippedExternal:  entries.filter(e => e.status === 'skipped-external').length,
    skippedAnchor:    entries.filter(e => e.status === 'skipped-anchor').length,
    skippedDuplicate: entries.filter(e => e.status === 'skipped-duplicate').length,
    manualPdf:        entries.filter(e => e.status === 'manual-pdf').length,
    entries,
  };
}
