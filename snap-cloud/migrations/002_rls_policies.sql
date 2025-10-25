-- Row Level Security policies for Marvin AR Morning Assistant
-- Task 1.3 & 1.6: Configure RLS for data access control

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE object_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE object_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Object interactions policies
CREATE POLICY "Users can view own object interactions" ON object_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own object interactions" ON object_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own object interactions" ON object_interactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Learning data policies
CREATE POLICY "Users can view own learning data" ON learning_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning data" ON learning_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning data" ON learning_data
    FOR UPDATE USING (auth.uid() = user_id);

-- Medication schedules policies
CREATE POLICY "Users can view own medication schedules" ON medication_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication schedules" ON medication_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication schedules" ON medication_schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication schedules" ON medication_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- Health reminders policies
CREATE POLICY "Users can view own health reminders" ON health_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health reminders" ON health_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health reminders" ON health_reminders
    FOR UPDATE USING (auth.uid() = user_id);

-- Food logs policies
CREATE POLICY "Users can view own food logs" ON food_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs" ON food_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs" ON food_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Nutrition analysis policies
CREATE POLICY "Users can view own nutrition analysis" ON nutrition_analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition analysis" ON nutrition_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition analysis" ON nutrition_analysis
    FOR UPDATE USING (auth.uid() = user_id);

-- Calendar events policies
CREATE POLICY "Users can view own calendar events" ON calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events" ON calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- Meeting prep policies
CREATE POLICY "Users can view own meeting prep" ON meeting_prep
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meeting prep" ON meeting_prep
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meeting prep" ON meeting_prep
    FOR UPDATE USING (auth.uid() = user_id);

-- Object locations policies
CREATE POLICY "Users can view own object locations" ON object_locations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own object locations" ON object_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own object locations" ON object_locations
    FOR UPDATE USING (auth.uid() = user_id);

-- Spatial memory policies
CREATE POLICY "Users can view own spatial memory" ON spatial_memory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spatial memory" ON spatial_memory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spatial memory" ON spatial_memory
    FOR UPDATE USING (auth.uid() = user_id);

-- User interactions policies
CREATE POLICY "Users can view own interactions" ON user_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON user_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning patterns policies
CREATE POLICY "Users can view own learning patterns" ON learning_patterns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning patterns" ON learning_patterns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning patterns" ON learning_patterns
    FOR UPDATE USING (auth.uid() = user_id);