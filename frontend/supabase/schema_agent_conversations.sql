-- ============================================
-- CODEGENESIS AGENT CONVERSATIONS SCHEMA
-- Version: v0.46
-- Purpose: Persistent chat history with 15-day auto-cleanup
-- ============================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENT CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Conversation metadata
    title TEXT NOT NULL, -- Auto-generated from first message
    message_count INTEGER DEFAULT 0,
    artifact_count INTEGER DEFAULT 0,
    
    -- Last activity tracking
    last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Auto-cleanup (15 days from last message)
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days') NOT NULL,
    is_archived BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- AGENT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agent_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Message content
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    
    -- Message type and artifact data
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'doc', 'ppt', 'spreadsheet', 'code', 'plan', 'diagram', 'chart')),
    
    -- Artifact data stored as JSONB for flexibility
    -- For 'doc': { "title": "...", "content": "..." }
    -- For 'ppt': { "title": "...", "slides": [...] }
    -- For 'spreadsheet': { "title": "...", "columns": [...], "data": [...] }
    -- For 'code': { "title": "...", "language": "...", "content": "..." }
    -- For 'diagram': { "title": "...", "diagramType": "...", "mermaidCode": "..." }
    artifact_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES (Performance Optimization)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON public.agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_expires_at ON public.agent_conversations(expires_at);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_last_message_at ON public.agent_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation_id ON public.agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON public.agent_messages(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- Conversations Policies
CREATE POLICY "Users can view their own conversations" ON public.agent_conversations
    FOR SELECT USING (true); -- Backend will filter by user_id

CREATE POLICY "Users can create conversations" ON public.agent_conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own conversations" ON public.agent_conversations
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own conversations" ON public.agent_conversations
    FOR DELETE USING (true);

-- Messages Policies
CREATE POLICY "Users can view messages in their conversations" ON public.agent_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can create messages" ON public.agent_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own messages" ON public.agent_messages
    FOR DELETE USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update conversation metadata when message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.agent_conversations
    SET 
        message_count = message_count + 1,
        last_message_at = NOW(),
        expires_at = NOW() + INTERVAL '15 days', -- Reset expiry on new message
        updated_at = NOW(),
        -- Increment artifact count if message has artifact
        artifact_count = artifact_count + CASE 
            WHEN NEW.message_type != 'text' AND NEW.artifact_data IS NOT NULL THEN 1 
            ELSE 0 
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired conversations
CREATE OR REPLACE FUNCTION cleanup_expired_conversations()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
    count INTEGER;
BEGIN
    -- Delete non-archived conversations that have expired
    DELETE FROM public.agent_conversations 
    WHERE expires_at < NOW() 
        AND is_archived = false;
    
    GET DIAGNOSTICS count = ROW_COUNT;
    RETURN QUERY SELECT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate conversation title from first message
CREATE OR REPLACE FUNCTION generate_conversation_title(first_message TEXT)
RETURNS TEXT AS $$
DECLARE
    title TEXT;
BEGIN
    -- Take first 50 characters of the message
    title := SUBSTRING(first_message FROM 1 FOR 50);
    
    -- If longer than 50 chars, add ellipsis
    IF LENGTH(first_message) > 50 THEN
        title := title || '...';
    END IF;
    
    RETURN title;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate title on first message
CREATE OR REPLACE FUNCTION set_conversation_title_on_first_message()
RETURNS TRIGGER AS $$
DECLARE
    current_message_count INTEGER;
    conv_title TEXT;
BEGIN
    -- Get current message count for this conversation
    SELECT message_count INTO current_message_count
    FROM public.agent_conversations
    WHERE id = NEW.conversation_id;
    
    -- If this is the first user message, update conversation title
    IF current_message_count = 0 AND NEW.role = 'user' THEN
        conv_title := generate_conversation_title(NEW.content);
        
        UPDATE public.agent_conversations
        SET title = conv_title
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update conversation metadata on new message
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON public.agent_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Trigger to auto-set conversation title on first message
CREATE TRIGGER trigger_set_conversation_title
    BEFORE INSERT ON public.agent_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_conversation_title_on_first_message();

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_agent_conversations_updated_at
    BEFORE UPDATE ON public.agent_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES
-- ============================================
-- 1. Conversations auto-expire 15 days after last message
-- 2. Expiry timer resets every time a new message is added
-- 3. Archived conversations won't be auto-deleted
-- 4. Conversation title is auto-generated from first user message
-- 5. Artifact data is stored as JSONB for flexibility
-- 6. Use cleanup_expired_conversations() function via cron job
