-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 010: Add pattern_duration + struggle_level to user_profiles
-- Also add unrequited to relationship_situation CHECK (was missing)
-- Idempotent — safe to re-run
-- ─────────────────────────────────────────────────────────────────────────────

-- Add pattern_duration: how long user has had this attachment pattern
-- Values: recent | 1-2_years | 3-5_years | most_of_life | always
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'pattern_duration'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN pattern_duration TEXT;
  END IF;
END $$;

-- Add struggle_level: 1=curious, 2=somewhat, 3=a lot (from onboarding step 1)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'struggle_level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN struggle_level INTEGER DEFAULT 2
      CHECK (struggle_level BETWEEN 1 AND 3);
  END IF;
END $$;

-- Fix: 'unrequited' was added in migration 004 but the CHECK constraint on
-- relationship_situation in migration 001 may not include it on fresh installs.
-- Safely drop and recreate the CHECK constraint to include all valid values.
DO $$
BEGIN
  -- Drop old constraint if it exists (name may vary)
  ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_relationship_situation_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_relationship_situation_check
  CHECK (relationship_situation IN (
    'in_relationship','dating','post_breakup','single_healing','unrequited'
  ));

-- Add current_phase column if missing (some installs may have skipped 007)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'current_phase'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN current_phase TEXT DEFAULT 'awareness';
    ALTER TABLE user_profiles ADD COLUMN phase_entered_at TIMESTAMPTZ DEFAULT NOW();
    ALTER TABLE user_profiles ADD COLUMN phase_sessions INTEGER DEFAULT 0;
  END IF;
END $$;
