// Single-file Deno Edge Function for Letta sync.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const LETTA_API_KEY = Deno.env.get("LETTA_API_KEY");
const LETTA_API_URL = Deno.env.get("LETTA_API_URL") ?? "https://api.letta.example/v1/sync";

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200 });
    if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });

    const body = await req.json().catch(() => null);
    if (!body) return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });

    const user_id = body.user_id ?? null;
    const payload = body.payload ?? body.user_context ?? body;
    const object_type = body.object_type ?? null;

    // Call Letta API if configured, otherwise return a mock response
    let lettaResponse: any;
    if (LETTA_API_KEY) {
      try {
        const r = await fetch(LETTA_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LETTA_API_KEY}`,
          },
          body: JSON.stringify({ input: payload, user_id }),
        });
        lettaResponse = await r.json().catch(() => ({ status: r.status, ok: r.ok }));
      } catch (err) {
        console.error("Letta request failed:", err);
        lettaResponse = { error: "Letta_call_failed", message: String(err) };
      }
    } else {
      // Mock fallback when LETTA API key is not provided — safe for local testing
      lettaResponse = {
        mock: true,
        text: `Mock Letta response for payload: ${String(payload).slice(0, 200)}`,
        ts: new Date().toISOString(),
      };
    }

    // Try to persist the interaction to the DB (best-effort; failures are non-blocking)
    let dbResult: any = null;
    let dbError: string | null = null;
    if (supabase) {
      try {
        const insert = {
          user_id: user_id,
          object_type: object_type,
          user_context: payload ? JSON.stringify(payload) : null,
          ai_response: JSON.stringify(lettaResponse),
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase.from("object_interactions").insert(insert).select();
        if (error) {
          dbError = error.message ?? String(error);
          console.warn("DB insert warning:", dbError);
        } else {
          dbResult = data;
        }
      } catch (err) {
        dbError = String(err);
        console.error("DB insert failed:", err);
      }
    }

    const resp = {
      success: true,
      letta: lettaResponse,
      db: dbResult ? { inserted: true, rows: dbResult } : dbError ? { inserted: false, error: dbError } : { note: "no-db-config" },
    };

    return new Response(JSON.stringify(resp), { headers: { "Content-Type": "application/json" }, status: 200 });
  } catch (err) {
    console.error("Unhandled error in letta-sync:", err);
    return new Response(JSON.stringify({ error: "internal", message: String(err) }), { status: 500 });
  }
});
