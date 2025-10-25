# Snap Spectacles Sample Projects - Quick Reference Index

**Source:** [snapchat/spectacles-sample](https://github.com/snapchat/spectacles-sample)  
**Purpose:** Reference examples for Marvin AR Assistant development  
**Last Updated:** October 25, 2025

---

## 🎯 Quick Navigation by Use Case

### For External API Integration (ElevenLabs, Chroma)
→ **`Fetch/`** - HTTP requests via InternetModule

### For AI Integration (Gemini)
→ **`AI Playground/`** - Remote Service Gateway patterns  
→ **`Agentic Playground/`** - Advanced AI agent patterns

### For Object Detection
→ **`SnapML Starter/`** - ML model integration  
→ **`SnapML Chess Hints/`** - Real-time object recognition  
→ **`SnapML Pool/`** - Advanced tracking examples

### For Voice & Audio
→ **`Voice Playback/`** - Audio component usage  
→ **`Think Out Loud/`** - Voice commands & conversation  
→ **`AI Music Gen/`** - Audio generation patterns

### For Database & Storage (Supabase)
→ **`Snap Cloud/`** - SupabaseClient.lspkg integration  
→ **`Spatial Persistence/`** - Saving spatial data

### For AR UI Components
→ **`Essentials/`** - Core UI patterns  
→ **`Material Library/`** - Visual materials  
→ **`Navigation Kit/`** - AR navigation UI

---

## 📚 Complete Project Index

### Priority Level Legend
- 🔥 **Critical** - Must study for Marvin
- ⭐ **High** - Very useful reference
- 💡 **Medium** - Helpful for specific features
- 📦 **Reference** - Keep for edge cases

---

### 🔥 Critical Projects

#### Fetch/
**Priority:** 🔥 **Critical**  
**File:** `Fetch/Fetch.esproj`  
**What it does:** Demonstrates HTTP requests using InternetModule and Fetch API  
**Key files:**
- `Assets/Scripts/FetchExample.ts` - Main fetch implementation
- `README.md` - Setup instructions

**Marvin use cases:**
- ✅ ElevenLabs API calls for voice synthesis
- ✅ Chroma vector database queries
- ✅ Any external HTTP service integration

**Code pattern:**
```typescript
@input internetModule: InternetModule;
const response = await this.internetModule.fetch(new Request(url, options));
```

**Reference as:** "See Fetch/ example for HTTP request patterns"

---

#### AI Playground/
**Priority:** 🔥 **Critical**  
**File:** `AI Playground/AI Playground.esproj`  
**What it does:** AI service integration with Remote Service Gateway  
**Key files:**
- `Assets/Scripts/AIController.ts` - AI coordination
- `Packages/RemoteServiceGateway.lspkg` - Gateway package

**Marvin use cases:**
- ✅ Gemini Live integration patterns
- ✅ Multimodal AI (vision + text)
- ✅ Real-time AI responses

**Reference as:** "See AI Playground/ for Gemini integration patterns"

---

#### Essentials/
**Priority:** 🔥 **Critical**  
**File:** `Essentials/Essentials.esproj`  
**What it does:** Core Lens Studio patterns and component architecture  
**Key files:**
- `Assets/Scripts/` - All core patterns
- Component lifecycle examples
- TypeScript decorator usage

**Marvin use cases:**
- ✅ Component architecture
- ✅ @component and @input decorators
- ✅ Event system usage
- ✅ Scene object management

**Reference as:** "See Essentials/ for core Lens Studio patterns"

---

#### Snap Cloud/
**Priority:** 🔥 **Critical**  
**File:** `Snap Cloud/[project].esproj`  
**What it does:** Supabase integration via SupabaseClient.lspkg  
**Key files:**
- SupabaseClient usage examples
- Database CRUD operations
- Real-time subscriptions

**Marvin use cases:**
- ✅ User preferences storage
- ✅ Object interaction logging
- ✅ Learning data persistence

**Reference as:** "See Snap Cloud/ for Supabase integration"

---

### ⭐ High Priority Projects

#### SnapML Starter/
**Priority:** ⭐ **High**  
**File:** `SnapML Starter/[project].esproj`  
**What it does:** ML model integration for object detection  
**Marvin use cases:**
- ✅ Demo object detection (bowl, laptop, keys, medicine, phone)
- ✅ ML Component configuration
- ✅ Confidence thresholding

**Reference as:** "See SnapML Starter/ for object detection setup"

---

#### Voice Playback/
**Priority:** ⭐ **High**  
**File:** `Voice Playback/[project].esproj`  
**What it does:** Audio component and voice synthesis  
**Marvin use cases:**
- ✅ Audio playback from API responses
- ✅ Voice response handling
- ✅ Audio fallback system

**Reference as:** "See Voice Playback/ for audio handling"

---

#### Think Out Loud/
**Priority:** ⭐ **High**  
**File:** `Think Out Loud/[project].esproj`  
**What it does:** Voice commands and conversational AI  
**Marvin use cases:**
- ✅ Microphone input handling
- ✅ Voice command recognition
- ✅ Conversation flow patterns

**Reference as:** "See Think Out Loud/ for voice interaction patterns"

---

#### Spatial Persistence/
**Priority:** ⭐ **High**  
**File:** `Spatial Persistence/[project].esproj`  
**What it does:** Saving and loading spatial anchors  
**Marvin use cases:**
- ✅ Remembering object locations (keys)
- ✅ Spatial mapping
- ✅ Persistent AR anchors

**Reference as:** "See Spatial Persistence/ for location tracking"

---

### 💡 Medium Priority Projects

#### Agentic Playground/
**Priority:** 💡 **Medium**  
**File:** `Agentic Playground/Agentic Playground.esproj`  
**What it does:** Advanced AI agent patterns  
**Marvin use cases:**
- 💡 Advanced AI coordination
- 💡 Multi-step reasoning

**Reference as:** "See Agentic Playground/ for advanced AI patterns"

---

#### Navigation Kit/
**Priority:** 💡 **Medium**  
**File:** `Navigation Kit/[project].esproj`  
**What it does:** AR navigation and wayfinding UI  
**Marvin use cases:**
- 💡 AR arrows for guiding to keys
- 💡 Visual navigation indicators

**Reference as:** "See Navigation Kit/ for AR navigation UI"

---

#### Custom Locations/
**Priority:** 💡 **Medium**  
**File:** `Custom Locations/CustomLocationsExample.esproj`  
**What it does:** Custom location tracking  
**Marvin use cases:**
- 💡 Room layout mapping
- 💡 Custom spatial zones

**Reference as:** "See Custom Locations/ for spatial mapping"

---

#### Material Library/
**Priority:** 💡 **Medium**  
**File:** `Material Library/[project].esproj`  
**What it does:** Visual materials and shaders  
**Marvin use cases:**
- 💡 AR overlay styling
- 💡 Visual effects

**Reference as:** "See Material Library/ for material examples"

---

### 📦 Reference Projects

#### BLE Playground/
**Priority:** 📦 **Reference**  
**File:** `BLE Playground/BLE Playground.esproj`  
**What it does:** Bluetooth Low Energy integration  
**Note:** Not needed for core Marvin, but shows component patterns

---

#### Air Hockey/
**Priority:** 📦 **Reference**  
**File:** `Air Hockey/AirHockey.esproj`  
**What it does:** Physics and game mechanics  
**Note:** Reference for interaction patterns

---

#### Crop/
**Priority:** 📦 **Reference**  
**File:** `Crop/Crop.esproj`  
**What it does:** Image manipulation  
**Note:** Shows texture handling

---

#### Depth Cache/
**Priority:** 📦 **Reference**  
**File:** `Depth Cache/DepthCache.esproj`  
**What it does:** Depth sensing and caching  
**Note:** Reference for advanced spatial features

---

## 🔍 How to Reference Examples in Code Comments

### ✅ Good References

```typescript
// Pattern from Fetch/ example
// See: docs/snap-examples/Fetch/README.md
@input internetModule: InternetModule;

const response = await this.internetModule.fetch(
  new Request(url, { method: 'POST' })
);
```

```typescript
// AI integration pattern from AI Playground/
// See: docs/snap-examples/AI Playground/Assets/Scripts/
import { Gemini } from "RemoteServiceGateway.lspkg/HostedExternal/Gemini";
```

```typescript
// Object detection setup from SnapML Starter/
// See: docs/snap-examples/SnapML Starter/
@input objectTracking: ObjectTracking3D;
const tracker = this.objectTracking.createTracker();
```

### ❌ Avoid Vague References

```typescript
// ❌ Too vague
// Based on sample project

// ❌ No path
// From the examples

// ✅ Good - specific project and file
// Pattern from Fetch/Assets/Scripts/FetchExample.ts
```

---

## 📖 Reading Order for New Developers

1. **Start:** `Essentials/` - Learn core patterns
2. **Then:** `Fetch/` - Understand external API calls
3. **Then:** `AI Playground/` - Study AI integration
4. **Then:** `SnapML Starter/` - Learn object detection
5. **Then:** `Snap Cloud/` - Database integration
6. **Then:** `Voice Playback/` - Audio handling
7. **Finally:** Feature-specific projects as needed

---

## 🎯 Quick Search Guide

### "How do I...?"

**...call an external API?**
→ `Fetch/` - InternetModule and Fetch API

**...integrate AI?**
→ `AI Playground/` - Remote Service Gateway

**...detect objects?**
→ `SnapML Starter/` - ML Component setup

**...play audio?**
→ `Voice Playback/` - AudioComponent usage

**...save data?**
→ `Snap Cloud/` - SupabaseClient.lspkg

**...create AR overlays?**
→ `Essentials/` + `Material Library/`

**...track locations?**
→ `Spatial Persistence/` - Spatial anchors

**...handle voice input?**
→ `Think Out Loud/` - Microphone and voice commands

**...navigate in AR?**
→ `Navigation Kit/` - AR wayfinding UI

---

## 📦 Package Dependencies Map

### RemoteServiceGateway.lspkg
Used in:
- `AI Playground/`
- `Agentic Playground/`

Purpose: External API integration with token auth

---

### SupabaseClient.lspkg
Used in:
- `Snap Cloud/`

Purpose: Database and real-time features

---

### SpectaclesInteractionKit.lspkg
Used in: **All projects**

Purpose: Core AR interaction framework

---

## 🔗 Cross-References

### ElevenLabs Integration
1. Study: `Fetch/` - HTTP request patterns
2. Study: `Voice Playback/` - Audio playback
3. Combine: HTTP fetch → Audio playback

### Chroma Integration
1. Study: `Fetch/` - HTTP POST with JSON
2. Study: `Snap Cloud/` - Data persistence patterns
3. Combine: Vector queries → Local caching

### Gemini Integration
1. Study: `AI Playground/` - Remote Service Gateway
2. Study: `SnapML Starter/` - Vision input
3. Combine: Object detection → AI analysis

---

## 💡 Pro Tips

### Finding Code Patterns
1. Use VS Code search across `snap-examples/`
2. Search for: `@component`, `@input`, `import`
3. Look for similar feature implementations

### Adapting Examples
1. Copy working code from example
2. Update imports for your project structure
3. Adapt variable names for Marvin context
4. Test in Lens Studio preview

### When Examples Conflict
1. Prefer newer projects (check git commits)
2. Prefer simpler implementations
3. Test both approaches if unclear

---

## 📝 Contribution Guidelines

When adding references to examples in Marvin code:

1. **Always cite the specific project**: ❌ "from examples" → ✅ "from Fetch/"
2. **Link to files when possible**: Include path like `Fetch/Assets/Scripts/FetchExample.ts`
3. **Explain adaptations**: Note what you changed from the original
4. **Keep examples updated**: If sample projects update, review references

---

## 🆘 Troubleshooting

**Can't find an example?**
- Check this index first
- Search across all README.md files
- Look at project file structure

**Example doesn't work?**
- Check Lens Studio version compatibility
- Verify all packages are installed
- Check if Git LFS assets are downloaded

**Example is outdated?**
- Check official repo for updates
- Look for newer similar examples
- Adapt to current API patterns

---

**Last Updated:** October 25, 2025  
**Maintained by:** Marvin Dev Team  
**Source:** https://github.com/snapchat/spectacles-sample
