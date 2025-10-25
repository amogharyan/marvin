// Synthetic AR Data Service - Dev 2 Phase 3
// Simulates realistic Snap Spectacles audio input for hackathon demo
// Easy to replace with real data when Snap Spectacles integration is complete

import { secureLog, debugLog } from '../utils/secureLogger';
import { ChromaService } from './chromaService';
import { LearningSimulationService } from './learningSimulationService';
import { LEARNING_CONSTANTS } from '../constants/learningConstants';
import { ConversationRole, ReminderFrequency } from '../types/enums';

export interface SyntheticARInteraction {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  objectType: 'medicine_bottle' | 'breakfast_bowl' | 'laptop' | 'keys' | 'phone';
  audioInput: string;
  context: {
    timeOfDay: string;
    location: string;
    userState: string;
  };
  expectedResponse: {
    intent: string;
    entities: Record<string, any>;
    suggestedActions: string[];
  };
}

export class SyntheticARDataService {
  private chromaService: ChromaService;
  private learningService: LearningSimulationService;
  private isInitialized = false;

  constructor(chromaService: ChromaService, learningService: LearningSimulationService) {
    this.chromaService = chromaService;
    this.learningService = learningService;
  }

  /**
   * Initialize synthetic data service
   */
  async initialize(): Promise<void> {
    try {
      await this.generateMorningRoutineData();
      this.isInitialized = true;
      secureLog('✅ Synthetic AR Data Service initialized with morning routine data');
    } catch (error) {
      debugLog('Failed to initialize synthetic AR data:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Generate realistic morning routine data based on PRD use cases
   */
  private async generateMorningRoutineData(): Promise<void> {
    const userId = 'demo-user-morning';
    const sessionId = 'morning-routine-session';
    
    // Morning routine interactions (7:00 AM - 9:00 AM)
    const morningInteractions: SyntheticARInteraction[] = [
      // 7:00 AM - Medicine Reminder
      {
        id: 'med-001',
        timestamp: new Date('2025-10-25T07:00:00Z'),
        userId,
        sessionId,
        objectType: 'medicine_bottle',
        audioInput: "Hey Marvin, I need to take my morning medicine. What's my schedule?",
        context: {
          timeOfDay: 'morning',
          location: 'bathroom',
          userState: 'waking_up'
        },
        expectedResponse: {
          intent: 'medicine_reminder',
          entities: { medication: 'morning_vitamins', time: '7:00 AM' },
          suggestedActions: ['Show medicine schedule', 'Set reminder', 'Track medication']
        }
      },

      // 7:15 AM - Medicine Follow-up
      {
        id: 'med-002',
        timestamp: new Date('2025-10-25T07:15:00Z'),
        userId,
        sessionId,
        objectType: 'medicine_bottle',
        audioInput: "I took my vitamins. Can you remind me about my blood pressure medication?",
        context: {
          timeOfDay: 'morning',
          location: 'bathroom',
          userState: 'medication_taken'
        },
        expectedResponse: {
          intent: 'medicine_query',
          entities: { medication: 'blood_pressure', status: 'taken' },
          suggestedActions: ['Track medication', 'Set next reminder', 'Health summary']
        }
      },

      // 7:30 AM - Breakfast Analysis
      {
        id: 'breakfast-001',
        timestamp: new Date('2025-10-25T07:30:00Z'),
        userId,
        sessionId,
        objectType: 'breakfast_bowl',
        audioInput: "What's for breakfast today? I have cereal and fruit here.",
        context: {
          timeOfDay: 'morning',
          location: 'kitchen',
          userState: 'preparing_breakfast'
        },
        expectedResponse: {
          intent: 'breakfast_analysis',
          entities: { food: 'cereal_and_fruit', meal: 'breakfast' },
          suggestedActions: ['Nutrition analysis', 'Recipe suggestions', 'Health tips']
        }
      },

      // 7:45 AM - Breakfast Nutrition
      {
        id: 'breakfast-002',
        timestamp: new Date('2025-10-25T07:45:00Z'),
        userId,
        sessionId,
        objectType: 'breakfast_bowl',
        audioInput: "How many calories is this? And what about protein content?",
        context: {
          timeOfDay: 'morning',
          location: 'kitchen',
          userState: 'eating_breakfast'
        },
        expectedResponse: {
          intent: 'nutrition_query',
          entities: { nutrients: ['calories', 'protein'], meal: 'breakfast' },
          suggestedActions: ['Nutrition breakdown', 'Health goals', 'Meal planning']
        }
      },

      // 8:00 AM - Laptop Calendar Briefing
      {
        id: 'laptop-001',
        timestamp: new Date('2025-10-25T08:00:00Z'),
        userId,
        sessionId,
        objectType: 'laptop',
        audioInput: "Good morning Marvin. What's on my schedule today?",
        context: {
          timeOfDay: 'morning',
          location: 'home_office',
          userState: 'starting_work'
        },
        expectedResponse: {
          intent: 'calendar_briefing',
          entities: { schedule: 'daily_overview', time: 'morning' },
          suggestedActions: ['Show calendar', 'Meeting prep', 'Task priorities']
        }
      },

      // 8:15 AM - Meeting Preparation
      {
        id: 'laptop-002',
        timestamp: new Date('2025-10-25T08:15:00Z'),
        userId,
        sessionId,
        objectType: 'laptop',
        audioInput: "I have a meeting at 9 AM. What do I need to prepare?",
        context: {
          timeOfDay: 'morning',
          location: 'home_office',
          userState: 'meeting_prep'
        },
        expectedResponse: {
          intent: 'meeting_preparation',
          entities: { meeting: '9_am', preparation: 'required' },
          suggestedActions: ['Meeting agenda', 'Document prep', 'Time reminder']
        }
      },

      // 8:45 AM - Keys Location
      {
        id: 'keys-001',
        timestamp: new Date('2025-10-25T08:45:00Z'),
        userId,
        sessionId,
        objectType: 'keys',
        audioInput: "Where are my keys? I need to leave soon.",
        context: {
          timeOfDay: 'morning',
          location: 'living_room',
          userState: 'preparing_to_leave'
        },
        expectedResponse: {
          intent: 'item_location',
          entities: { item: 'keys', urgency: 'high' },
          suggestedActions: ['Show location', 'Departure checklist', 'Time reminder']
        }
      },

      // 8:50 AM - Departure Checklist
      {
        id: 'keys-002',
        timestamp: new Date('2025-10-25T08:50:00Z'),
        userId,
        sessionId,
        objectType: 'keys',
        audioInput: "Am I ready to leave? Do I have everything?",
        context: {
          timeOfDay: 'morning',
          location: 'front_door',
          userState: 'final_check'
        },
        expectedResponse: {
          intent: 'departure_checklist',
          entities: { checklist: 'complete', time: 'departure' },
          suggestedActions: ['Final checklist', 'Weather check', 'Traffic update']
        }
      },

      // 8:55 AM - Phone Integration
      {
        id: 'phone-001',
        timestamp: new Date('2025-10-25T08:55:00Z'),
        userId,
        sessionId,
        objectType: 'phone',
        audioInput: "Sync my phone with today's schedule and reminders.",
        context: {
          timeOfDay: 'morning',
          location: 'front_door',
          userState: 'final_sync'
        },
        expectedResponse: {
          intent: 'phone_sync',
          entities: { sync: 'schedule_and_reminders', device: 'phone' },
          suggestedActions: ['Sync calendar', 'Update reminders', 'Backup data']
        }
      }
    ];

    // Store each interaction in Chroma
    for (const interaction of morningInteractions) {
      await this.storeSyntheticInteraction(interaction);
    }

    // Simulate learning progression
    await this.learningService.simulateDemoProgression(userId);
    
    secureLog(`📊 Generated ${morningInteractions.length} synthetic AR interactions for morning routine`);
  }

  /**
   * Store synthetic interaction in Chroma
   */
  private async storeSyntheticInteraction(interaction: SyntheticARInteraction): Promise<void> {
    try {
      // Store conversation context
      await this.chromaService.storeConversationContext(
        interaction.sessionId,
        interaction.userId,
        {
          user_id: interaction.userId,
          session_id: interaction.sessionId,
          conversation_history: [
            {
              role: ConversationRole.USER,
              content: interaction.audioInput,
              timestamp: interaction.timestamp
            },
            {
              role: ConversationRole.ASSISTANT,
              content: `I understand you're asking about ${interaction.objectType}. Let me help you with that.`,
              timestamp: new Date(interaction.timestamp.getTime() + 1000)
            }
          ],
          user_preferences: {
            voice_settings: {
              preferred_voice: 'marvin_voice',
              speech_rate: 1.0,
              pitch: 1.0
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
        },
        {
          id: `demo-${interaction.objectType}-${interaction.id}`,
          name: interaction.objectType,
          detection_confidence: LEARNING_CONSTANTS.CONFIDENCE.SYNTHETIC_DETECTION,
          spatial_position: { x: 0, y: 0, z: 0 },
          last_interaction: interaction.timestamp,
          associated_actions: interaction.expectedResponse.suggestedActions
        }
      );

      // Store learning pattern
      await this.chromaService.storeLearningPattern(interaction.userId, {
        id: `pattern-${interaction.id}`,
        patternType: 'routine',
        data: {
          object_type: interaction.objectType,
          time_pattern: interaction.context.timeOfDay,
          interaction_frequency: 1,
          user_preferences: interaction.expectedResponse.intent
        },
        confidence: LEARNING_CONSTANTS.CONFIDENCE.SYNTHETIC_LEARNING_PATTERN,
        frequency: 1,
        lastSeen: interaction.timestamp,
        userId: interaction.userId
      });

      debugLog(`Stored synthetic interaction: ${interaction.objectType} - ${interaction.audioInput}`);
    } catch (error) {
      debugLog(`Failed to store synthetic interaction ${interaction.id}:`, error);
    }
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
    return {
      totalInteractions: 9,
      objectTypes: ['medicine_bottle', 'breakfast_bowl', 'laptop', 'keys', 'phone'],
      timeRange: '7:00 AM - 8:55 AM',
      learningStage: 'day_7'
    };
  }

  /**
   * Health check for synthetic data service
   */
  async healthCheck(): Promise<boolean> {
    return this.isInitialized;
  }
}
