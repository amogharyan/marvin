// Conversation state management Edge Function for Marvin AR Assistant
// Task 1.13: Implement Supabase Realtime for voice conversation state

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversationStateRequest {
  user_id: string
  action: 'start' | 'update' | 'end' | 'get_state'
  conversation_data?: {
    session_id?: string
    current_context?: any
    last_interaction?: any
    voice_mode?: boolean
    active_objects?: string[]
    user_intent?: string
  }
}

interface ConversationSession {
  id: string
  user_id: string
  session_id: string
  current_context: any
  last_interaction: any
  voice_mode: boolean
  active_objects: string[]
  user_intent: string
  started_at: string
  last_updated: string
  status: 'active' | 'paused' | 'ended'
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
    const body: ConversationStateRequest = await req.json()

    const {
      user_id,
      action,
      conversation_data = {}
    } = body

    // Validate required fields
    if (!user_id || !action) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: user_id, action'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let result: any = {}

    switch (action) {
      case 'start': {
        // Create new conversation session
        const session_id = conversation_data.session_id || crypto.randomUUID()

        // End any existing active sessions for this user
        await supabase
          .from('user_interactions')
          .update({
            context: {
              ...{},
              conversation_status: 'ended',
              ended_at: new Date().toISOString()
            }
          })
          .eq('user_id', user_id)
          .eq('interaction_type', 'conversation_session')
          .is('context->conversation_status', 'active')

        // Create new conversation session
        const { data: sessionData, error: sessionError } = await supabase
          .from('user_interactions')
          .insert({
            user_id,
            interaction_type: 'conversation_session',
            input_data: {
              session_id,
              started_at: new Date().toISOString(),
              initial_context: conversation_data.current_context || {}
            },
            response_data: {
              status: 'active',
              voice_mode: conversation_data.voice_mode || false,
              active_objects: conversation_data.active_objects || []
            },
            context: {
              conversation_status: 'active',
              session_id,
              last_updated: new Date().toISOString()
            }
          })
          .select()
          .single()

        if (sessionError) {
          throw sessionError
        }

        result = {
          session_id,
          conversation_id: sessionData.id,
          status: 'started',
          voice_mode: conversation_data.voice_mode || false
        }

        // Broadcast session start
        const channel = supabase.channel('conversation_state')
        await channel.send({
          type: 'broadcast',
          event: 'conversation_started',
          payload: {
            user_id,
            session_id,
            conversation_id: sessionData.id,
            timestamp: new Date().toISOString()
          }
        })

        break
      }

      case 'update': {
        // Update existing conversation state
        const { data: activeSession } = await supabase
          .from('user_interactions')
          .select('*')
          .eq('user_id', user_id)
          .eq('interaction_type', 'conversation_session')
          .eq('context->conversation_status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!activeSession) {
          return new Response(
            JSON.stringify({
              error: 'No active conversation session found'
            }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Update the session
        const updatedContext = {
          ...activeSession.context,
          last_updated: new Date().toISOString(),
          current_context: conversation_data.current_context,
          last_interaction: conversation_data.last_interaction,
          user_intent: conversation_data.user_intent,
          active_objects: conversation_data.active_objects
        }

        const { error: updateError } = await supabase
          .from('user_interactions')
          .update({
            context: updatedContext,
            response_data: {
              ...activeSession.response_data,
              voice_mode: conversation_data.voice_mode,
              active_objects: conversation_data.active_objects || activeSession.response_data.active_objects
            }
          })
          .eq('id', activeSession.id)

        if (updateError) {
          throw updateError
        }

        result = {
          session_id: activeSession.context.session_id,
          conversation_id: activeSession.id,
          status: 'updated',
          context: updatedContext
        }

        // Broadcast state update
        const channel = supabase.channel('conversation_state')
        await channel.send({
          type: 'broadcast',
          event: 'conversation_updated',
          payload: {
            user_id,
            session_id: activeSession.context.session_id,
            conversation_id: activeSession.id,
            context: updatedContext,
            timestamp: new Date().toISOString()
          }
        })

        break
      }

      case 'end': {
        // End active conversation session
        const { data: activeSession } = await supabase
          .from('user_interactions')
          .select('*')
          .eq('user_id', user_id)
          .eq('interaction_type', 'conversation_session')
          .eq('context->conversation_status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (activeSession) {
          const { error: endError } = await supabase
            .from('user_interactions')
            .update({
              context: {
                ...activeSession.context,
                conversation_status: 'ended',
                ended_at: new Date().toISOString(),
                duration: new Date().getTime() - new Date(activeSession.created_at).getTime()
              }
            })
            .eq('id', activeSession.id)

          if (endError) {
            throw endError
          }

          result = {
            session_id: activeSession.context.session_id,
            conversation_id: activeSession.id,
            status: 'ended',
            duration: new Date().getTime() - new Date(activeSession.created_at).getTime()
          }

          // Broadcast session end
          const channel = supabase.channel('conversation_state')
          await channel.send({
            type: 'broadcast',
            event: 'conversation_ended',
            payload: {
              user_id,
              session_id: activeSession.context.session_id,
              conversation_id: activeSession.id,
              duration: result.duration,
              timestamp: new Date().toISOString()
            }
          })
        } else {
          result = {
            status: 'no_active_session'
          }
        }

        break
      }

      case 'get_state': {
        // Get current conversation state
        const { data: activeSession } = await supabase
          .from('user_interactions')
          .select('*')
          .eq('user_id', user_id)
          .eq('interaction_type', 'conversation_session')
          .eq('context->conversation_status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (activeSession) {
          result = {
            session_id: activeSession.context.session_id,
            conversation_id: activeSession.id,
            status: 'active',
            context: activeSession.context,
            voice_mode: activeSession.response_data.voice_mode,
            active_objects: activeSession.response_data.active_objects,
            started_at: activeSession.created_at,
            last_updated: activeSession.context.last_updated
          }
        } else {
          result = {
            status: 'no_active_session'
          }
        }

        break
      }

      default:
        return new Response(
          JSON.stringify({
            error: 'Invalid action',
            supported_actions: ['start', 'update', 'end', 'get_state']
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    const response = {
      success: true,
      action,
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
    console.error('Conversation state management failed:', error)

    return new Response(
      JSON.stringify({
        error: 'Conversation state operation failed',
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