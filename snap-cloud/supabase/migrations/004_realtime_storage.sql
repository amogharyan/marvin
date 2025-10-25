-- Set up real-time subscriptions and storage buckets
-- Task 1.6: Set up real-time subscriptions for object state changes
-- Task 1.13: Set up audio response caching in Supabase Storage

-- Enable real-time for all relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE object_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE health_reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE user_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE learning_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE object_locations;

-- Create storage buckets for voice caching and user content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'voice-cache',
    'voice-cache',
    true,
    52428800, -- 50MB
    ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-images',
    'user-images',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ar-captures',
    'ar-captures',
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for voice cache (public read, authenticated write)
CREATE POLICY "Public can view voice cache" ON storage.objects
    FOR SELECT USING (bucket_id = 'voice-cache');

CREATE POLICY "Authenticated users can upload to voice cache" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'voice-cache' AND auth.role() = 'authenticated');

CREATE POLICY "Service role can manage voice cache" ON storage.objects
    FOR ALL USING (bucket_id = 'voice-cache' AND auth.role() = 'service_role');

-- Storage policies for user images (user-scoped)
CREATE POLICY "Users can view own images" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for AR captures (user-scoped)
CREATE POLICY "Users can view own AR captures" ON storage.objects
    FOR SELECT USING (bucket_id = 'ar-captures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own AR captures" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'ar-captures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own AR captures" ON storage.objects
    FOR UPDATE USING (bucket_id = 'ar-captures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own AR captures" ON storage.objects
    FOR DELETE USING (bucket_id = 'ar-captures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role policies for Edge Functions
CREATE POLICY "Service role can manage user images" ON storage.objects
    FOR ALL USING (bucket_id = 'user-images' AND auth.role() = 'service_role');

CREATE POLICY "Service role can manage AR captures" ON storage.objects
    FOR ALL USING (bucket_id = 'ar-captures' AND auth.role() = 'service_role');