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
    const { agentId, query, limit = 5 } = await req.json()

    // Validate required fields
    if (!agentId || !query) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: agentId, query' }),
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

    // Search passages in Letta Cloud
    // Note: Using the Letta client to search passages
    // The exact API call may vary based on the Letta client implementation
    const searchResults = await lettaClient.passages.search({
      agentId: agentId,
      query: query,
      limit: limit
    })

    console.log(`Found ${searchResults.length} passages for agent ${agentId}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        passages: searchResults,
        count: searchResults.length,
        query: query,
        agentId: agentId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Letta search error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to search passages',
        message: error.message,
        passages: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
