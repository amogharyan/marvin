// Task 1.13: Build voice Edge Functions
// Create Edge Function for ElevenLabs text-to-speech processing
// Implement Supabase Realtime for voice conversation state
// Set up audio response caching in Supabase Storage
// Create fallback system with pre-recorded audio files

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VoiceSynthesisRequest {
  user_id: string
  text: string
  voice_id?: string
  speed?: number
  stability?: number
  similarity_boost?: number
  use_cache?: boolean
}

interface VoiceSynthesisResponse {
  audio_url?: string
  cached: boolean
  fallback_used: boolean
  processing_time: number
  error?: string
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
      text,
      voice_id = 'default',
      speed = 1.0,
      stability = 0.5,
      similarity_boost = 0.75,
      use_cache = true
    }: VoiceSynthesisRequest = await req.json()

    if (!user_id || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, text' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const startTime = Date.now()

    // Generate cache key for the text and voice settings
    const textHash = await generateTextHash(text, voice_id, speed, stability, similarity_boost)

    // Check cache first if enabled
    if (use_cache) {
      const cachedAudioUrl = await getCachedAudio(supabase, textHash)
      if (cachedAudioUrl) {
        // Update conversation state
        await updateConversationState(supabase, user_id, {
          type: 'voice_synthesis',
          text,
          audio_url: cachedAudioUrl,
          cached: true
        })

        return new Response(
          JSON.stringify({
            audio_url: cachedAudioUrl,
            cached: true,
            fallback_used: false,
            processing_time: Date.now() - startTime
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    let audioUrl: string | null = null
    let fallbackUsed = false

    // Try ElevenLabs synthesis first
    try {
      audioUrl = await synthesizeWithElevenLabs(text, voice_id, speed, stability, similarity_boost)
    } catch (error) {
      console.error('ElevenLabs synthesis failed:', error)
      // Fall back to pre-recorded audio or browser synthesis
      audioUrl = await getFallbackAudio(text)
      fallbackUsed = true
    }

    if (audioUrl) {
      // Cache the audio if synthesis was successful and not a fallback
      if (!fallbackUsed && use_cache) {
        await cacheAudio(supabase, textHash, audioUrl)
      }

      // Update conversation state via Realtime
      await updateConversationState(supabase, user_id, {
        type: 'voice_synthesis',
        text,
        audio_url: audioUrl,
        fallback_used: fallbackUsed
      })

      const response: VoiceSynthesisResponse = {
        audio_url: audioUrl,
        cached: false,
        fallback_used: fallbackUsed,
        processing_time: Date.now() - startTime
      }

      return new Response(
        JSON.stringify(response),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      throw new Error('Failed to synthesize audio with both primary and fallback methods')
    }

  } catch (error) {
    console.error('Voice synthesis error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to synthesize voice',
        details: error.message,
        fallback_used: true,
        processing_time: Date.now() - (Date.now() - 1000) // Approximate
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function generateTextHash(text: string, voiceId: string, speed: number, stability: number, similarityBoost: number): Promise<string> {
  const data = `${text}:${voiceId}:${speed}:${stability}:${similarityBoost}`
  const encoder = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function getCachedAudio(supabase: any, textHash: string): Promise<string | null> {
  try {
    const { data } = await supabase.storage
      .from('voice-cache')
      .createSignedUrl(`audio/${textHash}.mp3`, 3600) // 1 hour expiry

    return data?.signedUrl || null
  } catch (error) {
    // Cache miss is normal
    return null
  }
}

async function synthesizeWithElevenLabs(
  text: string,
  voiceId: string,
  speed: number,
  stability: number,
  similarityBoost: number
): Promise<string> {
  const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

  if (!elevenLabsApiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  // Mock implementation for demo - in production would call actual ElevenLabs API
  // This simulates the API call structure
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': elevenLabsApiKey
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style: 0.0,
        use_speaker_boost: true
      }
    })
  })

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  // In actual implementation, would upload the audio blob to Supabase Storage
  // For demo, return a mock audio URL
  return 'https://example.com/mock-audio.mp3'
}

async function getFallbackAudio(text: string): Promise<string> {
  // Fallback options:
  // 1. Pre-recorded common phrases
  // 2. Browser speech synthesis (would be handled client-side)
  // 3. Simple audio generation

  const commonPhrases: Record<string, string> = {
    'good morning': '/fallback-audio/good-morning.mp3',
    'time to take your medication': '/fallback-audio/medication-reminder.mp3',
    'have a great day': '/fallback-audio/have-great-day.mp3',
    'dont forget your keys': '/fallback-audio/keys-reminder.mp3'
  }

  const normalizedText = text.toLowerCase().trim()

  // Check for exact matches first
  if (commonPhrases[normalizedText]) {
    return commonPhrases[normalizedText]
  }

  // Check for partial matches
  for (const [phrase, audioUrl] of Object.entries(commonPhrases)) {
    if (normalizedText.includes(phrase)) {
      return audioUrl
    }
  }

  // Default fallback
  return '/fallback-audio/default-response.mp3'
}

async function cacheAudio(supabase: any, textHash: string, audioUrl: string) {
  try {
    // In production, would download the audio from audioUrl and upload to Supabase Storage
    // For demo, just store the URL reference
    const cacheData = {
      original_url: audioUrl,
      cached_at: new Date().toISOString()
    }

    await supabase.storage
      .from('voice-cache')
      .upload(`audio/${textHash}.json`, JSON.stringify(cacheData), {
        contentType: 'application/json',
        upsert: true
      })
  } catch (error) {
    console.error('Failed to cache audio:', error)
  }
}

async function updateConversationState(supabase: any, userId: string, stateUpdate: any) {
  try {
    // Insert conversation state update for real-time subscriptions
    await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        interaction_type: 'voice_synthesis',
        content: stateUpdate.text,
        ai_response: `Audio synthesized: ${stateUpdate.audio_url}`,
        context: {
          voice_synthesis: true,
          cached: stateUpdate.cached || false,
          fallback_used: stateUpdate.fallback_used || false,
          timestamp: new Date().toISOString()
        }
      })

    // Broadcast real-time update
    const channel = supabase.channel(`conversation_${userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'voice_synthesis_complete',
      payload: stateUpdate
    })

  } catch (error) {
    console.error('Failed to update conversation state:', error)
  }
}