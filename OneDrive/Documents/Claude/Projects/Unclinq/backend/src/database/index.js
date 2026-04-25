const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

// Issue #3: Run ALL migrations in numeric order, not just 001.
// Each migration file is idempotent (uses IF NOT EXISTS / IF EXISTS guards).
async function initDatabase() {
  // Issue #10: Startup health check — fail fast if DB is unreachable
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    throw new Error(`Database connection failed: ${err.message}`);
  }

  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, '../../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn('No migrations directory found — skipping migrations');
      return;
    }

    // Collect all .sql files sorted numerically (001, 002, 003, ...)
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // lexicographic sort works for zero-padded numeric prefixes

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      try {
        await client.query(sql);
        console.log(`  ✓ Migration applied: ${file}`);
      } catch (err) {
        // Log but don't throw on individual migration errors —
        // many are "column already exists" from idempotent ADD COLUMN IF NOT EXISTS
        if (!err.message.includes('already exists')) {
          console.error(`  ✗ Migration failed: ${file} — ${err.message}`);
          throw err; // re-throw non-trivial errors
        }
      }
    }
  } finally {
    client.release();
  }
}

// Wrapped query function with error logging
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn('Slow query detected:', { text: text.slice(0, 80), duration });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', { text: text.slice(0, 80), error: error.message });
    throw error;
  }
}

module.exports = { pool, query, initDatabase };
