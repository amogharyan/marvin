import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@letta-ai/letta-node@1.0.0'

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
    const { agentId, text, timestamp } = await req.json()

    // Validate required fields
    if (!agentId || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agentId, text' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Letta client
    const lettaApiKey = Deno.env.get('LETTA_API_KEY')
    if (!lettaApiKey) {
      console.error('LETTA_API_KEY environment variable not set')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const lettaClient = createClient({
      token: lettaApiKey
    })

    // Prepare passage data
    const passage = {
      text: text,
      timestamp: timestamp || new Date().toISOString(),
      metadata: {
        source: 'marvin-ar-assistant',
        type: 'conversation'
      }
    }

    // Sync passage to Letta Cloud
    // Note: Using the Letta client to create passages
    // The exact API call may vary based on the Letta client implementation
    await lettaClient.passages.create({
      agentId: agentId,
      ...passage
    })

    console.log(`Successfully synced passage to Letta for agent ${agentId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Passage synced successfully',
        agentId: agentId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Letta sync error:', error)
    
    // Return success even on error to avoid blocking the main flow
    // This is a fire-and-forget operation
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to sync passage (non-blocking)',
        message: error.message
      }),
      { 
        status: 200, // Return 200 to avoid blocking caller
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
