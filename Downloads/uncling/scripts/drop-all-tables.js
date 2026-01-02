
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgres://postgres.eroshburtzpogygnsfox:iWbbTChnsy2LmSva@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected. Fetching tables...');

        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

        if (tables.rows.length === 0) {
            console.log('No tables found in public schema.');
            return;
        }

        console.log(`Found ${tables.rows.length} tables. Dropping...`);

        for (const row of tables.rows) {
            const tableName = row.table_name;
            console.log(`Dropping table: ${tableName}`);
            await client.query(`DROP TABLE IF EXISTS "public"."${tableName}" CASCADE`);
        }

        console.log('All public tables dropped successfully.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
