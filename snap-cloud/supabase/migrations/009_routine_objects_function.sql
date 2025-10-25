-- Function to get routine objects for departure checklist
CREATE OR REPLACE FUNCTION get_routine_objects(p_user_id UUID)
RETURNS TABLE (
    object_type TEXT,
    interaction_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        oi.object_type,
        count(*) as interaction_count
    FROM object_interactions oi
    WHERE oi.user_id = p_user_id
    AND oi.interaction_timestamp >= NOW() - INTERVAL '7 days'
    AND oi.object_type IN ('keys', 'phone', 'laptop', 'medicine')
    GROUP BY oi.object_type
    ORDER BY interaction_count DESC;
END;
$$;