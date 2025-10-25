// Task 2.14: Create learning coordination schema
// Create Edge Functions for interaction analysis and personalization
// Implement routine pattern analysis with Supabase functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LearningRequest {
  user_id: string
  action: 'analyze_patterns' | 'update_preferences' | 'get_personalization' | 'learn_routine' | 'get_insights'
  interaction_data?: {
    interaction_type: string
    content: string
    context?: any
    embedding?: number[]
  }
  pattern_analysis?: {
    time_range_days: number
    pattern_types: string[]
  }
  preference_updates?: {
    category: string
    preferences: Record<string, any>
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Read Authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const token = authHeader.replace('Bearer ', '').trim()

    // Create admin client for DB ops
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    // Create auth client for identity check
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      token
    )

    const { user_id, action, interaction_data, pattern_analysis, preference_updates }: LearningRequest = await req.json()

    if (!user_id || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Authenticate user and bind to user_id
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (authData.user.id !== user_id) {
      return new Response(JSON.stringify({ error: 'Forbidden: user_id does not match authenticated user' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let result: any

    switch (action) {
      // Add medication schedule creation with validation
      case 'create_schedule':
        if (!interaction_data?.medication_schedule) {
          throw new Error('medication_schedule required for create_schedule action')
        }
        const medication_schedule = interaction_data.medication_schedule
        if (!medication_schedule.medication_name || !medication_schedule.dosage || 
            !medication_schedule.schedule_times || !medication_schedule.days_of_week) {
          throw new Error('medication_schedule must include medication_name, dosage, schedule_times, and days_of_week')
        }
        result = await createMedicationSchedule(supabase, user_id, medication_schedule)
        break
      case 'analyze_patterns':
        result = await analyzeUserPatterns(supabase, user_id, pattern_analysis)
        break

      case 'update_preferences':
        if (!preference_updates) {
          throw new Error('preference_updates required for update_preferences action')
        }
        result = await updateUserPreferences(supabase, user_id, preference_updates)
        break

      case 'get_personalization':
        result = await getPersonalizationData(supabase, user_id)
        break

      case 'learn_routine':
        result = await learnMorningRoutine(supabase, user_id)
        break

      case 'get_insights':
        result = await getUserInsights(supabase, user_id)
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
    console.error('Learning coordination error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process learning request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function analyzeUserPatterns(supabase: any, userId: string, analysisConfig?: any) {
  const timeRangeDays = analysisConfig?.time_range_days || 30
  const startDate = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000)

  // Use the existing database function for pattern analysis
  const { data: interactionPatterns, error: patternsError } = await supabase.rpc('analyze_interaction_patterns', {
    p_user_id: userId
  })

  if (patternsError) {
    console.error('Pattern analysis error:', patternsError)
  }

  // Analyze different types of patterns
  const patterns = {
    morning_routine: await analyzeMorningRoutine(supabase, userId, startDate),
    object_usage: await analyzeObjectUsage(supabase, userId, startDate),
    health_habits: await analyzeHealthHabits(supabase, userId, startDate),
    interaction_patterns: interactionPatterns || []
  }

  // Generate learning insights
  const insights = generateLearningInsights(patterns)

  // Update learning patterns table
  await updateLearningPatterns(supabase, userId, patterns, insights)

  // Broadcast real-time learning update
  const channel = supabase.channel(`learning_${userId}`)
    // Reliable notification: persist to notifications table, let Realtime deliver
    const { error: notifError } = await supabaseAdmin.from('notifications').insert({
      user_id,
      event_type: 'patterns_analyzed',
      payload: {
        patterns_found: Object.keys(patterns).length,
        insights_generated: insights.length,
        analysis_date: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    })
    if (notifError) {
      console.error('Failed to persist notification:', notifError)
    }

  return {
    patterns,
    insights,
    analysis_period: `${timeRangeDays} days`,
    patterns_found: Object.values(patterns).filter(val => {
      if (Array.isArray(val)) {
        return val.length > 0
      }
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return Object.keys(val).length > 0
      }
      return Boolean(val)
    }).length
  }
}

async function analyzeMorningRoutine(supabase: any, userId: string, startDate: Date) {
  // Query by date only
  const { data: interactions } = await supabase
    .from('object_interactions')
    .select('*')
    .eq('user_id', userId)
    .gte('interaction_timestamp', startDate.toISOString())
    .order('interaction_timestamp', { ascending: true })

  // Filter client-side for 06:00–10:00 time window
  const morningInteractions = (interactions ?? []).filter(row => {
    const ts = new Date(row.interaction_timestamp)
    const hour = ts.getHours()
    return hour >= 6 && hour < 10
  })

  if (!morningInteractions || morningInteractions.length === 0) {
    return { routine_identified: false, patterns: [] }
  }

  // Group by day and analyze sequence
  const dailyRoutines = groupInteractionsByDay(morningInteractions)
  const commonSequences = findCommonSequences(dailyRoutines)

  return {
    routine_identified: commonSequences.length > 0,
    patterns: commonSequences,
    total_morning_days: Object.keys(dailyRoutines).length,
    most_common_objects: getMostCommonObjects(morningInteractions)
  }
}

async function analyzeObjectUsage(supabase: any, userId: string, startDate: Date) {
  const { data: objectInteractions } = await supabase
    .from('object_interactions')
    .select('object_type, interaction_type, interaction_timestamp')
    .eq('user_id', userId)
    .gte('interaction_timestamp', startDate.toISOString())

  if (!objectInteractions || objectInteractions.length === 0) {
    return { usage_patterns: [], frequency_analysis: {} }
  }

  const usagePatterns = analyzeUsageFrequency(objectInteractions)
  const timePatterns = analyzeUsageByTime(objectInteractions)

  return {
    usage_patterns: usagePatterns,
    time_patterns: timePatterns,
    most_used_objects: usagePatterns.slice(0, 5),
    total_interactions: objectInteractions.length
  }
}

async function analyzeHealthHabits(supabase: any, userId: string, startDate: Date) {
  // Analyze medication reminders
  const { data: healthReminders } = await supabase
    .from('health_reminders')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  // Analyze nutrition logs
  const { data: foodLogs } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', startDate.toISOString())

  const habits = {
    medication_compliance: analyzeMedicationCompliance(healthReminders),
    nutrition_consistency: analyzeNutritionConsistency(foodLogs),
    health_engagement: calculateHealthEngagement(healthReminders, foodLogs)
  }

  return habits
}

async function updateUserPreferences(supabase: any, userId: string, preferenceUpdates: any) {
  // Get current preferences
  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('preferences')
    .eq('user_id', userId)
    .single()

  const currentPreferences = currentProfile?.preferences || {}
  const updatedPreferences = {
    ...currentPreferences,
    [preferenceUpdates.category]: {
      ...currentPreferences[preferenceUpdates.category],
      ...preferenceUpdates.preferences,
      updated_at: new Date().toISOString()
    }
  }

  // Update preferences
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      preferences: updatedPreferences,
      updated_at: new Date().toISOString()
    })
    .select()

  if (error) {
    throw error
  }

  return {
    updated_preferences: updatedPreferences,
    category: preferenceUpdates.category,
    changes_made: Object.keys(preferenceUpdates.preferences)
  }
}

async function getPersonalizationData(supabase: any, userId: string) {
  // Get user profile and preferences
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get recent learning patterns
  const { data: learningPatterns } = await supabase
    .from('learning_patterns')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('last_triggered', { ascending: false })
    .limit(10)

  // Get recent interactions for context
  const { data: recentInteractions } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const personalization = {
    user_profile: profile,
    active_patterns: learningPatterns || [],
    recent_context: recentInteractions || [],
    personalization_score: calculatePersonalizationScore(profile, learningPatterns),
    recommendations: generatePersonalizedRecommendations(profile, learningPatterns, recentInteractions)
  }

  return personalization
}

async function learnMorningRoutine(supabase: any, userId: string) {
  // Use existing function to update user preferences based on patterns
  const { data: updatedPreferences, error } = await supabase.rpc('update_user_preferences', {
    p_user_id: userId
  })

  if (error) {
    throw error
  }

  // Analyze current morning routine patterns
  const morningAnalysis = await analyzeMorningRoutine(
    supabase,
    userId,
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Last 14 days
  )

  // Create or update learning pattern
  const { data: learningPattern } = await supabase
    .from('learning_patterns')
    .upsert({
      user_id: userId,
      pattern_name: 'morning_routine',
      pattern_description: 'Learned morning routine based on object interactions',
      pattern_rules: {
        routine_steps: morningAnalysis.patterns,
        common_objects: morningAnalysis.most_common_objects,
        learned_from_days: morningAnalysis.total_morning_days
      },
      confidence_score: calculateRoutineConfidence(morningAnalysis),
      active: true,
      last_triggered: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()

  return {
    morning_routine: morningAnalysis,
    updated_preferences: updatedPreferences,
    learning_pattern: learningPattern,
    routine_confidence: calculateRoutineConfidence(morningAnalysis)
  }
}

async function getUserInsights(supabase: any, userId: string) {
  // Get comprehensive user data
  const [profile, patterns, interactions, health] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('learning_patterns').select('*').eq('user_id', userId).eq('active', true),
    supabase.from('object_interactions').select('*').eq('user_id', userId).gte('interaction_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('health_reminders').select('*').eq('user_id', userId).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ])

  const insights = {
    activity_summary: {
      total_interactions: interactions.data?.length || 0,
      unique_objects: new Set(interactions.data?.map(i => i.object_type) || []).size,
      health_engagement: health.data?.length || 0
    },
    behavioral_insights: generateBehavioralInsights(interactions.data, patterns.data),
    improvement_suggestions: generateImprovementSuggestions(profile.data, patterns.data),
    learning_progress: calculateLearningProgress(patterns.data),
    next_steps: generateNextSteps(profile.data, patterns.data)
  }

  return insights
}

async function updateLearningPatterns(supabase: any, userId: string, patterns: any, insights: any) {
  const learningPatterns = []

  // Create pattern entries for each discovered pattern type
  for (const [patternType, patternData] of Object.entries(patterns)) {
    if (Array.isArray(patternData) && patternData.length > 0) {
      learningPatterns.push({
        user_id: userId,
        pattern_name: patternType,
        pattern_description: `Automatically detected ${patternType} pattern`,
        pattern_rules: patternData,
        confidence_score: calculatePatternConfidence(patternData),
        active: true,
        last_triggered: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  if (learningPatterns.length > 0) {
    await supabase
      .from('learning_patterns')
      .upsert(learningPatterns)
  }

  return learningPatterns
}

// Helper functions for analysis
function groupInteractionsByDay(interactions: any[]) {
  return interactions.reduce((acc, interaction) => {
    const day = interaction.interaction_timestamp.split('T')[0]
    if (!acc[day]) acc[day] = []
    acc[day].push(interaction)
    return acc
  }, {})
}

function findCommonSequences(dailyRoutines: any) {
  const sequences = Object.values(dailyRoutines).map((day: any) =>
    day.map((interaction: any) => interaction.object_type)
  )

  // Find most common 3-object sequences
  const sequenceCounts: Record<string, number> = {}
  sequences.forEach((sequence: string[]) => {
    for (let i = 0; i < sequence.length - 2; i++) {
      const subseq = sequence.slice(i, i + 3).join('->')
      sequenceCounts[subseq] = (sequenceCounts[subseq] || 0) + 1
    }
  })

  return Object.entries(sequenceCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([sequence, count]) => ({ sequence, frequency: count }))
}

function getMostCommonObjects(interactions: any[]) {
  const objectCounts = interactions.reduce((acc, interaction) => {
    acc[interaction.object_type] = (acc[interaction.object_type] || 0) + 1
    return acc
  }, {})

  return Object.entries(objectCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([object, count]) => ({ object, count }))
}

function analyzeUsageFrequency(interactions: any[]) {
  const frequency = interactions.reduce((acc, interaction) => {
    const key = interaction.object_type
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .map(([object, count]) => ({ object, frequency: count }))
}

function analyzeUsageByTime(interactions: any[]) {
  const timePatterns = interactions.reduce((acc, interaction) => {
    const hour = new Date(interaction.interaction_timestamp).getHours()
    const timeSlot = getTimeSlot(hour)
    acc[timeSlot] = (acc[timeSlot] || 0) + 1
    return acc
  }, {})

  return timePatterns
}

function getTimeSlot(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

function analyzeMedicationCompliance(reminders: any[]) {
  if (!reminders || reminders.length === 0) return { compliance_rate: 0, total_reminders: 0 }

  const completed = reminders.filter(r => r.status === 'completed').length
  return {
    compliance_rate: completed / reminders.length,
    total_reminders: reminders.length,
    completed_reminders: completed
  }
}

function analyzeNutritionConsistency(foodLogs: any[]) {
  if (!foodLogs || foodLogs.length === 0) return { consistency_score: 0, total_logs: 0 }

  const dailyLogs = groupByDay(foodLogs, 'logged_at')
  const daysWithLogs = Object.keys(dailyLogs).length
  const avgLogsPerDay = foodLogs.length / Math.max(1, daysWithLogs)

  return {
    consistency_score: Math.min(1, avgLogsPerDay / 3), // Assuming 3 meals per day is optimal
    total_logs: foodLogs.length,
    days_tracked: daysWithLogs,
    avg_logs_per_day: avgLogsPerDay
  }
}

function groupByDay(items: any[], dateField: string) {
  return items.reduce((acc, item) => {
    const day = item[dateField].split('T')[0]
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {})
}

function calculateHealthEngagement(reminders: any[], foodLogs: any[]) {
  const reminderEngagement = reminders?.length || 0
  const nutritionEngagement = foodLogs?.length || 0
  return Math.min(10, (reminderEngagement + nutritionEngagement) / 10)
}

function calculatePersonalizationScore(profile: any, patterns: any[]) {
  let score = 0
  if (profile?.preferences) score += 30
  if (profile?.morning_routine) score += 20
  if (patterns && patterns.length > 0) score += 50
  return Math.min(100, score)
}

function generatePersonalizedRecommendations(profile: any, patterns: any[], interactions: any[]) {
  const recommendations = []

  if (!patterns || patterns.length === 0) {
    recommendations.push('Continue using Marvin to build personalized patterns')
  }

  if (patterns?.some(p => p.pattern_name === 'morning_routine')) {
    recommendations.push('Your morning routine is well established')
  } else {
    recommendations.push('Try to maintain consistent morning activities')
  }

  return recommendations
}

function generateLearningInsights(patterns: any) {
  const insights = []

  if (patterns.morning_routine?.routine_identified) {
    insights.push({
      type: 'routine_identified',
      message: 'Your morning routine pattern has been learned',
      confidence: patterns.morning_routine.patterns.length > 0 ? 0.8 : 0.5
    })
  }

  if (patterns.object_usage?.most_used_objects?.length > 0) {
    insights.push({
      type: 'usage_pattern',
      message: `Your most used object is ${patterns.object_usage.most_used_objects[0].object}`,
      confidence: 0.9
    })
  }

  return insights
}

function generateBehavioralInsights(interactions: any[], patterns: any[]) {
  const insights = []

  if (interactions && interactions.length > 0) {
    const mostActiveTime = getMostActiveTimeSlot(interactions)
    insights.push(`Most active during ${mostActiveTime}`)
  }

  if (patterns && patterns.length > 0) {
    insights.push(`${patterns.length} behavioral patterns identified`)
  }

  return insights
}

function getMostActiveTimeSlot(interactions: any[]): string {
  const timeSlots = analyzeUsageByTime(interactions)
  return Object.entries(timeSlots).sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown'
}

function generateImprovementSuggestions(profile: any, patterns: any[]) {
  const suggestions = []

  if (!patterns || patterns.length < 3) {
    suggestions.push('Use Marvin more consistently to improve personalization')
  }

  if (!profile?.morning_routine) {
    suggestions.push('Establish a consistent morning routine for better predictions')
  }

  return suggestions
}

function calculateLearningProgress(patterns: any[]) {
  if (!patterns) return 0

  const totalPossiblePatterns = 5 // morning_routine, object_usage, health_habits, etc.
  const activePatterns = patterns.filter(p => p.active).length

  return (activePatterns / totalPossiblePatterns) * 100
}

function generateNextSteps(profile: any, patterns: any[]) {
  const steps = []

  if (!patterns || patterns.length === 0) {
    steps.push('Continue daily interactions to establish patterns')
  } else {
    steps.push('Refine existing patterns through consistent use')
  }

  steps.push('Review and adjust preferences as needed')

  return steps
}

function calculatePatternConfidence(patternData: any): number {
  if (Array.isArray(patternData)) {
    return Math.min(1, patternData.length / 10)
  }
  return 0.5
}

function calculateRoutineConfidence(morningAnalysis: any): number {
  const { total_morning_days, patterns } = morningAnalysis
  if (!total_morning_days || total_morning_days < 3) return 0.3
  if (!patterns || patterns.length === 0) return 0.4

  return Math.min(1, (total_morning_days * patterns.length) / 20)
}