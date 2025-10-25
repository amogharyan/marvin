// Learning Constants - Phase 3 Dev 2
// Centralized configuration for all learning-related magic numbers
// Improves maintainability and makes tuning easier

export const LEARNING_CONSTANTS = {
  CONFIDENCE: {
    // Routine Pattern Confidence
    MAX_ROUTINE_PATTERN: 0.9,
    BASE_ROUTINE: 0.5,
    INCREMENT_PER_INTERACTION: 0.05,
    
    // Preference Pattern Confidence
    MAX_PREFERENCE_PATTERN: 0.8,
    BASE_PREFERENCE: 0.3,
    PREFERENCE_INCREMENT: 0.03,
    
    // General Confidence Thresholds
    LOW_THRESHOLD: 0.1,
    MEDIUM_THRESHOLD: 0.5,
    HIGH_THRESHOLD: 0.8,
    MAX_CONFIDENCE: 1.0,
    
    // Voice Processing Confidence
    VOICE_SUCCESS: 0.8,
    VOICE_FALLBACK: 0.3,
    VOICE_OBJECT_SPECIFIC: 0.9,
    VOICE_GENERAL: 0.6,
    
    // Command Parsing Confidence
    COMMAND_UNKNOWN: 0.1,
    COMMAND_BASE: 0.5,
    COMMAND_EXACT_MATCH_BOOST: 0.3,
    COMMAND_LENGTH_BOOST_MAX: 0.2,
    COMMAND_OBJECT_CONTEXT_BOOST: 0.2,
    
    // Gemini Service Confidence
    GEMINI_BASE: 0.8,
    GEMINI_SAFETY_PENALTY_HIGH: 0.3,
    GEMINI_SAFETY_PENALTY_MEDIUM: 0.2,
    GEMINI_COMPLETE_BOOST: 0.1,
    GEMINI_SHORT_RESPONSE_PENALTY: 0.1,
    GEMINI_LONG_RESPONSE_BOOST: 0.05,
    
    // ElevenLabs Service Confidence
    ELEVENLABS_SUCCESS: 0.8,
    ELEVENLABS_FALLBACK: 0.9,
    ELEVENLABS_ERROR: 0.3,
    
    // Context Memory Confidence
    CONTEXT_MESSAGE_FREQUENCY_MAX: 0.9,
    CONTEXT_PREFERENCE_PATTERN: 0.8,
    CONTEXT_BEHAVIOR_PATTERN: 0.7,
    CONTEXT_OBJECT_INTERACTION: 0.8,
    CONTEXT_VOICE_PREFERENCE: 0.9,
    CONTEXT_INTERACTION_PREFERENCE: 0.8,
    
    // Synthetic Data Confidence
    SYNTHETIC_DETECTION: 0.95,
    SYNTHETIC_LEARNING_PATTERN: 0.8,
  },
  
  THRESHOLDS: {
    // Learning Stage Thresholds
    DAY_7_SCORE: 0.5,
    DAY_30_SCORE: 0.8,
    
    // Interaction Thresholds
    MIN_INTERACTIONS_DAY_7: 5,
    MIN_INTERACTIONS_DAY_30: 20,
    
    // Personalization Levels
    PERSONALIZATION_DAY_1: 0.2,
    PERSONALIZATION_DAY_7: 0.6,
    PERSONALIZATION_DAY_30: 0.9,
    
    // Learning Metrics Thresholds
    LEARNING_METRICS_MIN: 0.1,
    LEARNING_METRICS_MAX: 1.0,
  },
  
  LEARNING_RATE: {
    BASE: 0.1,
    DECREASE_FACTOR: 0.5,
  },
  
  VOICE_SETTINGS: {
    SPEECH_RATE: {
      SLOW: 0.8,
      NORMAL: 1.0,
      FAST: 1.2,
    },
    VOLUME: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
    },
  },
  
  ELEVENLABS: {
    TEMPERATURE: {
      CONSERVATIVE: 0.6,
      BALANCED: 0.7,
      CREATIVE: 0.8,
    },
    MAX_TURNS: {
      SHORT: 8,
      MEDIUM: 10,
      LONG: 12,
    },
  },
  
  CONTEXT: {
    MESSAGE_FREQUENCY_DIVISOR: 10,
    MIN_TEXT_LENGTH: 10,
    LONG_TEXT_LENGTH: 100,
  },
} as const;

// Type definitions for better type safety
export type LearningConstants = typeof LEARNING_CONSTANTS;
export type ConfidenceConstants = typeof LEARNING_CONSTANTS.CONFIDENCE;
export type ThresholdConstants = typeof LEARNING_CONSTANTS.THRESHOLDS;
