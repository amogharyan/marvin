-- Device sync tables for Phase 3 Task 3.6
-- Support for user session management and device synchronization

-- User devices registry
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_type TEXT NOT NULL, -- 'ar_spectacles', 'web_interface', 'mobile_backup'
    device_name TEXT NOT NULL,
    platform TEXT, -- 'windows', 'macos', 'ios', 'android', 'web'
    capabilities TEXT[] DEFAULT '{}', -- ['camera', 'ar', 'voice', 'offline_storage']
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    device_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- Device sessions for active connections
CREATE TABLE device_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    session_id TEXT NOT NULL UNIQUE,
    device_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'expired'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync conflicts for conflict resolution
CREATE TABLE sync_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL, -- 'user_preferences', 'conversation_state', etc.
    field_name TEXT NOT NULL,
    conflict_data JSONB NOT NULL, -- {local_value, server_value, conflict_reason}
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
    resolution_strategy TEXT, -- 'primary_wins', 'latest_wins', 'merge', 'user_choice'
    resolved_value JSONB,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offline sync queue for handling disconnections
CREATE TABLE offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- 'insert', 'update', 'delete'
    table_name TEXT NOT NULL,
    data_payload JSONB NOT NULL,
    sync_priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device capabilities for feature detection
CREATE TABLE device_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL,
    capability_name TEXT NOT NULL, -- 'ar_tracking', 'voice_synthesis', 'offline_storage'
    capability_value JSONB NOT NULL, -- Capability-specific configuration
    is_enabled BOOLEAN DEFAULT true,
    last_tested TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    test_results JSONB, -- Results of capability tests
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(device_id, capability_name)
);

-- Indexes for performance
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_device_type ON user_devices(device_type);
CREATE INDEX idx_user_devices_active ON user_devices(is_active);
CREATE INDEX idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX idx_device_sessions_status ON device_sessions(status);
CREATE INDEX idx_device_sessions_heartbeat ON device_sessions(last_heartbeat);
CREATE INDEX idx_sync_conflicts_user_id ON sync_conflicts(user_id);
CREATE INDEX idx_sync_conflicts_status ON sync_conflicts(status);
CREATE INDEX idx_offline_sync_queue_user_id ON offline_sync_queue(user_id);
CREATE INDEX idx_offline_sync_queue_status ON offline_sync_queue(status);
CREATE INDEX idx_offline_sync_queue_priority ON offline_sync_queue(sync_priority);
CREATE INDEX idx_device_capabilities_device_id ON device_capabilities(device_id);

-- Row Level Security
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access their own devices" ON user_devices
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own device sessions" ON device_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own sync conflicts" ON sync_conflicts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own offline sync queue" ON offline_sync_queue
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Device capabilities are managed by device owners" ON device_capabilities
    FOR ALL USING (
        device_id IN (
            SELECT device_id FROM user_devices WHERE user_id = auth.uid()
        )
    );

-- Enable realtime for device sync tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_devices;
ALTER PUBLICATION supabase_realtime ADD TABLE device_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE sync_conflicts;
ALTER PUBLICATION supabase_realtime ADD TABLE offline_sync_queue;

-- Triggers for updated_at columns
CREATE TRIGGER update_user_devices_updated_at
    BEFORE UPDATE ON user_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_capabilities_updated_at
    BEFORE UPDATE ON device_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to process offline sync queue
CREATE OR REPLACE FUNCTION process_offline_sync_queue(
    p_user_id UUID,
    p_batch_size INTEGER DEFAULT 10
)
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
    queue_item RECORD;
BEGIN
    -- Process pending queue items for the user
    FOR queue_item IN
        SELECT * FROM offline_sync_queue
        WHERE user_id = p_user_id
        AND status = 'pending'
        AND attempts < max_attempts
        ORDER BY sync_priority ASC, created_at ASC
        LIMIT p_batch_size
    LOOP
        BEGIN
            -- Mark as processing
            UPDATE offline_sync_queue
            SET status = 'processing', last_attempt_at = NOW(), attempts = attempts + 1
            WHERE id = queue_item.id;

            -- Execute the operation based on type
            CASE queue_item.operation_type
                WHEN 'insert' THEN
                    EXECUTE format('INSERT INTO %I SELECT * FROM jsonb_populate_record(null::%I, $1)',
                                   queue_item.table_name, queue_item.table_name)
                    USING queue_item.data_payload;

                WHEN 'update' THEN
                    -- Handle updates (simplified - would need more complex logic for real implementation)
                    EXECUTE format('UPDATE %I SET updated_at = NOW() WHERE id = $1', queue_item.table_name)
                    USING (queue_item.data_payload->>'id')::UUID;

                WHEN 'delete' THEN
                    EXECUTE format('DELETE FROM %I WHERE id = $1', queue_item.table_name)
                    USING (queue_item.data_payload->>'id')::UUID;
            END CASE;

            -- Mark as completed
            UPDATE offline_sync_queue
            SET status = 'completed'
            WHERE id = queue_item.id;

            processed_count := processed_count + 1;

        EXCEPTION WHEN OTHERS THEN
            -- Mark as failed and record error
            UPDATE offline_sync_queue
            SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'pending' END,
                error_details = SQLERRM
            WHERE id = queue_item.id;
        END;
    END LOOP;

    RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old device sessions
CREATE OR REPLACE FUNCTION cleanup_device_sessions()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    -- Mark sessions as expired if no heartbeat for 1 hour
    UPDATE device_sessions
    SET status = 'expired', ended_at = NOW()
    WHERE status = 'active'
    AND last_heartbeat < NOW() - INTERVAL '1 hour';

    GET DIAGNOSTICS cleanup_count = ROW_COUNT;

    -- Delete very old expired sessions (older than 7 days)
    DELETE FROM device_sessions
    WHERE status = 'expired'
    AND ended_at < NOW() - INTERVAL '7 days';

    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check device sync health
CREATE OR REPLACE FUNCTION get_device_sync_health(p_user_id UUID)
RETURNS TABLE (
    device_count INTEGER,
    active_sessions INTEGER,
    pending_conflicts INTEGER,
    offline_queue_size INTEGER,
    last_sync_age_minutes INTEGER,
    sync_health TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM user_devices WHERE user_id = p_user_id AND is_active = true),
        (SELECT COUNT(*)::INTEGER FROM device_sessions WHERE user_id = p_user_id AND status = 'active'),
        (SELECT COUNT(*)::INTEGER FROM sync_conflicts WHERE user_id = p_user_id AND status = 'pending'),
        (SELECT COUNT(*)::INTEGER FROM offline_sync_queue WHERE user_id = p_user_id AND status = 'pending'),
        COALESCE(
            EXTRACT(EPOCH FROM (NOW() - (SELECT last_sync_time FROM device_sync_state WHERE user_id = p_user_id)))::INTEGER / 60,
            NULL
        ),
        CASE
            WHEN EXISTS(SELECT 1 FROM sync_conflicts WHERE user_id = p_user_id AND status = 'pending') THEN 'conflicts'
            WHEN EXISTS(SELECT 1 FROM device_sync_state WHERE user_id = p_user_id AND sync_status != 'synced') THEN 'error'
            WHEN COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT last_sync_time FROM device_sync_state WHERE user_id = p_user_id)))::INTEGER / 60, 9999) > 1440 THEN 'stale'
            WHEN COALESCE(EXTRACT(EPOCH FROM (NOW() - (SELECT last_sync_time FROM device_sync_state WHERE user_id = p_user_id)))::INTEGER / 60, 9999) > 60 THEN 'outdated'
            ELSE 'healthy'
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;