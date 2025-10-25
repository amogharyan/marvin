-- Initial database schema for Marvin AR Morning Assistant
-- Task 1.3 & 1.6: Set up Supabase foundation and object interaction database schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    preferences JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Object interactions table for tracking AR object detection events
CREATE TABLE object_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    object_type TEXT NOT NULL, -- 'medicine', 'bowl', 'laptop', 'keys', 'phone'
    interaction_type TEXT NOT NULL, -- 'detected', 'picked_up', 'put_down', 'focused'
    spatial_data JSONB, -- AR spatial coordinates and orientation
    confidence_score FLOAT DEFAULT 0.0,
    context JSONB DEFAULT '{}', -- Additional context like time of day, other objects nearby
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID, -- Group related interactions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning data table for pattern analysis and personalization
CREATE TABLE learning_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'routine', 'preference', 'habit'
    pattern_data JSONB NOT NULL,
    confidence_score FLOAT DEFAULT 0.0,
    context JSONB DEFAULT '{}',
    embedding vector(384), -- For similarity search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health and medication tracking
CREATE TABLE medication_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    schedule_times TIME[] NOT NULL,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    is_active BOOLEAN DEFAULT TRUE,
    reminder_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health reminders and notifications
CREATE TABLE health_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_schedule_id UUID REFERENCES medication_schedules(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'missed', 'snoozed'
    taken_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition tracking
CREATE TABLE food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    food_item TEXT NOT NULL,
    quantity TEXT,
    calories INTEGER,
    nutritional_data JSONB DEFAULT '{}',
    meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detection_confidence FLOAT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition analysis summaries
CREATE TABLE nutrition_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_calories INTEGER DEFAULT 0,
    nutritional_breakdown JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Calendar integration
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    external_event_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    event_type TEXT,
    preparation_data JSONB DEFAULT '{}',
    sync_status TEXT DEFAULT 'synced',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting preparation data
CREATE TABLE meeting_prep (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    preparation_items JSONB DEFAULT '[]',
    status TEXT DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Object locations and spatial memory
CREATE TABLE object_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    object_type TEXT NOT NULL,
    object_identifier TEXT, -- Specific instance of object type
    last_known_location JSONB NOT NULL, -- Spatial coordinates
    confidence_score FLOAT DEFAULT 0.0,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial memory for room layout and object relationships
CREATE TABLE spatial_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room_identifier TEXT NOT NULL,
    layout_data JSONB NOT NULL, -- Room boundaries, furniture, etc.
    object_relationships JSONB DEFAULT '{}', -- How objects relate spatially
    confidence_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, room_identifier)
);

-- User interactions for conversation context
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'voice_command', 'visual_query', 'gesture'
    input_data JSONB NOT NULL,
    response_data JSONB,
    context JSONB DEFAULT '{}',
    embedding vector(384), -- For similarity search
    session_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning patterns derived from interactions
CREATE TABLE learning_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'routine', 'preference', 'habit', 'schedule'
    pattern_description TEXT,
    pattern_data JSONB NOT NULL,
    confidence_score FLOAT DEFAULT 0.0,
    frequency INTEGER DEFAULT 1,
    last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_object_interactions_user_id ON object_interactions(user_id);
CREATE INDEX idx_object_interactions_object_type ON object_interactions(object_type);
CREATE INDEX idx_object_interactions_timestamp ON object_interactions(timestamp);
CREATE INDEX idx_learning_data_user_id ON learning_data(user_id);
CREATE INDEX idx_learning_data_pattern_type ON learning_data(pattern_type);
CREATE INDEX idx_medication_schedules_user_id ON medication_schedules(user_id);
CREATE INDEX idx_health_reminders_user_id ON health_reminders(user_id);
CREATE INDEX idx_health_reminders_scheduled_time ON health_reminders(scheduled_time);
CREATE INDEX idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX idx_food_logs_logged_at ON food_logs(logged_at);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_object_locations_user_id ON object_locations(user_id);
CREATE INDEX idx_object_locations_object_type ON object_locations(object_type);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX idx_learning_patterns_user_id ON learning_patterns(user_id);

-- Vector indexes for similarity search
CREATE INDEX idx_learning_data_embedding ON learning_data USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_user_interactions_embedding ON user_interactions USING ivfflat (embedding vector_cosine_ops);