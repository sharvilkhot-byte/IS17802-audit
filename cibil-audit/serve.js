/**
 * Minimal local HTTP server for viewing the audit report.
 * No extra dependencies — uses Node.js built-in http and fs modules.
 * Run: node serve.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT = path.join(__dirname, 'audit-results');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Default to index
  let urlPath = req.url === '/' ? '/accessibility-report.html' : req.url;
  // Strip query string
  urlPath = urlPath.split('?')[0];

  const filePath = path.join(ROOT, urlPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log('\n  IS 17802 Accessibility Audit Report');
  console.log('  ─────────────────────────────────────');
  console.log(`  Serving: ${ROOT}`);
  console.log(`  Open:    ${url}\n`);
  console.log('  Press Ctrl+C to stop.\n');

  // Open browser
  const cmd = process.platform === 'win32'
    ? `start ${url}`
    : process.platform === 'darwin'
      ? `open ${url}`
      : `xdg-open ${url}`;

  exec(cmd, err => { if (err) console.log('  → Open manually:', url); });
});
