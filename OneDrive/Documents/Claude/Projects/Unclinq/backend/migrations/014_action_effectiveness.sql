-- Add effectiveness signal to action_history
-- Stored as: 'helped' | 'somewhat' | 'not_really' | NULL (no response)
ALTER TABLE action_history
  ADD COLUMN IF NOT EXISTS effectiveness TEXT
    CHECK (effectiveness IN ('helped', 'somewhat', 'not_really'));
