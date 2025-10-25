-- Marvin AR Assistant - Phase 1 Database Schema
-- Tasks 1.3 & 1.6: Supabase foundation and object interaction schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- User profiles for AR assistant personalization
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    preferences JSONB DEFAULT '{}',
    morning_routine JSONB DEFAULT '{}',
    health_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core object interactions for AR detection events
CREATE TABLE object_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    object_type TEXT NOT NULL, -- 'medicine', 'bowl', 'laptop', 'keys', 'phone'
    interaction_type TEXT NOT NULL, -- 'detected', 'picked_up', 'put_down', 'focused'
    spatial_data JSONB, -- AR spatial coordinates and orientation
    confidence_score FLOAT DEFAULT 0.0,
    context JSONB DEFAULT '{}',
    interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning data for pattern analysis and personalization
CREATE TABLE learning_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'morning_routine', 'object_usage', 'health_habits'
    pattern_data JSONB DEFAULT '{}',
    confidence_score FLOAT DEFAULT 0.0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication schedules for health reminders
CREATE TABLE medication_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    schedule_times TIME[],
    days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health reminders for medication tracking
CREATE TABLE health_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_schedule_id UUID REFERENCES medication_schedules(id) ON DELETE CASCADE,
    reminder_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'missed', 'snoozed'
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food logs for nutrition tracking
CREATE TABLE food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    food_type TEXT,
    description TEXT,
    visual_analysis JSONB DEFAULT '{}',
    nutrition_data JSONB DEFAULT '{}',
    confidence_score FLOAT DEFAULT 0.0,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events for schedule integration
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_title TEXT,
    event_description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    event_data JSONB DEFAULT '{}',
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Object locations for spatial memory
CREATE TABLE object_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    object_type TEXT NOT NULL,
    object_identifier TEXT, -- specific object name/id
    last_known_location JSONB, -- spatial coordinates
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confidence_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions for conversation tracking
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'voice', 'gesture', 'visual'
    content TEXT,
    context JSONB DEFAULT '{}',
    ai_response TEXT,
    embedding vector(1536), -- For similarity search
    session_id UUID,
    interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning patterns for behavior analysis
CREATE TABLE learning_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,
    pattern_rules JSONB DEFAULT '{}',
    confidence_score FLOAT DEFAULT 0.0,
    active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_object_interactions_user_id ON object_interactions(user_id);
CREATE INDEX idx_object_interactions_type ON object_interactions(object_type);
CREATE INDEX idx_object_interactions_timestamp ON object_interactions(interaction_timestamp);
CREATE INDEX idx_object_interactions_session ON object_interactions(session_id);

CREATE INDEX idx_learning_data_user_id ON learning_data(user_id);
CREATE INDEX idx_learning_data_pattern_type ON learning_data(pattern_type);

CREATE INDEX idx_health_reminders_user_id ON health_reminders(user_id);
CREATE INDEX idx_health_reminders_time ON health_reminders(reminder_time);
CREATE INDEX idx_health_reminders_status ON health_reminders(status);

CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_session ON user_interactions(session_id);
CREATE INDEX idx_user_interactions_embedding ON user_interactions USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_object_locations_user_id ON object_locations(user_id);
CREATE INDEX idx_object_locations_type ON object_locations(object_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_schedules_updated_at BEFORE UPDATE ON medication_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_object_locations_updated_at BEFORE UPDATE ON object_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_patterns_updated_at BEFORE UPDATE ON learning_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();