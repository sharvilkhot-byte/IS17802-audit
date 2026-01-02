
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgres://postgres.eroshburtzpogygnsfox:iWbbTChnsy2LmSva@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const client = new Client({
    connectionString,
});

const schemaSql = `
-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text,
  preferred_name text,
  attachment_style text,
  onboarding_completed boolean DEFAULT false,
  consent_challenges boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. onboarding_responses
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  question_id text,
  answer_value int,
  created_at timestamptz DEFAULT now()
);

-- 3. onboarding_result
CREATE TABLE IF NOT EXISTS onboarding_result (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  attachment_style text,
  anxiety_score float,
  avoidance_score float,
  confidence float,
  generated_at timestamptz DEFAULT now()
);

-- 4. sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  started_at timestamptz,
  ended_at timestamptz,
  entry_point text
);

-- 5. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- ensuring ID generation
  user_id uuid REFERENCES users(id),
  session_id uuid REFERENCES sessions(id),
  role text,
  content text,
  created_at timestamptz DEFAULT now()
);

-- 6. emotional_events (BRAIN MEMORY)
CREATE TABLE IF NOT EXISTS emotional_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id), -- Added explicit reference for safety
  activation_level int, -- 0 calm | 1 elevated | 2 overwhelmed
  source text,
  confidence float,
  created_at timestamptz DEFAULT now()
);

-- 7. regulation_attempts
CREATE TABLE IF NOT EXISTS regulation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  tool_used text,
  effectiveness text,
  method text, -- Merged from Progress part
  context text, -- Merged from Progress part
  duration_seconds int, -- Merged from Progress part
  perceived_helpfulness int, -- Merged from Progress part
  created_at timestamptz DEFAULT now()
);

-- 8. patterns (SLOW, CAREFUL)
CREATE TABLE IF NOT EXISTS patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  pattern_key text,
  domain text,
  description text,
  evidence jsonb,
  confidence float CHECK (confidence >= 0 AND confidence <= 1),
  stability_score float,
  first_seen timestamptz,
  last_seen timestamptz,
  surfaced boolean DEFAULT false,
  consent_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pattern_key)
);

-- 9. nudges_log
CREATE TABLE IF NOT EXISTS nudges_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  pattern_key text,
  delivered_at timestamptz DEFAULT now()
);

-- 10. education_exposures
CREATE TABLE IF NOT EXISTS education_exposures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  topic text,
  exposed_at timestamptz DEFAULT now()
);

-- 11. progress_snapshots
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  period text DEFAULT 'biweekly',
  snapshot jsonb,
  generated_copy jsonb,
  confidence float CHECK (confidence >= 0 AND confidence <= 1),
  surfaced boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
`;

async function run() {
    try {
        await client.connect();
        console.log('Connected. creating schema...');

        // Split commands by double newline to execute loosely, or just run one big block?
        // Postgres client can often handle multiple statements, but cleaner to maybe split.
        // For simplicity, let's try running as one block. pg usually supports it.

        await client.query(schemaSql);

        console.log('Schema setup completed successfully.');

    } catch (err) {
        console.error('Error creating schema:', err);
    } finally {
        await client.end();
    }
}

run();
