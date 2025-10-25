import { VoiceCommandParsingService } from '../../src/services/voiceCommandParsingService';
import { createMockConversationContext, createMockDemoObject } from '../utils/testHelpers';

describe('VoiceCommandParsingService', () => {
  let service: VoiceCommandParsingService;

  beforeEach(async () => {
    service = await VoiceCommandParsingService.create();
  });

  describe('parseVoiceCommand', () => {
    it('should parse medicine-related commands', async () => {
      // Arrange
      const voiceText = 'Help me with my medicine schedule';
      const conversationContext = createMockConversationContext();

      // Act
      const result = await service.parseVoiceCommand(voiceText, undefined, conversationContext);

      // Assert
      expect(result.intent.intent).toBe('medicine_reminder');
      expect(result.intent.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.follow_up_actions).toContain('Show medicine schedule');
    });

    it('should parse schedule-related commands', async () => {
      // Arrange
      const voiceText = 'What is my schedule for today?';
      const conversationContext = createMockConversationContext();

      // Act
      const result = await service.parseVoiceCommand(voiceText, undefined, conversationContext);

      // Assert
      expect(result.intent.intent).toBe('schedule_check');
      expect(result.intent.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.follow_up_actions).toContain('Show calendar');
    });

    it('should parse breakfast-related commands', async () => {
      // Arrange
      const voiceText = 'What should I eat for breakfast?';
      const conversationContext = createMockConversationContext();

      // Act
      const result = await service.parseVoiceCommand(voiceText, undefined, conversationContext);

      // Assert
      expect(result.intent.intent).toBe('nutrition_info');
      expect(result.intent.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.follow_up_actions).toContain('Analyze nutrition');
    });

    it('should handle object-specific commands', async () => {
      // Arrange
      const voiceText = 'Tell me about this bowl';
      const objectContext = createMockDemoObject();
      const conversationContext = createMockConversationContext();

      // Act
      const result = await service.parseVoiceCommand(voiceText, objectContext, conversationContext);

      // Assert
      expect(result.intent.intent).toBe('general_help');
      expect(result.intent.confidence).toBeGreaterThan(0.5);
      expect(result.follow_up_actions).toContain('Get assistance');
    });

    it('should handle unknown commands gracefully', async () => {
      // Arrange
      const voiceText = 'random gibberish text';
      const conversationContext = createMockConversationContext();

      // Act
      const result = await service.parseVoiceCommand(voiceText, undefined, conversationContext);

      // Assert
      expect(result.intent.intent).toBe('unknown');
      expect(result.intent.confidence).toBeLessThan(0.5);
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy service', async () => {
      // Act
      const result = await service.healthCheck();

      // Assert
      expect(result).toBe(true);
    });
  });
});