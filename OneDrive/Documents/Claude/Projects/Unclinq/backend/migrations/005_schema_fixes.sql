-- ─────────────────────────────────────────────────────────────────────────────
-- UNCLINQ — Migration 005: Schema fixes, password reset tokens, analytics events
-- Idempotent: safe to run multiple times
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Fix #8: preferred_session_window was defined as INTEGER but stores TEXT ─
-- Change to TEXT so values like 'morning', 'evening', etc. can be stored
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
      AND column_name = 'preferred_session_window'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE user_profiles
      ALTER COLUMN preferred_session_window TYPE TEXT USING
        CASE preferred_session_window
          WHEN 0 THEN NULL
          ELSE preferred_session_window::TEXT
        END;
  END IF;
END $$;

-- ─── Password reset tokens table (for forgot-password flow) ──────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User events table (analytics — funnel tracking) ─────────────────────────
-- Records key lifecycle events to power retention analysis without a third-party tool
CREATE TABLE IF NOT EXISTS user_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  event      TEXT NOT NULL,   -- e.g. 'onboarding_completed', 'first_emora_session'
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_events_user_event
  ON user_events (user_id, event, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_events_event_date
  ON user_events (event, created_at DESC);

-- ─── Add name column update capability (for settings page) ───────────────────
-- Nothing to migrate — name is already nullable TEXT in users table.

-- ─── Ensure reentry_churned column exists (was in migration 002) ─────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS reentry_churned BOOLEAN DEFAULT FALSE;
