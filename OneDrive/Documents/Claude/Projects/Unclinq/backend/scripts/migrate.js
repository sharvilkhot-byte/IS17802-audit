/**
 * UNCLINQ — Migration Runner
 * Run: node scripts/migrate.js
 *
 * Applies all pending SQL migrations in order.
 * Tracks applied migrations in a `schema_migrations` table.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

async function run() {
  const client = await pool.connect();
  try {
    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Get list of already-applied migrations
    const result = await client.query('SELECT filename FROM schema_migrations');
    const applied = new Set(result.rows.map(r => r.filename));

    // Read all .sql files sorted by name
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let pending = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ✓ ${file} (already applied)`);
        continue;
      }

      console.log(`  → Applying ${file}...`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✓ ${file} applied`);
        pending++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ✗ ${file} FAILED: ${err.message}`);
        process.exit(1);
      }
    }

    if (pending === 0) {
      console.log('\nAll migrations already applied. Database is up to date.');
    } else {
      console.log(`\n${pending} migration(s) applied successfully.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('Unclinq — Running migrations\n');
run().catch(err => {
  console.error('Migration runner failed:', err.message);
  process.exit(1);
});
