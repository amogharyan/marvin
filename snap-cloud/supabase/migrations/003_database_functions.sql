-- Database functions for interaction logging and pattern analysis
-- Task 1.6: Create database functions for interaction logging and pattern analysis

-- Function to log object interactions with session grouping
CREATE OR REPLACE FUNCTION log_object_interaction(
    p_user_id UUID,
    p_object_type TEXT,
    p_interaction_type TEXT,
    p_spatial_data JSONB DEFAULT NULL,
    p_confidence_score FLOAT DEFAULT 0.0,
    p_context JSONB DEFAULT '{}',
    p_session_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    interaction_id UUID;
BEGIN
    INSERT INTO object_interactions (
        user_id,
        object_type,
        interaction_type,
        spatial_data,
        confidence_score,
        context,
        session_id
    ) VALUES (
        p_user_id,
        p_object_type,
        p_interaction_type,
        p_spatial_data,
        p_confidence_score,
        p_context,
        p_session_id
    ) RETURNING id INTO interaction_id;

    RETURN interaction_id;
END;
$$;

-- Function to analyze interaction patterns for morning routines
CREATE OR REPLACE FUNCTION analyze_interaction_patterns(p_user_id UUID)
RETURNS TABLE (
    pattern_type TEXT,
    object_sequence TEXT[],
    avg_confidence FLOAT,
    frequency INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH morning_interactions AS (
        SELECT
            object_type,
            interaction_timestamp::time as interaction_time,
            confidence_score,
            date_trunc('day', interaction_timestamp) as interaction_date
        FROM object_interactions
        WHERE user_id = p_user_id
        AND interaction_timestamp::time BETWEEN '06:00:00' AND '10:00:00'
        AND interaction_timestamp >= NOW() - INTERVAL '30 days'
    ),
    daily_sequences AS (
        SELECT
            interaction_date,
            array_agg(object_type ORDER BY interaction_time) as sequence,
            avg(confidence_score) as avg_conf
        FROM morning_interactions
        GROUP BY interaction_date
    )
    SELECT
        'morning_routine'::TEXT,
        sequence,
        avg_conf::FLOAT,
        count(*)::INTEGER as freq
    FROM daily_sequences
    GROUP BY sequence, avg_conf
    HAVING count(*) >= 3
    ORDER BY freq DESC;
END;
$$;

-- Function to update object location in spatial memory
CREATE OR REPLACE FUNCTION update_object_location(
    p_user_id UUID,
    p_object_type TEXT,
    p_object_identifier TEXT,
    p_location JSONB,
    p_confidence_score FLOAT DEFAULT 0.0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    location_id UUID;
BEGIN
    INSERT INTO object_locations (
        user_id,
        object_type,
        object_identifier,
        last_known_location,
        confidence_score
    ) VALUES (
        p_user_id,
        p_object_type,
        p_object_identifier,
        p_location,
        p_confidence_score
    )
    ON CONFLICT (user_id, object_type, object_identifier)
    DO UPDATE SET
        last_known_location = EXCLUDED.last_known_location,
        confidence_score = EXCLUDED.confidence_score,
        last_seen_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO location_id;

    RETURN location_id;
END;
$$;

-- Add unique constraint for object locations
ALTER TABLE object_locations
ADD CONSTRAINT unique_user_object_location
UNIQUE (user_id, object_type, object_identifier);

-- Function to get upcoming health reminders
CREATE OR REPLACE FUNCTION get_upcoming_health_reminders(p_user_id UUID)
RETURNS TABLE (
    reminder_id UUID,
    medication_name TEXT,
    reminder_time TIMESTAMP WITH TIME ZONE,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        hr.id,
        ms.medication_name,
        hr.reminder_time,
        hr.status
    FROM health_reminders hr
    JOIN medication_schedules ms ON hr.medication_schedule_id = ms.id
    WHERE hr.user_id = p_user_id
    AND hr.reminder_time >= NOW()
    AND hr.reminder_time <= NOW() + INTERVAL '24 hours'
    AND hr.status = 'pending'
    ORDER BY hr.reminder_time ASC;
END;
$$;

-- Function to create daily medication reminders
CREATE OR REPLACE FUNCTION create_daily_medication_reminders(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    schedule_record RECORD;
    reminder_count INTEGER := 0;
    schedule_time TIME;
    current_dow INTEGER;
    reminder_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
    current_dow := EXTRACT(DOW FROM NOW());

    FOR schedule_record IN
        SELECT * FROM medication_schedules
        WHERE user_id = p_user_id AND active = true
    LOOP
        -- Check if today is in the schedule
        IF current_dow = ANY(schedule_record.days_of_week) THEN
            FOREACH schedule_time IN ARRAY schedule_record.schedule_times
            LOOP
                reminder_datetime := date_trunc('day', NOW()) + schedule_time;

                -- Only create reminder if it's in the future
                IF reminder_datetime > NOW() THEN
                    INSERT INTO health_reminders (
                        user_id,
                        medication_schedule_id,
                        reminder_time
                    ) VALUES (
                        p_user_id,
                        schedule_record.id,
                        reminder_datetime
                    )
                    ON CONFLICT DO NOTHING;

                    reminder_count := reminder_count + 1;
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    RETURN reminder_count;
END;
$$;

-- Function to calculate daily nutrition summary
CREATE OR REPLACE FUNCTION calculate_daily_nutrition(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    nutrition_summary JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_calories', COALESCE(SUM(NULLIF(nutrition_data->>'calories','')::NUMERIC), 0),
        'total_protein', COALESCE(SUM(NULLIF(nutrition_data->>'protein','')::NUMERIC), 0),
        'total_carbs', COALESCE(SUM(NULLIF(nutrition_data->>'carbs','')::NUMERIC), 0),
        'total_fat', COALESCE(SUM(NULLIF(nutrition_data->>'fat','')::NUMERIC), 0),
        'meal_count', COUNT(*),
        'date', p_date
    ) INTO nutrition_summary
    FROM food_logs
    WHERE user_id = p_user_id
    AND logged_at::date = p_date;

    RETURN nutrition_summary;
END;
$$;

-- Function to find similar interactions using vector search
CREATE OR REPLACE FUNCTION find_similar_interactions(
    p_user_id UUID,
    p_query_embedding vector(1536),
        p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    interaction_id UUID,
    content TEXT,
    ai_response TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
    DECLARE
        validated_limit INTEGER := LEAST(GREATEST(p_limit, 1), 100);
BEGIN
    RETURN QUERY
    SELECT
        ui.id,
        ui.content,
        ui.ai_response,
        1 - (ui.embedding <=> p_query_embedding) as similarity
    FROM user_interactions ui
    WHERE ui.user_id = p_user_id
    AND ui.embedding IS NOT NULL
    ORDER BY ui.embedding <=> p_query_embedding
        LIMIT validated_limit;
END;
$$;

-- Function to update user preferences based on interaction analysis
CREATE OR REPLACE FUNCTION update_user_preferences(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_preferences JSONB;
    most_used_objects TEXT[];
    morning_routine_objects TEXT[];
BEGIN
    -- Get most frequently interacted objects
    SELECT array_agg(object_type ORDER BY interaction_count DESC)
    INTO most_used_objects
    FROM (
        SELECT object_type, count(*) as interaction_count
        FROM object_interactions
        WHERE user_id = p_user_id
        AND interaction_timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY object_type
        LIMIT 5
    ) frequent_objects;

    -- Get morning routine pattern
    SELECT array_agg(DISTINCT object_type)
    INTO morning_routine_objects
    FROM object_interactions
    WHERE user_id = p_user_id
    AND interaction_timestamp::time BETWEEN '06:00:00' AND '10:00:00'
    AND interaction_timestamp >= NOW() - INTERVAL '7 days';

    -- Build preferences JSON
    updated_preferences := jsonb_build_object(
        'frequently_used_objects', most_used_objects,
        'morning_routine_objects', morning_routine_objects,
        'last_updated', NOW()
    );

    -- Update user profile
    UPDATE user_profiles
    SET preferences = preferences || updated_preferences,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN updated_preferences;
END;
$$;

-- Utility function to cleanup old data for performance
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Clean up old object interactions (keep last 90 days)
    DELETE FROM object_interactions
    WHERE interaction_timestamp < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Clean up old health reminders (keep last 30 days)
    DELETE FROM health_reminders
    WHERE created_at < NOW() - INTERVAL '30 days' AND status != 'pending';

    -- Clean up old food logs (keep last 60 days)
    DELETE FROM food_logs
    WHERE logged_at < NOW() - INTERVAL '60 days';

    RETURN deleted_count;
END;
$$;