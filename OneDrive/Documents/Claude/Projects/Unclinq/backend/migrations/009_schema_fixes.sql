-- ─────────────────────────────────────────────────────────────────────────────
-- UNCLINQ — Migration 009: Schema fixes
-- Idempotent: safe to run multiple times
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Fix #4: TEXT[] → JSONB for conversation_summaries ───────────────────────
-- The write-back service stores arrays via JSONB operators ($2::jsonb etc.)
-- but the original schema defined these as TEXT[]. This migration aligns them.
-- We only alter each column if it's still TEXT[]; if already JSONB, skip.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_summaries'
      AND column_name = 'triggers_mentioned'
      AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE conversation_summaries
      ALTER COLUMN triggers_mentioned TYPE JSONB
        USING CASE
          WHEN triggers_mentioned IS NULL THEN '[]'::jsonb
          ELSE to_jsonb(triggers_mentioned)
        END;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_summaries'
      AND column_name = 'patterns_active'
      AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE conversation_summaries
      ALTER COLUMN patterns_active TYPE JSONB
        USING CASE
          WHEN patterns_active IS NULL THEN '[]'::jsonb
          ELSE to_jsonb(patterns_active)
        END;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_summaries'
      AND column_name = 'patterns_improving'
      AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE conversation_summaries
      ALTER COLUMN patterns_improving TYPE JSONB
        USING CASE
          WHEN patterns_improving IS NULL THEN '[]'::jsonb
          ELSE to_jsonb(patterns_improving)
        END;
  END IF;
END $$;

-- Set safe defaults for any NULLs that may exist post-migration
UPDATE conversation_summaries SET triggers_mentioned = '[]'::jsonb WHERE triggers_mentioned IS NULL;
UPDATE conversation_summaries SET patterns_active = '[]'::jsonb WHERE patterns_active IS NULL;
UPDATE conversation_summaries SET patterns_improving = '[]'::jsonb WHERE patterns_improving IS NULL;

-- ─── Fix action_stage CHECK constraint (add consolidation + maintenance) ──────
-- The original CHECK only allows: awareness, interruption, replacement
-- We need to allow consolidation and maintenance phases too.
-- Drop old constraint and add updated one.
DO $$
BEGIN
  ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_action_stage_check;
  ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_action_stage_check
      CHECK (action_stage IN (
        'awareness', 'interruption', 'replacement', 'consolidation', 'maintenance'
      ));
EXCEPTION WHEN others THEN
  NULL; -- If anything fails (e.g. constraint name differs), continue
END $$;

-- ─── Hash existing plaintext password reset tokens ───────────────────────────
-- Existing tokens in password_reset_tokens.token are UUID v4 plaintext.
-- We can't retroactively hash them without breaking active flows,
-- so we invalidate all current tokens by marking them as used.
-- Going forward, new tokens will be hashed at the application layer.
UPDATE password_reset_tokens SET used = true WHERE used = false;

-- ─── Add token_hash column for future bcrypt-hashed tokens ───────────────────
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash TEXT;
