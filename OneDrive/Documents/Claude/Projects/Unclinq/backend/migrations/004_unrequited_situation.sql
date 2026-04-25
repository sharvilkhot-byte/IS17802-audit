-- ─────────────────────────────────────────────────────────────────────────────
-- UNCLINQ — Migration 004: Add 'unrequited' relationship situation
-- Idempotent: safe to run multiple times
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop the existing CHECK constraint and replace with one that includes 'unrequited'
-- PostgreSQL requires dropping by constraint name — check if it exists first

DO $$
BEGIN
  -- Drop old constraint if it exists (constraint name from initial schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_profiles'
      AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%relationship_situation%'
  ) THEN
    ALTER TABLE user_profiles
      DROP CONSTRAINT IF EXISTS user_profiles_relationship_situation_check;
  END IF;

  -- Add updated constraint with 'unrequited' included
  ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_relationship_situation_check
    CHECK (relationship_situation IN (
      'in_relationship',
      'dating',
      'post_breakup',
      'single_healing',
      'unrequited'
    ));
END $$;
