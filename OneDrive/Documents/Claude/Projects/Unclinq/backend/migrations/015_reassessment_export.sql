-- User-initiated style reassessment timestamp
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS reassessment_requested_at TIMESTAMPTZ;
