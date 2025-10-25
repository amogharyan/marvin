// Real-time subscription Edge Function for Marvin AR Assistant
// Task 1.13: Create real-time data sync across AR and web interfaces

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionRequest {
  user_id: string
  subscription_types: string[] // ['object_interactions', 'health_reminders', 'calendar_events']
  device_id?: string
  session_id?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // This endpoint supports both GET (for SSE) and POST (for WebSocket setup)
  if (req.method !== 'GET' && req.method !== 'POST') {
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

    // For GET requests, establish Server-Sent Events stream
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const user_id = url.searchParams.get('user_id')
      const subscription_types = url.searchParams.get('types')?.split(',') || ['object_interactions']

      if (!user_id) {
        return new Response('Missing user_id parameter', {
          status: 400,
          headers: corsHeaders
        })
      }

      // Create SSE response
      const stream = new ReadableStream({
        start(controller) {
          // Send initial connection message
          const data = JSON.stringify({
            type: 'connection',
            message: 'Connected to Marvin AR real-time stream',
            user_id,
            subscription_types,
            timestamp: new Date().toISOString()
          })
          controller.enqueue(`data: ${data}\n\n`)

          // Set up periodic heartbeat
          const heartbeat = setInterval(() => {
            const heartbeatData = JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })
            controller.enqueue(`data: ${heartbeatData}\n\n`)
          }, 30000) // 30 seconds

          // Simulate real-time updates (in production, this would be connected to actual Supabase real-time)
          const updateInterval = setInterval(async () => {
            try {
              // Get recent interactions for this user
              const { data: recentInteractions } = await supabase
                .from('object_interactions')
                .select('*')
                .eq('user_id', user_id)
                .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
                .order('created_at', { ascending: false })
                .limit(5)

              if (recentInteractions && recentInteractions.length > 0) {
                const updateData = JSON.stringify({
                  type: 'object_interactions_update',
                  data: recentInteractions,
                  timestamp: new Date().toISOString()
                })
                controller.enqueue(`data: ${updateData}\n\n`)
              }

              // Get pending health reminders
              if (subscription_types.includes('health_reminders')) {
                const { data: upcomingReminders } = await supabase
                  .rpc('get_upcoming_health_reminders', {
                    p_user_id: user_id,
                    p_hours_ahead: 1
                  })

                if (upcomingReminders && upcomingReminders.length > 0) {
                  const reminderData = JSON.stringify({
                    type: 'health_reminders_update',
                    data: upcomingReminders,
                    timestamp: new Date().toISOString()
                  })
                  controller.enqueue(`data: ${reminderData}\n\n`)
                }
              }

            } catch (error) {
              console.error('Error in real-time update:', error)
            }
          }, 5000) // Check every 5 seconds

          // Cleanup on connection close
          req.signal?.addEventListener('abort', () => {
            clearInterval(heartbeat)
            clearInterval(updateInterval)
            controller.close()
          })
        }
      })

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      })
    }

    // For POST requests, setup subscription preferences
    if (req.method === 'POST') {
      const body: SubscriptionRequest = await req.json()

      const {
        user_id,
        subscription_types,
        device_id,
        session_id
      } = body

      // Validate required fields
      if (!user_id || !subscription_types || subscription_types.length === 0) {
        return new Response(
          JSON.stringify({
            error: 'Missing required fields: user_id, subscription_types'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Store subscription preferences
      const { data: subscriptionRecord, error: subError } = await supabase
        .from('user_interactions')
        .insert({
          user_id,
          interaction_type: 'realtime_subscription',
          input_data: {
            subscription_types,
            device_id,
            session_id
          },
          response_data: {
            status: 'active',
            created_at: new Date().toISOString()
          },
          context: {
            device_id,
            session_id,
            subscription_active: true
          }
        })
        .select()
        .single()

      if (subError) {
        throw subError
      }

      // Set up real-time channels for each subscription type
      const channels = []

      for (const subType of subscription_types) {
        switch (subType) {
          case 'object_interactions':
            // In production, this would set up actual Supabase real-time subscription
            channels.push({
              type: 'object_interactions',
              channel: `object_interactions:user_id=eq.${user_id}`,
              status: 'configured'
            })
            break

          case 'health_reminders':
            channels.push({
              type: 'health_reminders',
              channel: `health_reminders:user_id=eq.${user_id}`,
              status: 'configured'
            })
            break

          case 'calendar_events':
            channels.push({
              type: 'calendar_events',
              channel: `calendar_events:user_id=eq.${user_id}`,
              status: 'configured'
            })
            break

          default:
            console.warn(`Unknown subscription type: ${subType}`)
        }
      }

      const response = {
        success: true,
        subscription_id: subscriptionRecord.id,
        channels,
        sse_endpoint: `${req.url.replace('/subscribe-object-interactions', '/subscribe-object-interactions')}?user_id=${user_id}&types=${subscription_types.join(',')}`,
        message: 'Real-time subscription configured',
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
    }

  } catch (error) {
    console.error('Real-time subscription failed:', error)

    return new Response(
      JSON.stringify({
        error: 'Real-time subscription setup failed',
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