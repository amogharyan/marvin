## API endpoint standards and conventions

- **RESTful Design**: Follow REST principles with clear resource-based URLs and appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Consistent Naming**: Use consistent, lowercase, hyphenated or underscored naming conventions for endpoints across the API
- **Versioning**: Implement API versioning strategy (URL path or headers) to manage breaking changes without disrupting existing clients
- **Plural Nouns**: Use plural nouns for resource endpoints (e.g., `/users`, `/products`) for consistency
- **Nested Resources**: Limit nesting depth to 2-3 levels maximum to keep URLs readable and maintainable
- **Query Parameters**: Use query parameters for filtering, sorting, pagination, and search rather than creating separate endpoints
- **HTTP Status Codes**: Return appropriate, consistent HTTP status codes that accurately reflect the response (200, 201, 400, 404, 500, etc.)
- **Rate Limiting Headers**: Include rate limit information in response headers to help clients manage their usage

## Supabase Project Initialization (Dev 3)

1. Install Supabase CLI and @supabase/supabase-js
2. Create new Supabase project for Marvin AR
3. Configure environment variables: SUPABASE_URL, SUPABASE_ANON_KEY
4. **NEW ARCHITECTURE:** For hackathon demo, Spectacles Lens will access Supabase directly, bypassing Snap Cloud. Hardcode SUPABASE_URL and SUPABASE_ANON_KEY in AR client for demo. Use experimental API endpoints if required.
5. Share project URL and keys securely with team
6. Set up local development environment

### Supabase Client Example

```typescript
import { createClient } from "@supabase/supabase-js";

// For hackathon demo, hardcode Supabase URL and token for direct Spectacles Lens access
const supabaseUrl = "https://your-project.supabase.co"; // Replace with actual project URL
const supabaseAnonKey = "your-anon-key"; // Replace with actual anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Supabase Foundation Setup (Dev 3 Phase 1)

// 1.3 Set up Supabase foundation
// - Initialize Supabase project and configure local development environment
// - Set up database schema for object interactions, user profiles, and learning data
// - Configure Row Level Security policies for data access
// - Create health check functions and test database connectivity
// - NEW ARCHITECTURE: Supabase is accessed directly from Spectacles Lens, bypassing Snap Cloud. Use hardcoded Supabase URL/token and experimental API for direct AR client integration.

// 1.6 Create object interaction database schema
// - Design tables for object_interactions, user_preferences, and learning_data
// - Implement Row Level Security for user data isolation
// - Create database functions for interaction logging and pattern analysis
// - Set up real-time subscriptions for object state changes

// 1.10 Create AI coordination Edge Functions
// - Create Edge Function for processing Gemini API requests with visual context
// - Implement request queuing and priority handling for different object types
// - Set up response caching in Supabase storage for common scenarios
// - Configure CORS and authentication for Edge Function access
// - NEW ARCHITECTURE: Edge Functions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

// 1.13 Build voice Edge Functions
// - Create Edge Function for ElevenLabs text-to-speech processing
// - Implement Supabase Realtime for voice conversation state
// - Set up audio response caching in Supabase Storage
// - Create fallback system with pre-recorded audio files
// - NEW ARCHITECTURE: Voice Edge Functions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

// Example: Supabase client for direct AR integration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co' // Replace with actual project URL
const supabaseAnonKey = 'your-anon-key' // Replace with actual anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Example: Row Level Security policy for user data isolation
-- SQL (run via Supabase CLI or dashboard)
CREATE POLICY "User can access own interactions" ON object_interactions
FOR SELECT USING (auth.uid() = user_id);

// Example: Edge Function stub for Gemini API coordination
// snap-cloud/supabase/functions/ai-coordination/index.ts
export default async function handleGeminiRequest(req, res) {
// Validate Supabase token from Spectacles Lens
// Process visual context and queue Gemini API request
// Cache response in Supabase Storage
// ...existing code...
}

// Example: Edge Function stub for ElevenLabs voice synthesis
// snap-cloud/supabase/functions/voice-synthesis/index.ts
export default async function handleVoiceRequest(req, res) {
// Validate Supabase token from Spectacles Lens
// Process text-to-speech request
// Cache audio response in Supabase Storage
// ...existing code...
}

## Supabase Core Feature Schemas & Edge Functions (Dev 3 Phase 2)

// 2.3 Create health data schema and Edge Functions
-- SQL: Health tables
CREATE TABLE IF NOT EXISTS medication_schedules (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
medication_name TEXT NOT NULL,
scheduled_time TIMESTAMP NOT NULL,
dosage TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS health_reminders (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
medication_id INTEGER REFERENCES medication_schedules(id),
reminder_time TIMESTAMP NOT NULL,
status TEXT DEFAULT 'pending',
created_at TIMESTAMP DEFAULT NOW()
);
-- RLS for sensitive health data
CREATE POLICY "User can access own health data" ON medication_schedules
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can access own reminders" ON health_reminders
FOR SELECT USING (auth.uid() = user_id);

// 2.6 Create nutrition tracking schema
CREATE TABLE IF NOT EXISTS food_logs (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
food_name TEXT NOT NULL,
calories INTEGER,
protein INTEGER,
carbs INTEGER,
fat INTEGER,
meal_time TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS nutrition_analysis (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
log_id INTEGER REFERENCES food_logs(id),
nutrition_score INTEGER,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE POLICY "User can access own food logs" ON food_logs
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can access own nutrition analysis" ON nutrition_analysis
FOR SELECT USING (auth.uid() = user_id);

// 2.9 Create calendar integration Edge Functions
CREATE TABLE IF NOT EXISTS calendar_events (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
event_title TEXT NOT NULL,
event_time TIMESTAMP NOT NULL,
location TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS meeting_prep (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
event_id INTEGER REFERENCES calendar_events(id),
prep_notes TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE POLICY "User can access own calendar events" ON calendar_events
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can access own meeting prep" ON meeting_prep
FOR SELECT USING (auth.uid() = user_id);

// 2.12 Create location tracking schema
CREATE TABLE IF NOT EXISTS object_locations (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
object_type TEXT NOT NULL,
position JSONB NOT NULL,
last_seen TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS spatial_memory (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
object_id INTEGER REFERENCES object_locations(id),
memory_strength INTEGER,
decay_rate INTEGER,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE POLICY "User can access own object locations" ON object_locations
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can access own spatial memory" ON spatial_memory
FOR SELECT USING (auth.uid() = user_id);

// 2.14 Create learning coordination schema
CREATE TABLE IF NOT EXISTS user_interactions (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
interaction_type TEXT NOT NULL,
object_type TEXT,
timestamp TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS learning_patterns (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
pattern_type TEXT NOT NULL,
pattern_data JSONB,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE POLICY "User can access own interactions" ON user_interactions
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can access own learning patterns" ON learning_patterns
FOR SELECT USING (auth.uid() = user_id);

// Edge Function stubs for direct Spectacles Lens integration
// snap-cloud/supabase/functions/health-reminder/index.ts
export default async function handleHealthReminder(req, res) {
// Validate Supabase token from Spectacles Lens
// Process medication timing and notifications
// ...existing code...
}
// snap-cloud/supabase/functions/nutrition/index.ts
export default async function handleNutrition(req, res) {
// Validate Supabase token from Spectacles Lens
// Process nutrition data and scoring
// ...existing code...
}
// snap-cloud/supabase/functions/calendar-sync/index.ts
export default async function handleCalendarSync(req, res) {
// Validate Supabase token from Spectacles Lens
// Sync calendar events and meeting prep
// ...existing code...
}
// snap-cloud/supabase/functions/location-tracking/index.ts
export default async function handleLocationTracking(req, res) {
// Validate Supabase token from Spectacles Lens
// Update/query object locations and spatial memory
// ...existing code...
}
// snap-cloud/supabase/functions/learning/index.ts
export default async function handleLearning(req, res) {
// Validate Supabase token from Spectacles Lens
// Analyze interactions and update learning patterns
// ...existing code...
}

// snap-cloud/supabase/functions/device-presence/index.ts
export default async function handleDevicePresence(req, res) {
// Validate Supabase token from Spectacles Lens
// Update device_presence table: device_id, device_type, status, last_seen
// Handle online/offline transitions and notify relevant channels
// Enforce user isolation via RLS
// ...existing code...
}

// 3.1 Device presence and sync schema (Dev 3 Phase 3)
CREATE TABLE IF NOT EXISTS device_presence (
id SERIAL PRIMARY KEY,
user_id UUID NOT NULL,
device_id TEXT NOT NULL,
device_type TEXT NOT NULL, -- 'ar', 'web', 'phone', etc.
status TEXT NOT NULL DEFAULT 'online', -- 'online', 'offline', 'away'
last_seen TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE POLICY "User can access own device presence" ON device_presence
FOR SELECT USING (auth.uid() = user_id);
