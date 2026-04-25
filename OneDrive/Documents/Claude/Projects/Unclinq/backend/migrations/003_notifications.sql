-- ─────────────────────────────────────────────────────────────────────────────
-- UNCLINQ — Migration 003: In-App Notification System (E-03)
-- Idempotent: safe to run multiple times
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('reentry', 'report_ready', 'post_rescue', 'action_lab')),
  message      TEXT NOT NULL,
  action_path  TEXT,            -- e.g. '/emora', '/actions' — where tapping takes the user
  dismissed    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ     -- notifications expire so old ones don't pile up
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_active
  ON in_app_notifications (user_id, dismissed, created_at DESC);
