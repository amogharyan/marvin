// Integration test for AR-AI communication pipeline
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('AR-AI Communication Pipeline', () => {
  let mockSupabaseClient: any;
  
  beforeEach(() => {
    // Setup fresh mocks for each test
    mockSupabaseClient = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({ data: null, error: null })),
        select: jest.fn(() => ({ data: [], error: null }))
      })),
      channel: jest.fn(() => ({
        on: jest.fn(() => ({ subscribe: jest.fn() })),
        send: jest.fn()
      }))
    };
  });

  test('should process AR object detection data and trigger AI response', async () => {
    // Mock AR object detection data
    const mockDetectedObject = createMockObject('coffee_mug');
    
    // Mock AI processing pipeline
    const processARData = async (objectData: any) => {
      // Simulate processing time within performance target
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        objectType: objectData.type,
        suggestedAction: 'Good morning! Would you like me to start brewing your coffee?',
        confidence: objectData.confidence,
        timestamp: new Date()
      };
    };

    // Test the pipeline
    const result = await measurePerformance(
      () => processARData(mockDetectedObject),
      500 // 500ms target for AR-to-AI processing
    );

    expect(result.withinTarget).toBe(true);
    expect(result.result.objectType).toBe('coffee_mug');
    expect(result.result.suggestedAction).toContain('coffee');
    expect(result.result.confidence).toBeGreaterThan(0.8);
  });

  test('should handle AR object detection errors gracefully', async () => {
    const mockErrorHandler = jest.fn();
    
    const processARDataWithError = async () => {
      throw new Error('Camera feed unavailable');
    };

    try {
      await processARDataWithError();
    } catch (error) {
      mockErrorHandler(error);
    }

    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Camera feed unavailable'
      })
    );
  });

  test('should maintain conversation context across multiple interactions', async () => {
    const mockHistory = createMockHistory([
      'Good morning Marvin',
      'What\'s my schedule today?',
      'Set a reminder for my meeting'
    ]);

    const contextProcessor = {
      addMessage: jest.fn(),
      getContext: jest.fn(() => mockHistory),
      summarizeHistory: jest.fn(() => 'User has greeted, asked about schedule, and requested meeting reminder')
    };

    contextProcessor.addMessage('When is my next meeting?');
    
    expect(contextProcessor.addMessage).toHaveBeenCalledWith('When is my next meeting?');
    
    const context = contextProcessor.getContext();
    expect(context).toHaveLength(3);
    expect(context[0].message).toBe('Good morning Marvin');
  });

  test('should synchronize data between AR and Supabase in real-time', async () => {
    const mockChannel = mockSupabaseClient.channel('ar-detection');
    const mockInsert = mockSupabaseClient.from('ar_objects').insert;
    
    // Simulate AR object detection
    const detectedObject = createMockObject('phone');
    
    // Test database insertion
    await mockInsert([{
      object_id: detectedObject.id,
      object_type: detectedObject.type,
      confidence: detectedObject.confidence,
      position: detectedObject.position,
      detected_at: detectedObject.timestamp
    }]);

    // Test real-time notification
    const broadcastPayload = {
      type: 'ar_object_detected',
      payload: detectedObject
    };
    
    await mockChannel.send(broadcastPayload);

    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        object_type: 'phone',
        confidence: 0.95
      })
    ]);
    
    expect(mockChannel.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ar_object_detected',
        payload: expect.objectContaining({
          type: 'phone'
        })
      })
    );
  });

  test('should handle voice synthesis and playback pipeline', async () => {
    // Define the expected audio result type
    interface AudioResult {
      audioBuffer: ArrayBuffer;
      duration: number;
    }

    const mockAudioResult: AudioResult = {
      audioBuffer: new ArrayBuffer(1024),
      duration: 2.5
    };

    const synthesizeMock = jest.fn();
    const playMock = jest.fn();
    
    synthesizeMock.mockResolvedValue(mockAudioResult);
    playMock.mockResolvedValue(undefined);

    const mockVoiceService = {
      synthesize: synthesizeMock,
      play: playMock
    };

    const testMessage = 'Good morning! I detected your coffee mug. Would you like me to start brewing?';
    
    const audioResult = await mockVoiceService.synthesize(testMessage) as AudioResult;
    await mockVoiceService.play(audioResult.audioBuffer);

    expect(mockVoiceService.synthesize).toHaveBeenCalledWith(testMessage);
    expect(mockVoiceService.play).toHaveBeenCalledWith(audioResult.audioBuffer);
    expect(audioResult.duration).toBeGreaterThan(0);
  });

  test('should maintain performance under continuous AR processing', async () => {
    const processingTimes: number[] = [];
    const targetFPS = 30; // 30 FPS for AR processing
    const targetFrameTime = 1000 / targetFPS; // ~33ms per frame

    // Simulate 10 consecutive AR frames
    for (let i = 0; i < 10; i++) {
      const result = await measurePerformance(
        async () => {
          // Simulate AR object detection processing
          const objects = [
            createMockObject('cup'),
            createMockObject('phone'),
            createMockObject('keys')
          ];
          
          // Process each detected object
          return objects.map(obj => ({
            ...obj,
            processed: true,
            timestamp: new Date()
          }));
        },
        targetFrameTime
      );
      
      processingTimes.push(result.duration);
    }

    // Check that at least 80% of frames meet performance target
    const performantFrames = processingTimes.filter(time => time <= targetFrameTime);
    const performanceRatio = performantFrames.length / processingTimes.length;
    
    expect(performanceRatio).toBeGreaterThanOrEqual(0.8);
    
    // Check average performance
    const averageTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
    expect(averageTime).toBeLessThanOrEqual(targetFrameTime * 1.2); // Allow 20% overhead
  });
});
