-- Cleanup Migration
-- Purpose: Remove unused or duplicate tables to ensure schema cleanliness

-- 1. Drop 'chat_history' if it exists (Replaced by 'chat_messages')
DROP TABLE IF EXISTS chat_history;

-- 2. Verify and ensure indexes exist (safety check)
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
