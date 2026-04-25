-- Per-session user exclusion toggle
-- Excluded sessions are hidden from pattern analysis and write-back processing
ALTER TABLE conversation_summaries
  ADD COLUMN IF NOT EXISTS excluded BOOLEAN NOT NULL DEFAULT FALSE;
