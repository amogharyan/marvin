-- Task 3.3: Configure Supabase Realtime subscriptions
-- Configure Realtime for object interactions, health reminders, and calendar updates
-- Set up real-time conversation state synchronization
-- Implement presence tracking for demo environment
-- Create real-time data sync across AR and web interfaces

-- Enable realtime for all AI coordination tables
ALTER PUBLICATION supabase_realtime ADD TABLE ai_processing_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE voice_cache;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_context;
ALTER PUBLICATION supabase_realtime ADD TABLE learning_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_coordination_sessions;

-- Enable realtime for existing tables that need real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE object_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE medication_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE health_reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE object_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE user_interactions;

-- Real-time presence tracking table
CREATE TABLE presence_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    device_type TEXT NOT NULL, -- 'ar_spectacles', 'web_interface', 'mobile_backup'
    status TEXT NOT NULL DEFAULT 'online', -- 'online', 'away', 'offline'
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_context JSONB, -- Current room/location context
    active_objects TEXT[], -- Currently detected/interacting objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time conversation state
CREATE TABLE conversation_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_context TEXT, -- 'medicine', 'breakfast', 'calendar', 'departure', etc.
    conversation_phase TEXT NOT NULL, -- 'greeting', 'assistance', 'confirmation', 'completion'
    pending_actions JSONB DEFAULT '[]', -- Actions waiting for user response
    last_ai_response TEXT,
    last_user_input TEXT,
    conversation_metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- One active conversation state per user
);

-- Demo environment state tracking
CREATE TABLE demo_environment_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demo_session_id TEXT NOT NULL UNIQUE,
    active_objects JSONB NOT NULL DEFAULT '{}', -- Object states and positions
    current_demo_step TEXT, -- 'medicine', 'breakfast', 'calendar', 'keys', 'departure'
    demo_progress DECIMAL DEFAULT 0.0 CHECK (demo_progress >= 0 AND demo_progress <= 1),
    environment_config JSONB DEFAULT '{}', -- Lighting, positioning, etc.
    participant_count INTEGER DEFAULT 0,
    demo_started_at TIMESTAMP WITH TIME ZONE,
    demo_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-device sync state
CREATE TABLE device_sync_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    primary_device TEXT NOT NULL, -- 'ar_spectacles', 'web_interface', 'mobile_backup'
    connected_devices JSONB DEFAULT '[]', -- List of connected device sessions
    sync_status TEXT DEFAULT 'synced', -- 'synced', 'syncing', 'conflict', 'offline'
    last_sync_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pending_sync_data JSONB DEFAULT '{}',
    conflict_resolution_strategy TEXT DEFAULT 'primary_wins', -- 'primary_wins', 'latest_wins', 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes for realtime performance
CREATE INDEX idx_presence_tracking_user_id ON presence_tracking(user_id);
CREATE INDEX idx_presence_tracking_status ON presence_tracking(status);
CREATE INDEX idx_presence_tracking_heartbeat ON presence_tracking(last_heartbeat);
CREATE INDEX idx_conversation_state_user_id ON conversation_state(user_id);
CREATE INDEX idx_conversation_state_context ON conversation_state(current_context);
CREATE INDEX idx_conversation_state_expires ON conversation_state(expires_at);
CREATE INDEX idx_demo_environment_session ON demo_environment_state(demo_session_id);
CREATE INDEX idx_demo_environment_step ON demo_environment_state(current_demo_step);
CREATE INDEX idx_device_sync_user_id ON device_sync_state(user_id);
CREATE INDEX idx_device_sync_status ON device_sync_state(sync_status);

-- Row Level Security for realtime tables
ALTER TABLE presence_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_environment_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sync_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access their own presence" ON presence_tracking
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own conversation state" ON conversation_state
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Demo environment state is publicly readable during demo" ON demo_environment_state
    FOR SELECT USING (true);

CREATE POLICY "Demo environment state can be updated by authenticated users" ON demo_environment_state
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can access their own device sync state" ON device_sync_state
    FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE presence_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_state;
ALTER PUBLICATION supabase_realtime ADD TABLE demo_environment_state;
ALTER PUBLICATION supabase_realtime ADD TABLE device_sync_state;

-- Triggers for updated_at columns
CREATE TRIGGER update_presence_tracking_updated_at
    BEFORE UPDATE ON presence_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_state_updated_at
    BEFORE UPDATE ON conversation_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_environment_state_updated_at
    BEFORE UPDATE ON demo_environment_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_sync_state_updated_at
    BEFORE UPDATE ON device_sync_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired conversation states
CREATE OR REPLACE FUNCTION cleanup_expired_conversations()
RETURNS void AS $$
BEGIN
    DELETE FROM conversation_state
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update presence heartbeat
CREATE OR REPLACE FUNCTION update_presence_heartbeat(
    p_user_id UUID,
    p_session_id TEXT,
    p_device_type TEXT,
    p_location_context JSONB DEFAULT NULL,
    p_active_objects TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
    presence_id UUID;
BEGIN
    INSERT INTO presence_tracking (
        user_id,
        session_id,
        device_type,
        status,
        last_heartbeat,
        location_context,
        active_objects
    ) VALUES (
        p_user_id,
        p_session_id,
        p_device_type,
        'online',
        NOW(),
        p_location_context,
        p_active_objects
    )
    ON CONFLICT (user_id, session_id)
    DO UPDATE SET
        status = 'online',
        last_heartbeat = NOW(),
        location_context = p_location_context,
        active_objects = p_active_objects,
        updated_at = NOW()
    RETURNING id INTO presence_id;

    RETURN presence_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation state
CREATE OR REPLACE FUNCTION update_conversation_state(
    p_user_id UUID,
    p_current_context TEXT,
    p_conversation_phase TEXT,
    p_pending_actions JSONB DEFAULT '[]',
    p_last_ai_response TEXT DEFAULT NULL,
    p_last_user_input TEXT DEFAULT NULL,
    p_conversation_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    state_id UUID;
BEGIN
    INSERT INTO conversation_state (
        user_id,
        current_context,
        conversation_phase,
        pending_actions,
        last_ai_response,
        last_user_input,
        conversation_metadata,
        expires_at
    ) VALUES (
        p_user_id,
        p_current_context,
        p_conversation_phase,
        p_pending_actions,
        p_last_ai_response,
        p_last_user_input,
        p_conversation_metadata,
        NOW() + INTERVAL '1 hour'
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        current_context = p_current_context,
        conversation_phase = p_conversation_phase,
        pending_actions = p_pending_actions,
        last_ai_response = COALESCE(p_last_ai_response, conversation_state.last_ai_response),
        last_user_input = COALESCE(p_last_user_input, conversation_state.last_user_input),
        conversation_metadata = p_conversation_metadata,
        expires_at = NOW() + INTERVAL '1 hour',
        updated_at = NOW()
    RETURNING id INTO state_id;

    RETURN state_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update demo environment state
CREATE OR REPLACE FUNCTION update_demo_environment(
    p_demo_session_id TEXT,
    p_active_objects JSONB DEFAULT NULL,
    p_current_demo_step TEXT DEFAULT NULL,
    p_demo_progress DECIMAL DEFAULT NULL,
    p_environment_config JSONB DEFAULT NULL,
    p_participant_count INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    env_id UUID;
BEGIN
    INSERT INTO demo_environment_state (
        demo_session_id,
        active_objects,
        current_demo_step,
        demo_progress,
        environment_config,
        participant_count
    ) VALUES (
        p_demo_session_id,
        COALESCE(p_active_objects, '{}'),
        p_current_demo_step,
        COALESCE(p_demo_progress, 0.0),
        COALESCE(p_environment_config, '{}'),
        COALESCE(p_participant_count, 0)
    )
    ON CONFLICT (demo_session_id)
    DO UPDATE SET
        active_objects = COALESCE(p_active_objects, demo_environment_state.active_objects),
        current_demo_step = COALESCE(p_current_demo_step, demo_environment_state.current_demo_step),
        demo_progress = COALESCE(p_demo_progress, demo_environment_state.demo_progress),
        environment_config = COALESCE(p_environment_config, demo_environment_state.environment_config),
        participant_count = COALESCE(p_participant_count, demo_environment_state.participant_count),
        updated_at = NOW()
    RETURNING id INTO env_id;

    RETURN env_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;