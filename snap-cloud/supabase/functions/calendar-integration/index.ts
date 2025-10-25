// Task 2.9: Create calendar integration Edge Functions
// Build Edge Function for Google Calendar API integration
// Implement calendar data caching and sync in Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarRequest {
  user_id: string
  action: 'sync_calendar' | 'get_events' | 'get_today' | 'get_upcoming' | 'create_meeting_prep'
  calendar_auth?: {
    access_token: string
    refresh_token?: string
  }
  date_range?: {
    start_date: string
    end_date: string
  }
  event_id?: string
}

interface MeetingPrep {
  meeting_title: string
  meeting_time: string
  attendees: string[]
  agenda?: string
  preparation_notes?: string
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

    const { user_id, action, calendar_auth, date_range, event_id }: CalendarRequest = await req.json()

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
      case 'sync_calendar':
        if (!calendar_auth?.access_token) {
          throw new Error('calendar_auth.access_token required for sync_calendar action')
        }
        result = await syncGoogleCalendar(supabase, user_id, calendar_auth)
        break

      case 'get_events':
        result = await getCalendarEvents(supabase, user_id, date_range)
        break

      case 'get_today':
        result = await getTodayEvents(supabase, user_id)
        break

      case 'get_upcoming':
        result = await getUpcomingEvents(supabase, user_id)
        break

      case 'create_meeting_prep':
        if (!event_id) {
          throw new Error('event_id required for create_meeting_prep action')
        }
        result = await createMeetingPrep(supabase, user_id, event_id)
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
    console.error('Calendar integration error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process calendar request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function syncGoogleCalendar(supabase: any, userId: string, calendarAuth: any) {
  try {
    // Mock Google Calendar API call - in production would use actual API
    const mockEvents = await fetchGoogleCalendarEvents(calendarAuth.access_token)

    const syncedEvents = []
    const errors = []

    // Process each event
    for (const event of mockEvents) {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .upsert({
            user_id: userId,
            event_title: event.summary,
            event_description: event.description || '',
            start_time: event.start.dateTime || event.start.date,
            end_time: event.end.dateTime || event.end.date,
            location: event.location || '',
            google_event_id: event.id,
            event_data: {
              attendees: event.attendees || [],
              meeting_link: event.hangoutLink || '',
              creator: event.creator
            },
            synced_at: new Date().toISOString()
          }, {
            onConflict: 'calendar_events_user_event_unique'
          })
          .select()

        if (error) {
          errors.push({ event_id: event.id, error: error.message })
        } else {
          // .select() returns an array, push the first row only
          if (Array.isArray(data) && data.length > 0) {
            syncedEvents.push(data[0])
          } else {
            syncedEvents.push(data)
          }
        }
      } catch (eventError) {
        errors.push({ event_id: event.id, error: eventError.message })
      }
    }

    // Broadcast real-time notification about calendar sync
    const channel = supabase.channel(`calendar_${userId}`)
    const subscription = channel.subscribe()
    const subResult = await subscription;
    if (subResult && subResult.status === 'SUBSCRIBED') {
      await channel.send({
        type: 'broadcast',
        event: 'calendar_synced',
        payload: {
          synced_count: syncedEvents.length,
          error_count: errors.length,
          sync_time: new Date().toISOString()
        }
      })
      await channel.unsubscribe()
    } else {
      errors.push({ error: 'Realtime channel subscription failed for calendar sync' })
    }

    return {
      synced_events: syncedEvents,
      sync_errors: errors,
      total_synced: syncedEvents.length,
      sync_time: new Date().toISOString()
    }

  } catch (error) {
    throw new Error(`Calendar sync failed: ${error.message}`)
  }
}

async function fetchGoogleCalendarEvents(accessToken: string) {
  // Mock Google Calendar API response - in production would make actual API call
  return [
    {
      id: 'event_1',
      summary: 'Team Standup',
      description: 'Daily team standup meeting',
      start: { dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
      end: { dateTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString() },
      location: 'Conference Room A',
      attendees: [
        { email: 'team@company.com' }
      ],
      creator: { email: 'manager@company.com' }
    },
    {
      id: 'event_2',
      summary: 'Lunch with Client',
      description: 'Business lunch discussion',
      start: { dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() },
      end: { dateTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() },
      location: 'Downtown Restaurant',
      attendees: [
        { email: 'client@clientcompany.com' }
      ]
    },
    {
      id: 'event_3',
      summary: 'Project Review',
      description: 'Weekly project status review',
      start: { dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
      end: { dateTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString() },
      location: 'Virtual Meeting',
      hangoutLink: 'https://meet.google.com/abc-def-ghi'
    }
  ]
}

async function getCalendarEvents(supabase: any, userId: string, dateRange?: any) {
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true })

  if (dateRange) {
    // Validate and normalize dateRange
    let { start_date, end_date } = dateRange
    let startISO: string | undefined
    let endISO: string | undefined
    if (start_date) {
      startISO = new Date(start_date).toISOString()
      if (isNaN(Date.parse(startISO))) {
        return { error: 'Invalid start_date in dateRange' }
      }
    }
    if (end_date) {
      endISO = new Date(end_date).toISOString()
      if (isNaN(Date.parse(endISO))) {
        return { error: 'Invalid end_date in dateRange' }
      }
    }
    if (startISO && endISO && startISO > endISO) {
      return { error: 'dateRange.start_date must be <= dateRange.end_date' }
    }
    // Overlap-safe filter: start_time <= end_date AND end_time >= start_date
    if (startISO && endISO) {
      query = query
        .lte('start_time', endISO)
        .gte('end_time', startISO)
    } else if (startISO) {
      query = query.gte('end_time', startISO)
    } else if (endISO) {
      query = query.lte('start_time', endISO)
    }
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return {
    events: data || [],
    count: data?.length || 0,
    date_range: dateRange
  }
}

async function getTodayEvents(supabase: any, userId: string) {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  if (error) {
    throw error
  }

  const now = new Date()
  const upcomingEvents = data?.filter(event => new Date(event.start_time) > now) || []
  const currentEvent = data?.find(event =>
    new Date(event.start_time) <= now && new Date(event.end_time) > now
  )

  return {
    today_events: data || [],
    current_event: currentEvent,
    upcoming_today: upcomingEvents,
    next_event: upcomingEvents[0] || null
  }
}

async function getUpcomingEvents(supabase: any, userId: string) {
  const now = new Date().toISOString()
  const endOfWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', now)
    .lte('start_time', endOfWeek)
    .order('start_time', { ascending: true })
    .limit(10)

  if (error) {
    throw error
  }

  return {
    upcoming_events: data || [],
    next_24_hours: data?.filter(event =>
      new Date(event.start_time) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    ) || [],
    immediate_next: data?.[0] || null
  }
}

async function createMeetingPrep(supabase: any, userId: string, eventId: string) {
  // Get the event details
  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', userId)
    .single()

  if (eventError) {
    throw eventError
  }

  // Generate meeting preparation suggestions
  const meetingPrep: MeetingPrep = {
    meeting_title: event.event_title,
    meeting_time: event.start_time,
    attendees: event.event_data?.attendees?.map((a: any) => a.email) || [],
    agenda: generateAgenda(event),
    preparation_notes: generatePrepNotes(event)
  }

  // Store meeting prep data
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      event_data: {
        ...event.event_data,
        meeting_prep: meetingPrep,
        prep_generated_at: new Date().toISOString()
      }
    })
    .eq('id', eventId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  // Broadcast real-time notification
  const channel = supabase.channel(`calendar_${userId}`)
  const subscription = channel.subscribe()
  const subResult = await subscription;
  if (subResult && subResult.status === 'SUBSCRIBED') {
    await channel.send({
      type: 'broadcast',
      event: 'meeting_prep_created',
      payload: {
        event_id: eventId,
        meeting_prep: meetingPrep
      }
    })
    await channel.unsubscribe()
  } else {
    throw new Error('Realtime channel subscription failed for meeting prep notification')
  }

  return {
    event: data,
    meeting_prep: meetingPrep
  }
}

function generateAgenda(event: any): string {
  const topics = [
    'Review previous action items',
    `Discuss ${event.event_title.toLowerCase()} objectives`,
    'Address any blockers or challenges',
    'Plan next steps and assign responsibilities'
  ]

  return topics.join('\n• ')
}

function generatePrepNotes(event: any): string {
  const notes = [
    'Review relevant documents beforehand',
    'Prepare status updates on current projects',
    'List any questions or concerns to discuss',
    'Bring necessary materials or presentations'
  ]

  if (event.location?.includes('Virtual') || event.event_data?.meeting_link) {
    notes.push('Test video/audio setup before the meeting')
  }

  return notes.join('\n• ')
}