// Task 2.6: Create nutrition tracking schema
// Create Edge Functions for nutrition data processing
// Implement daily/weekly nutrition summary functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
}

interface NutritionRequest {
  user_id: string
  action: 'log_food' | 'get_daily_summary' | 'get_weekly_summary' | 'analyze_image' | 'get_recommendations'
  food_data?: {
    food_type: string
    description: string
    image_data?: string // Base64 encoded image
    manual_nutrition?: {
      calories: number
      protein: number
      carbs: number
      fat: number
      fiber?: number
      sugar?: number
    }
  }
  date?: string // YYYY-MM-DD format
  week_start?: string // YYYY-MM-DD format
}

serve(async (req) => {
  // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    function isValidUrl(url: string | undefined): boolean {
      if (!url) return false;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }

    if (!SUPABASE_URL || !isValidUrl(SUPABASE_URL)) {
      console.error('Missing or invalid SUPABASE_URL environment variable.');
      throw new Error('Missing or invalid SUPABASE_URL environment variable.');
    }
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    const { user_id, action, food_data, date, week_start }: NutritionRequest = await req.json()

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
      case 'log_food':
        if (!food_data) {
          throw new Error('food_data required for log_food action')
        }
        result = await logFood(supabase, user_id, food_data)
        break

      case 'analyze_image':
        if (!food_data?.image_data) {
          throw new Error('image_data required for analyze_image action')
        }
        result = await analyzeImageFood(supabase, user_id, food_data)
        break

      case 'get_daily_summary': {
        const summaryDate = date || new Date().toISOString().split('T')[0];
        result = await getDailySummary(supabase, user_id, summaryDate);
        break;
      }

      case 'get_weekly_summary':
        result = await getWeeklySummary(supabase, user_id, week_start)
        break

      case 'get_recommendations':
        result = await getNutritionRecommendations(supabase, user_id)
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
    console.error('Nutrition tracking error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process nutrition request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function logFood(supabase: any, userId: string, foodData: any) {
  let nutritionData = foodData.manual_nutrition

  // If no manual nutrition provided, try to estimate based on food type
  if (!nutritionData) {
    nutritionData = estimateNutrition(foodData.food_type, foodData.description)
  }

  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      user_id: userId,
      food_type: foodData.food_type,
      description: foodData.description,
      nutrition_data: nutritionData,
      visual_analysis: foodData.image_data ? { has_image: true } : {},
      confidence_score: foodData.manual_nutrition ? 1.0 : 0.7,
      logged_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  // Update daily summary in real-time
  const dailySummary = await supabase.rpc('calculate_daily_nutrition', {
    p_user_id: userId,
    p_date: new Date().toISOString().split('T')[0]
  })

  // Broadcast real-time nutrition update
  const channel = supabase.channel(`nutrition_${userId}`)
  await channel.send({
    type: 'broadcast',
    event: 'food_logged',
    payload: {
      food_log: data,
      daily_summary: dailySummary.data
    }
  })

  return {
    food_log: data,
    estimated_nutrition: nutritionData,
    daily_summary: dailySummary.data
  }
}

async function analyzeImageFood(supabase: any, userId: string, foodData: any) {
  // Mock visual analysis - in production would call Gemini Vision API
  const analysisResult = {
    detected_foods: [
      {
        name: foodData.food_type || 'unknown_food',
        confidence: 0.85,
        estimated_portion: 'medium'
      }
    ],
    estimated_nutrition: estimateNutrition(foodData.food_type || 'mixed_meal', foodData.description),
    analysis_confidence: 0.75
  }

  // Store the analysis result
  const { data, error } = await supabase
    .from('food_logs')
    .insert({
      user_id: userId,
      food_type: foodData.food_type || 'analyzed_from_image',
      description: foodData.description || 'Food analyzed from image',
      visual_analysis: analysisResult,
      nutrition_data: analysisResult.estimated_nutrition,
      confidence_score: analysisResult.analysis_confidence,
      logged_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return {
    analysis: analysisResult,
    food_log: data
  }
}

async function getDailySummary(supabase: any, userId: string, date: string) {
  const summary = await supabase.rpc('calculate_daily_nutrition', {
    p_user_id: userId,
    p_date: date
  })

  if (summary.error) {
    throw summary.error
  }

  // Get individual food logs for the day
  const { data: foodLogs } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', `${date}T00:00:00Z`)
    .lt('logged_at', `${date}T23:59:59Z`)
    .order('logged_at', { ascending: true })

  return {
    date,
    summary: summary.data,
    food_logs: foodLogs || [],
    recommendations: generateDailyRecommendations(summary.data)
  }
}

async function getWeeklySummary(supabase: any, userId: string, weekStart?: string) {
  // Calculate week start if not provided
  const startDate = weekStart ? new Date(weekStart) : getWeekStart(new Date())
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const dailySummaries = []

  // Get summaries for each day of the week
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + i)
    const dateStr = currentDate.toISOString().split('T')[0]

    const summary = await supabase.rpc('calculate_daily_nutrition', {
      p_user_id: userId,
      p_date: dateStr
    })

    dailySummaries.push({
      date: dateStr,
      summary: summary.data
    })
  }

  // Calculate weekly totals and averages
  const weeklyTotals = dailySummaries.reduce((acc, day) => {
    const summary = day.summary
    return {
      total_calories: acc.total_calories + (summary?.total_calories || 0),
      total_protein: acc.total_protein + (summary?.total_protein || 0),
      total_carbs: acc.total_carbs + (summary?.total_carbs || 0),
      total_fat: acc.total_fat + (summary?.total_fat || 0),
      total_meals: acc.total_meals + (summary?.meal_count || 0)
    }
  }, { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, total_meals: 0 })

  const weeklyAverages = {
    avg_calories: weeklyTotals.total_calories / 7,
    avg_protein: weeklyTotals.total_protein / 7,
    avg_carbs: weeklyTotals.total_carbs / 7,
    avg_fat: weeklyTotals.total_fat / 7,
    avg_meals: weeklyTotals.total_meals / 7
  }

  return {
    week_start: startDate.toISOString().split('T')[0],
    week_end: endDate.toISOString().split('T')[0],
    daily_summaries: dailySummaries,
    weekly_totals: weeklyTotals,
    weekly_averages: weeklyAverages,
    recommendations: generateWeeklyRecommendations(weeklyAverages)
  }
}

async function getNutritionRecommendations(supabase: any, userId: string) {
  // Get recent nutrition data for analysis
  const recentSummary = await getDailySummary(supabase, userId, new Date().toISOString().split('T')[0])

  const recommendations = []

  if (recentSummary?.summary?.total_calories < 1200) {
    recommendations.push({
      type: 'calorie_increase',
      message: 'Consider eating more calorie-dense foods to meet your daily energy needs.',
      priority: 'high'
    })
  }

  if (recentSummary?.summary?.total_protein < 50) {
    recommendations.push({
      type: 'protein_increase',
      message: 'Add more protein sources like eggs, fish, or legumes to your meals.',
      priority: 'medium'
    })
  }

  if (recentSummary?.summary?.meal_count < 2) {
    recommendations.push({
      type: 'meal_frequency',
      message: 'Try to eat at least 3 meals per day for better nutrition distribution.',
      priority: 'medium'
    })
  }

  return {
    recommendations,
    based_on: 'daily_nutrition_analysis',
    generated_at: new Date().toISOString()
  }
}

function estimateNutrition(foodType: string, description: string) {
  // Simple nutrition estimation based on food type
  const nutritionDatabase: Record<string, any> = {
    'bowl': { calories: 350, protein: 12, carbs: 45, fat: 8 },
    'cereal': { calories: 250, protein: 8, carbs: 40, fat: 3 },
    'fruit': { calories: 80, protein: 1, carbs: 20, fat: 0 },
    'sandwich': { calories: 400, protein: 18, carbs: 35, fat: 15 },
    'salad': { calories: 150, protein: 5, carbs: 15, fat: 8 },
    'mixed_meal': { calories: 500, protein: 25, carbs: 50, fat: 20 }
  }

  return nutritionDatabase[foodType] || nutritionDatabase['mixed_meal']
}

function generateDailyRecommendations(summary: any) {
  const recommendations = []

  if (summary?.total_calories < 1500) {
    recommendations.push('Consider adding a healthy snack to increase your calorie intake.')
  }

  if (summary?.total_protein < 60) {
    recommendations.push('Include more protein-rich foods in your next meal.')
  }

  return recommendations
}

function generateWeeklyRecommendations(averages: any) {
  const recommendations = []

  if (averages.avg_calories < 1800) {
    recommendations.push('Your weekly average calorie intake is below recommended levels.')
  }

  if (averages.avg_meals < 2.5) {
    recommendations.push('Try to maintain at least 3 meals per day consistently.')
  }

  return recommendations
}

function getWeekStart(date: Date): Date {
  const day = date.getDay()
  const diff = date.getDate() - day
  return new Date(date.setDate(diff))
}