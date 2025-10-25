# Marvin AR Assistant - API Documentation

This folder contains API references and documentation for all services used in the Marvin AR morning assistant project.

## 📚 Documentation Index

### ✅ Core Documentation (Up-to-Date)

| File | Description | Last Updated | Status |
|------|-------------|--------------|--------|
| **snap-spectacles-api-reference.md** | Complete Snap Spectacles & Lens Studio API reference with TypeScript examples | Oct 2025 | ✅ Current |
| **gemini.md** | Google Gemini multimodal AI API documentation | Oct 2024 | ✅ Active |
| **elevenlabs.md** | ElevenLabs voice synthesis API reference | Oct 2024 | ✅ Active |
| **chroma.md** | Chroma vector database documentation for learning patterns | Oct 2024 | ✅ Active |

### ⚠️ Reference Documentation (Keep for Reference)

| File | Description | Status |
|------|-------------|--------|
| **studio.d.ts** | TypeScript declarations for Lens Studio API | 📦 Reference |
| **full api list.html** | Complete Snap API list (HTML format) | 📦 Reference |

### ❌ Deprecated Documentation (No Longer Used)

| File | Description | Reason |
|------|-------------|--------|
| **groq.md** | Groq API documentation | ❌ Not using Groq |
| **fetchai.md** | Fetch.ai autonomous agents | ❌ Out of scope for 36-hour hackathon |

---

## 🎯 Primary Stack

Our Marvin AR assistant uses the following technology stack:

```
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│   Snap Spectacles    │    │   AI Processing      │    │   Backend Services   │
│   (AR Frontend)      │◄──►│   (Gemini + Voice)   │◄──►│   (BaaS + Vector DB) │
│                      │    │                      │    │                      │
│ • Object Detection   │    │ • Gemini Live API    │    │ • Supabase DB        │
│ • AR Overlays        │    │ • ElevenLabs Voice   │    │ • Chroma Vector DB   │
│ • Spatial Tracking   │    │ • Vision + Context   │    │ • Realtime Subscr.   │
│ • Gesture Recognition│    │ • Learning Patterns  │    │ • Storage & Auth     │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
        ▲                            ▲                            ▲
        │                            │                            │
        └────────────── Fetch API + Remote Service Gateway ──────┘
```

---

## 📖 Quick Start Guide

### 1. Snap Spectacles (Lens Studio)

**Read:** `snap-spectacles-api-reference.md`

Key APIs:
- `RemoteServiceModule` - External API integration
- `InternetModule` - Fetch API for HTTP requests  
- `ObjectTracking3D` - Object detection and tracking
- `RenderMeshVisual` - AR overlay rendering
- `Text` - AR text components

**Example:**
```typescript
@component
export class MarvinCore extends BaseScriptComponent {
  @input internetModule: InternetModule;
  @input remoteServiceModule: Asset.RemoteServiceModule;
  
  async onAwake() {
    // Your Marvin logic here
  }
}
```

### 2. Gemini Multimodal AI

**Read:** `gemini.md`

**Integration:** Via Remote Service Gateway (built into Lens Studio)

Key Features:
- Vision + language understanding
- Real-time conversation
- Streaming responses
- Audio input/output

**Example:**
```typescript
// Gemini Live integration handled by RemoteServiceGateway.lspkg
import { Gemini, GeminiLiveWebsocket } from "RemoteServiceGateway.lspkg/HostedExternal/Gemini";
```

### 3. ElevenLabs Voice Synthesis

**Read:** `elevenlabs.md`

**Integration:** Via Fetch API (`InternetModule`)

Key Features:
- Premium voice quality
- Multiple voice options
- Multilingual support
- Low latency

**Example:**
```typescript
const response = await this.internetModule.fetch(
  new Request('https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID', {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'Hello from Marvin!',
      model_id: 'eleven_multilingual_v2'
    })
  })
);
```

### 4. Chroma Vector Database

**Read:** `chroma.md`

**Integration:** Via Fetch API (`InternetModule`)

Key Features:
- Vector similarity search
- Embedding storage
- Learning pattern tracking
- Contextual memory

**Example:**
```typescript
const response = await this.internetModule.fetch(
  new Request('https://your-chroma.com/api/v1/collections/marvin/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query_embeddings: [embedding],
      n_results: 5
    })
  })
);
```

---

## 🔑 API Keys Required

Set these up before development:

| Service | Key Location | Documentation |
|---------|--------------|---------------|
| **Remote Service Gateway** | Lens Studio Token Generator | `snap-spectacles-api-reference.md` |
| **Gemini API** | Google AI Studio | `gemini.md` |
| **ElevenLabs** | ElevenLabs Dashboard | `elevenlabs.md` |
| **Chroma** | Self-hosted or cloud | `chroma.md` |
| **Supabase** | Supabase Project Settings | Supabase official docs |

---

## 🚀 Development Workflow

### Phase 1: Lens Studio Setup
1. Read `snap-spectacles-api-reference.md` - Understand Lens Studio architecture
2. Set up Remote Service Gateway token
3. Configure InternetModule for Fetch API

### Phase 2: AI Integration
1. Read `gemini.md` - Configure Gemini Live for vision + conversation
2. Read `elevenlabs.md` - Set up premium voice synthesis
3. Implement voice coordinator with fallback logic

### Phase 3: Learning System
1. Read `chroma.md` - Set up vector database
2. Implement embedding generation
3. Build pattern learning system

### Phase 4: Integration
1. Wire all services together
2. Test end-to-end flow
3. Implement fallback systems

---

## 📝 Documentation Standards

All documentation in this folder follows these standards:

- ✅ **TypeScript examples** - All code is TypeScript (Lens Studio standard)
- ✅ **Official APIs** - Based on official provider documentation
- ✅ **Working examples** - All code snippets are tested
- ✅ **Error handling** - Includes proper error handling patterns
- ✅ **Type safety** - Uses explicit types and interfaces

---

## 🔧 Maintenance

### When to Update

- **snap-spectacles-api-reference.md** - When Lens Studio updates (check quarterly)
- **gemini.md** - When Google updates Gemini API (monitor changelog)
- **elevenlabs.md** - When ElevenLabs adds features (monitor dashboard)
- **chroma.md** - When Chroma updates (check releases)

### Deprecation Process

1. Mark file with ❌ in README
2. Add deprecation notice at top of file
3. Keep for 1 release cycle
4. Archive to `/docs/archive/` folder
5. Remove from README index

---

## 📧 Questions?

- **Snap Spectacles:** https://developers.snap.com/lens-studio
- **Gemini API:** https://ai.google.dev/gemini-api/docs
- **ElevenLabs:** https://elevenlabs.io/docs
- **Chroma:** https://docs.trychroma.com

---

**Last Updated:** October 25, 2025  
**Maintainer:** Marvin Dev Team
