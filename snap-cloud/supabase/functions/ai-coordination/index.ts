// Task 1.10: Create AI coordination Edge Functions
// Create Edge Function for processing Gemini API requests with visual context
// Implement request queuing and priority handling for different object types
// Set up response caching in Supabase storage for common scenarios

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

interface AIResponse {
  response: string
  confidence: number
  cached: boolean
  processing_time: number
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

    const { user_id, request_type, image_data, text_prompt, context, priority = 'medium' }: AIRequest = await req.json()

    if (!user_id || !request_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, request_type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const startTime = Date.now()

    // Generate cache key based on request parameters
    const cacheKey = await generateCacheKey(request_type, text_prompt, image_data)

    // Check for cached response first
    const cachedResponse = await getCachedResponse(supabase, cacheKey)
    if (cachedResponse) {
      return new Response(
        JSON.stringify({
          ...cachedResponse,
          cached: true,
          processing_time: Date.now() - startTime
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Add request to queue with priority
    const queueId = await addToQueue(supabase, {
      user_id,
      request_type,
      priority,
      created_at: new Date().toISOString()
    })

    // Process AI request based on type
    let aiResponse: string
    let confidence: number

    switch (request_type) {
      case 'visual_analysis':
        if (!image_data) {
          throw new Error('Image data required for visual analysis')
        }
        const analysisResult = await processVisualAnalysis(image_data, text_prompt)
        aiResponse = analysisResult.response
        confidence = analysisResult.confidence
        break

      case 'context_query':
        const contextResult = await processContextQuery(supabase, user_id, text_prompt, context)
        aiResponse = contextResult.response
        confidence = contextResult.confidence
        break

      case 'suggestion':
        const suggestionResult = await generateSuggestion(supabase, user_id, context)
        aiResponse = suggestionResult.response
        confidence = suggestionResult.confidence
        break

      default:
        throw new Error(`Unknown request type: ${request_type}`)
    }

    // Cache the response for future use
    await cacheResponse(supabase, cacheKey, { response: aiResponse, confidence })

    // Remove from queue
    await removeFromQueue(supabase, queueId)

    // Log interaction for learning
    await logInteraction(supabase, user_id, {
      request_type,
      text_prompt,
      ai_response: aiResponse,
      confidence,
      context
    })

    const response: AIResponse = {
      response: aiResponse,
      confidence,
      cached: false,
      processing_time: Date.now() - startTime
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('AI coordination error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateCacheKey(requestType: string, textPrompt?: string, imageData?: string): Promise<string> {
  const data = `${requestType}:${textPrompt || ''}:${imageData ? 'image_hash' : 'no_image'}`
  const encoder = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function getCachedResponse(supabase: any, cacheKey: string) {
  try {
    const { data } = await supabase.storage
      .from('voice-cache')
      .download(`ai-responses/${cacheKey}.json`)

    if (data) {
      const text = await data.text()
      return JSON.parse(text)
    }
  } catch (error) {
    // Cache miss is normal
  }
  return null
}

async function cacheResponse(supabase: any, cacheKey: string, response: any) {
  try {
    const responseData = JSON.stringify(response)
    await supabase.storage
      .from('voice-cache')
      .upload(`ai-responses/${cacheKey}.json`, responseData, {
        contentType: 'application/json',
        upsert: true
      })
  } catch (error) {
    console.error('Failed to cache response:', error)
  }
}

async function addToQueue(supabase: any, request: any): Promise<string> {
  // Simple in-memory queue for demo - in production would use proper queue
  return crypto.randomUUID()
}

async function removeFromQueue(supabase: any, queueId: string) {
  // Remove from queue - implementation depends on queue system
}

async function processVisualAnalysis(imageData: string, prompt?: string): Promise<{response: string, confidence: number}> {
  // Mock implementation - in production would call Gemini Vision API
  return {
    response: `Visual analysis of the image shows: ${prompt ? `Regarding "${prompt}":` : ''} This appears to be a morning routine object that could benefit from reminders or suggestions.`,
    confidence: 0.85
  }
}

async function processContextQuery(supabase: any, userId: string, prompt?: string, context?: any): Promise<{response: string, confidence: number}> {
  try {
    // Get recent interactions for context
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('content, ai_response, context')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const contextInfo = interactions?.map(i => i.content).join(' ') || ''

    return {
      response: `Based on your recent interactions: ${contextInfo}. For your question "${prompt}": I recommend checking your morning routine and making sure you've taken care of your health needs.`,
      confidence: 0.78
    }
  } catch (error) {
    return {
      response: `I understand you're asking about "${prompt}". Let me help you with your morning routine.`,
      confidence: 0.65
    }
  }
}

async function generateSuggestion(supabase: any, userId: string, context?: any): Promise<{response: string, confidence: number}> {
  try {
    // Get user preferences and patterns
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences, morning_routine')
      .eq('user_id', userId)
      .single()

    const suggestions = [
      "Don't forget to take your morning medication!",
      "Your breakfast looks nutritious - great choice!",
      "Remember to grab your keys before heading out.",
      "Check your calendar for today's meetings.",
      "Stay hydrated throughout the day!"
    ]

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]

    return {
      response: randomSuggestion,
      confidence: 0.72
    }
  } catch (error) {
    return {
      response: "Have a great morning! Remember to take care of yourself.",
      confidence: 0.60
    }
  }
}

async function logInteraction(supabase: any, userId: string, interaction: any) {
  try {
    await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        interaction_type: 'ai_coordination',
        content: interaction.text_prompt,
        ai_response: interaction.ai_response,
        context: interaction.context
      })
  } catch (error) {
    console.error('Failed to log interaction:', error)
  }
}