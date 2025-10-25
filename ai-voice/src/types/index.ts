// Core types for Dev 2 AI & Voice Integration

export interface DemoObject {
  id: string;
  name: string;
  detection_confidence: number;
  spatial_position: Vector3;
  last_interaction: Date;
  associated_actions: string[];
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface AIResponse {
  content: string;
  confidence: number;
  context: string;
  suggested_actions?: string[];
  voice_enabled: boolean;
  voice_data?: VoiceResponse;
  // Phase 2 enhancements
  intent_analysis?: VoiceIntent;
  personalized_suggestions?: PersonalizedSuggestion[];
  visual_analysis?: {
    objects_detected: DemoObject[];
    confidence: number;
  };
}

export interface VoiceIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  action: string;
  parameters: Record<string, any>;
}

export interface PersonalizedSuggestion {
  suggestion: string;
  confidence: number;
  context: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
}

export interface VoiceRequest {
  text: string;
  voice_id?: string;
  speed?: number;
  pitch?: number;
}

export interface VoiceResponse {
  audio_url: string;
  duration: number;
  format: string;
}

export interface ConversationContext {
  user_id: string;
  session_id: string;
  object_context?: DemoObject;
  conversation_history: ChatMessage[];
  user_preferences: UserPreferences;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date | string | number; // Allow flexible timestamp types
  object_context?: string;
}

export interface UserPreferences {
  voice_settings: {
    preferred_voice: string;
    speech_rate: number;
    pitch: number;
  };
  interaction_preferences: {
    proactive_assistance: boolean;
    detailed_explanations: boolean;
    reminder_frequency: 'low' | 'medium' | 'high';
  };
  routine_patterns: {
    typical_wake_time: string;
    breakfast_preferences: string[];
    medicine_schedule: string[];
  };
}

export interface EigenvalueRequest {
  message: string;
  context: ConversationContext;
  multimodal_data?: {
    visual_context?: string;
    object_detected?: DemoObject;
  };
}

export interface EigenvalueResponse {
  response: string;
  confidence: number;
  suggested_actions: string[];
  context_updates?: Partial<ConversationContext>;
}

export interface GeminiRequest {
  prompt: string;
  image_data?: string;
  context: string;
}

export interface GeminiResponse {
  text: string;
  confidence: number | undefined; // Can be undefined when confidence cannot be determined
  safety_ratings: any[];
}

// Demo Objects Configuration
export const DEMO_OBJECTS = {
  breakfast_bowl: {
    triggers: ["nutrition_analysis", "recipe_suggestions", "calorie_tracking"],
    ai_context: "Breakfast and nutrition guidance",
    voice_prompts: ["What's for breakfast?", "Show nutrition info", "Suggest healthy options"]
  },
  laptop: {
    triggers: ["calendar_briefing", "meeting_prep", "day_overview"],
    ai_context: "Work and scheduling assistance", 
    voice_prompts: ["What's on my schedule?", "Brief me on today", "Show my meetings"]
  },
  keys: {
    triggers: ["departure_checklist", "location_tracking", "reminder_alerts"],
    ai_context: "Departure preparation and location memory",
    voice_prompts: ["Where are my keys?", "Ready to leave", "Show departure checklist"]
  },
  medicine_bottle: {
    triggers: ["medication_reminders", "health_tracking", "schedule_alerts"],
    ai_context: "Health and medication management",
    voice_prompts: ["Medicine reminder", "Show health schedule", "Track medication"]
  },
  phone: {
    triggers: ["connectivity_check", "backup_interface", "device_sync"],
    ai_context: "Device integration and backup systems",
    voice_prompts: ["Check connectivity", "Sync devices", "Backup mode"]
  }
} as const;

export type DemoObjectType = keyof typeof DEMO_OBJECTS;
