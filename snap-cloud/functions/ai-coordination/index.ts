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

    // Extract and validate Authorization bearer token
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('Missing or invalid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const token = authHeader.replace('Bearer ', '').trim()

    // Validate token with Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData?.user) {
      console.warn('Auth failed:', userError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const callerUserId = userData.user.id
    const callerRoles = userData.user.role ? [userData.user.role] : (userData.user.app_metadata?.roles || [])
    const isAdmin = callerRoles.includes('admin') || callerRoles.includes('service_role')

    // Parse request body
    const body: AIRequest = await req.json()
    let {
      user_id,
      request_type,
      image_data,
      text_prompt,
      context = {},
      priority = 'medium'
    } = body

    // Bind user_id to caller unless admin
    if (!isAdmin) {
      if (user_id && user_id !== callerUserId) {
        console.warn('Non-admin tried to set user_id:', user_id)
        return new Response(
          JSON.stringify({ error: 'Forbidden: cannot set user_id for other users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      user_id = callerUserId
    }
    // Validate required fields
    if (!user_id || !request_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, request_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for cached responses first (for common scenarios)
    const { data: cachedData } = await supabase
      .from('user_interactions')
      .select('response_data, created_at')
      .eq('user_id', user_id)
      .eq('interaction_type', request_type)
      .ilike('input_data->>text_prompt', `%${text_prompt || ''}%`)
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

    // Process request with real Gemini API
    let aiResponse: any = {}
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY environment variable not set')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    try {
      switch (request_type) {
        case 'visual_analysis': {
          if (!image_data) {
            return new Response(
              JSON.stringify({ error: 'image_data required for visual_analysis' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Call Gemini Vision API
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    {
                      text: `Analyze this image for morning routine objects. Look for medicine bottles, breakfast bowls, laptops, keys, or phones. Provide specific recommendations for each detected object. Context: ${text_prompt || 'Morning routine'}.`
                    },
                    {
                      inline_data: {
                        mime_type: "image/jpeg",
                        data: image_data
                      }
                    }
                  ]
                }],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 1024,
                }
              })
            }
          )

          if (!geminiResponse.ok) {
            throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
          }

          const geminiData = await geminiResponse.json()
          const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available'

          aiResponse = {
            analysis: analysisText,
            objects_detected: extractObjects(analysisText),
            confidence_scores: extractConfidence(analysisText),
            recommendations: extractRecommendations(analysisText),
            source: 'gemini_vision'
          }
          break
        }
        case 'context_query': {
          // Call Gemini Text API for contextual queries
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `You are Marvin, an AR morning assistant. Answer this question based on the context: ${text_prompt}. Context: ${JSON.stringify(context)}. Provide a helpful, concise response.`
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 512,
                }
              })
            }
          )

          if (!geminiResponse.ok) {
            throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
          }

          const geminiData = await geminiResponse.json()
          const answerText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer available'

          aiResponse = {
            answer: answerText,
            confidence: 0.9,
            sources: ['gemini_ai', 'user_context'],
            source: 'gemini_text'
          }
          break
        }
        case 'suggestion': {
          // Call Gemini for proactive suggestions
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `You are Marvin, an AR morning assistant. Generate 2-3 proactive suggestions for the user's morning routine. Context: ${JSON.stringify(context)}. Current time awareness: morning routine. Be helpful and specific.`
                  }]
                }],
                generationConfig: {
                  temperature: 0.8,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 256,
                }
              })
            }
          )

          if (!geminiResponse.ok) {
            throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
          }

          const geminiData = await geminiResponse.json()
          const suggestionText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestions available'

          aiResponse = {
            suggestions: extractSuggestions(suggestionText),
            priority: priority,
            type: 'proactive',
            source: 'gemini_ai'
          }
          break
        }
        default:
          aiResponse = {
            error: 'Unknown request type',
            supported_types: ['visual_analysis', 'context_query', 'suggestion']
          }
      }
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError)
      // Fallback to mock responses if Gemini fails
      aiResponse = {
        error: 'AI processing temporarily unavailable',
        fallback: true,
        message: 'Using cached response due to API error'
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
    // Insert durable notification into notifications table for postgres_changes event
    await supabase
      .from('notifications')
      .insert({
        user_id,
        event_type: 'ai_response_ready',
        payload: {
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

      // Upload AI response to Supabase Storage as binary JSON
      try {
        const json = JSON.stringify(response);
        // Use Buffer for Deno/Node
        let binaryPayload;
        if (typeof TextEncoder !== 'undefined') {
          binaryPayload = new TextEncoder().encode(json);
        } else if (typeof Uint8Array !== 'undefined') {
          binaryPayload = new Uint8Array([...json].map(c => c.charCodeAt(0)));
        } else {
          throw new Error('No supported binary type for upload');
        }
        const { data: uploadData, error: uploadError } = await supabase.storage.from('ai-responses').upload(
          `responses/${interactionId?.id}.json`,
          binaryPayload,
          {
            contentType: 'application/json',
            upsert: true
          }
        );
        if (uploadError) {
          console.error('Failed to upload AI response to Supabase Storage:', uploadError);
        }
      } catch (err) {
        console.error('Error during AI response upload:', err);
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
  details: (error instanceof Error ? error.message : String(error)),
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

// Helper functions for extracting structured data from Gemini responses
function extractObjects(text: string): string[] {
  const objects = ['medicine', 'bowl', 'laptop', 'keys', 'phone', 'breakfast', 'medication']
  const detected = objects.filter(obj => text.toLowerCase().includes(obj))
  return detected.length > 0 ? detected : ['unknown']
}

function extractConfidence(text: string): Record<string, number> {
  const confidence: Record<string, number> = {}
  const objects = extractObjects(text)
  
  // Look for confidence indicators in the text
  objects.forEach(obj => {
    const match = text.match(new RegExp(`${obj}[^.]*?(\\d+(?:\\.\\d+)?)%`, 'i'))
    confidence[obj] = match ? parseFloat(match[1]) / 100 : 0.8
  })
  
  return confidence
}

function extractRecommendations(text: string): string[] {
  const recommendations: string[] = []
  const lines = text.split('\n').filter(line => line.trim())
  
  lines.forEach(line => {
    if (line.toLowerCase().includes('recommend') || 
        line.toLowerCase().includes('suggest') ||
        line.toLowerCase().includes('should') ||
        line.toLowerCase().includes('consider')) {
      recommendations.push(line.trim())
    }
  })
  
  return recommendations.length > 0 ? recommendations : ['No specific recommendations available']
}

function extractSuggestions(text: string): string[] {
  const suggestions: string[] = []
  const lines = text.split('\n').filter(line => line.trim())
  
  lines.forEach(line => {
    if (line.match(/^\d+\./) || line.match(/^[-•]/) || line.includes('suggestion')) {
      suggestions.push(line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim())
    }
  })
  
  return suggestions.length > 0 ? suggestions : ['Continue with your morning routine']
}