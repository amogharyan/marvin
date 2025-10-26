-- Database functions for Marvin AR Morning Assistant
-- Task 1.3 & 1.6: Create database functions for interaction logging and pattern analysis

-- Function to log object interactions with automatic session grouping
CREATE OR REPLACE FUNCTION log_object_interaction(
    p_user_id UUID,
    p_object_type TEXT,
    p_interaction_type TEXT,
    p_spatial_data JSONB DEFAULT NULL,
    p_confidence_score FLOAT DEFAULT 0.0,
    p_context JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_interaction_id UUID;
BEGIN
    -- Get or create session ID (group interactions within 5 minutes)
    SELECT session_id INTO v_session_id
    FROM object_interactions
    WHERE user_id = p_user_id
      AND timestamp > NOW() - INTERVAL '5 minutes'
    ORDER BY timestamp DESC
    LIMIT 1;

    -- If no recent session, create new session ID
    IF v_session_id IS NULL THEN
        v_session_id := uuid_generate_v4();
    END IF;

    -- Insert the interaction
    INSERT INTO object_interactions (
        user_id, object_type, interaction_type, spatial_data,
        confidence_score, context, session_id
    ) VALUES (
        p_user_id, p_object_type, p_interaction_type, p_spatial_data,
        p_confidence_score, p_context, v_session_id
    ) RETURNING id INTO v_interaction_id;

    RETURN v_interaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze interaction patterns and create learning data
CREATE OR REPLACE FUNCTION analyze_interaction_patterns(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_patterns JSONB := '[]'::JSONB;
    v_pattern JSONB;
    v_morning_routine JSONB;
BEGIN
    -- Analyze morning routine patterns (6-10 AM)
    SELECT jsonb_build_object(
        'pattern_type', 'morning_routine',
        'object_sequence', jsonb_agg(object_type ORDER BY avg_time),
        'avg_timing', jsonb_object_agg(object_type, avg_time),
        'confidence', CASE WHEN count(*) > 10 THEN 0.9 ELSE count(*) * 0.09 END
    ) INTO v_morning_routine
    FROM (
        SELECT
            object_type,
            EXTRACT(HOUR FROM timestamp) + EXTRACT(MINUTE FROM timestamp)/60.0 as avg_time,
            count(*) as frequency
        FROM object_interactions
        WHERE user_id = p_user_id
          AND EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 10
          AND timestamp > NOW() - INTERVAL '30 days'
        GROUP BY object_type
        HAVING count(*) >= 3
    ) routine_data;

    IF v_morning_routine IS NOT NULL THEN
        v_patterns := v_patterns || jsonb_build_array(v_morning_routine);
    END IF;

    -- Analyze object location patterns
    SELECT jsonb_build_object(
        'pattern_type', 'location_preferences',
        'object_locations', jsonb_object_agg(object_type, most_common_location),
        'confidence', 0.8
    ) INTO v_pattern
    FROM (
        SELECT
            object_type,
            (spatial_data->>'location')::TEXT as most_common_location,
            count(*) as frequency,
            row_number() OVER (PARTITION BY object_type ORDER BY count(*) DESC) as rn
        FROM object_interactions
        WHERE user_id = p_user_id
          AND spatial_data->>'location' IS NOT NULL
          AND timestamp > NOW() - INTERVAL '30 days'
        GROUP BY object_type, spatial_data->>'location'
    ) loc_data
    WHERE rn = 1;

    IF v_pattern IS NOT NULL THEN
        v_patterns := v_patterns || jsonb_build_array(v_pattern);
    END IF;

    RETURN v_patterns;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update object location based on interactions
CREATE OR REPLACE FUNCTION update_object_location(
    p_user_id UUID,
    p_object_type TEXT,
    p_object_identifier TEXT,
    p_location JSONB,
    p_confidence_score FLOAT DEFAULT 0.8
) RETURNS VOID AS $$
BEGIN
    INSERT INTO object_locations (
        user_id, object_type, object_identifier,
        last_known_location, confidence_score
    ) VALUES (
        p_user_id, p_object_type, p_object_identifier,
        p_location, p_confidence_score
    )
    ON CONFLICT (user_id, object_type, object_identifier)
    DO UPDATE SET
        last_known_location = EXCLUDED.last_known_location,
        confidence_score = EXCLUDED.confidence_score,
        last_seen_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming health reminders
CREATE OR REPLACE FUNCTION get_upcoming_health_reminders(
    p_user_id UUID,
    p_hours_ahead INTEGER DEFAULT 2
) RETURNS TABLE (
    reminder_id UUID,
    medication_name TEXT,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    time_until_reminder INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        hr.id,
        ms.medication_name,
        hr.scheduled_time,
        hr.scheduled_time - NOW() as time_until_reminder
    FROM health_reminders hr
    JOIN medication_schedules ms ON hr.medication_schedule_id = ms.id
    WHERE hr.user_id = p_user_id
      AND hr.status = 'pending'
      AND hr.scheduled_time BETWEEN NOW() AND NOW() + (p_hours_ahead || ' hours')::INTERVAL
    ORDER BY hr.scheduled_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create daily medication reminders
CREATE OR REPLACE FUNCTION create_daily_medication_reminders(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_schedule RECORD;
    v_reminder_time TIME;
    v_reminder_datetime TIMESTAMP WITH TIME ZONE;
    v_count INTEGER := 0;
    v_today_dow INTEGER;
BEGIN
    -- Get today's day of week (1=Monday, 7=Sunday)
    v_today_dow := EXTRACT(ISODOW FROM NOW());

    FOR v_schedule IN
        SELECT * FROM medication_schedules
        WHERE user_id = p_user_id
          AND is_active = true
          AND v_today_dow = ANY(days_of_week)
    LOOP
        FOREACH v_reminder_time IN ARRAY v_schedule.schedule_times
        LOOP
            v_reminder_datetime := DATE_TRUNC('day', NOW()) + v_reminder_time;

            -- Only create reminders for future times today
            IF v_reminder_datetime > NOW() THEN
                INSERT INTO health_reminders (
                    user_id, medication_schedule_id, scheduled_time
                ) VALUES (
                    p_user_id, v_schedule.id, v_reminder_datetime
                )
                ON CONFLICT DO NOTHING;
                v_count := v_count + 1;
            END IF;
        END LOOP;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate daily nutrition summary
CREATE OR REPLACE FUNCTION calculate_daily_nutrition(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
    v_summary JSONB;
    v_total_calories INTEGER;
    v_nutritional_breakdown JSONB;
BEGIN
    -- Calculate total calories and nutritional breakdown
    SELECT
        COALESCE(SUM(calories), 0),
        jsonb_object_agg(
            meal_type,
            jsonb_build_object(
                'calories', COALESCE(SUM(calories), 0),
                'items', jsonb_agg(
                    jsonb_build_object(
                        'food_item', food_item,
                        'quantity', quantity,
                        'calories', calories
                    )
                )
            )
        )
    INTO v_total_calories, v_nutritional_breakdown
    FROM food_logs
    WHERE user_id = p_user_id
      AND DATE(logged_at) = p_date
    GROUP BY meal_type;

    -- Build summary object
    v_summary := jsonb_build_object(
        'date', p_date,
        'total_calories', v_total_calories,
        'breakdown_by_meal', COALESCE(v_nutritional_breakdown, '{}'::JSONB),
        'calculated_at', NOW()
    );

    -- Upsert into nutrition_analysis table
    INSERT INTO nutrition_analysis (user_id, date, total_calories, nutritional_breakdown)
    VALUES (p_user_id, p_date, v_total_calories, v_nutritional_breakdown)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        nutritional_breakdown = EXCLUDED.nutritional_breakdown,
        updated_at = NOW();

    RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find similar interactions using vector search
CREATE OR REPLACE FUNCTION find_similar_interactions(
    p_user_id UUID,
    p_embedding vector(384),
    p_limit INTEGER DEFAULT 5
) RETURNS TABLE (
    interaction_id UUID,
    similarity FLOAT,
    interaction_type TEXT,
    input_data JSONB,
    response_data JSONB,
    interaction_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ui.id,
        1 - (ui.embedding <=> p_embedding) as similarity,
        ui.interaction_type,
        ui.input_data,
        ui.response_data,
        ui.timestamp
    FROM user_interactions ui
    WHERE ui.user_id = p_user_id
      AND ui.embedding IS NOT NULL
    ORDER BY ui.embedding <=> p_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences based on interactions
CREATE OR REPLACE FUNCTION update_user_preferences(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_preferences JSONB := '{}'::JSONB;
    v_wake_time INTEGER;
    v_preferred_objects TEXT[];
BEGIN
    -- Calculate average wake time based on first interaction of the day
    SELECT AVG(EXTRACT(HOUR FROM timestamp) * 60 + EXTRACT(MINUTE FROM timestamp))::INTEGER INTO v_wake_time
    FROM (
        SELECT DATE(timestamp), MIN(timestamp) as timestamp
        FROM object_interactions
        WHERE user_id = p_user_id
          AND timestamp > NOW() - INTERVAL '30 days'
        GROUP BY DATE(timestamp)
    ) daily_first;

    -- Get most interacted objects
    SELECT ARRAY_AGG(object_type) INTO v_preferred_objects
    FROM (
        SELECT object_type
        FROM object_interactions
        WHERE user_id = p_user_id
          AND timestamp > NOW() - INTERVAL '30 days'
        GROUP BY object_type
        ORDER BY COUNT(*) DESC
        LIMIT 5
    ) top_objects;

    -- Build preferences
    v_preferences := jsonb_build_object(
        'estimated_wake_time_minutes', v_wake_time,
        'preferred_objects', v_preferred_objects,
        'updated_at', NOW()
    );

    -- Update user profile
    UPDATE user_profiles
    SET preferences = preferences || v_preferences,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN v_preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;