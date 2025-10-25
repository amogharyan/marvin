# Marvin AR Morning Assistant - Developer Instructions

This file provides comprehensive guidance for developing the Marvin AR-powered morning assistant built for Snap Spectacles that transforms daily routines with intelligent, contextual guidance.

## 🎯 Project Overview

**Marvin** is a revolutionary AR morning assistant that provides intelligent, contextual guidance through Snap Spectacles. Using advanced object recognition, multimodal AI, and adaptive learning, the system delivers personalized assistance throughout morning routines.

### Core Architecture

```
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│   Snap Spectacles    │    │   AI Processing      │    │   Backend Services   │
│   (AR Frontend)      │◄──►│   (Gemini + Voice)   │◄──►│   (Node.js + APIs)   │
│                      │    │                      │    │                      │
│ • Object Detection   │    │ • Gemini API         │    │ • Express API        │
│ • AR Overlays        │    │ • ElevenLabs Voice   │    │ • Chroma Vector DB   │
│ • Spatial Tracking   │    │ • Vapi Conversation  │    │ • Calendar/Health    │
│ • Gesture Recognition│    │ • Context Memory     │    │ • WebSocket/REST     │
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
├── lens-studio/              # Dev 1: AR Core
│   ├── scripts/             # TypeScript AR logic
│   │   ├── object-detection.ts
│   │   ├── ar-overlays.ts
│   │   ├── gesture-handler.ts
│   │   └── spatial-tracking.ts
│   ├── objects/             # 3D models and assets
│   └── public/              # AR scene configuration
│
├── ai-processing/           # Dev 2: AI & Voice
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
├── backend/                # Dev 3: Backend Services
│   ├── src/
│   │   ├── index.ts        # Express server entry
│   │   ├── app.ts          # Express app configuration
│   │   ├── config/         # Environment & database config
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API endpoints
│   │   │   ├── objects.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   ├── calendar.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── services/       # Business logic
│   │   ├── websocket/      # Real-time communication
│   │   └── types/          # TypeScript definitions
│   └── tests/              # Backend tests
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
// lens-studio/scripts/object-detection.ts
import { ObjectTracking, MLComponent, DeviceTracking } from 'LensStudio';

interface DemoObject {
  id: string;
  type: 'breakfast_bowl' | 'laptop' | 'keys' | 'medicine' | 'phone';
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
      throw new ObjectDetectionError(`Failed to detect objects: ${error.message}`);
    }
  }
  
  private filterDemoObjects(objects: TrackedObject[]): DemoObject[] {
    return objects.filter(obj => 
      ['breakfast_bowl', 'laptop', 'keys', 'medicine', 'phone'].includes(obj.classification)
    );
  }
}

// AR Overlay System
class AROverlayManager {
  renderContextualInfo(object: DemoObject, aiResponse: string): void {
    const overlay = this.createOverlay({
      position: object.position,
      content: aiResponse,
      style: this.getObjectSpecificStyle(object.type)
    });
    
    this.scene.addChild(overlay);
  }
}
```

### 2. Gemini Multimodal AI Integration

```typescript
// ai-processing/gemini/multimodal.service.ts
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
    expected_response_type: 'informational' | 'actionable' | 'confirmational';
  };
}

class GeminiProcessor {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
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
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: visualData } }
          ]
        }]
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
// ai-processing/voice/elevenlabs.service.ts
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'stream';

class ElevenLabsService {
  private client: ElevenLabsClient;
  private voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // Demo voice
  
  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });
  }
  
  async synthesizeResponse(text: string): Promise<AudioStream> {
    try {
      const audio = await this.client.textToSpeech.convert(this.voiceId, {
        text: text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
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
// ai-processing/memory/chroma.service.ts
import { ChromaApi, OpenAIEmbeddingFunction } from 'chromadb';

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
      path: process.env.CHROMA_URL || "http://localhost:8000"
    });
    this.initializeCollection();
  }
  
  private async initializeCollection() {
    this.collection = await this.client.getOrCreateCollection({
      name: "marvin_user_interactions",
      embeddingFunction: new OpenAIEmbeddingFunction({
        openai_api_key: process.env.OPENAI_API_KEY
      })
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
      metadatas: [{
        timestamp: interaction.timestamp,
        object_type: interaction.object,
        success: outcome.success,
        user_feedback: outcome.feedback
      }]
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
        object_type: context.object_type
      }
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

### 5. Backend API Services

```typescript
// backend/src/routes/objects.routes.ts
import { Router } from 'express';
import { asyncHandler } from '@middleware/asyncHandler';
import { validate } from '@middleware/validation';
import { objectInteractionSchema } from './schemas';

const router = Router();

// Object interaction endpoint
router.post('/objects/:objectId/interact', 
  validate(objectInteractionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { objectId } = req.params;
    const { interaction_type, context } = req.body;
    
    try {
      // Process with AI services
      const aiResponse = await aiService.processInteraction(objectId, context);
      const voiceResponse = await voiceService.synthesize(aiResponse.text);
      const learningUpdate = await learningService.updateFromInteraction({
        objectId,
        interaction_type,
        response: aiResponse,
        timestamp: new Date()
      });
      
      res.json({ 
        success: true, 
        data: {
          ai_response: aiResponse,
          voice_url: voiceResponse.url,
          learning_insights: learningUpdate
        },
        requestId: req.id 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message, 
        requestId: req.id 
      });
    }
  })
);

// WebSocket for real-time updates
import { Server } from 'socket.io';

class WebSocketService {
  private io: Server;
  
  initialize(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: { origin: "*" } // Demo only - restrict in production
    });
    
    this.io.on('connection', (socket) => {
      console.log('AR client connected:', socket.id);
      
      socket.on('object-detected', async (data) => {
        const response = await this.processObjectDetection(data);
        socket.emit('ai-response', response);
      });
      
      socket.on('gesture-performed', async (data) => {
        const response = await this.processGesture(data);
        socket.emit('action-result', response);
      });
    });
  }
}

export default router;
```

## 🧪 Test-Driven Development (TDD)

### AR Component Testing

```typescript
// lens-studio/scripts/__tests__/object-detection.test.ts
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
```

### AI Integration Testing

```typescript
// ai-processing/gemini/__tests__/multimodal.test.ts
describe('GeminiProcessor', () => {
  let processor: GeminiProcessor;

  beforeEach(() => {
    processor = new GeminiProcessor();
  });

  describe('processContextualRequest', () => {
    it('should generate contextual response for breakfast bowl', async () => {
      // Arrange
      const visualData = createMockImageData('breakfast_bowl_cereal.jpg');
      const objectContext = createMockObject('breakfast_bowl');
      const history = createMockHistory(['good morning']);

      // Act
      const response = await processor.processContextualRequest(
        visualData, 
        objectContext, 
        history
      );

      // Assert
      expect(response.text).toContain('nutrition');
      expect(response.text).toContain('breakfast');
      expect(response.action_type).toBe('informational');
      expect(response.confidence).toBeGreaterThan(0.8);
    });

    it('should complete processing within 2 seconds', async () => {
      // This test ensures we meet the <2s voice response requirement
      const startTime = Date.now();
      
      await processor.processContextualRequest(
        createMockImageData('test.jpg'),
        createMockObject('laptop'),
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
npm install express socket.io @google/genai @elevenlabs/elevenlabs-js chromadb
npm install --save-dev @types/node @types/express jest typescript nodemon

# AR Development (Dev 1)
# Lens Studio handles TypeScript compilation internally

# AI Development (Dev 2) 
npm install dotenv axios form-data

# Backend Development (Dev 3)
npm install cors helmet express-rate-limit zod jsonwebtoken

# DevOps (Dev 4)
npm install concurrently pm2 winston
```

### Essential Scripts (package.json)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:ai\"",
    "dev:backend": "nodemon --exec ts-node backend/src/index.ts",
    "dev:ai": "nodemon --exec ts-node ai-processing/index.ts",
    "build": "tsc --build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ar": "jest lens-studio/scripts/__tests__/",
    "test:ai": "jest ai-processing/__tests__/",
    "test:backend": "jest backend/tests/",
    "test:integration": "jest devops/integration/__tests__/",
    "demo:setup": "node devops/demo/setup.js",
    "demo:reset": "node devops/demo/reset.js",
    "demo:monitor": "node devops/monitoring/health-check.js"
  }
}
```

## 🔧 Environment Configuration

```typescript
// backend/src/config/index.ts
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // AI Service APIs
  GEMINI_API_KEY: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1), // For Chroma embeddings
  
  // Database & Storage
  CHROMA_URL: z.string().url().default('http://localhost:8000'),
  REDIS_URL: z.string().url().optional(),
  
  // External Integrations
  GOOGLE_CALENDAR_API_KEY: z.string().optional(),
  HEALTH_API_KEY: z.string().optional(),
  
  // Demo Configuration
  DEMO_MODE: z.boolean().default(true),
  DEMO_OBJECTS_COUNT: z.number().default(5),
  CORS_ORIGIN: z.string().default('*')
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error('❌ Invalid environment variables:', envResult.error.flatten());
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
  WEBSOCKET_LATENCY: 50 // milliseconds
} as const;

// Performance monitoring middleware
export const performanceMonitor = (target: keyof typeof PERFORMANCE_TARGETS) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const targetTime = PERFORMANCE_TARGETS[target];
      
      if (duration > targetTime) {
        console.warn(`⚠️  Performance target exceeded: ${target} took ${duration}ms (target: ${targetTime}ms)`);
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
    public component: 'AR' | 'AI' | 'Voice' | 'Backend',
    public fallbackAvailable: boolean,
    message: string
  ) {
    super(message);
    this.name = 'DemoReliabilityError';
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
FallbackSystem.registerFallback('voice', {
  medicine_reminder: './assets/audio/medicine_reminder.mp3',
  breakfast_nutrition: './assets/audio/breakfast_nutrition.mp3',
  calendar_briefing: './assets/audio/calendar_briefing.mp3',
  key_location: './assets/audio/key_location.mp3',
  departure_checklist: './assets/audio/departure_checklist.mp3'
});

// Static object detection data for Snap API fallback
FallbackSystem.registerFallback('object_detection', [
  { id: '1', type: 'breakfast_bowl', confidence: 0.98, position: [0, 0, -2] },
  { id: '2', type: 'laptop', confidence: 0.96, position: [1, 0, -1] },
  { id: '3', type: 'keys', confidence: 0.97, position: [-1, 0, -1] },
  { id: '4', type: 'medicine', confidence: 0.99, position: [0, 1, -1] },
  { id: '5', type: 'phone', confidence: 0.95, position: [0.5, 0, -1] }
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
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthService } from './auth.service';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const userId = 'user123';
      const tokens = authService.generateTokens(userId);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should include user ID in token payload', () => {
      const userId = 'user123';
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
  constructor(message = 'Authentication failed') {
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
        statusCode: err.statusCode
      }
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      statusCode: 500
    }
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
router.post('/proof/generate', 
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
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  IPFS_PROJECT_ID: z.string(),
  IPFS_PROJECT_SECRET: z.string(),
  MIDNIGHT_RPC_URL: z.string().url(),
  CORS_ORIGIN: z.string().url()
});

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error('❌ Invalid environment variables:', envResult.error.flatten());
  process.exit(1);
}

export const config = envResult.data;
```

## 🗄️ Database & Redis Integration

### PostgreSQL with node-postgres

```typescript
// config/database.ts
import { Pool } from 'pg';
import { config } from './index';

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query helper with logging
export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: result.rowCount });
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

### Redis with Bull Queue

```typescript
// config/redis.ts
import Redis from 'ioredis';
import Bull from 'bull';
import { config } from './index';

export const redis = new Redis(config.REDIS_URL);

// Proof generation queue
export const proofQueue = new Bull('proof-generation', config.REDIS_URL, {
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Queue event handlers
proofQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

proofQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

## 🔐 Authentication & Security

### JWT Implementation

```typescript
// auth/auth.service.ts
import jwt from 'jsonwebtoken';
import { config } from '@config/index';

export class AuthService {
  generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '24h' }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId };
    } catch (error) {
      throw new AuthenticationError('Invalid access token');
    }
  }
}
```

### Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const proofGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many proof requests, please try again later'
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
```

## 🚀 WebSocket Integration

### Socket.io Setup

```typescript
// websocket/socket.service.ts
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';

export class SocketService {
  private io: Server;

  initialize(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        socket.data.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication failed'));
      }
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.data.userId} connected`);

      socket.on('join:patient-room', (patientId: string) => {
        socket.join(`patient:${patientId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.data.userId} disconnected`);
      });
    });
  }

  emitProofProgress(patientId: string, progress: number) {
    this.io.to(`patient:${patientId}`).emit('proof:progress', { progress });
  }
}
```

## 📦 API Route Standards

```typescript
// Standard RESTful routes structure
import { Router } from 'express';
import { authenticate } from '@middleware/auth';
import { validate } from '@middleware/validation';
import { proofSchema } from './proof.schemas';

const router = Router();

// RESTful endpoints
router.post('/generate', 
  authenticate,
  validate(proofSchema),
  asyncHandler(proofController.generate)
);

router.get('/status/:jobId',
  authenticate,
  asyncHandler(proofController.getStatus)
);

export default router;
```

## 🔧 Validation with Zod

```typescript
// validation schemas
import { z } from 'zod';

export const proofGenerationSchema = z.object({
  body: z.object({
    traitType: z.enum(['BRCA1', 'BRCA2', 'CYP2D6']),
    genomeHash: z.string().length(66),
    threshold: z.number().min(0).max(1).optional()
  })
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors
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
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'genomic-privacy-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration
    });
  });
  next();
};
```

## 🗂️ Git Workflow

### Branch Strategy for Hackathon

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/backend` - Your main working branch
- `feature/backend-auth` - Authentication implementation
- `feature/backend-proof` - Proof generation
- `feature/backend-ipfs` - IPFS integration

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore

Example:
feat(auth): implement JWT authentication

- Add JWT token generation
- Implement refresh token rotation
- Add authentication middleware

Hour 6 checkpoint
```

## ⚠️ Important Notes for Hackathon

### Critical Path Focus
- **Hours 0-8**: Foundation - auth, database, basic API
- **Hours 8-16**: Core features - proof queue, IPFS, websocket
- **Hours 16-24**: Integration with frontend and blockchain
- **Hours 24-32**: Polish and error handling
- **Hours 32-48**: Testing and deployment

### Emergency Fallbacks
- If IPFS fails: Use PostgreSQL with mock CIDs
- If Redis fails: Use in-memory queue (development only)
- If proof generation slow: Pre-generate common proofs

### Testing Priorities
1. Authentication flow
2. Proof generation queue
3. IPFS upload/retrieval
4. WebSocket real-time updates
5. Error handling

### Deployment Checklist
- [ ] Environment variables set in Railway
- [ ] PostgreSQL addon configured
- [ ] Redis addon configured
- [ ] WebSocket support enabled
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Error logging configured

## 🔍 Search Command Requirements

**CRITICAL**: Use appropriate search tools for TypeScript/Node.js projects:

```bash
# Search for text in files
grep -r "pattern" src/

# Find TypeScript files
find src -name "*.ts"

# Search with context
grep -B 2 -A 2 "pattern" src/**/*.ts

# Find TODOs
grep -r "TODO\|FIXME" src/
```

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