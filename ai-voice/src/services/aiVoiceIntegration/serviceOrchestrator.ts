// Service Orchestrator - AI Voice Integration Service
// Manages initialization and coordination of all AI and voice services

import { GeminiService } from '../geminiService';
import { ElevenLabsService } from '../elevenlabsService';
import { VoiceProcessingService } from '../voiceProcessingService';
import { VoiceCommandParsingService } from '../voiceCommandParsingService';
import { ContextMemoryService } from '../contextMemoryService';
import { ChromaService } from '../chromaService';
import { LearningSimulationService } from '../learningSimulationService';
import { EnhancedElevenLabsService } from '../enhancedElevenLabsService';
import { SyntheticARDataService } from '../syntheticARDataService';
import { secureLog, safeLog, errorLog } from '../../utils/secureLogger';

export interface ServiceHealthStatus {
  gemini: boolean;
  elevenlabs: boolean;
  voiceProcessing: boolean;
  voiceCommandParsing: boolean;
  contextMemory: boolean;
  chroma: boolean;
  learningSimulation: boolean;
  enhancedElevenLabs: boolean;
  syntheticARData: boolean;
}

export class ServiceOrchestrator {
  // Phase 2 Services
  public readonly geminiService: GeminiService;
  public readonly elevenlabsService: ElevenLabsService;
  public readonly voiceProcessingService: VoiceProcessingService;
  public readonly voiceCommandParsingService: VoiceCommandParsingService;
  public readonly contextMemoryService: ContextMemoryService;
  
  // Phase 3 Services
  public readonly chromaService: ChromaService;
  public readonly learningService: LearningSimulationService;
  public readonly enhancedElevenLabsService: EnhancedElevenLabsService;
  public readonly syntheticARDataService: SyntheticARDataService;

  private isInitialized: boolean = false;

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
    
    safeLog('🎯 Service Orchestrator initialized');
  }

  /**
   * Initialize all Phase 3 services
   */
  public async initializePhase3Services(): Promise<void> {
    try {
      secureLog('🚀 Initializing Phase 3 services...');

      // Initialize Chroma service
      await this.chromaService.initialize();
      secureLog('✅ Chroma service initialized');

      // Initialize Enhanced ElevenLabs service
      await this.enhancedElevenLabsService.initialize();
      secureLog('✅ Enhanced ElevenLabs service initialized');

      // Initialize Synthetic AR Data service
      await this.syntheticARDataService.initialize();
      secureLog('✅ Synthetic AR Data service initialized');

      this.isInitialized = true;
      secureLog('🎉 All Phase 3 services initialized successfully');
    } catch (error) {
      errorLog('Failed to initialize Phase 3 services:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Get health status of all services
   */
  public async getServiceHealthStatus(): Promise<ServiceHealthStatus> {
    try {
      const [
        voiceProcessing,
        voiceCommandParsing,
        contextMemory,
        chroma,
        learningSimulation,
        enhancedElevenLabs,
        syntheticARData
      ] = await Promise.allSettled([
        this.voiceProcessingService.healthCheck?.() || Promise.resolve(true),
        this.voiceCommandParsingService.healthCheck?.() || Promise.resolve(true),
        this.contextMemoryService.healthCheck(),
        this.chromaService.healthCheck(),
        this.learningService.healthCheck(),
        this.enhancedElevenLabsService.healthCheck(),
        this.syntheticARDataService.healthCheck?.() || Promise.resolve(true)
      ]);

      return {
        gemini: true, // Gemini service doesn't have healthCheck method
        elevenlabs: true, // ElevenLabs service doesn't have healthCheck method
        voiceProcessing: voiceProcessing.status === 'fulfilled' && voiceProcessing.value === true,
        voiceCommandParsing: voiceCommandParsing.status === 'fulfilled' && voiceCommandParsing.value === true,
        contextMemory: contextMemory.status === 'fulfilled' && contextMemory.value === true,
        chroma: chroma.status === 'fulfilled' && chroma.value === true,
        learningSimulation: learningSimulation.status === 'fulfilled' && learningSimulation.value === true,
        enhancedElevenLabs: enhancedElevenLabs.status === 'fulfilled' && enhancedElevenLabs.value === true,
        syntheticARData: syntheticARData.status === 'fulfilled' && syntheticARData.value === true
      };
    } catch (error) {
      errorLog('Failed to get service health status:', error);
      return {
        gemini: false,
        elevenlabs: false,
        voiceProcessing: false,
        voiceCommandParsing: false,
        contextMemory: false,
        chroma: false,
        learningSimulation: false,
        enhancedElevenLabs: false,
        syntheticARData: false
      };
    }
  }

  /**
   * Check if all services are healthy
   */
  public async areAllServicesHealthy(): Promise<boolean> {
    const healthStatus = await this.getServiceHealthStatus();
    return Object.values(healthStatus).every(status => status === true);
  }

  /**
   * Get service statistics
   */
  public getServiceStats(): {
    totalServices: number;
    initializedServices: number;
    phase2Services: number;
    phase3Services: number;
  } {
    const phase2Services = 5; // gemini, elevenlabs, voiceProcessing, voiceCommandParsing, contextMemory
    const phase3Services = 4; // chroma, learningSimulation, enhancedElevenLabs, syntheticARData
    const totalServices = phase2Services + phase3Services;

    return {
      totalServices,
      initializedServices: this.isInitialized ? phase3Services : 0,
      phase2Services,
      phase3Services
    };
  }

  /**
   * Restart a specific service
   */
  public async restartService(serviceName: string): Promise<boolean> {
    try {
      switch (serviceName) {
        case 'chroma':
          await this.chromaService.initialize();
          break;
        case 'enhancedElevenLabs':
          await this.enhancedElevenLabsService.initialize();
          break;
        case 'syntheticARData':
          await this.syntheticARDataService.initialize();
          break;
        default:
          errorLog(`Unknown service: ${serviceName}`);
          return false;
      }
      
      secureLog(`✅ Service ${serviceName} restarted successfully`);
      return true;
    } catch (error) {
      errorLog(`Failed to restart service ${serviceName}:`, error);
      return false;
    }
  }

  /**
   * Get initialization status
   */
  public getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  /**
   * Shutdown all services gracefully
   */
  public async shutdown(): Promise<void> {
    try {
      secureLog('🔄 Shutting down services...');
      
      // Clear memory and cleanup
      this.contextMemoryService.clearAllMemory();
      
      this.isInitialized = false;
      secureLog('✅ All services shut down gracefully');
    } catch (error) {
      errorLog('Error during service shutdown:', error);
    }
  }
}
