import request from 'supertest';
import app from '../../src/app';
import { createMockConversationContext, createMockDemoObject } from '../utils/testHelpers';

describe('API Endpoints Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      // Act
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('services');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/process-multimodal', () => {
    it('should process multimodal input', async () => {
      // Arrange
      const requestBody = {
        imageData: 'base64_test_image',
        voiceText: 'Help me with my medicine',
        conversationContext: createMockConversationContext()
      };

      // Act
      const response = await request(app)
        .post('/api/process-multimodal')
        .send(requestBody)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data).toHaveProperty('context');
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const requestBody = {
        voiceText: 'Help me with my medicine',
        conversationContext: createMockConversationContext()
        // Missing imageData
      };

      // Act & Assert
      await request(app)
        .post('/api/process-multimodal')
        .send(requestBody)
        .expect(400);
    });
  });

  describe('POST /api/process-voice', () => {
    it('should process voice input', async () => {
      // Arrange
      const requestBody = {
        voiceText: 'Help me with my medicine schedule',
        conversationContext: createMockConversationContext()
      };

      // Act
      const response = await request(app)
        .post('/api/process-voice')
        .send(requestBody)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('confidence');
    });
  });

  describe('POST /api/process-object', () => {
    it('should process object detection', async () => {
      // Arrange
      const requestBody = {
        detectedObject: createMockDemoObject(),
        userMessage: 'What should I eat for breakfast?',
        conversationContext: createMockConversationContext()
      };

      // Act
      const response = await request(app)
        .post('/api/process-object')
        .send(requestBody)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('context');
    });
  });

  describe('GET /api/demo/objects', () => {
    it('should return demo objects', async () => {
      // Act
      const response = await request(app)
        .get('/api/demo/objects')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('detection_confidence');
    });
  });

  describe('POST /api/proactive-assistance', () => {
    it('should generate proactive assistance', async () => {
      // Arrange
      const requestBody = {
        conversationContext: createMockConversationContext(),
        timeOfDay: 'morning'
      };

      // Act
      const response = await request(app)
        .post('/api/proactive-assistance')
        .send(requestBody)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('suggested_actions');
    }, 15000);
  });
});
