// Conversational Processor - ElevenLabs Integration
// Handles conversation processing, context management, and response generation

import { ElevenLabs } from '@elevenlabs/elevenlabs-js';
import { secureLog, errorLog, debugLog } from '../../utils/secureLogger';
import { ConversationContext, DemoObject, ChatMessage } from '../../types';
import { ConversationRole, ReminderFrequency } from '../../types/enums';
import { ChromaService } from '../chromaService';
import { LearningSimulationService } from '../learningSimulationService';
import { LEARNING_CONSTANTS } from '../../constants/learningConstants';
import { VoiceAgentManager, VoiceAgent } from './voiceAgentManager';
import { IntentExtractor, ExtractedIntent } from './intentExtractor';

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

export class ConversationalProcessor {
  private elevenLabsClient: any;
  private voiceAgentManager: VoiceAgentManager;
  private intentExtractor: IntentExtractor;
  private chromaService: ChromaService;
  private learningService: LearningSimulationService;
  private isInitialized: boolean = false;

  constructor(chromaService: ChromaService, learningService: LearningSimulationService) {
    this.chromaService = chromaService;
    this.learningService = learningService;
    this.voiceAgentManager = new VoiceAgentManager();
    this.intentExtractor = new IntentExtractor();
  }

  /**
   * Initialize the conversational processor
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize ElevenLabs client
      this.elevenLabsClient = new (ElevenLabs as any)({
        apiKey: process.env.ELEVENLABS_API_KEY || 'demo-key'
      });

      this.isInitialized = true;
      secureLog('✅ Conversational Processor initialized successfully');
    } catch (error) {
      errorLog('Failed to initialize Conversational Processor:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Process conversational AI request
   */
  public async processConversationalRequest(
    request: ConversationalAIRequest
  ): Promise<ConversationalAIResponse> {
    try {
      // Extract intent and entities
      const extractedIntent = this.intentExtractor.extractIntent(
        request.voiceText,
        request.objectContext
      );

      // Select appropriate voice agent
      const voiceAgent = this.voiceAgentManager.selectVoiceAgent(
        request.voiceText,
        request.objectContext,
        request.learningStage
      );

      // Build context for the agent
      const context = this.buildConversationContext(request);

      // Process with ElevenLabs or fallback
      const response = await this.processWithElevenLabs(
        request,
        voiceAgent,
        extractedIntent,
        context
      );

      // Store conversation context for learning
      await this.storeConversationContext(request, extractedIntent, response);

      return response;
    } catch (error) {
      errorLog('Conversational processing error:', error);
      return this.generateFallbackResponse(request);
    }
  }

  /**
   * Process request with ElevenLabs API
   */
  private async processWithElevenLabs(
    request: ConversationalAIRequest,
    voiceAgent: VoiceAgent,
    extractedIntent: ExtractedIntent,
    context: Record<string, any>
  ): Promise<ConversationalAIResponse> {
    try {
      if (!this.isInitialized || !this.elevenLabsClient) {
        return this.generateMockResponse(request, extractedIntent);
      }

      // Build system prompt with context
      const systemPrompt = this.voiceAgentManager.buildSystemPrompt(
        voiceAgent,
        context.userContext,
        request.objectContext,
        request.learningStage,
        context.additionalContext
      );

      // Process with ElevenLabs (mock implementation for demo)
      const elevenLabsResponse = await this.callElevenLabsAPI(
        request.voiceText,
        systemPrompt,
        voiceAgent
      );

      return {
        text: elevenLabsResponse.message,
        audioUrl: undefined,
        confidence: elevenLabsResponse.confidence || LEARNING_CONSTANTS.CONFIDENCE.ELEVENLABS_SUCCESS,
        intent: extractedIntent.intent,
        entities: extractedIntent.entities,
        suggestedActions: this.intentExtractor.getSuggestedActions(
          extractedIntent.intent,
          extractedIntent.entities
        ),
        learningInsights: {
          stage: request.learningStage || 'day_1',
          personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_1,
          nextMilestone: 'Complete 5 interactions to unlock pattern recognition'
        },
        context: {
          objectType: request.objectContext?.name,
          timeOfDay: this.getTimeOfDay(),
          interactionType: 'voice_conversation'
        }
      };
    } catch (error) {
      debugLog('ElevenLabs processing failed, using fallback:', error);
      return this.generateMockResponse(request, extractedIntent);
    }
  }

  /**
   * Call ElevenLabs API (mock implementation)
   */
  private async callElevenLabsAPI(
    voiceText: string,
    systemPrompt: string,
    voiceAgent: VoiceAgent
  ): Promise<{ message: string; confidence: number }> {
    // Mock implementation - replace with actual ElevenLabs API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: `I understand you're asking about "${voiceText}". Let me help you with that.`,
          confidence: LEARNING_CONSTANTS.CONFIDENCE.ELEVENLABS_SUCCESS
        });
      }, 100);
    });
  }

  /**
   * Generate mock response for demo purposes
   */
  private generateMockResponse(
    request: ConversationalAIRequest,
    extractedIntent: ExtractedIntent
  ): ConversationalAIResponse {
    const response = this.buildContextualResponse(request, extractedIntent);
    
    return {
      text: response,
      audioUrl: undefined,
      confidence: LEARNING_CONSTANTS.CONFIDENCE.ELEVENLABS_FALLBACK,
      intent: extractedIntent.intent,
      entities: extractedIntent.entities,
      suggestedActions: this.intentExtractor.getSuggestedActions(
        extractedIntent.intent,
        extractedIntent.entities
      ),
      learningInsights: {
        stage: request.learningStage || 'day_1',
        personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_1,
        nextMilestone: 'Complete 5 interactions to unlock pattern recognition'
      },
      context: {
        objectType: request.objectContext?.name,
        timeOfDay: this.getTimeOfDay(),
        interactionType: 'voice_conversation'
      }
    };
  }

  /**
   * Build contextual response based on intent and context
   */
  private buildContextualResponse(
    request: ConversationalAIRequest,
    extractedIntent: ExtractedIntent
  ): string {
    const { intent, entities } = extractedIntent;
    const objectName = request.objectContext?.name;

    switch (intent) {
      case 'medicine_reminder':
        return `I can help you with your medication schedule. ${objectName ? `I see you're near your ${objectName}.` : ''} Would you like me to remind you about your next dose?`;
      
      case 'nutrition_info':
        return `I can provide nutrition information for your meal. ${objectName ? `I see you have ${objectName} ready.` : ''} Would you like nutritional analysis or recipe suggestions?`;
      
      case 'schedule_query':
        return `I can help you with your schedule. ${objectName ? `I see you're near your ${objectName}.` : ''} Would you like to see your calendar or set up reminders?`;
      
      case 'location_search':
        return `I can help you find what you're looking for. ${objectName ? `I see you're near your ${objectName}.` : ''} Would you like me to help locate items?`;
      
      case 'device_sync':
        return `I can help you sync your devices. ${objectName ? `I see you're near your ${objectName}.` : ''} Would you like to sync your calendar and reminders?`;
      
      default:
        return `I understand you're asking about "${request.voiceText}". Let me help you with that.`;
    }
  }

  /**
   * Build conversation context
   */
  private buildConversationContext(request: ConversationalAIRequest): Record<string, any> {
    return {
      userContext: `User: ${request.userId}, Session: ${request.sessionId}`,
      additionalContext: {
        health: request.objectContext?.name?.includes('medicine') ? 'Medication context' : 'General health',
        calendar: request.objectContext?.name?.includes('laptop') ? 'Work context' : 'Personal context'
      }
    };
  }

  /**
   * Store conversation context for learning
   */
  private async storeConversationContext(
    request: ConversationalAIRequest,
    extractedIntent: ExtractedIntent,
    response: ConversationalAIResponse
  ): Promise<void> {
    try {
      if (!this.chromaService) return;

      const conversationContext: ConversationContext = {
        user_id: request.userId,
        session_id: request.sessionId,
        conversation_history: [
          {
            role: ConversationRole.USER,
            content: request.voiceText,
            timestamp: new Date()
          },
          {
            role: ConversationRole.ASSISTANT,
            content: response.text,
            timestamp: new Date()
          }
        ],
        user_preferences: {
          voice_settings: {
            preferred_voice: 'marvin_voice',
            speech_rate: LEARNING_CONSTANTS.VOICE_SETTINGS.SPEECH_RATE.NORMAL,
            pitch: LEARNING_CONSTANTS.VOICE_SETTINGS.SPEECH_RATE.NORMAL
          },
          interaction_preferences: {
            proactive_assistance: true,
            detailed_explanations: true,
            reminder_frequency: ReminderFrequency.MEDIUM
          },
          routine_patterns: {
            typical_wake_time: '7:00 AM',
            breakfast_preferences: ['cereal', 'fruit', 'coffee'],
            medicine_schedule: ['morning_vitamins', 'blood_pressure_medication']
          }
        }
      };

      await this.chromaService.storeConversationContext(
        request.sessionId,
        request.userId,
        conversationContext,
        request.objectContext
      );
    } catch (error) {
      debugLog('Failed to store conversation context:', error);
    }
  }

  /**
   * Generate fallback response for errors
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
        interactionType: 'error_fallback'
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
    if (hour < 20) return 'evening';
    return 'night';
  }

  /**
   * Health check for conversational processor
   */
  public async healthCheck(): Promise<boolean> {
    return this.isInitialized;
  }
}
