// AI coordination Edge Function for Marvin AR Assistant
// Task 1.10: Create Edge Function for processing Gemini API requests with visual context

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  user_id: string
  request_type: string // 'visual_analysis', 'context_query', 'suggestion'
  image_data?: string // Base64 encoded image
  text_prompt?: string
  context?: any
  priority?: 'low' | 'medium' | 'high'
}

interface CachedResponse {
  id: string
  response_data: any
  created_at: string
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const body: AIRequest = await req.json()

    const {
      user_id,
      request_type,
      image_data,
      text_prompt,
      context = {},
      priority = 'medium'
    } = body

    // Validate required fields
    if (!user_id || !request_type) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: user_id, request_type'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for cached responses first (for common scenarios)
    const cacheKey = `${request_type}_${JSON.stringify({ text_prompt, image_data: image_data?.substring(0, 100) })}`

    const { data: cachedData } = await supabase
      .from('user_interactions')
      .select('response_data, created_at')
      .eq('user_id', user_id)
      .eq('interaction_type', request_type)
      .ilike('input_data->text_prompt', text_prompt || '')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })
      .limit(1)

    // If we have a recent cached response, return it
    if (cachedData && cachedData.length > 0) {
      const cachedResponse = cachedData[0]

      return new Response(
        JSON.stringify({
          success: true,
          response: cachedResponse.response_data,
          cached: true,
          timestamp: new Date().toISOString(),
          cache_age: new Date().getTime() - new Date(cachedResponse.created_at).getTime()
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      )
    }

    // Queue request for AI processing (mock implementation)
    // In a full implementation, this would integrate with Gemini API
    let aiResponse: any = {}

    switch (request_type) {
      case 'visual_analysis':
        aiResponse = {
          analysis: 'Mock visual analysis result',
          objects_detected: ['medicine', 'bowl'],
          confidence_scores: { medicine: 0.95, bowl: 0.87 },
          recommendations: ['Take your morning medication', 'Consider a healthy breakfast']
        }
        break

      case 'context_query':
        aiResponse = {
          answer: 'Mock contextual response',
          confidence: 0.9,
          sources: ['user_patterns', 'schedule_data']
        }
        break

      case 'suggestion':
        aiResponse = {
          suggestions: [
            'Based on your routine, it\'s time to take your medication',
            'Your calendar shows a meeting in 30 minutes'
          ],
          priority: priority,
          type: 'proactive'
        }
        break

      default:
        aiResponse = {
          error: 'Unknown request type',
          supported_types: ['visual_analysis', 'context_query', 'suggestion']
        }
    }

    // Store the interaction and response
    const { data: interactionId, error: insertError } = await supabase
      .from('user_interactions')
      .insert({
        user_id,
        interaction_type: request_type,
        input_data: {
          text_prompt,
          context,
          has_image: !!image_data
        },
        response_data: aiResponse,
        context: {
          priority,
          processing_time: Math.random() * 200 + 50 // Mock processing time
        }
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to store interaction:', insertError)
    }

    // Add response caching in Supabase Storage for binary data if needed
    if (image_data && image_data.length > 1000) {
      // In a full implementation, store large images in Supabase Storage
      console.log('Large image data detected, would store in Supabase Storage')
    }

    // Trigger real-time notification for AI response
    const channel = supabase.channel('ai_responses')
    await channel.send({
      type: 'broadcast',
      event: 'ai_response_ready',
      payload: {
        user_id,
        request_type,
        interaction_id: interactionId?.id,
        priority,
        timestamp: new Date().toISOString()
      }
    })

    const response = {
      success: true,
      response: aiResponse,
      interaction_id: interactionId?.id,
      cached: false,
      processing_time: Math.random() * 200 + 50,
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
    console.error('AI coordination failed:', error)

    return new Response(
      JSON.stringify({
        error: 'AI processing failed',
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