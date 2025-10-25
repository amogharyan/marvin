// Enhanced ElevenLabs Conversational AI Platform Integration - Dev 2 Phase 3
// Orchestrates voice agent management, intent extraction, and conversational processing

import { secureLog, errorLog, debugLog } from '../utils/secureLogger';
import { ChromaService } from './chromaService';
import { LearningSimulationService } from './learningSimulationService';
import { ConversationalProcessor, ConversationalAIRequest, ConversationalAIResponse } from './elevenlabs/conversationalProcessor';
import { VoiceAgentManager, VoiceAgent } from './elevenlabs/voiceAgentManager';
import { IntentExtractor, ExtractedIntent } from './elevenlabs/intentExtractor';

export class EnhancedElevenLabsService {
  private conversationalProcessor: ConversationalProcessor;
  private voiceAgentManager: VoiceAgentManager;
  private intentExtractor: IntentExtractor;
  private chromaService: ChromaService;
  private learningService: LearningSimulationService;
  private isInitialized: boolean = false;

  constructor(chromaService: ChromaService, learningService: LearningSimulationService) {
    this.chromaService = chromaService;
    this.learningService = learningService;
    this.conversationalProcessor = new ConversationalProcessor(chromaService, learningService);
    this.voiceAgentManager = new VoiceAgentManager();
    this.intentExtractor = new IntentExtractor();
  }

  /**
   * Initialize the enhanced ElevenLabs service
   */
  public async initialize(): Promise<void> {
    try {
      await this.conversationalProcessor.initialize();
      this.isInitialized = true;
      secureLog('✅ Enhanced ElevenLabs Service initialized successfully');
    } catch (error) {
      errorLog('Failed to initialize Enhanced ElevenLabs Service:', error);
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
      return await this.conversationalProcessor.processConversationalRequest(request);
    } catch (error) {
      errorLog('Failed to process conversational request:', error);
      throw error;
    }
  }

  /**
   * Register a new voice agent
   */
  public registerVoiceAgent(agent: VoiceAgent): void {
    // This would integrate with the voice agent manager
    debugLog(`Registering voice agent: ${agent.name}`);
  }

  /**
   * Get voice agent by ID
   */
  public getVoiceAgent(agentId: string): VoiceAgent | undefined {
    return this.voiceAgentManager.getVoiceAgent(agentId);
  }

  /**
   * Get all available voice agents
   */
  public getAllVoiceAgents(): VoiceAgent[] {
    return this.voiceAgentManager.getAllVoiceAgents();
  }

  /**
   * Extract intent from voice text
   */
  public extractIntent(voiceText: string, objectContext?: any): ExtractedIntent {
    return this.intentExtractor.extractIntent(voiceText, objectContext);
  }

  /**
   * Build system prompt for voice agent
   */
  public buildSystemPrompt(
    agentId: string,
    userContext: string,
    objectContext?: any,
    learningStage?: string,
    additionalContext?: Record<string, string>
  ): string {
    const agent = this.voiceAgentManager.getVoiceAgent(agentId);
    if (!agent) {
      throw new Error(`Voice agent not found: ${agentId}`);
    }

    return this.voiceAgentManager.buildSystemPrompt(
      agent,
      userContext,
      objectContext,
      learningStage,
      additionalContext
    );
  }

  /**
   * Get suggested actions based on intent
   */
  public getSuggestedActions(intent: string, entities: Record<string, any>): string[] {
    return this.intentExtractor.getSuggestedActions(intent, entities);
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const processorHealth = await this.conversationalProcessor.healthCheck();
      return this.isInitialized && processorHealth;
    } catch (error) {
      errorLog('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get service statistics
   */
  public getServiceStats(): {
    isInitialized: boolean;
    availableAgents: number;
    supportedIntents: number;
  } {
    return {
      isInitialized: this.isInitialized,
      availableAgents: this.voiceAgentManager.getAllVoiceAgents().length,
      supportedIntents: Object.keys(this.intentExtractor['intentMap']).length
    };
  }
}

// Re-export interfaces for backward compatibility
export type { ConversationalAIRequest, ConversationalAIResponse, VoiceAgent, ExtractedIntent };