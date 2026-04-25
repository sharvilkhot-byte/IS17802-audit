-- ─────────────────────────────────────────────────
-- UNCLINQ — Initial Database Schema
-- Idempotent: safe to run multiple times
-- ─────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── User Profiles (The Brain) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Attachment style (set at onboarding, refined over time)
  primary_style TEXT CHECK (primary_style IN ('anxious','dismissive_avoidant','fearful_avoidant','secure_leaning')),
  secondary_style TEXT,

  -- Situation
  relationship_situation TEXT CHECK (relationship_situation IN ('in_relationship','dating','post_breakup','single_healing')),

  -- AI-detected state (updated after every session)
  awareness_level INTEGER DEFAULT 1 CHECK (awareness_level BETWEEN 1 AND 4),
  action_stage TEXT DEFAULT 'awareness' CHECK (action_stage IN ('awareness','interruption','replacement')),
  current_emotional_state TEXT DEFAULT 'stable' CHECK (current_emotional_state IN ('stable','activated','crisis')),

  -- Evolving pattern data
  detected_triggers JSONB DEFAULT '[]',
  active_patterns JSONB DEFAULT '[]',
  improved_patterns JSONB DEFAULT '[]',
  recent_deep_read_tab TEXT,

  -- Engagement counters (rolling 30-day)
  rescue_mode_count_30d INTEGER DEFAULT 0,
  rescue_mode_last_trigger TEXT,
  actions_completed_30d INTEGER DEFAULT 0,
  actions_skipped_30d INTEGER DEFAULT 0,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_entry_text TEXT,
  onboarding_intention TEXT,

  -- Activity
  last_active TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Conversation Summaries (Emora Memory) ────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ DEFAULT NOW(),

  emotional_state_start TEXT,
  emotional_state_end TEXT,
  triggers_mentioned TEXT[],
  patterns_active TEXT[],
  patterns_improving TEXT[],
  key_insight TEXT,
  session_summary TEXT,
  challenge_phase_reached BOOLEAN DEFAULT FALSE,
  reassurance_seeking_detected BOOLEAN DEFAULT FALSE,
  shutdown_detected BOOLEAN DEFAULT FALSE,
  raw_message_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_conv_summaries_user_date
  ON conversation_summaries (user_id, session_date DESC);

-- ─── Action History ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,
  action_category TEXT NOT NULL,
  difficulty_tier INTEGER NOT NULL CHECK (difficulty_tier IN (1,2,3)),
  served_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  marked_hard BOOLEAN DEFAULT FALSE,
  context_at_serving JSONB
);

CREATE INDEX IF NOT EXISTS idx_action_history_user_served
  ON action_history (user_id, served_at DESC);

-- ─── Rescue Sessions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescue_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  entry_path TEXT CHECK (entry_path IN ('self','emora_offer','proactive')),
  activation_type TEXT CHECK (activation_type IN ('urge','spiral','shutdown')),
  exercise_used TEXT,
  duration_seconds INTEGER,
  exit_path TEXT CHECK (exit_path IN ('emora_bridge','close'))
);

CREATE INDEX IF NOT EXISTS idx_rescue_sessions_user_date
  ON rescue_sessions (user_id, started_at DESC);

-- ─── Insight Tab Reads ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insight_tab_reads (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tab_id TEXT NOT NULL,
  dwell_seconds INTEGER DEFAULT 0,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, tab_id)
);

-- ─── Pattern Reports ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pattern_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_end TIMESTAMPTZ DEFAULT NOW(),
  content TEXT NOT NULL,
  closing_question TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pattern_reports_user_date
  ON pattern_reports (user_id, generated_at DESC);
