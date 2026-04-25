-- Migration 019: Add 'stage_upgrade' notification type
-- Stage upgrade notifications were incorrectly using 'report_ready' — semantically wrong.
-- This migration drops the old CHECK and adds the new type.

DO $$
BEGIN
  ALTER TABLE in_app_notifications
    DROP CONSTRAINT IF EXISTS in_app_notifications_type_check;

  ALTER TABLE in_app_notifications
    ADD CONSTRAINT in_app_notifications_type_check
    CHECK (type IN ('reentry', 'report_ready', 'post_rescue', 'action_lab', 'stage_upgrade'));
END $$;
