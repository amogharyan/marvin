-- Create a table to publish learning updates reliably via Postgres NOTIFY
-- This avoids using client channel.send() from Edge Functions which can race/timeout.

CREATE TABLE IF NOT EXISTS learning_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add to publication so Supabase Realtime will include it
ALTER PUBLICATION supabase_realtime ADD TABLE learning_notifications;

-- Trigger function to emit a channel-specific notify for subscribers
CREATE OR REPLACE FUNCTION notify_learning_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'learning_update_' || COALESCE(NEW.user_id::text, 'public'),
    json_build_object(
      'type', 'learning_update',
      'data', row_to_json(NEW)
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_learning_update
  AFTER INSERT ON learning_notifications
  FOR EACH ROW EXECUTE FUNCTION notify_learning_update();

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_learning_notifications_user_id ON learning_notifications(user_id, created_at DESC);
