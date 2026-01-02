
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgres://postgres.eroshburtzpogygnsfox:iWbbTChnsy2LmSva@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT version()');
        console.log('Postgres Version:', res.rows[0]);

        // Also list tables to see if we can read schema
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables:', tables.rows.map(row => row.table_name));

    } catch (err) {
        console.error('Connection error', err);
    } finally {
        await client.end();
    }
}

run();
