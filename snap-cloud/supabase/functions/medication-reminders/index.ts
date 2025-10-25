// Task 2.3: Create health data schema and Edge Functions
// Implement Edge Functions for medication timing and notifications

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MedicationReminderRequest {
  user_id: string
  action: 'create_schedule' | 'get_reminders' | 'acknowledge' | 'snooze' | 'get_upcoming'
  medication_schedule?: {
    medication_name: string
    dosage: string
    schedule_times: string[] // Array of time strings like "08:00", "20:00"
    days_of_week: number[] // 0=Sunday, 1=Monday, etc.
  }
  reminder_id?: string
  snooze_minutes?: number
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

    const { user_id, action, medication_schedule, reminder_id, snooze_minutes }: MedicationReminderRequest = await req.json()

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
      case 'create_schedule':
        if (!medication_schedule) {
          throw new Error('medication_schedule required for create_schedule action')
        }
        result = await createMedicationSchedule(supabase, user_id, medication_schedule)
        break

      case 'get_reminders':
        result = await getCurrentReminders(supabase, user_id)
        break

      case 'get_upcoming':
        result = await getUpcomingReminders(supabase, user_id)
        break

      case 'acknowledge':
        if (!reminder_id) {
          throw new Error('reminder_id required for acknowledge action')
        }
        result = await acknowledgeReminder(supabase, user_id, reminder_id)
        break

      case 'snooze':
        if (!reminder_id || !snooze_minutes) {
          throw new Error('reminder_id and snooze_minutes required for snooze action')
        }
        result = await snoozeReminder(supabase, user_id, reminder_id, snooze_minutes)
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
    console.error('Medication reminders error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process medication reminder request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function createMedicationSchedule(supabase: any, userId: string, schedule: any) {
  // Insert medication schedule
  const { data: scheduleData, error: scheduleError } = await supabase
    .from('medication_schedules')
    .insert({
      user_id: userId,
      medication_name: schedule.medication_name,
      dosage: schedule.dosage,
      schedule_times: schedule.schedule_times,
      days_of_week: schedule.days_of_week,
      active: true
    })
    .select()
    .single()

  if (scheduleError) {
    throw scheduleError
  }

  // Create daily reminders for this schedule
  const reminderCount = await supabase.rpc('create_daily_medication_reminders', {
    p_user_id: userId
  })

  // Broadcast real-time notification about new schedule
  const channel = supabase.channel(`health_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'medication_schedule_created',
    payload: {
      schedule: scheduleData,
      reminders_created: reminderCount.data || 0
    }
  })

  return {
    schedule: scheduleData,
    reminders_created: reminderCount.data || 0
  }
}

async function getCurrentReminders(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc('get_upcoming_health_reminders', {
    p_user_id: userId
  })

  if (error) {
    throw error
  }

  return {
    reminders: data || [],
    count: data?.length || 0
  }
}

async function getUpcomingReminders(supabase: any, userId: string) {
  // Get reminders for the next 24 hours
  const { data, error } = await supabase
    .from('health_reminders')
    .select(`
      id,
      reminder_time,
      status,
      medication_schedules (
        medication_name,
        dosage
      )
    `)
    .eq('user_id', userId)
    .gte('reminder_time', new Date().toISOString())
    .lte('reminder_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'pending')
    .order('reminder_time', { ascending: true })

  if (error) {
    throw error
  }

  return {
    upcoming_reminders: data || [],
    next_reminder: data?.[0] || null
  }
}

async function acknowledgeReminder(supabase: any, userId: string, reminderId: string) {
  const { data, error } = await supabase
    .from('health_reminders')
    .update({
      status: 'completed',
      acknowledged_at: new Date().toISOString()
    })
    .eq('id', reminderId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  // Broadcast real-time notification
  const channel = supabase.channel(`health_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'medication_taken',
    payload: {
      reminder: data,
      timestamp: new Date().toISOString()
    }
  })

  return {
    acknowledged_reminder: data
  }
}

async function snoozeReminder(supabase: any, userId: string, reminderId: string, snoozeMinutes: number) {
  // Get current reminder
  const { data: currentReminder, error: fetchError } = await supabase
    .from('health_reminders')
    .select('reminder_time')
    .eq('id', reminderId)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    throw fetchError
  }

  // Calculate new reminder time
  const currentTime = new Date(currentReminder.reminder_time)
  const newTime = new Date(currentTime.getTime() + snoozeMinutes * 60 * 1000)

  // Update reminder
  const { data, error } = await supabase
    .from('health_reminders')
    .update({
      reminder_time: newTime.toISOString(),
      status: 'snoozed'
    })
    .eq('id', reminderId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  // Broadcast real-time notification
  const channel = supabase.channel(`health_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'medication_snoozed',
    payload: {
      reminder: data,
      snoozed_minutes: snoozeMinutes,
      new_time: newTime.toISOString()
    }
  })

  return {
    snoozed_reminder: data,
    new_reminder_time: newTime.toISOString()
  }
}