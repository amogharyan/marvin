# Letta Sync Edge Function

Purpose
- Simple Supabase Edge Function to forward payloads to Letta (if a LETTA_API_KEY is present) and persist the AI response to the `object_interactions` table.

Local testing
1. From the repository root run the local Supabase stack (already running for Phase 0 work):

```bash
cd snap-cloud
supabase start
```

2. Serve the function locally (this will use the runtime Deno):

```bash
cd snap-cloud/functions/letta-sync
supabase functions serve --no-verify-jwt
```

3. In another terminal post a payload (see `test.sh`):

```bash
./test.sh
```

Environment
- `LETTA_API_KEY` (optional) — when set the function will attempt a real Letta call. If not set the function returns a mock response suitable for local testing.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (optional) — when set the function will attempt to insert a row into `object_interactions`. If not set the function will still return a mock/Letta response but skip DB writes.

Notes
- This function is intentionally defensive: failures to call Letta or write to the DB are logged but do not cause the function to return an error (so the demo flow remains robust).
# Letta Sync Edge Function

Purpose
- Lightweight Supabase Edge Function to call the Letta API (or return a mock response for local testing) and record the AI response.

Env variables (local)
- `SUPABASE_URL` - local Supabase URL (e.g., from `supabase start` output)
- `SUPABASE_SERVICE_ROLE_KEY` - service_role key for DB writes (keep secret)
- `LETTA_API_KEY` - (optional) your Letta API key. If omitted, function returns a mock response.
- `LETTA_API_URL` - (optional) Letta API endpoint to POST to when `LETTA_API_KEY` is present.

How to run locally
1. In `snap-cloud/` create a `.env.local` (do NOT commit) with the variables above.
2. Start local Supabase stack if not already running:

```bash
cd /Users/IshrithG/marvin/snap-cloud
supabase start
```

3. Serve functions locally (this will host functions at `http://localhost:54321/functions/v1` by default):

```bash
cd /Users/IshrithG/marvin/snap-cloud
supabase functions serve --env-file .env.local --no-verify-jwt
```

4. Test with curl (example):

```bash
curl -X POST 'http://localhost:54321/functions/v1/letta-sync' \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"demo_user","payload":{"text":"hello"},"object_type":"medicine"}'
```

Notes
- The function will attempt to insert into `object_interactions` table if `SUPABASE_SERVICE_ROLE_KEY` is provided; DB insert failures are non-blocking and logged in the function output.
