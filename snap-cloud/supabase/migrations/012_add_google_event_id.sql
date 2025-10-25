-- Add google_event_id column and unique constraint for calendar_events
ALTER TABLE calendar_events ADD COLUMN google_event_id TEXT;

-- Add unique constraint for user_id + google_event_id
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_user_event_unique UNIQUE (user_id, google_event_id);
