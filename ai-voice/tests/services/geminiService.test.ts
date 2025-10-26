import { GeminiService } from '../../src/services/geminiService';
import { ConversationRole } from '../../src/types/enums';

// Mock the Gemini API
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('Mocked Gemini response')
        }
      })
    })
  }))
}));

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService();
  });

  describe('processMultimodalContext', () => {
    it('should process multimodal context with default JPEG MIME type', async () => {
      // Arrange
      const imageData = 'base64encodedimagedata';
      const voiceText = 'What do you see in this image?';
      const objectContext = {
        id: 'test_id',
        name: 'test_object',
        detection_confidence: 0.9,
        spatial_position: { x: 0, y: 0, z: 0 },
        last_interaction: new Date(),
        associated_actions: ['test_action']
      };
      const conversationHistory = [
        { role: ConversationRole.USER, content: 'Hello', timestamp: new Date() }
      ];

      // Act
      const result = await service.processMultimodalContext(
        imageData,
        voiceText,
        objectContext,
        conversationHistory
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.text).toBe('Mocked Gemini response');
    });

    it('should process multimodal context with PNG MIME type', async () => {
      // Arrange
      const imageData = 'base64encodedpngdata';
      const voiceText = 'Analyze this PNG image';
      const mimeType = 'image/png';

      // Act
      const result = await service.processMultimodalContext(
        imageData,
        voiceText,
        undefined,
        undefined,
        mimeType
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.text).toBe('Mocked Gemini response');
    });

    it('should process multimodal context with WebP MIME type', async () => {
      // Arrange
      const imageData = 'base64encodedwebpdata';
      const voiceText = 'Process this WebP image';
      const mimeType = 'image/webp';

      // Act
      const result = await service.processMultimodalContext(
        imageData,
        voiceText,
        undefined,
        undefined,
        mimeType
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.text).toBe('Mocked Gemini response');
    });

    it('should handle GIF MIME type', async () => {
      // Arrange
      const imageData = 'base64encodedgifdata';
      const voiceText = 'Analyze this GIF';
      const mimeType = 'image/gif';

      // Act
      const result = await service.processMultimodalContext(
        imageData,
        voiceText,
        undefined,
        undefined,
        mimeType
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.text).toBe('Mocked Gemini response');
    });
  });

  describe('processVisualContext', () => {
    it('should process visual context with default JPEG MIME type', async () => {
      // Arrange
      const imageData = 'base64encodedimagedata';
      const detectedObjects = [
        {
          id: 'obj1',
          name: 'object1',
          detection_confidence: 0.8,
          spatial_position: { x: 0, y: 0, z: 0 },
          last_interaction: new Date(),
          associated_actions: ['action1']
        }
      ];

      // Act
      const result = await service.processVisualContext(imageData, detectedObjects);

      // Assert
      expect(result).toBeDefined();
      expect(result.text).toBe('Mocked Gemini response');
    });

    it('should process visual context with PNG MIME type', async () => {
      // Arrange
      const imageData = 'base64encodedpngdata';
      const detectedObjects = [
        {
          id: 'obj1',
          name: 'object1',
          detection_confidence: 0.8,
          spatial_position: { x: 0, y: 0, z: 0 },
          last_interaction: new Date(),
          associated_actions: ['action1']
        }
      ];
      const mimeType = 'image/png';

      // Act
      const result = await service.processVisualContext(imageData, detectedObjects, mimeType);

      // Assert
      expect(result).toBeDefined();
      expect(result.text).toBe('Mocked Gemini response');
    });

    it('should process visual context with WebP MIME type', async () => {
      // Arrange
      const imageData = 'base64encodedwebpdata';
      const detectedObjects = [
        {
          id: 'obj1',
          name: 'object1',
          detection_confidence: 0.8,
          spatial_position: { x: 0, y: 0, z: 0 },
          last_interaction: new Date(),
          associated_actions: ['action1']
        }
      ];
      const mimeType = 'image/webp';

      // Act
      const result = await service.processVisualContext(imageData, detectedObjects, mimeType);

      // Assert
      expect(result).toBeDefined();
      expect(result.text).toBe('Mocked Gemini response');
    });
  });
});
