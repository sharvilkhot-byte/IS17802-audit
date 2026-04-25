-- Migration 020: Add color_preference to user_profiles
-- This field was collected during onboarding but never persisted — lost on new device/login.
-- Valid values match the frontend STYLE_LABELS keys.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS color_preference TEXT
  CHECK (color_preference IN ('anxious', 'dismissive_avoidant', 'fearful_avoidant', 'secure_leaning'));
