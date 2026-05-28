/**
 * Audits the 23 states that were missed in the initial combined audit:
 *
 * login.html           — otp, forgot, forgot-email, setpw             (+4)
 * index.html           — otp, forgot, setpw                           (+3)
 * dashboard.html       — manual flow, expiring/refresh-disabled/expired plans, otp/forgot/setpw (+7)
 * manual.html          — corporates, huf, society, trust tabs + otp/forgot/setpw (+7)
 * upload-without-email — partnership, proprietorship tabs             (+2)
 *
 * Total: 23 additional pages/states
 */
import { runAudit, clearCheckpoint } from './src/runner';
import { AuditConfig, PageAuditResult } from './src/types';
import path from 'path';
import fs from 'fs';

const CW  = 'http://localhost:9192';  // CIBIL Web
const DU  = 'http://localhost:9191';  // Doc Upload
const OUT = path.join(process.cwd(), 'audit-results', 'missing-states');

// Helper: JS to switch lhs-state (login overlay states)
const switchLoginState = (state: string) =>
  `document.querySelectorAll('.lhs-state').forEach(el=>{el.classList.remove('lhs-state--active');}); var t=document.querySelector('[data-state="${state}"]'); if(t) t.classList.add('lhs-state--active');`;

const config: AuditConfig = {
  outputDir: OUT,
  headless: false,
  viewport: { width: 1280, height: 800 },
  timeout: 30000,
  pages: [

    // ── login.html — 4 additional states ─────────────────────────────────────
    {
      name: '[Login] OTP State',
      url: `${CW}/login.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('otp') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Login] Forgot Password State',
      url: `${CW}/login.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('forgot') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Login] Forgot Email State',
      url: `${CW}/login.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('forgot-email') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Login] Set Password State',
      url: `${CW}/login.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('setpw') }, { type: 'wait', ms: 400 }],
    },

    // ── index.html — 3 login states ──────────────────────────────────────────
    {
      name: '[Index] OTP State',
      url: `${CW}/index.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('otp') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Index] Forgot Password State',
      url: `${CW}/index.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('forgot') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Index] Set Password State',
      url: `${CW}/index.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('setpw') }, { type: 'wait', ms: 400 }],
    },

    // ── dashboard.html — 4 proto variants ────────────────────────────────────
    {
      name: '[Dashboard] Manual Flow',
      url: `${CW}/dashboard.html`, waitFor: 'body',
      actions: [{ type: 'click', selector: '[data-proto-flow="manual"]' }, { type: 'wait', ms: 500 }],
    },
    {
      name: '[Dashboard] Plan — Expiring',
      url: `${CW}/dashboard.html`, waitFor: 'body',
      actions: [{ type: 'click', selector: '[data-proto-plan="expiring"]' }, { type: 'wait', ms: 500 }],
    },
    {
      name: '[Dashboard] Plan — Refresh Disabled',
      url: `${CW}/dashboard.html`, waitFor: 'body',
      actions: [{ type: 'click', selector: '[data-proto-plan="refresh-disabled"]' }, { type: 'wait', ms: 500 }],
    },
    {
      name: '[Dashboard] Plan — Expired',
      url: `${CW}/dashboard.html`, waitFor: 'body',
      actions: [{ type: 'click', selector: '[data-proto-plan="expired"]' }, { type: 'wait', ms: 500 }],
    },
    // dashboard login overlay states
    {
      name: '[Dashboard] Login Overlay — OTP',
      url: `${CW}/dashboard.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('otp') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Dashboard] Login Overlay — Forgot',
      url: `${CW}/dashboard.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('forgot') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Dashboard] Login Overlay — Set Password',
      url: `${CW}/dashboard.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('setpw') }, { type: 'wait', ms: 400 }],
    },

    // ── manual.html — 4 doc-chip tabs ────────────────────────────────────────
    {
      name: '[Manual] Corporates Tab',
      url: `${CW}/manual.html`, waitFor: 'body',
      actions: [{ type: 'click', selector: '[data-chip-btn="corporates"]' }, { type: 'wait', ms: 500 }],
    },
    {
      name: '[Manual] HUF Tab',
      url: `${CW}/manual.html`, waitFor: 'body',
      actions: [{ type: 'click', selector: '[data-chip-btn="huf"]' }, { type: 'wait', ms: 500 }],
    },
    {
      name: '[Manual] Society Tab',
      url: `${CW}/manual.html`, waitFor: 'body',
      actions: [{ type: 'click', selector: '[data-chip-btn="society"]' }, { type: 'wait', ms: 500 }],
    },
    {
      name: '[Manual] Trust Tab',
      url: `${CW}/manual.html`, waitFor: 'body',
      actions: [{ type: 'click', selector: '[data-chip-btn="trust"]' }, { type: 'wait', ms: 500 }],
    },
    // manual.html login overlay states
    {
      name: '[Manual] Login Overlay — OTP',
      url: `${CW}/manual.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('otp') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Manual] Login Overlay — Forgot',
      url: `${CW}/manual.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('forgot') }, { type: 'wait', ms: 400 }],
    },
    {
      name: '[Manual] Login Overlay — Set Password',
      url: `${CW}/manual.html`, waitFor: 'body',
      actions: [{ type: 'evaluate', value: switchLoginState('setpw') }, { type: 'wait', ms: 400 }],
    },

    // ── upload-without-email.html — 2 missing tabs ───────────────────────────
    {
      name: '[Doc Upload] Without Email — Partnership Tab',
      url: `${DU}/upload-without-email.html`, waitFor: '.page',
      actions: [{ type: 'click', selector: '[data-tab="partnership"]' }, { type: 'wait', ms: 500 }],
    },
    {
      name: '[Doc Upload] Without Email — Proprietorship Tab',
      url: `${DU}/upload-without-email.html`, waitFor: '.page',
      actions: [{ type: 'click', selector: '[data-tab="proprietorship"]' }, { type: 'wait', ms: 500 }],
    },
  ],
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log('\n' + '='.repeat(65));
  console.log('  IS 17802 — Missing States Audit');
  console.log('='.repeat(65));
  console.log(`Pages: ${config.pages.length}`);
  config.pages.forEach(p => console.log(`  • ${p.name}`));
  console.log('');

  const results: PageAuditResult[] = await runAudit(config);
  await clearCheckpoint(OUT);

  // Save as violations.json so merge-reports can pick it up
  const slim = {
    violations: results.flatMap(p => p.violations).map(v => ({
      id: v.id, clause: v.clause.clause, wcag: v.clause.wcag,
      level: v.clause.level, title: v.clause.title, principle: v.clause.principle,
      page: v.page, url: v.url, impact: v.impact,
      desc: v.description.substring(0, 200),
      help: v.help.substring(0, 400),
      helpUrl: v.helpUrl, source: v.source, nodes: v.nodes.slice(0, 2),
    })),
  };
  fs.writeFileSync(path.join(OUT, 'violations.json'), JSON.stringify(slim), 'utf-8');

  // Also save full page results for merge
  fs.writeFileSync(path.join(OUT, 'page-results.json'), JSON.stringify(results, null, 2), 'utf-8');

  const total = results.flatMap(p => p.violations).length;
  console.log('\n' + '='.repeat(65));
  console.log('  DONE');
  console.log('='.repeat(65));
  console.log(`Pages: ${results.length} | Violations: ${total}`);
  results.forEach(p => console.log(`  ${p.page}: ${p.violations.length} violations`));
}

main().catch(err => { console.error('Failed:', err); process.exit(1); });
