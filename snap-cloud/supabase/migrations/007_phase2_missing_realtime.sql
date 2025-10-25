-- Real-time subscriptions for Phase 2 missing tables

-- Enable real-time for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_prep;
ALTER PUBLICATION supabase_realtime ADD TABLE nutrition_analysis;
ALTER PUBLICATION supabase_realtime ADD TABLE spatial_memory;