-- Phase 2 Missing Tables
-- Add tables that were specified in tasklist but not implemented

-- Meeting preparation table for calendar integration (Task 2.9)
CREATE TABLE meeting_prep (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    meeting_title TEXT NOT NULL,
    meeting_time TIMESTAMP WITH TIME ZONE NOT NULL,
    attendees JSONB DEFAULT '[]', -- Array of attendee emails
    agenda TEXT,
    preparation_notes TEXT,
    documents_needed JSONB DEFAULT '[]',
    meeting_link TEXT,
    prep_status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    prep_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition analysis table for detailed nutrition tracking (Task 2.6)
CREATE TABLE nutrition_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    food_log_id UUID NOT NULL REFERENCES food_logs(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    analysis_period DATE NOT NULL,
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fat DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    total_sugar DECIMAL(8,2) DEFAULT 0,
    sodium_mg DECIMAL(8,2) DEFAULT 0,
    vitamin_data JSONB DEFAULT '{}',
    mineral_data JSONB DEFAULT '{}',
    meal_count INTEGER DEFAULT 0,
    nutrition_score DECIMAL(3,2) DEFAULT 0.0, -- 0-1 scale
    recommendations JSONB DEFAULT '[]',
    deficiencies JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spatial memory table for enhanced location tracking (Task 2.12)
CREATE TABLE spatial_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    object_type TEXT NOT NULL,
    object_identifier TEXT,
    room_name TEXT,
    location_coordinates JSONB, -- {x, y, z, room_bounds}
    location_description TEXT,
    frequency_score INTEGER DEFAULT 1, -- How often object found here
    last_seen_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confidence_level DECIMAL(3,2) DEFAULT 0.0, -- 0-1 scale
    environmental_context JSONB DEFAULT '{}', -- lighting, nearby objects, etc.
    access_patterns JSONB DEFAULT '{}', -- time patterns when accessed
    spatial_relationships JSONB DEFAULT '{}', -- relative to other objects
    memory_strength DECIMAL(3,2) DEFAULT 1.0, -- decays over time
    decay_rate DECIMAL(3,2) DEFAULT 0.05, -- time-based decay per day
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meeting_prep_user_id ON meeting_prep(user_id);
CREATE INDEX idx_meeting_prep_event_id ON meeting_prep(calendar_event_id);
CREATE INDEX idx_meeting_prep_time ON meeting_prep(meeting_time);
CREATE INDEX idx_meeting_prep_status ON meeting_prep(prep_status);

CREATE INDEX idx_nutrition_analysis_user_id ON nutrition_analysis(user_id);
CREATE INDEX idx_nutrition_analysis_period ON nutrition_analysis(analysis_period);
CREATE INDEX idx_nutrition_analysis_type ON nutrition_analysis(analysis_type);
CREATE INDEX idx_nutrition_analysis_food_log ON nutrition_analysis(food_log_id);

-- Migration: Set any existing NULL food_log_id to a valid reference or remove those rows before enforcing NOT NULL
UPDATE nutrition_analysis SET food_log_id = (
    SELECT id FROM food_logs WHERE user_id = nutrition_analysis.user_id LIMIT 1
) WHERE food_log_id IS NULL;
DELETE FROM nutrition_analysis WHERE food_log_id IS NULL;

CREATE INDEX idx_spatial_memory_user_id ON spatial_memory(user_id);
CREATE INDEX idx_spatial_memory_object_type ON spatial_memory(object_type);
CREATE INDEX idx_spatial_memory_room ON spatial_memory(room_name);
CREATE INDEX idx_spatial_memory_timestamp ON spatial_memory(last_seen_timestamp);
CREATE INDEX idx_spatial_memory_frequency ON spatial_memory(frequency_score);

-- Unique constraints
ALTER TABLE meeting_prep ADD CONSTRAINT unique_user_event_prep
    UNIQUE (user_id, calendar_event_id);

ALTER TABLE nutrition_analysis ADD CONSTRAINT unique_user_period_type
    UNIQUE (user_id, analysis_period, analysis_type);

ALTER TABLE spatial_memory ADD CONSTRAINT unique_user_object_room
    UNIQUE (user_id, object_type, object_identifier, room_name);

-- Updated_at triggers
CREATE TRIGGER update_meeting_prep_updated_at BEFORE UPDATE ON meeting_prep
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_analysis_updated_at BEFORE UPDATE ON nutrition_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spatial_memory_updated_at BEFORE UPDATE ON spatial_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();