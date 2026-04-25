-- Migration 007: Phase Infrastructure
-- Adds phase tracking columns, weekly pulse tracking, and milestone events table.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS current_phase VARCHAR(20) DEFAULT 'awareness',
  ADD COLUMN IF NOT EXISTS phase_entered_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS phase_sessions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_weekly_pulse_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS phase_progress_report_sent BOOLEAN DEFAULT FALSE;

-- Backfill current_phase from action_stage for existing users
UPDATE user_profiles
  SET current_phase = action_stage
  WHERE action_stage IS NOT NULL;

-- Milestone events: one row per milestone per user (each fires once)
CREATE TABLE IF NOT EXISTS milestone_events (
  id                SERIAL PRIMARY KEY,
  user_id           UUID NOT NULL,
  milestone_type    VARCHAR(50) NOT NULL,
  phase             VARCHAR(20),
  triggered_at      TIMESTAMPTZ DEFAULT NOW(),
  surface_data      JSONB DEFAULT '{}',
  seen_at           TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_milestone_events_unique
  ON milestone_events (user_id, milestone_type);

CREATE INDEX IF NOT EXISTS idx_milestone_events_unseen
  ON milestone_events (user_id)
  WHERE seen_at IS NULL;
