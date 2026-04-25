-- Migration 018: Session meta (check-in mood, reflection, timing) + user context notes
-- Adds post-session check-in fields to conversation_summaries so mood_end,
-- reflection notes, and session timing are persisted alongside AI-extracted signals.
-- Adds user_context JSONB to user_profiles for the Settings "Your context" feature
-- (people with roles + free-text situation notes supplied by the user).

ALTER TABLE conversation_summaries
  ADD COLUMN IF NOT EXISTS mood_end          TEXT,
  ADD COLUMN IF NOT EXISTS reflection_note   TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds  INTEGER,
  ADD COLUMN IF NOT EXISTS message_count     INTEGER;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS user_context JSONB DEFAULT '{}';

-- Index for filtering by mood_end in future analytics queries
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_mood_end
  ON conversation_summaries (user_id, mood_end)
  WHERE mood_end IS NOT NULL;
