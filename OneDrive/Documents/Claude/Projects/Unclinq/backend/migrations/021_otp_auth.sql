-- ─────────────────────────────────────────────────────────────────────────────
-- 021: OTP (passwordless) authentication
-- Adds auth_otps table and makes password_hash nullable for OTP-only users
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow passwordless registration (OTP-only users have no password_hash)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
  END IF;
END $$;

-- OTP codes table
-- One active code per (email, purpose) at a time (upserted).
CREATE TABLE IF NOT EXISTS auth_otps (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL,
  code_hash    TEXT        NOT NULL,
  purpose      TEXT        NOT NULL DEFAULT 'login',  -- 'login' | 'register'
  expires_at   TIMESTAMPTZ NOT NULL,
  used         BOOLEAN     NOT NULL DEFAULT false,
  attempts     INTEGER     NOT NULL DEFAULT 0,        -- wrong-guess counter (max 5)
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup: unexpired, unused codes by email+purpose
CREATE INDEX IF NOT EXISTS idx_auth_otps_email_purpose
  ON auth_otps(email, purpose)
  WHERE used = false;

-- Unique active code per email+purpose (upsert replaces)
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_otps_email_purpose_active
  ON auth_otps(email, purpose)
  WHERE used = false;
