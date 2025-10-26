// Dev 2 AI & Voice Integration - Main Application Entry Point
// Refactored with DRY endpoint factory for cleaner, more maintainable code

import express from 'express';
import cors from 'cors';
import { AIVoiceIntegrationService } from './services/aiVoiceIntegrationService';
import { DemoObject, ConversationContext, VoiceRequest } from './types';
import { config } from './config';
import { 
  createEndpoint, 
  createGetEndpoint, 
  createHealthEndpoint, 
  createDemoEndpoint,
  createValidatedEndpoint,
  validateRequestBody
} from './utils/endpointFactory';

const app = express();
let aiVoiceService: AIVoiceIntegrationService;

// Initialize the AI Voice Service
async function initializeService() {
  try {
    aiVoiceService = await AIVoiceIntegrationService.create();
    console.log('✅ AI Voice Service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize AI Voice Service:', error);
    process.exit(1);
  }
}

// For testing, initialize service immediately if in test environment
if (process.env.NODE_ENV === 'test') {
  initializeService().catch(error => {
    console.error('❌ Failed to initialize service for testing:', error);
  });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', createHealthEndpoint(
  () => aiVoiceService.getDetailedHealthStatus(),
  'Health Check'
));

// Object detection processing endpoint - using voice processing instead
app.post('/api/process-object', createEndpoint(
  (req) => aiVoiceService.processVoiceInput(
    req.body.userMessage || 'Object detected',
    req.body.conversationContext?.sessionId || 'default-session',
    req.body.conversationContext?.userId || 'default-user',
    req.body.detectedObject
  ),
  ['detectedObject'],
  'Object Processing'
));

// Voice input processing endpoint
app.post('/api/process-voice', createEndpoint(
  (req) => aiVoiceService.processVoiceInput(
    req.body.voiceText,
    req.body.conversationContext?.sessionId || 'default-session',
    req.body.conversationContext?.userId || 'default-user',
    req.body.objectContext
  ),
  ['voiceText'],
  'Voice Processing'
));

// Advanced multimodal processing endpoint (Phase 2)
app.post('/api/process-multimodal', createEndpoint(
  (req) => aiVoiceService.processMultimodalInput(
    req.body.voiceText,
    req.body.imageData,
    req.body.conversationContext?.sessionId || 'default-session',
    req.body.conversationContext?.userId || 'default-user',
    req.body.objectContext,
    req.body.conversationContext?.conversationHistory,
    req.body.mimeType
  ),
  ['imageData', 'voiceText'],
  'Multimodal Processing'
));

// Visual context processing endpoint
app.post('/api/process-visual', createEndpoint(
  (req) => aiVoiceService.processVisualContext(
    req.body.imageData,
    req.body.conversationContext?.sessionId || 'default-session',
    req.body.conversationContext?.userId || 'default-user',
    req.body.objectContext,
    req.body.mimeType
  ),
  ['imageData'],
  'Visual Processing'
));

// Proactive assistance endpoint - using personalized suggestions
app.post('/api/proactive-assistance', createEndpoint(
  (req) => aiVoiceService.getPersonalizedSuggestions(
    req.body.conversationContext?.userId || 'default-user',
    req.body.objectContext
  ),
  [],
  'Proactive Assistance'
));

// Voice synthesis endpoint (standalone)
app.post('/api/synthesize-voice', createEndpoint(
  (req) => {
    const voiceRequest: VoiceRequest = {
      text: req.body.text,
      voice_id: req.body.voiceId,
      ...req.body.settings
    };

    // This would use ElevenLabs service directly
    // For now, return a placeholder response
    return Promise.resolve({
      audio_url: 'placeholder_audio_url',
      duration: Math.ceil(req.body.text.length / 10),
      format: 'mp3'
    });
  },
  ['text'],
  'Voice Synthesis'
));

// Demo endpoints for testing
app.get('/api/demo/objects', createDemoEndpoint(
  () => [
    {
      id: 'bowl_001',
      name: 'breakfast_bowl',
      detection_confidence: 0.95,
      spatial_position: { x: 0.5, y: 0.3, z: 1.2 },
      last_interaction: new Date(),
      associated_actions: ['nutrition_analysis', 'recipe_suggestions']
    },
    {
      id: 'laptop_001',
      name: 'laptop',
      detection_confidence: 0.92,
      spatial_position: { x: -0.3, y: 0.4, z: 1.5 },
      last_interaction: new Date(),
      associated_actions: ['calendar_briefing', 'meeting_prep']
    },
    {
      id: 'keys_001',
      name: 'keys',
      detection_confidence: 0.88,
      spatial_position: { x: -0.8, y: 0.1, z: 0.8 },
      last_interaction: new Date(),
      associated_actions: ['departure_checklist', 'location_tracking']
    }
  ] as DemoObject[],
  'Demo Objects'
));

// ==================== PHASE 3 ENDPOINTS ====================

// Advanced conversational AI endpoint
app.post('/api/conversational-ai', createEndpoint(
  (req) => aiVoiceService.processAdvancedConversationalRequest(
    req.body.voiceText,
    req.body.sessionId,
    req.body.userId,
    req.body.objectContext,
    req.body.conversationHistory
  ),
  ['voiceText', 'sessionId', 'userId'],
  'Conversational AI'
));

// Personalized suggestions endpoint
app.post('/api/personalized-suggestions', createEndpoint(
  (req) => aiVoiceService.getPersonalizedSuggestions(
    req.body.userId,
    req.body.objectContext
  ),
  ['userId'],
  'Personalized Suggestions'
));

// Learning insights for demo endpoint
app.get('/api/learning-insights/:userId', createGetEndpoint(
  (req) => aiVoiceService.getLearningInsightsForDemo(req.params.userId),
  'Learning Insights'
));

// Simulate demo learning progression endpoint
app.post('/api/simulate-demo-progression', createEndpoint(
  (req) => aiVoiceService.simulateDemoLearningProgression(req.body.userId),
  ['userId'],
  'Demo Progression Simulation'
));

// Synthetic AR Data Management (Demo)
app.get('/api/synthetic-data/summary', createGetEndpoint(
  () => aiVoiceService.getSyntheticDataSummary(),
  'Synthetic Data Summary'
));

// Letta Integration Endpoints (Phase 3)
app.post('/api/letta/sync', createEndpoint(
  (req) => aiVoiceService.syncToLetta(req.body.agentId, req.body.transcript, req.body.response, req.body.metadata),
  ['agentId', 'transcript', 'response']
));

app.post('/api/letta/context', createEndpoint(
  (req) => aiVoiceService.getLettaContext(req.body.agentId, req.body.objectContext),
  ['agentId']
));

app.post('/api/letta/search', createEndpoint(
  (req) => aiVoiceService.searchLettaPassages(req.body.agentId, req.body.query, req.body.limit || 5),
  ['agentId', 'query']
));

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = config.server.port;

async function startServer() {
  // Initialize the AI Voice Service first
  await initializeService();
  
  app.listen(PORT, () => {
    console.log('🚀 Dev 2 AI & Voice Integration Service Started - Phase 3');
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${config.server.environment}`);
    console.log(`   Gemini Model: ${config.gemini.model}`);
    console.log(`   ElevenLabs Voice: ${config.elevenlabs.voiceId}`);
    console.log('');
    console.log('📡 Available Endpoints:');
    console.log(`   GET  /health - Health check`);
    console.log(`   POST /api/process-object - Process object detection`);
    console.log(`   POST /api/process-voice - Process voice input`);
    console.log(`   POST /api/process-multimodal - Advanced multimodal processing (Phase 2)`);
    console.log(`   POST /api/process-visual - Process visual context`);
    console.log(`   POST /api/proactive-assistance - Generate proactive help`);
    console.log(`   POST /api/synthesize-voice - Voice synthesis`);
    console.log(`   GET  /api/demo/objects - Demo objects for testing`);
    console.log('');
    console.log('🧠 Phase 3 Endpoints (Learning & Personalization):');
    console.log(`   POST /api/conversational-ai - Advanced conversational AI with learning`);
    console.log(`   POST /api/personalized-suggestions - Get personalized suggestions`);
    console.log(`   GET  /api/learning-insights/:userId - Get learning insights for demo`);
    console.log(`   POST /api/simulate-demo-progression - Simulate demo learning progression`);
    console.log(`   GET  /api/synthetic-data/summary - Get synthetic AR data summary`);
    console.log('');
    console.log('🧠 Letta Integration Endpoints (Phase 3):');
    console.log(`   POST /api/letta/sync - Sync conversation to Letta Cloud`);
    console.log(`   POST /api/letta/context - Get conversation context from Letta`);
    console.log(`   POST /api/letta/search - Search Letta passages`);
    console.log('');
    console.log('🎯 Phase 3 Features:');
    console.log(`   ✅ Chroma Vector Database Integration`);
    console.log(`   ✅ Learning Simulation System (Day 1 vs Day 30)`);
    console.log(`   ✅ Enhanced ElevenLabs Conversational AI Platform`);
    console.log(`   ✅ Personalized Suggestion Algorithms`);
    console.log(`   ✅ Contextual Memory & Pattern Recognition`);
    console.log(`   ✅ Letta Cloud Stateful Agent Memory`);
    console.log('');
    console.log('🎯 Phase 2 Features:');
    console.log(`   ✅ Advanced multimodal processing (visual + voice + context)`);
    console.log(`   ✅ Context-aware conversation management`);
    console.log(`   ✅ Object-specific AI response generation`);
    console.log(`   ✅ Voice command parsing and intent recognition`);
    console.log(`   ✅ Personalized suggestion algorithms`);
    console.log(`   ✅ Advanced conversation context management`);
    console.log('');
    console.log('🎯 Ready for AR client integration!');
  });
}

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;