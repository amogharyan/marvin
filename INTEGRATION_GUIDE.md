# Marvin AR Assistant - Integration Guide

**Last Updated:** October 25, 2025  
**Status:** ✅ Architecture Finalized - Supabase-Focused Approach

## 🎯 Integration Strategy

We are using **Option 1: Supabase Edge Functions** as the integration backbone.

```
Lens Studio AR (Dev 1)
       ↓ InternetModule HTTP
Supabase Edge Functions (Dev 2)
       ↓ External APIs
Gemini + ElevenLabs + Letta + Chroma
       ↓
Supabase Backend (Dev 3)
Database + Storage + Realtime
```

## 📋 Quick Start Integration Checklist

### Phase 1: Setup (Hours 0-2)

**Dev 1: Lens Studio**
- [ ] Install InternetModule from Supabase example
- [ ] Implement GeminiAssistant.ts with WebSocket
- [ ] Add HTTP call functions using RemoteServiceHttpRequest

**Dev 2: Edge Functions**
- [ ] Fix ai-coordination mock responses → real Gemini API
- [ ] Create letta-sync Edge Function
- [ ] Create voice-synthesis Edge Function
- [ ] Deploy all functions: `supabase functions deploy`

**Dev 3: Database**
- [ ] Create tables: object_interactions, user_profiles, learning_patterns
- [ ] Add RLS policies for all tables
- [ ] Set up Realtime channels
- [ ] Deploy Chroma database

**Dev 4: Testing**
- [ ] Write failing tests for all components
- [ ] Set up GitHub Actions CI/CD
- [ ] Create integration test suite

### Phase 2: Integration (Hours 2-4)

**Dev 1 → Dev 2:**
- [ ] Test InternetModule calls to Edge Functions
- [ ] Verify JSON request/response format
- [ ] Add error handling and fallbacks

**Dev 2 → External APIs:**
- [ ] Test Gemini API calls from Edge Functions
- [ ] Test ElevenLabs voice synthesis
- [ ] Test Letta passage creation
- [ ] Test Chroma vector storage

**Dev 3 → Dev 2:**
- [ ] Verify Edge Functions write to database
- [ ] Test Realtime subscriptions trigger
- [ ] Confirm Storage bucket uploads work

**Dev 4:**
- [ ] Run integration tests: `npm test`
- [ ] Verify CI/CD pipeline passes
- [ ] Test end-to-end demo flow

### Phase 3: End-to-End Testing (Hour 4)

- [ ] **Medicine Detection Flow:**
  - Dev 1: Object detected → Call ai-coordination
  - Dev 2: Process with Gemini → Return suggestion
  - Dev 1: Display AR overlay
  - Dev 3: Verify database logged interaction

- [ ] **Voice Synthesis Flow:**
  - Dev 1: Call voice-synthesis Edge Function
  - Dev 2: Generate audio with ElevenLabs
  - Dev 1: Play audio on Spectacles
  - Dev 3: Verify audio cached in Storage

- [ ] **Learning Flow:**
  - Dev 1: User interacts with object
  - Dev 2: Store vector in Chroma via Edge Function
  - Dev 2: Sync passage to Letta
  - Dev 3: Verify database updated

## 🔧 Developer-Specific Integration Tasks

### Dev 1: Lens Studio Integration Points

**File:** `marvin-main/Assets/Scripts/Core/MarvinCoordinator.ts`

```typescript
@component
export class MarvinCoordinator extends BaseScriptComponent {
  @input internetModule: InternetModule;
  @input supabaseUrl: string;
  @input supabaseAnonKey: string;
  
  // Call ai-coordination Edge Function
  async processObjectDetection(objectType: string, imageData: string) {
    const request = RemoteServiceHttpRequest.create();
    request.url = `${this.supabaseUrl}/functions/v1/ai-coordination`;
    request.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.supabaseAnonKey}`,
      'apikey': this.supabaseAnonKey
    };
    request.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;
    request.body = JSON.stringify({
      object_type: objectType,
      image_data: imageData,
      timestamp: new Date().toISOString()
    });
    
    this.internetModule.performHttpRequest(request, (response) => {
      if (response.statusCode === 200) {
        const result = JSON.parse(response.body);
        this.displayAROverlay(result.suggestion);
      }
    });
  }
  
  // Call voice-synthesis Edge Function
  async synthesizeVoice(text: string) {
    const request = RemoteServiceHttpRequest.create();
    request.url = `${this.supabaseUrl}/functions/v1/voice-synthesis`;
    request.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.supabaseAnonKey}`,
      'apikey': this.supabaseAnonKey
    };
    request.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;
    request.body = JSON.stringify({ text: text });
    
    this.internetModule.performHttpRequest(request, (response) => {
      if (response.statusCode === 200) {
        const result = JSON.parse(response.body);
        this.playAudio(result.audio_data);
      }
    });
  }
}
```

**Integration Tests Required:**
- [ ] InternetModule HTTP calls succeed
- [ ] JSON parsing works correctly
- [ ] Error responses handled gracefully
- [ ] Fallback to Gemini WebSocket works

### Dev 2: Edge Functions Integration Points

**File:** `snap-cloud/functions/ai-coordination/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { object_type, image_data, timestamp } = await req.json()
    
    // Call REAL Gemini API (fix mock!)
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': Deno.env.get('GEMINI_API_KEY')!
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this ${object_type} and provide morning routine guidance.`
            }]
          }]
        })
      }
    )
    
    const aiResult = await geminiResponse.json()
    const suggestion = aiResult.candidates[0].content.parts[0].text
    
    // Store in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    await supabase.from('object_interactions').insert({
      object_type,
      ai_suggestion: suggestion,
      timestamp
    })
    
    // Async sync to Letta (fire and forget)
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/letta-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        text: `Object detected: ${object_type}. Suggestion: ${suggestion}`,
        timestamp
      })
    }).catch(err => console.warn('Letta sync failed:', err))
    
    return new Response(
      JSON.stringify({ suggestion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Integration Tests Required:**
- [ ] Gemini API calls succeed
- [ ] Database writes work
- [ ] Letta sync fires without blocking
- [ ] Error handling returns proper status codes

**File:** `snap-cloud/functions/letta-sync/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { text, timestamp, agentId } = await req.json()
  
  const lettaResponse = await fetch(
    `https://api.letta.com/v1/agents/${agentId}/passages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LETTA_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    }
  )
  
  if (!lettaResponse.ok) {
    console.error('Letta API error:', await lettaResponse.text())
    return new Response(JSON.stringify({ success: false }), { status: 500 })
  }
  
  return new Response(JSON.stringify({ success: true }))
})
```

### Dev 3: Database Integration Points

**File:** `snap-cloud/migrations/002_integration_tables.sql`

```sql
-- Object interactions table
CREATE TABLE IF NOT EXISTS object_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  object_type TEXT NOT NULL,
  ai_suggestion TEXT,
  confidence FLOAT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles with Letta agent ID
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  letta_agent_id TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning patterns
CREATE TABLE IF NOT EXISTS learning_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  object_type TEXT NOT NULL,
  pattern_data JSONB,
  confidence FLOAT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE object_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own interactions"
  ON object_interactions FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own interactions"
  ON object_interactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE object_interactions;
```

**Integration Tests Required:**
- [ ] Tables created successfully
- [ ] RLS policies enforce user isolation
- [ ] Realtime subscriptions trigger on INSERT
- [ ] Edge Functions can write with service role key

### Dev 4: Integration Testing

**File:** `__tests__/integration/end-to-end.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';

describe('End-to-End Integration', () => {
  it('should complete full object detection flow', async () => {
    // 1. Simulate object detection in Lens Studio
    const mockObjectDetection = {
      object_type: 'medicine',
      confidence: 0.95,
      timestamp: new Date().toISOString()
    };
    
    // 2. Call ai-coordination Edge Function
    const response = await fetch(
      'http://localhost:54321/functions/v1/ai-coordination',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockObjectDetection)
      }
    );
    
    expect(response.status).toBe(200);
    const result = await response.json();
    
    // 3. Verify AI suggestion returned
    expect(result.suggestion).toBeDefined();
    expect(result.suggestion.length).toBeGreaterThan(0);
    
    // 4. Verify database recorded interaction
    // ... database verification logic
    
    // 5. Verify Letta received passage (check logs)
    // ... Letta verification logic
  });
  
  it('should complete voice synthesis flow', async () => {
    // Similar test for voice-synthesis Edge Function
  });
});
```

## 🚨 Common Integration Issues & Solutions

### Issue 1: InternetModule Not Found
**Problem:** Lens Studio can't find InternetModule  
**Solution:** Copy `Internet Module.internetModule` from Supabase example to `marvin-main/Assets/Project/Modules/`

### Issue 2: Edge Function Returns 401
**Problem:** Authorization header incorrect  
**Solution:** Ensure both `Authorization: Bearer ${key}` AND `apikey: ${key}` headers are set

### Issue 3: CORS Errors
**Problem:** Browser blocks requests  
**Solution:** Add CORS headers to all Edge Functions (see example above)

### Issue 4: Letta Sync Blocks Conversation
**Problem:** Waiting for Letta slows down response  
**Solution:** Use fire-and-forget pattern (don't await the fetch)

### Issue 5: Database Writes Fail
**Problem:** RLS policies reject writes  
**Solution:** Use service role key in Edge Functions, not anon key

## 📊 Integration Verification Checklist

### Before Demo (Hour 12+)
- [ ] Dev 1: Object detection triggers AI call
- [ ] Dev 1: AR overlays display within 100ms
- [ ] Dev 1: Voice playback works on Spectacles
- [ ] Dev 2: All Edge Functions respond in <2s
- [ ] Dev 2: Gemini API returns real responses (not mocks)
- [ ] Dev 2: ElevenLabs generates voice audio
- [ ] Dev 2: Letta receives conversation passages
- [ ] Dev 3: Database logs all interactions
- [ ] Dev 3: Realtime updates trigger correctly
- [ ] Dev 3: Chroma stores vector embeddings
- [ ] Dev 4: All tests pass in CI/CD
- [ ] Dev 4: Integration tests run successfully
- [ ] Dev 4: Demo flow completes in <2 minutes

### Demo Day
- [ ] Test full demo flow 3 times
- [ ] Verify fallbacks work (Gemini voice, cached responses)
- [ ] Check API rate limits and quotas
- [ ] Confirm all services running
- [ ] Have backup demo video ready

## 🎯 Success Criteria

**Integration is complete when:**
1. ✅ Lens Studio successfully calls all Edge Functions
2. ✅ Edge Functions call real external APIs (no mocks)
3. ✅ Database records all interactions
4. ✅ Letta receives conversation history
5. ✅ AR overlays display in <100ms
6. ✅ Voice synthesis completes in <2s
7. ✅ All tests pass (unit + integration)
8. ✅ Demo runs successfully 3 times in a row

## 📚 References

- **Supabase Example:** `Supabase-Select-YC-Hackathon-10-04-25/lens-studio-project/Assets/Supabase/Example4-EdgeFunctions/EdgeFunctionBasic.ts`
- **PRD:** `prd.md` - System architecture section
- **Task List:** `tasklist.md` - Phase 1 integration tasks
- **Architecture:** `ARCHITECTURE_UPDATED.md` - Full system design

---

**Next Steps:**
1. Dev 4: Create failing integration tests
2. Dev 1: Implement InternetModule calls
3. Dev 2: Fix Edge Function mock responses
4. Dev 3: Deploy database schema
5. All: Test integration flows
6. All: Merge to develop branch at Hour 8
