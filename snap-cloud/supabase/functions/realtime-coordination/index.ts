// Task 3.3: Configure Supabase Realtime subscriptions
// Set up real-time conversation state synchronization
// Implement presence tracking for demo environment
// Create real-time data sync across AR and web interfaces

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RealtimeRequest {
  user_id: string
  action: 'subscribe' | 'presence_update' | 'conversation_update' | 'demo_update' | 'sync_devices' | 'broadcast_event'
  subscription_data?: {
    channels: string[]
    events: string[]
    device_type: 'ar_spectacles' | 'web_interface' | 'mobile_backup'
  }
  presence_data?: {
    session_id: string
    device_type: string
    status: 'online' | 'away' | 'offline'
    location_context?: any
    active_objects?: string[]
  }
  conversation_data?: {
    current_context: string
    conversation_phase: string
    pending_actions?: any[]
    last_ai_response?: string
    last_user_input?: string
    conversation_metadata?: any
  }
  demo_data?: {
    demo_session_id: string
    active_objects?: any
    current_demo_step?: string
    demo_progress?: number
    environment_config?: any
    participant_count?: number
  }
  sync_data?: {
    primary_device: string
    connected_devices: any[]
    sync_status: 'synced' | 'syncing' | 'conflict' | 'offline'
    pending_sync_data?: any
  }
  broadcast_data?: {
    channel: string
    event: string
    payload: any
    target_devices?: string[]
  }
}

serve(async (req) => {
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
      action,
      subscription_data,
      presence_data,
      conversation_data,
      demo_data,
      sync_data,
      broadcast_data
    }: RealtimeRequest = await req.json()

    if (!user_id || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let result: any

    switch (action) {
      case 'subscribe':
        if (!subscription_data) {
          throw new Error('subscription_data required for subscribe action')
        }
        result = await setupRealtimeSubscriptions(supabase, user_id, subscription_data)
        break

      case 'presence_update':
        if (!presence_data) {
          throw new Error('presence_data required for presence_update action')
        }
        result = await updatePresence(supabase, user_id, presence_data)
        break

      case 'conversation_update':
        if (!conversation_data) {
          throw new Error('conversation_data required for conversation_update action')
        }
        result = await updateConversationState(supabase, user_id, conversation_data)
        break

      case 'demo_update':
        if (!demo_data) {
          throw new Error('demo_data required for demo_update action')
        }
        result = await updateDemoEnvironment(supabase, demo_data)
        break

      case 'sync_devices':
        if (!sync_data) {
          throw new Error('sync_data required for sync_devices action')
        }
        result = await syncDevices(supabase, user_id, sync_data)
        break

      case 'broadcast_event':
        if (!broadcast_data) {
          throw new Error('broadcast_data required for broadcast_event action')
        }
        result = await broadcastEvent(supabase, user_id, broadcast_data)
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
    console.error('Realtime coordination error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process realtime request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function setupRealtimeSubscriptions(supabase: any, userId: string, subscriptionData: any) {
  const { channels, events, device_type } = subscriptionData

  // Create subscription configuration
  const subscriptionConfig = {
    user_id: userId,
    device_type,
    channels: channels,
    events: events,
    created_at: new Date().toISOString()
  }

  // Store subscription preferences
  await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      preference_type: 'realtime_subscriptions',
      preference_value: subscriptionConfig
    })

  // Set up initial presence
  const presenceResult = await supabase.rpc('update_presence_heartbeat', {
    p_user_id: userId,
    p_session_id: crypto.randomUUID(),
    p_device_type: device_type,
    p_location_context: {},
    p_active_objects: []
  })

  // Initialize conversation state
  const conversationResult = await supabase.rpc('update_conversation_state', {
    p_user_id: userId,
    p_current_context: 'initial',
    p_conversation_phase: 'greeting',
    p_pending_actions: [],
    p_conversation_metadata: { device_type }
  })

  return {
    subscription_id: crypto.randomUUID(),
    presence_id: presenceResult,
    conversation_id: conversationResult,
    channels_configured: channels,
    events_configured: events,
    device_type
  }
}

async function updatePresence(supabase: any, userId: string, presenceData: any) {
  const { session_id, device_type, status, location_context, active_objects } = presenceData

  // Update presence using database function
  const presenceId = await supabase.rpc('update_presence_heartbeat', {
    p_user_id: userId,
    p_session_id: session_id,
    p_device_type: device_type,
    p_location_context: location_context || {},
    p_active_objects: active_objects || []
  })

  // If status is offline, handle cleanup
  if (status === 'offline') {
    await supabase
      .from('presence_tracking')
      .update({
        status: 'offline',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('session_id', session_id)
  }

  // Broadcast presence update to all user's devices
  const channel = supabase.channel(`presence_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'presence_updated',
    payload: {
      user_id: userId,
      session_id,
      device_type,
      status,
      location_context,
      active_objects,
      timestamp: new Date().toISOString()
    }
  })

  // Get current presence summary for all user's devices
  const { data: allPresences } = await supabase
    .from('presence_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'online')

  return {
    presence_id: presenceId,
    current_status: status,
    active_devices: allPresences?.length || 0,
    location_context,
    active_objects,
    all_presences: allPresences
  }
}

async function updateConversationState(supabase: any, userId: string, conversationData: any) {
  const {
    current_context,
    conversation_phase,
    pending_actions,
    last_ai_response,
    last_user_input,
    conversation_metadata
  } = conversationData

  // Update conversation state using database function
  const stateId = await supabase.rpc('update_conversation_state', {
    p_user_id: userId,
    p_current_context: current_context,
    p_conversation_phase: conversation_phase,
    p_pending_actions: pending_actions || [],
    p_last_ai_response: last_ai_response,
    p_last_user_input: last_user_input,
    p_conversation_metadata: conversation_metadata || {}
  })

  // Broadcast conversation state update to all user's devices
  const channel = supabase.channel(`conversation_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'conversation_updated',
    payload: {
      user_id: userId,
      current_context,
      conversation_phase,
      pending_actions,
      last_ai_response,
      last_user_input,
      timestamp: new Date().toISOString()
    }
  })

  // Log conversation event for analytics
  await supabase
    .from('user_interactions')
    .insert({
      user_id: userId,
      interaction_type: 'conversation_state_change',
      content: `Conversation moved to ${current_context} phase: ${conversation_phase}`,
      context: {
        previous_context: conversation_metadata?.previous_context,
        current_context,
        conversation_phase,
        pending_actions: pending_actions?.length || 0
      }
    })

  return {
    state_id: stateId,
    current_context,
    conversation_phase,
    pending_actions_count: pending_actions?.length || 0,
    expires_in_minutes: 60 // conversations expire in 1 hour
  }
}

async function updateDemoEnvironment(supabase: any, demoData: any) {
  const {
    demo_session_id,
    active_objects,
    current_demo_step,
    demo_progress,
    environment_config,
    participant_count
  } = demoData

  // Update demo environment using database function
  const envId = await supabase.rpc('update_demo_environment', {
    p_demo_session_id: demo_session_id,
    p_active_objects: active_objects,
    p_current_demo_step: current_demo_step,
    p_demo_progress: demo_progress,
    p_environment_config: environment_config,
    p_participant_count: participant_count
  })

  // Broadcast demo update to all participants
  const channel = supabase.channel(`demo_${demo_session_id}`)
  await channel.send({
    type: 'broadcast',
    event: 'demo_environment_updated',
    payload: {
      demo_session_id,
      active_objects,
      current_demo_step,
      demo_progress,
      environment_config,
      participant_count,
      timestamp: new Date().toISOString()
    }
  })

  // If demo step changed, trigger step-specific events
  if (current_demo_step) {
    await triggerDemoStepEvents(supabase, demo_session_id, current_demo_step, active_objects)
  }

  return {
    environment_id: envId,
    demo_session_id,
    current_step: current_demo_step,
    progress_percentage: (demo_progress || 0) * 100,
    participant_count,
    active_objects_count: Object.keys(active_objects || {}).length
  }
}

async function syncDevices(supabase: any, userId: string, syncData: any) {
  const {
    primary_device,
    connected_devices,
    sync_status,
    pending_sync_data
  } = syncData

  // Update device sync state
  const { data: syncState } = await supabase
    .from('device_sync_state')
    .upsert({
      user_id: userId,
      primary_device,
      connected_devices,
      sync_status,
      last_sync_time: new Date().toISOString(),
      pending_sync_data: pending_sync_data || {},
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  // Broadcast sync update to all connected devices
  const channel = supabase.channel(`sync_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'device_sync_updated',
    payload: {
      user_id: userId,
      primary_device,
      connected_devices,
      sync_status,
      last_sync_time: syncState.last_sync_time,
      pending_sync_data
    }
  })

  // If there's pending sync data, process it
  if (pending_sync_data && Object.keys(pending_sync_data).length > 0) {
    await processPendingSyncData(supabase, userId, pending_sync_data)
  }

  return {
    sync_state_id: syncState.id,
    primary_device,
    connected_devices_count: connected_devices?.length || 0,
    sync_status,
    last_sync_time: syncState.last_sync_time,
    pending_items: Object.keys(pending_sync_data || {}).length
  }
}

async function broadcastEvent(supabase: any, userId: string, broadcastData: any) {
  const { channel, event, payload, target_devices } = broadcastData

  // Create broadcast record for tracking
  const { data: broadcastRecord } = await supabase
    .from('user_interactions')
    .insert({
      user_id: userId,
      interaction_type: 'realtime_broadcast',
      content: `Broadcasted ${event} to ${channel}`,
      context: {
        channel,
        event,
        target_devices,
        payload_size: JSON.stringify(payload).length
      }
    })
    .select()
    .single()

  // Send the broadcast
  const channelInstance = supabase.channel(channel)
  await channelInstance.send({
    type: 'broadcast',
    event: event,
    payload: {
      ...payload,
      broadcast_id: broadcastRecord.id,
      sender_user_id: userId,
      target_devices,
      timestamp: new Date().toISOString()
    }
  })

  return {
    broadcast_id: broadcastRecord.id,
    channel,
    event,
    target_devices,
    payload_size: JSON.stringify(payload).length,
    sent_at: broadcastRecord.created_at
  }
}

async function triggerDemoStepEvents(supabase: any, demoSessionId: string, demoStep: string, activeObjects: any) {
  // Demo step specific events
  const stepEvents = {
    medicine: {
      event: 'medicine_reminder_triggered',
      payload: { objects: ['medicine'], reminder_type: 'morning_medication' }
    },
    breakfast: {
      event: 'nutrition_analysis_triggered',
      payload: { objects: ['bowl'], analysis_type: 'breakfast_nutrition' }
    },
    calendar: {
      event: 'calendar_briefing_triggered',
      payload: { objects: ['laptop'], briefing_type: 'daily_schedule' }
    },
    keys: {
      event: 'location_guidance_triggered',
      payload: { objects: ['keys'], guidance_type: 'departure_preparation' }
    },
    departure: {
      event: 'departure_checklist_triggered',
      payload: { objects: ['keys', 'phone'], checklist_type: 'final_departure' }
    }
  }

  const stepEvent = stepEvents[demoStep]
  if (stepEvent) {
    const channel = supabase.channel(`demo_${demoSessionId}`)
    await channel.send({
      type: 'broadcast',
      event: stepEvent.event,
      payload: {
        ...stepEvent.payload,
        demo_session_id: demoSessionId,
        demo_step: demoStep,
        active_objects: activeObjects,
        triggered_at: new Date().toISOString()
      }
    })
  }
}

async function processPendingSyncData(supabase: any, userId: string, pendingSyncData: any) {
  // Process different types of sync data
  for (const [dataType, data] of Object.entries(pendingSyncData)) {
    switch (dataType) {
      case 'conversation_state':
        await supabase.rpc('update_conversation_state', {
          p_user_id: userId,
          ...data
        })
        break

      case 'object_interactions':
        if (Array.isArray(data)) {
          for (const interaction of data) {
            await supabase
              .from('object_interactions')
              .insert({
                user_id: userId,
                ...interaction
              })
          }
        }
        break

      case 'user_preferences':
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            ...data
          })
        break
    }
  }

  // Clear pending sync data after processing
  await supabase
    .from('device_sync_state')
    .update({
      pending_sync_data: {},
      sync_status: 'synced',
      last_sync_time: new Date().toISOString()
    })
    .eq('user_id', userId)
}