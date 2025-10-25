// Main AI & Voice Integration Service - Dev 2 Phase 3
// Orchestrates all AI and voice services with modular architecture

import { secureLog, safeLog, errorLog } from '../utils/secureLogger';
import { AIResponse, ConversationContext, DemoObject } from '../types';
import { ServiceOrchestrator } from './aiVoiceIntegration/serviceOrchestrator';
import { RequestProcessor, VoiceRequest, MultimodalRequest, VisualRequest } from './aiVoiceIntegration/requestProcessor';

export class AIVoiceIntegrationService {
  private serviceOrchestrator: ServiceOrchestrator;
  private requestProcessor: RequestProcessor;

  constructor() {
    this.serviceOrchestrator = new ServiceOrchestrator();
    this.requestProcessor = new RequestProcessor(this.serviceOrchestrator);
    
    // Initialize Phase 3 services
    this.initializePhase3Services();
    
    safeLog('🎯 AI Voice Integration Service initialized');
  }

  /**
   * Initialize Phase 3 services
   */
  private async initializePhase3Services(): Promise<void> {
    await this.serviceOrchestrator.initializePhase3Services();
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
      await this.serviceOrchestrator.enhancedElevenLabsService.simulateDemoLearningProgression(userId);
      
      return {
        response: 'Demo learning progression simulated successfully',
        confidence: 0.9,
        suggested_actions: ['View progression', 'Get insights', 'Continue demo'],
        intent: 'demo_progression',
        entities: { user_id: userId }
      };
    } catch (error) {
      errorLog('Demo learning progression error:', error);
      return {
        response: 'Failed to simulate demo learning progression',
        confidence: 0.3,
        suggested_actions: ['Try again', 'Get help'],
        intent: 'error',
        entities: {}
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
      
      secureLog('Service health status:', healthStatus);
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

  /**
   * Shutdown all services gracefully
   */
  public async shutdown(): Promise<void> {
    await this.serviceOrchestrator.shutdown();
  }
}