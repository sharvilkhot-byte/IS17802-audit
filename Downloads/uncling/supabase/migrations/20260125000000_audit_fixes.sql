-- Fix Missing Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_evidence_logs_user_id ON evidence_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_logs_created_at ON evidence_logs(created_at DESC);

-- Fix Missing RLS Policies (Enable Edit/Delete)
-- AND Journal
CREATE POLICY "Users can update their own journal entries" 
    ON and_journal_entries FOR UPDATE 
    USING (auth.uid() = user_id);

-- Emotion Check-ins
CREATE POLICY "Users can update their own emotion check-ins" 
    ON emotion_check_ins FOR UPDATE 
    USING (auth.uid() = user_id);

-- Evidence Logs (Was missing Update/Delete entirely)
CREATE POLICY "Users can update their own evidence logs" 
    ON evidence_logs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence logs" 
    ON evidence_logs FOR DELETE 
    USING (auth.uid() = user_id);
