// Object interaction logging Edge Function
// Handles AR object detection events and spatial data

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ObjectInteractionRequest {
  user_id: string
  object_type: string // 'medicine', 'bowl', 'laptop', 'keys', 'phone'
  interaction_type: string // 'detected', 'picked_up', 'put_down', 'focused'
  spatial_data?: {
    position: { x: number, y: number, z: number }
    rotation: { x: number, y: number, z: number, w: number }
    scale: { x: number, y: number, z: number }
  }
  confidence_score?: number
  context?: any
  session_id?: string
  object_identifier?: string // Optional: unique identifier for this object instance. If absent, will be generated from position+object_type or position+timestamp.
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      user_id,
      object_type,
      interaction_type,
      spatial_data,
      confidence_score = 0.0,
      context = {},
      session_id
      object_identifier
    }: ObjectInteractionRequest = await req.json()

    if (!user_id || !object_type || !interaction_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, object_type, interaction_type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log the interaction using the database function
    const { data, error } = await supabase.rpc('log_object_interaction', {
          p_user_id: user_id,
          p_object_type: object_type,
          p_interaction_type: interaction_type,
          p_spatial_data: spatial_data,
          p_confidence_score: confidence_score,
          p_context: context,
          p_session_id: session_id,
          p_object_identifier: object_identifier
    })

    if (error) {
      throw error
    }

    // Update object location if spatial data is provided
    if (spatial_data && spatial_data.position) {
      // Use provided object_identifier, or generate one deterministically
      let objectId = object_identifier;
      if (!objectId) {
        // Deterministic: hash of position+object_type+timestamp
        const pos = spatial_data.position;
        const base = `${object_type}:${pos.x},${pos.y},${pos.z}`;
        // Optionally add timestamp for uniqueness if available
        const ts = context?.timestamp || Date.now();
        objectId = base + ':' + ts;
      }
      await supabase.rpc('update_object_location', {
        p_user_id: user_id,
        p_object_type: object_type,
        p_object_identifier: objectId,
        p_location: spatial_data,
        p_confidence_score: confidence_score
      })
    }

    // Trigger pattern analysis for frequent interactions
    if (Math.random() < 0.1) { // 10% chance to trigger analysis
      try {
        const { data: patterns } = await supabase.rpc('analyze_interaction_patterns', {
          p_user_id: user_id
        })

        if (patterns && patterns.length > 0) {
          // Update user preferences based on patterns
          await supabase.rpc('update_user_preferences', {
            p_user_id: user_id
          })
        }
      } catch (patternError) {
        console.error('Pattern analysis failed:', patternError)
        // Don't fail the main request for analysis errors
      }
    }

    return new Response(
      // Real-time broadcast (pattern from location-tracking)
      try {
        const broadcastPayload = {
          interaction_id: data,
          object_id: objectId,
          user_id: user_id ?? null,
          timestamp: new Date().toISOString()
        };
        const { error: broadcastError } = await supabaseAdmin
          .channel('object_interactions')
          .send({
            type: 'broadcast',
            event: 'object-interaction',
            payload: broadcastPayload
          });
        if (broadcastError) {
          console.warn('[object-interaction-log] Realtime broadcast error:', broadcastError);
        }
      } catch (err) {
        console.warn('[object-interaction-log] Realtime broadcast exception:', err);
      }
      return new Response(
        JSON.stringify({
          success: true,
          interaction_id: data,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

  } catch (error) {
    console.error('Object interaction logging error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to log object interaction',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})