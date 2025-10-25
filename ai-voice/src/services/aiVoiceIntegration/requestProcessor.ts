// Request Processor - AI Voice Integration Service
// Handles different types of AI voice requests and routes them to appropriate services

import { AIResponse, ConversationContext, DemoObject } from '../../types';
import { ReminderFrequency } from '../../types/enums';
import { secureLog, errorLog } from '../../utils/secureLogger';
import { ServiceOrchestrator } from './serviceOrchestrator';

export interface VoiceRequest {
  voiceText: string;
  sessionId: string;
  userId: string;
  objectContext?: DemoObject;
  conversationHistory?: any[];
  mimeType?: string;
}

export interface MultimodalRequest {
  voiceText: string;
  imageData: string;
  sessionId: string;
  userId: string;
  objectContext?: DemoObject;
  conversationHistory?: any[];
  mimeType?: string;
}

export interface VisualRequest {
  imageData: string;
  sessionId: string;
  userId: string;
  objectContext?: DemoObject;
  mimeType?: string;
}

export class RequestProcessor {
  private serviceOrchestrator: ServiceOrchestrator;

  constructor(serviceOrchestrator: ServiceOrchestrator) {
    this.serviceOrchestrator = serviceOrchestrator;
  }

  /**
   * Process voice-only request
   */
  public async processVoiceRequest(request: VoiceRequest): Promise<AIResponse> {
    try {
      secureLog(`Processing voice request for session: ${request.sessionId}`);

      // Parse voice command
      const parsedCommand = await this.serviceOrchestrator.voiceCommandParsingService.parseVoiceCommand(
        request.voiceText,
        request.objectContext,
        {
          user_id: request.userId,
          session_id: request.sessionId,
          conversation_history: request.conversationHistory || [],
          user_preferences: this.serviceOrchestrator.contextMemoryService.getUserPreferences(request.userId) || {
            voice_settings: { preferred_voice: 'default', speech_rate: 1.0, pitch: 1.0 },
            interaction_preferences: { proactive_assistance: true, detailed_explanations: true, reminder_frequency: ReminderFrequency.MEDIUM },
            routine_patterns: { typical_wake_time: '7:00 AM', breakfast_preferences: [], medicine_schedule: [] }
          }
        }
      );

      // Process with voice processing service
      const voiceResponse = await this.serviceOrchestrator.voiceProcessingService.processVoiceInput(
        request.voiceText,
        {
          user_id: request.userId,
          session_id: request.sessionId,
          conversation_history: request.conversationHistory || [],
          user_preferences: this.serviceOrchestrator.contextMemoryService.getUserPreferences(request.userId) || {
            voice_settings: { preferred_voice: 'default', speech_rate: 1.0, pitch: 1.0 },
            interaction_preferences: { proactive_assistance: true, detailed_explanations: true, reminder_frequency: ReminderFrequency.MEDIUM },
            routine_patterns: { typical_wake_time: '7:00 AM', breakfast_preferences: [], medicine_schedule: [] }
          }
        }
      );

      return {
        content: voiceResponse.response,
        response: voiceResponse.response, // Backward compatibility
        confidence: voiceResponse.confidence,
        context: parsedCommand.context,
        suggested_actions: voiceResponse.suggested_actions,
        voice_enabled: true
      };
    } catch (error) {
      errorLog('Voice request processing error:', error);
      return {
        content: 'I\'m having trouble processing that right now. Please try again.',
        response: 'I\'m having trouble processing that right now. Please try again.',
        confidence: 0.3,
        context: 'error',
        suggested_actions: ['Try again', 'Speak clearly', 'Use text'],
        voice_enabled: true
      };
    }
  }

  /**
   * Process multimodal request (voice + image)
   */
  public async processMultimodalRequest(request: MultimodalRequest): Promise<AIResponse> {
    try {
      secureLog(`Processing multimodal request for session: ${request.sessionId}`);

      // Process with Gemini service
      const geminiResponse = await this.serviceOrchestrator.geminiService.processMultimodalContext(
        request.imageData,
        request.voiceText,
        request.objectContext,
        request.conversationHistory,
        request.mimeType
      );

      return {
        content: geminiResponse.text,
        response: geminiResponse.text, // Backward compatibility
        confidence: geminiResponse.confidence ?? 0.5,
        context: 'multimodal_query',
        suggested_actions: ['Show details', 'Get help', 'Try again'],
        voice_enabled: true
      };
    } catch (error) {
      errorLog('Multimodal request processing error:', error);
      return {
        content: 'I\'m having trouble processing the image and voice together. Please try again.',
        response: 'I\'m having trouble processing the image and voice together. Please try again.',
        confidence: 0.3,
        context: 'error',
        suggested_actions: ['Try again', 'Check image quality', 'Use text'],
        voice_enabled: true
      };
    }
  }

  /**
   * Process visual-only request
   */
  public async processVisualRequest(request: VisualRequest): Promise<AIResponse> {
    try {
      secureLog(`Processing visual request for session: ${request.sessionId}`);

      // Process with Gemini service
      const geminiResponse = await this.serviceOrchestrator.geminiService.processVisualContext(
        request.imageData,
        request.objectContext ? [request.objectContext] : [],
        request.mimeType
      );

      return {
        content: geminiResponse.text,
        response: geminiResponse.text, // Backward compatibility
        confidence: geminiResponse.confidence ?? 0.5,
        context: 'visual_query',
        suggested_actions: ['Show details', 'Get help', 'Try again'],
        voice_enabled: true
      };
    } catch (error) {
      errorLog('Visual request processing error:', error);
      return {
        content: 'I\'m having trouble processing the image. Please try again.',
        response: 'I\'m having trouble processing the image. Please try again.',
        confidence: 0.3,
        context: 'error',
        suggested_actions: ['Try again', 'Check image quality', 'Use text'],
        voice_enabled: true
      };
    }
  }

  /**
   * Process advanced conversational AI request
   */
  public async processAdvancedConversationalRequest(request: VoiceRequest): Promise<AIResponse> {
    try {
      secureLog(`Processing advanced conversational request for session: ${request.sessionId}`);

      const conversationalResponse = await this.serviceOrchestrator.enhancedElevenLabsService.processConversationalRequest({
        voiceText: request.voiceText,
        sessionId: request.sessionId,
        userId: request.userId,
        objectContext: request.objectContext,
        conversationHistory: request.conversationHistory,
        learningStage: 'day_1' // This would be determined by learning service
      });

      return {
        content: conversationalResponse.text,
        response: conversationalResponse.text, // Backward compatibility
        confidence: conversationalResponse.confidence,
        context: conversationalResponse.intent,
        suggested_actions: conversationalResponse.suggestedActions,
        voice_enabled: true
      };
    } catch (error) {
      errorLog('Advanced conversational request processing error:', error);
      return {
        content: 'I\'m having trouble processing that conversation. Please try again.',
        response: 'I\'m having trouble processing that conversation. Please try again.',
        confidence: 0.3,
        context: 'error',
        suggested_actions: ['Try again', 'Get help', 'Show options'],
        voice_enabled: true
      };
    }
  }

  /**
   * Process personalized suggestions request
   */
  public async processPersonalizedSuggestionsRequest(userId: string, objectContext?: DemoObject): Promise<AIResponse> {
    try {
      secureLog(`Processing personalized suggestions for user: ${userId}`);

      const suggestions = this.serviceOrchestrator.contextMemoryService.generatePersonalizedSuggestions({
        user_id: userId,
        session_id: 'suggestions_session',
        conversation_history: [],
        user_preferences: this.serviceOrchestrator.contextMemoryService.getUserPreferences(userId) || {
          voice_settings: { preferred_voice: 'default', speech_rate: 1.0, pitch: 1.0 },
          interaction_preferences: { proactive_assistance: true, detailed_explanations: true, reminder_frequency: ReminderFrequency.MEDIUM },
          routine_patterns: { typical_wake_time: '7:00 AM', breakfast_preferences: [], medicine_schedule: [] }
        },
        object_context: objectContext
      });

      return {
        content: `Here are some personalized suggestions: ${suggestions.map(s => s.suggestion).join(', ')}`,
        response: `Here are some personalized suggestions: ${suggestions.map(s => s.suggestion).join(', ')}`,
        confidence: 0.8,
        context: 'personalized_suggestions',
        suggested_actions: suggestions.map(s => s.suggestion),
        voice_enabled: true
      };
    } catch (error) {
      errorLog('Personalized suggestions processing error:', error);
      return {
        content: 'I\'m having trouble generating personalized suggestions right now.',
        response: 'I\'m having trouble generating personalized suggestions right now.',
        confidence: 0.3,
        context: 'error',
        suggested_actions: ['Try again', 'Get help'],
        voice_enabled: true
      };
    }
  }

  /**
   * Process learning insights request
   */
  public async processLearningInsightsRequest(userId: string): Promise<AIResponse> {
    try {
      secureLog(`Processing learning insights for user: ${userId}`);

      const insights = await this.serviceOrchestrator.learningService.getLearningProgressionSummary(userId);
      const summary = `Stage: ${insights.currentStage}, Progress: ${insights.progress.overallProgress}%, Next: ${insights.nextMilestone}`;

      return {
        content: `Learning insights: ${summary}`,
        response: `Learning insights: ${summary}`,
        confidence: 0.8,
        context: 'learning_insights',
        suggested_actions: ['View details', 'Get more insights', 'Update preferences'],
        voice_enabled: true
      };
    } catch (error) {
      errorLog('Learning insights processing error:', error);
      return {
        content: 'I\'m having trouble retrieving learning insights right now.',
        response: 'I\'m having trouble retrieving learning insights right now.',
        confidence: 0.3,
        context: 'error',
        suggested_actions: ['Try again', 'Get help'],
        voice_enabled: true
      };
    }
  }

  /**
   * Process synthetic data request
   */
  public async processSyntheticDataRequest(): Promise<AIResponse> {
    try {
      secureLog('Processing synthetic data request');

      const summary = await this.serviceOrchestrator.syntheticARDataService.getSyntheticDataSummary();

      return {
        content: `Synthetic data summary: ${summary.totalInteractions} interactions across ${summary.objectTypes.length} object types`,
        response: `Synthetic data summary: ${summary.totalInteractions} interactions across ${summary.objectTypes.length} object types`,
        confidence: 0.9,
        context: 'synthetic_data',
        suggested_actions: ['View details', 'Generate more data', 'Export data'],
        voice_enabled: true
      };
    } catch (error) {
      errorLog('Synthetic data processing error:', error);
      return {
        content: 'I\'m having trouble accessing synthetic data right now.',
        response: 'I\'m having trouble accessing synthetic data right now.',
        confidence: 0.3,
        context: 'error',
        suggested_actions: ['Try again', 'Get help'],
        voice_enabled: true
      };
    }
  }

  /**
   * Determine the best processing method for a request
   */
  public determineProcessingMethod(request: VoiceRequest | MultimodalRequest | VisualRequest): string {
    if ('imageData' in request && 'voiceText' in request) {
      return 'multimodal';
    } else if ('imageData' in request) {
      return 'visual';
    } else if ('voiceText' in request) {
      return 'voice';
    } else {
      return 'unknown';
    }
  }

  /**
   * Validate request parameters
   */
  public validateRequest(request: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.sessionId) {
      errors.push('sessionId is required');
    }

    if (!request.userId) {
      errors.push('userId is required');
    }

    if ('voiceText' in request && !request.voiceText) {
      errors.push('voiceText is required for voice requests');
    }

    if ('imageData' in request && !request.imageData) {
      errors.push('imageData is required for visual requests');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
