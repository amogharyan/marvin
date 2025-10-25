// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite completed');
});

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Test utilities
export const testUtils = {
  // Create mock conversation context
  createMockConversationContext: (overrides = {}) => ({
    user_id: 'test_user',
    session_id: 'test_session',
    conversation_history: [],
    user_preferences: {
      voice_settings: {
        preferred_voice: 'default',
        speech_rate: 1.0,
        pitch: 1.0
      },
      interaction_preferences: {
        proactive_assistance: true,
        detailed_explanations: true,
        reminder_frequency: 'medium'
      },
      routine_patterns: {
        typical_wake_time: '7:00 AM',
        breakfast_preferences: [],
        medicine_schedule: []
      }
    },
    ...overrides
  }),

  // Create mock demo object
  createMockDemoObject: (overrides = {}) => ({
    id: 'test_object_001',
    name: 'breakfast_bowl',
    detection_confidence: 0.95,
    spatial_position: {
      x: 0.5,
      y: 0.3,
      z: 1.2
    },
    last_interaction: new Date().toISOString(),
    associated_actions: ['nutrition_analysis', 'recipe_suggestions'],
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};
