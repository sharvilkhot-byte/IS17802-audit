-- Migration 008: Consolidation & Maintenance Phases
-- Adds two new phases beyond Replacement: Consolidation (stress-test) and Maintenance (earned security).
-- Also adds regression_events table and supporting columns for relapse tracking.
-- Raises the bar for secure_leaning_unlock — it now requires proven stress-state performance,
-- not just 14 days in replacement.

-- ─────────────────────────────────────────────────────────────────────────────
-- New columns on user_profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE user_profiles
  -- Tracks sessions where user was in activated state but held the pattern interrupt
  -- (i.e., emotional_state_start = activated, challenge_phase_reached = true, patterns_improving != empty)
  ADD COLUMN IF NOT EXISTS stress_state_clean_sessions INTEGER DEFAULT 0,

  -- Timestamp of last detected pattern regression (null = no regression)
  ADD COLUMN IF NOT EXISTS last_regression_at TIMESTAMPTZ DEFAULT NULL,

  -- Timestamp when consolidation phase was entered (separate from phase_entered_at for history)
  ADD COLUMN IF NOT EXISTS consolidation_entered_at TIMESTAMPTZ DEFAULT NULL,

  -- Maintenance mode: user has achieved earned security, app shifts to monthly check-in mode
  ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE,

  -- Whether the secure_leaning_unlock has already been awarded (prevents re-trigger)
  ADD COLUMN IF NOT EXISTS secure_leaning_unlocked BOOLEAN DEFAULT FALSE;

-- Update current_phase constraint comment — now supports 5 values:
-- awareness | interruption | replacement | consolidation | maintenance
-- (VARCHAR column, no enum to alter)

-- ─────────────────────────────────────────────────────────────────────────────
-- regression_events table
-- Tracks pattern regressions — when a previously improved pattern resurfaces.
-- Multiple regressions per user are possible (unlike milestone_events which are once-only).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS regression_events (
  id                  SERIAL PRIMARY KEY,
  user_id             UUID NOT NULL,
  pattern             VARCHAR(100) NOT NULL,        -- the pattern that regressed
  phase_at_regression VARCHAR(30),                  -- which phase the user was in
  detected_at         TIMESTAMPTZ DEFAULT NOW(),
  recovered_at        TIMESTAMPTZ,                  -- set when same pattern re-enters improved_patterns
  user_notified       BOOLEAN DEFAULT FALSE,        -- whether a notification was shown
  seen_at             TIMESTAMPTZ                   -- when user dismissed the notification
);

CREATE INDEX IF NOT EXISTS idx_regression_events_user
  ON regression_events (user_id, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_regression_events_unseen
  ON regression_events (user_id)
  WHERE seen_at IS NULL AND user_notified = TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
-- Backfill: mark existing replacement-phase users as having no regressions
-- (safe assumption — regression tracking starts from this migration forward)
-- ─────────────────────────────────────────────────────────────────────────────

-- Users currently in replacement who already have improved_patterns should
-- have secure_leaning_unlocked = false until they earn it under the new rules.
-- No data change needed — the column defaults to FALSE.

-- Note on migration safety:
-- current_phase remains as-is for all existing users (awareness/interruption/replacement).
-- The new phases (consolidation/maintenance) are only entered via write-back logic.
-- No existing user is automatically promoted; they progress through normal write-back checks.
