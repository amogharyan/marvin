// Test utilities and type-safe mock data
import { ConversationContext, DemoObject, ChatMessage } from '../../src/types';
import { ConversationRole, ReminderFrequency } from '../../src/types/enums';

export const createMockChatMessage = (role: ConversationRole, content: string): ChatMessage => ({
  role,
  content,
  timestamp: new Date()
});

export const createMockConversationContext = (overrides: Partial<ConversationContext> = {}): ConversationContext => ({
  user_id: 'test_user',
  session_id: 'test_session',
  conversation_history: [
    createMockChatMessage(ConversationRole.USER, 'Hello'),
    createMockChatMessage(ConversationRole.ASSISTANT, 'Hi! How can I help you today?')
  ],
  user_preferences: {
    voice_settings: {
      preferred_voice: 'default',
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
      breakfast_preferences: ['cereal', 'toast'],
      medicine_schedule: ['8:00 AM', '8:00 PM']
    }
  },
  ...overrides
});

export const createMockDemoObject = (overrides: Partial<DemoObject> = {}): DemoObject => ({
  id: 'test_object_001',
  name: 'breakfast_bowl',
  detection_confidence: 0.95,
  spatial_position: {
    x: 0.5,
    y: 0.3,
    z: 1.2
  },
  last_interaction: new Date(),
  associated_actions: ['nutrition_analysis', 'recipe_suggestions'],
  ...overrides
});

export const testUtils = {
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create test session ID
  createSessionId: () => `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // Create test user ID
  createUserId: () => `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // Mock API responses
  mockApiResponses: {
    geminiSuccess: {
      text: 'I can see a breakfast bowl in your environment. Would you like nutrition information?',
      confidence: 0.95,
      safety_ratings: []
    },
    elevenlabsSuccess: {
      audio_url: 'test_audio_url',
      duration: 5,
      format: 'mp3'
    },
    voiceCommandSuccess: {
      intent: {
        intent: 'medicine_reminder',
        confidence: 0.9,
        entities: { item: 'medicine' },
        action: 'provide_medicine_reminder',
        parameters: {}
      },
      follow_up_actions: ['Take medicine', 'Health schedule']
    }
  },
  
  // Mock error responses
  mockErrors: {
    geminiError: new Error('Gemini API error'),
    elevenlabsError: new Error('ElevenLabs API error'),
    networkError: new Error('Network error')
  }
};
