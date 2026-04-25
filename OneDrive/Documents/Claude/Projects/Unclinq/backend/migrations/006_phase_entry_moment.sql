-- Migration 006: Phase Entry Moment
-- Adds a flag to user_profiles that queues a full-screen phase entry moment.
-- Set by write-back when a stage upgrade fires. Cleared by the dismiss endpoint.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS pending_phase_entry VARCHAR(20) DEFAULT NULL;

-- Index for fast lookup on home load
CREATE INDEX IF NOT EXISTS idx_user_profiles_pending_phase_entry
  ON user_profiles (user_id)
  WHERE pending_phase_entry IS NOT NULL;
