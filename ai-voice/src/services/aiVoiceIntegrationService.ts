// Main AI & Voice Integration Service - Dev 2 Phase 3
// Enhanced with Chroma vector database, learning simulation, and advanced conversational AI

import { GeminiService } from './geminiService';
import { ElevenLabsService } from './elevenlabsService';
import { VoiceProcessingService } from './voiceProcessingService';
import { VoiceCommandParsingService } from './voiceCommandParsingService';
import { ContextMemoryService } from './contextMemoryService';
import { ChromaService } from './chromaService';
import { LearningSimulationService } from './learningSimulationService';
import { EnhancedElevenLabsService } from './enhancedElevenLabsService';
import { SyntheticARDataService } from './syntheticARDataService';
import { secureLog, safeLog } from '../utils/secureLogger';
import { 
  AIResponse, 
  ConversationContext, 
  DemoObject
} from '../types';

export class AIVoiceIntegrationService {
  private geminiService: GeminiService;
  private elevenlabsService: ElevenLabsService;
  private voiceProcessingService: VoiceProcessingService;
  private voiceCommandParsingService: VoiceCommandParsingService;
  private contextMemoryService: ContextMemoryService;
  
  // Phase 3 Services
  private chromaService: ChromaService;
  private learningService: LearningSimulationService;
  private enhancedElevenLabsService: EnhancedElevenLabsService;
  private syntheticARDataService: SyntheticARDataService;

  constructor() {
    // Phase 2 Services
    this.geminiService = new GeminiService();
    this.elevenlabsService = new ElevenLabsService();
    this.voiceProcessingService = new VoiceProcessingService();
    this.voiceCommandParsingService = new VoiceCommandParsingService();
    this.contextMemoryService = new ContextMemoryService();
    
    // Phase 3 Services
    this.chromaService = new ChromaService();
    this.learningService = new LearningSimulationService(this.chromaService);
    this.enhancedElevenLabsService = new EnhancedElevenLabsService(this.chromaService, this.learningService);
    this.syntheticARDataService = new SyntheticARDataService(this.chromaService, this.learningService);
    
    // Initialize Phase 3 services
    this.initializePhase3Services();
  }

  /**
   * Initialize Phase 3 services
   */
  private async initializePhase3Services(): Promise<void> {
    try {
      await this.chromaService.initialize();
      await this.syntheticARDataService.initialize();
      secureLog('✅ Phase 3 services initialized successfully');
    } catch (error) {
      secureLog('⚠️ Phase 3 services initialized in fallback mode');
    }
  }

  /**
   * Process object detection with full AI & Voice integration
   */
  async processObjectDetection(
    detectedObject: DemoObject,
    userMessage?: string,
    conversationContext?: ConversationContext
  ): Promise<AIResponse> {
    try {
      safeLog(`🔍 Processing object detection: ${detectedObject.name}`);

      // Step 1: Generate contextual AI response using voice processing
      const voiceResponse = await this.voiceProcessingService.processVoiceInput(
        userMessage || `I see a ${detectedObject.name}`,
        conversationContext || this.createDefaultContext(),
        detectedObject
      );

      // Step 2: Generate voice synthesis
      const elevenlabsResponse = await this.elevenlabsService.generateObjectSpecificVoice(
        voiceResponse.response,
        detectedObject.name
      );

      // Step 3: Generate additional suggestions using Gemini
      const suggestions = await this.geminiService.generateObjectSuggestions(detectedObject.name);

      return {
        content: voiceResponse.response,
        confidence: voiceResponse.confidence,
        context: `Object: ${detectedObject.name}`,
        suggested_actions: voiceResponse.suggested_actions.concat(suggestions),
        voice_enabled: true,
        voice_data: elevenlabsResponse
      };
    } catch (error) {
      console.error('Object detection processing error:', error);
      
      // Fallback response
      return {
        content: `I can see a ${detectedObject.name}. How can I help you with it?`,
        confidence: 0.5,
        context: `Object: ${detectedObject.name}`,
        suggested_actions: ['Tell me more', 'Show options', 'Help me'],
        voice_enabled: false
      };
    }
  }

  /**
   * Process voice input with conversational AI
   */
  async processVoiceInput(
    voiceText: string,
    conversationContext: ConversationContext,
    objectContext?: DemoObject
  ): Promise<AIResponse> {
    try {
      secureLog('🎤 Processing voice input', voiceText, {
        redactSensitive: true,
        includeMetadata: true,
        maxLength: 100
      });

      // Store conversation context in memory
      await this.contextMemoryService.storeConversationContext(
        conversationContext.session_id,
        conversationContext
      );

      // Parse voice command for intent recognition
      const parsedCommand = await this.voiceCommandParsingService.parseVoiceCommand(
        voiceText,
        objectContext,
        conversationContext
      );

      // Process with voice processing service for conversational understanding
      const voiceResponse = await this.voiceProcessingService.processVoiceInput(
        voiceText,
        conversationContext,
        objectContext
      );

      // Generate personalized suggestions
      const personalizedSuggestions = await this.contextMemoryService.generatePersonalizedSuggestions(
        conversationContext.user_id,
        conversationContext,
        objectContext
      );

      // Generate voice synthesis
      const elevenlabsResponse = await this.elevenlabsService.textToSpeech({
        text: voiceResponse.response,
        voice_id: conversationContext.user_preferences.voice_settings.preferred_voice
      });

      return {
        content: voiceResponse.response,
        confidence: voiceResponse.confidence,
        context: `Voice conversation | Intent: ${parsedCommand.intent.intent}`,
        suggested_actions: [
          ...voiceResponse.suggested_actions,
          ...parsedCommand.follow_up_actions
        ].slice(0, 5), // Limit to 5 actions
        voice_enabled: true,
        voice_data: elevenlabsResponse,
        // Phase 2 enhancements
        intent_analysis: parsedCommand.intent,
        personalized_suggestions: personalizedSuggestions.slice(0, 3)
      };
    } catch (error) {
      console.error('Voice input processing error:', error);
      
      return {
        content: 'I heard you, but I\'m having trouble processing that right now. Can you try again?',
        confidence: 0.3,
        context: 'Voice conversation',
        suggested_actions: ['Try again', 'Speak clearly', 'Use text'],
        voice_enabled: false
      };
    }
  }

  /**
   * Advanced multimodal processing combining visual and voice context
   */
  async processMultimodalInput(
    imageData: string,
    voiceText: string,
    conversationContext: ConversationContext,
    objectContext?: DemoObject,
    mimeType?: string
  ): Promise<AIResponse> {
    try {
      secureLog('🔍 Advanced multimodal processing', voiceText, {
        redactSensitive: true,
        includeMetadata: true,
        maxLength: 100
      });

      // Store conversation context
      await this.contextMemoryService.storeConversationContext(
        conversationContext.session_id,
        conversationContext
      );

      // Parse voice command
      const parsedCommand = await this.voiceCommandParsingService.parseVoiceCommand(
        voiceText,
        objectContext,
        conversationContext
      );

      // Process with Gemini for multimodal understanding
      const geminiResponse = await this.geminiService.processMultimodalContext(
        imageData,
        voiceText,
        objectContext,
        conversationContext.conversation_history,
        mimeType
      );

      // Generate personalized suggestions
      const personalizedSuggestions = await this.contextMemoryService.generatePersonalizedSuggestions(
        conversationContext.user_id,
        conversationContext,
        objectContext
      );

      // Generate contextual voice synthesis
      const elevenlabsResponse = await this.elevenlabsService.generateContextualVoice(
        geminiResponse.text,
        objectContext?.name,
        parsedCommand.intent.intent === 'medicine_reminder' ? 'high' : 'medium'
      );

      return {
        content: geminiResponse.text,
        confidence: geminiResponse.confidence ?? 0.5, // Fallback to moderate confidence if undefined
        context: `Multimodal analysis | Intent: ${parsedCommand.intent.intent}`,
        suggested_actions: parsedCommand.follow_up_actions,
        voice_enabled: true,
        voice_data: elevenlabsResponse,
        // Phase 2 enhancements
        intent_analysis: parsedCommand.intent,
        personalized_suggestions: personalizedSuggestions.slice(0, 3),
        visual_analysis: {
          objects_detected: objectContext ? [objectContext] : [],
          confidence: geminiResponse.confidence ?? 0.5 // Fallback to moderate confidence if undefined
        }
      };
    } catch (error) {
      console.error('Multimodal processing error:', error);
      
      return {
        content: 'I can see your environment and hear you, but I\'m having trouble processing both inputs right now.',
        confidence: 0.4,
        context: 'Multimodal analysis',
        suggested_actions: ['Try again', 'Speak clearly', 'Use text'],
        voice_enabled: false
      };
    }
  }

  /**
   * Process visual context from camera feed
   */
  async processVisualContext(
    imageData: string,
    detectedObjects: DemoObject[],
    mimeType?: string
  ): Promise<AIResponse> {
    try {
      safeLog(`📷 Processing visual context with ${detectedObjects.length} objects`);

      // Use Gemini for visual analysis
      const geminiResponse = await this.geminiService.processVisualContext(
        imageData,
        detectedObjects,
        mimeType
      );

      // Generate voice for the most confident object
      const primaryObject = detectedObjects.reduce((prev, current) => 
        (current.detection_confidence > prev.detection_confidence) ? current : prev
      );

      const voiceResponse = await this.elevenlabsService.generateObjectSpecificVoice(
        geminiResponse.text,
        primaryObject.name
      );

      return {
        content: geminiResponse.text,
        confidence: geminiResponse.confidence ?? 0.5, // Fallback to moderate confidence if undefined
        context: `Visual analysis of ${detectedObjects.length} objects`,
        suggested_actions: ['Interact with objects', 'Ask questions', 'Get more info'],
        voice_enabled: true,
        voice_data: voiceResponse
      };
    } catch (error) {
      console.error('Visual context processing error:', error);
      
      return {
        content: 'I can see objects in your environment. What would you like to know about them?',
        confidence: 0.4,
        context: 'Visual analysis',
        suggested_actions: ['Describe objects', 'Get suggestions', 'Ask questions'],
        voice_enabled: false
      };
    }
  }

  /**
   * Generate proactive assistance based on context
   */
  async generateProactiveAssistance(
    conversationContext: ConversationContext,
    timeOfDay: string
  ): Promise<AIResponse> {
    try {
      safeLog(`⏰ Generating proactive assistance for ${timeOfDay}`);

      const proactiveResponse = await this.voiceProcessingService.generateProactiveAssistance(
        conversationContext,
        timeOfDay
      );

      const voiceResponse = await this.elevenlabsService.generateContextualVoice(
        proactiveResponse.response,
        undefined,
        'medium'
      );

      return {
        content: proactiveResponse.response,
        confidence: proactiveResponse.confidence,
        context: `Proactive assistance for ${timeOfDay}`,
        suggested_actions: proactiveResponse.suggested_actions,
        voice_enabled: true,
        voice_data: voiceResponse
      };
    } catch (error) {
      console.error('Proactive assistance error:', error);
      
      return {
        content: 'Good morning! Ready to start your day?',
        confidence: 0.6,
        context: 'Proactive assistance',
        suggested_actions: ['Check schedule', 'Take medicine', 'Have breakfast'],
        voice_enabled: false
      };
    }
  }

  /**
   * Create default conversation context
   */
  private createDefaultContext(): ConversationContext {
    return {
      user_id: 'demo_user',
      session_id: `session_${Date.now()}`,
      conversation_history: [],
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
          breakfast_preferences: ['cereal', 'fruit', 'coffee'],
          medicine_schedule: ['8:00 AM', '12:00 PM']
        }
      }
    };
  }

  // ==================== PHASE 3 METHODS ====================

  /**
   * Process advanced conversational AI request with learning
   */
  async processAdvancedConversationalRequest(
    voiceText: string,
    sessionId: string,
    userId: string,
    objectContext?: DemoObject,
    conversationHistory?: any[]
  ): Promise<{
    response: string;
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
  }> {
    try {
      // Initialize user learning if needed
      await this.learningService.initializeUserLearning(userId);

      // Process with Enhanced ElevenLabs Conversational AI
      const conversationalResponse = await this.enhancedElevenLabsService.processConversationalRequest({
        voiceText,
        sessionId,
        userId,
        objectContext,
        conversationHistory,
        learningStage: 'day_1' // Will be determined by learning service
      });

      // Simulate learning progression
      await this.learningService.simulateLearningProgression(userId, {
        objectContext,
        userResponse: voiceText,
        suggestionAccepted: true,
        timeOfDay: this.getTimeOfDay()
      });

      return {
        response: conversationalResponse.text,
        audioUrl: conversationalResponse.audioUrl,
        confidence: conversationalResponse.confidence,
        intent: conversationalResponse.intent,
        entities: conversationalResponse.entities,
        suggestedActions: conversationalResponse.suggestedActions,
        learningInsights: conversationalResponse.learningInsights,
        context: conversationalResponse.context
      };
    } catch (error: any) {
      secureLog('Advanced conversational request failed, using fallback:', error);
      return {
        response: 'I\'m learning about your preferences. Please try again.',
        confidence: 0.5,
        intent: 'fallback',
        entities: {},
        suggestedActions: ['Try again', 'Get help'],
        learningInsights: {
          stage: 'day_1',
          personalizationLevel: 0.2,
          nextMilestone: 'Complete 5 interactions to unlock pattern recognition'
        },
        context: {
          objectType: objectContext?.name,
          timeOfDay: this.getTimeOfDay(),
          interactionType: 'fallback'
        }
      };
    }
  }

  /**
   * Get personalized suggestions based on learning patterns
   */
  async getPersonalizedSuggestions(
    userId: string,
    context: string,
    objectContext?: DemoObject
  ): Promise<{
    suggestions: Array<{
      suggestion: string;
      confidence: number;
      context: string;
      reasoning: string;
      priority: 'high' | 'medium' | 'low';
      learningStage: 'day_1' | 'day_7' | 'day_30';
    }>;
    learningSummary: {
      currentStage: string;
      progress: {
        interactions: number;
        patternsLearned: number;
        preferencesIdentified: number;
        overallProgress: number;
      };
      metrics: {
        suggestionAccuracy: number;
        userSatisfaction: number;
        responseRelevance: number;
      };
      nextMilestone: string;
    };
  }> {
    try {
      // Generate personalized suggestions
      const suggestions = await this.chromaService.generatePersonalizedSuggestions(
        userId,
        context,
        objectContext
      );

      // Get learning progression summary
      const learningSummary = this.learningService.getLearningProgressionSummary(userId);

      return {
        suggestions,
        learningSummary: {
          currentStage: learningSummary.currentStage.stage,
          progress: learningSummary.progress,
          metrics: learningSummary.metrics,
          nextMilestone: learningSummary.nextMilestone
        }
      };
    } catch (error: any) {
      secureLog('Failed to get personalized suggestions:', error);
      return {
        suggestions: [],
        learningSummary: {
          currentStage: 'day_1',
          progress: {
            interactions: 0,
            patternsLearned: 0,
            preferencesIdentified: 0,
            overallProgress: 0
          },
          metrics: {
            suggestionAccuracy: 0.5,
            userSatisfaction: 0.5,
            responseRelevance: 0.5
          },
          nextMilestone: 'Complete 5 interactions to unlock pattern recognition'
        }
      };
    }
  }

  /**
   * Simulate demo learning progression (for hackathon demo)
   */
  async simulateDemoLearningProgression(userId: string): Promise<void> {
    try {
      await this.learningService.simulateDemoProgression(userId);
      secureLog(`✅ Simulated demo learning progression for user: ${userId}`);
    } catch (error: any) {
      secureLog('Failed to simulate demo progression:', error);
    }
  }

  /**
   * Get learning insights for demo presentation
   */
  getLearningInsightsForDemo(userId: string): {
    day1: {
      description: string;
      characteristics: string[];
      personalizationLevel: number;
    };
    day7: {
      description: string;
      characteristics: string[];
      personalizationLevel: number;
    };
    day30: {
      description: string;
      characteristics: string[];
      personalizationLevel: number;
    };
    currentStage: string;
    progress: number;
  } {
    try {
      const summary = this.learningService.getLearningProgressionSummary(userId);
      
      return {
        day1: {
          description: 'Initial Learning Phase',
          characteristics: [
            'Generic responses and suggestions',
            'Basic object recognition',
            'Learning user preferences',
            'Establishing interaction patterns'
          ],
          personalizationLevel: 0.2
        },
        day7: {
          description: 'Pattern Recognition Phase',
          characteristics: [
            'Recognizing routine patterns',
            'Personalized timing suggestions',
            'Adaptive responses based on context',
            'Learning object interaction preferences'
          ],
          personalizationLevel: 0.6
        },
        day30: {
          description: 'Advanced Personalization Phase',
          characteristics: [
            'Predictive assistance',
            'Highly personalized suggestions',
            'Proactive routine optimization',
            'Advanced pattern recognition'
          ],
          personalizationLevel: 0.9
        },
        currentStage: summary.currentStage.stage,
        progress: summary.progress.overallProgress
      };
    } catch (error: any) {
      secureLog('Failed to get learning insights:', error);
      return {
        day1: { description: 'Initial Learning', characteristics: [], personalizationLevel: 0.2 },
        day7: { description: 'Pattern Recognition', characteristics: [], personalizationLevel: 0.6 },
        day30: { description: 'Advanced Personalization', characteristics: [], personalizationLevel: 0.9 },
        currentStage: 'day_1',
        progress: 0
      };
    }
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
   * Get synthetic data summary for demo
   */
  async getSyntheticDataSummary(): Promise<{
    totalInteractions: number;
    objectTypes: string[];
    timeRange: string;
    learningStage: string;
  }> {
    return await this.syntheticARDataService.getSyntheticDataSummary();
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    gemini: boolean;
    elevenlabs: boolean;
    voiceProcessing: boolean;
    voiceCommandParsing: boolean;
    contextMemory: boolean;
    chroma: boolean;
    learningSimulation: boolean;
    enhancedElevenLabs: boolean;
    overall: boolean;
  }> {
    const checks = await Promise.allSettled([
      this.geminiService.processContextualRequest({ prompt: 'test', context: 'health check' }),
      this.elevenlabsService.textToSpeech({ text: 'test' }),
      this.voiceProcessingService.healthCheck(),
      this.voiceCommandParsingService.healthCheck(),
      this.contextMemoryService.healthCheck(),
      this.chromaService.healthCheck(),
      this.learningService.healthCheck(),
      this.enhancedElevenLabsService.healthCheck()
    ]);

    const results = {
      gemini: checks[0].status === 'fulfilled',
      elevenlabs: checks[1].status === 'fulfilled',
      voiceProcessing: checks[2].status === 'fulfilled',
      voiceCommandParsing: checks[3].status === 'fulfilled',
      contextMemory: checks[4].status === 'fulfilled',
      chroma: checks[5].status === 'fulfilled',
      learningSimulation: checks[6].status === 'fulfilled',
      enhancedElevenLabs: checks[7].status === 'fulfilled',
      overall: false
    };

    results.overall = Object.values(results).every(result => result === true);
    return results;
  }
}
