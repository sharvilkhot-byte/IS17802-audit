-- Create table for Rescue Sessions (Somatic SOS)
CREATE TABLE IF NOT EXISTS rescue_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    initial_distress INTEGER CHECK (initial_distress >= 1 AND initial_distress <= 10),
    final_distress INTEGER CHECK (final_distress >= 1 AND final_distress <= 10),
    tools_used TEXT[], -- Array of tools used during session
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for Chat Sessions (Conversations)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    mode TEXT NOT NULL, -- 'Secure', 'Inner Child', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rescue_user_id ON rescue_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Row Level Security (RLS)
ALTER TABLE rescue_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Rescue Sessions
CREATE POLICY "Users can view their own rescue sessions"
    ON rescue_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rescue sessions"
    ON rescue_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rescue sessions"
    ON rescue_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Policies for Chat Sessions
CREATE POLICY "Users can view their own chat sessions"
    ON chat_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
    ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Chat Messages v2 (Updated to join session)
CREATE POLICY "Users can view their own chat messages"
    ON chat_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own chat messages"
    ON chat_messages FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );
