# Marvin PRD

**Version:** 1.0.0  
**Date:** October 2025  
**Hackathon:** MLH 36-Hour Hackathon  
**Team Size:** 4 Developers  
**Timeline:** 36 Hours

## Table of Contents

1. Introduction/Overview
2. Goals
3. User Stories
4. Functional Requirements
5. Non-Goals (Out of Scope)
6. Design Considerations
7. Technical Considerations
8. Success Metrics
9. Edge Cases & Error Handling
10. Implementation Priority & Timeline
11. Open Questions
12. Development Resources
13. Risk Mitigation
14. Development Setup Instructions
15. Appendices

---

## 1. Introduction/Overview

Marvin PRD is a revolutionary AR-powered morning assistant built for Snap Spectacles that transforms your daily routine with intelligent, contextual guidance. Using advanced object recognition, multimodal AI, and adaptive learning, the system provides personalized assistance as you move through your morning - from medicine reminders to nutrition tracking, calendar briefings, and departure checklists.

### Core Problem
Modern mornings are chaotic and inefficient:
- Forgotten medications and health routines
- Poor nutrition decisions due to time constraints
- Lost items causing delays and stress
- Missed calendar conflicts and scheduling issues
- Disconnected information silos across apps and devices

However, existing smart assistants fail to provide contextual, visual assistance in the moment of need.

### Our Solution
An AR-powered personal assistant that follows you through your morning routine, providing intelligent, contextual guidance through Snap Spectacles. The system recognizes objects in your environment and delivers timely, personalized assistance exactly when and where you need it.

### Demo Environment Setup

**IMPORTANT**: This system is optimized for controlled demo environment.

**Demo Objects** (on desk):
- ✅ Breakfast bowl (nutrition tracking & recipe suggestions)
- ✅ Laptop (calendar integration & work briefing)  
- ✅ Keys (location tracking & departure checklist)
- ✅ Medicine bottle (health reminders & timing)
- ✅ Phone (connectivity & backup interface)

**Demo Flow** (2-minute live demo):
1. **Medicine Reminder** → AR overlay shows medication schedule
2. **Breakfast Assistance** → Nutrition info + healthy recipe suggestions  
3. **Calendar Briefing** → Day overview + meeting preparation
4. **Key Location** → AR arrow guides to keys when needed
5. **Departure Checklist** → Final items verification before leaving

**Primary Goal:** Create a functional AR morning assistant demonstrating intelligent object recognition, conversational AI, and adaptive learning within 36 hours.

---

## 2. Goals

### Primary Objectives

1. **Enable Contextual AR Assistance**
	 - Real-time object recognition for demo items (bowl, laptop, keys, medicine, phone)
	 - Contextual information overlays based on object interaction
	 - Intelligent timing for proactive vs reactive assistance

2. **Implement Advanced Multimodal AI**
	 - Deploy Gemini API for visual understanding and natural language processing
	 - Voice-first interactions through ElevenLabs Voice Agents and advanced conversational AI
	 - Real-time conversation with contextual memory through Chroma

3. **Create Seamless AR Experience**
	 - Native Snap Spectacles object detection and spatial tracking
	 - Smooth hand gesture recognition for object interaction
	 - Professional AR overlays with clear visual hierarchy

4. **Demonstrate Adaptive Learning**
	 - Personal preference tracking through Chroma vector embeddings
	 - Habit pattern recognition and optimization suggestions
	 - Simulated "learning over time" progression for demo

5. **Achieve Production-Ready Architecture**
	 - CI/CD pipeline with continuous integration
	 - Separated AR frontend, backend services, and AI processing
	 - Comprehensive error handling and fallback systems

---

## 3. User Stories

### Morning Assistant User Stories

**U1: Health-Conscious Professional**
> As a busy professional with multiple medications, I want my AR assistant to remind me about my morning pills and vitamins with visual cues when I'm near my medicine cabinet, so that I never miss a dose even during hectic mornings.

**U2: Nutrition-Focused Individual**
> As someone tracking my health goals, I want my assistant to recognize my breakfast and provide instant nutrition information plus healthy recipe suggestions, so that I can make informed eating decisions without manually logging food.

**U3: Calendar-Driven Worker**
> As someone with a packed schedule, I want my assistant to brief me on my day when I sit down with my laptop, including meeting prep and priority tasks, so that I start each day organized and prepared.

**U4: Forgetful Commuter**
> As someone who frequently misplaces keys and essentials, I want my AR assistant to guide me to my items when I'm ready to leave, so that I can avoid delays and reduce morning stress.

### Advanced User Scenarios

**U5: Adaptive Learning Beneficiary**
> As a regular user, I want my assistant to learn my morning patterns and preferences over time, proactively suggesting optimizations to my routine, so that my mornings become increasingly efficient and personalized.

**U6: Multi-Device Integrator**
> As someone with connected devices, I want my AR assistant to coordinate with my calendar, health apps, and smart home systems, so that I get comprehensive assistance without switching between applications.

### Demo Audience Stories

**D1: Hackathon Judge**
> As a hackathon judge, I want to see a compelling 2-minute demo that showcases multiple advanced technologies working seamlessly together, so that I can evaluate the technical achievement and practical value.

**D2: Technology Investor**
> As a potential investor, I want to understand how this AR assistant could scale beyond morning routines to become a comprehensive daily companion, so that I can assess the market opportunity and business potential.

---

## 4. Functional Requirements

### 4.1 Snap Spectacles AR Core (Priority: Critical)

**FR-001:** System MUST utilize native Snap Spectacles object detection capabilities  
**FR-002:** System MUST recognize 5 demo objects: breakfast bowl, laptop, keys, medicine bottle, phone  
**FR-003:** System MUST track spatial positions of objects using Snap's spatial anchors  
**FR-004:** System MUST detect hand gestures when reaching for or touching objects  
**FR-005:** System MUST render AR overlays with <100ms latency from object recognition  
**FR-006:** System MUST maintain stable AR tracking in demo environment lighting conditions  
**FR-007:** System MUST handle object occlusion and re-detection seamlessly  

### 4.2 Multimodal AI Integration (Priority: Critical)

**FR-008:** System MUST integrate Gemini API for visual understanding and natural language processing  
**FR-009:** System MUST process visual context from Spectacles camera feed  
**FR-010:** System MUST generate contextual responses based on object interaction  
**FR-011:** System MUST maintain conversation context across multiple object interactions  
**FR-012:** System MUST support both voice input and visual analysis simultaneously  
**FR-013:** System MUST provide intelligent suggestions based on time of day and user patterns  
**FR-014:** System MUST process requests in <2 seconds for real-time interaction  

### 4.3 Voice Integration (Priority: Critical)

**FR-015:** System MUST integrate ElevenLabs for natural voice synthesis  
**FR-016:** System MUST integrate ElevenLabs Voice Agents for advanced conversational AI capabilities  
**FR-017:** System MUST support hands-free voice commands while using Spectacles  
**FR-018:** System MUST provide audio feedback through Spectacles speakers  
**FR-019:** System MUST handle ambient noise in demo hall environment  
**FR-020:** System MUST support both English voice input and output  
**FR-021:** System MUST provide voice confirmation for critical actions (medicine reminders)  

### 4.4 Object-Specific Intelligence (Priority: High)

**FR-022:** System MUST provide medication reminders when medicine bottle is detected  
**FR-023:** System MUST display nutrition information when breakfast bowl is recognized  
**FR-024:** System MUST show calendar briefing when laptop interaction is detected  
**FR-025:** System MUST guide to key location when departure preparation is initiated  
**FR-026:** System MUST provide phone integration context when device is recognized  
**FR-027:** System MUST adapt responses based on time of day and routine patterns  
**FR-028:** System MUST track object usage patterns for learning optimization  

### 4.5 Contextual Memory & Learning (Priority: High)

**FR-029:** System MUST integrate Chroma vector database for contextual memory storage  
**FR-030:** System MUST store user preferences and routine patterns  
**FR-031:** System MUST learn object placement patterns (keys location, routine order)  
**FR-032:** System MUST provide increasingly personalized suggestions over time  
**FR-033:** System MUST maintain conversation history for context continuity  
**FR-034:** System MUST simulate "Day 1 vs Day 30" learning progression for demo  
**FR-035:** System MUST store health data, calendar patterns, and food preferences  

### 4.6 Calendar & Health Integration (Priority: High)

**FR-036:** System MUST integrate with Google Calendar API for schedule access  
**FR-037:** System MUST provide meeting preparation and day overview briefings  
**FR-038:** System MUST track medication schedules and timing  
**FR-039:** System MUST provide nutrition analysis and healthy recipe suggestions  
**FR-040:** System MUST identify scheduling conflicts and suggest optimizations  
**FR-041:** System MUST maintain privacy of personal data with encryption  
**FR-042:** System MUST work with internet connectivity for data synchronization  

### 4.7 AR User Interface (Priority: High)

**FR-043:** System MUST display AR overlays with clear visual hierarchy  
**FR-044:** System MUST use consistent design language across all object interactions  
**FR-045:** System MUST provide visual feedback for hand gesture recognition  
**FR-046:** System MUST render information panels that don't obstruct real-world view  
**FR-047:** System MUST support different overlay types (text, arrows, icons, progress bars)  
**FR-048:** System MUST adapt UI brightness based on environmental lighting  
**FR-049:** System MUST provide accessibility features for various user needs  

### 4.8 Supabase Services Architecture (Priority: Critical)

**FR-050:** System MUST provide Supabase client SDK integration for AR client communication  
**FR-051:** System MUST implement CI/CD pipeline for continuous integration  
**FR-052:** System MUST support Supabase Realtime subscriptions for real-time updates  
**FR-053:** System MUST validate all inputs with Row Level Security and Edge Function validation  
**FR-054:** System MUST implement health check Edge Functions for monitoring  
**FR-055:** System MUST rate limit API calls through Supabase policies and Edge Functions  
**FR-056:** System MUST log all operations with correlation IDs using Supabase logging  

### 4.9 Bluetooth & Device Integration (Priority: Medium)

**FR-057:** System MUST support Bluetooth integration for external speakers  
**FR-058:** System MUST connect with smartphone for backup interface access  
**FR-059:** System MUST sync data across connected devices  
**FR-060:** System MUST handle device disconnection gracefully  
**FR-061:** System MUST provide device status indicators in AR interface  

### 4.10 Demo Reliability & Performance (Priority: Critical)

**FR-062:** System MUST achieve 99% uptime during 2-minute demo presentation  
**FR-063:** System MUST provide fallback modes for each core feature  
**FR-064:** System MUST complete demo flow within 2-minute time constraint  
**FR-065:** System MUST handle demo environment variables (lighting, noise, space)  
**FR-066:** System MUST provide consistent object recognition across multiple demo runs  
**FR-067:** System MUST include demo reset capability for back-to-back presentations  
**FR-068:** System MUST work reliably in large hall environment with multiple people  

---

## 5. Non-Goals (Out of Scope)

To maintain focus and deliver a polished demo within 36 hours, the following are explicitly OUT of scope:

1. **Complex Computer Vision**: No training custom ML models - use Snap's built-in object detection only
2. **Multi-Room Navigation**: Demo limited to single desk environment only  
3. **Complex Health Integrations**: No FDA-compliant medical device features or real prescription management
4. **Production Security**: No enterprise-grade encryption or HIPAA compliance
5. **Multi-User Support**: Single user demo - no household sharing or user switching
6. **Advanced Gesture Recognition**: Basic hand detection only - no complex gesture training
7. **Offline Capability**: Internet connectivity required for all AI and data features
8. **Mobile Native Apps**: AR experience exclusively through Snap Spectacles
9. **Real Smart Home Integration**: No actual IoT device control - simulated only
10. **Complex Scheduling**: Basic calendar reading only - no meeting scheduling or conflict resolution
11. **Advanced Health Analytics**: No medical diagnosis or complex health trend analysis
12. **Multiple Language Support**: English only for MVP demo
13. **Production Deployment**: Demo environment only - no cloud infrastructure scaling
14. **Real-time Collaboration**: Single-user experience - no multi-user AR sharing
15. **Advanced Voice Commands**: Basic voice interaction only - no complex conversation trees

---

## 6. Design Considerations

### Visual Design System

#### Color Palette
```css
:root {
	--primary-dark: #1a1a2e;
	--primary-light: #6ee7b7;
	--glass-white: rgba(255,255,255,0.06);
	--glass-dark: rgba(3,7,18,0.6);
	--accent: linear-gradient(90deg,#8b5cf6,#06b6d4);
	--success: #10b981;
	--error: #f87171;
}
```

#### Typography
- **Headers**: Space Grotesk, 600 weight
- **Body**: Inter, 400 weight  
- **Data/Code**: JetBrains Mono
- **Sizes**: 14px base, 1.5rem scale

#### Component Library
```javascript
// Glass morphism card component
const GlassCard = styled.div`
	background: var(--glass-white);
	border-radius: 16px;
	backdrop-filter: blur(10px) saturate(120%);
	box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
`;
```

#### Animation Patterns
- Page transitions: 300ms ease-out
- Micro-interactions: 150ms ease
- Loading states: Infinite pulse at 2s intervals
- Proof generation: Progressive wave animation
- Success states: Confetti or particle burst

### User Flow Architecture

```mermaid
graph LR
		A[Landing] --> B{User Type}
		B --> C[Patient Dashboard]
		B --> D[Doctor Portal]
		B --> E[Researcher Portal]
		C --> F[Upload Genome]
		F --> G[Encrypt & Pin to IPFS]
		G --> H[Create On-chain Commitment]
		H --> I[Request Proof Generation]
		I --> J[Proof Generated]
		J --> K[Share Proof with Doctor/Researcher]
		K --> L[On-chain Verification]
		K --> M[Aggregate Data (Research)]
```

---

#### System Architecture
```
┌──────────────────────────────────────────────┐
│              Snap Spectacles                 │
│         Lens Studio + TypeScript              │
│                  Dev 1                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Object   │ │    AR    │ │ Gesture  │   │
│  │Detection │ │ Overlays │ │ Handler  │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────┘
											│
											▼
┌──────────────────────────────────────────────┐
│         AI & Voice Processing                │
│     Gemini + ElevenLabs Voice Agents + Advanced Conversational AI               │
│                  Dev 2                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Visual  │ │  Voice   │ │ Context  │   │
│  │    AI    │ │Synthesis │ │ Memory   │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────┘
											│
											▼
┌──────────────────────────────────────────────┐
│              Supabase Services               │
│    Database + Edge Functions + Realtime     │
│                  Dev 3                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │   Edge   │ │  Realtime│ │PostgreSQL│   │
│  │Functions │ │  Subscr. │ │ Database │   │
│  │          │ │          │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────┘
				 │              │              │
┌──────────────────────────────────────────────┐
│            CI/CD Pipeline                    │
│     GitHub Actions + Testing + Deploy       │
│                  Dev 4                       │
└──────────────────────────────────────────────┘

### Team Structure and Responsibilities

| Role | Developer | Primary Responsibilities | Key Deliverables |
|------|-----------|-------------------------|------------------|
| **AR Core Developer** | Dev 1 | Snap Spectacles integration, object detection, spatial tracking | Lens Studio project, object recognition, AR overlays |
| **AI & Voice Integration** | Dev 2 | Gemini API, ElevenLabs Voice Agents, advanced conversational AI integration, conversational logic | Voice processing, AI responses, multimodal understanding |
| **Supabase Integration** | Dev 3 | Database design, Edge Functions, Realtime subscriptions, external API coordination | Schema design, Edge Functions, real-time data sync |
| **Frontend Dashboard & Integration** | Dev 4 | Web dashboard, system integration, testing, demo orchestration | Admin interface, integration testing, demo scripts, backup systems |

### Architecture Decisions (Continuous Integration Focus)

#### System Architecture
```
┌──────────────────────────────────────────────┐
│              Snap Spectacles                 │
│         Lens Studio + TypeScript              │
│                  Dev 1                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Object   │ │    AR    │ │ Gesture  │   │
│  │Detection │ │ Overlays │ │ Handler  │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────┘
											│
											▼
┌──────────────────────────────────────────────┐
│         AI & Voice Processing                │
│     Gemini + ElevenLabs Voice Agents + Advanced Conversational AI               │
│                  Dev 2                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Visual  │ │  Voice   │ │ Context  │   │
│  │    AI    │ │Synthesis │ │ Memory   │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────┘
											│
											▼
┌──────────────────────────────────────────────┐
│              Backend Services                │
│         Node.js + Express + TypeScript       │
│                  Dev 3                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Calendar │ │  Chroma  │ │  Health  │   │
│  │    API   │ │ Vector   │ │   Data   │   │
│  │          │ │   DB     │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────────────────────────────┘
				 │              │              │
┌──────────────────────────────────────────────┐
│            CI/CD Pipeline                    │
│     GitHub Actions + Testing + Deploy       │
│                  Dev 4                       │
└──────────────────────────────────────────────┘
```

### Continuous Integration Timeline

#### Merge Schedule (Tight Integration)
```
Hour 0-6:   Core Foundation
├── Dev 1: Basic Lens Studio setup + object detection
├── Dev 2: Gemini API integration + basic voice
├── Dev 3: Backend API structure + Chroma setup
└── Dev 4: CI/CD pipeline + testing framework

Hour 6-12:  Feature Integration  
├── Merge #1: Object detection + basic AR overlays
├── Dev 2: Voice synthesis + conversational logic
├── Dev 3: Calendar integration + health data
└── Dev 4: Integration testing + error handling

Hour 12-18: Advanced Features
├── Merge #2: Voice + AI + backend data flow
├── Dev 1: Gesture recognition + advanced AR UI
├── Dev 2: Context memory + learning simulation
└── Dev 3: External API integrations

Hour 18-24: Demo Polish
├── Merge #3: Full feature integration
├── All: Demo script optimization
├── Dev 4: Performance tuning + reliability
└── Merge #4: Demo-ready version

Hour 24-30: Testing & Refinement
├── End-to-end testing in demo environment
├── Edge case handling + fallback systems
├── Demo rehearsal + timing optimization
└── Merge #5: Final tested version

Hour 30-36: Demo Preparation
├── Final demo environment setup
├── Backup systems + contingency plans
├── Demo presentation preparation
└── Final deployment + go-live
```

### Technology Stack

#### AR Frontend (Dev 1)
```typescript
// Snap Spectacles + Lens Studio
{
	"platform": "Snap Spectacles",
	"development": "Lens Studio 5.13+",
	"language": "TypeScript",
	"apis": ["Object Detection", "Spatial Anchors", "Hand Tracking"],
	"rendering": "ARCore + Spectacles Display"
}
```

#### AI & Voice (Dev 2)  
```typescript
{
	"multimodal": "Gemini API",
	"voice_synthesis": "ElevenLabs API",
	"conversational_ai": "ElevenLabs Voice Agents + advanced conversational AI", 
	"processing": "Real-time streaming",
	"context": "Conversation history + visual analysis"
}
```

#### Backend (Dev 3)
```typescript
{
	"runtime": "Node.js 20 LTS",
	"framework": "Express + TypeScript",
	"vector_db": "Chroma",
	"cache": "Redis",
	"integrations": ["Google Calendar", "Health APIs"],
	"websocket": "Socket.io for real-time updates"
}
```

#### DevOps (Dev 4)
```typescript
{
	"ci_cd": "GitHub Actions",
	"testing": "Jest + Playwright",
	"monitoring": "Real-time health checks",
	"deployment": "Docker + Cloud hosting",
	"backup": "Automated fallback systems"
}
```

### Snap Spectacles Capabilities Analysis

Based on Lens Studio API documentation, key capabilities include:

#### Object Detection & Recognition
```typescript
// Available object detection APIs
- ObjectTracking: Real-time object recognition
- MLComponent: Machine learning model integration  
- DeviceTracking: Spatial positioning
- HandTracking: Gesture recognition
- SceneUnderstanding: Environment mapping
```

#### AR Rendering & Interaction
```typescript
// AR overlay capabilities
- RenderMeshVisual: 3D object rendering
- Text: AR text overlays with styling
- Image: 2D image overlays
- Animation: Movement and transitions
- Audio: Spatial audio integration
```

#### Real-time Processing
```typescript
// Performance considerations
- UpdateEvent: 60fps update loop
- LateUpdateEvent: Post-processing
- CameraTextureProvider: Live camera feed
- RemoteServiceModule: External API integration
```

### API Integration Strategy

#### Primary APIs (Critical)
1. **Snap Spectacles SDK** - AR foundation + object detection
2. **Gemini API** - Multimodal AI for visual + text understanding  
3. **ElevenLabs** - Natural voice synthesis
4. **Chroma** - Vector embeddings for contextual memory

#### Secondary APIs (High Priority)
5. **ElevenLabs Voice Agents** - Advanced conversational AI integration
6. **Google Calendar** - Schedule integration
7. **Health APIs** - Basic health data integration

#### Bonus APIs (If Time Permits)
8. **Bluetooth APIs** - Speaker integration
9. **Fetch.ai** - Autonomous task agents
10. **Promise API** - Social good integration

### Learning System Architecture

#### Chroma Integration for Adaptive Learning
```typescript
interface UserContext {
  routine_patterns: {
    wake_time: string;
    medicine_schedule: string[];
    breakfast_preferences: string[];
    calendar_patterns: object;
  };
  object_locations: {
    keys: Vector3;
    medicine: Vector3;
    usual_positions: object;
  };
  interaction_history: {
    successful_suggestions: string[];
    ignored_recommendations: string[];
    preference_adjustments: object;
  };
}

// Simulated learning progression for demo
const learning_stages = {
  day_1: "Basic object recognition + generic suggestions",
  day_7: "Pattern recognition + personalized timing",
  day_30: "Predictive assistance + optimized routine"
};
```

---

## 8. Success Metrics

### Hackathon Judging Criteria

#### Technology Implementation (25% weight)
- ✅ Real AR object detection using Snap Spectacles native capabilities
- ✅ Working Gemini API integration for multimodal AI understanding
- ✅ Seamless voice synthesis and conversation through ElevenLabs Voice Agents + advanced conversational AI
- ✅ Functional adaptive learning through Chroma vector embeddings
- ✅ Clean CI/CD pipeline with continuous integration
- **Target Score: 24/25**

#### Originality & Innovation (20% weight)
- ✅ Novel application of AR to personal productivity and health
- ✅ Creative contextual intelligence based on object interaction
- ✅ Innovative demonstration of "learning over time" in constrained demo
- ✅ Unique integration of multiple advanced AI technologies
- **Target Score: 19/20**

#### Execution & Polish (20% weight)
- ✅ Flawless 2-minute live demo execution
- ✅ Professional AR interface with smooth interactions
- ✅ Reliable object recognition and spatial tracking
- ✅ Comprehensive error handling and fallback systems
- **Target Score: 20/20**

#### Completion & Functionality (15% weight)
- ✅ All core features working end-to-end
- ✅ Complete demo flow from medicine to departure
- ✅ Integration of 6+ major APIs and services
- ✅ Simulated learning progression demonstration
- **Target Score: 15/15**

#### Documentation & Presentation (10% weight)
- ✅ Comprehensive PRD and technical documentation
- ✅ Clear demonstration of architectural decisions
- ✅ Professional code organization and comments
- ✅ Compelling demo narrative and presentation
- **Target Score: 10/10**

#### Business Potential & Impact (10% weight)
- ✅ Clear market need and user value proposition
- ✅ Scalable architecture beyond morning routines
- ✅ Demonstration of practical AI assistant applications
- ✅ Path to production and commercialization
- **Target Score: 10/10**

**Total Target: 98/100**

### Technical Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Object Recognition Accuracy | >95% for demo objects | Testing in demo environment |
| AR Overlay Latency | <100ms from detection | Performance monitoring |
| Voice Response Time | <2s end-to-end | Timer from voice input to synthesis |
| Demo Reliability | 100% success rate | 10+ consecutive demo runs |
| API Integration Uptime | 99%+ during demo | Health check monitoring |
| CI/CD Pipeline Efficiency | <5min build+deploy | GitHub Actions metrics |

### Sponsor Track Coverage Metrics

| API/Technology | Integration Level | Expected Track Score |
|----------------|-------------------|---------------------|
| **Snap Spectacles** | Core AR platform | Primary track winner |
| **Gemini API** | Multimodal AI processing | High impact usage |
| **ElevenLabs** | Voice synthesis | Complete integration |
| **Chroma** | Vector embeddings | Advanced implementation |
| **ElevenLabs Voice Agents** | Advanced Conversational AI | Full integration |
| **Google Calendar** | Data integration | Functional usage |
| **Promise API** | Health/wellness focus | Potential bonus track |

### Demo Environment Success Criteria

#### Controlled Demo Setup
- **Object Recognition**: 100% success rate for 5 demo objects
- **Spatial Tracking**: Stable AR overlays throughout 2-minute demo  
- **Voice Clarity**: Clear audio in large hall environment
- **Internet Connectivity**: Reliable API calls with <1s latency
- **Backup Systems**: Immediate fallback if primary systems fail

#### Audience Engagement Metrics
- **Judge Attention**: Maintain engagement throughout full demo
- **Question Quality**: Technical questions indicating understanding
- **Demo Flow**: Complete all 5 demo stages within 2 minutes
- **Error Recovery**: Graceful handling of any technical issues

### Learning System Demonstration

#### Simulated Adaptation Showcase
- **Day 1 vs Day 30**: Clear progression in personalization
- **Pattern Recognition**: Demonstrated understanding of user habits
- **Contextual Intelligence**: Increasingly relevant suggestions
- **Memory Persistence**: Consistent object location tracking

---

## 9. Edge Cases & Error Handling

### Critical Path Protection

The demo flow MUST work flawlessly. All error handling focuses on this path:

```typescript
// Demo flow with comprehensive error handling
class DemoFlowProtection {
	private readonly criticalPath = [
		'upload', 'encrypt', 'pin', 'commit', 'generateProof', 'verify'
	];
	// Implementation omitted for brevity
}
```

### Network & Wallet Failures

#### Wallet Connection Issues
```typescript
enum WalletError {
	NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
	CONNECT_FAILED = 'WALLET_CONNECT_FAILED',
	TIMEOUT = 'WALLET_TIMEOUT',
	INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'
}

const walletErrorHandlers: Record<WalletError, () => void> = {
	[WalletError.NOT_INSTALLED]: () => { /* show install instructions */ },
	[WalletError.CONNECT_FAILED]: () => { /* show retry modal */ },
	[WalletError.TIMEOUT]: () => { /* fallback to polling */ },
	[WalletError.INSUFFICIENT_FUNDS]: () => { /* show funding instructions */ }
};
```

#### IPFS Failures

```typescript
class IPFSService {
	async upload(data: Buffer): Promise<string> {
		// Retry strategy with exponential backoff
		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				const cid = await this.client.add(data);
				return cid.toString();
			} catch (err) {
				if (attempt === 3) throw err;
				await sleep(attempt * 500);
			}
		}
		throw new Error('IPFS upload failed');
	}
}
```

---

## 10. Implementation Priority & Timeline

### 36-Hour Development Sprint

#### Phase 1: Foundation (Hours 0-6)
**Dev 1 (AR Core):**
- Setup Lens Studio project with TypeScript
- Implement basic object detection for 5 demo objects
- Create spatial anchor system for stable tracking
- Basic AR overlay rendering system

**Dev 2 (AI & Voice):**
- Gemini API integration and authentication
- ElevenLabs voice synthesis setup
- Basic voice input processing and conversational logic
- Simple conversational response logic

**Dev 3 (Backend):**
- Express API server with TypeScript
- Chroma vector database setup and configuration
- Google Calendar API integration
- Basic health data structure and storage

**Dev 4 (Frontend Dashboard & Integration):**
- Web-based admin dashboard for demo control
- System integration testing and validation
- Demo script automation and backup systems
- Real-time monitoring and health checks

**All Developers (Shared CI/CD Responsibility):**
- Each dev owns their own deployment pipeline
- Automated testing for their respective components
- Self-service merge and deployment capabilities
- Shared responsibility for integration issues

**Merge #1 (Hour 6):** Basic foundation integration test

#### Phase 2: Core Features (Hours 6-12)
**Dev 1 (AR Core):**
- Hand gesture recognition for object interaction
- Advanced AR UI components (text, arrows, panels)
- Object-specific overlay templates
- Spatial audio integration for voice feedback

**Dev 2 (AI & Voice):**
- Multimodal processing (visual + text context)
- Context-aware conversation management with ElevenLabs Voice Agents
- Object-specific AI response generation
- Voice command parsing and intent recognition

**Dev 3 (Backend):**
- Real-time WebSocket connections
- Calendar data processing and briefing generation
- Medicine scheduling and reminder system
- Nutrition analysis and recipe suggestions

**Dev 4 (Frontend Dashboard & Integration):**
- Web dashboard for demo control and monitoring
- Cross-system integration testing and validation  
- Demo automation scripts and backup interfaces
- Real-time system health monitoring

**Shared CI/CD Approach:**
- Each developer maintains their own deployment pipeline
- Automated testing integrated into individual workflows
- Self-service merge capabilities with automated validation
- Collective responsibility for integration and demo reliability

**Merge #2 (Hour 12):** Core feature integration + testing

#### Phase 3: Intelligence & Learning (Hours 12-18)
**Dev 1 (AR Core):**
- Contextual AR interface adaptations
- Improved gesture recognition accuracy
- Environmental lighting adjustments
- Demo-specific optimizations

**Dev 2 (AI & Voice):**
- Chroma integration for contextual memory
- Learning simulation system ("Day 1 vs Day 30")
- Personalized suggestion algorithms
- Advanced conversation context management with ElevenLabs Voice Agents

**Dev 3 (Backend):**
- User preference learning and storage
- Object location tracking and prediction
- Calendar pattern analysis
- Health data trend processing

**Dev 4 (Frontend Dashboard & Integration):**
- Demo control dashboard and admin interface
- System integration coordination and testing
- Backup demonstration systems and fallback interfaces
- Real-time monitoring and demo orchestration tools

**Distributed CI/CD Model:**
- Each developer owns their component's pipeline and deployment
- Automated testing and validation at component level
- Self-service integration with shared testing environments
- Collaborative approach to demo reliability and system integration

**Merge #3 (Hour 18):** Full AI integration + learning systems

#### Phase 4: Demo Polish (Hours 18-24)
**All Developers:**
- Demo script optimization and timing
- Edge case handling and error recovery
- Performance tuning for demo environment
- User experience refinement

**Demo Flow Rehearsal:**
1. Medicine reminder demonstration
2. Breakfast assistance showcase
3. Calendar briefing presentation
4. Key location guidance
5. Departure checklist completion

**Merge #4 (Hour 24):** Demo-ready release candidate

#### Phase 5: Testing & Reliability (Hours 24-30)
**Testing Focus:**
- End-to-end demo flow validation
- Fallback system verification
- Performance under demo conditions
- Integration reliability testing

**Demo Environment Setup:**
- Controlled lighting configuration
- Object placement standardization
- Audio system testing in large hall
- Internet connectivity verification

**Merge #5 (Hour 30):** Production-ready demo version

#### Phase 6: Final Preparation (Hours 30-36)
**Final Activities:**
- Demo environment calibration
- Presenter training and script finalization
- Backup demonstration preparation
- Last-minute bug fixes and optimizations

**Go-Live Checklist:**
- [ ] All 5 objects reliably detected
- [ ] Voice synthesis working in hall acoustics
- [ ] Internet connectivity stable
- [ ] Backup systems ready
- [ ] Demo timing under 2 minutes
- [ ] All team members trained on demo

### Daily Standup Schedule

#### Every 6 Hours (Tight Feedback Loop)
- **Status Review**: Current progress vs timeline
- **Blocker Resolution**: Immediate issue addressing
- **Integration Planning**: Next merge preparation
- **Risk Assessment**: Potential demo issues

#### Integration Points
- **Hour 6**: Foundation + basic object detection
- **Hour 12**: Core features + AI integration
- **Hour 18**: Learning systems + advanced features
- **Hour 24**: Demo polish + reliability
- **Hour 30**: Final testing + optimization
- **Hour 36**: Go-live readiness

### Critical Path Dependencies

```mermaid
gantt
    title SnapJarvis Development Timeline
    dateFormat HH
    axisFormat %H

    section AR Core
    Lens Studio Setup     :00, 3h
    Object Detection      :3h, 6h
    AR Overlays          :6h, 9h
    Gesture Recognition  :9h, 12h
    Demo Polish          :12h, 24h

    section AI & Voice
    Gemini Integration   :00, 6h
    Voice Synthesis      :6h, 9h
    Context Memory       :9h, 15h
    Learning System      :15h, 24h

    section Backend
    API Server           :00, 6h
    Chroma Setup         :6h, 12h
    Calendar Integration :12h, 18h
    Data Processing      :18h, 24h

    section CI/CD
    Pipeline Setup       :00, 6h
    Testing Framework    :6h, 12h
    Demo Environment     :12h, 30h
    Final Deployment     :30h, 36h
```

### Risk Mitigation Timeline

#### High-Risk Items (Address First)
- **Object Detection Reliability** (Hours 0-12)
- **Voice Synthesis in Hall** (Hours 6-18)
- **API Integration Stability** (Hours 12-24)
- **Demo Environment Setup** (Hours 24-36)

#### Backup Plan Activation Points
- **Hour 18**: If core features not working, activate simplified demo
- **Hour 30**: If AI features unstable, use pre-recorded responses
- **Hour 35**: If live demo risky, prepare recorded demonstration

---

## 11. Open Questions

1. What exact variant encodings will labs provide? (VCF subset or custom JSON?)
2. Will we accept multiple proof formats (Groth16, PLONK) or standardize on Compact?
3. Which wallets will be used for demo participants (Lace, MetaMask, others)?
4. Do we need formal IRB approval for research demo participants?
5. What datasets are allowed for demo (synthetic vs. real)?

---

## 12. Development Resources

### Useful Links
- Midnight docs: https://docs.midnight.network
- Compact language reference: /compact docs/
- IPFS docs: https://docs.ipfs.tech
- Zod validation: https://zod.dev

### Demo Data

Provide small JSON files with variant markers for:
- BRCA1 (positive/negative)
- BRCA2 (positive/negative)
- CYP2D6 metabolizer statuses

---

## 13. Risk Mitigation

1. Proof Generation Slowness: Use worker queues and cache proofs in Redis to avoid blocking the frontend
2. IPFS Unavailability: Pin to multiple gateways and provide offline fallback data in demo
3. Wallet Issues: Provide recorded wallet interactions and a fallback 'demo account' login
4. Regulatory Concerns: Use synthetic/demo data and clearly label in the demo

---

## 14. Development Setup Instructions

1. Install compact compiler and add to PATH
```bash
export PATH="$PWD/compactc_v0.25.0_aarch64-darwin:$PATH"
compactc --version
```

2. Install Node.js dependencies
```bash
npm install
```

3. Frontend: run dev server
```bash
cd frontend
npm run dev
```

4. Backend: run server
```bash
cd backend
npm run dev
```

5. Contracts: compile and test
```bash
cd contracts
npm run build
npm test
```

---

## 15. Appendices

### Appendix A: Demo Object Recognition Schema

```typescript
interface DemoObject {
  id: string;
  name: string;
  detection_confidence: number;
  spatial_position: Vector3;
  last_interaction: timestamp;
  associated_actions: string[];
}

// Demo Objects Configuration
const DEMO_OBJECTS = {
  breakfast_bowl: {
    triggers: ["nutrition_analysis", "recipe_suggestions", "calorie_tracking"],
    ai_context: "Breakfast and nutrition guidance",
    voice_prompts: ["What's for breakfast?", "Show nutrition info", "Suggest healthy options"]
  },
  laptop: {
    triggers: ["calendar_briefing", "meeting_prep", "day_overview"],
    ai_context: "Work and scheduling assistance", 
    voice_prompts: ["What's on my schedule?", "Brief me on today", "Show my meetings"]
  },
  keys: {
    triggers: ["departure_checklist", "location_tracking", "reminder_alerts"],
    ai_context: "Departure preparation and location memory",
    voice_prompts: ["Where are my keys?", "Ready to leave", "Show departure checklist"]
  },
  medicine_bottle: {
    triggers: ["medication_reminders", "health_tracking", "schedule_alerts"],
    ai_context: "Health and medication management",
    voice_prompts: ["Medicine reminder", "Show health schedule", "Track medication"]
  },
  phone: {
    triggers: ["connectivity_check", "backup_interface", "device_sync"],
    ai_context: "Device integration and backup systems",
    voice_prompts: ["Check connectivity", "Sync devices", "Backup mode"]
  }
};
```

### Appendix B: Snap Spectacles API Integration

```typescript
// Core Lens Studio Components
import {
  ObjectTracking,
  MLComponent, 
  DeviceTracking,
  HandTracking,
  SceneUnderstanding,
  RemoteServiceModule
} from 'LensStudio';

// Object Detection Implementation
class SnapObjectDetector {
  private objectTracker: ObjectTracking;
  private mlComponent: MLComponent;
  
  async detectDemoObjects(): Promise<DemoObject[]> {
    // Leverage Snap's built-in object detection
    const detectedObjects = await this.objectTracker.getAllTrackedObjects();
    return this.filterDemoObjects(detectedObjects);
  }
  
  private filterDemoObjects(objects: TrackedObject[]): DemoObject[] {
    return objects.filter(obj => 
      DEMO_OBJECTS.hasOwnProperty(obj.classification)
    );
  }
}

// AR Overlay System
class AROverlayManager {
  renderContextualInfo(object: DemoObject, aiResponse: string): void {
    const overlay = this.createOverlay({
      position: object.spatial_position,
      content: aiResponse,
      style: this.getObjectSpecificStyle(object.name)
    });
    
    this.scene.addChild(overlay);
  }
}
```

### Appendix C: Gemini API Integration Strategy

```typescript
// Multimodal AI Processing
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
    
    const response = await this.geminiAPI.generateContent({
      model: "gemini-pro-vision",
      prompt: prompt,
      context: this.buildSystemContext()
    });
    
    return this.parseResponse(response);
  }
  
  private buildSystemContext(): string {
    return `
    You are SnapJarvis, an AR morning assistant. You help users with:
    - Medicine reminders and health tracking
    - Nutrition analysis and recipe suggestions  
    - Calendar management and meeting preparation
    - Object location and departure assistance
    
    Respond naturally and concisely. Focus on actionable guidance.
    Consider the time of day and user's routine patterns.
    `;
  }
}
```

### Appendix D: Learning System Implementation

```typescript
// Chroma Vector Database Integration
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

class AdaptiveLearningEngine {
  private chroma: ChromaClient;
  
  async updateUserProfile(
    interaction: UserInteraction,
    outcome: InteractionOutcome
  ): Promise<void> {
    
    const embedding = await this.generateEmbedding(interaction);
    
    await this.chroma.upsert({
      collection_name: "user_interactions",
      embeddings: [embedding],
      metadata: {
        timestamp: interaction.timestamp,
        object_type: interaction.object,
        success: outcome.success,
        user_feedback: outcome.feedback
      }
    });
    
    await this.updatePersonalizationModel(interaction, outcome);
  }
  
  async generatePersonalizedSuggestion(
    context: InteractionContext
  ): Promise<PersonalizedSuggestion> {
    
    const similarInteractions = await this.chroma.query({
      collection_name: "user_interactions",
      query_embeddings: [context.embedding],
      n_results: 10
    });
    
    return this.synthesizePersonalizedResponse(
      context,
      similarInteractions
    );
  }
}
```

### Appendix E: Demo Environment Setup

```yaml
# Demo Configuration
demo_environment:
  physical_setup:
    desk_dimensions: "6ft x 3ft"
    lighting: "Controlled LED panels, 5000K, 800 lux"
    background: "Neutral backdrop, minimal distractions"
    
  object_placement:
    breakfast_bowl: 
      position: "Center-left, 12 inches from edge"
      contents: "Colorful cereal or fruit for visual recognition"
    laptop:
      position: "Center-right, open at 45-degree angle"
      screen: "Display calendar or work interface"
    keys:
      position: "Far left corner, consistent placement"
      type: "Standard keyring with multiple keys"
    medicine_bottle:
      position: "Back-left, clearly labeled prescription bottle"
      contents: "Visible pills or vitamins"
    phone:
      position: "Right side, face-up, screen visible"
      state: "Powered on, showing home screen"
      
  technical_setup:
    internet: "Dedicated 100Mbps connection with backup 5G hotspot"
    audio: "Wireless microphone system for presenter"
    spectacles: "Fully charged, firmware updated, paired devices"
    backup_systems: "Secondary Spectacles unit, offline demo mode"
    
demo_script:
  total_duration: "2 minutes"
  segments:
    medicine_reminder: "20 seconds - Show proactive health assistance"
    breakfast_analysis: "30 seconds - Nutrition tracking and suggestions"
    calendar_briefing: "25 seconds - Day overview and meeting prep" 
    key_location: "20 seconds - Object finding and spatial memory"
    departure_checklist: "15 seconds - Final preparation assistance"
    conclusion: "10 seconds - Summary and Q&A transition"
```

### Appendix F: API Integration Checklist

```yaml
# Required API Integrations
snap_spectacles:
  status: "Primary platform"
  integration_level: "Native Lens Studio development"
  backup_plan: "Phone app demonstration if hardware fails"

gemini_api:
  status: "Core AI processing"
  integration_level: "Full multimodal processing"
  backup_plan: "Pre-generated responses for demo objects"

elevenlabs:
  status: "Voice synthesis"
  integration_level: "Real-time speech generation" 
  backup_plan: "Pre-recorded audio files"

chroma:
  status: "Learning system"
  integration_level: "Vector embeddings for personalization"
  backup_plan: "Simulated learning with static data"

elevenlabs_voice_agents:
  status: "Advanced Conversational AI"
  integration_level: "Full conversational AI integration with Voice Agents"
  backup_plan: "Basic voice commands only"

google_calendar:
  status: "Schedule integration"
  integration_level: "Read calendar events and generate briefings"
  backup_plan: "Mock calendar data for demo"
```

**Demo Checklist:**
- [ ] All 5 demo objects pre-trained and reliably detected
- [ ] Voice synthesis working in large hall acoustics  
- [ ] Internet connectivity stable with backup connection
- [ ] CI/CD pipeline deployed and monitoring active
- [ ] Learning system demonstrating personalization
- [ ] Backup systems tested and ready
- [ ] Demo timing rehearsed and under 2 minutes
- [ ] All team members trained on demo flow and troubleshooting

**Next Review:** Post-Hackathon Technical Retrospective

---
