// Enums for String Literals - Type Safety and Maintainability
// Centralized enums to replace string literals throughout the codebase

/**
 * Learning stages for AI personalization progression
 */
export enum LearningStage {
  DAY_1 = 'day_1',
  DAY_7 = 'day_7',
  DAY_30 = 'day_30'
}

/**
 * Priority levels for suggestions and actions
 */
export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Memory entry types for context management
 */
export enum MemoryType {
  CONVERSATION = 'conversation',
  PREFERENCE = 'preference',
  PATTERN = 'pattern',
  OBJECT_INTERACTION = 'object_interaction'
}

/**
 * Learning pattern types
 */
export enum PatternType {
  ROUTINE = 'routine',
  PREFERENCE = 'preference',
  BEHAVIOR = 'behavior'
}

/**
 * Interaction types for conversational AI
 */
export enum InteractionType {
  CONVERSATION = 'conversation',
  PREFERENCE = 'preference',
  PATTERN = 'pattern',
  LEARNING = 'learning',
  VOICE_CONVERSATION = 'voice_conversation',
  ERROR_FALLBACK = 'error_fallback'
}

/**
 * Response length options for ElevenLabs
 */
export enum ResponseLength {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long'
}

/**
 * Reminder frequency levels
 */
export enum ReminderFrequency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Voice volume levels
 */
export enum VolumeLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Time of day categories
 */
export enum TimeOfDay {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night'
}

/**
 * Urgency levels for requests
 */
export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Intent types for voice command parsing
 */
export enum IntentType {
  MEDICINE_REMINDER = 'medicine_reminder',
  NUTRITION_INFO = 'nutrition_info',
  SCHEDULE_QUERY = 'schedule_query',
  LOCATION_SEARCH = 'location_search',
  DEVICE_SYNC = 'device_sync',
  HEALTH_QUERY = 'health_query',
  WORK_TASK = 'work_task',
  GENERAL_QUERY = 'general_query',
  ERROR = 'error',
  MULTIMODAL_QUERY = 'multimodal_query',
  VISUAL_QUERY = 'visual_query',
  PERSONALIZED_SUGGESTIONS = 'personalized_suggestions',
  LEARNING_INSIGHTS = 'learning_insights',
  SYNTHETIC_DATA = 'synthetic_data',
  DEMO_PROGRESSION = 'demo_progression'
}

/**
 * Voice agent types
 */
export enum VoiceAgentType {
  MORNING_ASSISTANT = 'morning_assistant',
  HEALTH_SPECIALIST = 'health_specialist',
  PRODUCTIVITY_ASSISTANT = 'productivity_assistant'
}

/**
 * Object types for AR detection
 */
export enum ObjectType {
  MEDICINE_BOTTLE = 'medicine_bottle',
  BREAKFAST_BOWL = 'breakfast_bowl',
  LAPTOP = 'laptop',
  KEYS = 'keys',
  PHONE = 'phone'
}

/**
 * Context types for suggestions
 */
export enum ContextType {
  OBJECT_INTERACTION = 'object_interaction',
  VOICE_PREFERENCE = 'voice_preference',
  INTERACTION_PREFERENCE = 'interaction_preference',
  ROUTINE_OPTIMIZATION = 'routine_optimization',
  ROUTINE_PATTERN = 'routine_pattern',
  LEARNING_PROGRESSION = 'learning_progression',
  MEDICATION_REMINDER = 'medication_reminder',
  NUTRITION_ASSISTANCE = 'nutrition_assistance',
  SCHEDULE_ASSISTANCE = 'schedule_assistance',
  DEPARTURE_ASSISTANCE = 'departure_assistance',
  DEVICE_SYNC = 'device_sync',
  MORNING_GREETING = 'morning_greeting',
  AFTERNOON_CHECKIN = 'afternoon_checkin',
  EVENING_PREPARATION = 'evening_preparation',
  NIGHT_WINDDOWN = 'night_winddown'
}

/**
 * Voice settings defaults
 */
export enum VoiceDefaults {
  DEFAULT_VOICE = 'default',
  MARVIN_VOICE = 'marvin_voice',
  MARVIN_MORNING = 'marvin_morning',
  MARVIN_HEALTH = 'marvin_health',
  MARVIN_PRODUCTIVITY = 'marvin_productivity'
}

/**
 * Service health status
 */
export enum ServiceStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

/**
 * API response status
 */
export enum ApiStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  VALIDATION_ERROR = 'validation_error'
}

/**
 * Learning metrics types
 */
export enum LearningMetricType {
  SUGGESTION_ACCURACY = 'suggestion_accuracy',
  USER_SATISFACTION = 'user_satisfaction',
  RESPONSE_RELEVANCE = 'response_relevance'
}

/**
 * Conversation roles
 */
export enum ConversationRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

/**
 * Finish reasons for AI responses
 */
export enum FinishReason {
  STOP = 'STOP',
  SAFETY = 'SAFETY',
  MAX_TOKENS = 'MAX_TOKENS',
  OTHER = 'OTHER'
}

/**
 * Safety severity levels
 */
export enum SafetySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Temperature settings for AI models
 */
export enum Temperature {
  CONSERVATIVE = 'conservative',
  BALANCED = 'balanced',
  CREATIVE = 'creative'
}

/**
 * MIME types for image processing
 */
export enum MimeType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  GIF = 'image/gif'
}

/**
 * Session types
 */
export enum SessionType {
  DEFAULT = 'default-session',
  DEMO = 'demo-session',
  TEST = 'test-session'
}

/**
 * User types
 */
export enum UserType {
  DEFAULT = 'default-user',
  DEMO = 'demo-user',
  TEST = 'test-user'
}
