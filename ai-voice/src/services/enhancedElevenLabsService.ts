// Enhanced ElevenLabs Conversational AI Platform Integration - Dev 2 Phase 3
// Advanced conversational AI with context-aware responses

import { ElevenLabs } from '@elevenlabs/elevenlabs-js';
import { secureLog, errorLog, debugLog } from '../utils/secureLogger';
import { ConversationContext, DemoObject, ChatMessage } from '../types';
import { ChromaService } from './chromaService';
import { LearningSimulationService } from './learningSimulationService';
import { LEARNING_CONSTANTS } from '../constants/learningConstants';

export interface ConversationalAIRequest {
  voiceText: string;
  sessionId: string;
  userId: string;
  objectContext?: DemoObject;
  conversationHistory?: ChatMessage[];
  learningStage?: 'day_1' | 'day_7' | 'day_30';
}

export interface ConversationalAIResponse {
  text: string;
  audioUrl?: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
  suggestedActions: string[];
  learningInsights: {
    stage: 'day_1' | 'day_7' | 'day_30';
    personalizationLevel: number;
    nextMilestone: string;
  };
  context: {
    objectType?: string;
    timeOfDay: string;
    interactionType: string;
  };
}

export interface VoiceAgent {
  id: string;
  name: string;
  description: string;
  voiceId: string;
  modelId: string;
  systemPrompt: string;
  conversationConfig: {
    maxTurns: number;
    temperature: number;
    responseLength: 'short' | 'medium' | 'long';
  };
}

export class EnhancedElevenLabsService {
  private elevenlabs: any;
  private chromaService: ChromaService;
  private learningService: LearningSimulationService;
  private voiceAgents: Map<string, VoiceAgent> = new Map();
  private conversationSessions: Map<string, any> = new Map();

  constructor(chromaService: ChromaService, learningService: LearningSimulationService) {
    this.chromaService = chromaService;
    this.learningService = learningService;
    
    try {
      this.elevenlabs = new (ElevenLabs as any)({
        apiKey: process.env.ELEVENLABS_API_KEY || 'demo-key'
      });
      secureLog('🎤 Enhanced ElevenLabs Conversational AI Service initialized');
    } catch (error) {
      errorLog('Failed to initialize ElevenLabs client:', error);
      this.elevenlabs = null as any;
      secureLog('🎤 ElevenLabs Service running in mock mode');
    }

    this.initializeVoiceAgents();
  }

  /**
   * Initialize voice agents for different contexts
   */
  private initializeVoiceAgents(): void {
    // Morning Assistant Agent
    const morningAgent: VoiceAgent = {
      id: 'morning_assistant',
      name: 'Marvin Morning Assistant',
      description: 'Specialized assistant for morning routines and health management',
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice
      modelId: 'eleven_multilingual_v2',
      systemPrompt: `You are Marvin, an AR-powered morning assistant. You help users with:
- Medicine reminders and health tracking
- Nutrition analysis and breakfast suggestions
- Calendar management and meeting preparation
- Object location and departure assistance

You are context-aware, learning from user interactions, and provide personalized assistance.
Current learning stage: {learning_stage}
User preferences: {user_preferences}
Object context: {object_context}

Respond naturally, concisely, and focus on actionable guidance.`,
      conversationConfig: {
        maxTurns: 10,
        temperature: LEARNING_CONSTANTS.ELEVENLABS.TEMPERATURE.BALANCED,
        responseLength: 'medium'
      }
    };

    // Health Specialist Agent
    const healthAgent: VoiceAgent = {
      id: 'health_specialist',
      name: 'Health & Wellness Specialist',
      description: 'Focused on health, medication, and wellness guidance',
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella voice
      modelId: 'eleven_multilingual_v2',
      systemPrompt: `You are a health and wellness specialist integrated into Marvin's AR system.
You help with:
- Medication reminders and scheduling
- Health data tracking and insights
- Wellness recommendations
- Medical appointment preparation

Always remind users that this is demo software and not medical advice.
Learning stage: {learning_stage}
Health context: {health_context}`,
      conversationConfig: {
        maxTurns: 8,
        temperature: LEARNING_CONSTANTS.ELEVENLABS.TEMPERATURE.CONSERVATIVE,
        responseLength: 'short'
      }
    };

    // Productivity Agent
    const productivityAgent: VoiceAgent = {
      id: 'productivity_coach',
      name: 'Productivity Coach',
      description: 'Calendar management and productivity optimization',
      voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold voice
      modelId: 'eleven_multilingual_v2',
      systemPrompt: `You are a productivity coach helping users optimize their morning routine.
You assist with:
- Calendar management and meeting preparation
- Task prioritization and scheduling
- Routine optimization suggestions
- Time management tips

Learning stage: {learning_stage}
Calendar context: {calendar_context}`,
      conversationConfig: {
        maxTurns: 12,
        temperature: LEARNING_CONSTANTS.ELEVENLABS.TEMPERATURE.CREATIVE,
        responseLength: 'medium'
      }
    };

    this.voiceAgents.set('morning_assistant', morningAgent);
    this.voiceAgents.set('health_specialist', healthAgent);
    this.voiceAgents.set('productivity_coach', productivityAgent);

    debugLog(`Initialized ${this.voiceAgents.size} voice agents`);
  }

  /**
   * Process conversational AI request with context awareness
   */
  public async processConversationalRequest(
    request: ConversationalAIRequest
  ): Promise<ConversationalAIResponse> {
    try {
      // Determine appropriate voice agent based on context
      const agent = this.selectVoiceAgent(request);
      
      // Get learning insights
      const learningInsights = await this.getLearningInsights(request.userId);
      
      // Build contextual prompt
      const contextualPrompt = await this.buildContextualPrompt(request, agent, learningInsights);
      
      // Process with ElevenLabs Conversational AI Platform
      const response = await this.processWithElevenLabs(request, agent, contextualPrompt);
      
      // Generate audio if needed
      const audioUrl = await this.generateAudio(response.text, agent.voiceId);
      
      // Extract intent and entities
      const { intent, entities } = await this.extractIntentAndEntities(request.voiceText, request.objectContext);
      
      // Generate suggested actions
      const suggestedActions = await this.generateSuggestedActions(intent, entities, request.objectContext);
      
      // Store conversation context
      await this.storeConversationContext(request, response);
      
      return {
        text: response.text,
        audioUrl,
        confidence: response.confidence,
        intent,
        entities,
        suggestedActions,
        learningInsights,
        context: {
          objectType: request.objectContext?.name,
          timeOfDay: this.getTimeOfDay(),
          interactionType: this.determineInteractionType(request)
        }
      };
    } catch (error) {
      errorLog('Failed to process conversational request:', error);
      return this.generateFallbackResponse(request);
    }
  }

  /**
   * Select appropriate voice agent based on context
   */
  private selectVoiceAgent(request: ConversationalAIRequest): VoiceAgent {
    const { voiceText, objectContext } = request;
    const lowerText = voiceText.toLowerCase();
    
    // Health-related queries
    if (lowerText.includes('medicine') || lowerText.includes('health') || 
        lowerText.includes('medication') || objectContext?.name === 'medicine_bottle') {
      return this.voiceAgents.get('health_specialist')!;
    }
    
    // Productivity-related queries
    if (lowerText.includes('schedule') || lowerText.includes('calendar') || 
        lowerText.includes('meeting') || objectContext?.name === 'laptop') {
      return this.voiceAgents.get('productivity_coach')!;
    }
    
    // Default to morning assistant
    return this.voiceAgents.get('morning_assistant')!;
  }

  /**
   * Get learning insights for user
   */
  private async getLearningInsights(userId: string): Promise<{
    stage: 'day_1' | 'day_7' | 'day_30';
    personalizationLevel: number;
    nextMilestone: string;
  }> {
    try {
      const summary = this.learningService.getLearningProgressionSummary(userId);
      return {
        stage: summary.currentStage.stage,
        personalizationLevel: summary.currentStage.personalizationLevel,
        nextMilestone: summary.nextMilestone
      };
    } catch (error) {
      debugLog('Failed to get learning insights, using defaults:', error);
      return {
        stage: 'day_1',
        personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_1,
        nextMilestone: 'Complete 5 interactions to unlock pattern recognition'
      };
    }
  }

  /**
   * Build contextual prompt for ElevenLabs
   */
  private async buildContextualPrompt(
    request: ConversationalAIRequest,
    agent: VoiceAgent,
    learningInsights: any
  ): Promise<string> {
    let prompt = agent.systemPrompt;
    
    // Replace placeholders with actual context
    prompt = prompt.replace('{learning_stage}', learningInsights.stage);
    prompt = prompt.replace('{personalization_level}', learningInsights.personalizationLevel.toString());
    
    // Add object context
    if (request.objectContext) {
      prompt = prompt.replace('{object_context}', 
        `User is interacting with ${request.objectContext.name}. ` +
        `Object confidence: ${request.objectContext.detection_confidence}. ` +
        `Spatial position: ${JSON.stringify(request.objectContext.spatial_position)}`
      );
    } else {
      prompt = prompt.replace('{object_context}', 'No specific object context');
    }
    
    // Add conversation history
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      const historyText = request.conversationHistory
        .slice(-3) // Last 3 messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      prompt += `\n\nRecent conversation:\n${historyText}`;
    }
    
    // Add current user input
    prompt += `\n\nUser says: "${request.voiceText}"`;
    
    return prompt;
  }

  /**
   * Process request with ElevenLabs Conversational AI Platform
   */
  private async processWithElevenLabs(
    request: ConversationalAIRequest,
    agent: VoiceAgent,
    prompt: string
  ): Promise<ConversationalAIResponse> {
    if (!this.elevenlabs) {
      // Mock response for demo
      return this.generateMockResponse(request, agent);
    }

    try {
      // Use ElevenLabs Conversational AI Platform
      const response = await this.elevenlabs.conversationalAI.generate({
        agentId: agent.id,
        message: request.voiceText,
        context: {
          systemPrompt: prompt,
          conversationHistory: request.conversationHistory || [],
          userId: request.userId,
          sessionId: request.sessionId
        }
      });

      return {
        text: response.message,
        audioUrl: undefined,
        confidence: response.confidence || LEARNING_CONSTANTS.CONFIDENCE.ELEVENLABS_SUCCESS,
        intent: 'general_query',
        entities: {},
        suggestedActions: ['Get help', 'Show options'],
        learningInsights: {
          stage: 'day_1',
          personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_1,
          nextMilestone: 'Complete 5 interactions to unlock pattern recognition'
        },
        context: {
          objectType: request.objectContext?.name,
          timeOfDay: this.getTimeOfDay(),
          interactionType: 'elevenlabs'
        }
      };
    } catch (error) {
      errorLog('ElevenLabs API call failed:', error);
      return this.generateMockResponse(request, agent);
    }
  }

  /**
   * Generate audio from text using ElevenLabs
   */
  private async generateAudio(text: string, voiceId: string): Promise<string | undefined> {
    if (!this.elevenlabs) {
      debugLog('ElevenLabs not available, skipping audio generation');
      return undefined;
    }

    try {
      const audio = await this.elevenlabs.generate({
        voice: voiceId,
        text: text,
        model_id: 'eleven_multilingual_v2'
      });

      // Convert audio to URL (in real implementation, you'd save to storage)
      return `data:audio/mpeg;base64,${audio.toString('base64')}`;
    } catch (error) {
      errorLog('Failed to generate audio:', error);
      return undefined;
    }
  }

  /**
   * Extract intent and entities from voice text
   */
  private async extractIntentAndEntities(
    voiceText: string,
    objectContext?: DemoObject
  ): Promise<{ intent: string; entities: Record<string, any> }> {
    const lowerText = voiceText.toLowerCase();
    
    // Intent detection
    let intent = 'general_query';
    if (lowerText.includes('medicine') || lowerText.includes('medication')) {
      intent = 'medicine_reminder';
    } else if (lowerText.includes('breakfast') || lowerText.includes('food')) {
      intent = 'nutrition_info';
    } else if (lowerText.includes('schedule') || lowerText.includes('calendar')) {
      intent = 'schedule_check';
    } else if (lowerText.includes('keys') || lowerText.includes('location')) {
      intent = 'location_assistance';
    } else if (lowerText.includes('phone') || lowerText.includes('device')) {
      intent = 'device_management';
    }
    
    // Entity extraction
    const entities: Record<string, any> = {};
    if (objectContext) {
      entities.object = objectContext.name;
      entities.confidence = objectContext.detection_confidence;
    }
    
    // Time entities
    if (lowerText.includes('morning')) entities.time = 'morning';
    if (lowerText.includes('afternoon')) entities.time = 'afternoon';
    if (lowerText.includes('evening')) entities.time = 'evening';
    
    return { intent, entities };
  }

  /**
   * Generate suggested actions based on intent and context
   */
  private async generateSuggestedActions(
    intent: string,
    entities: Record<string, any>,
    objectContext?: DemoObject
  ): Promise<string[]> {
    const actions: string[] = [];
    
    switch (intent) {
      case 'medicine_reminder':
        actions.push('Show medicine schedule', 'Set reminder', 'Track medication');
        break;
      case 'nutrition_info':
        actions.push('Analyze nutrition', 'Suggest recipes', 'Track calories');
        break;
      case 'schedule_check':
        actions.push('Show calendar', 'Check meetings', 'Day overview');
        break;
      case 'location_assistance':
        actions.push('Find keys', 'Show location', 'Departure checklist');
        break;
      case 'device_management':
        actions.push('Check connectivity', 'Sync devices', 'Backup mode');
        break;
      default:
        actions.push('Get help', 'Show options', 'Learn more');
    }
    
    return actions;
  }

  /**
   * Store conversation context in Chroma
   */
  private async storeConversationContext(
    request: ConversationalAIRequest,
    response: ConversationalAIResponse
  ): Promise<void> {
    try {
      const conversationContext: ConversationContext = {
        session_id: request.sessionId,
        user_id: request.userId,
        conversation_history: [
          ...(request.conversationHistory || []),
          {
            role: 'user',
            content: request.voiceText,
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: response.text,
            timestamp: new Date()
          }
        ],
        user_preferences: {
          voice_settings: { 
            preferred_voice: 'default',
            speech_rate: 1.0,
            pitch: 1.0
          },
          interaction_preferences: { 
            proactive_assistance: true,
            detailed_explanations: true,
            reminder_frequency: 'medium'
          },
          routine_patterns: { 
            typical_wake_time: '7:00 AM',
            breakfast_preferences: ['cereal', 'fruit'],
            medicine_schedule: ['8:00 AM']
          }
        },
      };

      await this.chromaService.storeConversationContext(
        request.sessionId,
        request.userId,
        conversationContext,
        request.objectContext
      );
    } catch (error) {
      errorLog('Failed to store conversation context:', error);
    }
  }

  /**
   * Generate mock response for demo purposes
   */
  private generateMockResponse(
    request: ConversationalAIRequest,
    agent: VoiceAgent
  ): ConversationalAIResponse {
    const { voiceText, objectContext } = request;
    const lowerText = voiceText.toLowerCase();
    
    let response = '';
    
    if (objectContext) {
      switch (objectContext.name) {
        case 'medicine_bottle':
          response = 'I see you\'re near your medicine. Time for your morning medication?';
          break;
        case 'breakfast_bowl':
          response = 'Good morning! Ready for breakfast? I can help analyze nutrition.';
          break;
        case 'laptop':
          response = 'Let me check your schedule and prepare your day overview.';
          break;
        case 'keys':
          response = 'Found your keys! Ready to head out? Let me check your departure list.';
          break;
        case 'phone':
          response = 'Phone detected. All systems connected and ready.';
          break;
        default:
          response = 'I\'m here to help with your morning routine.';
      }
    } else {
      response = 'Hello! I\'m Marvin, your AR morning assistant. How can I help?';
    }
    
    return {
      text: response,
      audioUrl: undefined,
      confidence: LEARNING_CONSTANTS.CONFIDENCE.ELEVENLABS_FALLBACK,
      intent: 'general_query',
      entities: {},
      suggestedActions: ['Get help', 'Show options'],
      learningInsights: {
        stage: 'day_1',
        personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_1,
        nextMilestone: 'Complete 5 interactions to unlock pattern recognition'
      },
      context: {
        objectType: objectContext?.name,
        timeOfDay: this.getTimeOfDay(),
        interactionType: 'mock'
      }
    };
  }

  /**
   * Generate fallback response
   */
  private generateFallbackResponse(request: ConversationalAIRequest): ConversationalAIResponse {
    return {
      text: 'I\'m having trouble processing that right now. Please try again.',
      confidence: LEARNING_CONSTANTS.CONFIDENCE.ELEVENLABS_ERROR,
      intent: 'error',
      entities: {},
      suggestedActions: ['Try again', 'Get help', 'Show options'],
      learningInsights: {
        stage: 'day_1',
        personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_1,
        nextMilestone: 'Complete 5 interactions to unlock pattern recognition'
      },
      context: {
        objectType: request.objectContext?.name,
        timeOfDay: this.getTimeOfDay(),
        interactionType: 'error'
      }
    };
  }

  /**
   * Get current time of day
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * Determine interaction type
   */
  private determineInteractionType(request: ConversationalAIRequest): string {
    if (request.objectContext) return 'object_interaction';
    if (request.conversationHistory && request.conversationHistory.length > 0) return 'follow_up';
    return 'initial';
  }

  /**
   * Health check for Enhanced ElevenLabs service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.elevenlabs) {
        debugLog('ElevenLabs client not available, health check passed (mock mode)');
        return true;
      }
      
      // Test basic connectivity
      await this.elevenlabs.voices.getAll();
      return true;
    } catch (error) {
      errorLog('Enhanced ElevenLabs health check failed:', error);
      return false;
    }
  }
}
