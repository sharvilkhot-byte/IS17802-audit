import { Page } from 'playwright';
import { CustomCheckResult, ViolationNode } from '../types';

/**
 * Custom accessibility checks that axe-core does not cover or covers partially.
 * These target fintech-specific patterns on CIBIL.
 */

/**
 * Derives the expected BCP-47 language tag from the page URL.
 * CIBIL uses /hi/, /ta/, /te/, /bn/ prefixes for non-English pages.
 */
function detectExpectedLang(url: string): string {
  const match = url.match(/\/\/(www\.)?[^/]+\/([a-z]{2})(\/|$)/);
  const code = match?.[2];
  const SUPPORTED = new Set(['hi', 'ta', 'te', 'bn']);
  return code && SUPPORTED.has(code) ? code : 'en';
}

export async function runCustomChecks(page: Page, pageUrl: string): Promise<CustomCheckResult[]> {
  const results: CustomCheckResult[] = [];
  const expectedLang = detectExpectedLang(pageUrl);

  await checkLangAttribute(page, expectedLang, results);
  await checkSkipLink(page, expectedLang, results);
  await checkSkipLinkTarget(page, results);
  await checkNoopAnchors(page, results);
  await checkNewTabWarning(page, results);
  await checkIconLinks(page, results);
  await checkHeadingStructure(page, results);
  await checkVagueLinks(page, expectedLang, results);
  await checkEmptyButtons(page, results);
  await checkTableHeaders(page, results);
  await checkInputAutocomplete(page, results);
  await checkFocusStyles(page, results);
  await checkTouchTargets(page, results);
  await checkMinTextSize(page, expectedLang, results);
  await checkColorOnlyInfo(page, results);
  await checkSessionTimeout(page, results);
  await checkCaptchaAlternative(page, results);
  await checkLiveRegions(page, results);

  return results;
}

// ─── Language Attribute ───────────────────────────────────────────────────────

/**
 * WCAG 3.1.1 (IS 17802 clause 9.3.1.1) — Language of Page.
 * Verifies <html lang> exists and matches the page's expected language.
 * A screen reader will use the wrong voice/pronunciation engine if this is wrong.
 */
async function checkLangAttribute(
  page: Page,
  expectedLang: string,
  results: CustomCheckResult[],
): Promise<void> {
  const { actualLang, hasLang } = await page.evaluate(() => {
    const lang = document.documentElement.getAttribute('lang') ?? '';
    return { hasLang: lang.length > 0, actualLang: lang.toLowerCase() };
  });

  if (!hasLang) {
    results.push({
      ruleId: 'custom-lang-attribute',
      impact: 'critical',
      description: 'Page has no lang attribute on <html>',
      help: 'WCAG 3.1.1 (IS 17802 clause 9.3.1.1): <html> must have a valid lang attribute so screen readers use the correct language engine.',
      nodes: [{
        html: '<html>',
        target: ['html'],
        failureSummary: `Expected lang="${expectedLang}" but no lang attribute found. Add <html lang="${expectedLang}"> to the document.`,
      }],
    });
    return;
  }

  // Normalise: "hi-IN" → "hi", "en-IN" → "en"
  const primaryActual = actualLang.split('-')[0];
  const primaryExpected = expectedLang.split('-')[0];

  if (primaryActual !== primaryExpected) {
    results.push({
      ruleId: 'custom-lang-attribute',
      impact: 'serious',
      description: `lang="${actualLang}" does not match expected language "${expectedLang}" for this URL`,
      help: 'WCAG 3.1.1 (IS 17802 clause 9.3.1.1): The lang attribute must reflect the primary language of the page content. Screen readers will use the wrong pronunciation engine otherwise.',
      nodes: [{
        html: `<html lang="${actualLang}">`,
        target: ['html'],
        failureSummary: `lang is "${actualLang}" but the page content appears to be in "${expectedLang}". Update to <html lang="${expectedLang}">.`,
      }],
    });
  }
}

// ─── Skip Link ────────────────────────────────────────────────────────────────

/**
 * Checks for a skip navigation link.
 * For English pages: look for recognisable English skip-link text.
 * For non-English pages: use a language-agnostic structural check —
 * any <a href="#…"> that appears in the DOM before the first <nav> / [role="navigation"]
 * counts as a valid skip link regardless of its visible text.
 */
async function checkSkipLink(
  page: Page,
  expectedLang: string,
  results: CustomCheckResult[],
): Promise<void> {
  const hasSkipLink = await page.evaluate((lang: string) => {
    const links = Array.from(document.querySelectorAll('a'));

    if (lang === 'en') {
      // English: check well-known skip-link text patterns
      return links.some(a => {
        const text = a.textContent?.toLowerCase() ?? '';
        const ariaLabel = (a.getAttribute('aria-label') ?? '').toLowerCase();
        const href = a.getAttribute('href') ?? '';
        const combined = text + ' ' + ariaLabel;
        return (
          (combined.includes('skip') || combined.includes('main content') || combined.includes('jump')) &&
          href.startsWith('#')
        );
      });
    }

    // Non-English: structural check — an <a href="#…"> before the first nav/header
    const firstNav = document.querySelector('nav, [role="navigation"], header');
    const hashLinks = links.filter(a => (a.getAttribute('href') ?? '').startsWith('#'));

    if (!firstNav) {
      // No nav found — just require any hash link near the top
      return hashLinks.length > 0;
    }

    // Check if any hash link appears before the first nav in DOM order
    return hashLinks.some(a =>
      // Node.DOCUMENT_POSITION_PRECEDING means `a` comes before firstNav
      !!(firstNav.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING),
    );
  }, expectedLang);

  if (!hasSkipLink) {
    const hint = expectedLang === 'en'
      ? 'Add <a href="#main-content" class="skip-link">Skip to main content</a> as the first focusable element.'
      : `Add a skip link <a href="#main-content"> before the navigation. The link text should be in the page language (e.g. Hindi: "मुख्य सामग्री पर जाएं", Tamil: "முக்கிய உள்ளடக்கத்திற்கு தாவு", Telugu: "ప్రధాన కంటెంట్‌కు వెళ్ళు", Bengali: "মূল বিষয়বস্তুতে যান").`;

    results.push({
      ruleId: 'custom-skip-link',
      impact: 'serious',
      description: 'No skip navigation link found before the main navigation',
      help: 'A skip link must be the first focusable element, allowing keyboard users to bypass repeated navigation (WCAG 2.4.1).',
      nodes: [{
        html: '<body>',
        target: ['body'],
        failureSummary: hint,
      }],
    });
  }
}

// ─── Skip Link Target ─────────────────────────────────────────────────────────

/**
 * WCAG 2.4.1 (IS 17802 clause 9.2.4.1) — Bypass Blocks — Level A.
 * A skip link that points to a non-existent ID is broken: pressing Enter drops
 * keyboard focus to an unknown location and the user cannot bypass navigation.
 */
async function checkSkipLinkTarget(page: Page, results: CustomCheckResult[]): Promise<void> {
  const brokenTargets = await page.evaluate(() => {
    const broken: Array<{ html: string; href: string }> = [];
    const hashLinks = Array.from(document.querySelectorAll('a[href^="#"]'));

    for (const a of hashLinks) {
      const href = a.getAttribute('href') ?? '';
      if (href === '#' || href === '') continue; // no-op anchors handled separately
      const targetId = href.slice(1); // strip leading #
      if (!document.getElementById(targetId)) {
        broken.push({ html: a.outerHTML.substring(0, 150), href });
      }
    }
    return broken.slice(0, 10);
  });

  if (brokenTargets.length > 0) {
    results.push({
      ruleId: 'custom-skip-link-target',
      impact: 'serious',
      description: `${brokenTargets.length} anchor link(s) point to a target ID that does not exist on the page`,
      help: 'WCAG 2.4.1 (IS 17802 clause 9.2.4.1): Every in-page anchor link must have a matching id="…" target. A broken skip link means keyboard users cannot bypass navigation.',
      nodes: brokenTargets.map(t => ({
        html: t.html,
        target: [`a[href="${t.href}"]`],
        failureSummary: `Link points to "${t.href}" but no element with id="${t.href.slice(1)}" exists. Add the matching id to the destination element.`,
      })),
    });
  }
}

// ─── No-op Anchor Links ───────────────────────────────────────────────────────

/**
 * WCAG 2.4.4 (IS 17802 clause 9.2.4.4) — Link Purpose — Level A
 * WCAG 2.1.1 (IS 17802 clause 9.2.1.1) — Keyboard — Level A
 *
 * <a href="#"> is focusable and announced as "link" by screen readers, but
 * pressing Enter scrolls to the top of the page — an unexpected side-effect.
 * These are usually used as JavaScript menu triggers; the correct element is
 * <button>, which has the right keyboard semantics and no default href behaviour.
 */
async function checkNoopAnchors(page: Page, results: CustomCheckResult[]): Promise<void> {
  const noopLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => {
        const href = (a.getAttribute('href') ?? '').trim();
        const isNoop = href === '#' || href === '' || href.startsWith('javascript:');
        if (!isNoop) return false;
        // Exclude if correctly given button role
        const role = a.getAttribute('role') ?? '';
        return role !== 'button';
      })
      .map(a => ({ html: a.outerHTML.substring(0, 150) }))
      .slice(0, 10);
  });

  if (noopLinks.length > 0) {
    results.push({
      ruleId: 'custom-noop-anchor',
      impact: 'moderate',
      description: `${noopLinks.length} no-op anchor link(s) found (href="#" or href="javascript:")`,
      help: 'WCAG 2.4.4 / 2.1.1 (IS 17802 clauses 9.2.4.4 & 9.2.1.1): <a href="#"> has no meaningful destination and scrolls to page-top on Enter. Use <button> for JavaScript-triggered actions instead.',
      nodes: noopLinks.map(l => ({
        html: l.html,
        target: ['a[href="#"]'],
        failureSummary: 'Replace with <button> or provide a real destination. Avoid href="#" or href="javascript:void(0)" — these misuse the link element and break keyboard navigation.',
      })),
    });
  }
}

// ─── New Tab Warning ──────────────────────────────────────────────────────────

/**
 * WCAG 3.2.2 (IS 17802 clause 9.3.2.2) — On Input — Level A.
 * Opening a new browsing context (target="_blank") without warning is an
 * unexpected context change. Screen reader and keyboard users lose their
 * back-button history and may not realise a new tab has opened.
 * The link text or aria-label must include an indication such as
 * "opens in new tab" or use a visually-hidden <span>.
 */
async function checkNewTabWarning(page: Page, results: CustomCheckResult[]): Promise<void> {
  const noWarning = await page.evaluate(() => {
    const WARNING_PATTERNS = [
      'new tab', 'new window', 'opens in', 'नई विंडो', 'புதிய தாவல்',
      'కొత్త ట్యాబ్', 'নতুন ট্যাব',
    ];

    return Array.from(document.querySelectorAll('a[target="_blank"]'))
      .filter(a => {
        const fullText = (
          (a.textContent ?? '') +
          (a.getAttribute('aria-label') ?? '') +
          (a.getAttribute('title') ?? '')
        ).toLowerCase();
        return !WARNING_PATTERNS.some(w => fullText.includes(w));
      })
      .map(a => ({
        html: a.outerHTML.substring(0, 150),
        text: a.textContent?.trim().substring(0, 60) ?? '',
        href: a.getAttribute('href') ?? '',
      }))
      .slice(0, 10);
  });

  if (noWarning.length > 0) {
    results.push({
      ruleId: 'custom-new-tab-warning',
      impact: 'moderate',
      description: `${noWarning.length} link(s) open in a new tab without warning the user`,
      help: 'WCAG 3.2.2 (IS 17802 clause 9.3.2.2): Links with target="_blank" must warn users before opening a new context. Add visible text or a visually-hidden <span class="sr-only">(opens in new tab)</span>, or update aria-label to include the warning.',
      nodes: noWarning.map(l => ({
        html: l.html,
        target: [`a[href="${l.href}"]`],
        failureSummary: `Link "${l.text || l.href}" opens in a new tab but provides no warning. Add aria-label="… (opens in new tab)" or a visually-hidden span.`,
      })),
    });
  }
}

// ─── Icon-Only Links ──────────────────────────────────────────────────────────

/**
 * WCAG 1.1.1 (IS 17802 clause 9.1.1.1) — Non-text Content — Level A.
 * Social media links, app store badges, and icon buttons are commonly
 * implemented as <a><svg>…</svg></a> with no accessible name.
 * Without an aria-label or title, a screen reader announces these as
 * "link" with no destination — completely opaque to blind users.
 */
async function checkIconLinks(page: Page, results: CustomCheckResult[]): Promise<void> {
  const iconLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => {
        const visibleText = a.textContent?.trim() ?? '';
        const ariaLabel = a.getAttribute('aria-label') ?? '';
        const ariaLabelledBy = a.getAttribute('aria-labelledby') ?? '';
        const title = a.getAttribute('title') ?? '';

        // Must have no accessible name
        if (visibleText || ariaLabel || ariaLabelledBy || title) return false;

        // Must contain only non-text visual children (svg, img, i, span with icon classes)
        const hasOnlyVisualContent = Array.from(a.childNodes).every(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            return (node.textContent?.trim() ?? '') === '';
          }
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            const tag = el.tagName.toLowerCase();
            return ['svg', 'img', 'i', 'span', 'picture', 'figure'].includes(tag);
          }
          return true;
        });

        return hasOnlyVisualContent;
      })
      .map(a => ({
        html: a.outerHTML.substring(0, 150),
        href: a.getAttribute('href') ?? '',
      }))
      .slice(0, 10);
  });

  if (iconLinks.length > 0) {
    results.push({
      ruleId: 'custom-icon-link-label',
      impact: 'critical',
      description: `${iconLinks.length} icon-only link(s) with no accessible name found`,
      help: 'WCAG 1.1.1 (IS 17802 clause 9.1.1.1): Links containing only icons (SVG, img, font-icon) must have an accessible name via aria-label or title. E.g., <a href="…" aria-label="Follow us on Facebook">. This is critical for social media and app-store links.',
      nodes: iconLinks.map(l => ({
        html: l.html,
        target: [`a[href="${l.href}"]`],
        failureSummary: `Icon-only link to "${l.href}" has no aria-label or title. Screen readers announce this as an unlabelled link. Add aria-label describing the destination.`,
      })),
    });
  }
}

// ─── Heading Structure ────────────────────────────────────────────────────────

async function checkHeadingStructure(page: Page, results: CustomCheckResult[]): Promise<void> {
  const issues = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    const found: Array<{ level: number; text: string; html: string }> = headings.map(h => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent?.trim().substring(0, 60) ?? '',
      html: h.outerHTML.substring(0, 120),
    }));

    const issues: string[] = [];

    const h1s = found.filter(h => h.level === 1);
    if (h1s.length === 0) issues.push('No H1 found on page');
    if (h1s.length > 1) issues.push(`Multiple H1s found (${h1s.length})`);

    for (let i = 1; i < found.length; i++) {
      const prev = found[i - 1].level;
      const curr = found[i].level;
      if (curr > prev + 1) {
        issues.push(`Heading level skipped: H${prev} → H${curr} ("${found[i].text}")`);
      }
    }

    return { issues, headings: found };
  });

  if (issues.issues.length > 0) {
    results.push({
      ruleId: 'custom-heading-structure',
      impact: 'moderate',
      description: `Heading structure issues: ${issues.issues.join('; ')}`,
      help: 'Headings must follow a logical hierarchy without skipping levels. There should be exactly one H1 per page.',
      nodes: issues.issues.map(issue => ({
        html: '',
        target: ['document'],
        failureSummary: issue,
      })),
    });
  }
}

// ─── Vague Link Text ──────────────────────────────────────────────────────────

/**
 * Checks for non-descriptive link text.
 * English pages: match against known English vague phrases.
 * Non-English pages: language-agnostic checks only —
 *   • links with 1–2 visible characters and no aria-label (too short in any script)
 *   • links whose text is purely numeric
 * We cannot enumerate vague words for every Indian script, so we avoid
 * English keyword matching on non-English pages to prevent false positives.
 */
async function checkVagueLinks(
  page: Page,
  expectedLang: string,
  results: CustomCheckResult[],
): Promise<void> {
  const vagueLinks = await page.evaluate((lang: string) => {
    const ENGLISH_VAGUE = new Set(['click here', 'here', 'read more', 'more', 'learn more', 'details', 'link', 'this']);

    return Array.from(document.querySelectorAll('a'))
      .filter(a => {
        const text = a.textContent?.trim() ?? '';
        const ariaLabel = a.getAttribute('aria-label') ?? '';
        const title = a.getAttribute('title') ?? '';

        // If aria-label or title provides context, it's not vague
        if (ariaLabel || title) return false;

        if (lang === 'en') {
          return ENGLISH_VAGUE.has(text.toLowerCase());
        }

        // Non-English: flag only clearly structurally-vague links
        // (1–2 chars, or purely numeric — bad in any language)
        const trimmed = text.replace(/\s+/g, '');
        if (trimmed.length === 0) return false;
        if (trimmed.length <= 2) return true;
        if (/^\d+$/.test(trimmed)) return true;
        return false;
      })
      .map(a => ({
        html: a.outerHTML.substring(0, 150),
        text: a.textContent?.trim() ?? '',
      }))
      .slice(0, 10);
  }, expectedLang);

  if (vagueLinks.length > 0) {
    results.push({
      ruleId: 'custom-vague-links',
      impact: 'serious',
      description: `${vagueLinks.length} link(s) with vague or non-descriptive text found`,
      help: 'Link text must describe the destination or purpose without relying on surrounding context. Avoid "click here", "read more", single characters, or numeric-only text.',
      nodes: vagueLinks.map(l => ({
        html: l.html,
        target: [`a:contains("${l.text}")`],
        failureSummary: `Link text "${l.text}" is not descriptive. Screen reader users navigate links out of context.`,
      })),
    });
  }
}

// ─── Empty Buttons ────────────────────────────────────────────────────────────

async function checkEmptyButtons(page: Page, results: CustomCheckResult[]): Promise<void> {
  const emptyButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"]'))
      .filter(btn => {
        const text = btn.textContent?.trim() ?? '';
        const ariaLabel = btn.getAttribute('aria-label') ?? '';
        const ariaLabelledBy = btn.getAttribute('aria-labelledby') ?? '';
        const title = btn.getAttribute('title') ?? '';
        return !text && !ariaLabel && !ariaLabelledBy && !title;
      })
      .map(btn => ({
        html: btn.outerHTML.substring(0, 150),
      }))
      .slice(0, 10);
  });

  if (emptyButtons.length > 0) {
    results.push({
      ruleId: 'custom-empty-buttons',
      impact: 'critical',
      description: `${emptyButtons.length} button(s) with no accessible name found`,
      help: 'Every button must have an accessible name via text content, aria-label, or aria-labelledby.',
      nodes: emptyButtons.map(b => ({
        html: b.html,
        target: ['button'],
        failureSummary: 'Button has no visible text, aria-label, or aria-labelledby. Screen readers will announce it as an unlabeled button.',
      })),
    });
  }
}

// ─── Table Headers ────────────────────────────────────────────────────────────

async function checkTableHeaders(page: Page, results: CustomCheckResult[]): Promise<void> {
  const tableIssues = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('table'))
      .filter(table => {
        const hasTh = table.querySelectorAll('th').length > 0;
        const hasScope = Array.from(table.querySelectorAll('th')).some(th => th.hasAttribute('scope'));
        const hasCaption = table.querySelector('caption') !== null;
        const hasAriaLabel = table.hasAttribute('aria-label') || table.hasAttribute('aria-labelledby');
        return !hasTh || (!hasScope && table.querySelectorAll('th').length > 0) || (!hasCaption && !hasAriaLabel);
      })
      .map(t => ({
        html: t.outerHTML.substring(0, 200),
        rows: t.querySelectorAll('tr').length,
        hasTh: t.querySelectorAll('th').length > 0,
        hasScope: Array.from(t.querySelectorAll('th')).some(th => th.hasAttribute('scope')),
        hasCaption: t.querySelector('caption') !== null,
      }))
      .slice(0, 5);
  });

  for (const table of tableIssues) {
    const issues: string[] = [];
    if (!table.hasTh) issues.push('Table has no <th> header cells');
    if (table.hasTh && !table.hasScope) issues.push('<th> cells missing scope="col" or scope="row" attributes');
    if (!table.hasCaption) issues.push('Table has no <caption> or aria-label to identify its purpose');

    if (issues.length > 0) {
      results.push({
        ruleId: 'custom-table-headers',
        impact: 'serious',
        description: `Data table accessibility issue: ${issues.join('; ')}`,
        help: 'Data tables must have <th> cells with scope attributes and a <caption> or aria-label for identification.',
        nodes: [{
          html: table.html,
          target: ['table'],
          failureSummary: issues.join(' | '),
        }],
      });
    }
  }
}

// ─── Input Autocomplete ───────────────────────────────────────────────────────

async function checkInputAutocomplete(page: Page, results: CustomCheckResult[]): Promise<void> {
  const missingAutocomplete = await page.evaluate(() => {
    const AUTOCOMPLETE_MAP: Record<string, string> = {
      'name': 'name',
      'email': 'email',
      'phone': 'tel',
      'mobile': 'tel',
      'password': 'current-password',
      'username': 'username',
      'pan': 'off',
      'otp': 'one-time-code',
      'dob': 'bday',
    };

    return Array.from(document.querySelectorAll('input'))
      .filter(input => {
        const type = input.type.toLowerCase();
        if (['hidden', 'submit', 'button', 'reset', 'file', 'image', 'range', 'color'].includes(type)) return false;
        const hasAutocomplete = input.hasAttribute('autocomplete');
        const label = (input.getAttribute('placeholder') ?? input.id ?? input.name ?? '').toLowerCase();
        const needsAutocomplete = Object.keys(AUTOCOMPLETE_MAP).some(k => label.includes(k));
        return needsAutocomplete && !hasAutocomplete;
      })
      .map(input => ({
        html: input.outerHTML.substring(0, 150),
        name: input.name || input.id || input.placeholder || 'unknown',
      }))
      .slice(0, 10);
  });

  if (missingAutocomplete.length > 0) {
    results.push({
      ruleId: 'custom-input-autocomplete',
      impact: 'moderate',
      description: `${missingAutocomplete.length} input(s) missing appropriate autocomplete attributes`,
      help: 'Personal data inputs (name, email, phone, OTP) must have autocomplete attributes to help users with cognitive disabilities.',
      nodes: missingAutocomplete.map(i => ({
        html: i.html,
        target: [`input[name="${i.name}"]`],
        failureSummary: `Input "${i.name}" is missing autocomplete attribute. Add appropriate autocomplete value (e.g., autocomplete="email", autocomplete="tel", autocomplete="one-time-code").`,
      })),
    });
  }
}

// ─── Focus Styles ─────────────────────────────────────────────────────────────

async function checkFocusStyles(page: Page, results: CustomCheckResult[]): Promise<void> {
  const focusIssues = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [tabindex]'));
    const issues: Array<{ html: string }> = [];

    for (const el of elements.slice(0, 20)) {
      const styles = window.getComputedStyle(el, ':focus');
      const outline = styles.outline;
      const outlineWidth = styles.outlineWidth;
      const boxShadow = styles.boxShadow;
      const border = styles.border;

      if (
        (outline === 'none' || outline === '0px none rgb(0, 0, 0)' || outlineWidth === '0px') &&
        boxShadow === 'none' &&
        !border.includes('2px')
      ) {
        issues.push({ html: el.outerHTML.substring(0, 120) });
      }
    }

    return issues.slice(0, 5);
  });

  if (focusIssues.length > 0) {
    results.push({
      ruleId: 'custom-focus-visible',
      impact: 'serious',
      description: `${focusIssues.length} interactive element(s) may have insufficient focus indicators`,
      help: 'All interactive elements must have a clearly visible focus indicator. outline:none without an alternative violates WCAG 2.4.7.',
      nodes: focusIssues.map(i => ({
        html: i.html,
        target: ['interactive-element'],
        failureSummary: 'Element appears to have outline:none with no alternative focus style. Verify focus indicator is visible.',
      })),
    });
  }
}

// ─── Touch Target Size ────────────────────────────────────────────────────────

async function checkTouchTargets(page: Page, results: CustomCheckResult[]): Promise<void> {
  const smallTargets = await page.evaluate(() => {
    const MIN_SIZE = 44;
    return Array.from(document.querySelectorAll('a, button, [role="button"], input[type="checkbox"], input[type="radio"]'))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return (rect.width > 0 && rect.height > 0) &&
          (rect.width < MIN_SIZE || rect.height < MIN_SIZE);
      })
      .map(el => ({
        html: el.outerHTML.substring(0, 120),
        width: Math.round(el.getBoundingClientRect().width),
        height: Math.round(el.getBoundingClientRect().height),
      }))
      .slice(0, 10);
  });

  if (smallTargets.length > 0) {
    results.push({
      ruleId: 'custom-target-size',
      impact: 'moderate',
      description: `${smallTargets.length} interactive element(s) smaller than 44x44px touch target`,
      help: 'Touch targets must be at least 44x44 CSS pixels to be accessible for users with motor impairments (WCAG 2.5.5).',
      nodes: smallTargets.map(t => ({
        html: t.html,
        target: ['interactive-element'],
        failureSummary: `Target size is ${t.width}x${t.height}px, minimum is 44x44px.`,
      })),
    });
  }
}

// ─── Minimum Text Size ────────────────────────────────────────────────────────

/**
 * Checks that body text is not rendered below a minimum readable size.
 * WCAG 1.4.4 requires text can be resized to 200% without loss of content —
 * but if the base size is already tiny, even 200% may not reach legibility.
 *
 * Minimum thresholds:
 *   • Latin (English): 12px — browsers default to 16px; 12px is the practical floor
 *   • Indic scripts (hi, ta, te, bn): 14px — complex glyphs (matras, conjuncts,
 *     vowel signs) become indistinguishable below this size
 */
async function checkMinTextSize(
  page: Page,
  expectedLang: string,
  results: CustomCheckResult[],
): Promise<void> {
  const INDIC = new Set(['hi', 'ta', 'te', 'bn']);
  const minSize = INDIC.has(expectedLang) ? 14 : 12;

  const smallText = await page.evaluate((min: number) => {
    const CONTENT_TAGS = ['p', 'li', 'td', 'th', 'span', 'div', 'a', 'label', 'caption'];
    const issues: Array<{ html: string; size: number }> = [];

    for (const tag of CONTENT_TAGS) {
      const els = Array.from(document.querySelectorAll(tag));
      for (const el of els.slice(0, 30)) {
        const text = el.textContent?.trim() ?? '';
        if (text.length < 3) continue; // skip icons / empty nodes
        // Only check leaf-level nodes (no nested block children)
        const hasBlockChild = Array.from(el.children).some(c => {
          const d = window.getComputedStyle(c).display;
          return d === 'block' || d === 'table-cell' || d === 'list-item';
        });
        if (hasBlockChild) continue;

        const size = parseFloat(window.getComputedStyle(el).fontSize);
        if (size > 0 && size < min) {
          issues.push({ html: el.outerHTML.substring(0, 120), size });
        }
      }
      if (issues.length >= 10) break;
    }

    return issues.slice(0, 10);
  }, minSize);

  if (smallText.length > 0) {
    const scriptNote = INDIC.has(expectedLang)
      ? `Indic scripts (${expectedLang}) require a minimum of ${minSize}px — complex glyphs (matras, conjuncts, vowel signs) become illegible below this size.`
      : `Minimum readable body text size is ${minSize}px.`;

    results.push({
      ruleId: 'custom-min-text-size',
      impact: 'serious',
      description: `${smallText.length} text element(s) rendered below the ${minSize}px minimum for this script`,
      help: `WCAG 1.4.4 (IS 17802 clause 9.1.4.4): ${scriptNote}`,
      nodes: smallText.map(t => ({
        html: t.html,
        target: ['text-element'],
        failureSummary: `Text is rendered at ${t.size}px, minimum for ${expectedLang} content is ${minSize}px. Increase font-size or use relative units (rem/em).`,
      })),
    });
  }
}

// ─── Color-Only Information ───────────────────────────────────────────────────

async function checkColorOnlyInfo(page: Page, results: CustomCheckResult[]): Promise<void> {
  const colorOnlyIndicators = await page.evaluate(() => {
    const scoreElements = document.querySelectorAll('[class*="score"], [class*="status"], [class*="badge"], [class*="indicator"]');
    const issues: Array<{ html: string; reason: string }> = [];

    for (const el of Array.from(scoreElements).slice(0, 20)) {
      const text = el.textContent?.trim() ?? '';
      const ariaLabel = el.getAttribute('aria-label') ?? '';
      const role = el.getAttribute('role') ?? '';
      if (!text && !ariaLabel && !role) {
        issues.push({
          html: el.outerHTML.substring(0, 120),
          reason: 'Element appears to convey information through color alone with no text alternative',
        });
      }
    }

    return issues.slice(0, 5);
  });

  if (colorOnlyIndicators.length > 0) {
    results.push({
      ruleId: 'custom-form-errors',
      impact: 'serious',
      description: `${colorOnlyIndicators.length} element(s) may convey information through color alone`,
      help: 'Information conveyed by color must also be available through text or another visual means (WCAG 1.4.1).',
      nodes: colorOnlyIndicators.map(i => ({
        html: i.html,
        target: ['status-element'],
        failureSummary: i.reason,
      })),
    });
  }
}

// ─── Session Timeout Warning ──────────────────────────────────────────────────

async function checkSessionTimeout(page: Page, results: CustomCheckResult[]): Promise<void> {
  results.push({
    ruleId: 'custom-session-timeout',
    impact: 'moderate',
    description: 'Session timeout handling requires manual verification',
    help: 'WCAG 2.2.1 (IS 17802 clause 9.2.2.1): If session expires, user must be warned at least 20 seconds before timeout and given ability to extend. Verify in authenticated flow.',
    nodes: [{
      html: '<session-management>',
      target: ['application'],
      failureSummary: 'Manually verify: does the site warn users before session expiry? Can users extend the session? Test in authenticated dashboard.',
    }],
  });
}

// ─── CAPTCHA Alternative ──────────────────────────────────────────────────────

async function checkCaptchaAlternative(page: Page, results: CustomCheckResult[]): Promise<void> {
  const captchaInfo = await page.evaluate(() => {
    const hasCaptcha = !!(
      document.querySelector('[class*="captcha"], [id*="captcha"], [class*="recaptcha"], iframe[src*="recaptcha"], iframe[src*="captcha"]')
    );
    const hasAudioAlt = !!(document.querySelector('[class*="captcha-audio"], [aria-label*="audio"]'));
    return { hasCaptcha, hasAudioAlt };
  });

  if (captchaInfo.hasCaptcha && !captchaInfo.hasAudioAlt) {
    results.push({
      ruleId: 'custom-captcha-alt',
      impact: 'critical',
      description: 'CAPTCHA found without accessible audio alternative',
      help: 'Any CAPTCHA must provide an alternative accessible format (audio CAPTCHA or non-visual challenge) per WCAG 1.1.1 and IS 17802 clause 9.1.1.1.',
      nodes: [{
        html: '<captcha-element>',
        target: ['[class*="captcha"]'],
        failureSummary: 'CAPTCHA detected with no audio alternative. Blind users cannot complete this challenge. Provide audio CAPTCHA or a non-visual alternative.',
      }],
    });
  }
}

// ─── Live Regions ─────────────────────────────────────────────────────────────

async function checkLiveRegions(page: Page, results: CustomCheckResult[]): Promise<void> {
  const liveRegionIssues = await page.evaluate(() => {
    const issues: Array<{ html: string; reason: string }> = [];

    const notifications = document.querySelectorAll(
      '[class*="toast"], [class*="alert"], [class*="notification"], [class*="snackbar"], [class*="error-message"], [class*="success-message"]'
    );

    for (const el of Array.from(notifications).slice(0, 10)) {
      const hasLive = el.hasAttribute('aria-live') || el.getAttribute('role') === 'alert' || el.getAttribute('role') === 'status';
      if (!hasLive) {
        issues.push({
          html: el.outerHTML.substring(0, 120),
          reason: 'Notification/alert element has no aria-live or role="alert"',
        });
      }
    }

    return issues.slice(0, 5);
  });

  if (liveRegionIssues.length > 0) {
    results.push({
      ruleId: 'aria-live-region-content',
      impact: 'serious',
      description: `${liveRegionIssues.length} notification/alert element(s) missing aria-live announcements`,
      help: 'Dynamic content like success messages, error alerts, and toasts must use aria-live="polite" or role="alert" to be announced to screen reader users.',
      nodes: liveRegionIssues.map(i => ({
        html: i.html,
        target: ['notification-element'],
        failureSummary: i.reason,
      })),
    });
  }
}
