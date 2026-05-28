import { runAudit, clearCheckpoint } from './src/runner';
import path from 'path';
import fs from 'fs';

async function main() {
  const outputDir = path.join(process.cwd(), 'audit-results', 'combined-report', 'checkpoint-login');
  fs.mkdirSync(outputDir, { recursive: true });

  const results = await runAudit({
    outputDir,
    headless: false,
    viewport: { width: 1280, height: 800 },
    timeout: 30000,
    pages: [{ name: '[CIBIL Web] Login', url: 'http://localhost:9192/login.html', waitFor: 'body' }],
  });

  fs.writeFileSync(
    path.join(process.cwd(), 'audit-results', 'combined-report', 'login-result.json'),
    JSON.stringify(results, null, 2)
  );

  await clearCheckpoint(outputDir);
  console.log(`Login audit done: ${results[0].violations.length} violations`);
}

main().catch(console.error);
