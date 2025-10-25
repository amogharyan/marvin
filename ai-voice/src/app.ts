// Dev 2 AI & Voice Integration - Main Application Entry Point

import express from 'express';
import cors from 'cors';
import { AIVoiceIntegrationService } from './services/aiVoiceIntegrationService';
import { DemoObject, ConversationContext, VoiceRequest } from './types';
import { config } from './config';

const app = express();
const aiVoiceService = new AIVoiceIntegrationService();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthStatus = await aiVoiceService.healthCheck();
    res.json({
      status: healthStatus.overall ? 'healthy' : 'degraded',
      services: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Object detection processing endpoint
app.post('/api/process-object', async (req, res) => {
  try {
    const { detectedObject, userMessage, conversationContext } = req.body;
    
    if (!detectedObject) {
      return res.status(400).json({ error: 'detectedObject is required' });
    }

    const response = await aiVoiceService.processObjectDetection(
      detectedObject,
      userMessage,
      conversationContext
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Object processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Voice input processing endpoint
app.post('/api/process-voice', async (req, res) => {
  try {
    const { voiceText, conversationContext, objectContext } = req.body;
    
    if (!voiceText) {
      return res.status(400).json({ error: 'voiceText is required' });
    }

    const response = await aiVoiceService.processVoiceInput(
      voiceText,
      conversationContext,
      objectContext
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Advanced multimodal processing endpoint (Phase 2)
app.post('/api/process-multimodal', async (req, res) => {
  try {
    const { imageData, voiceText, conversationContext, objectContext, mimeType } = req.body;
    
    if (!imageData || !voiceText) {
      return res.status(400).json({ error: 'imageData and voiceText are required' });
    }

    const response = await aiVoiceService.processMultimodalInput(
      imageData,
      voiceText,
      conversationContext,
      objectContext,
      mimeType
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Multimodal processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Visual context processing endpoint
app.post('/api/process-visual', async (req, res) => {
  try {
    const { imageData, detectedObjects, mimeType } = req.body;
    
    if (!imageData || !detectedObjects) {
      return res.status(400).json({ error: 'imageData and detectedObjects are required' });
    }

    const response = await aiVoiceService.processVisualContext(
      imageData,
      detectedObjects,
      mimeType
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Visual processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proactive assistance endpoint
app.post('/api/proactive-assistance', async (req, res) => {
  try {
    const { conversationContext, timeOfDay } = req.body;
    
    const response = await aiVoiceService.generateProactiveAssistance(
      conversationContext,
      timeOfDay || 'morning'
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Proactive assistance error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Voice synthesis endpoint (standalone)
app.post('/api/synthesize-voice', async (req, res) => {
  try {
    const { text, voiceId, settings } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const voiceRequest: VoiceRequest = {
      text,
      voice_id: voiceId,
      ...settings
    };

    // This would use ElevenLabs service directly
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        audio_url: 'placeholder_audio_url',
        duration: Math.ceil(text.length / 10),
        format: 'mp3'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Voice synthesis error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Demo endpoints for testing
app.get('/api/demo/objects', (req, res) => {
  const demoObjects: DemoObject[] = [
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
  ];

  res.json({
    success: true,
    data: demoObjects,
    timestamp: new Date().toISOString()
  });
});

// ==================== PHASE 3 ENDPOINTS ====================

// Advanced conversational AI endpoint
app.post('/api/conversational-ai', async (req, res) => {
  try {
    const { voiceText, sessionId, userId, objectContext, conversationHistory } = req.body;
    
    if (!voiceText || !sessionId || !userId) {
      return res.status(400).json({ error: 'voiceText, sessionId, and userId are required' });
    }

    const response = await aiVoiceService.processAdvancedConversationalRequest(
      voiceText,
      sessionId,
      userId,
      objectContext,
      conversationHistory
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Conversational AI error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Personalized suggestions endpoint
app.post('/api/personalized-suggestions', async (req, res) => {
  try {
    const { userId, context, objectContext } = req.body;
    
    if (!userId || !context) {
      return res.status(400).json({ error: 'userId and context are required' });
    }

    const response = await aiVoiceService.getPersonalizedSuggestions(
      userId,
      context,
      objectContext
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Personalized suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Learning insights for demo endpoint
app.get('/api/learning-insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const insights = aiVoiceService.getLearningInsightsForDemo(userId);

    res.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Learning insights error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simulate demo learning progression endpoint
app.post('/api/simulate-demo-progression', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await aiVoiceService.simulateDemoLearningProgression(userId);

    res.json({
      success: true,
      message: 'Demo learning progression simulated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Demo progression simulation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Synthetic AR Data Management (Demo)
app.get('/api/synthetic-data/summary', async (req, res) => {
  try {
    const summary = await aiVoiceService.getSyntheticDataSummary();
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Synthetic data summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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
  console.log('🎯 Phase 3 Features:');
  console.log(`   ✅ Chroma Vector Database Integration`);
  console.log(`   ✅ Learning Simulation System (Day 1 vs Day 30)`);
  console.log(`   ✅ Enhanced ElevenLabs Conversational AI Platform`);
  console.log(`   ✅ Personalized Suggestion Algorithms`);
  console.log(`   ✅ Contextual Memory & Pattern Recognition`);
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

export default app;
