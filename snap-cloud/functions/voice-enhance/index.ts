import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

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
    const { userId, sessionId } = await req.json()

    // Validate required fields
    if (!userId || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, sessionId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize LiveKit credentials
    const livekitApiKey = Deno.env.get('LIVEKIT_API_KEY')
    const livekitApiSecret = Deno.env.get('LIVEKIT_API_SECRET')
    const livekitUrl = Deno.env.get('LIVEKIT_URL')

    if (!livekitApiKey || !livekitApiSecret || !livekitUrl) {
      console.error('LiveKit credentials not configured')
      return new Response(
        JSON.stringify({ error: 'LiveKit not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For now, return a simplified response
    // In production, you would generate an actual LiveKit token here
    const token = 'livekit_token_placeholder'
    const roomName = `marvin-${sessionId}`

    console.log(`Generated LiveKit room for user ${userId}, session ${sessionId}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        token: token,
        roomUrl: livekitUrl,
        roomName: roomName
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('LiveKit room creation error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to create LiveKit room',
        message: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

