// Task 3.2: Connect AI services to Supabase
// Wire Gemini responses to Supabase Edge Functions
// Implement voice synthesis coordination through Supabase Realtime
// Add Chroma learning integration with Supabase storage

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface AICoordinationRequest {
  user_id: string
  action: 'process_vision' | 'generate_voice' | 'update_learning' | 'coordinate_response' | 'get_context'
  vision_data?: {
    image_data: string
    detected_objects: any[]
    spatial_context: any
    user_intent?: string
  }
  voice_data?: {
    text_to_synthesize: string
    voice_settings?: any
    priority_level: 'high' | 'medium' | 'low'
  }
  learning_data?: {
    interaction_type: string
    success_metrics: any
    user_feedback?: string
    context_embeddings?: number[]
  }
  context_request?: {
    conversation_history_limit?: number
    include_learning_patterns?: boolean
    object_context?: string
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, serviceKey)
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    })

    const { user_id, action, vision_data, voice_data, learning_data, context_request }: AICoordinationRequest = await req.json()

    const { data: auth, error: authErr } = await supabaseAuth.auth.getUser()
    if (authErr || !auth?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (auth.user.id !== user_id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let result: any

    switch (action) {
      case 'process_vision':
        if (!vision_data) {
          throw new Error('vision_data required for process_vision action')
        }
        result = await processVisionWithGemini(supabaseAdmin, user_id, vision_data)
        break

      case 'generate_voice':
        if (!voice_data) {
          throw new Error('voice_data required for generate_voice action')
        }
        result = await generateVoiceWithElevenLabs(supabaseAdmin, user_id, voice_data)
        break

      case 'update_learning':
        if (!learning_data) {
          throw new Error('learning_data required for update_learning action')
        }
        result = await updateChromaLearning(supabaseAdmin, user_id, learning_data)
        break

      case 'coordinate_response':
        result = await coordinateAIResponse(supabaseAdmin, user_id, vision_data, voice_data, learning_data)
        break

      case 'get_context':
        result = await getConversationContext(supabaseAdmin, user_id, context_request)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        result,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('AI coordination error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process AI coordination request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processVisionWithGemini(supabase: any, userId: string, visionData: any) {
  // Store vision processing request
  const { data: visionRequest } = await supabase
    .from('ai_processing_requests')
    .insert({
      user_id: userId,
      request_type: 'vision_processing',
      input_data: {
        detected_objects: visionData.detected_objects,
        spatial_context: visionData.spatial_context,
        user_intent: visionData.user_intent
      },
      status: 'processing'
    })
    .select()
    .single()

  try {
    // Simulate Gemini API processing (in real implementation, would call actual Gemini API)
    const geminiResponse = await simulateGeminiProcessing(visionData)

    // Store successful response
    await supabase
      .from('ai_processing_requests')
      .update({
        status: 'completed',
        output_data: geminiResponse,
        processing_time_ms: geminiResponse.processing_time
      })
      .eq('id', visionRequest.id)

    // Store conversation context for future reference
    await storeConversationContext(supabase, userId, {
      input_type: 'vision',
      input_data: visionData,
      ai_response: geminiResponse,
      timestamp: new Date().toISOString()
    })

    // Broadcast real-time update for vision processing completion
    const channel = supabase.channel(`ai_${userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'vision_processed',
      payload: {
        request_id: visionRequest.id,
        response: geminiResponse,
        detected_objects: visionData.detected_objects
      }
    })

    return {
      request_id: visionRequest.id,
      gemini_response: geminiResponse,
      objects_analyzed: visionData.detected_objects.length,
      processing_time_ms: geminiResponse.processing_time
    }

  } catch (error) {
    // Store failed request
    await supabase
      .from('ai_processing_requests')
      .update({
        status: 'failed',
        error_details: error.message
      })
      .eq('id', visionRequest.id)

    throw error
  }
}

async function generateVoiceWithElevenLabs(supabase: any, userId: string, voiceData: any) {
  // Store voice synthesis request
  const { data: voiceRequest } = await supabase
    .from('ai_processing_requests')
    .insert({
      user_id: userId,
      request_type: 'voice_synthesis',
      input_data: {
        text: voiceData.text_to_synthesize,
        voice_settings: voiceData.voice_settings,
        priority: voiceData.priority_level
      },
      status: 'processing'
    })
    .select()
    .single()

  try {
    // Check cache first for common phrases
    const { data: cachedAudio } = await supabase
      .from('voice_cache')
      .select('audio_url, audio_duration')
      .eq('text_hash', hashText(voiceData.text_to_synthesize))
      .eq('voice_settings_hash', hashText(JSON.stringify(voiceData.voice_settings || {})))
      .single()

    let audioResult

    if (cachedAudio) {
      // Use cached audio
      audioResult = {
        audio_url: cachedAudio.audio_url,
        audio_duration: cachedAudio.audio_duration,
        from_cache: true,
        processing_time: 50 // Fast cache retrieval
      }
    } else {
      // Simulate ElevenLabs API processing (in real implementation, would call actual ElevenLabs API)
      audioResult = await simulateElevenLabsProcessing(voiceData)

      // Store in cache for future use
      await supabase
        .from('voice_cache')
        .insert({
          text_hash: hashText(voiceData.text_to_synthesize),
          voice_settings_hash: hashText(JSON.stringify(voiceData.voice_settings || {})),
          original_text: voiceData.text_to_synthesize,
          audio_url: audioResult.audio_url,
          audio_duration: audioResult.audio_duration,
          created_by: userId
        })
    }

    // Store successful response
    await supabase
      .from('ai_processing_requests')
      .update({
        status: 'completed',
        output_data: audioResult,
        processing_time_ms: audioResult.processing_time
      })
      .eq('id', voiceRequest.id)

    // Broadcast real-time update for voice synthesis completion
    const channel = supabase.channel(`ai_${userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'voice_synthesized',
      payload: {
        request_id: voiceRequest.id,
        audio_url: audioResult.audio_url,
        duration: audioResult.audio_duration,
        from_cache: audioResult.from_cache
      }
    })

    return {
      request_id: voiceRequest.id,
      audio_url: audioResult.audio_url,
      audio_duration: audioResult.audio_duration,
      from_cache: audioResult.from_cache,
      processing_time_ms: audioResult.processing_time
    }

  } catch (error) {
    // Store failed request
    await supabase
      .from('ai_processing_requests')
      .update({
        status: 'failed',
        error_details: error.message
      })
      .eq('id', voiceRequest.id)

    throw error
  }
}

async function updateChromaLearning(supabase: any, userId: string, learningData: any) {
  // Store learning update request
  const { data: learningRequest } = await supabase
    .from('ai_processing_requests')
    .insert({
      user_id: userId,
      request_type: 'learning_update',
      input_data: learningData,
      status: 'processing'
    })
    .select()
    .single()

  try {
    // Generate embeddings for the interaction context
    const embeddings = learningData.context_embeddings || await generateEmbeddings(learningData)

    // Store in learning patterns table
    const { data: learningPattern } = await supabase
      .from('learning_patterns')
      .insert({
        user_id: userId,
        interaction_type: learningData.interaction_type,
        success_metrics: learningData.success_metrics,
        user_feedback: learningData.user_feedback,
        context_embeddings: embeddings,
        pattern_strength: calculatePatternStrength(learningData.success_metrics)
      })
      .select()
      .single()

    // Update user preferences based on learning
    await updateUserPreferences(supabase, userId, learningData)

    // Store successful response
    await supabase
      .from('ai_processing_requests')
      .update({
        status: 'completed',
        output_data: { pattern_id: learningPattern.id, embeddings_generated: embeddings.length },
        processing_time_ms: 200
      })
      .eq('id', learningRequest.id)

    // Broadcast real-time update for learning update
    const channel = supabase.channel(`ai_${userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'learning_updated',
      payload: {
        pattern_id: learningPattern.id,
        interaction_type: learningData.interaction_type,
        pattern_strength: learningPattern.pattern_strength
      }
    })

    return {
      request_id: learningRequest.id,
      pattern_id: learningPattern.id,
      embeddings_count: embeddings.length,
      pattern_strength: learningPattern.pattern_strength
    }

  } catch (error) {
    // Store failed request
    await supabase
      .from('ai_processing_requests')
      .update({
        status: 'failed',
        error_details: error.message
      })
      .eq('id', learningRequest.id)

    throw error
  }
}

async function coordinateAIResponse(supabase: any, userId: string, visionData?: any, voiceData?: any, learningData?: any) {
  // This function coordinates multiple AI services in sequence
  const coordinationResult = {
    vision_result: null,
    voice_result: null,
    learning_result: null,
    total_processing_time: 0
  }

  const startTime = Date.now()

  try {
    // Step 1: Process vision if provided
    if (visionData) {
      coordinationResult.vision_result = await processVisionWithGemini(supabase, userId, visionData)
    }

    // Step 2: Generate voice response based on vision analysis
    if (voiceData || coordinationResult.vision_result) {
      const textToSynthesize = voiceData?.text_to_synthesize ||
        generateResponseText(coordinationResult.vision_result)

      coordinationResult.voice_result = await generateVoiceWithElevenLabs(supabase, userId, {
        text_to_synthesize: textToSynthesize,
        priority_level: voiceData?.priority_level || 'medium'
      })
    }

    // Step 3: Update learning patterns based on interaction
    if (learningData || coordinationResult.vision_result) {
      const learningUpdate = learningData || generateLearningData(coordinationResult.vision_result)
      coordinationResult.learning_result = await updateChromaLearning(supabase, userId, learningUpdate)
    }

    coordinationResult.total_processing_time = Date.now() - startTime

    // Store coordination session
    await supabase
      .from('ai_coordination_sessions')
      .insert({
        user_id: userId,
        session_data: coordinationResult,
        processing_steps: ['vision', 'voice', 'learning'].filter(step =>
          coordinationResult[`${step}_result`] !== null
        ),
        total_processing_time_ms: coordinationResult.total_processing_time
      })

    return coordinationResult

  } catch (error) {
    coordinationResult.total_processing_time = Date.now() - startTime
    throw error
  }
}

async function getConversationContext(supabase: any, userId: string, contextRequest?: any) {
  const limit = contextRequest?.conversation_history_limit || 10
  const includePatterns = contextRequest?.include_learning_patterns || false
  const objectContext = contextRequest?.object_context

  // Get recent conversation history
  let query = supabase
    .from('conversation_context')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (objectContext) {
    query = query.contains('input_data', { object_type: objectContext })
  }

  const { data: conversationHistory } = await query

  let learningPatterns = null
  if (includePatterns) {
    const { data: patterns } = await supabase
      .from('learning_patterns')
      .select('*')
      .eq('user_id', userId)
      .order('pattern_strength', { ascending: false })
      .limit(5)

    learningPatterns = patterns
  }

  return {
    conversation_history: conversationHistory || [],
    learning_patterns: learningPatterns,
    context_summary: generateContextSummary(conversationHistory, learningPatterns),
    retrieved_at: new Date().toISOString()
  }
}

// Helper functions
async function simulateGeminiProcessing(visionData: any) {
  // Simulate Gemini API response based on detected objects
  const objects = visionData.detected_objects || []
  const responses = {
    medicine: "I notice your medicine bottle. It's time for your morning medication. The bottle appears to contain your daily vitamins.",
    keys: "I can see your keys on the desk. They're in their usual spot near the laptop.",
    laptop: "Your laptop is open and ready. Let me brief you on today's schedule.",
    bowl: "I see your breakfast bowl. This appears to be a healthy choice with good nutritional value.",
    phone: "Your phone is nearby and appears to be charged and ready."
  }

  const detectedObject = objects[0]?.type || 'general'
  const response = responses[detectedObject] || "I can help you with that object."

  return {
    analysis: response,
    confidence: 0.85 + Math.random() * 0.1,
    detected_objects: objects,
    suggestions: generateSuggestions(detectedObject),
    processing_time: 800 + Math.random() * 400
  }
}

async function simulateElevenLabsProcessing(voiceData: any) {
  // Simulate ElevenLabs API response
  const textLength = voiceData.text_to_synthesize.length
  const estimatedDuration = Math.max(2, textLength * 0.1) // Rough estimate

  return {
    audio_url: `https://demo-audio-storage.com/voice_${Date.now()}.mp3`,
    audio_duration: estimatedDuration,
    from_cache: false,
    processing_time: 500 + Math.random() * 300
  }
}

async function generateEmbeddings(learningData: any) {
  // Simulate embedding generation (in real implementation, would use actual embedding model)
  const dimensions = 384 // Common embedding dimension
  return Array.from({ length: dimensions }, () => Math.random() * 2 - 1)
}

function calculatePatternStrength(successMetrics: any) {
  // Calculate pattern strength based on success metrics
  const baseStrength = 0.5
  const successRate = successMetrics.success_rate || 0
  const frequency = Math.min(successMetrics.frequency || 1, 10) / 10

  return Math.min(1.0, baseStrength + (successRate * 0.3) + (frequency * 0.2))
}

async function updateUserPreferences(supabase: any, userId: string, learningData: any) {
  // Update user preferences based on learning data
  const preferenceUpdate = {
    interaction_type: learningData.interaction_type,
    preference_adjustment: learningData.user_feedback === 'positive' ? 0.1 : -0.05,
    last_updated: new Date().toISOString()
  }

  await supabase.rpc('update_user_preferences', {
    p_user_id: userId,
    p_preference_data: preferenceUpdate
  })
}

async function storeConversationContext(supabase: any, userId: string, contextData: any) {
  await supabase
    .from('conversation_context')
    .insert({
      user_id: userId,
      input_type: contextData.input_type,
      input_data: contextData.input_data,
      ai_response: contextData.ai_response,
      timestamp: contextData.timestamp
    })
}

function generateResponseText(visionResult: any) {
  if (!visionResult) return "I'm here to help you with your morning routine."

  return visionResult.gemini_response?.analysis || "I can see what you're looking at. How can I assist you?"
}

function generateLearningData(visionResult: any) {
  return {
    interaction_type: 'vision_analysis',
    success_metrics: {
      success_rate: 0.8,
      frequency: 1,
      confidence: visionResult?.gemini_response?.confidence || 0.5
    },
    user_feedback: 'neutral'
  }
}

function generateSuggestions(objectType: string) {
  const suggestions = {
    medicine: ["Set a reminder for your next dose", "Track this medication intake"],
    keys: ["I'll remember this location", "Add to departure checklist"],
    laptop: ["Show me today's calendar", "Check important emails"],
    bowl: ["Log this meal", "Show nutritional information"],
    phone: ["Check notifications", "Sync with other devices"]
  }

  return suggestions[objectType] || ["How can I help with this?"]
}

function generateContextSummary(conversationHistory: any[], learningPatterns: any[]) {
  const recentInteractions = conversationHistory?.length || 0
  const strongPatterns = learningPatterns?.filter(p => p.pattern_strength > 0.7).length || 0

  return {
    recent_interactions: recentInteractions,
    strong_patterns: strongPatterns,
    last_interaction: conversationHistory?.[0]?.timestamp,
    dominant_pattern: learningPatterns?.[0]?.interaction_type
  }
}

function hashText(text: string): string {
  // Simple hash function for caching (in production, use proper crypto hash)
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(36)
}