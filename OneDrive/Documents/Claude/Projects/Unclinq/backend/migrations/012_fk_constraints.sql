-- Migration 012: Add FK constraints on milestone_events and regression_events
-- These tables were created without FK references to users — adding them now
-- with ON DELETE CASCADE so orphaned rows are cleaned up if a user is deleted.
-- Idempotent: constraint names checked before adding.

DO $$
BEGIN
  -- milestone_events → users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'milestone_events_user_id_fkey'
      AND table_name = 'milestone_events'
  ) THEN
    ALTER TABLE milestone_events
      ADD CONSTRAINT milestone_events_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  -- regression_events → users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'regression_events_user_id_fkey'
      AND table_name = 'regression_events'
  ) THEN
    ALTER TABLE regression_events
      ADD CONSTRAINT regression_events_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END
$$;
