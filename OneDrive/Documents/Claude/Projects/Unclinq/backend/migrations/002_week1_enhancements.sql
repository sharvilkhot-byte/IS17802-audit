-- ─────────────────────────────────────────────────────────────────────────────
-- UNCLINQ — Migration 002: Week 1 Experience System + Cross-Feature Signals
-- Idempotent: safe to run multiple times
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── user_profiles: Week 1 tracking ──────────────────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_session_at       TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS session_count          INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS micro_report_sent      BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_app_open          TIMESTAMPTZ;

-- ─── user_profiles: Crisis system (E-09) ─────────────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_crisis_flag_at     TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS post_crisis_screen_shown BOOLEAN DEFAULT FALSE;

-- ─── user_profiles: Pattern report counter (E-08) ────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pattern_report_count   INTEGER DEFAULT 0;

-- ─── user_profiles: Notification tracking (E-03) ─────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_reentry_nudge_at  TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS reentry_nudge_count    INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS reentry_churned        BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_action_lab_visit  TIMESTAMPTZ;

-- ─── user_profiles: Session rhythm (E-06) ────────────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_session_window INTEGER;

-- ─── Micro Reports table (E-01 — Day 7 report) ───────────────────────────────
CREATE TABLE IF NOT EXISTS micro_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  top_trigger  TEXT,
  first_action TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_micro_reports_user
  ON micro_reports (user_id, generated_at DESC);

-- ─── Session events for rhythm detection (E-06) ───────────────────────────────
CREATE TABLE IF NOT EXISTS best_session_hours (
  id           SERIAL PRIMARY KEY,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  session_hour INTEGER,
  recorded_at  TIMESTAMPTZ DEFAULT NOW()
);
