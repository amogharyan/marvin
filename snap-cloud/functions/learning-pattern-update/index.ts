// Learning pattern update Edge Function for Marvin AR Assistant
// Task 1.10: Implement request queuing and priority handling for different object types

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LearningUpdateRequest {
  user_id: string
  update_type: 'analyze_patterns' | 'update_preferences' | 'routine_detection'
  trigger_context?: any
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
    const body: LearningUpdateRequest = await req.json()

    const {
      user_id,
      update_type,
      trigger_context = {}
    } = body

    // Validate required fields
    if (!user_id || !update_type) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: user_id, update_type'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let result: any = {}

    switch (update_type) {
      case 'analyze_patterns': {
        // Call the database function to analyze interaction patterns
        const { data: patterns, error: patternError } = await supabase
          .rpc('analyze_interaction_patterns', {
            p_user_id: user_id
          })

        if (patternError) {
          throw patternError
        }

        // Store the analyzed patterns in learning_data table
        if (patterns && Array.isArray(patterns)) {
          for (const pattern of patterns) {
            await supabase
              .from('learning_data')
              .insert({
                user_id,
                pattern_type: pattern.pattern_type,
                pattern_data: pattern,
                // Use nullish coalescing so legitimate 0 confidence is preserved
                confidence_score: pattern.confidence ?? 0.5,
                context: trigger_context
              })
          }
        }

        result = {
          patterns_analyzed: patterns?.length || 0,
          patterns: patterns
        }
        break
      }

      case 'update_preferences': {
        // Call the database function to update user preferences
        const { data: preferences, error: prefError } = await supabase
          .rpc('update_user_preferences', {
            p_user_id: user_id
          })

        if (prefError) {
          throw prefError
        }

        result = {
          preferences_updated: true,
          new_preferences: preferences
        }
        break
      }

      case 'routine_detection': {
        // Detect new routines by analyzing recent interaction patterns
        const { data: recentInteractions, error: interactionError } = await supabase
          .from('object_interactions')
          .select('*')
          .eq('user_id', user_id)
          .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
          .order('timestamp', { ascending: true })

        if (interactionError) {
          throw interactionError
        }

        // Simple routine detection: group by hour and object type
        const routineMap = new Map<string, any[]>()

        recentInteractions?.forEach(interaction => {
          const hour = new Date(interaction.timestamp).getHours()
          const key = `${hour}-${interaction.object_type}`

          if (!routineMap.has(key)) {
            routineMap.set(key, [])
          }
          routineMap.get(key)!.push(interaction)
        })

        // Find patterns that occur 3+ times
        const detectedRoutines = Array.from(routineMap.entries())
          .filter(([key, interactions]) => interactions.length >= 3)
          .map(([key, interactions]) => {
            const [hour, object_type] = key.split('-')
            return {
              pattern_type: 'routine',
              time_of_day: parseInt(hour),
              object_type,
              frequency: interactions.length,
              confidence: Math.min(interactions.length / 7, 1.0),
              pattern_data: {
                hour: parseInt(hour),
                object_type,
                avg_confidence: interactions.reduce((sum, i) => sum + i.confidence_score, 0) / interactions.length,
                interactions: interactions.length
              }
            }
          })

        // Store detected routines
        for (const routine of detectedRoutines) {
          await supabase
            .from('learning_patterns')
            .insert({
              user_id,
              pattern_type: routine.pattern_type,
              pattern_description: `Regular ${routine.object_type} interaction at ${routine.time_of_day}:00`,
              pattern_data: routine.pattern_data,
              confidence_score: routine.confidence,
              frequency: routine.frequency
            })
            .on('conflict', 'do nothing') // Avoid duplicates
        }

        result = {
          routines_detected: detectedRoutines.length,
          routines: detectedRoutines
        }
        break
      }

      default:
        return new Response(
          JSON.stringify({
            error: 'Invalid update_type',
            supported_types: ['analyze_patterns', 'update_preferences', 'routine_detection']
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    // Trigger real-time notification for learning updates
    const channel = supabase.channel('learning_updates')
    await channel.send({
      type: 'broadcast',
      event: 'patterns_updated',
      payload: {
        user_id,
        update_type,
        result,
        timestamp: new Date().toISOString()
      }
    })

    const response = {
      success: true,
      update_type,
      result,
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
    console.error('Learning pattern update failed:', error)

    return new Response(
      JSON.stringify({
        error: 'Learning update failed',
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