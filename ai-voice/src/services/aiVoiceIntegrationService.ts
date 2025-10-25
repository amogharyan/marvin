// Main AI & Voice Integration Service - Dev 2 Phase 2

import { GeminiService } from './geminiService';
import { ElevenLabsService } from './elevenlabsService';
import { VoiceProcessingService } from './voiceProcessingService';
import { VoiceCommandParsingService } from './voiceCommandParsingService';
import { ContextMemoryService } from './contextMemoryService';
import { 
  AIResponse, 
  ConversationContext, 
  DemoObject, 
  VoiceRequest,
  ChatMessage 
} from '../types';

export class AIVoiceIntegrationService {
  private geminiService: GeminiService;
  private elevenlabsService: ElevenLabsService;
  private voiceProcessingService: VoiceProcessingService;
  private voiceCommandParsingService: VoiceCommandParsingService;
  private contextMemoryService: ContextMemoryService;

  constructor() {
    this.geminiService = new GeminiService();
    this.elevenlabsService = new ElevenLabsService();
    this.voiceProcessingService = new VoiceProcessingService();
    this.voiceCommandParsingService = new VoiceCommandParsingService();
    this.contextMemoryService = new ContextMemoryService();
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
      console.log(`🔍 Processing object detection: ${detectedObject.name}`);

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
      console.log(`🎤 Processing voice input: ${voiceText}`);

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
    objectContext?: DemoObject
  ): Promise<AIResponse> {
    try {
      console.log(`🔍 Advanced multimodal processing: ${voiceText}`);

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
        conversationContext.conversation_history
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
        confidence: geminiResponse.confidence,
        context: `Multimodal analysis | Intent: ${parsedCommand.intent.intent}`,
        suggested_actions: parsedCommand.follow_up_actions,
        voice_enabled: true,
        voice_data: elevenlabsResponse,
        // Phase 2 enhancements
        intent_analysis: parsedCommand.intent,
        personalized_suggestions: personalizedSuggestions.slice(0, 3),
        visual_analysis: {
          objects_detected: objectContext ? [objectContext] : [],
          confidence: geminiResponse.confidence
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
    detectedObjects: DemoObject[]
  ): Promise<AIResponse> {
    try {
      console.log(`📷 Processing visual context with ${detectedObjects.length} objects`);

      // Use Gemini for visual analysis
      const geminiResponse = await this.geminiService.processVisualContext(
        imageData,
        detectedObjects
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
        confidence: geminiResponse.confidence,
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
      console.log(`⏰ Generating proactive assistance for ${timeOfDay}`);

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


  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    gemini: boolean;
    elevenlabs: boolean;
    voiceProcessing: boolean;
    voiceCommandParsing: boolean;
    contextMemory: boolean;
    overall: boolean;
  }> {
    const checks = await Promise.allSettled([
      this.geminiService.processContextualRequest({ prompt: 'test', context: 'health check' }),
      this.elevenlabsService.textToSpeech({ text: 'test' }),
      this.voiceProcessingService.healthCheck(),
      this.voiceCommandParsingService.healthCheck(),
      this.contextMemoryService.healthCheck()
    ]);

    const results = {
      gemini: checks[0].status === 'fulfilled',
      elevenlabs: checks[1].status === 'fulfilled',
      voiceProcessing: checks[2].status === 'fulfilled',
      voiceCommandParsing: checks[3].status === 'fulfilled',
      contextMemory: checks[4].status === 'fulfilled'
    };

    return {
      ...results,
      overall: results.gemini && results.elevenlabs && results.voiceProcessing && 
               results.voiceCommandParsing && results.contextMemory
    };
  }
}
