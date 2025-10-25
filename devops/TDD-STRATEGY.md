# Dev 4: TDD & Integration Strategy

## Overview

Dev 4 is responsible for **Test-Driven Development** and **Continuous Integration**. This means:

1. **Write tests FIRST** before other devs implement features
2. **Monitor test execution** as code is committed
3. **Review and merge** PRs only when tests pass
4. **Maintain CI/CD pipeline** for automated testing

---

## TDD Workflow

### Red → Green → Refactor Cycle

```
1. RED: Dev 4 writes failing test
   ↓
2. Dev 1/2/3 implement feature to pass test
   ↓
3. GREEN: Tests pass
   ↓
4. REFACTOR: Dev 4 reviews code quality
   ↓
5. MERGE: Dev 4 merges to main
```

---

## Test Structure

```
Marvin/
├── __tests__/
│   ├── setup.ts                      # Jest config + global mocks
│   ├── mocks/
│   │   ├── lens-studio.ts            # Mock Lens Studio APIs
│   │   ├── api-responses.ts          # Mock external API responses
│   │   └── demo-objects.ts           # Mock detection data
│   ├── unit/
│   │   ├── ObjectDetection/
│   │   │   ├── DemoObjectTracker.test.ts
│   │   │   ├── SpatialAnchors.test.ts
│   │   │   └── GestureHandler.test.ts
│   │   ├── Core/
│   │   │   ├── GeminiAssistant.test.ts
│   │   │   ├── ElevenLabsVoice.test.ts
│   │   │   ├── VoiceHandler.test.ts
│   │   │   └── AICoordinator.test.ts
│   │   ├── Storage/
│   │   │   ├── SupabaseClient.test.ts
│   │   │   ├── ChromaLearning.test.ts
│   │   │   └── UserPreferences.test.ts
│   │   └── AROverlays/
│   │       ├── OverlayManager.test.ts
│   │       ├── InfoCard.test.ts
│   │       ├── MedicineOverlay.test.ts
│   │       ├── NutritionOverlay.test.ts
│   │       ├── CalendarOverlay.test.ts
│   │       └── DepartureOverlay.test.ts
│   ├── integration/
│   │   ├── object-detection-to-ai.test.ts
│   │   ├── ai-to-overlay.test.ts
│   │   ├── voice-synthesis-flow.test.ts
│   │   ├── learning-system.test.ts
│   │   ├── medicine-flow.test.ts
│   │   ├── nutrition-flow.test.ts
│   │   ├── calendar-flow.test.ts
│   │   └── departure-flow.test.ts
│   ├── e2e/
│   │   ├── demo-flow.test.ts
│   │   ├── fallback-systems.test.ts
│   │   └── 2-minute-demo.test.ts
│   └── fixtures/
│       ├── mock-objects.json
│       ├── mock-api-responses.json
│       └── test-data.sql
├── .github/
│   └── workflows/
│       ├── test.yml                  # Run tests on PR
│       ├── lint.yml                  # Lint and type check
│       └── deploy.yml                # Deploy on merge to main
└── jest.config.js
```

---

## Phase 0: Pre-Hackathon Setup (T-24 to T-0)

### 0.A: Testing Infrastructure Setup

**Task:** Set up Jest for TypeScript testing

```bash
# Install dependencies
npm install --save-dev jest ts-jest @types/jest
npm install --save-dev @testing-library/jest-dom

# Create jest.config.js
npx ts-jest config:init
```

**Files to create:**
- `jest.config.js`
- `__tests__/setup.ts`

**Deliverable:** Jest runs successfully with `npm test`

---

### 0.B: Create Lens Studio API Mocks

**Task:** Mock all Lens Studio APIs used by other devs

**Files to create:**
- `__tests__/mocks/lens-studio.ts`

**Mock classes needed:**
```typescript
- MockInternetModule (for Fetch API)
- MockRemoteServiceModule (for Gemini)
- MockMLComponent (for object detection)
- MockObjectTracking3D
- MockAudioComponent
- MockRenderMeshVisual
- MockText
- MockEvent<T>
- MockSupabaseClient
```

**Deliverable:** Mocks can instantiate all components without Lens Studio runtime

---

### 0.C: Write Test Templates for Phase 1 Components

**Task:** Write FAILING tests for all components Devs 1-3 will implement

**Tests to write:**

**Dev 1 Components:**
- `DemoObjectTracker.test.ts` - Object detection logic
- `SpatialAnchors.test.ts` - Spatial tracking
- `GestureHandler.test.ts` - Gesture recognition
- `OverlayManager.test.ts` - AR overlay creation
- `InfoCard.test.ts` - UI card rendering

**Dev 2 Components:**
- `GeminiAssistant.test.ts` - AI integration
- `ElevenLabsVoice.test.ts` - Voice synthesis
- `VoiceHandler.test.ts` - Voice coordination
- `AICoordinator.test.ts` - AI routing

**Dev 3 Components:**
- `SupabaseClient.test.ts` - Database operations
- `ChromaLearning.test.ts` - Vector database
- `UserPreferences.test.ts` - User data

**Deliverable:** All tests written, all FAILING (RED phase)

---

### 0.D: Set up GitHub Actions CI/CD

**Task:** Create automated test pipeline

**File:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Type check
        run: npm run type-check
        
      - name: Run tests
        run: npm test -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

**Deliverable:** GitHub Actions runs on every PR

---

### 0.E: Configure Branch Protection Rules

**Task:** Protect main branch, require passing tests

**Settings in GitHub:**
1. Settings → Branches → Add rule for `main`
2. ✅ Require status checks to pass
3. ✅ Require test workflow to pass
4. ✅ Require 1 approval (Dev 4)
5. ✅ Require branches to be up to date

**Deliverable:** Cannot merge to main without passing tests

---

## Phase 1: Foundation Testing (Hours 0-8)

### 1.A: Monitor Test Execution

**Task:** Watch as other devs commit code, tests transition from RED to GREEN

**Process:**
1. Dev 1/2/3 creates PR from their feature branch
2. GitHub Actions runs tests automatically
3. Dev 4 reviews test results in PR
4. If tests fail, Dev 4 comments with specific failures
5. Dev fixes code, pushes again
6. Repeat until GREEN

**Tools:**
- GitHub PR interface
- GitHub Actions logs
- Local `npm test` for detailed debugging

---

### 1.B: PR Review & Feedback

**Task:** Review each PR for code quality and test coverage

**Review checklist:**
- [ ] All tests passing
- [ ] Test coverage >80% for new code
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Code follows project patterns
- [ ] Mock objects used appropriately
- [ ] No console.log in production code

**Feedback template:**
```markdown
## Test Results
✅ All tests passing
⚠️  Coverage: 75% (target: 80%)

## Required Changes
1. Add test for error case in line 45
2. Fix TypeScript error in GestureHandler.ts:23

## Suggestions
- Consider extracting magic number 0.7 to constant
```

---

### 1.C: Write Integration Tests

**Task:** Test interactions between components

**Files to create:**
- `__tests__/integration/object-detection-to-ai.test.ts`
- `__tests__/integration/ai-to-overlay.test.ts`
- `__tests__/integration/voice-synthesis-flow.test.ts`

**Example:**
```typescript
// object-detection-to-ai.test.ts
describe('Object Detection → AI Flow', () => {
  it('should trigger AI analysis when medicine detected', async () => {
    const detector = new DemoObjectTracker(mockML);
    const aiCoordinator = new AICoordinator(mockGemini);
    
    // Wire them together
    detector.onObjectDetected.add(aiCoordinator.handleDetection);
    
    // Simulate detection
    const medicineDetection = {
      type: 'medicine',
      confidence: 0.95,
      position: new vec3(0, 0, -2)
    };
    
    await detector.processDetection(medicineDetection);
    
    // Assert AI was called
    expect(mockGemini.analyze).toHaveBeenCalledWith(
      expect.objectContaining({ objectType: 'medicine' })
    );
  });
});
```

**Deliverable:** Integration tests covering all major component interactions

---

### 1.D: Merge Strategy

**Task:** Merge PRs to main in dependency order

**Merge order:**
1. Core utilities first (Event system, Logger)
2. Storage layer (SupabaseClient, ChromaLearning)
3. Object detection (DemoObjectTracker)
4. AI integration (GeminiAssistant, VoiceHandler)
5. AR overlays (OverlayManager, InfoCard)
6. AI Coordinator (wires everything together)

**Process:**
1. Review PR
2. Run tests locally: `npm test`
3. Check test coverage: `npm run test:coverage`
4. If pass: Click "Squash and merge" on GitHub
5. Delete feature branch
6. Notify dev that their code is merged

---

## Phase 2: Feature Testing (Hours 8-16)

### 2.A: E2E Demo Flow Tests

**Task:** Test complete 2-minute demo sequence

**File:** `__tests__/e2e/demo-flow.test.ts`

```typescript
describe('2-Minute Demo Flow', () => {
  let demo: DemoOrchestrator;
  
  beforeEach(() => {
    demo = new DemoOrchestrator();
  });
  
  it('should complete full demo in <120 seconds', async () => {
    const startTime = Date.now();
    
    // Segment 1: Medicine (target: 20-25s)
    await demo.detectObject('medicine');
    expect(demo.currentSegment).toBe('medicine');
    expect(demo.overlayVisible).toBe(true);
    
    // Segment 2: Bowl (target: 20-25s)
    await demo.detectObject('bowl');
    expect(demo.currentSegment).toBe('nutrition');
    
    // Segment 3: Laptop (target: 20-25s)
    await demo.detectObject('laptop');
    expect(demo.currentSegment).toBe('calendar');
    
    // Segment 4: Keys (target: 20-25s)
    await demo.detectObject('keys');
    expect(demo.currentSegment).toBe('location');
    
    // Segment 5: Departure (target: 20-25s)
    await demo.completeDeparture();
    expect(demo.currentSegment).toBe('departure');
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(120000); // 2 minutes
  });
});
```

---

### 2.B: Test Fixtures for Demo Objects

**Task:** Create realistic test data for all 5 demo objects

**File:** `__tests__/fixtures/demo-objects.json`

```json
{
  "medicine": {
    "id": "med_001",
    "type": "medicine",
    "label": "Aspirin",
    "confidence": 0.95,
    "position": [0, 0.5, -2],
    "metadata": {
      "dosage": "100mg",
      "schedule": "08:00 AM",
      "lastTaken": "2025-10-24T08:00:00Z"
    }
  },
  "bowl": {
    "id": "bowl_001",
    "type": "bowl",
    "label": "Cereal Bowl",
    "confidence": 0.92,
    "position": [-0.3, 0.2, -1.5],
    "metadata": {
      "contents": "oatmeal",
      "calories": 350,
      "macros": {
        "protein": 12,
        "carbs": 54,
        "fats": 8
      }
    }
  }
}
```

**Deliverable:** Complete test fixtures for all demo scenarios

---

### 2.C: Continuous PR Review

**Task:** Continue reviewing and merging PRs from Phase 2 features

**Focus areas:**
- Feature-specific overlays (Medicine, Nutrition, Calendar, Departure)
- Learning system integration
- Voice synthesis quality
- Performance optimization

---

## Phase 3: Integration Testing (Hours 16-24)

### 3.A: Real-time Testing

**Task:** Test Supabase Realtime subscriptions

**File:** `__tests__/integration/realtime-sync.test.ts`

```typescript
describe('Supabase Realtime', () => {
  it('should update overlays when database changes', async () => {
    const supabase = new MarvinSupabaseClient(mockSupabase);
    const overlay = new OverlayManager();
    
    // Subscribe to changes
    supabase.subscribeToRealtimeUpdates('object_interactions');
    supabase.onDataUpdated.add((data) => {
      overlay.update(data);
    });
    
    // Simulate database change
    await mockSupabase.trigger('INSERT', {
      object_type: 'medicine',
      response: 'Take your medication'
    });
    
    // Assert overlay updated
    expect(overlay.currentContent).toContain('Take your medication');
  });
});
```

---

### 3.B: Fallback System Testing

**Task:** Test all fallback mechanisms

**File:** `__tests__/e2e/fallback-systems.test.ts`

```typescript
describe('Fallback Systems', () => {
  it('should use cached responses when Gemini fails', async () => {
    const ai = new AICoordinator(mockGeminiOffline);
    
    const response = await ai.processObject('medicine');
    
    expect(response.source).toBe('cache');
    expect(response.text).toBeDefined();
  });
  
  it('should use Gemini voice when ElevenLabs fails', async () => {
    const voice = new VoiceHandler(mockElevenLabsOffline, mockGemini);
    
    await voice.speakText('Hello');
    
    expect(mockGemini.synthesize).toHaveBeenCalled();
    expect(mockElevenLabsOffline.synthesize).toHaveBeenCalled();
  });
  
  it('should use pre-recorded audio when both fail', async () => {
    const voice = new VoiceHandler(mockElevenLabsOffline, mockGeminiOffline);
    
    await voice.speakText('Hello');
    
    expect(voice.currentAudioSource).toBe('prerecorded');
  });
});
```

---

## Phase 4-5: Demo Reliability (Hours 24-36)

### 4.A: Performance Testing

**Task:** Ensure performance targets are met

**Tests:**
```typescript
describe('Performance Targets', () => {
  it('AR overlay should render in <100ms', async () => {
    const start = performance.now();
    await overlayManager.createOverlay(testData);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  it('Gemini response should complete in <2s', async () => {
    const start = performance.now();
    await gemini.analyze(testImage);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(2000);
  });
});
```

---

### 5.A: Final Integration Check

**Task:** Run complete test suite before demo

```bash
# Run all tests with coverage
npm run test:coverage

# Expected output:
# ✅ Unit tests: 150/150 passing
# ✅ Integration tests: 20/20 passing
# ✅ E2E tests: 5/5 passing
# ✅ Coverage: 85%
```

---

## Continuous Monitoring

### Test Execution Dashboard

Track test health throughout hackathon:

```
Phase 1 (Hour 8):
├─ Unit Tests: 45/50 passing (90%)
├─ Integration Tests: 0/20 passing (components not wired yet)
└─ Coverage: 75%

Phase 2 (Hour 16):
├─ Unit Tests: 100/100 passing (100%)
├─ Integration Tests: 15/20 passing (75%)
└─ Coverage: 82%

Phase 3 (Hour 24):
├─ Unit Tests: 100/100 passing (100%)
├─ Integration Tests: 20/20 passing (100%)
├─ E2E Tests: 3/5 passing (60%)
└─ Coverage: 85%

Phase 4 (Hour 32):
├─ Unit Tests: 100/100 passing (100%)
├─ Integration Tests: 20/20 passing (100%)
├─ E2E Tests: 5/5 passing (100%)
└─ Coverage: 88%
```

---

## Success Criteria

Dev 4's deliverables:

- [ ] 150+ unit tests written
- [ ] 20+ integration tests written
- [ ] 5+ E2E tests written
- [ ] Test coverage >85%
- [ ] CI/CD pipeline operational
- [ ] All PRs reviewed and merged
- [ ] Zero failing tests in main branch
- [ ] Demo flow tested 10+ times with automated tests

---

## Tools & Commands

### Run Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # E2E tests only
```

### PR Review
```bash
# Checkout PR locally
gh pr checkout 123

# Run tests
npm test

# Check coverage
npm run test:coverage

# If pass, merge
gh pr merge 123 --squash
```

### Monitor CI/CD
```bash
# Watch GitHub Actions
gh run list

# View specific run
gh run view 123456
```

---

**Last Updated:** October 25, 2025  
**Owner:** Dev 4 (Integration & DevOps)
