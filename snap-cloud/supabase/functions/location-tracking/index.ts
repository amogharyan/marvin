// Task 2.12: Create location tracking schema
// Create Edge Functions for location updates and queries
// Implement departure checklist management with real-time updates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationRequest {
  user_id: string
  action: 'update_location' | 'find_object' | 'get_departure_checklist' | 'track_departure' | 'get_location_history'
  location_data?: {
    object_type: string
    object_identifier: string
    location: {
      x: number
      y: number
      z: number
      room?: string
      description?: string
    }
    confidence_score?: number
  }
  object_search?: {
    object_type: string
    object_identifier?: string
  }
  departure_data?: {
    checklist_items: string[]
    departure_time?: string
    destination?: string
  }
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

    const { user_id, action, location_data, object_search, departure_data }: LocationRequest = await req.json()

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
      case 'update_location':
        if (!location_data) {
          throw new Error('location_data required for update_location action')
        }
        result = await updateObjectLocation(supabase, user_id, location_data)
        break

      case 'find_object':
        if (!object_search) {
          throw new Error('object_search required for find_object action')
        }
        result = await findObject(supabase, user_id, object_search)
        break

      case 'get_departure_checklist':
        result = await getDepartureChecklist(supabase, user_id)
        break

      case 'track_departure':
        if (!departure_data) {
          throw new Error('departure_data required for track_departure action')
        }
        result = await trackDeparture(supabase, user_id, departure_data)
        break

      case 'get_location_history':
        result = await getLocationHistory(supabase, user_id, object_search)
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
    console.error('Location tracking error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process location request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function updateObjectLocation(supabase: any, userId: string, locationData: any) {
  // Use the existing database function to update location
  const { data, error } = await supabase.rpc('update_object_location', {
    p_user_id: userId,
    p_object_type: locationData.object_type,
    p_object_identifier: locationData.object_identifier,
    p_location: locationData.location,
    p_confidence_score: locationData.confidence_score || 0.0
  })

  if (error) {
    throw error
  }

  // Store location history entry
  await supabase
    .from('object_interactions')
    .insert({
      user_id: userId,
      object_type: locationData.object_type,
      interaction_type: 'location_updated',
      spatial_data: locationData.location,
      confidence_score: locationData.confidence_score || 0.0,
      context: {
        location_tracking: true,
        room: locationData.location.room,
        description: locationData.location.description
      }
    })

  // Broadcast real-time location update
  const channel = supabase.channel(`location_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'location_updated',
    payload: {
      object_type: locationData.object_type,
      object_identifier: locationData.object_identifier,
      location: locationData.location,
      timestamp: new Date().toISOString()
    }
  })

  return {
    location_id: data,
    object_type: locationData.object_type,
    object_identifier: locationData.object_identifier,
    updated_location: locationData.location
  }
}

async function findObject(supabase: any, userId: string, objectSearch: any) {
  // Query the object_locations table
  let query = supabase
    .from('object_locations')
    .select('*')
    .eq('user_id', userId)
    .eq('object_type', objectSearch.object_type)
    .order('last_seen_at', { ascending: false })

  if (objectSearch.object_identifier) {
    query = query.eq('object_identifier', objectSearch.object_identifier)
  }

  const { data: locations, error } = await query.limit(5)

  if (error) {
    throw error
  }

  // Get recent interaction history for better context
  const { data: interactions } = await supabase
    .from('object_interactions')
    .select('*')
    .eq('user_id', userId)
    .eq('object_type', objectSearch.object_type)
    .order('interaction_timestamp', { ascending: false })
    .limit(10)

  // Generate location guidance
  const guidance = generateLocationGuidance(locations, interactions)

  return {
    search_object: objectSearch,
    found_locations: locations || [],
    most_recent_location: locations?.[0] || null,
    recent_interactions: interactions || [],
    guidance,
    search_confidence: calculateSearchConfidence(locations)
  }
}

async function getDepartureChecklist(supabase: any, userId: string) {
  // Get today's calendar events
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const { data: todayEvents } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  // Get user's typical morning routine objects
  const { data: routineObjects } = await supabase
    .rpc('get_routine_objects', { p_user_id: userId })

  // Generate dynamic checklist
  const checklist = generateDepartureChecklist(todayEvents, routineObjects)

  return {
    generated_at: new Date().toISOString(),
    checklist_items: checklist,
    today_events: todayEvents || [],
    next_event: todayEvents?.[0] || null,
    routine_objects: routineObjects || []
  }
}

async function trackDeparture(supabase: any, userId: string, departureData: any) {
  // Create departure tracking entry
  const { data, error } = await supabase
    .from('user_interactions')
    .insert({
      user_id: userId,
      interaction_type: 'departure_tracking',
      content: `Departure tracked with ${departureData.checklist_items.length} checklist items`,
      context: {
        departure_time: departureData.departure_time || new Date().toISOString(),
        destination: departureData.destination,
        checklist_items: departureData.checklist_items,
        checklist_completed: departureData.checklist_items.length
      }
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  // Check for common departure items
  const missingItems = await checkMissingDepartureItems(supabase, userId, departureData.checklist_items)

  // Broadcast real-time departure notification
  const channel = supabase.channel(`location_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'departure_tracked',
    payload: {
      departure_time: departureData.departure_time || new Date().toISOString(),
      checklist_completed: departureData.checklist_items,
      missing_items: missingItems,
      destination: departureData.destination
    }
  })

  return {
    departure_log: data,
    checklist_items: departureData.checklist_items,
    missing_items: missingItems,
    departure_score: calculateDepartureScore(departureData.checklist_items, missingItems)
  }
}

async function getLocationHistory(supabase: any, userId: string, objectSearch?: any) {
  let query = supabase
    .from('object_locations')
    .select('*')
    .eq('user_id', userId)
    .order('last_seen_at', { ascending: false })

  if (objectSearch?.object_type) {
    query = query.eq('object_type', objectSearch.object_type)
  }

  const { data: locations, error } = await query.limit(50)

  if (error) {
    throw error
  }

  // Group by object type for analysis
  const locationsByType = locations?.reduce((acc: any, location: any) => {
    if (!acc[location.object_type]) {
      acc[location.object_type] = []
    }
    acc[location.object_type].push(location)
    return acc
  }, {}) || {}

  // Analyze location patterns
  const patterns = analyzeLocationPatterns(locations)

  return {
    location_history: locations || [],
    locations_by_type: locationsByType,
    patterns,
    total_tracked_objects: Object.keys(locationsByType).length
  }
}

function generateLocationGuidance(locations: any[], interactions: any[]) {
  if (!locations || locations.length === 0) {
    return ['This object hasn\'t been seen recently', 'Try checking common areas like desk, kitchen, or bedroom']
  }

  const mostRecent = locations[0]
  const guidance = [
    `Last seen ${getTimeAgo(mostRecent.last_seen_at)} in ${mostRecent.last_known_location?.room || 'unknown location'}`
  ]

  // Add confidence-based guidance
  if (mostRecent.confidence_score < 0.5) {
    guidance.push('Location confidence is low - double-check the area')
  }

  // Add pattern-based suggestions
  if (interactions && interactions.length > 0) {
    const commonAreas = findCommonAreas(interactions)
    if (commonAreas.length > 0) {
      guidance.push(`Also commonly found in: ${commonAreas.join(', ')}`)
    }
  }

  return guidance
}

function generateDepartureChecklist(events: any[], routineObjects: any[]) {
  const checklist = ['Check weather and dress appropriately']

  // Add routine objects
  if (routineObjects) {
    routineObjects.forEach((obj: any) => {
      checklist.push(`Get your ${obj.object_type}`)
    })
  }

  // Add event-specific items
  if (events && events.length > 0) {
    const nextEvent = events[0]
    if (nextEvent) {
      checklist.push(`Prepare for: ${nextEvent.event_title}`)

      if (nextEvent.location && !nextEvent.location.includes('Virtual')) {
        checklist.push(`Travel to: ${nextEvent.location}`)
      }

      if (nextEvent.event_data?.meeting_link) {
        checklist.push('Test video call setup if needed')
      }
    }
  }

  // Standard departure items
  checklist.push('Lock the door')
  checklist.push('Turn off lights')

  return checklist
}

async function checkMissingDepartureItems(supabase: any, userId: string, completedItems: string[]) {
  const essentialItems = ['keys', 'phone', 'wallet']
  const missingItems = []

  for (const item of essentialItems) {
    // Check if this item was mentioned in checklist
    const itemMentioned = completedItems.some(checklistItem =>
      checklistItem.toLowerCase().includes(item)
    )

    if (!itemMentioned) {
      // Check last known location of this item
      const { data: location } = await supabase
        .from('object_locations')
        .select('*')
        .eq('user_id', userId)
        .eq('object_type', item)
        .order('last_seen_at', { ascending: false })
        .limit(1)
        .single()

      if (!location || new Date(location.last_seen_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        missingItems.push({
          item,
          status: 'not_recently_seen',
          last_seen: location?.last_seen_at || null
        })
      }
    }
  }

  return missingItems
}

function calculateSearchConfidence(locations: any[]) {
  if (!locations || locations.length === 0) return 0

  const mostRecent = locations[0]
  const hoursAgo = (Date.now() - new Date(mostRecent.last_seen_at).getTime()) / (1000 * 60 * 60)

  // Confidence decreases over time
  let timeConfidence = Math.max(0, 1 - hoursAgo / 24)

  return Math.min(1, timeConfidence * (mostRecent.confidence_score || 0.5))
}

function calculateDepartureScore(completedItems: string[], missingItems: any[]) {
  const totalPossiblePoints = 10
  const completedPoints = Math.min(8, completedItems.length)
  const missingPenalty = missingItems.length * 2

  return Math.max(0, Math.min(10, completedPoints - missingPenalty))
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffHours > 24) {
    return `${Math.floor(diffHours / 24)} days ago`
  } else if (diffHours > 0) {
    return `${diffHours} hours ago`
  } else {
    return `${diffMinutes} minutes ago`
  }
}

function findCommonAreas(interactions: any[]): string[] {
  const areaCounts: Record<string, number> = {}

  interactions.forEach((interaction: any) => {
    const room = interaction.spatial_data?.room || interaction.context?.room
    if (room) {
      areaCounts[room] = (areaCounts[room] || 0) + 1
    }
  })

  return Object.entries(areaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([room]) => room)
}

function analyzeLocationPatterns(locations: any[]) {
  const patterns = {
    most_tracked_objects: [] as string[],
    frequent_locations: [] as string[],
    recent_activity: locations?.slice(0, 10) || []
  }

  if (locations && locations.length > 0) {
    // Count object types
    const objectCounts: Record<string, number> = {}
    const locationCounts: Record<string, number> = {}

    locations.forEach((location: any) => {
      objectCounts[location.object_type] = (objectCounts[location.object_type] || 0) + 1

      const room = location.last_known_location?.room
      if (room) {
        locationCounts[room] = (locationCounts[room] || 0) + 1
      }
    })

    patterns.most_tracked_objects = Object.entries(objectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([object]) => object)

    patterns.frequent_locations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location]) => location)
  }

  return patterns
}