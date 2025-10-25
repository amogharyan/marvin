// Supabase client configuration for Marvin AR Morning Assistant
// Centralized client setup for Edge Functions and frontend applications

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321'
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Client for public/authenticated operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client for server-side operations (Edge Functions)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Client factory for custom configurations
export function createSupabaseClient(options?: {
  serviceRole?: boolean
  realtime?: boolean
}) {
  const key = options?.serviceRole ? supabaseServiceKey : supabaseAnonKey

  return createClient<Database>(supabaseUrl, key, {
    realtime: options?.realtime ? {
      params: {
        eventsPerSecond: 10,
      },
    } : undefined,
  })
}

// Realtime client for AR object interactions
export const realtimeClient = createSupabaseClient({ realtime: true })

// Helper function to get authenticated user from request
export async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error('Invalid authentication token')
  }

  return user
}

// Helper function to setup CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Helper function to handle CORS preflight
export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}

// Helper function to create standardized error response
export function createErrorResponse(error: string, details?: string, status = 500) {
  return new Response(
    JSON.stringify({
      error,
      details,
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status
    }
  )
}

// Helper function to create standardized success response
export function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status
    }
  )
}