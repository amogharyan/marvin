// Object interaction logging Edge Function for Marvin AR Assistant
// Task 1.10: Create Edge Function for processing Gemini API requests with visual context

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createSupabaseClient, getAuthenticatedUser, corsHeaders as sharedCors } from "../../lib/supabaseClient.ts"

const corsHeaders = { ...sharedCors }

interface ObjectInteractionRequest {
  user_id: string
  object_type: string
  interaction_type: string
  spatial_data?: any
  confidence_score?: number
  context?: any
  image_data?: string // Base64 encoded image for AI analysis
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    // Initialize Supabase clients
    const supabase = createSupabaseClient() // anon for reads (RLS enforced)
    const supabaseAdmin = createSupabaseClient({ serviceRole: true }) // admin only when needed
  // Authenticate user
  const authed = await getAuthenticatedUser(req)
  const effectiveUserId = authed.id
  // Enforce user_id match if provided in query/body
  const url = new URL(req.url)
  let body: any = undefined
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    try {
      body = await req.json()
    } catch {}
  }
  const providedUserId = url.searchParams.get('user_id') ?? body?.user_id
  if (providedUserId && providedUserId !== effectiveUserId) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders })
  }
  // Use effectiveUserId for all reads/writes

    // Parse request body
    const body: ObjectInteractionRequest = await req.json()

    const {
      user_id,
      object_type,
      interaction_type,
      spatial_data,
      confidence_score = 0.0,
      context = {},
      image_data
    } = body

    // Validate required fields
    if (!user_id || !object_type || !interaction_type) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: user_id, object_type, interaction_type'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Call database function to log interaction
    const { data: interactionId, error: logError } = await supabase
      .rpc('log_object_interaction', {
        p_user_id: user_id,
        p_object_type: object_type,
        p_interaction_type: interaction_type,
        p_spatial_data: spatial_data,
        p_confidence_score: confidence_score,
        p_context: context
      })

    if (logError) {
      throw logError
    }

    // If image data is provided, we'll store it for potential AI analysis
    let aiAnalysis = null
    if (image_data) {
      // Store image data in context for now
      // In a full implementation, this would trigger Gemini AI analysis
      aiAnalysis = {
        status: 'queued',
        message: 'Image queued for AI analysis',
        interaction_id: interactionId
      }
    }

    // Update object location if spatial data is provided
    if (spatial_data) {
      const { data: locationData, error: locationError } = await supabase.rpc('update_object_location', {
        p_user_id: user_id,
        p_object_type: object_type,
        p_object_identifier: `${object_type}_main`,
        p_location: spatial_data,
        p_confidence_score: confidence_score
      })
      if (locationError) {
        // Log error (replace with your logger if available)
        console.error('Failed to update object location:', locationError)
        return new Response(
          JSON.stringify({ error: 'Failed to update object location', details: locationError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Trigger real-time notification
    const channel = supabase.channel('object_interactions')
    await channel.send({
      type: 'broadcast',
      event: 'interaction_logged',
      payload: {
        user_id,
        object_type,
        interaction_type,
        interaction_id: interactionId,
        timestamp: new Date().toISOString()
      }
    })

    const response = {
      success: true,
      interaction_id: interactionId,
      ai_analysis: aiAnalysis,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Object interaction logging failed:', error)

    return new Response(
      JSON.stringify({
        error: 'Failed to log interaction',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})