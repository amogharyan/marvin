-- Additional database functions for Phase 2 missing tables

-- Function to create comprehensive meeting preparation
CREATE OR REPLACE FUNCTION create_meeting_preparation(
    p_user_id UUID,
    p_calendar_event_id UUID,
    p_meeting_title TEXT,
    p_meeting_time TIMESTAMP WITH TIME ZONE,
    p_attendees JSONB DEFAULT '[]'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    prep_id UUID;
    agenda_text TEXT;
    prep_notes TEXT;
BEGIN
    -- Generate automatic agenda and prep notes
    agenda_text := 'Review previous action items' || E'\n' ||
                   'Discuss ' || p_meeting_title || ' objectives' || E'\n' ||
                   'Address any blockers or challenges' || E'\n' ||
                   'Plan next steps and assign responsibilities';

    prep_notes := 'Review relevant documents beforehand' || E'\n' ||
                  'Prepare status updates on current projects' || E'\n' ||
                  'List any questions or concerns to discuss' || E'\n' ||
                  'Bring necessary materials or presentations';

    INSERT INTO meeting_prep (
        user_id,
        calendar_event_id,
        meeting_title,
        meeting_time,
        attendees,
        agenda,
        preparation_notes,
        prep_status
    ) VALUES (
        p_user_id,
        p_calendar_event_id,
        p_meeting_title,
        p_meeting_time,
        p_attendees,
        agenda_text,
        prep_notes,
        'pending'
    ) RETURNING id INTO prep_id;

    RETURN prep_id;
END;
$$;

-- Function to create nutrition analysis
CREATE OR REPLACE FUNCTION create_nutrition_analysis(
    p_user_id UUID,
    p_analysis_type TEXT,
    p_analysis_period DATE DEFAULT CURRENT_DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    analysis_id UUID;
    food_data RECORD;
    total_cals DECIMAL := 0;
    total_prot DECIMAL := 0;
    total_carb DECIMAL := 0;
    total_fat_val DECIMAL := 0;
    meal_cnt INTEGER := 0;
    nutrition_scr DECIMAL := 0;
BEGIN
    -- Calculate nutritional totals based on period and type
    IF p_analysis_type = 'daily' THEN
        SELECT
            COALESCE(SUM(NULLIF(nutrition_data->>'calories','')::DECIMAL), 0),
            COALESCE(SUM(NULLIF(nutrition_data->>'protein','')::DECIMAL), 0),
            COALESCE(SUM(NULLIF(nutrition_data->>'carbs','')::DECIMAL), 0),
            COALESCE(SUM(NULLIF(nutrition_data->>'fat','')::DECIMAL), 0),
            COUNT(*) FILTER (WHERE nutrition_data IS NOT NULL AND NULLIF(nutrition_data->>'calories','') IS NOT NULL)
        INTO total_cals, total_prot, total_carb, total_fat_val, meal_cnt
        FROM food_logs
        WHERE user_id = p_user_id
        AND logged_at::date = p_analysis_period;

    ELSIF p_analysis_type = 'weekly' THEN
        SELECT
            COALESCE(SUM(NULLIF(nutrition_data->>'calories','')::DECIMAL), 0),
            COALESCE(SUM(NULLIF(nutrition_data->>'protein','')::DECIMAL), 0),
            COALESCE(SUM(NULLIF(nutrition_data->>'carbs','')::DECIMAL), 0),
            COALESCE(SUM(NULLIF(nutrition_data->>'fat','')::DECIMAL), 0),
            COUNT(*) FILTER (WHERE nutrition_data IS NOT NULL AND NULLIF(nutrition_data->>'calories','') IS NOT NULL)
        INTO total_cals, total_prot, total_carb, total_fat_val, meal_cnt
        FROM food_logs
        WHERE user_id = p_user_id
        AND logged_at::date >= p_analysis_period - INTERVAL '7 days'
        AND logged_at::date <= p_analysis_period;
    END IF;

        -- Normalized, weighted, clamped nutrition score
        -- Get user-specific baselines (calories, protein, meals) from profile or use defaults
        DECLARE
            base_cals DECIMAL := COALESCE(profile_age_weight_activity_defaults->>'calories', '2000')::DECIMAL;
            base_prot DECIMAL := COALESCE(profile_age_weight_activity_defaults->>'protein', '50')::DECIMAL;
            base_meals DECIMAL := COALESCE(profile_age_weight_activity_defaults->>'meals', '3')::DECIMAL;
            w_cals DECIMAL := 0.5;
            w_prot DECIMAL := 0.3;
            w_meals DECIMAL := 0.2;
            cals_ratio DECIMAL := CASE WHEN base_cals > 0 THEN COALESCE(total_cals,0)/base_cals ELSE 0 END;
            prot_ratio DECIMAL := CASE WHEN base_prot > 0 THEN COALESCE(total_prot,0)/base_prot ELSE 0 END;
            meals_ratio DECIMAL := CASE WHEN base_meals > 0 THEN meal_cnt/base_meals ELSE 0 END;
            cals_score DECIMAL := LEAST(GREATEST(cals_ratio,0),1);
            prot_score DECIMAL := LEAST(GREATEST(prot_ratio,0),1);
            meals_score DECIMAL := LEAST(GREATEST(meals_ratio,0),1);
            -- Deficiency checks: penalize if below 80% of baseline
            IF cals_ratio < 0.8 THEN cals_score := cals_score * 0.7; END IF;
            IF prot_ratio < 0.8 THEN prot_score := prot_score * 0.7; END IF;
            IF meals_ratio < 0.8 THEN meals_score := meals_score * 0.7; END IF;
            nutrition_scr := LEAST(GREATEST((cals_score*w_cals + prot_score*w_prot + meals_score*w_meals),0),1);

    INSERT INTO nutrition_analysis (
        user_id,
        analysis_type,
        analysis_period,
        total_calories,
        total_protein,
        total_carbs,
        total_fat,
        meal_count,
        nutrition_score,
        recommendations,
        deficiencies
    ) VALUES (
        p_user_id,
        p_analysis_type,
        p_analysis_period,
        total_cals,
        total_prot,
        total_carb,
        total_fat_val,
        meal_cnt,
        nutrition_scr,
        CASE
            WHEN total_cals < 1500 THEN '["Increase caloric intake", "Add healthy snacks"]'::JSONB
            WHEN total_prot < 50 THEN '["Increase protein intake", "Add protein-rich foods"]'::JSONB
            ELSE '["Maintain balanced nutrition"]'::JSONB
        END,
        CASE
            WHEN total_prot < 30 THEN '["protein"]'::JSONB
            WHEN total_cals < 1200 THEN '["calories"]'::JSONB
            ELSE '[]'::JSONB
        END
    ) RETURNING id INTO analysis_id;

    RETURN analysis_id;
END;
$$;

-- Function to update spatial memory with decay
CREATE OR REPLACE FUNCTION update_spatial_memory(
    p_user_id UUID,
    p_object_type TEXT,
    p_object_identifier TEXT,
    p_room_name TEXT,
    p_location_coordinates JSONB,
    p_location_description TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    memory_id UUID;
    current_frequency INTEGER := 1;
    current_confidence DECIMAL := 0.8;
BEGIN
    -- Check if spatial memory already exists for this object in this room
    SELECT id, frequency_score
    INTO memory_id, current_frequency
    FROM spatial_memory
    WHERE user_id = p_user_id
    AND object_type = p_object_type
    AND object_identifier = p_object_identifier
    AND room_name = p_room_name;

    IF memory_id IS NOT NULL THEN
        -- Update existing memory
        UPDATE spatial_memory
        SET
            location_coordinates = p_location_coordinates,
            location_description = COALESCE(p_location_description, location_description),
            frequency_score = frequency_score + 1,
            last_seen_timestamp = NOW(),
            confidence_level = LEAST(1.0, confidence_level + 0.1),
            memory_strength = LEAST(1.0, memory_strength + 0.1),
            updated_at = NOW()
        WHERE id = memory_id;
    ELSE
        -- Create new memory
        INSERT INTO spatial_memory (
            user_id,
            object_type,
            object_identifier,
            room_name,
            location_coordinates,
            location_description,
            frequency_score,
            confidence_level,
            memory_strength
        ) VALUES (
            p_user_id,
            p_object_type,
            p_object_identifier,
            p_room_name,
            p_location_coordinates,
            p_location_description,
            1,
            current_confidence,
            1.0
        ) RETURNING id INTO memory_id;
    END IF;

    RETURN memory_id;
END;
$$;

-- Function to get meeting preparations for upcoming events
CREATE OR REPLACE FUNCTION get_upcoming_meeting_prep(p_user_id UUID)
RETURNS TABLE (
    prep_id UUID,
    meeting_title TEXT,
    meeting_time TIMESTAMP WITH TIME ZONE,
    prep_status TEXT,
    agenda TEXT,
    attendees JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        mp.id,
        mp.meeting_title,
        mp.meeting_time,
        mp.prep_status,
        mp.agenda,
        mp.attendees
    FROM meeting_prep mp
    WHERE mp.user_id = p_user_id
    AND mp.meeting_time >= NOW()
    AND mp.meeting_time <= NOW() + INTERVAL '24 hours'
    ORDER BY mp.meeting_time ASC;
END;
$$;

-- Function to find objects using spatial memory
CREATE OR REPLACE FUNCTION find_object_in_spatial_memory(
    p_user_id UUID,
    p_object_type TEXT,
    p_object_identifier TEXT DEFAULT NULL
)
RETURNS TABLE (
    memory_id UUID,
    room_name TEXT,
    location_coordinates JSONB,
    location_description TEXT,
    confidence_level DECIMAL,
    frequency_score INTEGER,
    last_seen TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sm.id,
        sm.room_name,
        sm.location_coordinates,
        sm.location_description,
        sm.confidence_level,
        sm.frequency_score,
        sm.last_seen_timestamp
    FROM spatial_memory sm
    WHERE sm.user_id = p_user_id
    AND sm.object_type = p_object_type
    AND (p_object_identifier IS NULL OR sm.object_identifier = p_object_identifier)
    AND (
        CASE 
            WHEN EXTRACT(EPOCH FROM (NOW() - sm.last_seen_timestamp)) / 86400 > 30 THEN 0.1
            WHEN EXTRACT(EPOCH FROM (NOW() - sm.last_seen_timestamp)) / 86400 > 7 THEN 0.3
            ELSE sm.memory_strength
        END > 0.3
    )
    ORDER BY sm.frequency_score DESC, sm.confidence_level DESC, sm.last_seen_timestamp DESC;
END;
$$;