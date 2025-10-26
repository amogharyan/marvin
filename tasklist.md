# Implementation Task List: Marvin AR Morning Assistant on Snap Spectacles

## 🚨 IMPORTANT: Supabase Integration Approach

**Using InternetModule (Experimental API) - No Snap Cloud Required**

This project uses the **Supabase-Select-YC-Hackathon-10-04-25** framework for direct Supabase integration:
- **Reference Folder:** `Supabase-Select-YC-Hackathon-10-04-25/lens-studio-project/Assets/Supabase/`
- **Key Examples:**
  - `Example1-SupabaseConnector/` - Basic database CRUD operations
  - `Example2-RealTimeCursor/` - Realtime subscriptions via Server-Sent Events
  - `Example3-LoadAssets/` - Storage bucket asset loading
  - `Example4-EdgeFunctions/` - Calling Supabase Edge Functions

**Architecture:**
- ✅ Use **InternetModule.fetch()** for direct HTTP requests to Supabase REST API
- ✅ Hardcode **supabaseUrl** and **supabaseAnonKey** in Lens Studio scripts
- ❌ NO SupabaseClient.lspkg needed
- ❌ NO Snap Cloud integration required

**Headers for all Supabase requests:**
```typescript
{
  "Content-Type": "application/json",
  "apikey": supabaseAnonKey,
  "Authorization": `Bearer ${supabaseAnonKey}`,
  "Prefer": "return=representation"
}
```

## Developer Assignment Key

- **[Dev 1]** = AR Core (Lens Studio: Object Detection, AR UI, Gemini WebSocket, InternetModule HTTP)
- **[Dev 2]** = AI Edge Functions (Supabase Edge Functions: ai-coordination, letta-sync, voice-enhance)
- **[Dev 3]** = Backend Infrastructure (Supabase: Database schema, RLS policies, Realtime, Storage)
- **[Dev 4]** = DevOps & TDD (Testing framework, integration testing, CI/CD, merge management)

## Git Branch Structure

```
main → develop → feature/[lens-studio|ai-integration|snap-cloud|integration]
```

## Phase 0: Pre-Hackathon Setup (T-24 to T-0 hours)

### Environment Setup [All]

- [ ] **0.1** Install **Lens Studio 5.15.0+**, Git with LFS, VS Code with TypeScript extension
- [ ] **0.2** Install Git LFS: `brew install git-lfs && git lfs install` (required for assets)
- [ ] **0.3** Create GitHub repo "marvin" and clone with `git clone` (not ZIP download)
- [ ] **0.4** Create feature branches: feature/lens-studio, feature/ai-integration, feature/snap-cloud, feature/integration

### API Keys & Service Setup [All]

- [ ] **0.5** [Dev 2] Sign up for Gemini API key: https://ai.google.dev/
- [ ] **0.6** [Dev 2] Sign up for ElevenLabs API key: https://elevenlabs.io/
- [ ] **0.7** [Dev 2] Create ElevenLabs Conversational AI agent
- [ ] **0.8** [Dev 3] **NEW: Sign up for Letta Cloud account: https://www.letta.com/** (15 min)
  - Create account at https://www.letta.com/
  - Generate API key from dashboard
  - Create initial agent via Letta dashboard or API
  - Save agent ID and API key to .env file
  - **Purpose:** Stateful agent memory for long-term learning (+2 prizes: Letta + AirPods)
- [ ] **0.9** [Dev 3] OPTIONAL: Configure additional ElevenLabs voice models
  - Explore different voice options in ElevenLabs dashboard
  - Test different voice styles for conversation
  - **Purpose:** Enhanced voice personality and variety
  - **Decision Point:** Only if time permits after Hour 10

### Lens Studio Project Setup [Dev 1]

- [ ] **0.10** Create new Lens Studio project: `Marvin.esproj`
- [ ] **0.11** Set Device Type to **Spectacles (2024)** in Preview Panel
- [ ] **0.12** Create folder structure in Assets/:
  - `Assets/Scripts/Core/`
  - `Assets/Scripts/ObjectDetection/`
  - `Assets/Scripts/AROverlays/`
  - `Assets/Scripts/Storage/`
  - `Assets/Scripts/Utils/`
- [ ] **0.13** Create `Assets/Visuals/` for 3D models and textures
- [ ] **0.14** Create `Assets/Prefabs/` for reusable scene objects

### Install Required Packages [Dev 1]

**IMPORTANT: Using InternetModule (Experimental API) - No SupabaseClient.lspkg needed**
**Reference Framework: Supabase-Select-YC-Hackathon-10-04-25/**

- [ ] **0.15** Open Lens Studio > Window > Asset Library
- [ ] **0.16** Install **Remote Service Gateway Token Generator** plugin (for Gemini WebSocket)
- [ ] **0.17** Install **SpectaclesInteractionKit.lspkg** package
- [ ] **0.18** ~~Install SupabaseClient.lspkg~~ **SKIP - Using InternetModule instead**
- [ ] **0.19** Install **SpectaclesUIKit.lspkg** package
- [ ] **0.20** Add **InternetModule** to project (for direct Supabase REST API calls)

### Configure Remote Service Gateway [Dev 1 + Dev 2]

- [ ] **0.21** [Dev 1] Generate token: Window > Remote Service Gateway Token > Generate Token
- [ ] **0.22** [Dev 1] Create "RemoteServiceGatewayCredentials" object in scene hierarchy
- [ ] **0.23** [Dev 1] Paste token into credentials object in Inspector
- [ ] **0.24** [Dev 2] Test connection with sample Gemini API call

### Configure Direct Supabase Integration [Dev 1 + Dev 3]

**Using InternetModule (No Snap Cloud) - Based on Supabase-Select Framework**

- [ ] **0.25** [Dev 3] Create Supabase project at https://supabase.com
- [ ] **0.26** [Dev 3] Copy **Project URL** from Settings > API (e.g., `https://xxxxx.supabase.co`)
- [ ] **0.27** [Dev 3] Copy **anon/public API key** from Settings > API
- [ ] **0.28** [Dev 1] Create `Assets/Scripts/Storage/SupabaseConnector.ts` (based on Example1-SupabaseConnector)
- [ ] **0.29** [Dev 1] Hardcode Supabase URL and anon key in SupabaseConnector.ts:
  ```typescript
  @input public supabaseUrl: string = "https://your-project.supabase.co";
  @input public supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
  @input public internetModule: InternetModule;
  ```
- [ ] **0.30** [Dev 1] Test direct Supabase connection with `internetModule.fetch()`
- [ ] **0.31** [Dev 3] Create `snap-cloud/` folder outside Lens Studio project for Edge Functions
- [ ] **0.32** [Dev 3] Initialize Supabase CLI: `supabase init` in snap-cloud/

### Testing Infrastructure Setup [Dev 4]

**Objective:** Set up TDD framework before other developers start coding  
**Reference:** See `devops/TDD-STRATEGY.md` for complete details

- [x] **0.33** Install Jest and TypeScript testing dependencies:
  - `npm install --save-dev jest ts-jest @types/jest @testing-library/jest-dom`
  - Create `jest.config.js` with TypeScript support
  - Create `__tests__/setup.ts` with global configuration
  - **STATUS:** ✅ jest.config.js created, package.json updated with test scripts

- [x] **0.34** Create Lens Studio API mocks in `__tests__/mocks/lens-studio.ts`:
  - MockInternetModule (for direct Supabase REST API calls via fetch())
  - MockRemoteServiceModule (for Gemini)
  - MockMLComponent (for object detection)
  - MockObjectTracking3D
  - MockAudioComponent
  - MockEvent<T>
  - ~~MockSupabaseClient~~ **SKIP - Using InternetModule directly**
  - **STATUS:** ✅ Mocks exist in __tests__/mocks/lens-studio.ts (227 lines)
  
- [x] **0.35** Write FAILING test templates for Phase 1 components:
  - `__tests__/unit/ObjectDetection/DemoObjectTracker.test.ts`
  - `__tests__/unit/Core/GeminiAssistant.test.ts`
  - `__tests__/unit/Core/ElevenLabsVoice.test.ts`
  - `__tests__/unit/Core/VoiceHandler.test.ts`
  - `__tests__/unit/Storage/SupabaseConnector.test.ts` (replaces SupabaseClient)
  - `__tests__/unit/Storage/ChromaLearning.test.ts`
  - `__tests__/unit/AROverlays/OverlayManager.test.ts`
  - All tests should FAIL (RED phase) - no implementation yet
  - **STATUS:** ✅ E2E tests exist in __tests__/e2e/demo-flow.test.ts (401 lines, marked FAILING)

- [x] **0.36** Set up GitHub Actions CI/CD:
  - Create `.github/workflows/test.yml` for automated testing on PR
  - Create `.github/workflows/lint.yml` for linting and type checking
  - Configure test coverage reporting with Codecov
  - **STATUS:** ✅ test.yml (156 lines, 3 jobs), lint.yml (87 lines, 2 jobs), ci-cd.yml (238 lines, 7 jobs)

- [ ] **0.37** Configure GitHub branch protection rules:
  - Require status checks to pass before merging
  - Require test workflow to pass
  - Require 1 approval from Dev 4
  - Require branches to be up to date with base branch
  - **NEXT TASK:** Configure on GitHub repository settings

### Spectacles Device Setup [All]

- [ ] **0.35** Update Spectacles device to OS v5.64+
- [ ] **0.36** Update Spectacles App (iOS v0.64+ or Android v0.64+)
- [ ] **0.37** Pair Spectacles with Lens Studio via "Devices" panel
- [ ] **0.38** Test "Push to Device" functionality

### Demo Environment Preparation [Dev 4]

- [ ] **0.39** Prepare physical demo objects: bowl, laptop, keys, medicine bottle, phone
  - **STATUS:** ⏳ Physical setup required - not in codebase
- [ ] **0.40** Set up controlled lighting environment
  - **STATUS:** ⏳ Physical setup required - not in codebase
- [ ] **0.41** Create demo script documenting 2-minute flow
  - **STATUS:** ⏳ Documentation needed
- [ ] **0.42** Take reference photos of demo objects for ML training
  - **STATUS:** ⏳ Assets needed for ML training

## Phase 1: Foundation (Hours 0-8)

**PARALLEL WORK STRATEGY:** All 4 developers have independent tasks
- **Dev 1:** Lens Studio AR (Object detection + AR overlays + Gemini WebSocket + InternetModule)
  - Tasks: 1.1-1.6, 1.19-1.21
- **Dev 2:** Supabase Edge Functions (AI processing logic, fix mocks, add Letta)
  - Tasks: 1.8-1.15C (Gemini integration via Edge Functions, ElevenLabs, Letta sync)
- **Dev 3:** Supabase Backend (Database schema, RLS policies, Chroma setup, Realtime)
  - Tasks: 1.7, 1.15D-1.15F, 1.16-1.18, 1.22
- **Dev 4:** TDD & DevOps (Testing framework, integration tests, CI/CD monitoring)
  - Tasks: 1.T1-1.T4

**KEY SEPARATION:**
- **Dev 2 = AI Logic Layer:** Edge Functions that process AI requests (Gemini, ElevenLabs, Letta, Chroma)
- **Dev 3 = Data Layer:** Database tables, RLS policies, Realtime subscriptions, Storage buckets
- **Dev 4 = Quality Layer:** TDD framework, tests, CI/CD, merge management (does NOT wait for Dev 1)

**Note:** Dev 1 implements Gemini WebSocket DIRECTLY in Lens Studio (no Edge Function needed). Dev 2's Edge Functions are for ADDITIONAL processing (Letta sync, voice enhancement).

### 1.0 Core Lens Studio Scene Setup

- [ ] **1.1** [Dev 1] **Create main scene structure**
  - Add Camera object with Spectacles tracking
  - Add Orthographic Camera for UI overlay
  - Create "Manager" scene object for script components
  - Configure scene lighting for indoor demo environment

- [ ] **1.2** [Dev 1] **Set up ML Component for object detection**
  - Add ML Component to scene
  - Configure object detection model (use built-in or custom)
  - Set confidence threshold to 0.7
  - Test detection with sample images

- [ ] **1.3** [Dev 1] **Create basic UI elements**
  - Add Canvas for 2D UI overlay
  - Create Text component for status display
  - Add Image component for visual feedback
  - Test UI rendering in Preview

### 1.1 Object Detection System (FR-001 to FR-007)

- [ ] **1.4** [Dev 1] **Implement DemoObjectTracker.ts**
  - Create `Assets/Scripts/ObjectDetection/DemoObjectTracker.ts`
  - Use `@component` decorator and extend `BaseScriptComponent`
  - Add `@input` for ML Component reference
  - Implement object detection event system using `Event<T>` from SIK
  - Map ML labels to demo object types (bowl, laptop, keys, medicine, phone)

- [ ] **1.5** [Dev 1] **Implement SpatialAnchors.ts**
  - Create `Assets/Scripts/ObjectDetection/SpatialAnchors.ts`
  - Use WorldTracking API for persistent positioning
  - Store object positions relative to world origin
  - Implement position update and smoothing logic

- [ ] **1.6** [Dev 1] **Implement GestureHandler.ts**
  - Create `Assets/Scripts/ObjectDetection/GestureHandler.ts`
  - Use HandTracking API from SIK
  - Detect reaching and touching gestures
  - Fire events when user interacts with objects

- [ ] **1.7** [Dev 3] **Create Supabase database schema**
  - Create `snap-cloud/migrations/001_initial_schema.sql`
  - Define tables: `object_interactions`, `user_preferences`, `learning_data`
  - Add timestamp and user_id columns
  - Run migration: `supabase db push`

### 1.2 Gemini Live WebSocket Integration (FR-008 to FR-014) - Dev 1

**Note:** Dev 1 implements Gemini DIRECTLY in Lens Studio using built-in WebSocket support. This is separate from Dev 2's Edge Functions.

- [ ] **1.8** [Dev 1] **Implement GeminiAssistant.ts**
  - Create `Assets/Scripts/Core/GeminiAssistant.ts`
  - Import from `RemoteServiceGateway.lspkg/HostedExternal/Gemini`
  - Implement `GeminiLiveWebsocket` connection
  - Configure system instructions for morning assistant persona
  - Set up audio output with `DynamicAudioOutput` (24kHz)

- [ ] **1.9** [Dev 1] **Configure video input for Gemini**
  - Add `VideoController` for camera frame capture
  - Set compression quality and encoding (JPEG, HighQuality)
  - Implement frame capture at 1500ms intervals
  - Send frames to Gemini with contextual prompts

- [ ] **1.10** [Dev 1] **Build conversation context system**
  - Implement conversation history tracking (last 10 messages)
  - Create contextual prompt generation based on detected objects
  - Add time-of-day awareness (morning routine focus)
  - Store conversation state in component properties

### 1.2.5 AI Coordination Edge Function (Optional) - Dev 2

**Note:** This Edge Function is OPTIONAL and handles additional AI processing beyond direct Gemini integration.

- [ ] **1.11** [Dev 2] **Create ai-coordination Edge Function**
  - Create `snap-cloud/functions/ai-coordination/index.ts`
  - Fix mock responses - replace with REAL Gemini API fetch calls
  - Implement request queuing and priority handling
  - Set up response caching in Supabase storage
  - Configure CORS and authentication

### 1.3 Voice Integration (FR-015 to FR-021)

**Dev 2:** Create Edge Functions for voice synthesis  
**Dev 1:** Integrate voice in Lens Studio

- [ ] **1.12** [Dev 2] **Create voice-synthesis Edge Function**
  - Create `snap-cloud/functions/voice-synthesis/index.ts`
  - Integrate ElevenLabs text-to-speech API
  - Configure voice ID and model (eleven_multilingual_v2)
  - Return audio data as base64 or stream
  - Add error handling and logging

- [ ] **1.13** [Dev 1] **Implement VoiceHandler.ts**
  - Create `Assets/Scripts/Core/VoiceHandler.ts`
  - Call voice-synthesis Edge Function via InternetModule
  - Implement audio playback with AudioComponent
  - Add fallback to Gemini Live voice
  - Create notification sound system

- [ ] **1.14** [Dev 1] **Configure microphone input**
  - Configure MicrophoneRecorder at 16kHz in GeminiAssistant.ts
  - Set up AudioProcessor for input handling
  - Implement voice command detection
  - Test speech-to-text accuracy with Gemini

- [ ] **1.15** [Dev 2] **Create VoiceHandler.ts coordinator**
  - Create `Assets/Scripts/Core/VoiceHandler.ts`
  - Coordinate between ElevenLabs (primary) and Gemini (fallback)
  - Implement notification sounds for different events
  - Add voice feedback for user actions
  - Create pre-recorded audio file fallbacks

### 1.3.5 **NEW: Letta Stateful Memory Integration** (FR-015, FR-016) - HIGH ROI

**Goal:** Add async memory sync to Letta Cloud for long-term learning (+2 prizes: Letta + AirPods)  
**Time:** 2 hours total (1 hour Dev 1 + 1 hour Dev 2)  
**Risk:** LOW (async, non-blocking, doesn't affect Gemini flow)

#### Dev 1 Tasks (1 hour) - Lens Studio Integration

- [ ] **1.15A** [Dev 1] **Add Letta sync to GeminiAssistant.ts**
  - After each Gemini conversation turn, call letta-sync Edge Function
  - **CRITICAL:** Use fire-and-forget pattern (don't await response)
  - Format passage text: `"User: ${transcript}\nAssistant: ${response}"`
  - Call via InternetModule: `POST /functions/v1/letta-sync`
  - Add error handling with console.warn (don't block on failures)
  - Example code:
    ```typescript
    private async syncToLetta(transcript: string, response: string): Promise<void> {
      // Fire and forget - don't block Gemini flow
      const request = RemoteServiceHttpRequest.create();
      request.url = `${this.supabaseUrl}/functions/v1/letta-sync`;
      request.headers = {
        'Authorization': `Bearer ${this.supabaseAnonKey}`,
        'Content-Type': 'application/json'
      };
      request.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;
      request.body = JSON.stringify({
        agentId: this.userLettaAgentId,
        text: `User: ${transcript}\nAssistant: ${response}`,
        timestamp: new Date().toISOString()
      });
      
      this.internetModule.performHttpRequest(request, (response) => {
        if (response.statusCode !== 200) {
          print('Letta sync failed (non-blocking): ' + response.body);
        }
      });
    }
    ```

- [ ] **1.15B** [Dev 1] **Add Letta context retrieval (optional enhancement)**
  - Before each conversation turn, fetch relevant memories from Letta
  - Call letta-search Edge Function with current object context
  - Inject retrieved memories into Gemini system prompt
  - Keep query lightweight (<500ms) to maintain real-time feel

#### Dev 2 Tasks (1 hour) - Edge Function Development

- [ ] **1.15C** [Dev 2] **Create letta-sync Edge Function**
  - Create `snap-cloud/functions/letta-sync/index.ts`
  - Accept POST with: `{ agentId: string, text: string, timestamp: string }`
  - Initialize Letta client with API key from environment
  - Call Letta passages API: `POST /agents/${agentId}/passages`
  - Return success/failure response (caller ignores failures)
  - Add logging for debugging but don't expose PII
  - Example code:
    ```typescript
    import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
    import { createClient } from 'https://esm.sh/@letta-ai/letta-node@1.0.0'

    serve(async (req) => {
      try {
        const { agentId, text, timestamp } = await req.json()
        
        const lettaClient = createClient({
          apiKey: Deno.env.get('LETTA_API_KEY')!
        })

        await lettaClient.agents.passages.create(agentId, {
          text: text,
          metadata: { timestamp, source: 'marvin-ar' }
        })

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.error('Letta sync error:', error)
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    })
    ```

- [ ] **1.15D** [Dev 2] **Create letta-search Edge Function (optional)**
  - Create `snap-cloud/functions/letta-search/index.ts`
  - Accept POST with: `{ agentId: string, query: string, limit: number }`
  - Call Letta passages search API
  - Return relevant memory passages for context injection
  - Keep response time under 500ms

- [ ] **1.15E** [Dev 2] **Deploy Letta Edge Functions**
  - Deploy: `supabase functions deploy letta-sync`
  - Deploy: `supabase functions deploy letta-search` (if implemented)
  - Set environment variables: `supabase secrets set LETTA_API_KEY=xxx`
  - Test with curl: `curl -X POST https://[project].supabase.co/functions/v1/letta-sync`
  - Verify Letta Cloud dashboard shows new passages

#### Dev 3 Tasks (30 minutes) - Database Schema

- [ ] **1.15F** [Dev 3] **Add Letta agent ID to user profiles**
  - Update Supabase `user_profiles` table schema
  - Add column: `letta_agent_id text`
  - Create migration: `supabase migration new add_letta_agent_id`
  - Seed demo user with Letta agent ID from Phase 0 setup

**Testing Checklist:**
- [ ] Gemini conversation works WITHOUT Letta (fallback)
- [ ] Letta sync happens in background after each turn
- [ ] Failed Letta syncs don't block conversation
- [ ] Letta Cloud dashboard shows conversation passages
- [ ] Retrieved memories appear in Gemini prompts (optional enhancement)

**Prize Value:**
- ✅ **Letta Prize:** Stateful agent memory with long-term learning
- ✅ **Letta AirPods Prize:** Voice + Letta integration
- ✅ **Stronger Y Combinator story:** Advanced memory architecture
- ✅ **Stronger Cal Hacks Overall:** More sophisticated AI system

### 1.4 Learning & Memory System (FR-032 to FR-039)

**Dev 2:** Create chroma-learning Edge Function  
**Dev 3:** Set up Chroma database and storage

- [ ] **1.16** [Dev 2] **Create chroma-learning Edge Function**
  - Create `snap-cloud/functions/chroma-learning/index.ts`
  - Implement `addInteraction` endpoint (POST /add)
  - Implement `findSimilarInteractions` endpoint (POST /search)
  - Generate embeddings via Gemini or OpenAI API
  - Configure Chroma client connection

- [ ] **1.17** [Dev 3] **Set up Chroma database**
  - Deploy Chroma server (local or cloud hosted)
  - Create collection: `marvin_interactions`
  - Configure embedding function (OpenAI or Gemini)
  - Test vector similarity search
  - Set up backup storage in Supabase Storage

- [ ] **1.18** [Dev 3] **Create learning_patterns table in Supabase**
  - Create table for storing object interaction patterns
  - Add columns: user_id, object_type, pattern_data, confidence, timestamp
  - Track time-of-day preferences and success rates
  - Implement RLS policies for user data isolation

### 1.5 AR User Interface Foundation (FR-043 to FR-049)

- [ ] **1.19** [Dev 1] **Create OverlayManager.ts**
  - Create `Assets/Scripts/AROverlays/OverlayManager.ts`
  - Use RenderMeshVisual for 3D overlays
  - Implement Text components with consistent typography
  - Design visual hierarchy for information display

- [ ] **1.20** [Dev 1] **Build InfoCard.ts component**
  - Create `Assets/Scripts/AROverlays/InfoCard.ts`
  - Use RectangleButton from SpectaclesUIKit
  - Implement adaptive brightness based on lighting
  - Position overlays to avoid obstructing view

- [ ] **1.21** [Dev 1] **Create GuideArrow.ts component**
  - Create `Assets/Scripts/AROverlays/GuideArrow.ts`
  - Implement 3D arrow for navigation
  - Add animation for attention direction
  - Test visibility in various environments

- [ ] **1.22** [Dev 1] **Implement SupabaseConnector.ts using InternetModule**
  - Create `Assets/Scripts/Storage/SupabaseConnector.ts` (based on Example1-SupabaseConnector)
  - **Use InternetModule.fetch() for direct REST API calls** (no SupabaseClient.lspkg)
  - Hardcode supabaseUrl and supabaseAnonKey as @input properties
  - Set headers: `{ "apikey": anonKey, "Authorization": "Bearer " + anonKey, "Content-Type": "application/json" }`
  - Implement database operations:
    - `selectFromTable(table, columns, query)` using GET to `/rest/v1/{table}`
    - `insertIntoTable(table, data)` using POST to `/rest/v1/{table}`
    - `updateTable(table, data, match)` using PATCH to `/rest/v1/{table}`
    - `deleteFromTable(table, match)` using DELETE to `/rest/v1/{table}`
  - Add error handling and logging (use print() for console output)
  - Reference: `Supabase-Select-YC-Hackathon-10-04-25/lens-studio-project/Assets/Supabase/Example1-SupabaseConnector/`

### 1.X Testing & Integration (Dev 4)

**Objective:** Monitor Phase 1 development and ensure all tests pass

- [x] **1.T1** [Dev 4] **Monitor test execution as code is committed**
  - Watch GitHub Actions run on each PR
  - Review test results and provide feedback
  - Help debug failing tests
  - Run tests locally: `npm test`
  - **STATUS:** ✅ Fixed missing @testing-library/jest-dom, added getTime() mock, all 26 tests passing

- [ ] **1.T2** [Dev 4] **Review and approve PRs from Dev 1, 2, 3**
  - Check test coverage (target: >80%)
  - Verify TypeScript compiles without errors
  - Ensure linting passes
  - Provide code review comments
  - Merge PRs in dependency order (utilities → storage → detection → AI → overlays)
  - **STATUS:** ⏳ Waiting for Dev 1, 2, 3 to create feature branches and PRs

- [x] **1.T3** [Dev 4] **Write integration tests for Phase 1 components**
  - Create `__tests__/integration/object-detection-to-ai.test.ts`
  - Create `__tests__/integration/ai-to-overlay.test.ts`
  - Create `__tests__/integration/voice-synthesis-flow.test.ts`
  - Test component interactions work correctly
  - **STATUS:** ✅ Created 3 integration test files with 68 total tests (13 + 18 + 37), all passing

- [ ] **1.T4** [Dev 4] **Fix any integration issues discovered in testing**
  - Debug component communication problems
  - Fix event system wiring issues
  - Resolve type mismatches between components

**HOUR 8 GIT MERGE:** All developers merge to develop branch

## Phase 2: Core Features (Hours 8-16)

### 2.0 Object-Specific Intelligence (FR-022 to FR-028)

- [ ] **2.1** [Dev 1] **Enhance medicine bottle detection**
  - Fine-tune ML Component for medicine bottle recognition
  - Implement MedicineTracker.ts component
  - Add visual feedback for detected medicine
  - Test accuracy with various bottle types

- [ ] **2.2** [Dev 2] **Build health reminder logic in GeminiAssistant**
  - Create medication schedule processing prompts
  - Implement time-based reminder logic
  - Build voice confirmations for health actions
  - Add context about medication timing to Gemini

- [ ] **2.3** [Dev 1] **Create MedicineOverlay.ts**
  - Create `Assets/Scripts/AROverlays/MedicineOverlay.ts`
  - Display medication name and dosage
  - Show time-based reminders
  - Add visual timer countdown

- [ ] **2.4** [Dev 3] **Create health data schema**
  - Design medication_schedules and health_reminders tables
  - Create SQL migration in snap-cloud/migrations/
  - Implement Row Level Security for health data
  - Add Edge Function for medication notifications (optional)

### 2.1 Nutrition & Breakfast Intelligence (FR-023)

- [ ] **2.5** [Dev 1] **Enhance breakfast bowl detection**
  - Fine-tune ML Component for bowl and food recognition
  - Implement BowlTracker.ts component
  - Add visual analysis trigger on detection
  - Test with variety of breakfast foods

- [ ] **2.6** [Dev 2] **Build nutrition analysis in GeminiAssistant**
  - Create food visual analysis prompts for Gemini
  - Implement calorie and macro estimation
  - Build healthy recipe suggestion system
  - Add nutritional advice based on visual analysis

- [ ] **2.7** [Dev 1] **Create NutritionOverlay.ts**
  - Create `Assets/Scripts/AROverlays/NutritionOverlay.ts`
  - Display estimated calories and macros
  - Show healthy recipe suggestions
  - Add visual progress indicators

- [ ] **2.8** [Dev 3] **Create nutrition tracking schema**
  - Design food_logs and nutrition_analysis tables
  - Create SQL migration for nutrition data
  - Add Edge Function for nutrition data aggregation (optional)
  - Implement daily/weekly summary functions

### 2.2 Productivity Integration (FR-024, FR-036-040)

- [ ] **2.9** [Dev 1] **Implement laptop interaction detection**
  - Fine-tune ML Component for laptop recognition
  - Implement LaptopTracker.ts component
  - Add proximity-based work mode trigger
  - Test productivity overlay positioning

- [ ] **2.10** [Dev 2] **Build productivity intelligence in GeminiAssistant**
  - Create task preparation prompts
  - Implement daily briefing generation
  - Build priority management logic
  - Add daily schedule overview with priorities

- [ ] **2.11** [Dev 1] **Create ProductivityOverlay.ts**
  - Create `Assets/Scripts/AROverlays/ProductivityOverlay.ts`
  - Display upcoming tasks and priorities
  - Show task preparation checklist
  - Add time-based urgency indicators

### 2.3 Key Location & Departure System (FR-025)

- [ ] **2.13** [Dev 1] **Implement key location tracking**
  - Fine-tune ML Component for key recognition
  - Implement KeyTracker.ts with spatial memory
  - Create AR arrow guidance system
  - Store last known position with WorldTracking

- [ ] **2.14** [Dev 2] **Build departure intelligence**
  - Create departure preparation prompts for Gemini
  - Implement checklist generation based on time
  - Build time-based departure suggestions
  - Add commute time estimation logic

- [ ] **2.15** [Dev 1] **Create DepartureOverlay.ts**
  - Create `Assets/Scripts/AROverlays/DepartureOverlay.ts`
  - Display departure checklist
  - Show AR arrows to key location
  - Add time-based urgency indicators

- [ ] **2.16** [Dev 3] **Create location tracking schema**
  - Design object_locations and spatial_memory tables
  - Create SQL migration for location data
  - Implement location history tracking
  - Add pattern analysis for common locations

### 2.4 Contextual Memory & Learning (FR-029 to FR-035)

- [ ] **2.17** [Dev 2] **Integrate ChromaLearning with GeminiAssistant**
  - Connect ChromaLearning to AI coordinator
  - Query similar past interactions for context
  - Use vector search results to personalize responses
  - Implement Day 1 vs Day 30 adaptation simulation

- [ ] **2.18** [Dev 3] **Build learning pattern analysis**
  - Implement routine pattern detection with Chroma
  - Track user preference evolution over time
  - Build similarity scoring for interaction matching
  - Generate personalized suggestions based on vector search

- [ ] **2.19** [Dev 3] **Create UserPreferences.ts**
  - Create `Assets/Scripts/Storage/UserPreferences.ts`
  - Implement preference loading from Supabase
  - Store user interaction patterns
  - Add preference update methods
  - Sync preferences with Chroma metadata

- [ ] **2.20** [Dev 3] **Create learning coordination schema**
  - Design user_interactions and learning_patterns tables in Supabase
  - Create SQL migration for learning data
  - Implement routine pattern analysis functions
  - Add Edge Function for advanced personalization (optional)

- [ ] **2.21** [Dev 2] **Build AICoordinator.ts**
  - Create `Assets/Scripts/Core/AICoordinator.ts`
  - Wire object detection to AI processing
  - Implement contextual response routing with Chroma context
  - Coordinate AR overlays with AI responses
  - Add learning feedback loop for continuous improvement

### 2.X Testing & E2E Development (Dev 4)

**Objective:** E2E testing and demo flow validation

- [ ] **2.T1** [Dev 4] **Continue PR review and test monitoring**
  - Review feature-specific PRs (Medicine, Nutrition, Calendar, Departure)
  - Monitor test coverage remains >80%
  - Merge approved PRs to develop branch

- [ ] **2.T2** [Dev 4] **Create E2E demo flow tests**
  - Create `__tests__/e2e/demo-flow.test.ts`
  - Test complete 2-minute demo sequence
  - Test each segment: medicine → bowl → laptop → keys → departure
  - Verify timing targets (20-25s per segment)

- [ ] **2.T3** [Dev 4] **Create test fixtures for demo objects**
  - Create `__tests__/fixtures/demo-objects.json`
  - Add realistic test data for all 5 demo objects
  - Include metadata for overlays (dosage, nutrition, meetings, etc.)

- [ ] **2.T4** [Dev 4] **Write integration tests for learning system**
  - Create `__tests__/integration/learning-system.test.ts`
  - Test ChromaLearning vector search functionality
  - Test personalization based on past interactions
  - Verify Day 1 vs Day 30 behavior differences

**HOUR 16 GIT MERGE:** All developers merge to develop branch

---

## Phase 2.5: **LiveKit Voice Streaming** (Hours 14-18) - PRIZE INTEGRATION

**Goal:** Integrate LiveKit for professional multi-agent voice streaming (+3 prizes: Most Complex, Creative, Startup)  
**Time:** 4 hours total (2 hour Dev 3 + 1 hour Dev 2 + 1 hour Dev 1)

### 2.5.1 LiveKit Infrastructure Setup (Dev 3 - 2 hours)

- [ ] **2.5.1** [Dev 3] **Create LiveKit Cloud project**
  - Sign up at https://cloud.livekit.io/
  - Create new project "marvin-voice"
  - Generate API key and secret
  - Save to Supabase secrets: `supabase secrets set LIVEKIT_API_KEY=xxx LIVEKIT_API_SECRET=xxx`

- [ ] **2.5.2** [Dev 3] **Create voice-enhance Edge Function**
  - Create `snap-cloud/functions/voice-enhance/index.ts`
  - Initialize LiveKit room with unique name
  - Generate access token for Spectacles client
  - Return room URL and token
  - Example code:
    ```typescript
    import { AccessToken } from 'livekit-server-sdk'
    
    const token = new AccessToken(
      Deno.env.get('LIVEKIT_API_KEY')!,
      Deno.env.get('LIVEKIT_API_SECRET')!,
      { identity: userId }
    )
    token.addGrant({ room: `marvin-${sessionId}`, roomJoin: true })
    
    return new Response(JSON.stringify({
      token: token.toJwt(),
      roomUrl: `wss://marvin.livekit.cloud`
    }))
    ```

- [ ] **2.5.3** [Dev 3] **Create LiveKit Agent implementation**
  - Create `snap-cloud/functions/livekit-agent/index.ts`
  - Implement agent session with STT, LLM, TTS configuration
  - Use ElevenLabs TTS plugin for voice synthesis
  - Configure voice interaction options: `allowInterruptions: true`
  - Set up agent state monitoring (listening, thinking, speaking)

- [ ] **2.5.4** [Dev 3] **Deploy voice-enhance Edge Function**
  - Deploy: `supabase functions deploy voice-enhance`
  - Deploy: `supabase functions deploy livekit-agent`
  - Test with curl: Create room, get token, verify connection
  - Monitor LiveKit Cloud dashboard for room creation

### 2.5.2 LiveKit Integration in AI Voice Service (Dev 2 - 1 hour)

- [ ] **2.5.5** [Dev 2] **Add LiveKit service to ai-voice**
  - Create `ai-voice/src/services/livekitService.ts`
  - Implement LiveKit room connection logic
  - Add token generation endpoint integration
  - Implement audio track management (microphone input, speaker output)
  - Add connection state management (disconnected, connecting, connected)

- [ ] **2.5.6** [Dev 2] **Integrate LiveKit with AI Voice Service**
  - Connect LiveKit audio to ElevenLabs voice synthesis pipeline
  - Implement fallback: ElevenLabs if LiveKit unavailable
  - Add health checks for LiveKit connectivity
  - Update service orchestration to include LiveKit

- [ ] **2.5.7** [Dev 2] **Add LiveKit API endpoints**
  - Create `POST /api/livekit/create-room` endpoint
  - Create `POST /api/livekit/token` endpoint
  - Add LiveKit connection status endpoint
  - Implement error handling for LiveKit failures

- [ ] **2.5.8** [Dev 2] **Test LiveKit integration**
  - Test room creation and token generation
  - Test audio streaming quality
  - Test fallback to ElevenLabs if LiveKit fails
  - Verify conversation context maintained

### 2.5.3 Client-Side Integration (Dev 1 - 1 hour)

- [ ] **2.5.9** [Dev 1] **Add LiveKit client to Lens Studio**
  - Install LiveKit client SDK (if available for Lens Studio)
  - Or use WebSocket directly to connect to LiveKit room
  - Request room token from voice-enhance Edge Function
  - Connect to LiveKit room with token

- [ ] **2.5.10** [Dev 1] **Integrate LiveKit audio with Spectacles**
  - Route microphone input to LiveKit track
  - Receive audio output from LiveKit agent
  - Pipe to AudioComponent for playback through Spectacles speakers
  - Add fallback to direct ElevenLabs if LiveKit unavailable

- [ ] **2.5.11** [Dev 1] **Add UI indicators for voice state**
  - Show "Listening..." when agent in listening state
  - Show "Thinking..." when agent processing
  - Show "Speaking..." when agent responding
  - Add visual feedback for interruptions

### 2.5.4 Testing & Validation (Dev 4 - 30 min)

- [ ] **2.5.12** [Dev 4] **Test LiveKit voice streaming**
  - Test low-latency audio (<500ms)
  - Test interruption handling
  - Test fallback to ElevenLabs if LiveKit fails
  - Verify conversation quality matches non-LiveKit flow

- [ ] **2.5.13** [Dev 4] **Performance monitoring**
  - Add logging for LiveKit metrics
  - Monitor token usage and costs
  - Check audio quality and latency
  - Verify no degradation of existing features

**Testing Checklist:**
- [ ] Voice streaming has <500ms latency
- [ ] Interruptions work smoothly
- [ ] Fallback to ElevenLabs works if LiveKit down
- [ ] Conversation context maintained across systems
- [ ] No impact on object detection performance

**Prize Value:**
- ✅ **LiveKit Most Complex:** Multi-agent voice streaming with AR context
- ✅ **LiveKit Most Creative:** Novel use of voice agents for AR assistance
- ✅ **LiveKit Best Startup:** Production-ready voice infrastructure

**Fallback Plan:**
- If LiveKit integration takes >4 hours or causes issues
- Revert to direct ElevenLabs integration (already working)
- Still have 8 prizes without LiveKit
- Focus remaining time on demo polish

---

## Phase 3: Integration & Real-time (Hours 16-24)

### 3.0 Complete AR-AI Integration

- [ ] **3.1** [Dev 1 & Dev 2] **Wire AICoordinator to all trackers**
  - Connect DemoObjectTracker events to AICoordinator
  - Wire Gemini responses to overlay creation
  - Implement real-time visual context processing
  - Test end-to-end object detection → AI → overlay flow

- [ ] **3.2** [Dev 2] **Optimize Gemini Live performance**
  - Tune frame capture intervals for optimal performance
  - Implement response caching for common scenarios
  - Add context pruning to stay within token limits
  - Test and optimize for <2s response times

- [ ] **3.3** [Dev 1] **Create demo mode controls**
  - Add manual object trigger buttons for testing
  - Implement demo sequence progression
  - Create reset functionality for repeated demos
  - Add status display for demo monitoring

### 3.1 Real-time Features with Supabase (FR-052)

- [ ] **3.4** [Dev 3] **Implement Supabase Realtime in Lens Studio**
  - Configure real-time channels in MarvinSupabaseClient.ts
  - Set up subscriptions for object_interactions table
  - Implement presence tracking for demo environment
  - Test real-time data sync performance

- [ ] **3.5** [Dev 1] **Connect AR overlays to Realtime**
  - Update overlays based on database events
  - Implement real-time status indicators
  - Add connection health monitoring
  - Test offline mode with cached data

- [ ] **3.6** [Dev 3] **Optimize Supabase performance**
  - Create database indexes for common queries
  - Implement connection pooling and reuse
  - Add retry logic for failed operations
  - Test with simulated network issues

### 3.2 Phone Integration & Backup (FR-026, FR-058-061)

- [ ] **3.7** [Dev 4] **Build simple web backup interface**
  - Create basic HTML/JS backup interface
  - Connect to same Supabase project
  - Implement manual object trigger buttons
  - Display current interaction state

- [ ] **3.8** [Dev 3] **Create device sync mechanism**
  - Implement session management in Supabase
  - Create device registration system
  - Handle device handoff gracefully
  - Test multi-device synchronization

### 3.3 Demo Environment & Test Data

- [ ] **3.9** [Dev 4] **Create demo data generator**
  - Generate mock interaction history
  - Create learning progression data (Day 1 vs Day 30)
  - Populate database with demo scenarios
  - Add DEMO_MODE toggle in Lens Studio

- [ ] **3.10** [Dev 3] **Set up demo database**
  - Run seed.sql with demo data
  - Create test user accounts
  - Populate object_locations with demo positions
  - Test data loading and retrieval

- [ ] **3.11** [All] **Practice demo flow**
  - Test complete 2-minute sequence
  - Time each segment (medicine, bowl, laptop, keys, departure)
  - Identify and fix timing issues
  - Practice transitions between objects

### 3.X Real-time Testing & Performance (Dev 4)

**Objective:** Test real-time features and backup systems

- [ ] **3.T1** [Dev 4] **Test Supabase Realtime functionality**
  - Create `__tests__/integration/realtime-sync.test.ts`
  - Test real-time database subscriptions
  - Test overlay updates on data changes
  - Verify connection recovery after network loss

- [ ] **3.T2** [Dev 4] **Build fallback system tests**
  - Create `__tests__/e2e/fallback-systems.test.ts`
  - Test cached responses when Gemini fails
  - Test Gemini voice when ElevenLabs fails
  - Test pre-recorded audio when both fail

- [ ] **3.T3** [Dev 4] **Create demo environment and test data**
  - Create `devops/demo/setup.ts` - demo data generator
  - Create `devops/demo/reset.ts` - reset to clean state
  - Populate database with Day 1 vs Day 30 scenarios
  - Add DEMO_MODE configuration toggle

- [ ] **3.T4** [Dev 4] **Build simple web backup interface**
  - Create basic HTML/JS backup interface
  - Connect to same Supabase project
  - Implement manual object trigger buttons
  - Display current interaction state
  - Test device handoff between Spectacles and web

**HOUR 24 GIT MERGE:** All developers merge to develop branch

## Phase 4: Demo Polish & Reliability (Hours 24-32)

### 4.0 Performance Optimization

- [ ] **4.1** [Dev 1] **Optimize AR performance**
  - Profile rendering performance in Lens Studio
  - Ensure smooth 60fps in all demo conditions
  - Optimize object detection for <100ms latency
  - Test memory usage and prevent leaks

- [ ] **4.2** [Dev 2] **Optimize Gemini response times**
  - Cache common responses in component properties
  - Pre-warm Gemini connection before demo
  - Optimize prompt length and structure
  - Test response times under various conditions

- [ ] **4.3** [Dev 3] **Optimize Supabase performance**
  - Add database indexes for critical queries
  - Implement connection reuse and pooling
  - Pre-load demo data into memory
  - Test database performance under load

### 4.1 Fallback Systems (FR-062-068)

- [ ] **4.4** [Dev 2] **Create response cache system**
  - Store pre-generated responses for demo objects
  - Implement fallback to cached responses on API failure
  - Create CachedResponses.ts utility class
  - Test fallback activation on network loss

- [ ] **4.5** [Dev 1] **Create manual trigger system**
  - Add UI buttons for manual object triggers
  - Implement simulated detection events
  - Create emergency demo control panel
  - Test manual flow matches automated flow

- [ ] **4.6** [Dev 2] **Prepare pre-recorded ElevenLabs audio**
  - Generate voice responses using ElevenLabs API for all demo scenarios
  - Save audio files in Assets/Audio/ (medicine, bowl, laptop, keys, departure)
  - Create AudioFallback.ts component for emergency playback
  - Test audio playback quality matches live synthesis
  - Configure VoiceHandler to use pre-recorded audio on API failures

- [ ] **4.7** [Dev 4] **Build system health monitor**
  - Create HealthMonitor.ts component
  - Monitor Gemini Live connection status
  - Monitor Supabase connection status
  - Display health indicators in debug mode

### 4.2 Critical Path Testing

- [ ] **4.8** [All] **Test complete demo flow end-to-end**
  - Run full sequence: Medicine → Bowl → Laptop → Keys → Departure
  - Time each segment (target: 20-25 seconds each)
  - Verify 2-minute total timing with buffer
  - Document any timing issues

- [ ] **4.9** [All] **Test edge cases and failures**
  - Test with poor lighting conditions
  - Test with network disconnection
  - Test with object detection failures
  - Test with Gemini API timeout
  - Verify fallback systems activate correctly

- [ ] **4.10** [Dev 4] **Create demo troubleshooting guide**
  - Document common failure modes
  - List recovery procedures for each failure
  - Create quick-reference troubleshooting card
  - Train team on troubleshooting steps

### 4.X Performance Testing & Demo Reliability (Dev 4)

**Objective:** Ensure production-ready demo reliability

- [ ] **4.T1** [Dev 4] **Create performance test suite**
  - Create `__tests__/e2e/performance.test.ts`
  - Test AR overlay rendering <100ms
  - Test Gemini response time <2s
  - Test database query performance <50ms
  - Test complete flow completes in <120s

- [ ] **4.T2** [Dev 4] **Create system health monitor**
  - Create `Assets/Scripts/Utils/HealthMonitor.ts`
  - Monitor Gemini Live connection status
  - Monitor Supabase connection status
  - Monitor ElevenLabs API availability
  - Display health indicators in debug mode

- [ ] **4.T3** [Dev 4] **Test fallback systems thoroughly**
  - Simulate Gemini API timeout
  - Simulate ElevenLabs API failure
  - Simulate Supabase connection loss
  - Simulate object detection failures
  - Verify all fallbacks activate correctly

- [ ] **4.T4** [Dev 4] **Run complete test suite**
  - Run all unit tests: `npm run test:unit`
  - Run all integration tests: `npm run test:integration`
  - Run all E2E tests: `npm run test:e2e`
  - Generate coverage report: `npm run test:coverage`
  - Target: All tests passing, coverage >85%

- [ ] **4.T5** [Dev 4] **Create demo troubleshooting guide**
  - Document common failure modes
  - List recovery procedures for each failure
  - Create quick-reference troubleshooting card
  - Train team on troubleshooting steps

**HOUR 32 GIT MERGE:** All developers merge to develop branch

## Phase 5: Demo Preparation (Hours 32-36)

### 5.0 Demo Environment Setup

- [ ] **5.1** [Dev 4] **Configure physical demo environment**
  - Set up demo table with 5 objects in optimal positions
  - Configure lighting for consistent object detection
  - Test audio levels and Spectacles speaker volume
  - Mark object positions for consistent placement

- [ ] **5.2** [All] **Optimize and practice demo timing**
  - Practice complete 2-minute demo flow 10+ times
  - Time each segment and optimize transitions
  - Identify potential sticking points
  - Create backup plans for each segment

- [ ] **5.3** [Dev 1] **Final Lens Studio optimization**
  - Build production version of project
  - Push final build to demo Spectacles device
  - Verify all assets loaded correctly
  - Test complete flow on actual device

### 5.1 Documentation & Presentation

- [ ] **5.4** [Lead] **Create demo documentation**
  - Write project overview with problem statement
  - Create technical architecture diagram
  - Document setup instructions and credentials
  - Prepare README for GitHub submission

- [ ] **5.5** [Dev 4] **Prepare presentation materials**
  - Create slide deck with key technical achievements
  - Record backup video of working demo
  - Prepare Q&A responses for common questions
  - Print troubleshooting quick-reference card

- [ ] **5.6** [All] **Assign presentation roles**
  - Designate demo operator (wears Spectacles)
  - Assign narrators for each demo segment
  - Assign backup operator and troubleshooter
  - Practice role transitions

### 5.2 Final System Testing

- [ ] **5.7** [All] **Conduct final system test**
  - Test all documented functional requirements (FR-001 through FR-062)
  - Note: Comprehensive FR documentation in progress; current implementation covers 22 core FRs
  - Verify 99%+ reliability in demo environment
  - Confirm all fallback systems operational
  - Test recovery from common failure modes

- [ ] **5.8** [All] **Demo rehearsal with judging simulation**
  - Practice full presentation with Q&A
  - Time presentation including demo and explanation
  - Practice transitions between speakers
  - Test recovery procedures

- [ ] **5.9** [Dev 4] **Prepare backup equipment**
  - Charge all devices to 100%
  - Prepare backup Spectacles device
  - Prepare backup phone with web interface
  - Pack power banks and charging cables

**HOUR 36 FINAL MERGE:** All developers merge to develop, then to main

### 5.X Final Testing & Demo Practice (Dev 4)

**Objective:** Ensure 99%+ demo reliability

- [ ] **5.T1** [Dev 4] **Run final test suite on production build**
  - Test on actual Spectacles device (not just Lens Studio preview)
  - Run E2E tests with physical demo objects
  - Test complete 2-minute flow 10+ times
  - Document success rate (target: 99%+)

- [ ] **5.T2** [Dev 4] **Test edge cases and failure modes**
  - Test with poor lighting conditions
  - Test with network disconnection
  - Test with API timeouts (Gemini, ElevenLabs)
  - Test object detection failures
  - Verify fallback systems activate correctly in all cases

- [ ] **5.T3** [Dev 4] **Practice demo flow with team**
  - Conduct 10+ complete rehearsals
  - Time each segment (medicine: 20-25s, bowl: 20-25s, laptop: 20-25s, keys: 20-25s, departure: 20-25s)
  - Identify and fix timing issues
  - Practice transitions between segments

- [ ] **5.T4** [Dev 4] **Verify all documentation up to date**
  - Review README.md for completeness
  - Review copilot-instructions.md for accuracy
  - Review TDD-STRATEGY.md for completeness
  - Create final architecture diagram

- [ ] **5.T5** [Dev 4] **Prepare backup materials**
  - Record backup video of working demo
  - Take screenshots of each demo segment
  - Create troubleshooting quick-reference card
  - Prepare emergency manual trigger plan

## Phase 6: Final Deployment & Go-Live (Hours 36-40)

### 6.0 Production Deployment

- [ ] **6.1** [Dev 3] **Deploy Supabase to production**
  - Run final database migrations on production
  - Deploy Edge Functions to production (if using)
  - Test production database connectivity
  - Verify Row Level Security policies active

- [ ] **6.2** [Dev 4] **Deploy web backup interface**
  - Deploy web interface to hosting (Vercel/Netlify)
  - Configure production Supabase connection
  - Test backup interface functionality
  - Share backup URL with team

- [ ] **6.3** [Dev 1] **Final device preparation**
  - Push final lens build to demo Spectacles
  - Charge device to 100%
  - Test on-device performance
  - Verify all assets loaded correctly

### 6.1 Final Demo Preparation

- [ ] **6.4** [All] **Conduct final dress rehearsal**
  - Run complete demo in actual presentation environment
  - Test with actual demo table and lighting
  - Verify all team members know their roles
  - Practice Q&A responses

- [ ] **6.5** [All] **Pre-demo checklist**
  - All devices charged to 100%
  - Backup equipment ready
  - Demo objects positioned correctly
  - Network connectivity verified
  - Fallback systems tested

- [ ] **6.6** [Dev 4] **Setup monitoring during demo**
  - Open Lens Studio console for logging
  - Monitor Supabase dashboard for errors
  - Monitor GitHub Actions for any late issues
  - Have backup systems ready to activate
  - Prepare troubleshooting quick-reference

- [ ] **6.6.1** [Dev 4] **Final pre-demo test**
  - Run `npm test` one final time
  - Verify all tests passing (unit + integration + E2E)
  - Check test coverage report (target: >85%)
  - Review CI/CD pipeline health

### 6.2 Submission & Documentation

- [ ] **6.7** [Lead] **Final code submission**
  - Create git tag v1.0.0 for submission
  - Push final code to main branch
  - Verify GitHub repository is public
  - Test git clone from fresh directory

- [ ] **6.8** [Lead] **Complete hackathon submission**
  - Submit project with required documentation
  - Include demo video (if required)
  - Submit team information
  - Verify submission confirmation received

- [ ] **6.9** [All] **Pre-presentation preparation**
  - Review technical talking points
  - Practice 30-second elevator pitch
  - Prepare for technical questions
  - Get adequate rest before presentation!

## Emergency Procedures

**If Spectacles fail:**
- Switch to backup Spectacles device (pre-loaded with lens)
- If both fail: Use phone backup interface with manual object triggers
- Demonstrate functionality via laptop screen share

**If Gemini API down:**
- Activate cached response system (CachedResponses.ts)
- Use pre-loaded demo responses stored in component
- Continue demo with explanations of cached behavior

**If network fails:**
- Switch to offline demo mode with cached data
- Use local Supabase storage for demo data
- Explain system's offline capabilities

**If object detection fails:**
- Use manual trigger buttons in demo UI
- Explain ML detection capabilities while demonstrating
- Show backup pre-recorded detection data

**If complete system failure:**
- Show backup demo video
- Walk through code and architecture on laptop
- Demonstrate individual components separately

## Success Checklist

- [ ] All 5 demo objects reliably detected (>95% accuracy)
- [ ] Complete 2-minute demo flow practiced 10+ times
- [ ] Gemini responses complete within 2 seconds
- [ ] AR overlays render within 100ms
- [ ] Supabase Realtime updates working
- [ ] Voice synthesis (Gemini Live) working clearly
- [ ] All fallback systems tested and ready
- [ ] Team trained on demo flow and troubleshooting
- [ ] 99%+ demo reliability confirmed in practice runs
- [ ] Backup systems (cached responses, manual triggers) operational
- [ ] Documentation complete and submission ready
- [ ] GitHub repository public and accessible
- [ ] Backup video recorded (if needed)
- [ ] All devices charged to 100%
