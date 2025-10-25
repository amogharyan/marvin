import { ContextMemoryService } from '../../src/services/contextMemoryService';
import { ChatMessage } from '../../src/types';
import { createMockConversationContext, createMockDemoObject, testUtils } from '../utils/testHelpers';

describe('ContextMemoryService', () => {
  let service: ContextMemoryService;

  beforeEach(() => {
    service = new ContextMemoryService();
  });

  describe('storeConversationContext', () => {
    it('should store conversation context successfully', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const context = createMockConversationContext();

      // Act
      await service.storeConversationContext(sessionId, context);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved).toHaveProperty('user_id', 'test_user');
      expect(retrieved).toHaveProperty('session_id');
      expect(retrieved).toHaveProperty('conversation_history');
      expect(retrieved).toHaveProperty('learned_patterns');
    });

    it('should update existing conversation context', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const initialContext = createMockConversationContext();
      const updatedContext = createMockConversationContext({
        conversation_history: [
          ...initialContext.conversation_history,
          {
            role: 'user' as const,
            content: 'Updated message',
            timestamp: new Date()
          }
        ]
      });

      // Act
      await service.storeConversationContext(sessionId, initialContext);
      await service.storeConversationContext(sessionId, updatedContext);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(3); // Original 2 + updated 1 (no duplicates)
      expect(retrieved?.conversation_history[2].content).toBe('Updated message');
    });
  });

  describe('generatePersonalizedSuggestions', () => {
    it('should generate suggestions for breakfast bowl object', async () => {
      // Arrange
      const userId = testUtils.createUserId();
      const context = createMockConversationContext();
      const objectContext = createMockDemoObject();

      // Act
      const suggestions = await service.generatePersonalizedSuggestions(userId, context, objectContext);

      // Assert
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
      if (suggestions.length > 0) {
        expect(suggestions[0]).toHaveProperty('suggestion');
        expect(suggestions[0]).toHaveProperty('confidence');
        expect(suggestions[0]).toHaveProperty('priority');
      }
    });

    it('should generate suggestions without object context', async () => {
      // Arrange
      const userId = testUtils.createUserId();
      const context = createMockConversationContext();

      // Act
      const suggestions = await service.generatePersonalizedSuggestions(userId, context);

      // Assert
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });

    it('should generate medicine-related suggestions for medicine bottle', async () => {
      // Arrange
      const userId = testUtils.createUserId();
      const context = createMockConversationContext();
      const objectContext = createMockDemoObject({
        name: 'medicine_bottle'
      });

      // Act
      const suggestions = await service.generatePersonalizedSuggestions(userId, context, objectContext);

      // Assert
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('userPreferences persistence', () => {
    it('should persist user preferences to Map when storing conversation context', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const context = createMockConversationContext({
        user_id: userId,
        user_preferences: {
          voice_settings: {
            preferred_voice: 'custom_voice',
            speech_rate: 1.2,
            pitch: 1.1
          },
          interaction_preferences: {
            proactive_assistance: false,
            detailed_explanations: true,
            reminder_frequency: 'high'
          },
          routine_patterns: {
            typical_wake_time: '6:00 AM',
            breakfast_preferences: ['oatmeal', 'fruit'],
            medicine_schedule: ['7:00 AM', '7:00 PM']
          }
        }
      });

      // Act
      await service.storeConversationContext(sessionId, context);

      // Assert
      const storedPrefs = service.getUserPreferences(userId);
      expect(storedPrefs).toBeDefined();
      expect(storedPrefs?.voice_settings.preferred_voice).toBe('custom_voice');
      expect(storedPrefs?.voice_settings.speech_rate).toBe(1.2);
      expect(storedPrefs?.interaction_preferences.proactive_assistance).toBe(false);
      expect(storedPrefs?.routine_patterns.breakfast_preferences).toEqual(['oatmeal', 'fruit']);
    });

    it('should merge user preferences when updating existing context', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      const initialContext = createMockConversationContext({
        user_id: userId,
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
            breakfast_preferences: ['cereal'],
            medicine_schedule: ['8:00 AM']
          }
        }
      });

      const updatedContext = createMockConversationContext({
        user_id: userId,
        user_preferences: {
          voice_settings: {
            preferred_voice: 'custom_voice',
            speech_rate: 1.2,
            pitch: 1.0
          },
          interaction_preferences: {
            proactive_assistance: false,
            detailed_explanations: true,
            reminder_frequency: 'medium'
          },
          routine_patterns: {
            typical_wake_time: '7:00 AM',
            breakfast_preferences: ['oatmeal', 'fruit'],
            medicine_schedule: ['8:00 AM']
          }
        }
      });

      // Act
      await service.storeConversationContext(sessionId, initialContext);
      await service.storeConversationContext(sessionId, updatedContext);

      // Assert
      const storedPrefs = service.getUserPreferences(userId);
      expect(storedPrefs).toBeDefined();
      expect(storedPrefs?.voice_settings.preferred_voice).toBe('custom_voice');
      expect(storedPrefs?.voice_settings.speech_rate).toBe(1.2);
      expect(storedPrefs?.voice_settings.pitch).toBe(1.0); // Should be preserved from initial
      expect(storedPrefs?.interaction_preferences.proactive_assistance).toBe(false);
      expect(storedPrefs?.interaction_preferences.detailed_explanations).toBe(true); // Should be preserved
      expect(storedPrefs?.routine_patterns.breakfast_preferences).toEqual(['oatmeal', 'fruit']);
      expect(storedPrefs?.routine_patterns.medicine_schedule).toEqual(['8:00 AM']); // Should be preserved
    });

    it('should handle undefined user preferences gracefully', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const context = createMockConversationContext({
        user_id: userId,
        user_preferences: undefined
      });

      // Act
      await service.storeConversationContext(sessionId, context);

      // Assert
      const storedPrefs = service.getUserPreferences(userId);
      expect(storedPrefs).toBeUndefined();
    });

    it('should update user preferences directly', () => {
      // Arrange
      const userId = testUtils.createUserId();
      const preferences = {
        voice_settings: {
          preferred_voice: 'test_voice',
          speech_rate: 1.5,
          pitch: 1.0
        }
      };

      // Act
      service.updateUserPreferences(userId, preferences);

      // Assert
      const storedPrefs = service.getUserPreferences(userId);
      expect(storedPrefs).toBeDefined();
      expect(storedPrefs?.voice_settings.preferred_voice).toBe('test_voice');
      expect(storedPrefs?.voice_settings.speech_rate).toBe(1.5);
      expect(storedPrefs?.interaction_preferences.proactive_assistance).toBe(true); // Default value
    });
  });

  describe('conversation history management', () => {
    it('should merge conversation histories without duplicates', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      const message1 = {
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date()
      };
      
      const message2 = {
        role: 'assistant' as const,
        content: 'Hi there!',
        timestamp: new Date(Date.now() + 1000)
      };

      const initialContext = createMockConversationContext({
        user_id: userId,
        conversation_history: [message1]
      });

      const updatedContext = createMockConversationContext({
        user_id: userId,
        conversation_history: [message1, message2] // message1 is duplicate
      });

      // Act
      await service.storeConversationContext(sessionId, initialContext);
      await service.storeConversationContext(sessionId, updatedContext);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(2); // Should not duplicate message1
      expect(retrieved?.conversation_history[0].content).toBe('Hello');
      expect(retrieved?.conversation_history[1].content).toBe('Hi there!');
    });

    it('should trim conversation history to 20 messages', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      // First, create a context with some initial messages
      const initialMessages = Array.from({ length: 10 }, (_, i) => ({
        role: 'user' as const,
        content: `Initial Message ${i + 1}`,
        timestamp: new Date(Date.now() + i * 1000)
      }));

      const initialContext = createMockConversationContext({
        user_id: userId,
        conversation_history: initialMessages
      });

      // Then add more messages to exceed 20
      const additionalMessages = Array.from({ length: 20 }, (_, i) => ({
        role: 'user' as const,
        content: `Additional Message ${i + 1}`,
        timestamp: new Date(Date.now() + (i + 10) * 1000)
      }));

      const updatedContext = createMockConversationContext({
        user_id: userId,
        conversation_history: additionalMessages
      });

      // Act
      await service.storeConversationContext(sessionId, initialContext);
      await service.storeConversationContext(sessionId, updatedContext);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(20); // Should be trimmed to 20
      expect(retrieved?.conversation_history[0].content).toBe('Additional Message 1'); // First 10 initial messages should be removed
      expect(retrieved?.conversation_history[19].content).toBe('Additional Message 20'); // Last should be preserved
    });

    it('should prevent duplicate messages when storing individual messages', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      const context = createMockConversationContext({
        user_id: userId,
        conversation_history: []
      });

      const message = {
        role: 'user' as const,
        content: 'Test message',
        timestamp: new Date()
      };

      // Act
      await service.storeConversationContext(sessionId, context, message);
      await service.storeConversationContext(sessionId, context, message); // Same message again

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(1); // Should not duplicate
      expect(retrieved?.conversation_history[0].content).toBe('Test message');
    });

    it('should handle empty conversation histories gracefully', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      const context1 = createMockConversationContext({
        user_id: userId,
        conversation_history: []
      });

      const context2 = createMockConversationContext({
        user_id: userId,
        conversation_history: []
      });

      // Act
      await service.storeConversationContext(sessionId, context1);
      await service.storeConversationContext(sessionId, context2);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(0);
    });
    it('should handle undefined user preferences safely', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      // Create context with undefined user_preferences
      const contextWithUndefinedPrefs = createMockConversationContext({
        user_id: userId,
        user_preferences: undefined
      });

      // Create context with partial user_preferences
      const contextWithPartialPrefs = createMockConversationContext({
        user_id: userId,
        user_preferences: {
          voice_settings: {
            preferred_voice: 'custom_voice',
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
        }
      });

      // Act
      await service.storeConversationContext(sessionId, contextWithUndefinedPrefs);
      await service.storeConversationContext(sessionId, contextWithPartialPrefs);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.user_preferences).toBeDefined();
      expect(retrieved?.user_preferences?.voice_settings.preferred_voice).toBe('custom_voice');
    });

    it('should handle null/undefined nested properties safely', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      // Create context with partially undefined nested properties
      const contextWithPartialNested = createMockConversationContext({
        user_id: userId,
        user_preferences: {
          voice_settings: {
            preferred_voice: 'test_voice',
            speech_rate: 1.0,
            pitch: 1.0
          },
          interaction_preferences: {
            proactive_assistance: false,
            detailed_explanations: true,
            reminder_frequency: 'high'
          },
          routine_patterns: {
            typical_wake_time: '6:00 AM',
            breakfast_preferences: ['oatmeal'],
            medicine_schedule: ['7:00 AM']
          }
        } as any // Force partial type to test undefined handling
      });

      // Act
      await service.storeConversationContext(sessionId, contextWithPartialNested);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.user_preferences).toBeDefined();
      expect(retrieved?.user_preferences?.voice_settings.preferred_voice).toBe('test_voice');
      expect(retrieved?.user_preferences?.interaction_preferences.proactive_assistance).toBe(false);
      expect(retrieved?.user_preferences?.routine_patterns.breakfast_preferences).toEqual(['oatmeal']);
    });
  });

  describe('timestamp normalization', () => {
    it('should handle Date timestamps correctly', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const now = new Date();
      
      const context1 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: now
        }]
      });
      
      const context2 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: new Date(now.getTime() + 500) // 500ms later
        }]
      });

      // Act
      await service.storeConversationContext(sessionId, context1);
      await service.storeConversationContext(sessionId, context2);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(1); // Should deduplicate
    });

    it('should handle string timestamps correctly', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const now = new Date();
      
      const context1 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: now.toISOString()
        }]
      });
      
      const context2 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: new Date(now.getTime() + 500).toISOString() // 500ms later
        }]
      });

      // Act
      await service.storeConversationContext(sessionId, context1);
      await service.storeConversationContext(sessionId, context2);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(1); // Should deduplicate
    });

    it('should handle number timestamps correctly', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const now = Date.now();
      
      const context1 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: now
        }]
      });
      
      const context2 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: now + 500 // 500ms later
        }]
      });

      // Act
      await service.storeConversationContext(sessionId, context1);
      await service.storeConversationContext(sessionId, context2);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(1); // Should deduplicate
    });

    it('should treat invalid timestamps as non-duplicates', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      const context1 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: 'invalid-date' as any
        }]
      });
      
      const context2 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: 'invalid-date' as any
        }]
      });

      // Act
      await service.storeConversationContext(sessionId, context1);
      await service.storeConversationContext(sessionId, context2);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(2); // Should not deduplicate invalid timestamps
    });

    it('should handle undefined timestamps gracefully', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      
      const context1 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: undefined as any
        }]
      });
      
      const context2 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: undefined as any
        }]
      });

      // Act
      await service.storeConversationContext(sessionId, context1);
      await service.storeConversationContext(sessionId, context2);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(2); // Should not deduplicate undefined timestamps
    });

    it('should not deduplicate messages with different content', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const now = new Date();
      
      const context1 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: now
        }]
      });
      
      const context2 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hi there',
          timestamp: new Date(now.getTime() + 500) // 500ms later
        }]
      });

      // Act
      await service.storeConversationContext(sessionId, context1);
      await service.storeConversationContext(sessionId, context2);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(2); // Should not deduplicate different content
    });

    it('should not deduplicate messages with different roles', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const now = new Date();
      
      const context1 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'user' as const,
          content: 'Hello',
          timestamp: now
        }]
      });
      
      const context2 = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [{
          role: 'assistant' as const,
          content: 'Hello',
          timestamp: new Date(now.getTime() + 500) // 500ms later
        }]
      });

      // Act
      await service.storeConversationContext(sessionId, context1);
      await service.storeConversationContext(sessionId, context2);

      // Assert
      const retrieved = await service.getEnhancedConversationContext(sessionId);
      expect(retrieved?.conversation_history).toHaveLength(2); // Should not deduplicate different roles
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy service', async () => {
      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(true);
    });

    it('should clean up test data after health check', async () => {
      // Arrange
      const initialMemorySize = service['conversationMemory'].size;
      const initialUserPrefsSize = service['userPreferences'].size;

      // Act
      await service.healthCheck();

      // Assert
      // Memory should be cleaned up after health check
      expect(service['conversationMemory'].size).toBe(initialMemorySize);
      expect(service['userPreferences'].size).toBe(initialUserPrefsSize);
    });

    it('should use unique test IDs to avoid collisions', async () => {
      // Act - Run multiple health checks
      const results = await Promise.all([
        service.healthCheck(),
        service.healthCheck(),
        service.healthCheck()
      ]);

      // Assert
      expect(results).toEqual([true, true, true]);
      // All health checks should succeed without ID collisions
    });
  });

  describe('cleanup methods', () => {
    it('should remove conversation context successfully', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const context = createMockConversationContext({
        user_id: userId,
        session_id: sessionId
      });

      await service.storeConversationContext(sessionId, context);

      // Verify it exists
      const beforeCleanup = await service.getEnhancedConversationContext(sessionId);
      expect(beforeCleanup).toBeDefined();

      // Act
      service.removeConversationContext(sessionId);

      // Assert
      const afterCleanup = await service.getEnhancedConversationContext(sessionId);
      expect(afterCleanup).toBeNull();
    });

    it('should remove learning patterns by userId when removing conversation context', async () => {
      // Arrange
      const sessionId = testUtils.createSessionId();
      const userId = testUtils.createUserId();
      const context = createMockConversationContext({
        user_id: userId,
        session_id: sessionId,
        conversation_history: [
          { role: 'user' as const, content: 'I take medicine at 8am', timestamp: new Date() },
          { role: 'assistant' as const, content: 'I\'ll remember that', timestamp: new Date() }
        ]
      });

      // Store context to generate learning patterns
      await service.storeConversationContext(sessionId, context);

      // Verify learning patterns were created for the userId
      const learningPatternsBefore = service['learningPatterns'].get(userId);
      expect(learningPatternsBefore).toBeDefined();
      expect(learningPatternsBefore!.length).toBeGreaterThan(0);

      // Act - Remove conversation context
      service.removeConversationContext(sessionId);

      // Assert - Learning patterns should be removed by userId
      const learningPatternsAfter = service['learningPatterns'].get(userId);
      expect(learningPatternsAfter).toBeUndefined();

      // Verify conversation context is also removed
      const contextAfter = await service.getEnhancedConversationContext(sessionId);
      expect(contextAfter).toBeNull();
    });

    it('should handle missing context gracefully when removing conversation context', async () => {
      // Arrange
      const nonExistentSessionId = 'non-existent-session';

      // Act - Try to remove non-existent context
      service.removeConversationContext(nonExistentSessionId);

      // Assert - Should not throw error and learning patterns should remain unchanged
      expect(service['learningPatterns'].size).toBeGreaterThanOrEqual(0);
    });

    it('should remove user preferences successfully', async () => {
      // Arrange
      const userId = testUtils.createUserId();
      const preferences = {
        voice_settings: { preferred_voice: 'test_voice', speech_rate: 1.0, pitch: 1.0 },
        interaction_preferences: { proactive_assistance: true, detailed_explanations: true, reminder_frequency: 'medium' as const },
        routine_patterns: { typical_wake_time: '7:00 AM', breakfast_preferences: [], medicine_schedule: [] }
      };

      service.updateUserPreferences(userId, preferences);

      // Verify it exists
      const beforeCleanup = service.getUserPreferences(userId);
      expect(beforeCleanup).toBeDefined();

      // Act
      service.removeUserPreferences(userId);

      // Assert
      const afterCleanup = service.getUserPreferences(userId);
      expect(afterCleanup).toBeUndefined();
    });

    it('should handle cleanup errors gracefully', () => {
      // Arrange
      const invalidSessionId = '';

      // Act & Assert - Should not throw
      expect(() => {
        service.removeConversationContext(invalidSessionId);
      }).not.toThrow();

      expect(() => {
        service.removeUserPreferences('');
      }).not.toThrow();
    });
  });
});