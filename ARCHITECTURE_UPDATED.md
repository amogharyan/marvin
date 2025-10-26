# Marvin Architecture - Supabase-Focused (Updated)

## Overview

This document clarifies the updated architecture with clear separation between Dev 1 (AR), Dev 2 (AI Edge Functions), Dev 3 (Backend Infrastructure), and Dev 4 (DevOps/TDD).

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│              Snap Spectacles (AR Frontend)                    │
│         Lens Studio + TypeScript - Dev 1                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ Object   │ │    AR    │ │ Gesture  │                     │
│  │Detection │ │ Overlays │ │ Handler  │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│  ┌──────────────────────────────────────┐                   │
│  │   Gemini Live WebSocket (Built-in)   │                   │
│  │   + InternetModule (HTTP Requests)   │                   │
│  └──────────────────────────────────────┘                   │
└───────────────────────────────────────────────────────────────┘
              │                      │                      │
              ▼                      ▼                      ▼
┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ Gemini Live WebSocket │  │InternetModule Bridge │  │ Supabase Realtime    │
│   (Direct - Dev 1)    │  │  (HTTP to Supabase)  │  │  (Data Sync)         │
│  ┌────────────────┐   │  │  ┌──────────────┐   │  │  ┌──────────────┐   │
│  │ Vision + Voice │   │  │  │   Fetch API  │   │  │  │   Database   │   │
│  │   Streaming    │   │  │  │   Requests   │   │  │  │   Subscribe  │   │
│  │  <2s Response  │   │  │  │to Edge Funcs │   │  │  │              │   │
│  └────────────────┘   │  │  └──────────────┘   │  │  └──────────────┘   │
└───────────────────────┘  └──────────────────────┘  └──────────────────────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     ▼
┌───────────────────────────────────────────────────────────────┐
│           Supabase Edge Functions (Dev 2)                     │
│         Deno TypeScript - AI Processing Layer                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ai-coord  │ │letta-sync│ │ voice-   │ │ chroma-  │       │
│  │ination   │ │ (NEW)    │ │ synthesis│ │ learning │       │
│  │(optional)│ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└───────────────────────────────────────────────────────────────┘
              │                      │                      │
              ▼                      ▼                      ▼
┌───────────────────────────────────────────────────────────────┐
│        Supabase Backend Services (Dev 3)                      │
│       Database + Storage + Realtime + Auth                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │PostgreSQL│ │  Storage │ │ Realtime │ │   Auth   │       │
│  │   Tables │ │   Bucket │ │ Channels │ │  Policies│       │
│  │   + RLS  │ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└───────────────────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────┐
│        External APIs (Called from Edge Functions)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Gemini   │ │ElevenLabs│ │  Chroma  │ │  Letta   │       │
│  │   API    │ │   Voice  │ │ Learning │ │  Memory  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└───────────────────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────────┐
│            CI/CD Pipeline (Dev 4)                             │
│     TDD + Integration Testing + Merge Management              │
└───────────────────────────────────────────────────────────────┘
```

## Developer Responsibilities

### Dev 1: AR Core (Lens Studio)
**Primary Focus:** Snap Spectacles AR experience

**Key Deliverables:**
- Lens Studio project (`marvin-main/Marvin.esproj`)
- Object detection using built-in ML Component
- AR overlays and UI components
- **Gemini Live WebSocket integration** (direct, no Edge Function)
- InternetModule for HTTP calls to Supabase Edge Functions
- Spatial tracking and gesture recognition

**Files to Create:**
```
marvin-main/Assets/Scripts/
├── ObjectDetection/
│   ├── DemoObjectTracker.ts
│   ├── SpatialAnchors.ts
│   └── GestureHandler.ts
├── Core/
│   ├── GeminiAssistant.ts        # Direct WebSocket to Gemini
│   └── VoiceHandler.ts            # Calls voice-synthesis Edge Function
├── AROverlays/
│   ├── OverlayManager.ts
│   ├── InfoCard.ts
│   └── GuideArrow.ts
└── Storage/
    └── SupabaseClient.ts          # Calls Edge Functions via InternetModule
```

**Key APIs:**
- `GeminiLiveWebsocket` from RemoteServiceGateway.lspkg
- `InternetModule` for HTTP requests
- `ObjectTracking3D` for object detection
- `HandTracking` for gestures

---

### Dev 2: AI Edge Functions (Supabase Edge Functions)
**Primary Focus:** AI processing logic in Supabase Edge Functions

**Key Deliverables:**
- Fix mock responses in existing Edge Functions
- Integrate real APIs (Gemini, ElevenLabs, Chroma, Letta)
- Create new Edge Functions as needed
- Optimize AI processing performance

**Files to Create/Fix:**
```
snap-cloud/functions/
├── ai-coordination/
│   └── index.ts                   # FIX: Replace mocks with real Gemini API
├── letta-sync/
│   └── index.ts                   # NEW: Async memory sync to Letta Cloud
├── letta-search/
│   └── index.ts                   # NEW: Memory retrieval from Letta
├── voice-synthesis/
│   └── index.ts                   # NEW: ElevenLabs text-to-speech
└── chroma-learning/
    └── index.ts                   # NEW: Vector embeddings for learning
```

**Key Integrations:**
- Gemini API: `fetch('https://generativelanguage.googleapis.com/...')`
- ElevenLabs: Text-to-speech synthesis
- Letta Cloud: Stateful agent memory
- Chroma: Vector database for learning patterns

**Example Edge Function Pattern:**
```typescript
// snap-cloud/functions/voice-synthesis/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { text } = await req.json()
  
  // Call ElevenLabs API
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/...', {
    method: 'POST',
    headers: {
      'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' })
  })
  
  const audioData = await response.arrayBuffer()
  return new Response(audioData, {
    headers: { 'Content-Type': 'audio/mpeg' }
  })
})
```

---

### Dev 3: Backend Infrastructure (Supabase)
**Primary Focus:** Database, storage, and realtime infrastructure

**Key Deliverables:**
- PostgreSQL database schema with tables and RLS policies
- Supabase Storage buckets for media files
- Realtime subscriptions for live updates
- Authentication and authorization setup
- External service integrations (Google Calendar, Health APIs)

**Files to Create:**
```
snap-cloud/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_letta_agent_id.sql
│   └── 003_learning_patterns.sql
├── seed.sql                       # Demo data for testing
└── config.toml                    # Supabase configuration
```

**Database Tables:**
- `user_profiles` (user_id, letta_agent_id, preferences)
- `object_interactions` (user_id, object_type, timestamp, ai_response)
- `learning_patterns` (user_id, pattern_data, confidence_score)
- `medication_schedules` (user_id, medication_name, schedule)
- `calendar_events` (user_id, event_title, start_time, end_time)

**Key Responsibilities:**
- Create and maintain database migrations
- Set up Row Level Security (RLS) policies
- Configure Realtime channels for live data sync
- Set up Chroma vector database (separate service)
- Manage Supabase secrets (API keys)

**Example Migration:**
```sql
-- snap-cloud/migrations/001_initial_schema.sql
create table user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id text unique not null,
  letta_agent_id text,
  created_at timestamp with time zone default now()
);

create table object_interactions (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  object_type text not null,
  confidence_score float,
  ai_response jsonb,
  timestamp timestamp with time zone default now()
);

-- Enable RLS
alter table user_profiles enable row level security;
alter table object_interactions enable row level security;

-- RLS Policies
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid()::text = user_id);

create policy "Users can view own interactions"
  on object_interactions for select
  using (auth.uid()::text = user_id);
```

---

### Dev 4: DevOps & TDD (Testing & Integration)
**Primary Focus:** Test-driven development and continuous integration

**Key Deliverables:**
- Jest testing framework setup
- Unit tests for all components (WRITE TESTS FIRST!)
- Integration tests for component communication
- GitHub Actions CI/CD pipeline
- Merge management and code review

**Files to Create:**
```
__tests__/
├── setup.ts                       # Global test configuration
├── mocks/
│   ├── lens-studio.ts             # Mock Lens Studio APIs
│   └── supabase.ts                # Mock Supabase client
├── unit/
│   ├── ObjectDetection/
│   │   └── DemoObjectTracker.test.ts
│   ├── Core/
│   │   ├── GeminiAssistant.test.ts
│   │   └── VoiceHandler.test.ts
│   └── Storage/
│       └── SupabaseClient.test.ts
├── integration/
│   ├── object-detection-to-ai.test.ts
│   ├── ai-to-overlay.test.ts
│   └── voice-synthesis-flow.test.ts
└── e2e/
    └── demo-flow.test.ts
```

**Key Responsibilities:**
- Create FAILING tests before implementation (TDD red phase)
- Run tests on every commit via GitHub Actions
- Review and approve PRs from other developers
- Ensure >80% test coverage
- Manage merge conflicts and integration issues
- Monitor CI/CD pipeline health

**Example Test (Write First!):**
```typescript
// __tests__/unit/ObjectDetection/DemoObjectTracker.test.ts
import { DemoObjectTracker } from '../../../marvin-main/Assets/Scripts/ObjectDetection/DemoObjectTracker';
import { MockMLComponent, MockEvent } from '../../mocks/lens-studio';

describe('DemoObjectTracker', () => {
  it('should detect bowl with >95% confidence', async () => {
    const mlComponent = new MockMLComponent();
    mlComponent.setMockDetection({ label: 'bowl', confidence: 0.98 });
    
    const tracker = new DemoObjectTracker();
    tracker.mlComponent = mlComponent;
    
    let detectedObject = null;
    tracker.onObjectDetected.add((obj) => {
      detectedObject = obj;
    });
    
    await tracker.processDetection();
    
    expect(detectedObject).not.toBeNull();
    expect(detectedObject.type).toBe('breakfast_bowl');
    expect(detectedObject.confidence).toBeGreaterThan(0.95);
  });
});
```

**CI/CD Pipeline:**
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --coverage
      - run: npx codecov
```

---

## Key Architectural Decisions

### ✅ Decision 1: Gemini Live WebSocket in Lens Studio (Dev 1)
**Rationale:** Gemini Live is already working in Lens Studio via RemoteServiceGateway.lspkg. Keep this as primary AI integration.

**Dev 1 Responsibility:**
- Implement `GeminiAssistant.ts` with direct WebSocket connection
- Handle vision + voice streaming in real-time
- Maintain conversation context locally

### ✅ Decision 2: Supabase Edge Functions for Additional AI (Dev 2)
**Rationale:** Use Edge Functions for processing that requires server-side API keys or complex logic.

**Dev 2 Responsibilities:**
- Fix `ai-coordination` Edge Function (replace mocks with real Gemini API calls)
- Create `letta-sync` Edge Function (async memory sync)
- Create `voice-synthesis` Edge Function (ElevenLabs integration)
- Create `chroma-learning` Edge Function (vector embeddings)

### ✅ Decision 3: Clear Separation of Concerns
**Rationale:** Avoid overlap between Dev 2 (AI logic) and Dev 3 (data infrastructure).

**Dev 2 = AI Processing:**
- Edge Functions that call external AI APIs
- AI logic, prompts, and response processing
- Integration with Gemini, ElevenLabs, Letta, Chroma

**Dev 3 = Data Infrastructure:**
- Database schema and migrations
- Row Level Security policies
- Realtime subscriptions
- Storage buckets
- Chroma database deployment

### ✅ Decision 4: Test-Driven Development (Dev 4)
**Rationale:** Ensure code quality and prevent integration issues.

**Dev 4 Workflow:**
1. Write FAILING tests for upcoming features
2. Other devs implement code to pass tests
3. Dev 4 reviews PRs and ensures tests pass
4. Merge in dependency order

---

## Integration Flow

### Object Detection → AI Response → AR Overlay

```typescript
// Dev 1: DemoObjectTracker.ts detects object
this.onObjectDetected.invoke({
  id: 'medicine-001',
  type: 'medicine',
  confidence: 0.98,
  position: vec3(0, 0, -1)
});

// Dev 1: GeminiAssistant.ts (direct WebSocket) generates response
const response = await this.geminiLive.analyzeObject(
  cameraFrame,
  'medicine',
  conversationHistory
);

// Dev 1: OverlayManager.ts creates AR overlay
this.overlayManager.createInfoCard(
  object.position,
  response.text
);

// Dev 1: Calls letta-sync Edge Function (fire-and-forget)
this.supabaseClient.callEdgeFunction('letta-sync', {
  text: `User detected medicine. Assistant: ${response.text}`,
  timestamp: Date.now()
});
```

### Voice Synthesis Flow

```typescript
// Dev 1: VoiceHandler.ts calls voice-synthesis Edge Function
const request = RemoteServiceHttpRequest.create();
request.url = `${this.supabaseUrl}/functions/v1/voice-synthesis`;
request.body = JSON.stringify({ text: "Take your medication now" });

this.internetModule.performHttpRequest(request, (response) => {
  // Dev 1: Play audio from Edge Function response
  const audioData = response.body;
  this.audioComponent.playAudio(audioData);
});

// Dev 2: voice-synthesis Edge Function
const elevenlabsResponse = await fetch('https://api.elevenlabs.io/...', {
  method: 'POST',
  body: JSON.stringify({ text })
});
return elevenlabsResponse.arrayBuffer();
```

---

## Timeline Adjustments

### Hour 0-8: Foundation
- **Dev 1:** Object detection + AR overlays + Gemini WebSocket
- **Dev 2:** Fix ai-coordination mocks + create voice-synthesis + letta-sync Edge Functions
- **Dev 3:** Database schema + RLS policies + Chroma setup
- **Dev 4:** Write FAILING tests for all Phase 1 components

### Hour 8-16: Integration
- **Dev 1:** Add InternetModule calls to Edge Functions
- **Dev 2:** Implement chroma-learning Edge Function + optional letta-search
- **Dev 3:** Realtime subscriptions + Storage buckets + external API integrations
- **Dev 4:** Integration tests + PR reviews + merge management

### Hour 16-24: Polish
- **All:** Demo optimization + error handling + performance tuning
- **Dev 4:** End-to-end testing + fallback verification

---

## Success Criteria

### Dev 1 Success:
- ✅ Object detection works with >95% accuracy
- ✅ Gemini Live WebSocket provides real-time responses <2s
- ✅ AR overlays render smoothly without lag
- ✅ InternetModule successfully calls all Edge Functions
- ✅ Demo flow completes in 2 minutes

### Dev 2 Success:
- ✅ All Edge Functions return REAL data (no mocks)
- ✅ ElevenLabs voice synthesis works
- ✅ Letta sync happens asynchronously without blocking
- ✅ Chroma learning stores and retrieves patterns
- ✅ All Edge Functions have error handling

### Dev 3 Success:
- ✅ Database schema supports all data requirements
- ✅ RLS policies enforce user data isolation
- ✅ Realtime subscriptions work for live updates
- ✅ Chroma database deployed and accessible
- ✅ All migrations applied successfully

### Dev 4 Success:
- ✅ All tests passing (>80% coverage)
- ✅ CI/CD pipeline runs on every commit
- ✅ Integration tests verify component communication
- ✅ No merge conflicts or integration issues
- ✅ Demo environment tested and ready

---

## Commands Cheat Sheet

### Dev 1 (Lens Studio)
```bash
# Open project
open marvin-main/Marvin.esproj

# Push to device
# Use Lens Studio UI: "Push to Device"

# Test in Preview
# Use Lens Studio Preview Panel
```

### Dev 2 (Edge Functions)
```bash
# Create new Edge Function
supabase functions new voice-synthesis

# Deploy Edge Function
supabase functions deploy voice-synthesis

# Test Edge Function locally
supabase functions serve

# Set API keys
supabase secrets set ELEVENLABS_API_KEY=xxx
supabase secrets set LETTA_API_KEY=xxx
supabase secrets set GEMINI_API_KEY=xxx
```

### Dev 3 (Database)
```bash
# Create migration
supabase migration new add_letta_agent_id

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Run seed data
psql -h localhost -p 54322 -U postgres -d postgres -f snap-cloud/seed.sql
```

### Dev 4 (Testing)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- __tests__/unit/ObjectDetection/DemoObjectTracker.test.ts

# Check coverage
npm test -- --coverage

# Lint code
npm run lint

# Type check
npm run type-check
```

---

## Summary

This architecture provides clear separation of concerns:

1. **Dev 1** owns the AR experience and direct Gemini integration
2. **Dev 2** owns AI processing Edge Functions that call external APIs
3. **Dev 3** owns the database, storage, and infrastructure
4. **Dev 4** owns testing, integration, and CI/CD

By maintaining these boundaries, developers can work in parallel without stepping on each other's toes, while Dev 4 ensures continuous integration and quality through TDD.
