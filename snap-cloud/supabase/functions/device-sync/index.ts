// Task 3.6: Create device sync with Supabase
// Implement user session management with Supabase Auth
// Create device synchronization using Supabase Realtime
// Handle device disconnection gracefully with offline-first approach

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeviceSyncRequest {
  user_id: string
  action: 'register_device' | 'sync_data' | 'handle_offline' | 'resolve_conflicts' | 'get_sync_status' | 'cleanup_sessions'
  device_data?: {
    device_id: string
    device_type: 'ar_spectacles' | 'web_interface' | 'mobile_backup'
    device_name: string
    platform: string
    capabilities: string[]
    session_id?: string
  }
  sync_data?: {
    data_type: 'user_preferences' | 'conversation_state' | 'object_interactions' | 'learning_patterns' | 'all'
    data_payload: any
    last_sync_timestamp?: string
    force_sync?: boolean
  }
  offline_data?: {
    cached_interactions: any[]
    cached_preferences: any
    cached_ai_responses: any[]
    offline_duration_ms: number
    last_known_state: any
  }
  conflict_resolution?: {
    conflict_id: string
    resolution_strategy: 'primary_wins' | 'latest_wins' | 'merge' | 'user_choice'
    user_choice_data?: any
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
      device_data,
      sync_data,
      offline_data,
      conflict_resolution
    }: DeviceSyncRequest = await req.json()

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
      case 'register_device':
        if (!device_data) {
          throw new Error('device_data required for register_device action')
        }
        result = await registerDevice(supabase, user_id, device_data)
        break

      case 'sync_data':
        if (!sync_data) {
          throw new Error('sync_data required for sync_data action')
        }
        result = await syncData(supabase, user_id, sync_data)
        break

      case 'handle_offline':
        if (!offline_data) {
          throw new Error('offline_data required for handle_offline action')
        }
        result = await handleOfflineSync(supabase, user_id, offline_data)
        break

      case 'resolve_conflicts':
        if (!conflict_resolution) {
          throw new Error('conflict_resolution required for resolve_conflicts action')
        }
        result = await resolveConflicts(supabase, user_id, conflict_resolution)
        break

      case 'get_sync_status':
        result = await getSyncStatus(supabase, user_id)
        break

      case 'cleanup_sessions':
        result = await cleanupSessions(supabase, user_id)
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
    console.error('Device sync error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process device sync request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function registerDevice(supabase: any, userId: string, deviceData: any) {
  const { device_id, device_type, device_name, platform, capabilities, session_id } = deviceData

  // Create or update device registration
  const { data: device } = await supabase
    .from('user_devices')
    .upsert({
      user_id: userId,
      device_id,
      device_type,
      device_name,
      platform,
      capabilities,
      last_seen: new Date().toISOString(),
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  // Create device session
  const sessionId = session_id || crypto.randomUUID()
  const { data: session } = await supabase
    .from('device_sessions')
    .insert({
      user_id: userId,
      device_id,
      session_id: sessionId,
      device_type,
      status: 'active',
      started_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    })
    .select()
    .single()

  // Initialize device sync state
  const { data: syncState } = await supabase
    .from('device_sync_state')
    .upsert({
      user_id: userId,
      primary_device: device_type === 'ar_spectacles' ? device_type : device.primary_device || device_type,
      connected_devices: [{ device_id, device_type, session_id: sessionId }],
      sync_status: 'synced',
      last_sync_time: new Date().toISOString()
    })
    .select()
    .single()

  // Set up initial presence tracking
  await supabase.rpc('update_presence_heartbeat', {
    p_user_id: userId,
    p_session_id: sessionId,
    p_device_type: device_type,
    p_location_context: {},
    p_active_objects: []
  })

  // Broadcast device registration to other devices
  const channel = supabase.channel(`sync_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'device_registered',
    payload: {
      device_id,
      device_type,
      device_name,
      session_id: sessionId,
      registered_at: device.updated_at
    }
  })

  return {
    device_id: device.id,
    session_id: sessionId,
    device_type,
    sync_state_id: syncState.id,
    primary_device: syncState.primary_device,
    registration_successful: true,
    next_heartbeat_in_seconds: 30
  }
}

async function syncData(supabase: any, userId: string, syncData: any) {
  const { data_type, data_payload, last_sync_timestamp, force_sync } = syncData

  const syncResults = {
    synced_items: 0,
    conflicts_detected: 0,
    sync_timestamp: new Date().toISOString(),
    data_types_synced: []
  }

  // Get current sync state
  const { data: currentSyncState } = await supabase
    .from('device_sync_state')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!currentSyncState) {
    throw new Error('Device sync state not found. Please register device first.')
  }

  // Sync different data types
  if (data_type === 'all' || data_type === 'user_preferences') {
    const prefResult = await syncUserPreferences(supabase, userId, data_payload.preferences || data_payload, force_sync)
    syncResults.synced_items += prefResult.synced_count
    syncResults.conflicts_detected += prefResult.conflicts
    syncResults.data_types_synced.push('user_preferences')
  }

  if (data_type === 'all' || data_type === 'conversation_state') {
    const convResult = await syncConversationState(supabase, userId, data_payload.conversation_state || data_payload, force_sync)
    syncResults.synced_items += convResult.synced_count
    syncResults.conflicts_detected += convResult.conflicts
    syncResults.data_types_synced.push('conversation_state')
  }

  if (data_type === 'all' || data_type === 'object_interactions') {
    const objResult = await syncObjectInteractions(supabase, userId, data_payload.object_interactions || data_payload, force_sync)
    syncResults.synced_items += objResult.synced_count
    syncResults.conflicts_detected += objResult.conflicts
    syncResults.data_types_synced.push('object_interactions')
  }

  if (data_type === 'all' || data_type === 'learning_patterns') {
    const learnResult = await syncLearningPatterns(supabase, userId, data_payload.learning_patterns || data_payload, force_sync)
    syncResults.synced_items += learnResult.synced_count
    syncResults.conflicts_detected += learnResult.conflicts
    syncResults.data_types_synced.push('learning_patterns')
  }

  // Update sync state
  await supabase
    .from('device_sync_state')
    .update({
      sync_status: syncResults.conflicts_detected > 0 ? 'conflict' : 'synced',
      last_sync_time: syncResults.sync_timestamp,
      pending_sync_data: {}
    })
    .eq('user_id', userId)

  // Broadcast sync completion to other devices
  const channel = supabase.channel(`sync_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'data_synced',
    payload: {
      sync_results: syncResults,
      data_types: syncResults.data_types_synced,
      conflicts_detected: syncResults.conflicts_detected > 0
    }
  })

  return syncResults
}

async function handleOfflineSync(supabase: any, userId: string, offlineData: any) {
  const { cached_interactions, cached_preferences, cached_ai_responses, offline_duration_ms, last_known_state } = offlineData

  const offlineResults = {
    restored_interactions: 0,
    restored_preferences: 0,
    restored_responses: 0,
    conflicts_created: 0,
    offline_duration_hours: Math.round(offline_duration_ms / (1000 * 60 * 60) * 100) / 100
  }

  // Process cached interactions from offline period
  if (cached_interactions && cached_interactions.length > 0) {
    for (const interaction of cached_interactions) {
      try {
        // Check for duplicates based on timestamp and content
        const { data: existing } = await supabase
          .from('object_interactions')
          .select('id')
          .eq('user_id', userId)
          .eq('interaction_timestamp', interaction.interaction_timestamp)
          .eq('object_type', interaction.object_type)
          .single()

        if (!existing) {
          await supabase
            .from('object_interactions')
            .insert({
              user_id: userId,
              ...interaction,
              context: {
                ...interaction.context,
                restored_from_offline: true,
                offline_duration_ms
              }
            })
          offlineResults.restored_interactions++
        }
      } catch (error) {
        console.error('Error restoring interaction:', error)
      }
    }
  }

  // Process cached preferences
  if (cached_preferences) {
    const currentTime = new Date().toISOString()
    const { data: currentPrefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)

    for (const [prefType, prefValue] of Object.entries(cached_preferences)) {
      const existing = currentPrefs?.find(p => p.preference_type === prefType)

      if (!existing || new Date(existing.updated_at) < new Date(last_known_state.preferences_updated_at || 0)) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            preference_type: prefType,
            preference_value: prefValue,
            updated_at: currentTime
          })
        offlineResults.restored_preferences++
      } else {
        // Conflict detected - newer server data exists
        offlineResults.conflicts_created++
        await createSyncConflict(supabase, userId, {
          data_type: 'user_preferences',
          field: prefType,
          local_value: prefValue,
          server_value: existing.preference_value,
          conflict_reason: 'newer_server_data'
        })
      }
    }
  }

  // Process cached AI responses for quick access
  if (cached_ai_responses && cached_ai_responses.length > 0) {
    for (const response of cached_ai_responses) {
      await supabase
        .from('ai_processing_requests')
        .insert({
          user_id: userId,
          request_type: 'cached_response',
          input_data: response.input_data,
          output_data: response.output_data,
          status: 'completed',
          processing_time_ms: 0,
          created_at: response.created_at || new Date().toISOString()
        })
      offlineResults.restored_responses++
    }
  }

  // Update sync state to reflect offline recovery
  await supabase
    .from('device_sync_state')
    .update({
      sync_status: offlineResults.conflicts_created > 0 ? 'conflict' : 'synced',
      last_sync_time: new Date().toISOString(),
      pending_sync_data: {},
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  // Log offline recovery event
  await supabase
    .from('user_interactions')
    .insert({
      user_id: userId,
      interaction_type: 'offline_recovery',
      content: `Recovered from ${offlineResults.offline_duration_hours}h offline period`,
      context: {
        offline_duration_ms,
        restored_interactions: offlineResults.restored_interactions,
        restored_preferences: offlineResults.restored_preferences,
        conflicts_created: offlineResults.conflicts_created
      }
    })

  return offlineResults
}

async function resolveConflicts(supabase: any, userId: string, conflictResolution: any) {
  const { conflict_id, resolution_strategy, user_choice_data } = conflictResolution

  // Get conflict details
  const { data: conflict } = await supabase
    .from('sync_conflicts')
    .select('*')
    .eq('id', conflict_id)
    .eq('user_id', userId)
    .single()

  if (!conflict) {
    throw new Error('Conflict not found or not owned by user')
  }

  let resolvedValue
  const conflictData = conflict.conflict_data

  // Apply resolution strategy
  switch (resolution_strategy) {
    case 'primary_wins':
      resolvedValue = conflictData.server_value
      break
    case 'latest_wins':
      resolvedValue = conflictData.local_value // Assuming local is latest
      break
    case 'merge':
      resolvedValue = mergeConflictValues(conflictData.server_value, conflictData.local_value)
      break
    case 'user_choice':
      resolvedValue = user_choice_data
      break
    default:
      throw new Error('Invalid resolution strategy')
  }

  // Apply resolution to actual data
  await applyConflictResolution(supabase, userId, conflict, resolvedValue)

  // Mark conflict as resolved
  await supabase
    .from('sync_conflicts')
    .update({
      status: 'resolved',
      resolution_strategy,
      resolved_value: resolvedValue,
      resolved_at: new Date().toISOString()
    })
    .eq('id', conflict_id)

  // Broadcast resolution to other devices
  const channel = supabase.channel(`sync_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'conflict_resolved',
    payload: {
      conflict_id,
      resolution_strategy,
      data_type: conflict.data_type,
      resolved_at: new Date().toISOString()
    }
  })

  return {
    conflict_id,
    resolution_strategy,
    resolved_value,
    resolved_at: new Date().toISOString()
  }
}

async function getSyncStatus(supabase: any, userId: string) {
  // Get current sync state
  const { data: syncState } = await supabase
    .from('device_sync_state')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get active devices
  const { data: activeDevices } = await supabase
    .from('device_sessions')
    .select('*, user_devices(*)')
    .eq('user_id', userId)
    .eq('status', 'active')

  // Get pending conflicts
  const { data: conflicts } = await supabase
    .from('sync_conflicts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')

  // Get recent sync activity
  const { data: recentActivity } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', userId)
    .in('interaction_type', ['device_sync', 'offline_recovery', 'conflict_resolution'])
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    sync_state: syncState,
    active_devices: activeDevices || [],
    pending_conflicts: conflicts || [],
    recent_sync_activity: recentActivity || [],
    last_sync_age_minutes: syncState ? Math.round((Date.now() - new Date(syncState.last_sync_time).getTime()) / (1000 * 60)) : null,
    sync_health: calculateSyncHealth(syncState, conflicts)
  }
}

async function cleanupSessions(supabase: any, userId: string) {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24 hours ago

  // Clean up old device sessions
  const { data: expiredSessions } = await supabase
    .from('device_sessions')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .lt('last_heartbeat', cutoffTime)
    .select()

  // Clean up old presence tracking
  await supabase
    .from('presence_tracking')
    .delete()
    .eq('user_id', userId)
    .lt('last_heartbeat', cutoffTime)

  // Clean up expired conversation states
  await supabase.rpc('cleanup_expired_conversations')

  // Update device sync state to remove inactive devices
  const { data: activeSessions } = await supabase
    .from('device_sessions')
    .select('device_id, device_type, session_id')
    .eq('user_id', userId)
    .eq('status', 'active')

  await supabase
    .from('device_sync_state')
    .update({
      connected_devices: activeSessions || [],
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  return {
    expired_sessions: expiredSessions?.length || 0,
    active_sessions_remaining: activeSessions?.length || 0,
    cleanup_completed_at: new Date().toISOString()
  }
}

// Helper functions
async function syncUserPreferences(supabase: any, userId: string, preferences: any, forceSync: boolean) {
  let syncedCount = 0
  let conflicts = 0

  for (const [prefType, prefValue] of Object.entries(preferences)) {
    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_type: prefType,
          preference_value: prefValue,
          updated_at: new Date().toISOString()
        })
      syncedCount++
    } catch (error) {
      conflicts++
    }
  }

  return { synced_count: syncedCount, conflicts }
}

async function syncConversationState(supabase: any, userId: string, conversationState: any, forceSync: boolean) {
  try {
    await supabase.rpc('update_conversation_state', {
      p_user_id: userId,
      ...conversationState
    })
    return { synced_count: 1, conflicts: 0 }
  } catch (error) {
    return { synced_count: 0, conflicts: 1 }
  }
}

async function syncObjectInteractions(supabase: any, userId: string, interactions: any[], forceSync: boolean) {
  let syncedCount = 0
  let conflicts = 0

  for (const interaction of interactions) {
    try {
      await supabase
        .from('object_interactions')
        .insert({
          user_id: userId,
          ...interaction
        })
      syncedCount++
    } catch (error) {
      conflicts++
    }
  }

  return { synced_count: syncedCount, conflicts }
}

async function syncLearningPatterns(supabase: any, userId: string, patterns: any[], forceSync: boolean) {
  let syncedCount = 0
  let conflicts = 0

  for (const pattern of patterns) {
    try {
      await supabase
        .from('learning_patterns')
        .upsert({
          user_id: userId,
          ...pattern,
          updated_at: new Date().toISOString()
        })
      syncedCount++
    } catch (error) {
      conflicts++
    }
  }

  return { synced_count: syncedCount, conflicts }
}

async function createSyncConflict(supabase: any, userId: string, conflictData: any) {
  return await supabase
    .from('sync_conflicts')
    .insert({
      user_id: userId,
      data_type: conflictData.data_type,
      field_name: conflictData.field,
      conflict_data: {
        local_value: conflictData.local_value,
        server_value: conflictData.server_value,
        conflict_reason: conflictData.conflict_reason
      },
      status: 'pending'
    })
}

async function applyConflictResolution(supabase: any, userId: string, conflict: any, resolvedValue: any) {
  const { data_type, field_name } = conflict

  switch (data_type) {
    case 'user_preferences':
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_type: field_name,
          preference_value: resolvedValue,
          updated_at: new Date().toISOString()
        })
      break
    // Add other data types as needed
  }
}

function mergeConflictValues(serverValue: any, localValue: any) {
  // Simple merge strategy - in practice, this would be more sophisticated
  if (typeof serverValue === 'object' && typeof localValue === 'object') {
    return { ...serverValue, ...localValue }
  }
  return localValue // Default to local value
}

function calculateSyncHealth(syncState: any, conflicts: any[]) {
  if (!syncState) return 'unknown'

  const lastSyncAge = Date.now() - new Date(syncState.last_sync_time).getTime()
  const lastSyncHours = lastSyncAge / (1000 * 60 * 60)

  if (conflicts.length > 0) return 'conflicts'
  if (syncState.sync_status !== 'synced') return 'error'
  if (lastSyncHours > 24) return 'stale'
  if (lastSyncHours > 1) return 'outdated'
  return 'healthy'
}