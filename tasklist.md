# Implementation Task List: Marvin AR Morning Assistant on Snap Spectacles

## Developer Assignment Key

- **[Dev 1]** = AR Core (Lens Studio + Object Detection)
- **[Dev 2]** = AI & Voice (Gemini + ElevenLabs + Chroma)
- **[Dev 3]** = Supabase Integration (Database + Edge Functions + Realtime)
- **[Dev 4]** = Integration & DevOps (Testing + Demo + CI/CD)

## Git Branch Structure

```
main → develop → feature/[ar-core|ai-voice|backend|integration]
```

## Phase 0: Pre-Hackathon Setup (T-24 to T-0 hours)

### Environment Setup [All]

- [ ] **0.1** Install Node.js 20 LTS, Lens Studio 5.13+, Git, VS Code with TypeScript/ESLint/Prettier extensions
- [ ] **0.2** Create GitHub repo "marvin-ar-assistant" with branch protection on main
- [ ] **0.3** Initialize monorepo structure: ar-core/, ai-voice/, snap-cloud/, devops/ folders
- [ ] **0.4** Create feature branches: feature/ar-core, feature/ai-voice, feature/supabase, feature/integration

### AR Development Setup [All]

- [ ] **0.5** Install Snap Lens Studio 5.13+ and create Spectacles developer account
- [ ] **0.6** Set up Snap Spectacles test device with demo environment
- [ ] **0.7** [Dev 1] Configure Lens Studio project with TypeScript and object detection ML components

### Service Accounts [Dev 3]

- [ ] **0.8** Create Supabase account and new project for Marvin AR assistant
- [ ] **0.9** Create Google AI Studio account for Gemini API, generate API keys (free tier)
- [ ] **0.10** Create ElevenLabs account for voice synthesis, generate API keys (free tier)
- [ ] **0.11** Set up Chroma vector database hosting (local or cloud instance)
- [ ] **0.12** Configure Supabase environment variables and share project URL/keys via secure channel

### Project Initialization [Split by role]

- [ ] **0.13** [Dev 1] Initialize Lens Studio project with TypeScript object detection templates
- [ ] **0.14** [Dev 2] Install AI dependencies: @google/genai, @elevenlabs/elevenlabs-js, chromadb, vapi-sdk
- [ ] **0.15** [Dev 3] Initialize Supabase project with CLI, install: @supabase/supabase-js, supabase CLI
- [ ] **0.16** [Dev 4] Initialize testing framework with Jest, set up GitHub Actions CI/CD pipeline

## Phase 1: Foundation (Hours 0-8)

### 1.0 Core Infrastructure

- [ ] **1.1** [Dev 1] **Set up Lens Studio AR foundation**

  - Create new Lens Studio project with Spectacles device target
  - Configure TypeScript build pipeline with object detection imports
  - Set up basic scene with camera feed and spatial tracking

- [ ] **1.2** [Dev 2] **Initialize Gemini multimodal AI**

  - Configure GoogleGenAI client with API key authentication
  - Create multimodal service accepting image data and text prompts
  - Test basic image analysis with sample breakfast bowl image

- [ ] **1.3** [Dev 3] **Set up Supabase foundation**

  - Initialize Supabase project and configure local development environment
  - Set up database schema for object interactions, user profiles, and learning data
  - Configure Row Level Security policies for data access
  - Create health check functions and test database connectivity
  - **NEW ARCHITECTURE:** Supabase is accessed directly from Spectacles Lens, bypassing Snap Cloud. Use hardcoded Supabase URL/token and experimental API for direct AR client integration.

- [ ] **1.4** [Dev 4] **Create CI/CD pipeline and testing framework**
  - Set up GitHub Actions workflow for automated testing
  - Configure Jest testing environment for all TypeScript modules
  - Implement integration test skeleton for AR-Backend communication

### 1.1 Object Detection System (FR-001 to FR-007)

- [ ] **1.5** [Dev 1] **Implement core object detection**

  - Configure MLComponent with pre-trained object detection model
  - Create ObjectTracker for 5 demo objects: medicine, bowl, laptop, keys, phone
  - Implement spatial anchor system for persistent object positioning
  - Test object recognition accuracy >95% in demo environment

- [ ] **1.6** [Dev 3] **Create object interaction database schema**

  - Design tables for object_interactions, user_preferences, and learning_data
  - Implement Row Level Security for user data isolation
  - Create database functions for interaction logging and pattern analysis
  - Set up real-time subscriptions for object state changes

- [ ] **1.7** [Dev 1] **Implement gesture detection**
  - Configure HandTracking API for reaching/touching gestures
  - Create gesture recognition for object interaction triggers
  - Integrate gesture events with object detection pipeline

### 1.2 Multimodal AI Integration (FR-008 to FR-014)

- [ ] **1.8** [Dev 2] **Build Gemini visual processing**

  - Implement camera feed analysis with Gemini Vision API
  - Create contextual prompt generation based on detected objects
  - Process visual context with <2 second response time requirement

- [ ] **1.9** [Dev 2] **Set up conversation context system**

  - Implement conversation history storage and retrieval
  - Create context-aware response generation
  - Build intelligent suggestion system based on time and patterns

- [ ] **1.10** [Dev 3] **Create AI coordination Edge Functions**
  - Create Edge Function for processing Gemini API requests with visual context
  - Implement request queuing and priority handling for different object types
  - Set up response caching in Supabase storage for common scenarios
  - Configure CORS and authentication for Edge Function access
  - **NEW ARCHITECTURE:** Edge Functions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

### 1.3 Voice Integration Foundation (FR-015 to FR-021)

- [ ] **1.11** [Dev 2] **Implement ElevenLabs voice synthesis**

  - Configure ElevenLabsClient with demo voice ID
  - Create text-to-speech pipeline with <2 second synthesis time
  - Implement audio streaming for real-time playback

- [ ] **1.12** [Dev 2] **Set up Vapi conversation system**

  - Configure Vapi client for real-time voice conversation
  - Implement hands-free voice command processing
  - Create audio feedback system for Spectacles speakers

- [ ] **1.13** [Dev 3] **Build voice Edge Functions**
  - Create Edge Function for ElevenLabs text-to-speech processing
  - Implement Supabase Realtime for voice conversation state
  - Set up audio response caching in Supabase Storage
  - Create fallback system with pre-recorded audio files
  - **NEW ARCHITECTURE:** Voice Edge Functions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

### 1.4 AR User Interface Foundation (FR-043 to FR-049)

- [ ] **1.14** [Dev 1] **Create AR overlay system**

  - Implement RenderMeshVisual components for 3D overlays
  - Create Text components with consistent typography and spacing
  - Design visual hierarchy system for information display

- [ ] **1.15** [Dev 1] **Build responsive AR UI**

  - Create adaptive brightness system based on environmental lighting
  - Implement overlay positioning that doesn't obstruct real-world view
  - Test UI readability in various lighting conditions

- [ ] **1.16** [Dev 4] **Implement AR-Supabase communication**
  - Create Supabase client in Lens Studio for real-time data access
  - Implement Realtime subscriptions for object interaction updates
  - Set up error handling and retry logic for network connectivity
  - Configure authentication flow for AR client access

**HOUR 8 GIT MERGE:** All developers merge to develop branch

## Phase 2: Core Features (Hours 8-16)

### 2.0 Object-Specific Intelligence (FR-022 to FR-028)

- [ ] **2.1** [Dev 1] **Implement medicine bottle detection**

  - Create ML model training for medicine bottle recognition
  - Implement medication reminder overlay system
  - Add timer-based proactive reminders based on schedule
  - Test accuracy with various bottle shapes and sizes

- [ ] **2.2** [Dev 2] **Build health reminder AI**

  - Create medication schedule processing with Gemini
  - Implement time-based reminder logic
  - Build voice confirmations for critical health actions
  - Create emergency contact integration for missed medications

- [ ] **2.3** [Dev 3] **Create health data schema and Edge Functions**
  - Design medication_schedules and health_reminders tables
  - Implement Edge Functions for medication timing and notifications
  - Set up Row Level Security for sensitive health data
  - Create real-time subscriptions for medication reminders
  - **NEW ARCHITECTURE:** Health Edge Functions and subscriptions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

### 2.1 Nutrition & Breakfast Intelligence (FR-023)

- [ ] **2.4** [Dev 1] **Implement breakfast bowl detection**

  - Train object detection for various bowl types and contents
  - Create visual analysis pipeline for food recognition
  - Implement nutrition information overlay system
  - Test with variety of breakfast foods and bowl configurations

- [ ] **2.5** [Dev 2] **Build nutrition AI processing**

  - Integrate Gemini for food visual analysis
  - Create nutrition database with caloric and macro information
  - Implement healthy recipe suggestion system
  - Build dietary preference learning and adaptation

- [ ] **2.6** [Dev 3] **Create nutrition tracking schema**
  - Design food_logs and nutrition_analysis tables
  - Create Edge Functions for nutrition data processing
  - Implement daily/weekly nutrition summary functions
  - Set up real-time updates for nutrition tracking
  - **NEW ARCHITECTURE:** Nutrition Edge Functions and subscriptions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

### 2.2 Calendar & Productivity Integration (FR-024, FR-036-040)

- [ ] **2.7** [Dev 1] **Implement laptop interaction detection**

  - Create proximity-based laptop detection
  - Implement work mode AR overlay system
  - Build meeting preparation interface
  - Test calendar information display optimization

- [ ] **2.8** [Dev 2] **Build calendar intelligence**

  - Integrate Google Calendar API for schedule access
  - Create meeting briefing and preparation suggestions
  - Implement conflict detection and optimization
  - Build daily schedule overview with priorities

- [ ] **2.9** [Dev 3] **Create calendar integration Edge Functions**
  - Build Edge Function for Google Calendar API integration
  - Design calendar_events and meeting_prep tables
  - Implement calendar data caching and sync in Supabase
  - Create real-time notifications for schedule updates
  - **NEW ARCHITECTURE:** Calendar Edge Functions and subscriptions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

### 2.3 Key Location & Departure System (FR-025)

- [ ] **2.10** [Dev 1] **Implement key location tracking**

  - Create spatial memory system for key placement
  - Implement AR arrow guidance to last known location
  - Build departure checklist overlay system
  - Test location accuracy and guidance effectiveness

- [ ] **2.11** [Dev 2] **Build departure intelligence**

  - Create departure preparation AI using Gemini
  - Implement checklist generation based on calendar
  - Build weather-based departure suggestions
  - Create commute time estimation and alerts

- [ ] **2.12** [Dev 3] **Create location tracking schema**
  - Design object_locations and spatial_memory tables
  - Create Edge Functions for location updates and queries
  - Implement departure checklist management with real-time updates
  - Set up location history and pattern analysis
  - **NEW ARCHITECTURE:** Location Edge Functions and subscriptions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

### 2.4 Contextual Memory & Learning (FR-029 to FR-035)

- [ ] **2.13** [Dev 2] **Implement Chroma vector database**

  - Set up Chroma collection for user interactions
  - Create embedding generation for conversation context
  - Implement similarity search for contextual responses
  - Build learning progression simulation (Day 1 vs Day 30)

- [ ] **2.14** [Dev 3] **Create learning coordination schema**
  - Design user_interactions and learning_patterns tables
  - Create Edge Functions for interaction analysis and personalization
  - Implement routine pattern analysis with Supabase functions
  - Set up real-time learning updates and notifications
  - **NEW ARCHITECTURE:** Learning Edge Functions and subscriptions must support direct calls from Spectacles Lens with hardcoded Supabase token and experimental API. Remove Snap Cloud proxy logic.

**HOUR 16 GIT MERGE:** All developers merge to develop branch

## Phase 3: Integration & Real-time (Hours 16-24)

### 3.0 AR-AI Integration

- [ ] **3.1** [Dev 1 & Dev 2] **Connect AR detection to AI processing**

  - Wire object detection events to Gemini analysis pipeline
  - Implement real-time visual context processing
  - Handle AR-AI communication with <100ms latency

- [ ] **3.2** [Dev 2 & Dev 3] **Connect AI services to Supabase**
  - Wire Gemini responses to Supabase Edge Functions
  - Implement voice synthesis coordination through Supabase Realtime
  - Add Chroma learning integration with Supabase storage

### 3.1 Real-time Features (FR-052)

- [ ] **3.3** [Dev 3] **Implement direct Supabase Realtime subscriptions**
- Configure Realtime for object interactions, health reminders, calendar updates, and device presence
- Set up real-time conversation state synchronization using direct AR/Supabase integration (no Snap Cloud)
- Implement device presence tracking and sync for demo reliability
- Create real-time data sync across AR and web interfaces using hardcoded Supabase token/URL and experimental API
- Implement fallback modes and offline-first logic for demo reliability

- [ ] **3.4** [Dev 1 & Dev 4] **Add Supabase Realtime to AR**
  - Connect Lens Studio to Supabase Realtime subscriptions
  - Update AR overlays based on real-time database events
  - Implement offline mode with cached responses from Supabase Storage

### 3.2 Phone Integration & Backup (FR-026, FR-058-061)

- [ ] **3.5** [Dev 4] **Build phone backup interface**

  - Create React web app as backup interface
  - Implement same functionality as AR interface
  - Add Bluetooth connection for device coordination

- [ ] **3.6** [Dev 3] **Create device sync with direct Supabase integration**
- Implement user session management with Supabase Auth (direct AR client)
- Create device synchronization and presence tracking using Supabase Realtime (hardcoded token/URL)
- Handle device disconnection gracefully with offline-first and fallback logic

### 3.3 Demo Environment & Mock Data

- [ ] **3.7** [All] **Create demo mode (direct Supabase integration)**
- Generate mock interaction data for learning progression using SupabaseDirect schemas
- Add DEMO_MODE flag toggling between real and simulated (direct AR/Supabase)
- Pre-place demo objects in controlled environment and sync via Supabase

- [ ] **3.8** [Dev 4] **Build demo orchestration**
  - Create demo script with timing controls
  - Implement manual progression triggers
  - Add demo reset capability for back-to-back presentations

**HOUR 24 GIT MERGE:** All developers merge to develop branch

## Phase 4: Demo Polish & Reliability (Hours 24-32)

### 4.0 Performance Optimization

- [ ] **4.1** [Dev 1] **Optimize AR performance**

  - Ensure 60fps AR rendering in all conditions
  - Optimize object detection for <100ms latency
  - Test memory usage and prevent leaks

- [ ] **4.2** [Dev 2] **Optimize AI response times**
  - Cache common Gemini responses for instant replay
  - Pre-generate voice synthesis for demo scenarios
  - Optimize Chroma queries for <500ms response

### 4.1 Fallback Systems (FR-062-068)

- [ ] **4.3** [Dev 4] **Implement comprehensive fallbacks**

  - Pre-recorded voice responses for ElevenLabs failures
  - Static object detection data for Snap API failures
  - Cached AI responses for Gemini API failures
  - Manual demo controls for complete system failures

- [ ] **4.4** [Dev 3] **Build monitoring and health checks**
  - Set up Supabase health monitoring and Edge Function status checks
  - Create demo environment status dashboard using Supabase database
  - Implement real-time system health notifications

### 4.2 Critical Path Testing

- [ ] **4.5** [All] **Test complete demo flow**

  - Medicine reminder → Breakfast → Calendar → Keys → Departure
  - Verify 2-minute timing with buffer for questions
  - Test in actual demo hall environment conditions

- [ ] **4.6** [All] **Test edge cases and error handling**
  - Object not detected → manual triggers available
  - Network failure → offline mode activation
  - Voice synthesis failure → text overlay fallback

**HOUR 32 GIT MERGE:** All developers merge to develop branch

## Phase 5: Demo Preparation (Hours 32-40)

### 5.0 Demo Environment Setup

- [ ] **5.1** [Dev 4] **Configure demo environment**

  - Set up demo desk with 5 objects in optimal positions
  - Configure lighting for consistent object detection
  - Test audio levels and Spectacles speaker volume

- [ ] **5.2** [All] **Optimize demo timing**
  - Practice complete 2-minute demo flow 10 times
  - Identify potential sticking points and backup plans
  - Create demo script with timing markers

### 5.1 Documentation & Presentation

- [ ] **5.3** [Lead] **Create demo documentation**

  - Project overview with problem statement
  - Technical architecture diagram
  - Demo credentials and setup instructions

- [ ] **5.4** [Dev 4] **Prepare presentation materials**
  - Create slide deck with key technical achievements
  - Record backup video of working demo
  - Prepare Q&A responses for common technical questions

### 5.2 Final System Testing

- [ ] **5.5** [All] **End-to-end system testing**

  - Test all 68 functional requirements
  - Verify 99%+ reliability in demo environment
  - Confirm all fallback systems operational

- [ ] **5.6** [All] **Demo rehearsal**
  - Assign presentation roles to team members
  - Practice transitions between demo segments
  - Test recovery procedures for common failures

**HOUR 40 GIT MERGE:** All developers merge to develop branch

## Phase 6: Final Deployment & Go-Live (Hours 40-48)

### 6.0 Production Deployment

- [ ] **6.1** [Dev 3] **Deploy Supabase configuration**

  - Configure production Supabase environment with proper security settings
  - Deploy Edge Functions to production Supabase instance
  - Test real-time performance under demo load conditions

- [ ] **6.2** [Dev 4] **Deploy monitoring and backup systems**

  - Deploy phone backup interface to Vercel
  - Configure production monitoring and alerting
  - Test all backup and recovery procedures

- [ ] **6.3** [Dev 1] **Final AR optimization**
  - Build production Lens Studio project
  - Test on actual demo Spectacles device
  - Verify object detection in demo environment

### 6.1 Final Demo Preparation

- [ ] **6.4** [All] **Final integration testing**

  - Test complete system in production environment
  - Verify demo timing under actual conditions
  - Confirm all team members comfortable with demo flow

- [ ] **6.5** [All] **Go-live preparation**
  - Final equipment check and backup devices ready
  - Team briefing on roles and backup responsibilities
  - Demo environment setup and final calibration

### 6.2 Submission

- [ ] **6.6** [Lead] **Final submission**
  - Create git tag v1.0.0 for submission
  - Submit project with required documentation
  - Verify submission confirmation received

## Emergency Procedures

**If Snap Spectacles fail:** Use phone backup interface with manual object triggers
**If Gemini API down:** Use cached responses for demo scenarios
**If ElevenLabs fails:** Use pre-recorded audio files
**If network fails:** Use offline mode with local data
**If object detection fails:** Use manual triggers with simulated detection

## Success Checklist

- [ ] All 5 demo objects reliably detected (>95% accuracy)
- [ ] Complete 2-minute demo flow practiced and timed
- [ ] Voice responses complete within 2 seconds
- [ ] AR overlays render within 100ms
- [ ] WebSocket real-time updates working
- [ ] All fallback systems tested and ready
- [ ] Team trained on demo flow and troubleshooting
- [ ] 99%+ demo reliability confirmed
- [ ] Backup systems operational
- [ ] Documentation complete
