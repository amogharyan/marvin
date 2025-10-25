-- RLS policies for Phase 2 missing tables

-- Enable RLS on new tables
ALTER TABLE meeting_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_memory ENABLE ROW LEVEL SECURITY;

-- Meeting prep policies
CREATE POLICY "Users can view own meeting prep" ON meeting_prep
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meeting prep" ON meeting_prep
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meeting prep" ON meeting_prep
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meeting prep" ON meeting_prep
    FOR DELETE USING (auth.uid() = user_id);

-- Nutrition analysis policies
CREATE POLICY "Users can view own nutrition analysis" ON nutrition_analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition analysis" ON nutrition_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition analysis" ON nutrition_analysis
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition analysis" ON nutrition_analysis
    FOR DELETE USING (auth.uid() = user_id);

-- Spatial memory policies
CREATE POLICY "Users can view own spatial memory" ON spatial_memory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spatial memory" ON spatial_memory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spatial memory" ON spatial_memory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spatial memory" ON spatial_memory
    FOR DELETE USING (auth.uid() = user_id);

-- Service role policies for Edge Functions
CREATE POLICY "Service role can access all meeting prep" ON meeting_prep
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all nutrition analysis" ON nutrition_analysis
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all spatial memory" ON spatial_memory
    FOR ALL USING (auth.role() = 'service_role');