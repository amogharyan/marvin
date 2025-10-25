// Health check Edge Function for Marvin AR Assistant
// Task 1.3: Create health check functions and test database connectivity

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test database connectivity
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (error) {
      throw error
    }

    // Get system status
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      edge_function: 'running',
      version: '1.0.0'
    }

    return new Response(
      JSON.stringify(status),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Health check failed:', error)

    const errorStatus = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected',
      edge_function: 'running'
    }

    return new Response(
      JSON.stringify(errorStatus),
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