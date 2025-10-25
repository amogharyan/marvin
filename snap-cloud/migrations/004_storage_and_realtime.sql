-- Storage buckets and realtime setup for Marvin AR Morning Assistant
-- Task 1.13: Set up audio response caching in Supabase Storage and real-time subscriptions

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('voice-cache', 'voice-cache', true, 52428800, '{"audio/mpeg","audio/wav","audio/mp3"}'),
  ('user-images', 'user-images', false, 10485760, '{"image/jpeg","image/png","image/webp"}'),
  ('ar-captures', 'ar-captures', false, 52428800, '{"image/jpeg","image/png","video/mp4"}')
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for voice cache (public read, authenticated write)
CREATE POLICY "Public voice cache read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'voice-cache');

CREATE POLICY "Authenticated voice cache write access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'voice-cache' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own voice cache" ON storage.objects
  FOR UPDATE USING (bucket_id = 'voice-cache' AND auth.role() = 'authenticated');

-- Service role full access for voice-cache
CREATE POLICY "Service role full access (voice-cache)" ON storage.objects
  FOR ALL USING (bucket_id = 'voice-cache' AND auth.role() = 'service_role');

-- Create storage policies for user images (user-specific access)
CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role full access for user-images
CREATE POLICY "Service role full access (user-images)" ON storage.objects
  FOR ALL USING (bucket_id = 'user-images' AND auth.role() = 'service_role');

-- Create storage policies for AR captures (user-specific access)
CREATE POLICY "Users can view own AR captures" ON storage.objects
  FOR SELECT USING (bucket_id = 'ar-captures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own AR captures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ar-captures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own AR captures" ON storage.objects
  FOR UPDATE USING (bucket_id = 'ar-captures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own AR captures" ON storage.objects
  FOR DELETE USING (bucket_id = 'ar-captures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role full access for ar-captures
CREATE POLICY "Service role full access (ar-captures)" ON storage.objects
  FOR ALL USING (bucket_id = 'ar-captures' AND auth.role() = 'service_role');

-- Add tables to existing publication for real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE object_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE health_reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE user_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE learning_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE medication_schedules;

-- Enable real-time for specific tables
ALTER TABLE object_interactions REPLICA IDENTITY FULL;
ALTER TABLE health_reminders REPLICA IDENTITY FULL;
ALTER TABLE calendar_events REPLICA IDENTITY FULL;
ALTER TABLE user_interactions REPLICA IDENTITY FULL;
ALTER TABLE medication_schedules REPLICA IDENTITY FULL;
ALTER TABLE learning_patterns REPLICA IDENTITY FULL;

-- Create functions for real-time notifications
CREATE OR REPLACE FUNCTION notify_object_interaction()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'object_interaction_' || NEW.user_id,
    json_build_object(
      'type', 'object_interaction',
      'data', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_health_reminder()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'health_reminder_' || NEW.user_id,
    json_build_object(
      'type', 'health_reminder',
      'data', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for real-time notifications
CREATE TRIGGER trigger_notify_object_interaction
  AFTER INSERT OR UPDATE ON object_interactions
  FOR EACH ROW EXECUTE FUNCTION notify_object_interaction();

CREATE TRIGGER trigger_notify_health_reminder
  AFTER INSERT OR UPDATE ON health_reminders
  FOR EACH ROW EXECUTE FUNCTION notify_health_reminder();

-- Create indexes for real-time performance
CREATE INDEX idx_object_interactions_realtime ON object_interactions(user_id, created_at DESC);
CREATE INDEX idx_health_reminders_realtime ON health_reminders(user_id, scheduled_time);
CREATE INDEX idx_user_interactions_realtime ON user_interactions(user_id, timestamp DESC);

-- Create materialized view for real-time dashboard data
CREATE MATERIALIZED VIEW user_dashboard_data AS
SELECT
  u.user_id,
  u.name,
  u.preferences,
  COUNT(DISTINCT oi.id) as total_interactions,
  COUNT(DISTINCT hr.id) FILTER (WHERE hr.status = 'pending') as pending_reminders,
  COUNT(DISTINCT ce.id) FILTER (WHERE ce.start_time::date = CURRENT_DATE) as today_events,
  MAX(oi.created_at) as last_interaction
FROM user_profiles u
LEFT JOIN object_interactions oi ON u.user_id = oi.user_id
LEFT JOIN health_reminders hr ON u.user_id = hr.user_id
LEFT JOIN calendar_events ce ON u.user_id = ce.user_id
GROUP BY u.user_id, u.name, u.preferences;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_user_dashboard_data_user_id ON user_dashboard_data(user_id);

-- Create function to refresh dashboard data
CREATE OR REPLACE FUNCTION refresh_user_dashboard_data()
RETURNS VOID AS $$
DECLARE
  _lock_acquired BOOLEAN := FALSE;
BEGIN
  -- Acquire application-level advisory lock (unique key: 424242)
  PERFORM pg_advisory_lock(424242);
  _lock_acquired := TRUE;
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_dashboard_data;
  EXCEPTION WHEN OTHERS THEN
    -- On error, fallback to non-concurrent refresh
    REFRESH MATERIALIZED VIEW user_dashboard_data;
  END;
  -- Release advisory lock
  IF _lock_acquired THEN
    PERFORM pg_advisory_unlock(424242);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old data (for performance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
DECLARE
  obj_days CONSTANT INTEGER := 90;
  user_days CONSTANT INTEGER := 30;
  health_days CONSTANT INTEGER := 7;
  food_days CONSTANT INTEGER := 30;
  deleted_object_interactions INTEGER := 0;
  deleted_user_interactions INTEGER := 0;
  deleted_health_reminders INTEGER := 0;
  deleted_food_logs INTEGER := 0;
BEGIN
  -- Validate retention intervals
  IF obj_days <= 0 OR user_days <= 0 OR health_days <= 0 OR food_days <= 0 THEN
    RAISE EXCEPTION 'Retention intervals must be positive';
  END IF;

  -- Clean up old object interactions (keep last obj_days)
  DELETE FROM object_interactions
  WHERE created_at < NOW() - INTERVAL '1 day' * obj_days;
  GET DIAGNOSTICS deleted_object_interactions = ROW_COUNT;

  -- Clean up old user interactions (keep last user_days)
  DELETE FROM user_interactions
  WHERE created_at < NOW() - INTERVAL '1 day' * user_days
    AND (interaction_type IS NULL OR interaction_type NOT IN ('conversation_session', 'voice_synthesis'));
  GET DIAGNOSTICS deleted_user_interactions = ROW_COUNT;

  -- Clean up completed health reminders (keep last health_days)
  DELETE FROM health_reminders
  WHERE status = 'completed'
    AND taken_at < NOW() - INTERVAL '1 day' * health_days;
  GET DIAGNOSTICS deleted_health_reminders = ROW_COUNT;

  -- Clean up old food logs (keep last food_days)
  DELETE FROM food_logs
  WHERE logged_at < NOW() - INTERVAL '1 day' * food_days;
  GET DIAGNOSTICS deleted_food_logs = ROW_COUNT;

  -- Clean up voice cache files older than 7 days would be handled by storage policies

  RAISE NOTICE 'Old data cleanup completed: object_interactions=% deleted, user_interactions=% deleted, health_reminders=% deleted, food_logs=% deleted',
    deleted_object_interactions, deleted_user_interactions, deleted_health_reminders, deleted_food_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;