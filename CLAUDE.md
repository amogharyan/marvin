# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Marvin AR Morning Assistant** is an AR-powered personal assistant built for Snap Spectacles that provides intelligent, contextual guidance throughout morning routines using object recognition, multimodal AI, and adaptive learning.

This is a **36-hour hackathon project** targeting MLH competition with a focus on demo reliability and integration of multiple advanced technologies.

### Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  Snap Spectacles    │◄──►│  AI Processing      │◄──►│  Supabase Services  │
│  (lens-studio/)     │    │  (External APIs)    │    │  (Backend)          │
│                     │    │                     │    │                     │
│ • Object Detection  │    │ • Gemini Vision AI  │    │ • PostgreSQL DB     │
│ • AR Overlays       │    │ • ElevenLabs Voice  │    │ • Edge Functions    │
│ • Spatial Tracking  │    │ • Vapi Conversation │    │ • Realtime Subscr.  │
│ • Gesture Handler   │    │ • Chroma Vector DB  │    │ • Storage & Auth    │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

**Recent Migration**: Backend migrated from Express to Supabase (Edge Functions + Realtime + PostgreSQL).

## Common Commands

### Lens Studio (AR Core)

```bash
# Navigate to AR module
cd lens-studio

# Install dependencies
npm install

# Build TypeScript
npm run build

# Development with watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing Individual Components

```bash
# Test specific file
npm test -- ObjectTracker.test.ts

# Test specific suite
npm test -- --testNamePattern="ObjectTracker"

# Watch mode for specific file
npm test:watch -- ObjectTracker.test.ts
```

### Git Workflow

```bash
# Branch structure: main → develop → feature/[ar-core|ai-voice|backend|integration]

# Typical workflow
git checkout -b feature/my-feature develop
# ... make changes ...
git commit -m "Descriptive commit message"
git push origin feature/my-feature
# Create PR to develop, then develop → main
```

## High-Level Architecture

### Critical Performance Requirements

These constraints drive all architectural decisions:

- **AR Overlay Latency**: <100ms from object detection to render (FR-005)
- **Voice Processing**: <2s end-to-end response time (FR-014)
- **Object Detection Accuracy**: >95% for demo objects (FR-066)
- **Demo Reliability**: 99%+ uptime during 2-minute presentation (FR-062)
- **Frame Rate**: Stable 60fps in demo environment (FR-063)

### Demo Objects System

The system recognizes **5 specific objects** that trigger different assistance modes:

1. **Medicine Bottle** → Health reminders and medication tracking
2. **Breakfast Bowl** → Nutrition analysis and recipe suggestions
3. **Laptop** → Calendar briefings and work mode
4. **Keys** → Location tracking and departure checklists
5. **Phone** → Connectivity status and backup interface

Configuration lives in [lens-studio/src/ObjectDetection/DemoObjects.ts](lens-studio/src/ObjectDetection/DemoObjects.ts).

### Component Integration Pattern

**Event-Driven Architecture**: Components communicate through event system to maintain loose coupling:

```typescript
// ObjectTracker emits detection events
objectTracker.on((event: ObjectDetectionEvent) => {
  // MarvinARSystem coordinates responses
  this.handleObjectDetectionEvent(event);
});

// Gesture events trigger object interactions
gestureHandler.on((event: GestureEvent) => {
  this.handleGestureEvent(event);
});
```

**Main coordinator**: [lens-studio/src/main.ts](lens-studio/src/main.ts) - `MarvinARSystem` class orchestrates all AR components and manages lifecycle.

### Spatial Memory & Learning

Uses **Chroma vector database** for contextual memory:
- Object location tracking (where were keys last seen?)
- User preference learning (breakfast choices, medicine schedule)
- Routine pattern recognition (wake time, calendar patterns)
- Progressive personalization simulation for demo ("Day 1 vs Day 30")

### Backend Migration (Express → Supabase)

**Why Supabase**: Simplified backend with built-in realtime, auth, storage, and Edge Functions.

Key architectural changes:
- **Express routes** → **Supabase Edge Functions** (Deno runtime)
- **Custom WebSocket** → **Supabase Realtime subscriptions**
- **Custom auth** → **Supabase Auth** with Row Level Security
- **Manual DB queries** → **Supabase client SDK** with type safety

See [agent-os/standards/backend/](agent-os/standards/backend/) for migration patterns.

## Development Standards

### Agent-OS Integration

This project uses **agent-os** development methodology with coding standards enforced across all components. Standards are located in [agent-os/standards/](agent-os/standards/):

**Key Standards Files**:
- [global/coding-style.md](agent-os/standards/global/coding-style.md) - Naming, formatting, DRY principle
- [global/error-handling.md](agent-os/standards/global/error-handling.md) - Fail-fast, graceful degradation
- [global/conventions.md](agent-os/standards/global/conventions.md) - File structure, imports
- [backend/api.md](agent-os/standards/backend/api.md) - RESTful design, versioning
- [frontend/components.md](agent-os/standards/frontend/components.md) - AR overlay patterns
- [testing/test-writing.md](agent-os/standards/testing/test-writing.md) - Coverage requirements

**Core Principles**:
- **KISS**: Simple solutions over complex ones (36-hour constraint)
- **YAGNI**: Focus strictly on 68 functional requirements in PRD
- **Fail Fast**: Check errors early, throw exceptions immediately
- **DRY**: Extract common logic into reusable functions
- **Small Functions**: <50 lines, single responsibility

### Code Style Enforcement

```typescript
// ✅ GOOD: Descriptive names, small focused function
function calculateObjectDetectionConfidence(
  mlOutput: MLModelOutput,
  trackedObject: DemoObject
): number {
  const baseConfidence = mlOutput.confidence;
  const spatialStability = calculateSpatialStability(trackedObject);
  return baseConfidence * spatialStability;
}

// ❌ BAD: Abbreviations, multiple responsibilities, >50 lines
function calc(data: any): any {
  // ... 80 lines doing detection + tracking + rendering ...
}
```

### TypeScript Configuration

- **Strict mode enabled** (`tsconfig.json`)
- **No implicit any** - all types must be declared
- **Comprehensive JSDoc** - all public APIs documented
- **Type definitions** - Lens Studio types in [lens-studio/src/types/lens-studio.d.ts](lens-studio/src/types/lens-studio.d.ts)

### Error Handling Pattern

```typescript
// Centralized error types
export enum ARErrorType {
  ML_MODEL_LOAD_FAILED = 'ML_MODEL_LOAD_FAILED',
  OBJECT_TRACKING_LOST = 'OBJECT_TRACKING_LOST',
  SPATIAL_ANCHOR_FAILED = 'SPATIAL_ANCHOR_FAILED',
  // ...
}

// Custom error class with context
export class ARError extends Error {
  constructor(
    public type: ARErrorType,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
  }
}

// Usage: Fail fast at boundaries
try {
  await this.objectTracker.initialize(objectTracking, mlComponent);
} catch (error) {
  throw new ARError(
    ARErrorType.ML_MODEL_LOAD_FAILED,
    'Failed to initialize object tracker',
    { originalError: error }
  );
}
```

## Project Structure Deep Dive

### Lens Studio Module (`lens-studio/`)

**~4400 lines of production TypeScript** implementing AR core functionality:

```
lens-studio/
├── src/
│   ├── ObjectDetection/          # Object recognition & tracking
│   │   ├── ObjectTracker.ts      # Main tracking coordinator
│   │   ├── DemoObjects.ts        # 5 object configurations
│   │   └── SpatialAnchors.ts     # Persistent positioning
│   ├── AROverlays/                # Visual overlay system
│   │   └── OverlayManager.ts     # Text, icons, arrows, notifications
│   ├── Gestures/                  # Hand tracking
│   │   └── GestureHandler.ts     # Reach, touch, point gestures
│   ├── types/                     # Type definitions
│   │   ├── core.ts               # App types (DemoObject, Events, etc.)
│   │   └── lens-studio.d.ts      # Lens Studio API types
│   └── main.ts                    # MarvinARSystem coordinator
├── docs/                          # Implementation guides
│   ├── SETUP.md                   # Lens Studio setup
│   ├── OBJECT_DETECTION.md        # Detection system guide
│   └── AR_OVERLAYS.md             # Overlay design guide
└── tests/                         # Jest test suites
```

**Key Implementation Notes**:

1. **Update Loop**: 60fps update cycle in `main.ts` handles camera position, brightness adaptation, billboard rotation, and cleanup
2. **Performance Monitoring**: Built-in metrics tracking for detection latency, render latency, FPS
3. **Spatial Memory**: Anchors persist object locations even when not visible for "Where are my keys?" queries
4. **Event System**: Loose coupling between detection, gestures, and overlays

### Backend Architecture (Supabase)

**Expected structure** (to be implemented):

```
supabase/
├── migrations/                    # Database schema
│   ├── 001_initial_schema.sql    # Core tables
│   └── 002_learning_data.sql     # Chroma integration
├── functions/                     # Edge Functions (Deno)
│   ├── ai-processing/            # Gemini API integration
│   ├── voice-synthesis/          # ElevenLabs integration
│   ├── calendar-sync/            # Google Calendar
│   └── object-tracking/          # Object interaction processing
└── seed.sql                       # Demo data
```

**Database Schema** (from PRD requirements):
- `object_interactions` - Track object usage patterns
- `user_preferences` - Breakfast choices, medicine schedule, etc.
- `learning_data` - Chroma embeddings for adaptive behavior
- `spatial_memory` - Object locations and room layout

### Documentation (`docs/`)

API integration guides:
- [chroma.md](docs/chroma.md) - Vector database for learning
- [elevenlabs.md](docs/elevenlabs.md) - Voice synthesis
- [gemini.md](docs/gemini.md) - Multimodal AI
- [groq.md](docs/groq.md) - Alternative AI inference
- [fetchai.md](docs/fetchai.md) - Autonomous agents

## Critical Constraints

### Demo Environment

All development must work reliably in **controlled demo environment**:

- **Physical Setup**: 6ft x 3ft desk, neutral backdrop
- **Lighting**: LED panels, 5000K, 800 lux (affects AR tracking)
- **Object Placement**: Specific positions for optimal detection
- **Network**: Dedicated 100Mbps + 5G backup
- **Duration**: 2-minute live demonstration

**Fallback Systems Required**:
- Pre-generated AI responses if Gemini API fails
- Pre-recorded audio if ElevenLabs fails
- Offline demo mode if network fails
- Secondary Spectacles device on standby

### Functional Requirements Mapping

**68 functional requirements** in [prd.md](prd.md) drive all implementation decisions. High-priority items:

- **FR-001 to FR-007**: Object detection core (CRITICAL)
- **FR-008 to FR-014**: Multimodal AI integration (CRITICAL)
- **FR-015 to FR-021**: Voice integration (CRITICAL)
- **FR-043 to FR-049**: AR UI requirements (HIGH)
- **FR-062 to FR-068**: Demo reliability (CRITICAL)

When making changes, reference FR numbers in comments and commits.

## Team Roles & Workflow

**4-Developer Team Structure**:

1. **Dev 1 - AR Core**: Lens Studio implementation, object detection, spatial tracking
2. **Dev 2 - AI & Voice**: Gemini, ElevenLabs, Vapi integration, conversational logic
3. **Dev 3 - Supabase Integration**: Database design, Edge Functions, Realtime subscriptions
4. **Dev 4 - Integration & DevOps**: CI/CD, testing, demo orchestration, monitoring

**Development Timeline** (from [marvin-ar-task-list.md](marvin-ar-task-list.md)):
- **Phase 0** (Pre-hackathon): Environment setup, API keys, project initialization
- **Phase 1** (Hours 0-8): Core foundation for each component
- **Phase 2-6**: Progressive feature integration with continuous testing

**Integration Points**: Merge every 6 hours to maintain continuous integration.

## Important Files

**Must Read First**:
- [prd.md](prd.md) - Complete product requirements (68 FRs)
- [marvin-ar-task-list.md](marvin-ar-task-list.md) - Detailed implementation tasks
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - Comprehensive dev guide
- [agent-os/README.md](agent-os/README.md) - Agent-OS development methodology

**Reference During Development**:
- [lens-studio/README.md](lens-studio/README.md) - AR module overview
- [lens-studio/IMPLEMENTATION_SUMMARY.md](lens-studio/IMPLEMENTATION_SUMMARY.md) - Current implementation status
- [agent-os/standards/](agent-os/standards/) - All coding standards

## Working with Lens Studio

### Local Development Setup

1. Install Snap Lens Studio 5.13+ from Snap Developer Portal
2. Create new Spectacles project (not mobile AR)
3. Import TypeScript from `lens-studio/dist/` after running `npm run build`
4. Configure ML components for object detection in Lens Studio UI
5. Set up scene with camera feed and spatial tracking
6. Deploy to Spectacles device for testing

### TypeScript → Lens Studio Workflow

```bash
# Make changes to TypeScript
vim lens-studio/src/main.ts

# Build (compiles to dist/)
npm run build

# Import in Lens Studio
# Resources → Import Files → Select dist/main.js
# Add as custom script to scene object
# Configure script inputs (tracking components, etc.)

# Deploy to device
# Lens Studio → Device → Send to Spectacles
```

### Debugging AR Code

- **Console logs**: `console.log()` appears in Lens Studio console
- **Performance profiler**: Built into Lens Studio (View → Performance)
- **Visual debugging**: Use AR overlays to display debug info in headset
- **Remote debugging**: Lens Studio can debug while code runs on device

## Supabase Integration Patterns

### Edge Function Example

```typescript
// supabase/functions/ai-processing/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { object_type, visual_context } = await req.json();

  // Call Gemini API for visual processing
  const aiResponse = await processWithGemini(visual_context);

  // Store interaction in database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabase.from('object_interactions').insert({
    object_type,
    response: aiResponse,
    timestamp: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ response: aiResponse }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Realtime Subscriptions

```typescript
// AR client subscribes to backend updates
supabase
  .channel('object-updates')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'object_interactions' },
    (payload) => {
      // Update AR overlay with new AI response
      this.updateOverlayContent(payload.new);
    }
  )
  .subscribe();
```

### Row Level Security

All tables use RLS policies for data isolation:
```sql
-- Only allow access to user's own data
CREATE POLICY user_data_isolation ON object_interactions
  FOR ALL USING (auth.uid() = user_id);
```

## Common Gotchas

1. **Lens Studio API Types**: Type definitions in `lens-studio.d.ts` are based on documentation but may not be 100% accurate - validate against actual API behavior
2. **Spatial Coordinates**: Lens Studio uses right-handed coordinate system (X=right, Y=up, Z=forward)
3. **Object Detection Confidence**: Can fluctuate based on lighting - implement smoothing/debouncing
4. **Billboard Overlays**: Must update rotation every frame to face camera
5. **Performance**: 60fps is non-negotiable - profile frequently and optimize hot paths
6. **Supabase Edge Functions**: Run in Deno, not Node - use Deno-compatible imports
7. **Demo Timing**: 2-minute constraint means every feature must be **instantly demonstrable**

## Testing Philosophy

**Target: >90% code coverage** but focus on critical paths:

```typescript
// Test object detection accuracy
describe('ObjectTracker', () => {
  it('should detect demo objects with >95% confidence', async () => {
    const tracker = new ObjectTracker(config);
    await tracker.initialize(mockTracking, mockML);

    const objects = await tracker.detectObjects();
    const avgConfidence = calculateAverageConfidence(objects);

    expect(avgConfidence).toBeGreaterThan(0.95); // FR-066
  });
});

// Test latency requirements
it('should render overlays within 100ms', async () => {
  const startTime = Date.now();
  await overlayManager.createOverlay(config);
  const latency = Date.now() - startTime;

  expect(latency).toBeLessThan(100); // FR-005
});
```

**Integration tests** validate cross-component behavior:
- Object detection → Spatial anchor creation
- Gesture recognition → Overlay updates
- AR client → Supabase realtime → AI response

## Performance Optimization

### Critical Metrics

Monitor these constantly (see `MarvinARSystem.checkPerformance()`):

```typescript
interface PerformanceMetrics {
  fps: number;                    // Must be ≥60
  detectionLatency: number;       // Must be <100ms
  renderLatency: number;          // Must be <100ms
  gestureLatency: number;         // Should be <50ms
  trackedObjectCount: number;     // Keep ≤10 for performance
  activeOverlayCount: number;     // Keep ≤20 for performance
}
```

### Optimization Strategies

1. **Object pooling**: Reuse overlay objects instead of creating/destroying
2. **Update throttling**: Don't update overlays every frame unless position changed
3. **Spatial culling**: Don't render overlays outside camera view frustum
4. **Lazy loading**: Load AI models and resources on-demand
5. **Debouncing**: Smooth out object detection jitter before creating overlays

## Configuration & Environment

### Environment Variables

Expected in Supabase Edge Functions:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `GEMINI_API_KEY` - Google AI Studio API key
- `ELEVENLABS_API_KEY` - Voice synthesis API key
- `VAPI_API_KEY` - Voice conversation API key
- `GOOGLE_CALENDAR_CLIENT_ID` - Calendar integration

### AR Configuration

Main config in [lens-studio/src/main.ts](lens-studio/src/main.ts):

```typescript
const config: ARConfig = {
  performance: {
    minFps: 60,
    maxDetectionLatency: 100,
    maxRenderLatency: 100,
    targetAccuracy: 0.95,
  },
  enableSpatialMemory: true,
  enablePerformanceMonitoring: true,
  logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
};
```

## Next Steps After Reading This

1. Review [prd.md](prd.md) to understand all 68 functional requirements
2. Check [marvin-ar-task-list.md](marvin-ar-task-list.md) for current implementation status
3. Read [lens-studio/IMPLEMENTATION_SUMMARY.md](lens-studio/IMPLEMENTATION_SUMMARY.md) for what's already built
4. Familiarize with coding standards in [agent-os/standards/](agent-os/standards/)
5. Set up local development environment following [lens-studio/docs/SETUP.md](lens-studio/docs/SETUP.md)

**When implementing new features**:
- Reference FR numbers from PRD
- Follow agent-os coding standards
- Ensure <100ms latency for AR interactions
- Add tests with >90% coverage
- Update relevant documentation
- Consider demo reliability (fallback systems)
