// User profile update Edge Function for Marvin AR Assistant
// Task 1.13: Set up audio response caching and create fallback system

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserProfileUpdateRequest {
  user_id: string
  updates: {
    name?: string
    preferences?: any
    timezone?: string
    voice_settings?: any
    ar_settings?: any
  }
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
    const body: UserProfileUpdateRequest = await req.json()

    const {
      user_id,
      updates
    } = body

    // Validate required fields
    if (!user_id || !updates) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: user_id, updates'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get current user profile or create if doesn't exist
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    let profileData: any = {}

    if (existingProfile) {
      // Update existing profile
      const updatedPreferences = {
        ...existingProfile.preferences,
        ...updates.preferences
      }

      profileData = {
        name: updates.name || existingProfile.name,
        preferences: updatedPreferences,
        timezone: updates.timezone || existingProfile.timezone,
        updated_at: new Date().toISOString()
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user_id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      profileData = updatedProfile
    } else {
      // Create new profile
      profileData = {
        user_id,
        email: `user_${user_id}@example.com`, // This would come from auth in real implementation
        name: updates.name || 'User',
        preferences: updates.preferences || {},
        timezone: updates.timezone || 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      profileData = newProfile
    }

    // If voice settings were updated, ensure fallback audio files exist
    if (updates.voice_settings) {
      await ensureFallbackAudioFiles(supabase, user_id, updates.voice_settings)
    }

    // Trigger analytics and learning pattern updates if significant changes
    if (updates.preferences) {
      // Trigger background learning pattern update
      await fetch(`${supabaseUrl}/functions/v1/learning-pattern-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id,
          update_type: 'update_preferences',
          trigger_context: {
            source: 'profile_update',
            changes: Object.keys(updates.preferences || {})
          }
        })
      }).catch(err => console.error('Failed to trigger learning update:', err))
    }

    // Broadcast profile update
    const channel = supabase.channel('user_profiles')
    await channel.send({
      type: 'broadcast',
      event: 'profile_updated',
      payload: {
        user_id,
        updates: Object.keys(updates),
        timestamp: new Date().toISOString()
      }
    })

    const response = {
      success: true,
      profile: profileData,
      updated_fields: Object.keys(updates),
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
    console.error('User profile update failed:', error)

    return new Response(
      JSON.stringify({
        error: 'Profile update failed',
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

// Helper function to ensure fallback audio files exist
async function ensureFallbackAudioFiles(supabase: any, user_id: string, voice_settings: any) {
  const fallbackTexts = [
    'Good morning! Time to start your day.',
    'Don\'t forget to take your medication.',
    'Here are your calendar updates.',
    'I found your keys.',
    'Your phone is nearby.',
    'Time for a healthy breakfast.',
    'You have a meeting in 30 minutes.',
    'All set for your departure.'
  ]

  try {
    // Check if fallback audio files exist for this user
    const { data: existingFiles } = await supabase.storage
      .from('voice-cache')
      .list(`fallbacks/${user_id}/`)

    const existingFileNames = existingFiles?.map((f: any) => f.name) || []

    // Create fallback audio for any missing files
    for (const text of fallbackTexts) {
      const filename = text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30) + '.mp3'

      if (!existingFileNames.includes(filename)) {
        // Create mock audio file for fallback
        const mockAudioData = new TextEncoder().encode(`FALLBACK_AUDIO_${text}`)

        await supabase.storage
          .from('voice-cache')
          .upload(`fallbacks/${user_id}/${filename}`, mockAudioData, {
            contentType: 'audio/mpeg',
            cacheControl: '86400' // Cache for 24 hours
          })
      }
    }

    console.log(`Fallback audio files ensured for user ${user_id}`)
  } catch (error) {
    console.error('Failed to create fallback audio files:', error)
  }
}