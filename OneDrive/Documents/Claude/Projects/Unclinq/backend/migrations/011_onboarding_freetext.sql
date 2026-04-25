-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 011: Persist onboarding free text + assessment metadata
--
-- Problem: primary_pattern (user's own words), style_notes (Claude's reasoning),
-- and assessment_confidence were sent to Claude for scoring but then thrown away.
-- Emora could never reference the user's own description of their pattern.
-- Also onboarding_intention was stored but never injected into Emora's context.
--
-- This migration adds the missing columns so nothing is lost.
-- Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- Store the user's own words about their pattern (their language, not clinical labels)
-- This is what Emora should reflect back: "you described your pattern as..."
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_pattern_text'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_pattern_text TEXT;
  END IF;
END $$;

-- Store Claude's confidence in the attachment classification (high | medium | low)
-- Low confidence triggers a gentle re-assessment offer inside Emora after session 3
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'assessment_confidence'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN assessment_confidence TEXT DEFAULT 'medium'
      CHECK (assessment_confidence IN ('high', 'medium', 'low'));
  END IF;
END $$;

-- Store Claude's 1-sentence reasoning for the classification
-- Useful for debugging misclassifications + future Emora context
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'style_notes'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN style_notes TEXT;
  END IF;
END $$;

-- Flag for whether the user has been re-assessed after a low-confidence initial score
-- Prevents repeatedly asking users to re-assess
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'reassessment_offered'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN reassessment_offered BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
