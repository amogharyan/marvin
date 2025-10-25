// Test fixtures and mock data
export const mockData = {
  // Mock conversation contexts
  conversationContext: {
    user_id: 'test_user',
    session_id: 'test_session',
    conversation_history: [
      {
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date()
      },
      {
        role: 'assistant' as const,
        content: 'Hi! How can I help you today?',
        timestamp: new Date()
      }
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
        reminder_frequency: 'medium'
      },
      routine_patterns: {
        typical_wake_time: '7:00 AM',
        breakfast_preferences: ['cereal', 'toast'],
        medicine_schedule: ['8:00 AM', '8:00 PM']
      }
    }
  },

  // Mock demo objects
  demoObjects: {
    breakfastBowl: {
      id: 'bowl_001',
      name: 'breakfast_bowl',
      detection_confidence: 0.95,
      spatial_position: {
        x: 0.5,
        y: 0.3,
        z: 1.2
      },
      last_interaction: new Date(),
      associated_actions: ['nutrition_analysis', 'recipe_suggestions']
    },
    laptop: {
      id: 'laptop_001',
      name: 'laptop',
      detection_confidence: 0.92,
      spatial_position: {
        x: -0.3,
        y: 0.4,
        z: 1.5
      },
      last_interaction: new Date(),
      associated_actions: ['calendar_briefing', 'meeting_prep']
    },
    keys: {
      id: 'keys_001',
      name: 'keys',
      detection_confidence: 0.88,
      spatial_position: {
        x: -0.8,
        y: 0.1,
        z: 0.8
      },
      last_interaction: new Date(),
      associated_actions: ['departure_checklist', 'location_tracking']
    }
  },

  // Mock API responses
  apiResponses: {
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
  errorResponses: {
    geminiError: new Error('Gemini API error'),
    elevenlabsError: new Error('ElevenLabs API error'),
    networkError: new Error('Network error')
  }
};
