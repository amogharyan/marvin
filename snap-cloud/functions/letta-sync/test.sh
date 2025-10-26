#!/usr/bin/env bash
# Simple test script to POST to the local letta-sync function

set -euo pipefail

URL=${LETTAS_LOCAL_URL:-http://127.0.0.1:54321/functions/v1/letta-sync}

echo "Posting test payload to $URL"

curl -sS -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"demo-user","payload":{"action":"sync_memory","data":{"note":"test from local"}}}' | jq .
#!/usr/bin/env bash
# Simple test script to POST to local letta-sync function
set -euo pipefail

ENDPOINT="http://localhost:54321/functions/v1/letta-sync"

curl -s -X POST "$ENDPOINT" \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"demo_user","payload":{"text":"hello from test"},"object_type":"medicine"}' | jq
