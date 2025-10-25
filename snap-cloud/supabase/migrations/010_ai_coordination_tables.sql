-- AI coordination tables for Phase 3 Task 3.2
-- Support for Gemini, ElevenLabs, and Chroma integration through Supabase

-- AI processing requests tracking
CREATE TABLE ai_processing_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL, -- 'vision_processing', 'voice_synthesis', 'learning_update'
    input_data JSONB NOT NULL,
    output_data JSONB,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_details TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice synthesis cache
CREATE TABLE voice_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_hash TEXT NOT NULL,
    voice_settings_hash TEXT NOT NULL,
    original_text TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    audio_duration DECIMAL NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(text_hash, voice_settings_hash)
);

-- Conversation context storage
CREATE TABLE conversation_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    input_type TEXT NOT NULL, -- 'vision', 'voice', 'text'
    input_data JSONB NOT NULL,
    ai_response JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning patterns for Chroma integration
CREATE TABLE learning_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL,
    success_metrics JSONB NOT NULL,
    user_feedback TEXT, -- 'positive', 'negative', 'neutral'
    context_embeddings DECIMAL[] NOT NULL, -- Vector embeddings for Chroma
    pattern_strength DECIMAL NOT NULL DEFAULT 0.5 CHECK (pattern_strength >= 0 AND pattern_strength <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI coordination sessions
CREATE TABLE ai_coordination_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL,
    processing_steps TEXT[] NOT NULL, -- ['vision', 'voice', 'learning']
    total_processing_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_processing_requests_user_id ON ai_processing_requests(user_id);
CREATE INDEX idx_ai_processing_requests_status ON ai_processing_requests(status);
CREATE INDEX idx_ai_processing_requests_type ON ai_processing_requests(request_type);
CREATE INDEX idx_voice_cache_hash ON voice_cache(text_hash, voice_settings_hash);
CREATE INDEX idx_conversation_context_user_id ON conversation_context(user_id);
CREATE INDEX idx_conversation_context_timestamp ON conversation_context(timestamp);
CREATE INDEX idx_learning_patterns_user_id ON learning_patterns(user_id);
CREATE INDEX idx_learning_patterns_strength ON learning_patterns(pattern_strength);
CREATE INDEX idx_ai_coordination_sessions_user_id ON ai_coordination_sessions(user_id);

-- Row Level Security
ALTER TABLE ai_processing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coordination_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access their own AI processing requests" ON ai_processing_requests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own voice cache" ON voice_cache
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can access their own conversation context" ON conversation_context
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own learning patterns" ON learning_patterns
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own coordination sessions" ON ai_coordination_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_ai_processing_requests_updated_at
    BEFORE UPDATE ON ai_processing_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_patterns_updated_at
    BEFORE UPDATE ON learning_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();