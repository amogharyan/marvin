// Main AI & Voice Integration Service - Dev 2 Phase 3
// Orchestrates all AI and voice services with modular architecture

import { secureLog, safeLog, errorLog } from '../utils/secureLogger';
import { AIResponse, ConversationContext, DemoObject } from '../types';
import { ServiceOrchestrator } from './aiVoiceIntegration/serviceOrchestrator';
import { RequestProcessor, VoiceRequest, MultimodalRequest, VisualRequest } from './aiVoiceIntegration/requestProcessor';
import { AsyncService } from '../utils/asyncServiceUtils';
import type { LettaSearchResult } from './lettaService';

export class AIVoiceIntegrationService extends AsyncService {
  private serviceOrchestrator: ServiceOrchestrator;
  private requestProcessor: RequestProcessor;

  constructor() {
    super();
    this.serviceOrchestrator = new ServiceOrchestrator();
    this.requestProcessor = new RequestProcessor(this.serviceOrchestrator);
    
    safeLog('🎯 AI Voice Integration Service created (not yet initialized)');
  }

  /**
   * Factory method to create and initialize the service
   */
  public static async create(): Promise<AIVoiceIntegrationService> {
    const service = new AIVoiceIntegrationService();
    await service.initialize();
    return service;
  }

  /**
   * Initialize the service and all its dependencies
   */
  public async initialize(): Promise<void> {
    try {
      await this.serviceOrchestrator.initializePhase3Services();
      this.isInitialized = true;
      safeLog('🎯 AI Voice Integration Service initialized successfully');
    } catch (error) {
      errorLog('Failed to initialize AI Voice Integration Service:', error);
      throw error;
    }
  }

  /**
   * Check if the service is properly initialized
   */
  public isReady(): boolean {
    return this.isInitialized && this.serviceOrchestrator.getInitializationStatus();
  }

  /**
   * Ensure the service is initialized before use
   */
  protected ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('AIVoiceIntegrationService must be initialized before use. Call initialize() or use AIVoiceIntegrationService.create()');
    }
  }

  /**
   * Process voice input
   */
  public async processVoiceInput(
    voiceText: string,
    sessionId: string,
    userId: string,
    objectContext?: DemoObject,
    conversationHistory?: any[]
  ): Promise<AIResponse> {
    this.ensureInitialized();
    
    const request: VoiceRequest = {
      voiceText,
      sessionId,
      userId,
      objectContext,
      conversationHistory
    };

    return await this.requestProcessor.processVoiceRequest(request);
  }

  /**
   * Process multimodal input (voice + image)
   */
  public async processMultimodalInput(
    voiceText: string,
    imageData: string,
    sessionId: string,
    userId: string,
    objectContext?: DemoObject,
    conversationHistory?: any[],
    mimeType?: string
  ): Promise<AIResponse> {
    this.ensureInitialized();
    
    const request: MultimodalRequest = {
      voiceText,
      imageData,
      sessionId,
      userId,
      objectContext,
      conversationHistory,
      mimeType
    };

    return await this.requestProcessor.processMultimodalRequest(request);
  }

  /**
   * Process visual context
   */
  public async processVisualContext(
    imageData: string,
    sessionId: string,
    userId: string,
    objectContext?: DemoObject,
    mimeType?: string
  ): Promise<AIResponse> {
    this.ensureInitialized();
    
    const request: VisualRequest = {
      imageData,
      sessionId,
      userId,
      objectContext,
      mimeType
    };

    return await this.requestProcessor.processVisualRequest(request);
  }

  /**
   * Process advanced conversational AI request
   */
  public async processAdvancedConversationalRequest(
    voiceText: string,
    sessionId: string,
    userId: string,
    objectContext?: DemoObject,
    conversationHistory?: any[]
  ): Promise<AIResponse> {
    const request: VoiceRequest = {
      voiceText,
      sessionId,
      userId,
      objectContext,
      conversationHistory
    };

    return await this.requestProcessor.processAdvancedConversationalRequest(request);
  }

  /**
   * Get personalized suggestions
   */
  public async getPersonalizedSuggestions(
    userId: string,
    objectContext?: DemoObject
  ): Promise<AIResponse> {
    return await this.requestProcessor.processPersonalizedSuggestionsRequest(userId, objectContext);
  }

  /**
   * Simulate demo learning progression
   */
  public async simulateDemoLearningProgression(userId: string): Promise<AIResponse> {
    try {
      await this.serviceOrchestrator.learningService.simulateDemoProgression(userId);
      
      return {
        content: 'Demo learning progression simulated successfully',
        response: 'Demo learning progression simulated successfully',
        confidence: 0.9,
        context: 'demo_progression',
        suggested_actions: ['View progression', 'Get insights', 'Continue demo'],
        voice_enabled: true
      };
    } catch (error) {
      errorLog('Demo learning progression error:', error);
      return {
        content: 'Failed to simulate demo learning progression',
        response: 'Failed to simulate demo learning progression',
        confidence: 0.3,
        context: 'error',
        suggested_actions: ['Try again', 'Get help'],
        voice_enabled: true
      };
    }
  }

  /**
   * Get learning insights for demo
   */
  public async getLearningInsightsForDemo(userId: string): Promise<AIResponse> {
    return await this.requestProcessor.processLearningInsightsRequest(userId);
  }

  /**
   * Get synthetic data summary
   */
  public async getSyntheticDataSummary(): Promise<AIResponse> {
    return await this.requestProcessor.processSyntheticDataRequest();
  }

  /**
   * Health check for all services
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const healthStatus = await this.serviceOrchestrator.getServiceHealthStatus();
      const allHealthy = await this.serviceOrchestrator.areAllServicesHealthy();
      
      secureLog('Service health status:', JSON.stringify(healthStatus));
      return allHealthy;
    } catch (error) {
      errorLog('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get detailed health status
   */
  public async getDetailedHealthStatus(): Promise<{
    overall: boolean;
    services: any;
    stats: any;
  }> {
    try {
      const healthStatus = await this.serviceOrchestrator.getServiceHealthStatus();
      const stats = this.serviceOrchestrator.getServiceStats();
      const overall = await this.serviceOrchestrator.areAllServicesHealthy();

      return {
        overall,
        services: healthStatus,
        stats
      };
    } catch (error) {
      errorLog('Failed to get detailed health status:', error);
      return {
        overall: false,
        services: {},
        stats: {}
      };
    }
  }

  /**
   * Restart a specific service
   */
  public async restartService(serviceName: string): Promise<boolean> {
    return await this.serviceOrchestrator.restartService(serviceName);
  }

  /**
   * Get service statistics
   */
  public getServiceStats(): any {
    return this.serviceOrchestrator.getServiceStats();
  }

  /**
   * Store conversation context
   */
  public storeConversationContext(context: ConversationContext): void {
    this.serviceOrchestrator.contextMemoryService.storeConversationContext(context);
  }

  /**
   * Get conversation context
   */
  public getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.serviceOrchestrator.contextMemoryService.getConversationContext(sessionId);
  }

  /**
   * Store user preferences
   */
  public storeUserPreferences(userId: string, preferences: any): void {
    this.serviceOrchestrator.contextMemoryService.storeUserPreferences(userId, preferences);
  }

  /**
   * Get user preferences
   */
  public getUserPreferences(userId: string): any {
    return this.serviceOrchestrator.contextMemoryService.getUserPreferences(userId);
  }

  /**
   * Store object interaction
   */
  public storeObjectInteraction(userId: string, object: DemoObject): void {
    this.serviceOrchestrator.contextMemoryService.storeObjectInteraction(userId, object);
  }

  /**
   * Get object interaction history
   */
  public getObjectInteractionHistory(userId: string): DemoObject[] {
    return this.serviceOrchestrator.contextMemoryService.getObjectInteractionHistory(userId);
  }

  // ===== LETTA INTEGRATION METHODS =====

  /**
   * Sync conversation to Letta Cloud (non-blocking)
   * @param agentId - The Letta agent ID
   * @param transcript - User's voice transcript
   * @param response - AI assistant's response
   * @param metadata - Additional metadata for the conversation
   */
  public async syncToLetta(
    agentId: string, 
    transcript: string, 
    response: string, 
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const passage = {
        text: `User: ${transcript}\nAssistant: ${response}`,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'marvin-ar',
          ...metadata
        }
      };

      // Fire and forget - don't block the main conversation flow
      this.serviceOrchestrator.lettaService.syncPassage(agentId, passage)
        .catch(error => {
          errorLog('Letta sync failed (non-blocking):', error);
        });
    } catch (error) {
      errorLog('Failed to prepare Letta sync:', error);
    }
  }

  /**
   * Get conversation context from Letta
   * @param agentId - The Letta agent ID
   * @param objectContext - Current object context for relevant memories
   */
  public async getLettaContext(agentId: string, objectContext?: string): Promise<string> {
    await this.ensureInitialized();
    
    try {
      return await this.serviceOrchestrator.lettaService.getConversationContext(agentId, objectContext);
    } catch (error) {
      errorLog('Failed to get Letta context:', error);
      return '';
    }
  }

  /**
   * Search Letta passages for relevant information
   * @param agentId - The Letta agent ID
   * @param query - Search query
   * @param limit - Maximum number of results
   */
  public async searchLettaPassages(
    agentId: string, 
    query: string, 
    limit: number = 5
  ): Promise<LettaSearchResult> {
    await this.ensureInitialized();
    
    try {
      return await this.serviceOrchestrator.lettaService.searchPassages(agentId, query, limit);
    } catch (error) {
      errorLog('Failed to search Letta passages:', error);
      return { passages: [] } as LettaSearchResult;
    }
  }

  // ===== PHASE 2 SPECIALIZED METHODS =====

  /**
   * Process health reminders with medication timing logic
   * @param voiceText - User's voice input
   * @param imageData - Optional image of medicine bottle
   * @param currentTime - Optional current time override
   */
  public async processHealthReminder(
    voiceText: string,
    imageData?: string,
    currentTime?: string
  ): Promise<AIResponse> {
    this.ensureInitialized();
    
    try {
      const geminiResponse = await this.serviceOrchestrator.geminiService.processHealthReminder(
        voiceText,
        imageData,
        currentTime
      );

      // Convert Gemini response to AIResponse format
      return {
        content: geminiResponse.text,
        suggested_actions: [],
        confidence: geminiResponse.confidence || 0.8,
        context: 'health_reminder',
        voice_enabled: false
      };
    } catch (error) {
      errorLog('Health reminder processing failed:', error);
      return {
        content: 'I had trouble processing your health reminder request. Please try again.',
        suggested_actions: ['Try asking about medication timing'],
        confidence: 0.5,
        context: 'health_reminder',
        voice_enabled: false
      };
    }
  }

  /**
   * Process nutrition analysis with food visual analysis
   * @param voiceText - User's voice input
   * @param imageData - Image of food/breakfast
   * @param mimeType - Image MIME type
   */
  public async processNutritionAnalysis(
    voiceText: string,
    imageData: string,
    mimeType: string = 'image/jpeg'
  ): Promise<AIResponse> {
    this.ensureInitialized();
    
    try {
      const geminiResponse = await this.serviceOrchestrator.geminiService.processNutritionAnalysis(
        voiceText,
        imageData,
        mimeType
      );

      return {
        content: geminiResponse.text,
        suggested_actions: ['Get recipe suggestions', 'View nutritional breakdown'],
        confidence: geminiResponse.confidence || 0.8,
        context: 'nutrition_analysis',
        voice_enabled: false
      };
    } catch (error) {
      errorLog('Nutrition analysis failed:', error);
      return {
        content: 'I had trouble analyzing the nutrition information. Please try again.',
        suggested_actions: ['Try taking another photo', 'Ask for recipe suggestions'],
        confidence: 0.5,
        context: 'nutrition_analysis',
        voice_enabled: false
      };
    }
  }

  /**
   * Process productivity intelligence and task management
   * @param voiceText - User's voice input
   * @param currentTime - Optional current time override
   */
  public async processProductivityIntelligence(
    voiceText: string,
    currentTime?: string
  ): Promise<AIResponse> {
    this.ensureInitialized();
    
    try {
      const geminiResponse = await this.serviceOrchestrator.geminiService.processProductivityIntelligence(
        voiceText,
        currentTime
      );

      return {
        content: geminiResponse.text,
        suggested_actions: ['View task list', 'Set priorities', 'Get daily briefing'],
        confidence: geminiResponse.confidence || 0.8,
        context: 'productivity_intelligence',
        voice_enabled: false
      };
    } catch (error) {
      errorLog('Productivity intelligence failed:', error);
      return {
        content: 'I had trouble processing your productivity request. Please try again.',
        suggested_actions: ['Try asking about your tasks', 'Get daily priorities'],
        confidence: 0.5,
        context: 'productivity_intelligence',
        voice_enabled: false
      };
    }
  }

  /**
   * Process departure intelligence with time-based suggestions
   * @param voiceText - User's voice input
   * @param currentTime - Optional current time override
   */
  public async processDepartureIntelligence(
    voiceText: string,
    currentTime?: string
  ): Promise<AIResponse> {
    this.ensureInitialized();
    
    try {
      const geminiResponse = await this.serviceOrchestrator.geminiService.processDepartureIntelligence(
        voiceText,
        currentTime
      );

      return {
        content: geminiResponse.text,
        suggested_actions: ['Check departure checklist', 'Get commute time', 'Prepare to leave'],
        confidence: geminiResponse.confidence || 0.8,
        context: 'departure_intelligence',
        voice_enabled: false
      };
    } catch (error) {
      errorLog('Departure intelligence failed:', error);
      return {
        content: 'I had trouble processing your departure request. Please try again.',
        suggested_actions: ['Check what to bring', 'Get travel time'],
        confidence: 0.5,
        context: 'departure_intelligence',
        voice_enabled: false
      };
    }
  }

  /**
   * Shutdown all services gracefully
   */
  public async shutdown(): Promise<void> {
    await this.serviceOrchestrator.shutdown();
  }
}