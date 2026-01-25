-- Create table for AND Journal entries
CREATE TABLE IF NOT EXISTS and_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feeling TEXT NOT NULL,
    fact TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_and_journal_user_id ON and_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_and_journal_created_at ON and_journal_entries(created_at DESC);

-- Enable RLS
ALTER TABLE and_journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own journal entries"
    ON and_journal_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
    ON and_journal_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
    ON and_journal_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Create table for emotion check-ins
CREATE TABLE IF NOT EXISTS emotion_check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emotion TEXT NOT NULL,
    quadrant TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_emotion_checkins_user_id ON emotion_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_checkins_created_at ON emotion_check_ins(created_at DESC);

-- Enable RLS
ALTER TABLE emotion_check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own emotion check-ins"
    ON emotion_check_ins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emotion check-ins"
    ON emotion_check_ins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emotion check-ins"
    ON emotion_check_ins FOR DELETE
    USING (auth.uid() = user_id);
