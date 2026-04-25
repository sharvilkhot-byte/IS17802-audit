-- Migration 013: Add attachment_familiarity column to user_profiles
-- Tracks whether user had prior knowledge of attachment theory at onboarding.
-- 'aware'   = knew about anxious/avoidant styles, did pattern work before
-- 'unaware' = no prior exposure, reached app via relationship distress
-- Used to set current_phase = 'discovery' and adjust Emora coaching approach.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS attachment_familiarity TEXT;
