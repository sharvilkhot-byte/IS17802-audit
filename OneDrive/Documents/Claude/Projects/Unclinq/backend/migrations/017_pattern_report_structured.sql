-- Migration 017: Add structured fields to pattern_reports
-- These fields power the Wrapped-style card reveal in the frontend:
-- emotional arc, patterns, triggers, key insight, session count, period start.

ALTER TABLE pattern_reports
  ADD COLUMN IF NOT EXISTS period_start    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS session_count   INT,
  ADD COLUMN IF NOT EXISTS key_insight     TEXT,
  ADD COLUMN IF NOT EXISTS emotional_arc   JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS patterns        JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS triggers        JSONB NOT NULL DEFAULT '[]'::jsonb;
