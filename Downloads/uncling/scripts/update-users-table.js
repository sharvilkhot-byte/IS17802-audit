
import pg from 'pg';

const { Client } = pg;

const connectionString = 'postgres://postgres.eroshburtzpogygnsfox:iWbbTChnsy2LmSva@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
});

async function updateSchema() {
    try {
        await client.connect();
        console.log('Connected to database...');

        // Add daily_streak_count
        await client.query(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS daily_streak_count INTEGER DEFAULT 0;
    `);
        console.log('Added daily_streak_count.');

        // Add last_check_in_date
        await client.query(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS last_check_in_date TIMESTAMPTZ DEFAULT NULL;
    `);
        console.log('Added last_check_in_date.');

        console.log('Schema update complete!');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
