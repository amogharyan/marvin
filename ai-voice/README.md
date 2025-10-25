# Dev 2 AI & Voice Integration Service

This service implements the AI & Voice integration for the Marvin AR Assistant, providing:

- **Gemini API Integration** - Visual understanding and natural language processing
- **ElevenLabs Voice Synthesis** - Natural voice generation
- **Eigenvalue Full Integration** - Conversational AI capabilities
- **Multimodal Processing** - Combined visual, voice, and contextual AI

## Phase 1 Implementation Status

✅ **Completed Tasks:**
- Gemini API integration and authentication
- ElevenLabs voice synthesis setup  
- Eigenvalue full integration for conversational AI
- Simple conversational response logic
- Project structure and configuration
- Express API server with endpoints

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the environment template:
```bash
cp env.example .env
```

Update `.env` with your API keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
EIGENVALUE_API_KEY=your_eigenvalue_api_key_here
```

### 3. Development
```bash
npm run dev
```

### 4. Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Object Detection Processing
```
POST /api/process-object
{
  "detectedObject": {
    "id": "bowl_001",
    "name": "breakfast_bowl",
    "detection_confidence": 0.95,
    "spatial_position": {"x": 0.5, "y": 0.3, "z": 1.2},
    "last_interaction": "2024-01-01T00:00:00Z",
    "associated_actions": ["nutrition_analysis", "recipe_suggestions"]
  },
  "userMessage": "What's for breakfast?",
  "conversationContext": {...}
}
```

### Voice Input Processing
```
POST /api/process-voice
{
  "voiceText": "Show me my schedule",
  "conversationContext": {...},
  "objectContext": {...}
}
```

### Visual Context Processing
```
POST /api/process-visual
{
  "imageData": "base64_encoded_image",
  "detectedObjects": [...]
}
```

### Proactive Assistance
```
POST /api/proactive-assistance
{
  "conversationContext": {...},
  "timeOfDay": "morning"
}
```

## Services Architecture

### GeminiService
- Visual understanding and analysis
- Object-specific AI responses
- Contextual prompt building
- Multimodal processing

### ElevenLabsService  
- Text-to-speech conversion
- Voice customization
- Context-aware voice generation
- Object-specific voice responses

### EigenvalueService
- Conversational AI processing
- Context memory management
- Proactive assistance generation
- Learning and adaptation

### AIVoiceIntegrationService
- Coordinates all AI services
- Handles multimodal processing
- Manages conversation flow
- Provides unified API interface

## Demo Objects Support

The service recognizes and provides contextual assistance for:

- **breakfast_bowl** - Nutrition analysis and recipe suggestions
- **laptop** - Calendar briefing and meeting preparation  
- **keys** - Departure checklist and location tracking
- **medicine_bottle** - Medication reminders and health tracking
- **phone** - Connectivity and device integration

## Integration with AR Client

This service communicates with:
- **AR Client** (Dev 1) - Receives object detection data
- **Backend Services** (Dev 3) - Shares conversation context and user data

## Development Notes

- All services include comprehensive error handling
- Fallback responses ensure demo reliability
- Health checks monitor service availability
- TypeScript provides type safety throughout
- Modular architecture enables easy testing and extension

## Next Steps (Phase 2)

- Advanced multimodal processing
- Context-aware conversation management  
- Object-specific AI response generation
- Voice command parsing and intent recognition
