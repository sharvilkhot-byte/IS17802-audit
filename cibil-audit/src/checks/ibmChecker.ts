/**
 * IBM Equal Access Checker integration for Playwright.
 * Injects ace.js into the live page and runs WCAG 2.1 AA checks.
 * Results are mapped to IS 17802 via the same clause mapper used for axe-core.
 */
import { Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface IbmIssue {
  ruleId: string;
  message: string;
  snippet: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

// Load ace.js once and cache it
let _engineScript: string | null = null;
function getEngineScript(): string {
  if (_engineScript) return _engineScript;
  const enginePath = path.join(
    path.dirname(require.resolve('accessibility-checker-engine/package.json')),
    'ace.js',
  );
  _engineScript = fs.readFileSync(enginePath, 'utf-8');
  return _engineScript;
}

export async function runIbmChecks(page: Page): Promise<IbmIssue[]> {
  try {
    const script = getEngineScript();

    // Inject the IBM ACE engine into the live page
    await page.addScriptTag({ content: script });

    // Run the checker inside the browser context and serialize results
    const raw = await page.evaluate(async () => {
      try {
        // @ts-ignore — ace is now a global from the injected script
        const checker = new ace.Checker();
        const report = await checker.check(document, ['WCAG_2_1']);
        return (report.results as any[])
          .filter(r =>
            r.value &&
            r.value[0] === 'VIOLATION' &&
            r.value[1] === 'FAIL',
          )
          .map(r => ({
            ruleId: String(r.ruleId || ''),
            message: String(r.message || '').substring(0, 400),
            snippet: String(r.snippet || '').substring(0, 300),
          }));
      } catch {
        return [];
      }
    });

    return (raw as { ruleId: string; message: string; snippet: string }[]).map(r => ({
      ...r,
      impact: ibmImpact(r.ruleId),
    }));
  } catch (err) {
    // Non-fatal — axe-core results are still captured
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠ IBM checker skipped: ${msg}`);
    return [];
  }
}

/**
 * IBM violations are generally "serious" — they map to WCAG failures.
 * A small set of high-severity rules are escalated to "critical".
 */
function ibmImpact(ruleId: string): IbmIssue['impact'] {
  const criticalRules = new Set([
    'WCAG20_Input_ExplicitLabel',   // missing form label
    'WCAG20_Img_HasAlt',            // missing image alt
    'WCAG20_Frame_HasTitle',        // inaccessible frame
    'WCAG20_A_HasText',             // empty link
    'Rpt_Aria_ValidRole',           // invalid ARIA role
    'Rpt_Aria_RequiredProperties',  // missing required ARIA property
    'IBMA_Color_Contrast_WCAG2AA',  // colour contrast
    'WCAG20_Html_HasLang',          // missing lang attribute
    'WCAG20_Doc_HasTitle',          // missing page title
  ]);
  if (criticalRules.has(ruleId)) return 'critical';
  return 'serious';
}
