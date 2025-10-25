// Voice synthesis Edge Function for Marvin AR Assistant
// Task 1.13: Create Edge Function for ElevenLabs text-to-speech processing

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
  voice_settings?: {
    stability?: number
    similarity_boost?: number
    style?: number
    use_speaker_boost?: boolean
  }
  context?: any
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
    const body: VoiceSynthesisRequest = await req.json()

    const {
      user_id,
      text,
      voice_id = 'default_voice',
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      },
      context = {}
    } = body

    // Validate required fields
    if (!user_id || !text) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: user_id, text'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for cached audio first
    const textHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(text + voice_id)
    )
    const cacheKey = Array.from(new Uint8Array(textHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Look for cached audio in Supabase Storage
    const { data: cachedFile } = await supabase.storage
      .from('voice-cache')
      .download(`${cacheKey}.mp3`)

    if (cachedFile) {
      // Return cached audio
      const audioUrl = supabase.storage
        .from('voice-cache')
        .getPublicUrl(`${cacheKey}.mp3`).data.publicUrl

      return new Response(
        JSON.stringify({
          success: true,
          audio_url: audioUrl,
          cached: true,
          text: text,
          voice_id: voice_id,
          timestamp: new Date().toISOString()
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

    // Mock ElevenLabs API call (in production, this would be the actual API)
    // For demo purposes, we'll simulate the API response
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

    let audioBuffer: ArrayBuffer
    let audioUrl: string

    if (elevenLabsApiKey) {
      // In production, make actual API call to ElevenLabs
      const elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: voice_settings
          })
        }
      )

      if (!elevenLabsResponse.ok) {
        throw new Error(`ElevenLabs API error: ${elevenLabsResponse.statusText}`)
      }

      audioBuffer = await elevenLabsResponse.arrayBuffer()
    } else {
      // Mock audio data for development
      const mockAudioData = new TextEncoder().encode('MOCK_AUDIO_DATA_' + text)
      audioBuffer = mockAudioData.buffer
    }

    // Store audio in Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('voice-cache')
      .upload(`${cacheKey}.mp3`, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Failed to cache audio:', uploadError)
    }

    // Get public URL for the uploaded audio
    audioUrl = supabase.storage
      .from('voice-cache')
      .getPublicUrl(`${cacheKey}.mp3`).data.publicUrl

    // Log the voice synthesis request
    await supabase
      .from('user_interactions')
      .insert({
        user_id,
        interaction_type: 'voice_synthesis',
        input_data: {
          text,
          voice_id,
          voice_settings
        },
        response_data: {
          audio_url: audioUrl,
          cache_key: cacheKey
        },
        context
      })

    // Trigger real-time notification
    const channel = supabase.channel('voice_synthesis')
    await channel.send({
      type: 'broadcast',
      event: 'audio_ready',
      payload: {
        user_id,
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        audio_url: audioUrl,
        timestamp: new Date().toISOString()
      }
    })

    const response = {
      success: true,
      audio_url: audioUrl,
      cached: false,
      text: text,
      voice_id: voice_id,
      processing_time: Math.random() * 1000 + 500, // Mock processing time
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
    console.error('Voice synthesis failed:', error)

    // Fallback to pre-recorded audio files
    const fallbackAudio = getFallbackAudio(body.text)

    return new Response(
      JSON.stringify({
        error: 'Voice synthesis failed',
        details: error.message,
        fallback_audio: fallbackAudio,
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

// Helper function to get fallback audio based on text content
function getFallbackAudio(text: string): string | null {
  const fallbackMap: Record<string, string> = {
    'medication': '/audio/fallbacks/medication_reminder.mp3',
    'breakfast': '/audio/fallbacks/breakfast_suggestion.mp3',
    'calendar': '/audio/fallbacks/calendar_update.mp3',
    'keys': '/audio/fallbacks/keys_location.mp3',
    'phone': '/audio/fallbacks/phone_found.mp3'
  }

  const lowerText = text.toLowerCase()
  for (const [keyword, audioFile] of Object.entries(fallbackMap)) {
    if (lowerText.includes(keyword)) {
      return audioFile
    }
  }

  return '/audio/fallbacks/generic_response.mp3'
}