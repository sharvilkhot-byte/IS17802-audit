import { AuditReport, AuditViolation, CoverageSummary, CoverageEntry } from '../types';
import path from 'path';
import fs from 'fs';

// ─── Implementation Plan ─────────────────────────────────────────────────────

interface FixGuide {
  effort: 'Easy' | 'Medium' | 'Hard';
  days: string;
  instruction: string;
  code: string;
  test: string[];
  who: string;
}

const FIX_GUIDE: Record<string, FixGuide> = {
  '9.1.1.1': {
    effort: 'Easy', days: '1–2 days', who: 'Frontend Dev',
    instruction: 'Add descriptive alt text to every informational <img>. Use alt="" (empty) for decorative images so screen readers skip them. Add aria-label to every icon-only link (social media, app store, SVG buttons).',
    code: `<!-- Informational image -->\n<img src="score-chart.png" alt="CIBIL Score trend chart showing improvement from 680 to 750 over 6 months">\n\n<!-- Decorative image -->\n<img src="divider.png" alt="">\n\n<!-- Icon-only social link -->\n<a href="https://facebook.com/cibil" aria-label="Follow CIBIL on Facebook (opens in new tab)" target="_blank" rel="noopener">\n  <svg aria-hidden="true" focusable="false">...</svg>\n</a>`,
    test: ['Run axe DevTools on every page', 'Tab to each image with a screen reader (NVDA/VoiceOver)', 'Decorative images must produce no announcement', 'Icon links must announce their destination'],
  },
  '9.1.3.1': {
    effort: 'Medium', days: '3–5 days', who: 'Frontend Dev',
    instruction: 'Use semantic HTML for all data relationships. Add scope attributes to <th> cells. Wrap radio/checkbox groups in <fieldset><legend>. Ensure landmark regions (main, nav, footer) are present.',
    code: `<!-- Data table -->\n<table aria-label="CIBIL Score history">\n  <caption>Monthly score breakdown</caption>\n  <thead>\n    <tr><th scope="col">Month</th><th scope="col">Score</th></tr>\n  </thead>\n  <tbody>...</tbody>\n</table>\n\n<!-- Radio group -->\n<fieldset>\n  <legend>Select subscription plan</legend>\n  <label><input type="radio" name="plan" value="basic"> Basic</label>\n  <label><input type="radio" name="plan" value="premium"> Premium</label>\n</fieldset>`,
    test: ['Screen reader must announce table headers for each cell', 'Fieldset legend must be read when entering radio groups', 'Landmark nav must be announced on page entry'],
  },
  '9.1.3.5': {
    effort: 'Easy', days: '1 day', who: 'Frontend Dev',
    instruction: 'Add autocomplete attributes to all personal data inputs. This helps users with cognitive disabilities and motor impairments auto-fill forms.',
    code: `<input type="text"  name="name"     autocomplete="name">\n<input type="email" name="email"    autocomplete="email">\n<input type="tel"   name="mobile"   autocomplete="tel">\n<input type="text"  name="pan"      autocomplete="off">\n<input type="text"  name="otp"      autocomplete="one-time-code">\n<input type="date"  name="dob"      autocomplete="bday">\n<input type="password" name="pass"  autocomplete="current-password">`,
    test: ['Open browser autofill — fields must populate correctly', 'Test with a password manager for password fields'],
  },
  '9.1.4.1': {
    effort: 'Medium', days: '2–3 days', who: 'UI/UX + Frontend Dev',
    instruction: 'Never use colour as the only way to convey information. Add text labels, icons, or patterns alongside colour indicators (e.g. score gauges, status badges, error fields).',
    code: `<!-- Bad: colour only -->\n<span class="status-red"></span>\n\n<!-- Good: colour + text + icon -->\n<span class="status-red" aria-label="Poor credit score">\n  ⚠ Poor\n</span>\n\n<!-- Error field -->\n<input class="error" aria-invalid="true" aria-describedby="pan-err">\n<span id="pan-err" class="error-msg">⚠ Invalid PAN format</span>`,
    test: ['View page in greyscale mode', 'All status information must still be understandable without colour'],
  },
  '9.1.4.3': {
    effort: 'Medium', days: '2–4 days', who: 'UI/UX + Frontend Dev',
    instruction: 'Ensure all text meets WCAG contrast ratios: 4.5:1 for normal text, 3:1 for large text (18pt/14pt bold). Check placeholder text, disabled states, and overlaid text on images.',
    code: `/* Current failing example */\ncolor: #999; /* 2.8:1 on white — FAIL */\n\n/* Fix: darken text or lighten background */\ncolor: #6b7280; /* 4.6:1 on white — PASS */\n\n/* Placeholder text */\n::placeholder { color: #6b7280; } /* must be 4.5:1 */\n\n/* Text on hero image — add overlay */\n.hero { background: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(hero.jpg); }`,
    test: ['Use browser DevTools Accessibility panel to check contrast', 'Test all text colours with https://webaim.org/resources/contrastchecker/'],
  },
  '9.1.4.4': {
    effort: 'Easy', days: '1 day', who: 'Frontend Dev',
    instruction: 'Remove any CSS that prevents text scaling. Use relative units (rem/em) for font sizes. Never use user-scalable=no in the viewport meta tag.',
    code: `<!-- Remove this -->\n<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">\n\n<!-- Use this -->\n<meta name="viewport" content="width=device-width, initial-scale=1">\n\n/* Use rem instead of px for body text */\nbody { font-size: 1rem; }       /* 16px base */\np    { font-size: 0.875rem; }   /* 14px */\nsmall{ font-size: 0.75rem; }    /* 12px minimum */\n\n/* Indic scripts need larger minimum */\n:lang(hi), :lang(ta), :lang(te), :lang(bn) { font-size: 1rem; } /* 16px min */`,
    test: ['Set browser zoom to 200% — text must reflow without horizontal scroll', 'Test on mobile with system font size set to Largest'],
  },
  '9.1.4.10': {
    effort: 'Medium', days: '2–3 days', who: 'Frontend Dev',
    instruction: 'Ensure all content reflows to a single column at 320px viewport width without horizontal scrolling. Avoid fixed-width containers wider than 320px.',
    code: `/* Avoid fixed widths */\n.container { max-width: 100%; }\n\n/* Responsive tables */\n.table-wrap { overflow-x: auto; }\n\n/* Test at 320px */\n@media (max-width: 320px) {\n  .hero-text { font-size: 1.25rem; }\n  .card-grid { grid-template-columns: 1fr; }\n}`,
    test: ['Set DevTools viewport to 320px width', 'No horizontal scrollbar should appear', 'All content must be readable'],
  },
  '9.1.4.12': {
    effort: 'Easy', days: '1 day', who: 'Frontend Dev',
    instruction: 'Ensure text spacing can be overridden by users without loss of content. Do not use fixed heights on text containers. Text must remain readable when: line-height 1.5×, letter-spacing 0.12em, word-spacing 0.16em.',
    code: `/* Avoid clipping text containers */\n.card { min-height: 80px; } /* use min-height not height */\n.tag  { padding: 4px 8px; white-space: normal; }\n\n/* Test with this bookmarklet override */\n* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }`,
    test: ['Apply the text spacing bookmarklet', 'No text must be clipped, truncated, or overlapping'],
  },
  '9.2.1.1': {
    effort: 'Hard', days: '5–8 days', who: 'Frontend Dev',
    instruction: 'Replace all <a href="#"> used as JS triggers with <button>. Ensure every interactive element is reachable and operable by keyboard alone. Test: Tab, Shift+Tab, Enter, Space, Arrow keys.',
    code: `<!-- Wrong: anchor as button -->\n<a href="#" onclick="openMenu()">Menu</a>\n\n<!-- Right: use button -->\n<button type="button" aria-expanded="false" aria-controls="menu-panel">Menu</button>\n\n<!-- Dropdown keyboard pattern -->\n<button aria-haspopup="true" aria-expanded="false" id="nav-trigger">\n  Products\n</button>\n<ul role="menu" aria-labelledby="nav-trigger" hidden>\n  <li role="menuitem"><a href="/consumer">Consumer</a></li>\n</ul>`,
    test: ['Disconnect mouse entirely', 'Navigate entire page using only keyboard', 'Every action achievable with mouse must work with keyboard'],
  },
  '9.2.4.1': {
    effort: 'Easy', days: '0.5 days', who: 'Frontend Dev',
    instruction: 'Add a visible skip link as the very first focusable element. It can be visually hidden until focused. Ensure the target id exists on every page.',
    code: `<!-- In <head> -->\n<style>\n.skip-link {\n  position: absolute;\n  top: -40px;\n  left: 0;\n  background: #0f2744;\n  color: white;\n  padding: 8px 16px;\n  z-index: 9999;\n  border-radius: 0 0 6px 0;\n  font-weight: 600;\n  transition: top .2s;\n}\n.skip-link:focus { top: 0; }\n</style>\n\n<!-- First element in <body> -->\n<a class="skip-link" href="#main-content">Skip to main content</a>\n\n<!-- On every page template -->\n<main id="main-content" tabindex="-1">...</main>`,
    test: ['Press Tab on page load — skip link must appear', 'Press Enter — focus must move to main content', 'Navigation must not be traversed again after skip'],
  },
  '9.2.4.2': {
    effort: 'Easy', days: '0.5 days', who: 'Frontend Dev / CMS',
    instruction: 'Every page must have a unique, descriptive <title> that identifies both the page and the site. Follow the pattern: "Page Name | CIBIL".',
    code: `<!-- Homepage -->\n<title>Free CIBIL Score &amp; Credit Report | TransUnion CIBIL</title>\n\n<!-- Inner page -->\n<title>Home Loans — Check Eligibility | TransUnion CIBIL</title>\n\n<!-- FAQ page -->\n<title>Loan Rejection FAQs | TransUnion CIBIL</title>\n\n<!-- Error page -->\n<title>Page Not Found (404) | TransUnion CIBIL</title>`,
    test: ['Screen reader announces title on page load', 'Browser tab shows unique title for every page', 'No two pages share the same <title>'],
  },
  '9.2.4.4': {
    effort: 'Medium', days: '2–3 days', who: 'Content + Frontend Dev',
    instruction: 'Replace vague link text ("click here", "read more", "here") with descriptive text. For icon-only links, add aria-label. For links opening in new tabs, warn users.',
    code: `<!-- Bad -->\n<a href="/home-loans">Click here</a>\n<a href="/blog/post">Read more</a>\n\n<!-- Good -->\n<a href="/home-loans">Check home loan eligibility</a>\n<a href="/blog/post">Read more about improving your CIBIL Score</a>\n\n<!-- New tab warning -->\n<a href="https://youtube.com/..." target="_blank" rel="noopener"\n   aria-label="Watch CIBIL explainer video (opens in new tab)">\n  Watch video\n  <span class="sr-only">(opens in new tab)</span>\n</a>`,
    test: ['Extract all links via screen reader Link List (NVDA: Insert+F7)', 'Every link must make sense out of context'],
  },
  '9.2.4.6': {
    effort: 'Easy', days: '1–2 days', who: 'Content + Frontend Dev',
    instruction: 'Ensure exactly one H1 per page. Do not skip heading levels (H1→H3). Headings must describe section content, not just style as large text.',
    code: `<!-- Good heading hierarchy -->\n<h1>Free CIBIL Score</h1>\n  <h2>What is a CIBIL Score?</h2>\n    <h3>Score ranges explained</h3>\n    <h3>Factors that affect your score</h3>\n  <h2>How to improve your score</h2>\n    <h3>Pay bills on time</h3>\n\n<!-- Wrong: using heading for visual size -->\n<!-- <h4 style="font-size:24px">Introduction</h4> -->\n<!-- Fix: use CSS classes instead -->\n<p class="intro-text">Introduction</p>`,
    test: ['Use HeadingsMap browser extension', 'Outline must show logical nested structure', 'No levels skipped in sequence'],
  },
  '9.2.4.7': {
    effort: 'Easy', days: '1 day', who: 'Frontend Dev',
    instruction: 'Every focusable element must have a clearly visible focus indicator. Never use outline:none without providing an equally visible alternative.',
    code: `/* Global focus styles — add to base CSS */\n:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n  border-radius: 3px;\n}\n\n/* Remove only for mouse users (not keyboard) */\n:focus:not(:focus-visible) {\n  outline: none;\n}\n\n/* High contrast mode support */\n@media (forced-colors: active) {\n  :focus-visible { outline: 3px solid ButtonText; }\n}`,
    test: ['Tab through entire page', 'Blue outline (or equivalent) must be visible on every focused element', 'Test in Windows High Contrast mode'],
  },
  '9.2.5.5': {
    effort: 'Medium', days: '2–3 days', who: 'UI/UX + Frontend Dev',
    instruction: 'All clickable/tappable targets must be at least 44×44 CSS pixels. Increase padding on small buttons, links, and checkboxes rather than increasing font size.',
    code: `/* Minimum touch target size */\n.btn, a, button {\n  min-height: 44px;\n  min-width: 44px;\n  padding: 10px 16px;\n  display: inline-flex;\n  align-items: center;\n}\n\n/* Small inline links — use padding for hit area */\n.nav-link {\n  padding: 11px 8px;\n  line-height: 1;\n}\n\n/* Checkbox/radio —larger click area */\ninput[type="checkbox"] { width: 20px; height: 20px; }\nlabel { min-height: 44px; display: flex; align-items: center; gap: 8px; }`,
    test: ['Test on mobile device with finger', 'Use Chrome DevTools touch simulation', 'No target smaller than 44×44px'],
  },
  '9.3.1.1': {
    effort: 'Easy', days: '0.5 days', who: 'Frontend Dev / Template Owner',
    instruction: 'Every page must declare its primary language via the lang attribute on <html>. Language pages must use the correct BCP-47 code.',
    code: `<!-- English -->\n<html lang="en">\n\n<!-- Hindi -->\n<html lang="hi">\n\n<!-- Tamil -->\n<html lang="ta">\n\n<!-- Telugu -->\n<html lang="te">\n\n<!-- Bengali -->\n<html lang="bn">\n\n<!-- Mixed content: mark inline language switches -->\n<p>Our score is called <span lang="en">CIBIL Score</span></p>`,
    test: ['Screen reader must announce correct language on page load', 'NVDA: Insert+Q to check language', 'Pronunciation must match content language'],
  },
  '9.3.2.2': {
    effort: 'Easy', days: '1 day', who: 'Frontend Dev',
    instruction: 'Warn users before opening a new browser window or tab. Add visible text or a visually-hidden span, or update the aria-label.',
    code: `<!-- Option 1: visually-hidden text -->\n<a href="https://youtube.com/..." target="_blank" rel="noopener">\n  Watch video\n  <span class="sr-only">(opens in new tab)</span>\n</a>\n\n<!-- Option 2: aria-label override -->\n<a href="/pdf/report.pdf" target="_blank" rel="noopener"\n   aria-label="Download annual report PDF (opens in new tab)">\n  Annual Report\n</a>\n\n/* Reusable utility class */\n.sr-only {\n  position:absolute;width:1px;height:1px;\n  padding:0;margin:-1px;overflow:hidden;\n  clip:rect(0,0,0,0);white-space:nowrap;border:0;\n}`,
    test: ['Screen reader must announce "(opens in new tab)" for all external links', 'Visually impaired users must not be surprised by new window'],
  },
  '9.3.3.2': {
    effort: 'Medium', days: '2–3 days', who: 'Frontend Dev',
    instruction: 'Every form input must have a visible, persistent label. Never rely solely on placeholder text — it disappears when typing. Associate labels with inputs using for/id or wrapping.',
    code: `<!-- Visible associated label -->\n<label for="pan-input">PAN Number</label>\n<input id="pan-input" type="text" placeholder="e.g. ABCDE1234F"\n       autocomplete="off" aria-describedby="pan-hint">\n<span id="pan-hint" class="hint">Enter your 10-character PAN</span>\n\n<!-- Wrong: placeholder as label -->\n<!-- <input placeholder="PAN Number"> -->\n\n<!-- Floating label pattern -->\n<div class="field">\n  <input id="email" type="email" placeholder=" " required>\n  <label for="email">Email address</label>\n</div>`,
    test: ['Clear all input values — labels must still be visible', 'Screen reader must announce label before input type'],
  },
  '9.4.1.1': {
    effort: 'Easy', days: '1 day', who: 'Frontend Dev',
    instruction: 'Ensure no duplicate IDs exist in the DOM. Every id attribute must be unique per page. Use BEM or scoped CSS to prevent ID collisions in reused components.',
    code: `<!-- Bad: duplicate IDs from reused components -->\n<section id="cta">...</section>\n<section id="cta">...</section>  <!-- duplicate! -->\n\n<!-- Fix: unique IDs -->\n<section id="cta-hero">...</section>\n<section id="cta-footer">...</section>\n\n<!-- Or use aria-labelledby with unique IDs -->\n<section aria-labelledby="section-loans-heading">\n  <h2 id="section-loans-heading">Loans</h2>\n</section>`,
    test: ['Run document.querySelectorAll("[id]") in DevTools console', 'Check for any ID that appears more than once'],
  },
  '9.4.1.2': {
    effort: 'Medium', days: '3–5 days', who: 'Frontend Dev',
    instruction: 'Every interactive element must have an accessible name, correct role, and communicate state changes. Use ARIA attributes where native HTML semantics are insufficient.',
    code: `<!-- Button without text -->\n<button aria-label="Close dialog" type="button">\n  <svg aria-hidden="true">...</svg>\n</button>\n\n<!-- Custom dropdown -->\n<div role="combobox" aria-expanded="false" aria-haspopup="listbox"\n     aria-labelledby="city-label" tabindex="0">\n  ...\n</div>\n\n<!-- Toggle button -->\n<button aria-pressed="false" id="darkmode-toggle">\n  Dark Mode\n</button>`,
    test: ['Audit with axe DevTools — zero "name, role, value" failures', 'Test every custom widget with NVDA in browse mode'],
  },
  '9.4.1.3': {
    effort: 'Easy', days: '1 day', who: 'Frontend Dev',
    instruction: 'All dynamic status messages (success toasts, error alerts, loading spinners) must use aria-live or role="alert" so screen readers announce them without requiring focus.',
    code: `<!-- Success toast -->\n<div role="status" aria-live="polite" aria-atomic="true" class="toast">\n  Your details have been saved successfully.\n</div>\n\n<!-- Error alert -->\n<div role="alert" aria-live="assertive" class="error-banner">\n  ⚠ Session expired. Please log in again.\n</div>\n\n<!-- Loading state -->\n<div aria-live="polite" aria-busy="true" id="loading-status">\n  Loading your credit report…\n</div>`,
    test: ['Trigger each toast/notification', 'Screen reader must announce message without user moving focus', 'Test with NVDA+Chrome and VoiceOver+Safari'],
  },
  'custom-noop-anchor': {
    effort: 'Medium', days: '2–3 days', who: 'Frontend Dev',
    instruction: 'Replace all <a href="#"> used as JavaScript triggers with semantically correct <button> elements. This fixes unexpected page-top scroll on keyboard Enter and gives screen readers the correct "button" role.',
    code: `<!-- Bad: anchor misused as JS trigger -->\n<a href="#" class="dropdown-toggle">Products ▾</a>\n\n<!-- Good: button with ARIA -->\n<button type="button" class="dropdown-toggle"\n        aria-expanded="false" aria-controls="products-menu">\n  Products\n  <span aria-hidden="true">▾</span>\n</button>`,
    test: ['Tab to element — screen reader must announce "button" not "link"', 'Press Enter — must NOT scroll to top of page'],
  },
  'custom-skip-link-target': {
    effort: 'Easy', days: '0.5 days', who: 'Frontend Dev',
    instruction: 'Ensure every page template includes an element with id="main-content" (or whatever the skip link targets). The target must receive tabindex="-1" to accept programmatic focus.',
    code: `<!-- Skip link (in <body> first element) -->\n<a class="skip-link" href="#main-content">Skip to main content</a>\n\n<!-- Target (every page template) -->\n<main id="main-content" tabindex="-1">...</main>`,
    test: ['Press Tab then Enter on skip link', 'Focus must land on main content area', 'Screen reader must not re-read navigation'],
  },
};

function buildImplementationPanel(report: AuditReport): string {
  const allViolations = report.pages.flatMap(p => p.violations);

  // Group violations by clause
  const byClause = new Map<string, {
    clause: string; wcag: string; title: string; level: string; principle: string;
    violations: AuditViolation[]; pages: Set<string>; worstImpact: string;
  }>();

  const impactOrder: Record<string, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 };

  for (const v of allViolations) {
    const key = v.clause.clause;
    if (!byClause.has(key)) {
      byClause.set(key, { clause: key, wcag: v.clause.wcag, title: v.clause.title,
        level: v.clause.level, principle: v.clause.principle, violations: [], pages: new Set(), worstImpact: 'minor' });
    }
    const entry = byClause.get(key)!;
    entry.violations.push(v);
    entry.pages.add(v.page);
    if (impactOrder[v.impact] < impactOrder[entry.worstImpact]) entry.worstImpact = v.impact;
  }

  const PHASES = [
    { key: 'critical', label: 'Phase 1 — Fix Immediately', sub: 'Complete within 1–2 weeks', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: '🚨', timeframe: '1–2 weeks' },
    { key: 'serious',  label: 'Phase 2 — Fix Soon',        sub: 'Complete within 2–4 weeks', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', icon: '⚠️', timeframe: '2–4 weeks' },
    { key: 'moderate', label: 'Phase 3 — Planned Fixes',   sub: 'Complete within 2 sprints', color: '#a16207', bg: '#fefce8', border: '#fef08a', icon: '📋', timeframe: '4–8 weeks' },
    { key: 'minor',    label: 'Phase 4 — Ongoing Polish',  sub: 'Address in regular sprint',  color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: '✨', timeframe: 'Ongoing'   },
  ] as const;

  const EFFORT_META: Record<string, { color: string; bg: string }> = {
    Easy:   { color: '#15803d', bg: '#f0fdf4' },
    Medium: { color: '#a16207', bg: '#fefce8' },
    Hard:   { color: '#b91c1c', bg: '#fef2f2' },
  };

  // Total items for progress tracking
  const totalItems = byClause.size;

  // Quick wins: Easy effort + critical/serious impact, sorted by violation count desc
  const quickWins = [...byClause.values()]
    .filter(c => (c.worstImpact === 'critical' || c.worstImpact === 'serious') && FIX_GUIDE[c.clause]?.effort === 'Easy')
    .sort((a, b) => b.violations.length - a.violations.length)
    .slice(0, 5);

  function renderFixItem(entry: (typeof byClause extends Map<string, infer V> ? V : never), phase: string): string {
    const guide = FIX_GUIDE[entry.clause];
    const effort = guide?.effort ?? 'Medium';
    const effortMeta = EFFORT_META[effort];
    const pageList = [...entry.pages].slice(0, 10).map(pg => `<span class="ip-pg">${e(pg)}</span>`).join('');
    const morePages = entry.pages.size > 10 ? `<span class="ip-pg-more">+${entry.pages.size - 10} more</span>` : '';
    const itemId = `fix-${entry.clause.replace(/\./g, '-')}-${phase}`;

    return `<div class="ip-item" id="${itemId}" data-item="${itemId}" data-phase="${phase}" data-clause="${e(entry.clause)}">
      <div class="ip-item-head" role="button" tabindex="0" aria-expanded="false" data-ipid="${itemId}">
        <label class="ip-check" onclick="event.stopPropagation()" title="Mark as fixed">
          <input type="checkbox" class="ip-cb" data-cbid="${itemId}" onchange="ipToggle('${itemId}',this.checked)">
          <span class="ip-check-box"></span>
        </label>
        <div class="ip-title-wrap">
          <span class="ip-clause">IS&nbsp;${e(entry.clause)}</span>
          <span class="ip-title">${e(entry.title)}</span>
          ${guide?.who ? `<span class="ip-who">${e(guide.who)}</span>` : ''}
        </div>
        <div class="ip-meta">
          <span class="ip-effort" style="color:${effortMeta.color};background:${effortMeta.bg}">${effort}</span>
          ${guide?.days ? `<span class="ip-days">${e(guide.days)}</span>` : ''}
          <span class="ip-count">${entry.violations.length} issue${entry.violations.length !== 1 ? 's' : ''}</span>
          <span class="ip-pages">${entry.pages.size} page${entry.pages.size !== 1 ? 's' : ''}</span>
        </div>
        <span class="ip-arr" data-iparr="${itemId}">▶</span>
      </div>
      <div class="ip-body" id="ipb-${itemId}">
        ${guide ? `
        <div class="ip-section">
          <div class="ip-sec-label">What to fix</div>
          <div class="ip-sec-text">${e(guide.instruction)}</div>
        </div>
        <div class="ip-section">
          <div class="ip-sec-label">Code example</div>
          <pre class="ip-code">${e(guide.code)}</pre>
        </div>
        <div class="ip-section">
          <div class="ip-sec-label">How to test</div>
          <ul class="ip-test-list">${guide.test.map(t => `<li>${e(t)}</li>`).join('')}</ul>
        </div>
        ` : `<div class="ip-section"><div class="ip-sec-text">Refer to <a href="https://www.w3.org/WAI/WCAG21/Understanding/${e(entry.wcag.replace(/\./g, '-'))}" target="_blank" rel="noopener">WCAG Understanding ${e(entry.wcag)} ↗</a> for remediation guidance.</div></div>`}
        <div class="ip-section">
          <div class="ip-sec-label">Affected pages (${entry.pages.size})</div>
          <div class="ip-pages-list">${pageList}${morePages}</div>
        </div>
        <div style="padding:8px 0 4px;display:flex;gap:8px">
          <a class="ip-reflink" href="https://www.w3.org/WAI/WCAG21/Understanding/${e(entry.wcag.replace(/\./g, '-'))}" target="_blank" rel="noopener">WCAG Understanding ${e(entry.wcag)} ↗</a>
          <a class="ip-reflink" href="https://www.w3.org/WAI/WCAG21/Techniques/" target="_blank" rel="noopener">Sufficient Techniques ↗</a>
        </div>
      </div>
    </div>`;
  }

  const phaseHTML = PHASES.map(ph => {
    const items = [...byClause.values()].filter(c => c.worstImpact === ph.key);
    if (!items.length) return '';
    items.sort((a, b) => b.violations.length - a.violations.length);
    const totalV = items.reduce((s, c) => s + c.violations.length, 0);
    const totalP = new Set(items.flatMap(c => [...c.pages])).size;
    return `<div class="ip-phase" id="phase-${ph.key}">
      <div class="ip-phase-head" style="background:${ph.bg};border-color:${ph.border}">
        <div class="ip-phase-icon">${ph.icon}</div>
        <div class="ip-phase-info">
          <div class="ip-phase-title" style="color:${ph.color}">${e(ph.label)}</div>
          <div class="ip-phase-sub">${e(ph.sub)}</div>
        </div>
        <div class="ip-phase-stats">
          <div class="ip-pstat"><span class="ip-pstat-n" style="color:${ph.color}">${items.length}</span><span class="ip-pstat-l">clauses</span></div>
          <div class="ip-pstat"><span class="ip-pstat-n">${totalV}</span><span class="ip-pstat-l">violations</span></div>
          <div class="ip-pstat"><span class="ip-pstat-n">${totalP}</span><span class="ip-pstat-l">pages</span></div>
          <div class="ip-pstat"><span class="ip-pstat-n">${e(ph.timeframe)}</span><span class="ip-pstat-l">target</span></div>
        </div>
      </div>
      <div class="ip-phase-items">${items.map(c => renderFixItem(c, ph.key)).join('')}</div>
    </div>`;
  }).join('');

  const quickWinHTML = quickWins.length > 0 ? `
    <div class="ip-qw-wrap">
      <div class="ip-qw-head">⚡ Quick Wins — High Impact, Easy to Fix</div>
      <div class="ip-qw-sub">Fix these first — each takes less than 2 days and resolves the most violations</div>
      <div class="ip-qw-grid">
        ${quickWins.map(c => {
          const guide = FIX_GUIDE[c.clause];
          return `<div class="ip-qw-card" onclick="document.getElementById('fix-${c.clause.replace(/\./g,'-')}-critical')?.scrollIntoView({behavior:'smooth'})">
            <div class="ip-qw-clause">IS ${e(c.clause)}</div>
            <div class="ip-qw-title">${e(c.title)}</div>
            <div class="ip-qw-count">${c.violations.length} violations · ${c.pages.size} pages</div>
            ${guide?.days ? `<div class="ip-qw-days">⏱ ${e(guide.days)}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  return `
<!-- ═══ IMPLEMENTATION PLAN ═════════════════════════════════════ -->
<div id="panel-plan" class="panel">
  <div class="wrap">
    <div class="sh">Implementation Plan
      <span class="sh-sub">Prioritised remediation roadmap — <strong>${totalItems}</strong> fix items across 4 phases</span>
    </div>

    <!-- Progress Dashboard -->
    <div class="ip-progress-bar" id="ip-prog-bar">
      <div class="ip-prog-info">
        <span class="ip-prog-label">Remediation Progress</span>
        <span class="ip-prog-count" id="ip-prog-count">0 / ${totalItems} fixed</span>
      </div>
      <div class="ip-prog-track"><div class="ip-prog-fill" id="ip-prog-fill" style="width:0%"></div></div>
      <span class="ip-prog-pct" id="ip-prog-pct">0%</span>
    </div>

    ${quickWinHTML}

    <!-- Phase Timeline -->
    <div class="ip-timeline">
      ${PHASES.map(ph => {
        const count = [...byClause.values()].filter(c => c.worstImpact === ph.key).length;
        return count ? `<div class="ip-tl-item" onclick="document.getElementById('phase-${ph.key}')?.scrollIntoView({behavior:'smooth'})">
          <div class="ip-tl-icon">${ph.icon}</div>
          <div class="ip-tl-label">${e(ph.label.split(' — ')[1])}</div>
          <div class="ip-tl-count">${count} items</div>
          <div class="ip-tl-time">${e(ph.timeframe)}</div>
        </div>` : '';
      }).join('<div class="ip-tl-arrow">→</div>')}
    </div>

    <!-- All Phases -->
    ${phaseHTML}

  </div>
</div>

<script>
/* Implementation Plan — progress tracking via localStorage */
(function(){
  var STORE_KEY = 'ip_done_${report.meta.auditedAt.substring(0,10)}';
  var total = ${totalItems};

  function loadDone(){
    try{ return JSON.parse(localStorage.getItem(STORE_KEY)||'{}'); }catch{ return {}; }
  }
  function saveDone(d){ try{ localStorage.setItem(STORE_KEY, JSON.stringify(d)); }catch{} }

  function updateProgress(){
    var done = loadDone();
    var count = Object.values(done).filter(Boolean).length;
    var pct = total > 0 ? Math.round(count/total*100) : 0;
    var fill = document.getElementById('ip-prog-fill');
    var countEl = document.getElementById('ip-prog-count');
    var pctEl = document.getElementById('ip-prog-pct');
    if(fill) fill.style.width = pct+'%';
    if(countEl) countEl.textContent = count+' / '+total+' fixed';
    if(pctEl) pctEl.textContent = pct+'%';
  }

  window.ipToggle = function(id, checked){
    var done = loadDone();
    done[id] = checked;
    saveDone(done);
    var item = document.getElementById(id);
    if(item) item.classList.toggle('ip-done', checked);
    updateProgress();
  };

  /* Restore saved state on load */
  document.addEventListener('DOMContentLoaded', function(){
    var done = loadDone();
    Object.entries(done).forEach(function(pair){
      var id = pair[0], checked = pair[1];
      if(!checked) return;
      var item = document.getElementById(id);
      if(item){
        item.classList.add('ip-done');
        var cb = item.querySelector('.ip-cb');
        if(cb) cb.checked = true;
      }
    });
    updateProgress();
  });

  /* Accordion expand/collapse */
  document.addEventListener('click', function(ev){
    var hdr = ev.target.closest('[data-ipid]');
    if(!hdr) return;
    var id = hdr.getAttribute('data-ipid');
    var body = document.getElementById('ipb-'+id);
    var arr  = document.querySelector('[data-iparr="'+id+'"]');
    if(body){ var op = body.classList.toggle('ip-body-open'); hdr.setAttribute('aria-expanded',String(op)); if(arr) arr.classList.toggle('ip-arr-open',op); }
  });
  document.addEventListener('keydown', function(ev){
    if((ev.key==='Enter'||ev.key===' ') && ev.target.closest('[data-ipid]')){ ev.preventDefault(); ev.target.closest('[data-ipid]').click(); }
  });

  /* Init progress on violations tab click (panel may not be visible yet) */
  document.querySelectorAll('.tab').forEach(function(t){
    t.addEventListener('click', function(){
      if(t.getAttribute('data-tab')==='plan'){ setTimeout(updateProgress, 0); }
    });
  });
})();
</script>`;
}

function buildCoveragePanel(cov: CoverageSummary): string {
  const LANGS: Array<{ key: CoverageEntry['lang']; label: string }> = [
    { key: 'en', label: 'English' },
    { key: 'hi', label: 'Hindi' },
    { key: 'ta', label: 'Tamil' },
    { key: 'te', label: 'Telugu' },
    { key: 'bn', label: 'Bengali' },
    { key: 'other', label: 'External' },
  ];

  const STATUS_META: Record<string, { label: string; cls: string; icon: string }> = {
    'audited':           { label: 'Audited',        cls: 'cb-aud',  icon: '✓' },
    'skipped-auth':      { label: 'Auth Required',  cls: 'cb-auth', icon: '🔒' },
    'skipped-external':  { label: 'External',       cls: 'cb-ext',  icon: '↗' },
    'skipped-anchor':    { label: 'Anchor',         cls: 'cb-anc',  icon: '#' },
    'skipped-duplicate': { label: 'Duplicate',      cls: 'cb-dup',  icon: '≡' },
    'manual-pdf':        { label: 'PDF – Manual',   cls: 'cb-pdf',  icon: '📄' },
  };

  // Build rows per language — static HTML
  function tableForLang(lang: CoverageEntry['lang']): string {
    const rows = cov.entries
      .filter(e => e.lang === lang)
      .sort((a, b) => {
        const order: Record<string, number> = { audited: 0, 'skipped-auth': 1, 'manual-pdf': 2, 'skipped-external': 3, 'skipped-anchor': 4, 'skipped-duplicate': 5 };
        return (order[a.status] ?? 6) - (order[b.status] ?? 6);
      });

    if (!rows.length) return `<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px">No URLs recorded for this language</div>`;

    const trs = rows.map(r => {
      const m = STATUS_META[r.status] ?? STATUS_META['skipped-duplicate'];
      return `<tr>
        <td><span class="cov-badge ${m.cls}">${m.icon} ${e(m.label)}</span></td>
        <td class="cov-url"><a href="${e(r.url)}" target="_blank" rel="noopener">${e(r.url)}</a></td>
        <td class="cov-page">${e(r.auditedAs ?? '')}</td>
        <td class="cov-reason">${e(r.reason)}</td>
      </tr>`;
    }).join('');

    return `<table class="cov-tbl">
      <thead><tr>
        <th style="width:120px">Status</th>
        <th>URL</th>
        <th style="width:200px">Audited As</th>
        <th style="width:280px">Reason</th>
      </tr></thead>
      <tbody>${trs}</tbody>
    </table>`;
  }

  const langTabs = LANGS.map((l, i) => {
    const count = cov.entries.filter(e => e.lang === l.key).length;
    if (!count) return '';
    return `<button class="cov-lt${i === 0 ? ' on' : ''}" data-clt="${l.key}">${l.label} <span style="opacity:.6">(${count})</span></button>`;
  }).join('');

  const langPanels = LANGS.map((l, i) => {
    const count = cov.entries.filter(en => en.lang === l.key).length;
    if (!count) return '';
    return `<div class="cov-lp${i === 0 ? ' cov-lp-on' : ''}" data-clp="${l.key}" style="${i === 0 ? '' : 'display:none'}">${tableForLang(l.key)}</div>`;
  }).join('');

  const covPct = cov.total > 0 ? Math.round((cov.audited / cov.total) * 100) : 0;

  return `
<!-- ═══ URL COVERAGE ════════════════════════════════════════════ -->
<div id="panel-coverage" class="panel">
  <div class="wrap">
    <div class="sh">URL Coverage
      <span class="sh-sub">Source: urls.csv, urlshindi.csv, urlstamil.csv, urlstelgu.csv, urlsbengali.csv</span>
    </div>

    <div class="cov-summary">
      <div class="cov-sc aud">
        <div class="cov-n">${cov.audited}</div>
        <div class="cov-l">✓ Audited</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">${covPct}% of total</div>
      </div>
      <div class="cov-sc auth">
        <div class="cov-n">${cov.skippedAuth}</div>
        <div class="cov-l">🔒 Auth Required</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Needs manual testing</div>
      </div>
      <div class="cov-sc ext">
        <div class="cov-n">${cov.skippedExternal}</div>
        <div class="cov-l">↗ External</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Outside audit scope</div>
      </div>
      <div class="cov-sc anc">
        <div class="cov-n">${cov.skippedAnchor}</div>
        <div class="cov-l"># Anchor</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">In-page fragments</div>
      </div>
      <div class="cov-sc dup">
        <div class="cov-n">${cov.skippedDuplicate}</div>
        <div class="cov-l">≡ Not in Config</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">New/variant pages</div>
      </div>
      <div class="cov-sc pdf">
        <div class="cov-n" style="color:#7c3aed">${cov.manualPdf}</div>
        <div class="cov-l">📄 PDF Manual</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Needs Acrobat check</div>
      </div>
      <div class="cov-sc" style="border-top-color:#2563eb">
        <div class="cov-n" style="color:#2563eb">${cov.total}</div>
        <div class="cov-l">Total Unique URLs</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">Across all CSV files</div>
      </div>
    </div>

    <div class="cov-search-wrap">
      <div class="sw" style="max-width:340px"><span class="si">🔍</span><input type="search" id="covsrch" placeholder="Filter URLs…" autocomplete="off" style="width:100%;padding:6px 10px 6px 30px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;font-family:inherit;outline:none"></div>
      <div class="cov-fbar-sep"></div>
      <div class="cov-lang-tabs">${langTabs}</div>
    </div>

    <div class="cov-table-wrap">
      <div id="covtables">${langPanels}</div>
    </div>

  </div>
</div>

<script>
/* Coverage tab language switcher + search */
(function(){
  document.querySelectorAll('.cov-lt').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.cov-lt').forEach(function(b){ b.classList.remove('on'); });
      document.querySelectorAll('.cov-lp').forEach(function(p){ p.style.display='none'; });
      btn.classList.add('on');
      var panel = document.querySelector('[data-clp="'+btn.getAttribute('data-clt')+'"]');
      if(panel) panel.style.display='block';
      document.getElementById('covsrch').value = '';
      filterCovRows('');
    });
  });

  document.getElementById('covsrch').addEventListener('input', function(){
    filterCovRows(this.value.toLowerCase());
  });

  function filterCovRows(q){
    var active = document.querySelector('.cov-lp[style*="block"], .cov-lp-on');
    if(!active) active = document.querySelector('.cov-lp');
    if(!active) return;
    var rows = active.querySelectorAll('tbody tr');
    rows.forEach(function(r){
      var text = r.textContent.toLowerCase();
      r.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  }
})();
</script>`;
}

export function generateHTMLReport(report: AuditReport, outputDir: string, violationsUrl = '/audit-results/violations.json'): string {
  // Write slim violations to a separate JSON file served at violationsUrl.
  // The HTML report loads them lazily via fetch — violations are NOT embedded
  // in the HTML string, which previously caused 50-200 MB string construction hangs.
  const allViolations = report.pages.flatMap(p => p.violations);
  const slim = { violations: allViolations.map(slimViolation) };
  fs.writeFileSync(path.join(outputDir, 'violations.json'), JSON.stringify(slim), 'utf-8');

  const html = buildHTML(report, violationsUrl);
  const outputPath = path.join(outputDir, 'accessibility-report.html');
  fs.writeFileSync(outputPath, html, 'utf-8');
  return outputPath;
}

/** Escape HTML — used for all dynamic content */
function e(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Safe JSON for embedding inside a <script> tag */
function safeJson(data: unknown): string {
  return JSON.stringify(data)
    .replace(/<\//g, '<\\/')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Slim violation — only what the UI needs, capped to reduce JSON size */
function slimViolation(v: AuditViolation) {
  return {
    id: v.id,
    clause: v.clause.clause,
    wcag: v.clause.wcag,
    level: v.clause.level,
    title: v.clause.title,
    principle: v.clause.principle,
    page: v.page,
    url: v.url,
    impact: v.impact,
    desc: v.description.substring(0, 200),
    help: v.help.substring(0, 400),
    helpUrl: v.helpUrl,
    source: v.source,
    // Max 2 nodes, capped lengths
    nodes: v.nodes.slice(0, 2).map(n => ({
      html: n.html.substring(0, 300),
      summary: n.failureSummary.substring(0, 400),
    })),
  };
}

function buildHTML(report: AuditReport, violationsUrl: string): string {
  const { critical, serious, moderate, minor } = report.summary;
  const total = report.summary.totalViolations;
  const allViolations = report.pages.flatMap(p => p.violations);

  /* ── Pre-compute everything in TypeScript — no JS dependency ── */

  // POUR breakdown
  const pour = (['Perceivable', 'Operable', 'Understandable', 'Robust'] as const).map(name => {
    const vs = allViolations.filter(v => v.clause.principle === name);
    const cr = vs.filter(v => v.impact === 'critical').length;
    const se = vs.filter(v => v.impact === 'serious').length;
    const mo = vs.filter(v => v.impact === 'moderate').length;
    const mi = vs.filter(v => v.impact === 'minor').length;
    const pct = total > 0 ? Math.round((vs.length / total) * 100) : 0;
    return { name, count: vs.length, cr, se, mo, mi, pct };
  });

  const pourMeta: Record<string, { icon: string; color: string }> = {
    Perceivable:    { icon: '👁',  color: '#3b82f6' },
    Operable:       { icon: '⌨️',  color: '#8b5cf6' },
    Understandable: { icon: '💡',  color: '#06b6d4' },
    Robust:         { icon: '🛡️',  color: '#10b981' },
  };

  // Top clauses
  const topClauses = Object.entries(report.summary.byClause)
    .sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxClause = topClauses[0]?.[1] ?? 1;

  const clauseTitles: Record<string, string> = {
    '9.4.1.2': 'Name, Role, Value',      '9.1.3.1': 'Info and Relationships',
    '9.2.4.6': 'Headings and Labels',    '9.2.4.1': 'Bypass Blocks',
    '9.2.5.5': 'Target Size',            '9.1.4.3': 'Contrast (Minimum)',
    '9.3.3.2': 'Labels or Instructions', '9.2.4.4': 'Link Purpose',
    '9.1.1.1': 'Non-text Content',       '9.3.1.1': 'Language of Page',
    '9.4.1.1': 'Parsing',               '9.1.3.5': 'Identify Input Purpose',
    '9.2.4.7': 'Focus Visible',          '9.4.1.3': 'Status Messages',
    '9.1.4.12':'Text Spacing',           '9.2.1.1': 'Keyboard',
    '9.2.4.2': 'Page Titled',            '9.2.5.3': 'Label in Name',
  };

  // Risk level
  const riskLevel = critical > 20 || (critical + serious) > 150
    ? { label: 'High Risk', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', icon: '🔴' }
    : critical > 5 || (critical + serious) > 50
    ? { label: 'Medium Risk', color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', icon: '🟠' }
    : { label: 'Low Risk', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: '🟢' };

  // Conformance estimate: how many of the ~50 WCAG 2.1 AA criteria were flagged
  const TOTAL_CRITERIA = 50;
  const violatedCriteria = Object.keys(report.summary.byClause).length;
  const passCriteria = Math.max(0, TOTAL_CRITERIA - violatedCriteria);
  const conformancePct = Math.round((passCriteria / TOTAL_CRITERIA) * 100);

  // Priority fixes: top 3 clauses with most critical+serious violations
  const priorityFixes = allViolations
    .reduce((acc, v) => {
      if (v.impact !== 'critical' && v.impact !== 'serious') return acc;
      const key = v.clause.clause;
      if (!acc[key]) acc[key] = { clause: v.clause.clause, title: v.clause.title, count: 0, cr: 0, se: 0 };
      acc[key].count++;
      if (v.impact === 'critical') acc[key].cr++;
      else acc[key].se++;
      return acc;
    }, {} as Record<string, { clause: string; title: string; count: number; cr: number; se: number }>);
  const topPriority = Object.values(priorityFixes).sort((a, b) => b.cr * 3 + b.se - (a.cr * 3 + a.se)).slice(0, 4);

  // Worst 5 pages by score (critical×4 + serious×2 + moderate)
  const worstPages = [...report.pages]
    .map(p => {
      const cr = p.violations.filter(v => v.impact === 'critical').length;
      const se = p.violations.filter(v => v.impact === 'serious').length;
      const mo = p.violations.filter(v => v.impact === 'moderate').length;
      return { name: p.page, url: p.url, cr, se, mo, score: cr * 4 + se * 2 + mo };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const pagesWithCritical = report.pages.filter(p => p.violations.some(v => v.impact === 'critical')).length;

  // Conformance ring SVG
  function conformanceRingSvg(pct: number): string {
    const R = 42, CX = 50, CY = 50, SW = 9, C = 2 * Math.PI * R;
    const filled = (pct / 100) * C;
    const gap = C - filled;
    const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f97316' : '#ef4444';
    return `<svg width="100" height="100" viewBox="0 0 100 100" style="transform:rotate(-90deg)" aria-hidden="true">
      <circle r="${R}" cx="${CX}" cy="${CY}" fill="none" stroke="#f1f5f9" stroke-width="${SW}"/>
      <circle r="${R}" cx="${CX}" cy="${CY}" fill="none" stroke="${color}" stroke-width="${SW}"
        stroke-dasharray="${filled.toFixed(2)} ${gap.toFixed(2)}" stroke-linecap="round"/>
    </svg>`;
  }

  // Page table rows (static HTML)
  const pageRows = report.pages.map(p => {
    const cr = p.violations.filter(v => v.impact === 'critical').length;
    const se = p.violations.filter(v => v.impact === 'serious').length;
    const mo = p.violations.filter(v => v.impact === 'moderate').length;
    const mi = p.violations.filter(v => v.impact === 'minor').length;
    const tot = p.violations.length;
    const heat = cr > 5 ? 'lc' : cr > 0 ? 'ls' : se > 0 ? 'lm' : tot === 0 ? 'lp' : 'ln';
    const pill = (n: number, cls: string) => n ? `<span class="pill ${cls}">${n}</span>` : `<span class="nil">—</span>`;
    return `<tr class="${heat}" data-name="${e(p.page)}" data-cr="${cr}" data-se="${se}" data-mo="${mo}" data-mi="${mi}" data-tot="${tot}">
      <td class="tc-page"><div class="pname">${e(p.page)}</div><div class="purl"><a href="${e(p.url)}" target="_blank" rel="noopener">${e(p.url)}</a></div></td>
      <td class="tc">${pill(cr, 'pc')}</td>
      <td class="tc">${pill(se, 'ps')}</td>
      <td class="tc">${pill(mo, 'pm')}</td>
      <td class="tc">${pill(mi, 'pn')}</td>
      <td class="tc"><strong>${tot}</strong></td>
    </tr>`;
  }).join('');

  // Donut SVG
  function donutSvg(): string {
    const R = 72, CX = 90, CY = 90, SW = 22, C = 2 * Math.PI * R;
    const segs = [
      { v: critical, c: '#ef4444' }, { v: serious,  c: '#f97316' },
      { v: moderate, c: '#eab308' }, { v: minor,    c: '#22c55e' },
    ];
    let rot = -90;
    const arcs = segs.map(s => {
      if (!s.v) return '';
      const frac = s.v / (total || 1);
      const dash = (frac * C).toFixed(2);
      const gap  = (C - frac * C).toFixed(2);
      const arc  = `<circle r="${R}" cx="${CX}" cy="${CY}" fill="none" stroke="${s.c}" stroke-width="${SW}"
        stroke-dasharray="${dash} ${gap}" transform="rotate(${rot.toFixed(2)} ${CX} ${CY})"/>`;
      rot += frac * 360;
      return arc;
    }).join('');
    return `<svg width="180" height="180" viewBox="0 0 180 180" aria-hidden="true">
      <circle r="${R}" cx="${CX}" cy="${CY}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="${SW}"/>
      ${arcs}
      <text x="${CX}" y="${CY - 10}" text-anchor="middle" font-size="28" font-weight="800" fill="#ffffff" font-family="system-ui">${total.toLocaleString()}</text>
      <text x="${CX}" y="${CY + 14}" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.75)" font-family="system-ui">Total Issues</text>
    </svg>`;
  }



  // Violations are NOT embedded in the HTML — they're loaded lazily from violationsUrl
  // (violations.json on the same server) when the user opens the Violations tab.
  // This eliminates the ~4-10 MB JSON string from the Node.js build process entirely.

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>IS 17802 Accessibility Audit — ${e(report.meta.targetUrl)}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;line-height:1.6;font-size:14px;-webkit-font-smoothing:antialiased}
a{color:#2563eb;text-decoration:none}a:hover{text-decoration:underline}
button{font-family:inherit;cursor:pointer}

/* NAV */
#nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-bottom:1px solid #e2e8f0;height:54px;padding:0 28px;display:flex;align-items:center;gap:14px}
.nav-brand{display:flex;align-items:center;gap:9px;text-decoration:none;flex-shrink:0}
.nav-ico{width:30px;height:30px;border-radius:7px;background:#0f2744;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px}
.nav-t{font-size:13px;font-weight:700;color:#0f172a}
.nav-url{font-size:11px;color:#94a3b8}
.nav-sp{flex:1}
.nchip{font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;border:1px solid #e2e8f0;white-space:nowrap}
.nchip.r{background:#fef2f2;border-color:#fecaca;color:#b91c1c}
.nchip.o{background:#fff7ed;border-color:#fed7aa;color:#c2410c}
.nbtn{height:32px;padding:0 13px;border-radius:6px;font-size:12px;font-weight:600;border:1px solid #e2e8f0;background:#fff;color:#334155;display:flex;align-items:center;gap:5px}
.nbtn:hover{background:#f8fafc}
.nbtn.p{background:#2563eb;border-color:#2563eb;color:#fff}
.nbtn.p:hover{background:#1d4ed8}

/* HERO */
#hero{background:linear-gradient(135deg,#0f2744 0%,#1e3a8a 60%,#2563eb 100%);color:#fff;padding:44px 28px 36px}
.hero-in{max-width:1180px;margin:0 auto;display:flex;gap:44px;align-items:center;flex-wrap:wrap}
.hero-stats{display:flex;gap:14px;flex-wrap:wrap;flex:1}
.sc{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:15px 18px;min-width:110px;flex:1;backdrop-filter:blur(4px)}
.sc .n{font-size:28px;font-weight:800;line-height:1;margin-bottom:3px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.3)}
.sc .l{font-size:10px;font-weight:700;opacity:.9;text-transform:uppercase;letter-spacing:.06em;color:#fff}
.sc.cc{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.25)}
.sc.cs{border-color:rgba(249,115,22,.5);background:rgba(249,115,22,.25)}
.sc.cm{border-color:rgba(234,179,8,.5);background:rgba(234,179,8,.25)}
.sc.cn{border-color:rgba(34,197,94,.5);background:rgba(34,197,94,.25)}
.hero-meta{font-size:12px;opacity:.9;display:flex;flex-direction:column;gap:5px;min-width:190px}
.hbadge{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:500;margin-bottom:12px;width:fit-content}

/* TABS */
#tabs{background:#fff;border-bottom:1px solid #e2e8f0;padding:0 28px;position:sticky;top:54px;z-index:90;display:flex}
.tab{height:46px;padding:0 18px;font-size:13px;font-weight:500;color:#64748b;border:none;background:none;border-bottom:2px solid transparent;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap;transition:color .15s}
.tab:hover{color:#0f172a}
.tab.on{color:#2563eb;border-bottom-color:#2563eb;font-weight:600}
.tc2{font-size:11px;font-weight:700;padding:1px 6px;border-radius:9px;background:#f1f5f9;color:#64748b}
.tab.on .tc2{background:#eff6ff;color:#2563eb}

/* PANELS */
.wrap{max-width:1180px;margin:0 auto;padding:28px}
.panel{display:none}.panel.on{display:block}

/* SECTION HEAD */
.sh{font-size:15px;font-weight:700;color:#0f172a;margin:0 0 14px;display:flex;align-items:center;gap:7px}
.sh-sub{font-size:12px;color:#94a3b8;font-weight:400;margin-left:auto}

/* GRID */
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:24px}

/* CARD */
.card{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:18px}
.ct{font-size:13px;font-weight:700;color:#475569;margin-bottom:12px;display:flex;align-items:center;gap:5px}

/* POUR CARDS */
.pc2{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:16px 18px;border-top:3px solid}
.ph{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.pi{font-size:19px;line-height:1}
.pname2{font-size:13px;font-weight:700;color:#0f172a}
.pn2{font-size:26px;font-weight:800;line-height:1;margin-bottom:3px}
.psub{font-size:11px;color:#94a3b8;margin-bottom:8px}
.pbar{height:4px;background:#f1f5f9;border-radius:2px;overflow:hidden;margin-bottom:8px}
.pbar-f{height:100%;border-radius:2px}
.ppills{display:flex;gap:5px;flex-wrap:wrap}
.ppill{font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px}

/* BAR CHART */
.bar-r{display:flex;align-items:center;gap:9px;margin-bottom:7px}
.bar-lbl{font-size:11px;font-weight:700;font-family:monospace;color:#2563eb;width:96px;flex-shrink:0;text-align:right}
.bar-tr{flex:1;height:20px;background:#f1f5f9;border-radius:3px;overflow:hidden}
.bar-fi{height:100%;background:linear-gradient(90deg,#2563eb,#60a5fa);border-radius:3px;display:flex;align-items:center}
.bar-ct{font-size:11px;font-weight:700;color:#fff;padding-left:7px;white-space:nowrap}
.bar-ti{font-size:11px;color:#94a3b8;width:160px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* PAGE TABLE */
.tw{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden}
.tbl{width:100%;border-collapse:collapse}
.tbl th{background:#f8fafc;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;padding:9px 12px;text-align:left;border-bottom:1px solid #e2e8f0;white-space:nowrap;cursor:pointer;user-select:none}
.tbl th:hover{color:#475569}
.tbl td{padding:9px 12px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:#f8fafc}
.tbl tr.lc td:first-child{border-left:3px solid #ef4444}
.tbl tr.ls td:first-child{border-left:3px solid #f97316}
.tbl tr.lm td:first-child{border-left:3px solid #eab308}
.tbl tr.ln td:first-child{border-left:3px solid #22c55e}
.tbl tr.lp td:first-child{border-left:3px solid #22c55e}
.tc-page{min-width:200px}.tc{text-align:center;width:65px}
.pname{font-size:13px;font-weight:600}.purl{font-size:11px;color:#94a3b8;margin-top:1px}
.nil{color:#cbd5e1;font-size:13px}
.pill{font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;display:inline-block}
.pc{background:#fef2f2;color:#b91c1c}.ps{background:#fff7ed;color:#c2410c}
.pm{background:#fefce8;color:#a16207}.pn{background:#f0fdf4;color:#15803d}

/* FILTER BAR */
#fbar{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.sw{position:relative;flex:1;min-width:220px}
.si{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px;pointer-events:none}
#srch{width:100%;padding:7px 10px 7px 32px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;outline:none;background:#f8fafc;font-family:inherit;transition:border-color .15s,box-shadow .15s}
#srch:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1);background:#fff}
.fsep{width:1px;height:22px;background:#e2e8f0;flex-shrink:0}
.flbl{font-size:11px;font-weight:600;color:#94a3b8;white-space:nowrap}
.fb{height:28px;padding:0 11px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid #e2e8f0;background:#fff;color:#64748b;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all .12s}
.fb:hover{border-color:#94a3b8;color:#0f172a}
.fb.on{font-weight:700}
.fb.all.on{background:#2563eb;border-color:#2563eb;color:#fff}
.fb.critical.on{background:#fef2f2;border-color:#b91c1c;color:#b91c1c}
.fb.serious.on{background:#fff7ed;border-color:#c2410c;color:#c2410c}
.fb.moderate.on{background:#fefce8;border-color:#a16207;color:#a16207}
.fb.minor.on{background:#f0fdf4;border-color:#15803d;color:#15803d}
.sel{height:28px;padding:0 8px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;font-size:12px;color:#64748b;font-family:inherit;outline:none;cursor:pointer}
#vcnt{font-size:12px;color:#94a3b8;white-space:nowrap;margin-left:auto}

/* VIOLATION CARDS */
#vlist{display:flex;flex-direction:column;gap:3px}
#vlist .vc{display:none}
#vlist .vc.vis{display:block}
.vc{background:#fff;border-radius:7px;box-shadow:0 1px 2px rgba(0,0,0,.06);border:1px solid #e2e8f0;overflow:hidden}
.vc:hover{box-shadow:0 2px 6px rgba(0,0,0,.09)}
.vh{display:flex;align-items:center;gap:7px;padding:10px 13px;cursor:pointer;user-select:none}
.vh:hover{background:#f8fafc}
.vimp{width:62px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:3px 0;border-radius:4px;text-align:center;flex-shrink:0}
.vimp.critical{background:#fef2f2;color:#b91c1c}
.vimp.serious{background:#fff7ed;color:#c2410c}
.vimp.moderate{background:#fefce8;color:#a16207}
.vimp.minor{background:#f0fdf4;color:#15803d}
.vcl{font-size:11px;font-weight:700;font-family:monospace;color:#2563eb;background:#eff6ff;padding:2px 6px;border-radius:3px;white-space:nowrap;flex-shrink:0}
.vd{flex:1;font-size:13px;color:#1e293b;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vpg{font-size:11px;color:#94a3b8;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}
.vsrc{font-size:10px;padding:2px 5px;border-radius:3px;background:#f1f5f9;color:#94a3b8;flex-shrink:0}
.vsrc.cx{background:#fef3c7;color:#92400e}
.vsrc.ibm{background:#dbeafe;color:#1e40af}
.varr{color:#cbd5e1;font-size:14px;flex-shrink:0;transition:transform .2s}
.varr.op{transform:rotate(90deg)}
.vb{display:none;padding:12px 13px;border-top:1px solid #f1f5f9}
.vb.op{display:block}
.vdl{display:grid;grid-template-columns:90px 1fr;gap:5px 14px;margin-bottom:10px;font-size:13px}
.vdl dt{font-weight:600;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.04em;padding-top:1px}
.vdl dd{color:#334155}
.vdl dd a{color:#2563eb}
.code{background:#0d1117;border-radius:6px;padding:12px;margin-top:8px;overflow-x:auto}
.codet{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6e7681;margin-bottom:6px}
.codeh{color:#79c0ff;font-family:monospace;font-size:12px;white-space:pre-wrap;word-break:break-all;margin-bottom:6px;line-height:1.5}
.codes{color:#ff7b72;font-size:12px;font-family:monospace;white-space:pre-wrap;line-height:1.5}

/* PAGINATION */
#pg{display:flex;align-items:center;justify-content:center;gap:6px;padding:22px 0;flex-wrap:wrap}
.pgb{height:30px;min-width:30px;padding:0 9px;border-radius:6px;border:1px solid #e2e8f0;background:#fff;color:#64748b;font-size:13px;cursor:pointer;font-family:inherit;transition:all .12s}
.pgb:hover{background:#f8fafc;border-color:#94a3b8}
.pgb.on{background:#2563eb;border-color:#2563eb;color:#fff;font-weight:600}
.pgb:disabled{opacity:.35;cursor:default}
#pgi{font-size:12px;color:#94a3b8}

/* EMPTY */
.empty{text-align:center;padding:56px 20px;color:#94a3b8}
.empty-ico{font-size:38px;margin-bottom:10px}
.empty-t{font-size:14px;font-weight:600;color:#64748b;margin-bottom:3px}

/* FOOTER */
footer{background:#0f172a;color:rgba(255,255,255,.5);text-align:center;padding:24px;font-size:12px;line-height:2.1;margin-top:36px}
footer strong{color:rgba(255,255,255,.85)}

/* ALERT BANNER */
.alert-banner{display:flex;align-items:flex-start;gap:11px;background:#fef2f2;border:1px solid #fecaca;border-radius:9px;padding:12px 16px;margin-bottom:20px}
.alert-icon{font-size:20px;flex-shrink:0;line-height:1.3}
.alert-text{font-size:13px;color:#7f1d1d;flex:1;line-height:1.6}
.alert-text strong{color:#b91c1c}

/* EXEC STRIP */
.exec-strip{display:flex;gap:24px;align-items:center;background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.08);padding:22px 26px;margin-bottom:22px;flex-wrap:wrap}
.conf-block{display:flex;align-items:center;gap:16px;flex-shrink:0}
.conf-ring-wrap{position:relative;width:100px;height:100px;flex-shrink:0}
.conf-num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.conf-pct{font-size:22px;font-weight:800;color:#0f172a;line-height:1}
.conf-lbl{font-size:9px;font-weight:600;text-transform:uppercase;color:#94a3b8;letter-spacing:.06em;margin-top:3px;text-align:center}
.conf-info{display:flex;flex-direction:column;gap:3px}
.conf-title{font-size:14px;font-weight:700;color:#0f172a;margin-bottom:2px}
.conf-sub{font-size:12px;color:#64748b}
.exec-metrics{display:flex;gap:10px;flex-wrap:wrap;flex:1;justify-content:center}
.em{text-align:center;padding:12px 14px;border-radius:9px;border:1px solid #e2e8f0;min-width:86px}
.em .en{font-size:24px;font-weight:800;line-height:1;margin-bottom:3px;color:#0f172a}
.em .el{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
.em.er{background:#fef2f2;border-color:#fecaca}.em.er .en{color:#b91c1c}
.em.eo{background:#fff7ed;border-color:#fed7aa}.em.eo .en{color:#c2410c}
.exec-risk{display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0}
.risk-badge{display:flex;align-items:center;gap:7px;padding:9px 15px;border-radius:8px;border:1.5px solid;font-size:14px;font-weight:700;white-space:nowrap}
.risk-sub{font-size:11px;color:#94a3b8;text-align:right;line-height:1.5}

/* PRIORITY + WORST PAGES */
.g2b{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px}
.pfix-row{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9}
.pfix-row:last-child{border-bottom:none;padding-bottom:0}
.pfix-rank{width:22px;height:22px;border-radius:50%;background:#0f2744;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.pfix-info{flex:1;min-width:0}
.pfix-clause{font-size:10px;font-weight:700;color:#2563eb;font-family:monospace;margin-bottom:2px}
.pfix-title{font-size:12px;font-weight:600;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pfix-pills{display:flex;gap:4px;margin-top:4px;flex-wrap:wrap}
.pfix-count{text-align:right;flex-shrink:0}
.pfix-count .pfix-n{font-size:20px;font-weight:800;color:#0f172a;line-height:1}
.pfix-count .pfix-u{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em}
.wp-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f1f5f9}
.wp-row:last-child{border-bottom:none;padding-bottom:0}
.wp-rank{width:20px;font-size:12px;font-weight:800;color:#cbd5e1;text-align:center;flex-shrink:0}
.wp-info{flex:1;min-width:0}
.wp-name{font-size:12px;font-weight:600;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wp-pills{display:flex;gap:4px;margin-top:3px;flex-wrap:wrap}
.wp-count{text-align:right;flex-shrink:0}
.wp-count .wp-n{font-size:18px;font-weight:800;color:#0f172a;line-height:1}
.wp-count .wp-u{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.04em}

/* METHODOLOGY CARD */
.meth-grid{display:flex;flex-direction:column;gap:5px;font-size:13px;color:#475569;line-height:1.7;margin-bottom:14px}
.meth-warn{background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:9px 11px;font-size:12px;color:#7f1d1d}
.sev-legend{display:flex;flex-direction:column;gap:6px}
.sev-row{display:flex;gap:9px;align-items:center;font-size:12px;color:#475569}

/* COVERAGE TAB */
.cov-summary{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.cov-sc{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:16px 20px;flex:1;min-width:110px;border-top:3px solid #e2e8f0}
.cov-sc.aud{border-top-color:#22c55e}.cov-sc.auth{border-top-color:#ef4444}.cov-sc.ext{border-top-color:#94a3b8}.cov-sc.anc{border-top-color:#f59e0b}.cov-sc.dup{border-top-color:#e2e8f0}.cov-sc.pdf{border-top-color:#7c3aed}
.cov-n{font-size:26px;font-weight:800;line-height:1;margin-bottom:3px}
.cov-sc.aud .cov-n{color:#15803d}.cov-sc.auth .cov-n{color:#b91c1c}.cov-sc.ext .cov-n{color:#475569}.cov-sc.anc .cov-n{color:#d97706}
.cov-l{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8}
.cov-lang-tabs{display:flex;gap:0;margin-bottom:0;border-bottom:2px solid #e2e8f0}
.cov-lt{height:36px;padding:0 16px;font-size:12px;font-weight:600;color:#64748b;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;font-family:inherit}
.cov-lt.on{color:#2563eb;border-bottom-color:#2563eb}
.cov-table-wrap{background:#fff;border-radius:0 0 10px 10px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden}
.cov-tbl{width:100%;border-collapse:collapse}
.cov-tbl th{background:#f8fafc;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.cov-tbl td{padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;vertical-align:middle}
.cov-tbl tr:last-child td{border-bottom:none}
.cov-tbl tr:hover td{background:#f8fafc}
.cov-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;white-space:nowrap}
.cb-aud{background:#f0fdf4;color:#15803d}.cb-auth{background:#fef2f2;color:#b91c1c}
.cb-ext{background:#f1f5f9;color:#475569}.cb-anc{background:#fefce8;color:#a16207}
.cb-dup{background:#f8fafc;color:#94a3b8}.cb-pdf{background:#f5f3ff;color:#7c3aed}
.cov-url{font-family:monospace;font-size:11px;color:#334155;word-break:break-all}
.cov-page{font-size:11px;color:#2563eb;white-space:nowrap}
.cov-reason{font-size:11px;color:#94a3b8}
.cov-search-wrap{background:#fff;border:1px solid #e2e8f0;border-radius:10px 10px 0 0;padding:10px 14px;border-bottom:none;display:flex;gap:9px;align-items:center;flex-wrap:wrap}
.cov-fbar-sep{width:1px;height:22px;background:#e2e8f0}

/* IMPLEMENTATION PLAN */
.ip-progress-bar{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.ip-prog-info{display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:6px}
.ip-prog-label{font-size:12px;font-weight:700;color:#475569}
.ip-prog-count{font-size:12px;color:#64748b}
.ip-prog-track{flex:1;height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;min-width:200px}
.ip-prog-fill{height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:4px;transition:width .4s ease}
.ip-prog-pct{font-size:14px;font-weight:800;color:#15803d;min-width:36px;text-align:right}
.ip-qw-wrap{background:linear-gradient(135deg,#fffbeb,#fef9c3);border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px}
.ip-qw-head{font-size:15px;font-weight:800;color:#92400e;margin-bottom:4px}
.ip-qw-sub{font-size:12px;color:#a16207;margin-bottom:14px}
.ip-qw-grid{display:flex;gap:10px;flex-wrap:wrap}
.ip-qw-card{background:#fff;border:1px solid #fde68a;border-radius:9px;padding:13px 15px;flex:1;min-width:150px;cursor:pointer;transition:box-shadow .15s,transform .15s}
.ip-qw-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.1);transform:translateY(-2px)}
.ip-qw-clause{font-size:10px;font-weight:700;color:#2563eb;font-family:monospace;margin-bottom:3px}
.ip-qw-title{font-size:12px;font-weight:700;color:#1e293b;margin-bottom:4px}
.ip-qw-count{font-size:11px;color:#64748b;margin-bottom:3px}
.ip-qw-days{font-size:11px;color:#a16207;font-weight:600}
.ip-timeline{display:flex;align-items:center;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:16px 20px;margin-bottom:24px;overflow-x:auto;gap:0}
.ip-tl-item{text-align:center;padding:8px 16px;cursor:pointer;border-radius:8px;flex:1;min-width:100px;transition:background .15s}
.ip-tl-item:hover{background:#f8fafc}
.ip-tl-icon{font-size:20px;margin-bottom:4px}
.ip-tl-label{font-size:11px;font-weight:700;color:#0f172a;margin-bottom:2px}
.ip-tl-count{font-size:11px;color:#64748b}
.ip-tl-time{font-size:10px;color:#94a3b8;margin-top:2px}
.ip-tl-arrow{font-size:18px;color:#cbd5e1;flex-shrink:0;padding:0 4px;align-self:center}
.ip-phase{margin-bottom:20px}
.ip-phase-head{border:1px solid;border-radius:12px 12px 0 0;padding:16px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.ip-phase-icon{font-size:24px;flex-shrink:0}
.ip-phase-info{flex:1;min-width:160px}
.ip-phase-title{font-size:14px;font-weight:800;margin-bottom:2px}
.ip-phase-sub{font-size:12px;color:#64748b}
.ip-phase-stats{display:flex;gap:14px;flex-wrap:wrap}
.ip-pstat{text-align:center;min-width:56px}
.ip-pstat-n{display:block;font-size:20px;font-weight:800;line-height:1;color:#0f172a}
.ip-pstat-l{display:block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;margin-top:2px}
.ip-phase-items{border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;background:#fff}
.ip-item{border-bottom:1px solid #f1f5f9;transition:background .12s}
.ip-item:last-child{border-bottom:none}
.ip-item.ip-done{opacity:.55}
.ip-item.ip-done .ip-title{text-decoration:line-through;color:#94a3b8}
.ip-item-head{display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer;user-select:none}
.ip-item-head:hover{background:#f8fafc}
.ip-check{display:flex;align-items:center;flex-shrink:0;cursor:pointer}
.ip-check input[type=checkbox]{display:none}
.ip-check-box{width:18px;height:18px;border:2px solid #cbd5e1;border-radius:4px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.ip-check input:checked + .ip-check-box{background:#22c55e;border-color:#22c55e}
.ip-check input:checked + .ip-check-box::after{content:'✓';color:#fff;font-size:11px;font-weight:800}
.ip-title-wrap{flex:1;min-width:0;display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.ip-clause{font-size:10px;font-weight:700;color:#2563eb;font-family:monospace;background:#eff6ff;padding:2px 6px;border-radius:3px;white-space:nowrap;flex-shrink:0}
.ip-title{font-size:13px;font-weight:600;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:400px}
.ip-who{font-size:10px;color:#64748b;background:#f1f5f9;padding:1px 7px;border-radius:10px;flex-shrink:0}
.ip-meta{display:flex;align-items:center;gap:7px;flex-shrink:0;flex-wrap:wrap}
.ip-effort{font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px}
.ip-days{font-size:11px;color:#64748b;white-space:nowrap}
.ip-count{font-size:11px;color:#94a3b8;white-space:nowrap}
.ip-pages{font-size:11px;color:#94a3b8;white-space:nowrap}
.ip-arr{color:#cbd5e1;font-size:13px;flex-shrink:0;transition:transform .2s;display:flex;align-items:center}
.ip-arr.ip-arr-open{transform:rotate(90deg)}
.ip-body{display:none;padding:0 16px 14px 44px;border-top:1px solid #f1f5f9;background:#fafbfc}
.ip-body.ip-body-open{display:block}
.ip-section{margin-bottom:12px;margin-top:10px}
.ip-sec-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:5px}
.ip-sec-text{font-size:13px;color:#334155;line-height:1.6}
.ip-code{background:#0d1117;color:#c9d1d9;font-family:monospace;font-size:12px;padding:13px;border-radius:7px;overflow-x:auto;line-height:1.6;white-space:pre;tab-size:2}
.ip-test-list{padding-left:18px;display:flex;flex-direction:column;gap:4px}
.ip-test-list li{font-size:12px;color:#475569;line-height:1.5}
.ip-pages-list{display:flex;flex-wrap:wrap;gap:5px;margin-top:3px}
.ip-pg{font-size:10px;background:#eff6ff;color:#2563eb;padding:2px 8px;border-radius:10px;font-weight:600}
.ip-pg-more{font-size:10px;color:#94a3b8;padding:2px 6px}
.ip-reflink{font-size:11px;color:#2563eb;text-decoration:none;background:#eff6ff;padding:3px 8px;border-radius:5px}
.ip-reflink:hover{text-decoration:underline}

/* PRINT */
@media print{#nav,#tabs,#fbar,#pg,.nbtn,button{display:none!important}.panel{display:block!important}.vb{display:block!important}body{background:#fff}.wrap{padding:0}}
@media(max-width:900px){.g4{grid-template-columns:1fr 1fr}.g2,.g2b{grid-template-columns:1fr}.bar-ti{display:none}#nav .nchip{display:none}.wrap{padding:16px}.exec-strip{flex-direction:column;align-items:flex-start}.exec-risk{align-items:flex-start}}
</style>
</head>
<body>

<!-- NAV -->
<nav id="nav">
  <a class="nav-brand" href="#">
    <div class="nav-ico">♿</div>
    <div class="nav-t">IS 17802 Audit Report</div>
  </a>
  <span class="nav-url">${e(report.meta.targetUrl)}</span>
  <div class="nav-sp"></div>
  <span class="nchip r">${critical} Critical</span>
  <span class="nchip o">${serious} Serious</span>
  <span class="nchip">${report.meta.totalPages} Pages</span>
  <button class="nbtn" id="exAll">Expand All</button>
  <button class="nbtn p" onclick="window.print()">⬇ PDF</button>
</nav>

<!-- HERO -->
<header id="hero">
  <div class="hero-in">
    <div>${donutSvg()}</div>
    <div class="hero-stats">
      <div class="sc"><div class="n">${total.toLocaleString()}</div><div class="l">Total</div></div>
      <div class="sc cc"><div class="n">${critical}</div><div class="l">Critical</div></div>
      <div class="sc cs"><div class="n">${serious}</div><div class="l">Serious</div></div>
      <div class="sc cm"><div class="n">${moderate}</div><div class="l">Moderate</div></div>
      <div class="sc cn"><div class="n">${minor}</div><div class="l">Minor</div></div>
    </div>
    <div class="hero-meta">
      <div class="hbadge">📋 ${e(report.meta.standard)}</div>
      <div>📄 ${report.meta.totalPages} pages audited</div>
      <div>🔧 axe-core + Custom Checks</div>
      <div>⚠️ Automated tools: ~30–40% coverage</div>
    </div>
  </div>
</header>

<!-- TABS -->
<div id="tabs">
  <button class="tab on" data-tab="overview">📊 Overview <span class="tc2">Summary</span></button>
  <button class="tab" data-tab="pages">📄 By Page <span class="tc2">${report.meta.totalPages}</span></button>
  <button class="tab" data-tab="violations">🔍 All Violations <span class="tc2">${total.toLocaleString()}</span></button>
  ${report.coverage ? `<button class="tab" data-tab="coverage">🗂 URL Coverage <span class="tc2">${report.coverage.total}</span></button>` : ''}
  <button class="tab" data-tab="plan">📝 Implementation Plan <span class="tc2">${Object.keys(report.summary.byClause).length} items</span></button>
</div>

<!-- ═══ OVERVIEW ════════════════════════════════════════════════ -->
<div id="panel-overview" class="panel on">
  <div class="wrap">

    ${critical > 0 ? `<div class="alert-banner" role="alert">
      <span class="alert-icon">🚨</span>
      <div class="alert-text"><strong>${critical} critical violation${critical !== 1 ? 's' : ''} detected</strong> that may completely block task completion for users with disabilities. These must be remediated immediately to achieve IS 17802 compliance.</div>
    </div>` : ''}

    <!-- Executive Summary -->
    <div class="exec-strip">
      <div class="conf-block">
        <div class="conf-ring-wrap">
          ${conformanceRingSvg(conformancePct)}
          <div class="conf-num">
            <div class="conf-pct">${conformancePct}%</div>
            <div class="conf-lbl">Criteria<br>Passed</div>
          </div>
        </div>
        <div class="conf-info">
          <div class="conf-title">IS 17802 Conformance Estimate</div>
          <div class="conf-sub">${passCriteria} of ${TOTAL_CRITERIA} WCAG 2.1 AA criteria passing</div>
          <div class="conf-sub">${violatedCriteria} criteria with automated violations</div>
          <div class="conf-sub" style="margin-top:5px;font-size:11px;color:#94a3b8">Automated checks cover ~30–40% of real barriers</div>
        </div>
      </div>
      <div class="exec-metrics">
        <div class="em er"><div class="en">${critical}</div><div class="el">Critical</div></div>
        <div class="em eo"><div class="en">${serious}</div><div class="el">Serious</div></div>
        <div class="em"><div class="en">${pagesWithCritical}</div><div class="el">Pages w/ Critical</div></div>
        <div class="em"><div class="en">${violatedCriteria}</div><div class="el">Criteria Violated</div></div>
        <div class="em"><div class="en">${report.meta.totalPages}</div><div class="el">Pages Audited</div></div>
      </div>
      <div class="exec-risk">
        <div class="risk-badge" style="background:${riskLevel.bg};border-color:${riskLevel.border};color:${riskLevel.color}">
          <span>${riskLevel.icon}</span><span>${riskLevel.label}</span>
        </div>
        <div class="risk-sub">IS 17802 / EN 301 549 v3.1.1<br>WCAG 2.1 Level AA</div>
      </div>
    </div>

    <!-- POUR Breakdown -->
    <div class="sh">POUR Principle Breakdown <span class="sh-sub">${total.toLocaleString()} total violations across 4 principles</span></div>
    <div class="g4">
      ${pour.map(p => {
        const m = pourMeta[p.name];
        return `<div class="pc2" style="border-top-color:${m.color}">
          <div class="ph"><span class="pi">${m.icon}</span><span class="pname2">${p.name}</span></div>
          <div class="pn2" style="color:${m.color}">${p.count.toLocaleString()}</div>
          <div class="psub">${p.pct}% of all violations</div>
          <div class="pbar"><div class="pbar-f" style="background:${m.color};width:${p.pct}%"></div></div>
          <div class="ppills">
            ${p.cr ? `<span class="ppill" style="background:#fef2f2;color:#b91c1c">${p.cr} Critical</span>` : ''}
            ${p.se ? `<span class="ppill" style="background:#fff7ed;color:#c2410c">${p.se} Serious</span>` : ''}
            ${p.mo ? `<span class="ppill" style="background:#fefce8;color:#a16207">${p.mo} Moderate</span>` : ''}
            ${p.mi ? `<span class="ppill" style="background:#f0fdf4;color:#15803d">${p.mi} Minor</span>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Priority Fixes + Worst Pages -->
    <div class="g2b">
      <div class="card">
        <div class="ct">🎯 Priority Remediation Items <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-left:4px">by critical × 3 + serious score</span></div>
        ${topPriority.length === 0
          ? `<div style="color:#94a3b8;font-size:13px;text-align:center;padding:22px 0">No critical or serious violations found</div>`
          : topPriority.map((fix, i) => `<div class="pfix-row">
          <div class="pfix-rank">${i + 1}</div>
          <div class="pfix-info">
            <div class="pfix-clause">IS ${e(fix.clause)}</div>
            <div class="pfix-title" title="${e(fix.title)}">${e(fix.title)}</div>
            <div class="pfix-pills">
              ${fix.cr ? `<span class="ppill" style="background:#fef2f2;color:#b91c1c">${fix.cr} Critical</span>` : ''}
              ${fix.se ? `<span class="ppill" style="background:#fff7ed;color:#c2410c">${fix.se} Serious</span>` : ''}
            </div>
          </div>
          <div class="pfix-count"><div class="pfix-n">${fix.count}</div><div class="pfix-u">issues</div></div>
        </div>`).join('')}
      </div>
      <div class="card">
        <div class="ct">📑 Most Affected Pages <span style="font-size:11px;font-weight:400;color:#94a3b8;margin-left:4px">critical×4 + serious×2 + moderate</span></div>
        ${worstPages.map((pg, i) => `<div class="wp-row">
          <div class="wp-rank">${i + 1}</div>
          <div class="wp-info">
            <div class="wp-name" title="${e(pg.name)}">${e(pg.name)}</div>
            <div class="wp-pills">
              ${pg.cr ? `<span class="ppill" style="background:#fef2f2;color:#b91c1c">${pg.cr} Critical</span>` : ''}
              ${pg.se ? `<span class="ppill" style="background:#fff7ed;color:#c2410c">${pg.se} Serious</span>` : ''}
              ${pg.mo ? `<span class="ppill" style="background:#fefce8;color:#a16207">${pg.mo} Moderate</span>` : ''}
            </div>
          </div>
          <div class="wp-count"><div class="wp-n">${pg.score}</div><div class="wp-u">risk score</div></div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Top Clauses + Methodology -->
    <div class="g2">
      <div class="card">
        <div class="ct">📈 Top Violated IS 17802 Clauses</div>
        ${topClauses.map(([clause, count]) => {
          const pct = Math.round((count / maxClause) * 100);
          const pctOfTotal = total > 0 ? Math.round((count / total) * 100) : 0;
          return `<div class="bar-r">
            <div class="bar-lbl">IS ${e(clause)}</div>
            <div class="bar-tr"><div class="bar-fi" style="width:${pct}%"><span class="bar-ct">${count} <span style="font-weight:400;opacity:.75">(${pctOfTotal}%)</span></span></div></div>
            <div class="bar-ti">${e(clauseTitles[clause] ?? '')}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="card">
        <div class="ct">🏁 Audit Scope &amp; Methodology</div>
        <div class="meth-grid">
          <div><strong>Standard:</strong> IS 17802 / EN 301 549 v3.1.1</div>
          <div><strong>WCAG Level:</strong> 2.1 AA (50 success criteria)</div>
          <div><strong>Engine:</strong> axe-core 4.9 + 12 custom fintech checks</div>
          <div><strong>Browser:</strong> Chromium (Playwright)</div>
          <div><strong>Pages Audited:</strong> ${report.meta.totalPages}</div>
          <div><strong>Audit Date:</strong> ${e(new Date(report.meta.auditedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }))}</div>
        </div>
        <div class="meth-warn">⚠️ <strong>Limitation:</strong> Automated tools detect ~30–40% of real-world barriers. Manual testing with NVDA, VoiceOver, and keyboard-only navigation is required for full IS 17802 conformance.</div>
        <div style="margin-top:14px">
          <div class="ct" style="margin-bottom:8px">📋 Severity Definitions</div>
          <div class="sev-legend">
            <div class="sev-row"><span class="pill pc">Critical</span><span>Blocks task completion for users with disabilities</span></div>
            <div class="sev-row"><span class="pill ps">Serious</span><span>Significantly impairs experience</span></div>
            <div class="sev-row"><span class="pill pm">Moderate</span><span>Causes confusion, workaround exists</span></div>
            <div class="sev-row"><span class="pill pn">Minor</span><span>Best practice deviation, low impact</span></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- ═══ BY PAGE ══════════════════════════════════════════════════ -->
<div id="panel-pages" class="panel">
  <div class="wrap">
    <div class="sh">Results by Page <span class="sh-sub">Click column headers to sort</span></div>
    <div class="tw">
      <table class="tbl" id="ptbl">
        <thead><tr>
          <th data-col="name" data-dir="1">Page</th>
          <th data-col="cr" data-dir="-1" style="text-align:center">Critical</th>
          <th data-col="se" data-dir="-1" style="text-align:center">Serious</th>
          <th data-col="mo" data-dir="-1" style="text-align:center">Moderate</th>
          <th data-col="mi" data-dir="-1" style="text-align:center">Minor</th>
          <th data-col="tot" data-dir="-1" style="text-align:center">Total</th>
        </tr></thead>
        <tbody id="ptbody">${pageRows}</tbody>
      </table>
    </div>
  </div>
</div>

<!-- ═══ ALL VIOLATIONS ══════════════════════════════════════════ -->
<div id="panel-violations" class="panel">
  <div class="wrap">
    <div class="sh">All Violations</div>
    <div id="fbar">
      <div class="sw"><span class="si">🔍</span><input type="search" id="srch" placeholder="Search by description, clause, page…" autocomplete="off"></div>
      <div class="fsep"></div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="flbl">Severity</span>
        <button class="fb all on" data-f="all">All</button>
        <button class="fb critical" data-f="critical">Critical</button>
        <button class="fb serious"  data-f="serious">Serious</button>
        <button class="fb moderate" data-f="moderate">Moderate</button>
        <button class="fb minor"    data-f="minor">Minor</button>
      </div>
      <div class="fsep"></div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="flbl">Principle</span>
        <select class="sel" id="pfil"><option value="">All</option><option>Perceivable</option><option>Operable</option><option>Understandable</option><option>Robust</option></select>
      </div>
      <div class="fsep"></div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="flbl">Sort</span>
        <select class="sel" id="psort">
          <option value="impact">Severity (worst first)</option>
          <option value="clause">Clause</option>
          <option value="page">Page</option>
          <option value="desc">Description A–Z</option>
        </select>
      </div>
      <span id="vcnt"></span>
    </div>
    <div id="vlist"></div>
    <div id="vempty" class="empty" style="display:none"><div class="empty-ico">🔎</div><div class="empty-t">No violations match your filters</div></div>
    <div id="pg"></div>
  </div>
</div>

${report.coverage ? buildCoveragePanel(report.coverage) : ''}

${buildImplementationPanel(report)}

<footer>
  <strong>IS 17802 Accessibility Conformance Report</strong><br>
  ${e(report.meta.standard)} &nbsp;·&nbsp; ${report.meta.totalPages} pages &nbsp;·&nbsp; ${total.toLocaleString()} violations &nbsp;·&nbsp; ${e(new Date(report.meta.auditedAt).toLocaleString('en-IN'))}<br>
  <span style="font-size:11px;opacity:.6">Automated tools detect ~30–40% of real-world accessibility barriers. Manual evaluation with assistive technologies is required for full IS 17802 conformance.</span>
</footer>

<!-- ═══ SCRIPTS ══════════════════════════════════════════════════ -->
<script>
/* ── 1. TAB SWITCHING — no data dependency ─────────────────────── */
document.querySelectorAll('.tab').forEach(function(t){
  t.addEventListener('click', function(){
    document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('on'); });
    document.querySelectorAll('.panel').forEach(function(x){ x.classList.remove('on'); });
    t.classList.add('on');
    var p = document.getElementById('panel-' + t.getAttribute('data-tab'));
    if(p) p.classList.add('on');
  });
});

/* ── 2. PAGE TABLE SORT — pure DOM, no data needed ─────────────── */
document.querySelectorAll('#ptbl th').forEach(function(th){
  th.addEventListener('click', function(){
    var col = th.getAttribute('data-col');
    var dir = parseInt(th.getAttribute('data-dir'));
    th.setAttribute('data-dir', String(-dir));
    var tbody = document.getElementById('ptbody');
    var rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort(function(a, b){
      var va = a.getAttribute('data-' + col) || a.cells[0].querySelector('.pname').textContent;
      var vb = b.getAttribute('data-' + col) || b.cells[0].querySelector('.pname').textContent;
      var na = parseFloat(va), nb = parseFloat(vb);
      if(!isNaN(na) && !isNaN(nb)) return dir * (nb - na);
      return dir * String(va).localeCompare(String(vb));
    });
    rows.forEach(function(r){ tbody.appendChild(r); });
  });
});
</script>

<script>var VIOLATIONS_URL="${e(violationsUrl)}";</script>
<script>
/* ── 3. VIOLATIONS TAB — data loaded lazily from VIOLATIONS_URL ── */
var PAGE_SIZE = 50;
var curPage = 1;
var allData = null;   // slim violation objects from VD
var filtered = [];    // currently filtered+sorted data objects
var initialized = false;
var impOrd = {critical:0,serious:1,moderate:2,minor:3};

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function makeViolationEl(v){
  var wcagUrl='https://www.w3.org/WAI/WCAG21/Understanding/'+(v.wcag||'').replace(/\./g,'-');
  var nodeHtml=(v.nodes||[]).map(function(n){
    return '<div class="code"><div class="codet">Affected element</div><div class="codeh">'+esc(n.html)+'</div><div class="codes">'+esc(n.summary)+'</div></div>';
  }).join('');
  var srcCls=v.source==='custom'?' cx':v.source==='ibm'?' ibm':'';
  var vid='v'+v._i;
  var div=document.createElement('div');
  div.className='vc vis';
  div.setAttribute('data-impact',v.impact||'');
  div.setAttribute('data-principle',v.principle||'');
  div.setAttribute('data-clause',v.clause||'');
  div.setAttribute('data-page',v.page||'');
  div.innerHTML='<div class="vh" data-vid="'+vid+'" role="button" tabindex="0" aria-expanded="false">'
    +'<span class="vimp '+esc(v.impact)+'">'+esc(v.impact)+'</span>'
    +'<span class="vcl">IS&nbsp;'+esc(v.clause)+'</span>'
    +'<span class="vd" title="'+esc(v.desc)+'">'+esc(v.desc)+'</span>'
    +'<span class="vpg" title="'+esc(v.page)+'">'+esc(v.page)+'</span>'
    +'<span class="vsrc'+srcCls+'">'+esc(v.source)+'</span>'
    +'<span class="varr" data-arr="'+vid+'">&#9656;</span></div>'
    +'<div class="vb" id="vb-'+vid+'"><dl class="vdl">'
    +'<dt>Clause</dt><dd>IS 17802 / '+esc(v.clause)+' — WCAG '+esc(v.wcag)+' (Level '+esc(v.level)+')</dd>'
    +'<dt>Title</dt><dd>'+esc(v.title)+'</dd>'
    +'<dt>Principle</dt><dd>'+esc(v.principle)+'</dd>'
    +'<dt>Impact</dt><dd>'+esc(v.impact)+'</dd>'
    +'<dt>Page</dt><dd><a href="'+esc(v.url)+'" target="_blank" rel="noopener">'+esc(v.page)+'</a></dd>'
    +'<dt>Fix</dt><dd>'+esc(v.help)+'</dd>'
    +'<dt>Reference</dt><dd><a href="'+esc(wcagUrl)+'" target="_blank" rel="noopener">WCAG Understanding '+esc(v.wcag)+' ↗</a></dd>'
    +'</dl>'+nodeHtml+'</div>';
  return div;
}

function initViolations(){
  if(initialized) return;
  initialized=true; // prevent double-fetch on rapid tab clicks
  var vlist=document.getElementById('vlist');
  if(vlist) vlist.innerHTML='<div style="padding:40px;text-align:center;color:#94a3b8;font-size:13px">Loading violations…</div>';
  fetch(window.VIOLATIONS_URL||'/audit-results/violations.json')
    .then(function(r){
      if(!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    })
    .then(function(d){
      allData=(d.violations||[]).map(function(v,i){
        v._i=i;
        v._sk=(v.desc+' '+v.clause+' '+v.title+' '+v.page+' '+v.help).toLowerCase();
        return v;
      });
      applyFilters();
    })
    .catch(function(err){
      var vl=document.getElementById('vlist');
      if(vl) vl.innerHTML='<div style="padding:40px;text-align:center;color:#dc2626;font-size:13px">Failed to load violations: '+esc(String(err))+'</div>';
    });
}

function getFilters(){
  var activeF=document.querySelector('.fb.on');
  return {
    impact:(activeF?activeF.getAttribute('data-f'):'all')||'all',
    principle:document.getElementById('pfil').value,
    search:document.getElementById('srch').value.toLowerCase().trim(),
    sort:document.getElementById('psort').value
  };
}

function applyFilters(){
  if(!initialized) return;
  var f=getFilters();
  filtered=allData.filter(function(v){
    if(f.impact!=='all'&&v.impact!==f.impact) return false;
    if(f.principle&&v.principle!==f.principle) return false;
    if(f.search&&v._sk.indexOf(f.search)===-1) return false;
    return true;
  });
  filtered.sort(function(a,b){
    if(f.sort==='impact') return (impOrd[a.impact]||0)-(impOrd[b.impact]||0);
    if(f.sort==='clause') return (a.clause||'').localeCompare(b.clause||'');
    if(f.sort==='page')   return (a.page||'').localeCompare(b.page||'');
    if(f.sort==='desc')   return (a.desc||'').localeCompare(b.desc||'');
    return 0;
  });
  curPage=1;
  render();
}

function render(){
  if(!allData) return;
  var vlist=document.getElementById('vlist');
  var emptyEl=document.getElementById('vempty');
  var cnt=document.getElementById('vcnt');
  var pgEl=document.getElementById('pg');

  vlist.innerHTML=''; // clear previous page

  var start=(curPage-1)*PAGE_SIZE;
  var slice=filtered.slice(start,start+PAGE_SIZE);
  var totalPg=Math.ceil(filtered.length/PAGE_SIZE);

  if(cnt) cnt.textContent=filtered.length.toLocaleString()+' violation'+(filtered.length!==1?'s':'')+' shown';

  if(!slice.length){
    if(emptyEl) emptyEl.style.display='block';
    if(pgEl) pgEl.innerHTML='';
    return;
  }
  if(emptyEl) emptyEl.style.display='none';

  var frag=document.createDocumentFragment();
  slice.forEach(function(v){ frag.appendChild(makeViolationEl(v)); });
  vlist.appendChild(frag);

  if(!pgEl) return;
  if(totalPg<=1){ pgEl.innerHTML=''; return; }
  var html='<button class="pgb" id="pgp"'+(curPage===1?' disabled':'')+'>← Prev</button>';
  var s=Math.max(1,curPage-2),en=Math.min(totalPg,curPage+2);
  if(s>1) html+='<button class="pgb" data-pg="1">1</button>'+(s>2?'<span>…</span>':'');
  for(var i=s;i<=en;i++) html+='<button class="pgb'+(i===curPage?' on':'')+'" data-pg="'+i+'">'+i+'</button>';
  if(en<totalPg) html+=(en<totalPg-1?'<span>…</span>':'')+'<button class="pgb" data-pg="'+totalPg+'">'+totalPg+'</button>';
  html+='<button class="pgb" id="pgn"'+(curPage===totalPg?' disabled':'')+'>Next →</button>';
  html+='<span id="pgi">Page '+curPage+' of '+totalPg+'</span>';
  pgEl.innerHTML=html;
}

/* Init violations on first tab click */
document.querySelectorAll('.tab').forEach(function(t){
  t.addEventListener('click',function(){
    if(t.getAttribute('data-tab')==='violations') initViolations();
  });
});

/* Event delegation — works with dynamically created elements */
document.addEventListener('click',function(ev){
  var hdr=ev.target.closest('[data-vid]');
  if(hdr){
    var id=hdr.getAttribute('data-vid');
    var body=document.getElementById('vb-'+id);
    var arr=document.querySelector('[data-arr="'+id+'"]');
    if(body){ var op=body.classList.toggle('op'); hdr.setAttribute('aria-expanded',String(op)); if(arr) arr.classList.toggle('op',op); }
    return;
  }
  var pg=ev.target.closest('[data-pg]');
  if(pg&&initialized){ curPage=parseInt(pg.getAttribute('data-pg')); render(); document.getElementById('panel-violations').scrollIntoView({behavior:'smooth'}); return; }
  if(ev.target.id==='pgp'&&curPage>1&&initialized){ curPage--; render(); return; }
  if(ev.target.id==='pgn'&&initialized){ curPage++; render(); return; }
});
document.addEventListener('keydown',function(ev){
  if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest('[data-vid]')){ ev.preventDefault(); ev.target.closest('[data-vid]').click(); }
});

document.querySelectorAll('.fb').forEach(function(b){
  b.addEventListener('click',function(){
    document.querySelectorAll('.fb').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
    if(initialized) applyFilters();
  });
});
document.getElementById('pfil').addEventListener('change',function(){ if(initialized) applyFilters(); });
document.getElementById('psort').addEventListener('change',function(){ if(initialized) applyFilters(); });
var st;
document.getElementById('srch').addEventListener('input',function(){ clearTimeout(st); st=setTimeout(function(){ if(initialized) applyFilters(); },200); });

document.getElementById('exAll').addEventListener('click',function(){
  document.querySelectorAll('.vb').forEach(function(b){ b.classList.add('op'); });
  document.querySelectorAll('.varr').forEach(function(a){ a.classList.add('op'); });
  document.querySelectorAll('[data-vid]').forEach(function(h){ h.setAttribute('aria-expanded','true'); });
});
</script>

</body>
</html>`;
}
