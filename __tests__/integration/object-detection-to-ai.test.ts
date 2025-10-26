// Integration Test: Object Detection → AI Processing
// Tests the flow from object detection to Gemini AI response

import { MockMLComponent, MockRemoteServiceModule, MockEvent } from '../mocks/lens-studio';

describe('Object Detection to AI Integration', () => {
  let mlComponent: MockMLComponent;
  let geminiService: MockRemoteServiceModule;

  beforeEach(() => {
    mlComponent = new MockMLComponent();
    geminiService = new MockRemoteServiceModule();
  });

  describe('Medicine Bottle Detection Flow', () => {
    it('should detect object and trigger AI processing', (done) => {
      // Set up detection callback
      mlComponent.setDetectionCallback((result) => {
        expect(result).toBeDefined();
        expect(result.label).toBe('medicine');
        expect(result.confidence).toBeGreaterThan(0.8);
        done();
      });

      // Trigger detection
      mlComponent.runImmediate();
    });

    it('should process AI request after detection', (done) => {
      const request = geminiService.createRequest('/gemini/test');
      
      geminiService.performApiRequest(request, (response) => {
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        done();
      });
    });
  });

  describe('Event-Driven Integration', () => {
    it('should trigger events when detection completes', (done) => {
      mlComponent.onRunningFinished.add((result) => {
        expect(result).toBeDefined();
        done();
      });

      mlComponent.onRunningFinished.trigger({ label: 'bowl', confidence: 0.92 });
    });

    it('should allow multiple event listeners', () => {
      let callCount = 0;
      
      mlComponent.onRunningFinished.add(() => callCount++);
      mlComponent.onRunningFinished.add(() => callCount++);
      
      mlComponent.onRunningFinished.trigger({ test: true });
      
      expect(callCount).toBe(2);
    });
  });

  describe('Performance Integration', () => {
    it('should complete detection-to-AI flow quickly', (done) => {
      const startTime = Date.now();
      
      mlComponent.setDetectionCallback((result) => {
        const request = geminiService.createRequest('/process');
        
        geminiService.performApiRequest(request, (response) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          expect(duration).toBeLessThan(2000); // <2s requirement
          done();
        });
      });

      mlComponent.runImmediate();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing detection callback gracefully', () => {
      expect(() => {
        mlComponent.runImmediate();
      }).not.toThrow();
    });

    it('should handle API request without callback', () => {
      const request = geminiService.createRequest('/test');
      expect(() => {
        geminiService.performApiRequest(request, () => {});
      }).not.toThrow();
    });
  });

  describe('Component Lifecycle', () => {
    it('should allow building ML component with inputs', () => {
      expect(() => {
        mlComponent.build([{ input: 'test' }]);
      }).not.toThrow();
    });

    it('should create valid API requests', () => {
      const request = geminiService.createRequest('/gemini/endpoint');
      expect(request).toBeDefined();
      expect(request.send).toBeDefined();
      expect(typeof request.send).toBe('function');
    });

    it('should support async request sending', async () => {
      const request = geminiService.createRequest('/test');
      const response = await request.send({ prompt: 'test' });
      
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
    });
  });
});

