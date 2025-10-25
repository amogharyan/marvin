# Marvin AR Morning Assistant - Developer Instructions

This file provides comprehensive guidance for developing the Marvin AR-powered morning assistant built for Snap Spectacles that transforms daily routines with intelligent, contextual guidance.

## 🎯 Project Overview

**Marvin** is a revolutionary AR morning assistant that provides intelligent, contextual guidance through Snap Spectacles. Using advanced object recognition, multimodal AI, and adaptive learning, the system delivers personalized assistance throughout morning routines.

### Core Architecture

```
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│   Snap Spectacles    │    │   AI Processing      │    │   Supabase Services  │
│   (AR Frontend)      │◄──►│   (Gemini + Voice)   │◄──►│   (BaaS + Edge Funcs)│
│                      │    │                      │    │                      │
│ • Object Detection   │    │ • Gemini API         │    │ • PostgreSQL DB      │
│ • AR Overlays        │    │ • ElevenLabs Voice   │    │ • Edge Functions     │
│ • Spatial Tracking   │    │ • Vapi Conversation  │    │ • Realtime Subscr.   │
│ • Gesture Recognition│    │ • Context Memory     │    │ • Storage & Auth     │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

### Demo Objects & Flow (2-minute demo)

- **Breakfast bowl** → Nutrition tracking & recipe suggestions
- **Laptop** → Calendar integration & work briefing
- **Keys** → Location tracking & departure checklist
- **Medicine bottle** → Health reminders & timing
- **Phone** → Connectivity & backup interface

## 🏗️ Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity is critical for 36-hour hackathon timeline. Choose straightforward solutions over complex ones. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Focus strictly on the 68 functional requirements. Avoid building functionality on speculation.

### Design Principles

- **Dependency Inversion**: High-level modules depend on abstractions
- **Single Responsibility**: Each function, class, and module has one clear purpose
- **Fail Fast**: Check for errors early and throw exceptions immediately
- **Demo Reliability**: 99%+ uptime during 2-minute demo is critical

## 📐 Project Architecture

### Team Structure (4 Developers)

```
marvin-ar-assistant/
├── ar-core/                # Dev 1: AR Core
│   ├── scripts/             # TypeScript AR logic
│   │   ├── object-detection.ts
│   │   ├── ar-overlays.ts
│   │   ├── gesture-handler.ts
│   │   └── spatial-tracking.ts
│   ├── objects/             # 3D models and assets
│   └── public/              # AR scene configuration
│
├── ai-voice/               # Dev 2: AI & Voice
│   ├── gemini/             # Visual AI processing
│   │   ├── multimodal.service.ts
│   │   ├── vision.service.ts
│   │   └── context.service.ts
│   ├── voice/              # Voice synthesis & conversation
│   │   ├── elevenlabs.service.ts
│   │   ├── vapi.service.ts
│   │   └── audio.handler.ts
│   └── memory/             # Contextual learning
│       ├── chroma.service.ts
│       ├── embeddings.service.ts
│       └── learning.service.ts
│
├── snap-cloud/             # Dev 3: Snap Cloud + Supabase Integration
│   ├── migrations/         # Database schema migrations
│   ├── functions/          # Edge Functions (Deno runtime)
│   │   ├── ai-processing/  # Gemini API integration
│   │   ├── voice-synthesis/# ElevenLabs integration
│   │   ├── calendar-sync/  # Google Calendar integration
│   │   └── object-tracking/# Object interaction processing
│   ├── seed.sql           # Demo data and mock interactions
│   ├── config.toml        # Supabase project configuration
│   └── types/             # Generated TypeScript types
│
└── devops/                 # Dev 4: Integration & DevOps
    ├── ci-cd/              # GitHub Actions pipeline
    ├── monitoring/         # Health checks & logging
    ├── demo/               # Demo scripts & backup systems
    └── integration/        # Cross-system testing
```

## 🔧 Core API Integrations

### 1. Snap Spectacles AR Platform

```typescript
// ar-core/scripts/object-detection.ts
import { ObjectTracking, MLComponent, DeviceTracking } from "LensStudio";

interface DemoObject {
  id: string;
  type: "breakfast_bowl" | "laptop" | "keys" | "medicine" | "phone";
  confidence: number;
  position: Vector3;
  timestamp: Date;
}

class ObjectDetectionService {
  private objectTracker: ObjectTracking;
  private mlComponent: MLComponent;

  async detectDemoObjects(): Promise<DemoObject[]> {
    try {
      const detectedObjects = await this.objectTracker.getAllTrackedObjects();
      return this.filterDemoObjects(detectedObjects);
    } catch (error) {
      throw new ObjectDetectionError(
        `Failed to detect objects: ${error.message}`
      );
    }
  }

  private filterDemoObjects(objects: TrackedObject[]): DemoObject[] {
    return objects.filter((obj) =>
      ["breakfast_bowl", "laptop", "keys", "medicine", "phone"].includes(
        obj.classification
      )
    );
  }
}

// AR Overlay System
class AROverlayManager {
  renderContextualInfo(object: DemoObject, aiResponse: string): void {
    const overlay = this.createOverlay({
      position: object.position,
      content: aiResponse,
      style: this.getObjectSpecificStyle(object.type),
    });

    this.scene.addChild(overlay);
  }
}
```

### 2. Gemini Multimodal AI Integration

```typescript
// ai-voice/gemini/multimodal.service.ts
import { GoogleGenAI } from "@google/genai";

interface GeminiRequest {
  visual_context: {
    camera_feed: ImageData;
    detected_objects: DemoObject[];
    spatial_layout: SceneMap;
  };
  conversation_context: {
    previous_interactions: ChatHistory[];
    user_preferences: UserProfile;
    time_context: TimeOfDay;
  };
  task_context: {
    current_action: string;
    expected_response_type: "informational" | "actionable" | "confirmational";
  };
}

class GeminiProcessor {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  async processContextualRequest(
    visualData: ImageData,
    objectContext: DemoObject,
    conversationHistory: ChatHistory[]
  ): Promise<AIResponse> {
    const prompt = this.buildContextualPrompt(
      objectContext,
      visualData,
      conversationHistory
    );

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: visualData } },
            ],
          },
        ],
      });

      return this.parseResponse(response);
    } catch (error) {
      throw new GeminiAPIError(`Gemini processing failed: ${error.message}`);
    }
  }

  private buildContextualPrompt(
    objectContext: DemoObject,
    visualData: ImageData,
    conversationHistory: ChatHistory[]
  ): string {
    return `
    You are Marvin, an AR morning assistant. You help users with:
    - Medicine reminders and health tracking
    - Nutrition analysis and recipe suggestions  
    - Calendar management and meeting preparation
    - Object location and departure assistance
    
    Current object: ${objectContext.type}
    Time: ${new Date().toISOString()}
    Previous context: ${JSON.stringify(conversationHistory.slice(-3))}
    
    Respond naturally and concisely. Focus on actionable guidance.
    Consider the time of day and user's routine patterns.
    `;
  }
}
```

### 3. ElevenLabs Voice Synthesis

```typescript
// ai-voice/voice/elevenlabs.service.ts
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Readable } from "stream";

class ElevenLabsService {
  private client: ElevenLabsClient;
  private voiceId = "JBFqnCBsd6RMkjVDRZzb"; // Demo voice

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
  }

  async synthesizeResponse(text: string): Promise<AudioStream> {
    try {
      const audio = await this.client.textToSpeech.convert(this.voiceId, {
        text: text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      });

      return this.createAudioStream(audio);
    } catch (error) {
      throw new VoiceSynthesisError(`Voice synthesis failed: ${error.message}`);
    }
  }

  private createAudioStream(audio: any): Readable {
    const reader = audio.getReader();
    return new Readable({
      async read() {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(value);
        }
      },
    });
  }

  // Critical: Must complete within 2 seconds for demo requirements
  async quickSynthesize(text: string): Promise<AudioStream> {
    const startTime = Date.now();
    const result = await this.synthesizeResponse(text);
    const duration = Date.now() - startTime;

    if (duration > 2000) {
      console.warn(`Voice synthesis took ${duration}ms - exceeds 2s target`);
    }

    return result;
  }
}
```

### 4. Chroma Vector Database for Learning

```typescript
// ai-voice/memory/chroma.service.ts
import { ChromaApi, OpenAIEmbeddingFunction } from "chromadb";

interface UserLearningProfile {
  routine_patterns: {
    typical_wake_time: string;
    breakfast_preferences: string[];
    medicine_schedule: MedicationSchedule[];
    calendar_patterns: CalendarPattern[];
  };
  spatial_memory: {
    object_locations: Map<string, Vector3>;
    room_layout: RoomMap;
    interaction_zones: ZoneDefinition[];
  };
  adaptation_metrics: {
    suggestion_acceptance_rate: number;
    interaction_frequency: Map<string, number>;
    preference_adjustments: PreferenceChange[];
  };
}

class ChromaLearningService {
  private client: ChromaApi;
  private collection: any;

  constructor() {
    this.client = new ChromaApi({
      path: process.env.CHROMA_URL || "http://localhost:8000",
    });
    this.initializeCollection();
  }

  private async initializeCollection() {
    this.collection = await this.client.getOrCreateCollection({
      name: "marvin_user_interactions",
      embeddingFunction: new OpenAIEmbeddingFunction({
        openai_api_key: process.env.OPENAI_API_KEY,
      }),
    });
  }

  async updateUserProfile(
    interaction: UserInteraction,
    outcome: InteractionOutcome
  ): Promise<void> {
    const embedding = await this.generateEmbedding(interaction);

    await this.collection.upsert({
      ids: [interaction.id],
      embeddings: [embedding],
      documents: [JSON.stringify(interaction)],
      metadatas: [
        {
          timestamp: interaction.timestamp,
          object_type: interaction.object,
          success: outcome.success,
          user_feedback: outcome.feedback,
        },
      ],
    });

    await this.updatePersonalizationModel(interaction, outcome);
  }

  async generatePersonalizedSuggestion(
    context: InteractionContext
  ): Promise<PersonalizedSuggestion> {
    const results = await this.collection.query({
      query_texts: [context.description],
      n_results: 10,
      where: {
        object_type: context.object_type,
      },
    });

    return this.synthesizePersonalizedResponse(context, results);
  }

  // Simulate learning progression for demo (Day 1 vs Day 30)
  async simulateLearningProgression(day: number): UserLearningProfile {
    if (day === 1) {
      return this.getBasicProfile();
    } else if (day >= 30) {
      return this.getAdvancedProfile();
    } else {
      return this.getProgressiveProfile(day);
    }
  }
}
```

### 5. SupabaseDirect Integration & Edge Functions

```typescript
// Direct AR/Supabase integration for Lens Studio
// Example: SupabaseConnector.ts (Lens Studio)
@component
export class SupabaseConnector extends BaseScriptComponent {
  @input supabaseUrl: string; // Hardcoded Supabase project URL
  @input supabaseAnonKey: string; // Hardcoded Supabase anon/public API key
  @input tableName: string; // Table to operate on
  @input internetModule: InternetModule;
  // ... CRUD, real-time, and logging logic ...
}

// Example: RealtimeCursorBroadcaster.ts (Lens Studio)
@component
export class RealtimeCursorBroadcaster extends BaseScriptComponent {
  @input supabaseUrl: string;
  @input supabaseAnonKey: string;
  @input roomName: string;
  @input internetModule: InternetModule;
  // ... real-time sync logic ...
}

// Example: EdgeFunctionCall.ts (Lens Studio)
@component
export class EdgeFunctionCall extends BaseScriptComponent {
  @input internetModule: InternetModule;
  @input endpointUrl: string;
  @input publicKey: string;
  @input inputName: string;
  // ... direct Edge Function call logic ...
}

// Table schemas for direct AR/Supabase integration:
// - test_messages (id, message, sender, timestamp, lens_session_id, created_at)
// - realtime_messages (id, channel, event, payload, sent_at, created_at)
// - user_interactions (id, action, data, user_id, timestamp, created_at)
// - object_locations (id, object_type, position, updated_at)
// - device_presence (id, device_id, status, last_seen, created_at)

// Edge Functions for direct AR/Supabase communication:
// - CRUD operations for all tables above
// - Real-time presence and object interaction sync
// - Device sync and disconnection handling
// - Health, nutrition, calendar, and learning coordination

// Demo reliability: fallback modes, offline-first logic, pre-recorded responses for all real-time and Edge Function features
```

````

## 🧪 Test-Driven Development (TDD)

### AR Component Testing

```typescript
// ar-core/scripts/__tests__/object-detection.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ObjectDetectionService } from '../object-detection';
import { MockSnapAPI } from '../__mocks__/snap-api';

describe('ObjectDetectionService', () => {
  let service: ObjectDetectionService;
  let mockSnapAPI: MockSnapAPI;

  beforeEach(() => {
    mockSnapAPI = new MockSnapAPI();
    service = new ObjectDetectionService(mockSnapAPI);
  });

  describe('detectDemoObjects', () => {
    it('should detect all 5 demo objects with >95% confidence', async () => {
      // Arrange
      mockSnapAPI.setMockObjects([
        { id: '1', type: 'breakfast_bowl', confidence: 0.98 },
        { id: '2', type: 'laptop', confidence: 0.96 },
        { id: '3', type: 'keys', confidence: 0.97 },
        { id: '4', type: 'medicine', confidence: 0.99 },
        { id: '5', type: 'phone', confidence: 0.95 }
      ]);

      // Act
      const objects = await service.detectDemoObjects();

      // Assert
      expect(objects).toHaveLength(5);
      expect(objects.every(obj => obj.confidence > 0.95)).toBe(true);
      expect(objects.map(obj => obj.type)).toEqual(
        expect.arrayContaining(['breakfast_bowl', 'laptop', 'keys', 'medicine', 'phone'])
      );
    });

    it('should complete object detection within 100ms', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      await service.detectDemoObjects();

      // Assert
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });
  });
});
````

### AI Integration Testing

```typescript
// ai-voice/gemini/__tests__/multimodal.test.ts
describe("GeminiProcessor", () => {
  let processor: GeminiProcessor;

  beforeEach(() => {
    processor = new GeminiProcessor();
  });

  describe("processContextualRequest", () => {
    it("should generate contextual response for breakfast bowl", async () => {
      // Arrange
      const visualData = createMockImageData("breakfast_bowl_cereal.jpg");
      const objectContext = createMockObject("breakfast_bowl");
      const history = createMockHistory(["good morning"]);

      // Act
      const response = await processor.processContextualRequest(
        visualData,
        objectContext,
        history
      );

      // Assert
      expect(response.text).toContain("nutrition");
      expect(response.text).toContain("breakfast");
      expect(response.action_type).toBe("informational");
      expect(response.confidence).toBeGreaterThan(0.8);
    });

    it("should complete processing within 2 seconds", async () => {
      // This test ensures we meet the <2s voice response requirement
      const startTime = Date.now();

      await processor.processContextualRequest(
        createMockImageData("test.jpg"),
        createMockObject("laptop"),
        []
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000);
    });
  });
});
```

## 🚀 Development Environment

### Package Management (Node.js 20 LTS)

```bash
# Install dependencies
npm install

# Core packages for each developer track
npm install @supabase/supabase-js @google/genai @elevenlabs/elevenlabs-js chromadb
npm install --save-dev @types/node jest typescript nodemon

# AR Development (Dev 1)
# Lens Studio handles TypeScript compilation internally

# AI Development (Dev 2)
npm install dotenv axios form-data

# Supabase Integration (Dev 3)
npm install -g supabase
# Supabase handles backend services - no Express dependencies needed

# DevOps (Dev 4)
npm install concurrently winston
```

### Essential Scripts (package.json)

```json
{
  "scripts": {
    "dev": "concurrently \"supabase start\" \"npm run dev:ai\"",
    "dev:ai": "nodemon --exec ts-node ai-voice/index.ts",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:migrate": "supabase db migrate",
    "supabase:functions": "supabase functions serve",
    "build": "tsc --build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ar": "jest ar-core/scripts/__tests__/",
    "test:ai": "jest ai-voice/__tests__/",
    "test:supabase": "jest snap-cloud/__tests__/",
    "test:integration": "jest devops/integration/__tests__/",
    "demo:setup": "node devops/demo/setup.js",
    "demo:reset": "supabase db reset && node devops/demo/seed.js",
    "demo:monitor": "node devops/monitoring/health-check.js"
  }
}
```

## 🔧 Environment Configuration

```typescript
// snap-cloud/config.toml
[api];
enabled = true;
port = 54321;
schemas = ["public", "storage", "graphql_public"];
extra_search_path = ["public", "extensions"][db];
port = 54322;
shadow_port = 54320;
major_version = (15)[studio];
enabled = true;
port = (54323)[inbucket];
enabled = true;
port = (54324)[storage];
enabled = true;
file_size_limit = "50MiB"[auth];
enabled = true;
site_url = "http://localhost:3000";
additional_redirect_urls = ["https://localhost:3000"][functions];
verify_jwt = false;

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),

  // AI Service APIs
  GEMINI_API_KEY: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1), // For Chroma embeddings

  // Database & Storage
  CHROMA_URL: z.string().url().default("http://localhost:8000"),
  REDIS_URL: z.string().url().optional(),

  // External Integrations
  GOOGLE_CALENDAR_API_KEY: z.string().optional(),
  HEALTH_API_KEY: z.string().optional(),

  // Demo Configuration
  DEMO_MODE: z.boolean().default(true),
  DEMO_OBJECTS_COUNT: z.number().default(5),
  CORS_ORIGIN: z.string().default("*"),
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error("❌ Invalid environment variables:", envResult.error.flatten());
  process.exit(1);
}

export const config = envResult.data;
```

## ⚡ Performance Requirements

### Critical Performance Targets

```typescript
// Performance monitoring constants
export const PERFORMANCE_TARGETS = {
  AR_OVERLAY_LATENCY: 100, // milliseconds
  VOICE_RESPONSE_TIME: 2000, // milliseconds
  DEMO_RELIABILITY: 0.99, // 99% success rate
  OBJECT_DETECTION_ACCURACY: 0.95, // 95% accuracy
  API_RESPONSE_TIME: 500, // milliseconds
  WEBSOCKET_LATENCY: 50, // milliseconds
} as const;

// Performance monitoring middleware
export const performanceMonitor = (
  target: keyof typeof PERFORMANCE_TARGETS
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const targetTime = PERFORMANCE_TARGETS[target];

      if (duration > targetTime) {
        console.warn(
          `⚠️  Performance target exceeded: ${target} took ${duration}ms (target: ${targetTime}ms)`
        );
      }

      // Log metrics for demo analysis
      console.log(`📊 ${target}: ${duration}ms`);
    });

    next();
  };
};
```

## 🚨 Error Handling & Fallback Systems

```typescript
// Critical demo reliability error handling
export class DemoReliabilityError extends Error {
  constructor(
    public component: "AR" | "AI" | "Voice" | "Backend",
    public fallbackAvailable: boolean,
    message: string
  ) {
    super(message);
    this.name = "DemoReliabilityError";
  }
}

export class FallbackSystem {
  private static fallbacks = new Map<string, any>();

  static registerFallback(component: string, fallbackData: any) {
    this.fallbacks.set(component, fallbackData);
  }

  static async executeFallback(component: string): Promise<any> {
    const fallback = this.fallbacks.get(component);
    if (!fallback) {
      throw new Error(`No fallback available for ${component}`);
    }

    console.warn(`🔄 Executing fallback for ${component}`);
    return fallback;
  }
}

// Pre-recorded responses for ElevenLabs fallback
FallbackSystem.registerFallback("voice", {
  medicine_reminder: "./assets/audio/medicine_reminder.mp3",
  breakfast_nutrition: "./assets/audio/breakfast_nutrition.mp3",
  calendar_briefing: "./assets/audio/calendar_briefing.mp3",
  key_location: "./assets/audio/key_location.mp3",
  departure_checklist: "./assets/audio/departure_checklist.mp3",
});

// Static object detection data for Snap API fallback
FallbackSystem.registerFallback("object_detection", [
  { id: "1", type: "breakfast_bowl", confidence: 0.98, position: [0, 0, -2] },
  { id: "2", type: "laptop", confidence: 0.96, position: [1, 0, -1] },
  { id: "3", type: "keys", confidence: 0.97, position: [-1, 0, -1] },
  { id: "4", type: "medicine", confidence: 0.99, position: [0, 1, -1] },
  { id: "5", type: "phone", confidence: 0.95, position: [0.5, 0, -1] },
]);
```

## 📋 36-Hour Development Timeline

### Phase 1: Foundation (Hours 0-6)

**Dev 1 (AR Core):** Lens Studio setup + basic object detection  
**Dev 2 (AI & Voice):** Gemini API + ElevenLabs integration  
**Dev 3 (Backend):** Express server + API structure  
**Dev 4 (DevOps):** CI/CD pipeline + testing framework

### Phase 2: Core Features (Hours 6-12)

**Dev 1:** AR overlays + gesture recognition  
**Dev 2:** Multimodal processing + voice synthesis  
**Dev 3:** WebSocket + external API integration  
**Dev 4:** Integration testing + monitoring

### Phase 3: Intelligence & Learning (Hours 12-18)

**Dev 1:** Advanced AR UI + demo optimizations  
**Dev 2:** Chroma integration + learning simulation  
**Dev 3:** Calendar + health data processing  
**Dev 4:** End-to-end testing + performance tuning

### Phase 4: Demo Polish (Hours 18-24)

**All Developers:** Demo script optimization, error handling, performance tuning

### Phase 5: Testing & Reliability (Hours 24-30)

**Focus:** Demo environment testing, fallback verification, rehearsal

### Phase 6: Final Preparation (Hours 30-36)

**Focus:** Demo calibration, backup systems, go-live preparation

## 📚 Essential Resources & Documentation

### API Documentation References

- **Gemini API**: https://ai.google.dev/gemini-api/docs
- **ElevenLabs**: https://elevenlabs.io/docs
- **Chroma**: https://docs.trychroma.com/
- **Snap Spectacles**: Lens Studio 5.13+ documentation
- **Socket.io**: https://socket.io/docs/v4/

### Demo Success Checklist

- [ ] All 5 objects reliably detected (>95% accuracy)
- [ ] AR overlays render within 100ms
- [ ] Voice responses complete within 2 seconds
- [ ] WebSocket communication stable
- [ ] Fallback systems tested and ready
- [ ] Demo timing under 2 minutes
- [ ] Team trained on demo flow and troubleshooting

**Critical**: Use Test-Driven Development approach throughout. Write tests based on expected input/output pairs, confirm they fail, then implement code to pass tests. This ensures reliability for the demo environment.

## 🛠️ Development Environment

### Package Management

This project uses npm with Node.js 20 LTS for the backend development.

```bash
# Install dependencies
npm install

# Add a package
npm install express

# Add development dependency
npm install --save-dev @types/express jest

# Run development server
npm run dev

# Run production build
npm run build

# Run tests
npm test

# Check types
npm run type-check

# Format code
npm run format

# Lint code
npm run lint
```

### Essential Scripts (package.json)

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "type-check": "tsc --noEmit",
    "migrate": "node-pg-migrate",
    "queue:worker": "ts-node src/proof/proof.worker.ts"
  }
}
```

## 📋 Style & Conventions

### TypeScript Style Guide

- **Use strict TypeScript configuration** (strict: true in tsconfig.json)
- **Always use explicit types** for function parameters and return values
- **Prefer interfaces over types** for object shapes
- **Use enums for constants** that have a fixed set of values
- **Format with Prettier** and lint with ESLint
- **Use async/await** over promises chains
- **Never use `any`** - use `unknown` if type is truly unknown

### Naming Conventions

- **Variables and functions**: `camelCase`
- **Classes and Interfaces**: `PascalCase`
- **Constants and Enums**: `UPPER_SNAKE_CASE`
- **Private class members**: `_leadingUnderscore`
- **Type parameters**: Single capital letters (T, U, K)
- **File names**: `kebab-case.ts` for modules, `PascalCase.ts` for classes

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@config/*": ["config/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## 🧪 Testing Strategy

### Test-Driven Development (TDD)

1. **Write the test first** - Define expected behavior before implementation
2. **Watch it fail** - Ensure the test actually tests something
3. **Write minimal code** - Just enough to make the test pass
4. **Refactor** - Improve code while keeping tests green
5. **Repeat** - One test at a time

### Testing with Jest

```typescript
// auth.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AuthService } from "./auth.service";
import jwt from "jsonwebtoken";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", () => {
      const userId = "user123";
      const tokens = authService.generateTokens(userId);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it("should include user ID in token payload", () => {
      const userId = "user123";
      const tokens = authService.generateTokens(userId);
      const decoded = jwt.decode(tokens.accessToken) as any;

      expect(decoded.userId).toBe(userId);
    });
  });
});
```

## 🚨 Error Handling

### Exception Best Practices

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(401, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      statusCode: 500,
    },
  });
};
```

### Async Error Handling

```typescript
// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage in routes
router.post(
  "/proof/generate",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await proofService.generateProof(req.body);
    res.json({ success: true, data: result });
  })
);
```

## 📧 Configuration Management

### Environment Variables with Type Safety

```typescript
// config/index.ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),

  // AI Service APIs
  GEMINI_API_KEY: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1), // For Chroma embeddings

  // Supabase Configuration
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // External Integrations
  GOOGLE_CALENDAR_API_KEY: z.string().optional(),
  HEALTH_API_KEY: z.string().optional(),

  // Demo Configuration
  DEMO_MODE: z.boolean().default(true),
  DEMO_OBJECTS_COUNT: z.number().default(5),
  CORS_ORIGIN: z.string().default("*"),
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error("❌ Invalid environment variables:", envResult.error.flatten());
  process.exit(1);
}

export const config = envResult.data;
```

## 🗄️ Supabase Database Integration

### Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe database operations
export async function insertObjectInteraction(interaction: {
  object_type: string;
  confidence_score: number;
  spatial_position: any;
  ai_response: any;
}) {
  const { data, error } = await supabase
    .from("object_interactions")
    .insert(interaction)
    .select();

  if (error) throw error;
  return data;
}

// Real-time subscriptions
export function subscribeToInteractions(
  userId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel("user-interactions")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "object_interactions",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}
```

## 🔐 Authentication & Security

### Supabase Auth Integration

```typescript
// auth/supabase-auth.service.ts
import { createClient } from "@supabase/supabase-js";

export class SupabaseAuthService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async getSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return session;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }
}
```

### Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const aiProcessingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many AI requests, please try again later",
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
```

## 🚀 Supabase Realtime Integration

### Realtime Setup

```typescript
// realtime/supabase-realtime.service.ts
import { createClient } from "@supabase/supabase-js";

export class SupabaseRealtimeService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  subscribeToObjectInteractions(
    userId: string,
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel("object-interactions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "object_interactions",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToHealthReminders(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel("health-reminders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "medication_schedules",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  async broadcastGestureEvent(gestureData: any) {
    await this.supabase.channel("gestures").send({
      type: "broadcast",
      event: "gesture-performed",
      payload: gestureData,
    });
  }
}
```

## 📦 Supabase Edge Functions

```typescript
// Standard Edge Function structure
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { objectType, imageData, userContext } = await req.json();

    // Process AR object interaction
    const response = await processObjectInteraction({
      objectType,
      imageData,
      userContext,
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

## 🔧 Validation with Zod

```typescript
// validation schemas
import { z } from "zod";

export const objectInteractionSchema = z.object({
  body: z.object({
    objectType: z.enum([
      "breakfast_bowl",
      "laptop",
      "keys",
      "medicine",
      "phone",
    ]),
    confidence: z.number().min(0).max(1),
    position: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    }),
    imageData: z.string().optional(),
  }),
});

export const healthReminderSchema = z.object({
  body: z.object({
    medicationName: z.string().min(1),
    scheduledTime: z.string(),
    dosage: z.string().optional(),
  }),
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};
```

## 📊 Logging & Monitoring

### Structured Logging with Winston

```typescript
// utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "marvin-ar-assistant" },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("AR interaction processed", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      objectType: req.body?.objectType,
    });
  });
  next();
};
```

## 🗂️ Git Workflow

### Branch Strategy for Hackathon

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/ar-core` - AR and Lens Studio development
- `feature/ai-voice` - AI and voice integration
- `feature/supabase` - Supabase integration and Edge Functions
- `feature/integration` - Testing and demo preparation

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore

Example:
feat(ar): implement object detection for demo objects

- Add medicine bottle recognition
- Implement spatial tracking for keys
- Add gesture detection for object interaction

Hour 12 checkpoint
```

## ⚠️ Important Notes for Hackathon

### Critical Path Focus

- **Hours 0-8**: Foundation - AR setup, AI integration, Supabase database
- **Hours 8-16**: Core features - object detection, voice synthesis, realtime
- **Hours 16-24**: Integration with all systems and demo optimization
- **Hours 24-32**: Polish and error handling for demo reliability
- **Hours 32-36**: Demo preparation and final testing

### Emergency Fallbacks

- If Snap Spectacles fail: Use phone backup interface with manual object triggers
- If Gemini API down: Use cached responses for demo scenarios
- If ElevenLabs fails: Use pre-recorded audio files
- If Supabase fails: Use offline mode with local data
- If object detection fails: Use manual triggers with simulated detection

### Testing Priorities

1. AR object detection accuracy
2. AI response generation speed
3. Voice synthesis quality
4. Supabase Realtime updates
5. Demo environment reliability

### Deployment Checklist

- [ ] Supabase project configured with production settings
- [ ] Edge Functions deployed and tested
- [ ] Database migrations applied
- [ ] Row Level Security policies active
- [ ] Realtime subscriptions configured
- [ ] Demo environment variables set
- [ ] AR client authentication working
- [ ] Error logging configured

## 🔍 Search Command Requirements

**CRITICAL**: Use appropriate search tools for AR/TypeScript projects:

```bash
# Search for text in files
grep -r "pattern" src/

# Find TypeScript files in AR project
find ar-core -name "*.ts"
find ai-voice -name "*.ts"

# Search with context for AR components
grep -B 2 -A 2 "ObjectDetection\|AROverlay" src/**/*.ts

# Find TODOs and demo issues
grep -r "TODO\|FIXME\|DEMO" src/
```

## 📚 Essential Resources

### Documentation

- Supabase: https://supabase.com/docs
- Snap Lens Studio: https://docs.snap.com/lens-studio
- Gemini API: https://ai.google.dev/gemini-api/docs
- ElevenLabs: https://elevenlabs.io/docs
- Chroma: https://docs.trychroma.com/

### Test-Driven Development Framework

Use this framework for all development tasks:

1. **Write Tests First**: Write tests based on expected input/output pairs. Be explicit about doing test-driven development to avoid creating mock implementations.

2. **Run and Confirm Failures**: Run the tests and confirm they fail. Don't write implementation code at this stage.

3. **Commit Tests**: Commit the tests when satisfied with them.

4. **Write Implementation**: Write code that passes the tests without modifying the tests. Iterate until all tests pass.

5. **Verify Implementation**: Ensure the implementation isn't overfitting to the tests.

6. **Commit Code**: Commit the final implementation once satisfied with the changes.

### Project Context

- Focus on Marvin AR Morning Assistant development
- Follow the task list and PRD requirements for 36-hour hackathon
- Prioritize demo reliability and 2-minute presentation flow
- Use Supabase for all backend services and real-time features

## 📚 Essential Resources

### Documentation

- Express.js: https://expressjs.com/
- TypeScript: https://www.typescriptlang.org/docs/
- Socket.io: https://socket.io/docs/v4/
- Bull Queue: https://github.com/OptimalBits/bull
- node-postgres: https://node-postgres.com/
- JWT: https://jwt.io/

### Midnight Blockchain

- Midnight Docs: https://docs.midnight.network
- Compact Language: https://docs.midnight.network/develop/tutorial
- SDK Integration: Check with Dev 4 for ProofSDK
- Exclusively do Dev 3 tasks. Always refer to @genomic-privacy-task-list.md and @merged-genomic-prd.md as context for what to do and the requirements necessary. Also always use @"process-task-list (1).md" as the strategy for how to implement these tasks
- no longer focus on just dev 3. you are all devs
- add this as our framework for coding: Ask Claude to write tests based on expected input/output pairs. Be explicit about the fact that you’re doing test-driven development so that it avoids creating mock implementations, even for functionality that doesn’t exist yet in the codebase.
  Tell Claude to run the tests and confirm they fail. Explicitly telling it not to write any implementation code at this stage is often helpful.
  Ask Claude to commit the tests when you’re satisfied with them.
  Ask Claude to write code that passes the tests, instructing it not to modify the tests. Tell Claude to keep going until all tests pass. It will usually take a few iterations for Claude to write code, run the tests, adjust the code, and run the tests again.
  At this stage, it can help to ask it to verify with independent subagents that the implementation isn’t overfitting to the tests
  Ask Claude to commit the code once you’re satisfied with the changes.
