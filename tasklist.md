# Implementation Task List: Marvin AR Morning Assistant on Snap Spectacles

## Developer Assignment Key

- **[Dev 1]** = AR Core (Lens Studio Object Detection & UI)
- **[Dev 2]** = AI Integration (Gemini via Remote Service Gateway)
- **[Dev 3]** = Snap Cloud Integration (Supabase + Edge Functions)
- **[Dev 4]** = Integration & DevOps (Testing + Demo + CI/CD)

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

### Lens Studio Project Setup [Dev 1]

- [ ] **0.5** Create new Lens Studio project: `Marvin.esproj`
- [ ] **0.6** Set Device Type to **Spectacles (2024)** in Preview Panel
- [ ] **0.7** Create folder structure in Assets/:
  - `Assets/Scripts/Core/`
  - `Assets/Scripts/ObjectDetection/`
  - `Assets/Scripts/AROverlays/`
  - `Assets/Scripts/Storage/`
  - `Assets/Scripts/Utils/`
- [ ] **0.8** Create `Assets/Visuals/` for 3D models and textures
- [ ] **0.9** Create `Assets/Prefabs/` for reusable scene objects

### Install Required Packages [Dev 1]

- [ ] **0.10** Open Lens Studio > Window > Asset Library
- [ ] **0.11** Install **Remote Service Gateway Token Generator** plugin
- [ ] **0.12** Install **SpectaclesInteractionKit.lspkg** package
- [ ] **0.13** Install **SupabaseClient.lspkg** package
- [ ] **0.14** Install **SpectaclesUIKit.lspkg** package

### Configure Remote Service Gateway [Dev 2]

- [ ] **0.15** Generate token: Window > Remote Service Gateway Token > Generate Token
- [ ] **0.16** Create "RemoteServiceGatewayCredentials" object in scene hierarchy
- [ ] **0.17** Paste token into credentials object in Inspector

### Testing Infrastructure Setup [Dev 4]

**Objective:** Set up TDD framework before other developers start coding  
**Reference:** See `devops/TDD-STRATEGY.md` for complete details

- [ ] **0.A** Install Jest and TypeScript testing dependencies:
  - `npm install --save-dev jest ts-jest @types/jest @testing-library/jest-dom`
  - Create `jest.config.js` with TypeScript support
  - Create `__tests__/setup.ts` with global configuration

- [ ] **0.B** Create Lens Studio API mocks in `__tests__/mocks/lens-studio.ts`:
  - MockInternetModule (for Fetch API)
  - MockRemoteServiceModule (for Gemini)
  - MockMLComponent (for object detection)
  - MockObjectTracking3D
  - MockAudioComponent
  - MockEvent<T>
  - MockSupabaseClient
  
- [ ] **0.C** Write FAILING test templates for Phase 1 components:
  - `__tests__/unit/ObjectDetection/DemoObjectTracker.test.ts`
  - `__tests__/unit/Core/GeminiAssistant.test.ts`
  - `__tests__/unit/Core/ElevenLabsVoice.test.ts`
  - `__tests__/unit/Core/VoiceHandler.test.ts`
  - `__tests__/unit/Storage/SupabaseClient.test.ts`
  - `__tests__/unit/Storage/ChromaLearning.test.ts`
  - `__tests__/unit/AROverlays/OverlayManager.test.ts`
  - All tests should FAIL (RED phase) - no implementation yet

- [ ] **0.D** Set up GitHub Actions CI/CD:
  - Create `.github/workflows/test.yml` for automated testing on PR
  - Create `.github/workflows/lint.yml` for linting and type checking
  - Configure test coverage reporting with Codecov

- [ ] **0.E** Configure GitHub branch protection rules:
  - Require status checks to pass before merging
  - Require test workflow to pass
  - Require 1 approval from Dev 4
  - Require branches to be up to date with base branch
- [ ] **0.18** Test connection with sample API call

### Configure Snap Cloud (Supabase) [Dev 3]

- [ ] **0.19** Open Window > Supabase in Lens Studio
- [ ] **0.20** Login with Lens Studio credentials
- [ ] **0.21** Click "Create a New Project" in Supabase plugin
- [ ] **0.22** Click "Import Credentials" to generate SupabaseProject asset
- [ ] **0.23** Create `snap-cloud/` folder outside Lens Studio project for Edge Functions
- [ ] **0.24** Initialize Supabase CLI: `supabase init` in snap-cloud/

### Spectacles Device Setup [All]

- [ ] **0.25** Update Spectacles device to OS v5.64+
- [ ] **0.26** Update Spectacles App (iOS v0.64+ or Android v0.64+)
- [ ] **0.27** Pair Spectacles with Lens Studio via "Devices" panel
- [ ] **0.28** Test "Push to Device" functionality

### Demo Environment Preparation [Dev 4]

- [ ] **0.29** Prepare physical demo objects: bowl, laptop, keys, medicine bottle, phone
- [ ] **0.30** Set up controlled lighting environment
- [ ] **0.31** Create demo script documenting 2-minute flow
- [ ] **0.32** Take reference photos of demo objects for ML training

## Phase 1: Foundation (Hours 0-8)

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

### 1.2 Multimodal AI Integration (FR-008 to FR-014)

- [ ] **1.8** [Dev 2] **Implement GeminiAssistant.ts**
  - Create `Assets/Scripts/Core/GeminiAssistant.ts`
  - Import from `RemoteServiceGateway.lspkg/HostedExternal/Gemini`
  - Implement `GeminiLiveWebsocket` connection
  - Configure system instructions for morning assistant persona
  - Set up audio output with `DynamicAudioOutput` (24kHz)

- [ ] **1.9** [Dev 2] **Configure video input for Gemini**
  - Add `VideoController` for camera frame capture
  - Set compression quality and encoding (JPEG, HighQuality)
  - Implement frame capture at 1500ms intervals
  - Send frames to Gemini with contextual prompts

- [ ] **1.10** [Dev 2] **Build conversation context system**
  - Implement conversation history tracking (last 10 messages)
  - Create contextual prompt generation based on detected objects
  - Add time-of-day awareness (morning routine focus)
  - Store conversation state in component properties

- [ ] **1.11** [Dev 3] **Create AI coordination Edge Functions (Optional)**
  - Create Edge Function for processing complex AI requests with visual context
  - Implement request queuing and priority handling for different object types
  - Set up response caching in Supabase storage for common scenarios
  - Configure CORS and authentication for Edge Function access

### 1.3 Voice Integration (FR-015 to FR-021)

- [ ] **1.12** [Dev 2] **Implement ElevenLabsVoice.ts**
  - Create `Assets/Scripts/Core/ElevenLabsVoice.ts`
  - Use Fetch API to call ElevenLabs text-to-speech endpoint
  - Configure voice ID and model (eleven_multilingual_v2)
  - Implement audio playback with AudioComponent
  - Add error handling with fallback to Gemini voice

- [ ] **1.13** [Dev 2] **Configure Gemini Live voice fallback**
  - Enable audio output in GeminiAssistant.ts as backup
  - Configure voice preset (Puck, Charon, Aoede)
  - Set up DynamicAudioOutput at 24kHz
  - Test voice synthesis quality and response time

- [ ] **1.14** [Dev 2] **Implement microphone input**
  - Configure MicrophoneRecorder at 16kHz
  - Set up AudioProcessor for input handling
  - Implement voice command detection
  - Test speech-to-text accuracy with Gemini

- [ ] **1.15** [Dev 2] **Create VoiceHandler.ts coordinator**
  - Create `Assets/Scripts/Core/VoiceHandler.ts`
  - Coordinate between ElevenLabs (primary) and Gemini (fallback)
  - Implement notification sounds for different events
  - Add voice feedback for user actions
  - Create pre-recorded audio file fallbacks

### 1.4 Learning & Memory System (FR-031 to FR-037)

- [ ] **1.16** [Dev 3] **Implement ChromaLearning.ts**
  - Create `Assets/Scripts/Storage/ChromaLearning.ts`
  - Use Fetch API to interact with Chroma vector database
  - Implement `addInteraction()` for storing user patterns
  - Implement `findSimilarInteractions()` for personalization
  - Add embedding generation (via Gemini or OpenAI API)
  - Configure collection name and vector dimensions

- [ ] **1.17** [Dev 3] **Set up Chroma database**
  - Deploy Chroma server (local or cloud)
  - Create collection: `marvin_interactions`
  - Configure embedding function (OpenAI or custom)
  - Test vector similarity search
  - Set up backup storage in Supabase

- [ ] **1.18** [Dev 3] **Build learning pattern storage**
  - Store object interaction patterns in Chroma
  - Track time-of-day preferences
  - Record successful suggestion acceptance rates
  - Implement progressive learning (Day 1 vs Day 30 simulation)

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

- [ ] **1.22** [Dev 3] **Implement MarvinSupabaseClient.ts**
  - Create `Assets/Scripts/Storage/SupabaseClient.ts`
  - Import SupabaseClient from SupabaseClient.lspkg
  - Implement database CRUD operations
  - Set up real-time subscriptions for updates
  - Configure authentication with Snapchat ID

### 1.X Testing & Integration (Dev 4)

**Objective:** Monitor Phase 1 development and ensure all tests pass

- [ ] **1.T1** [Dev 4] **Monitor test execution as code is committed**
  - Watch GitHub Actions run on each PR
  - Review test results and provide feedback
  - Help debug failing tests
  - Run tests locally: `npm test`

- [ ] **1.T2** [Dev 4] **Review and approve PRs from Dev 1, 2, 3**
  - Check test coverage (target: >80%)
  - Verify TypeScript compiles without errors
  - Ensure linting passes
  - Provide code review comments
  - Merge PRs in dependency order (utilities → storage → detection → AI → overlays)

- [ ] **1.T3** [Dev 4] **Write integration tests for Phase 1 components**
  - Create `__tests__/integration/object-detection-to-ai.test.ts`
  - Create `__tests__/integration/ai-to-overlay.test.ts`
  - Create `__tests__/integration/voice-synthesis-flow.test.ts`
  - Test component interactions work correctly

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

### 2.2 Calendar & Productivity Integration (FR-024, FR-036-040)

- [ ] **2.9** [Dev 1] **Implement laptop interaction detection**
  - Fine-tune ML Component for laptop recognition
  - Implement LaptopTracker.ts component
  - Add proximity-based work mode trigger
  - Test calendar overlay positioning

- [ ] **2.10** [Dev 2] **Build calendar intelligence in GeminiAssistant**
  - Create meeting preparation prompts
  - Implement schedule briefing generation
  - Build conflict detection logic
  - Add daily schedule overview with priorities

- [ ] **2.11** [Dev 1] **Create CalendarOverlay.ts**
  - Create `Assets/Scripts/AROverlays/CalendarOverlay.ts`
  - Display upcoming meetings and tasks
  - Show meeting preparation checklist
  - Add time-based urgency indicators

- [ ] **2.12** [Dev 3] **Create calendar integration (optional)**
  - Design calendar_events and meeting_prep tables
  - Create Edge Function for Google Calendar API (optional)
  - Implement calendar data caching in Supabase
  - Set up real-time notifications for schedule updates

### 2.3 Key Location & Departure System (FR-025)

- [ ] **2.13** [Dev 1] **Implement key location tracking**
  - Fine-tune ML Component for key recognition
  - Implement KeyTracker.ts with spatial memory
  - Create AR arrow guidance system
  - Store last known position with WorldTracking

- [ ] **2.14** [Dev 2] **Build departure intelligence**
  - Create departure preparation prompts for Gemini
  - Implement checklist generation based on time
  - Build weather-based suggestions
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
