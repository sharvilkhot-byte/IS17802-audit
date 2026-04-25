#!/usr/bin/env node
/**
 * Quick database connection test
 * Run: node test-db-connection.js
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('\n🔍 Database Connection Test\n');
// Override for direct test — uses postgres superuser
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unclinq_dev';
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
});

pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
  } else {
    console.log('✅ Connection successful! Server time:', res.rows[0].now);
  }
  await pool.end();
  process.exit(err ? 1 : 0);
});
