// Learning Simulation Service - Dev 2 Phase 3
// Simulates "Day 1 vs Day 30" learning progression for demo purposes

import { secureLog, errorLog, debugLog } from '../utils/secureLogger';
import { ChromaService, LearningPattern, PersonalizedSuggestion } from './chromaService';
import { ConversationContext, DemoObject, UserPreferences } from '../types';
import { LEARNING_CONSTANTS } from '../constants/learningConstants';

export interface LearningStage {
  stage: 'day_1' | 'day_7' | 'day_30';
  description: string;
  characteristics: string[];
  personalizationLevel: number; // 0-1 scale
}

export interface SimulatedLearningData {
  userId: string;
  currentStage: LearningStage;
  totalInteractions: number;
  patternsLearned: number;
  preferencesIdentified: number;
  lastInteraction: Date;
  learningMetrics: {
    suggestionAccuracy: number;
    userSatisfaction: number;
    responseRelevance: number;
  };
}

export class LearningSimulationService {
  private chromaService: ChromaService;
  private learningData: Map<string, SimulatedLearningData> = new Map();
  private demoMode: boolean = true;

  // Pre-defined learning stages for demo
  private readonly LEARNING_STAGES: LearningStage[] = [
    {
      stage: 'day_1',
      description: 'Initial Learning Phase',
      characteristics: [
        'Generic responses and suggestions',
        'Basic object recognition',
        'Learning user preferences',
        'Establishing interaction patterns'
      ],
      personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_1
    },
    {
      stage: 'day_7',
      description: 'Pattern Recognition Phase',
      characteristics: [
        'Recognizing routine patterns',
        'Personalized timing suggestions',
        'Adaptive responses based on context',
        'Learning object interaction preferences'
      ],
      personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_7
    },
    {
      stage: 'day_30',
      description: 'Advanced Personalization Phase',
      characteristics: [
        'Predictive assistance',
        'Highly personalized suggestions',
        'Proactive routine optimization',
        'Advanced pattern recognition'
      ],
      personalizationLevel: LEARNING_CONSTANTS.THRESHOLDS.PERSONALIZATION_DAY_30
    }
  ];

  constructor(chromaService: ChromaService) {
    this.chromaService = chromaService;
    secureLog('🎓 Learning Simulation Service initialized');
  }

  /**
   * Initialize learning data for a user
   */
  public async initializeUserLearning(userId: string): Promise<void> {
    const learningData: SimulatedLearningData = {
      userId,
      currentStage: this.LEARNING_STAGES[0], // Start at day_1
      totalInteractions: 0,
      patternsLearned: 0,
      preferencesIdentified: 0,
      lastInteraction: new Date(),
      learningMetrics: {
        suggestionAccuracy: LEARNING_CONSTANTS.THRESHOLDS.MEDIUM_THRESHOLD,
        userSatisfaction: LEARNING_CONSTANTS.THRESHOLDS.MEDIUM_THRESHOLD,
        responseRelevance: LEARNING_CONSTANTS.THRESHOLDS.MEDIUM_THRESHOLD
      }
    };

    this.learningData.set(userId, learningData);
    debugLog(`Initialized learning data for user: ${userId}`);
  }

  /**
   * Simulate learning progression based on interactions
   */
  public async simulateLearningProgression(
    userId: string,
    interaction: {
      objectContext?: DemoObject;
      userResponse?: string;
      suggestionAccepted?: boolean;
      timeOfDay?: string;
    }
  ): Promise<LearningStage> {
    let userData = this.learningData.get(userId);
    if (!userData) {
      await this.initializeUserLearning(userId);
      userData = this.learningData.get(userId)!;
    }

    // Increment interaction count
    userData.totalInteractions++;
    userData.lastInteraction = new Date();

    // Simulate pattern learning based on interactions
    if (interaction.objectContext) {
      await this.simulatePatternLearning(userId, interaction);
    }

    // Update learning metrics based on user feedback
    if (interaction.suggestionAccepted !== undefined) {
      this.updateLearningMetrics(userData, interaction.suggestionAccepted);
    }

    // Determine if user should progress to next stage
    const newStage = this.determineLearningStage(userData);
    if (newStage !== userData.currentStage) {
      userData.currentStage = newStage;
      debugLog(`User ${userId} progressed to ${newStage.stage} stage`);
    }

    return userData.currentStage;
  }

  /**
   * Simulate pattern learning from interactions
   */
  private async simulatePatternLearning(
    userId: string,
    interaction: { objectContext?: DemoObject; timeOfDay?: string }
  ): Promise<void> {
    const userData = this.learningData.get(userId);
    if (!userData) return;

    // Simulate routine pattern learning
    if (interaction.timeOfDay) {
      const routinePattern: LearningPattern = {
        id: `routine_${userId}_${Date.now()}`,
        patternType: 'routine',
        data: {
          time_patterns: [interaction.timeOfDay],
          object_interactions: [interaction.objectContext?.name],
          frequency: userData.totalInteractions
        },
        confidence: Math.min(
          LEARNING_CONSTANTS.CONFIDENCE.MAX_ROUTINE_PATTERN,
          LEARNING_CONSTANTS.CONFIDENCE.BASE_ROUTINE + 
          (userData.totalInteractions * LEARNING_CONSTANTS.CONFIDENCE.INCREMENT_PER_INTERACTION)
        ),
        frequency: userData.totalInteractions,
        lastSeen: new Date(),
        userId
      };

      await this.chromaService.storeLearningPattern(userId, routinePattern);
      userData.patternsLearned++;
    }

    // Simulate preference learning
    if (interaction.objectContext) {
      const preferencePattern: LearningPattern = {
        id: `preference_${userId}_${interaction.objectContext.name}`,
        patternType: 'preference',
        data: {
          preferred_objects: [interaction.objectContext.name],
          interaction_frequency: 1,
          last_interaction: new Date()
        },
        confidence: Math.min(
          LEARNING_CONSTANTS.CONFIDENCE.MAX_PREFERENCE_PATTERN,
          LEARNING_CONSTANTS.CONFIDENCE.BASE_PREFERENCE + 
          (userData.totalInteractions * LEARNING_CONSTANTS.CONFIDENCE.PREFERENCE_INCREMENT)
        ),
        frequency: 1,
        lastSeen: new Date(),
        userId
      };

      await this.chromaService.storeLearningPattern(userId, preferencePattern);
      userData.preferencesIdentified++;
    }
  }

  /**
   * Update learning metrics based on user feedback
   */
  private updateLearningMetrics(
    userData: SimulatedLearningData,
    suggestionAccepted: boolean
  ): void {
    const learningRate = LEARNING_CONSTANTS.LEARNING_RATE.BASE;
    
    if (suggestionAccepted) {
      userData.learningMetrics.suggestionAccuracy = Math.min(1.0, 
        userData.learningMetrics.suggestionAccuracy + learningRate
      );
      userData.learningMetrics.userSatisfaction = Math.min(1.0,
        userData.learningMetrics.userSatisfaction + learningRate
      );
      userData.learningMetrics.responseRelevance = Math.min(1.0,
        userData.learningMetrics.responseRelevance + learningRate
      );
    } else {
      userData.learningMetrics.suggestionAccuracy = Math.max(
        LEARNING_CONSTANTS.THRESHOLDS.LEARNING_METRICS_MIN,
        userData.learningMetrics.suggestionAccuracy - learningRate * LEARNING_CONSTANTS.LEARNING_RATE.DECREASE_FACTOR
      );
      userData.learningMetrics.responseRelevance = Math.max(
        LEARNING_CONSTANTS.THRESHOLDS.LEARNING_METRICS_MIN,
        userData.learningMetrics.responseRelevance - learningRate * LEARNING_CONSTANTS.LEARNING_RATE.DECREASE_FACTOR
      );
    }
  }

  /**
   * Determine learning stage based on user data
   */
  private determineLearningStage(userData: SimulatedLearningData): LearningStage {
    const { totalInteractions, patternsLearned, learningMetrics } = userData;
    
    // Calculate overall learning score
    const learningScore = (
      learningMetrics.suggestionAccuracy +
      learningMetrics.userSatisfaction +
      learningMetrics.responseRelevance +
      (patternsLearned / 10) + // Normalize pattern count
      (totalInteractions / 50) // Normalize interaction count
    ) / 5;

    // Determine stage based on learning score
    if (learningScore >= LEARNING_CONSTANTS.THRESHOLDS.DAY_30_SCORE) {
      return this.LEARNING_STAGES[2]; // day_30
    } else if (learningScore >= LEARNING_CONSTANTS.THRESHOLDS.DAY_7_SCORE) {
      return this.LEARNING_STAGES[1]; // day_7
    } else {
      return this.LEARNING_STAGES[0]; // day_1
    }
  }

  /**
   * Generate stage-appropriate suggestions
   */
  public async generateStageAppropriateSuggestions(
    userId: string,
    context: string,
    objectContext?: DemoObject
  ): Promise<PersonalizedSuggestion[]> {
    const userData = this.learningData.get(userId);
    if (!userData) {
      await this.initializeUserLearning(userId);
      return this.generateStageAppropriateSuggestions(userId, context, objectContext);
    }

    const stage = userData.currentStage;
    
    // Generate base suggestions from Chroma
    const baseSuggestions = await this.chromaService.generatePersonalizedSuggestions(
      userId,
      context,
      objectContext
    );

    // Modify suggestions based on learning stage
    return baseSuggestions.map(suggestion => ({
      ...suggestion,
      learningStage: stage.stage,
      confidence: suggestion.confidence * stage.personalizationLevel,
      suggestion: this.adaptSuggestionForStage(suggestion.suggestion, stage)
    }));
  }

  /**
   * Adapt suggestion text based on learning stage
   */
  private adaptSuggestionForStage(suggestion: string, stage: LearningStage): string {
    switch (stage.stage) {
      case 'day_1':
        return `[Learning Mode] ${suggestion}`;
      case 'day_7':
        return `[Adapting] ${suggestion}`;
      case 'day_30':
        return `[Personalized] ${suggestion}`;
      default:
        return suggestion;
    }
  }

  /**
   * Get learning progression summary for demo
   */
  public getLearningProgressionSummary(userId: string): {
    currentStage: LearningStage;
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
  } {
    const userData = this.learningData.get(userId);
    if (!userData) {
      throw new Error(`No learning data found for user: ${userId}`);
    }

    const overallProgress = (
      userData.learningMetrics.suggestionAccuracy +
      userData.learningMetrics.userSatisfaction +
      userData.learningMetrics.responseRelevance
    ) / 3;

    const nextMilestone = this.getNextMilestone(userData);

    return {
      currentStage: userData.currentStage,
      progress: {
        interactions: userData.totalInteractions,
        patternsLearned: userData.patternsLearned,
        preferencesIdentified: userData.preferencesIdentified,
        overallProgress
      },
      metrics: userData.learningMetrics,
      nextMilestone
    };
  }

  /**
   * Get next learning milestone
   */
  private getNextMilestone(userData: SimulatedLearningData): string {
    const { currentStage, totalInteractions, patternsLearned } = userData;

    switch (currentStage.stage) {
      case 'day_1':
        if (totalInteractions < 5) {
          return 'Complete 5 interactions to unlock pattern recognition';
        }
        return 'Reach 10 interactions to advance to Day 7 stage';
      
      case 'day_7':
        if (patternsLearned < 3) {
          return 'Learn 3 patterns to unlock advanced personalization';
        }
        return 'Reach 20 interactions to advance to Day 30 stage';
      
      case 'day_30':
        return 'Master level achieved! Continue optimizing your experience';
      
      default:
        return 'Continue interacting to improve personalization';
    }
  }

  /**
   * Simulate demo progression (for hackathon demo)
   */
  public async simulateDemoProgression(userId: string): Promise<void> {
    // Simulate rapid learning for demo purposes
    const userData = this.learningData.get(userId);
    if (!userData) {
      await this.initializeUserLearning(userId);
      return;
    }

    // Simulate multiple interactions to show progression
    const demoInteractions = [
      { objectContext: { name: 'medicine_bottle', id: 'demo_1', detection_confidence: LEARNING_CONSTANTS.CONFIDENCE.SYNTHETIC_DETECTION, spatial_position: { x: 0, y: 0, z: 0 }, last_interaction: new Date(), associated_actions: [] }, timeOfDay: 'morning' },
      { objectContext: { name: 'breakfast_bowl', id: 'demo_2', detection_confidence: LEARNING_CONSTANTS.CONFIDENCE.SYNTHETIC_DETECTION, spatial_position: { x: 0, y: 0, z: 0 }, last_interaction: new Date(), associated_actions: [] }, timeOfDay: 'morning' },
      { objectContext: { name: 'laptop', id: 'demo_3', detection_confidence: LEARNING_CONSTANTS.CONFIDENCE.SYNTHETIC_DETECTION, spatial_position: { x: 0, y: 0, z: 0 }, last_interaction: new Date(), associated_actions: [] }, timeOfDay: 'morning' },
      { objectContext: { name: 'keys', id: 'demo_4', detection_confidence: LEARNING_CONSTANTS.CONFIDENCE.SYNTHETIC_DETECTION, spatial_position: { x: 0, y: 0, z: 0 }, last_interaction: new Date(), associated_actions: [] }, timeOfDay: 'morning' },
      { objectContext: { name: 'phone', id: 'demo_5', detection_confidence: LEARNING_CONSTANTS.CONFIDENCE.SYNTHETIC_DETECTION, spatial_position: { x: 0, y: 0, z: 0 }, last_interaction: new Date(), associated_actions: [] }, timeOfDay: 'morning' }
    ];

    for (const interaction of demoInteractions) {
      await this.simulateLearningProgression(userId, {
        ...interaction,
        suggestionAccepted: true
      });
    }

    debugLog(`Simulated demo progression for user: ${userId}`);
  }

  /**
   * Health check for learning simulation service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Check if Chroma service is healthy
      const chromaHealthy = await this.chromaService.healthCheck();
      
      // Check learning data integrity
      const dataIntegrity = Array.from(this.learningData.values()).every(data => 
        data.userId && data.currentStage && data.totalInteractions >= 0
      );

      return chromaHealthy && dataIntegrity;
    } catch (error) {
      errorLog('Learning simulation health check failed:', error);
      return false;
    }
  }

  /**
   * Reset learning data for testing
   */
  public async resetLearningData(userId: string): Promise<void> {
    this.learningData.delete(userId);
    await this.chromaService.cleanupTestData();
    debugLog(`Reset learning data for user: ${userId}`);
  }
}
