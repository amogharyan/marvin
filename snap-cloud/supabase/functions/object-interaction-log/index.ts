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
      p_session_id: session_id
    })

    if (error) {
      throw error
    }

    // Update object location if spatial data is provided
    if (spatial_data && spatial_data.position) {
      await supabase.rpc('update_object_location', {
        p_user_id: user_id,
        p_object_type: object_type,
        p_object_identifier: 'default',
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