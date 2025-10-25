// Gemini API Integration Service

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { GeminiRequest, GeminiResponse, DemoObject, DEMO_OBJECTS } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
  }

  /**
   * Process contextual request with visual and object context
   */
  async processContextualRequest(
    request: GeminiRequest,
    objectContext?: DemoObject
  ): Promise<GeminiResponse> {
    try {
      const prompt = this.buildContextualPrompt(request, objectContext);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text: text,
        confidence: 0.9, // Gemini doesn't provide confidence scores directly
        safety_ratings: response.candidates?.[0]?.safetyRatings || []
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini processing failed: ${error}`);
    }
  }

  /**
   * Build contextual prompt for object-specific interactions
   */
  private buildContextualPrompt(request: GeminiRequest, objectContext?: DemoObject): string {
    const systemContext = this.buildSystemContext();
    
    let objectSpecificContext = '';
    if (objectContext && DEMO_OBJECTS[objectContext.name as keyof typeof DEMO_OBJECTS]) {
      const objectConfig = DEMO_OBJECTS[objectContext.name as keyof typeof DEMO_OBJECTS];
      objectSpecificContext = `
Object Context:
- Object: ${objectContext.name}
- Confidence: ${objectContext.detection_confidence}
- Position: (${objectContext.spatial_position.x}, ${objectContext.spatial_position.y}, ${objectContext.spatial_position.z})
- AI Context: ${objectConfig.ai_context}
- Available Actions: ${objectConfig.triggers.join(', ')}
`;
    }

    return `${systemContext}

${objectSpecificContext}

User Request: ${request.prompt}

Context: ${request.context}

Please provide a helpful, concise response that considers the object context and user's current situation.`;
  }

  /**
   * Build system context for SnapJarvis AR assistant
   */
  private buildSystemContext(): string {
    return `You are SnapJarvis, an AR morning assistant that helps users through their daily routine. You provide:

- Medicine reminders and health tracking
- Nutrition analysis and recipe suggestions  
- Calendar management and meeting preparation
- Object location and departure assistance
- Device integration and connectivity help

Guidelines:
- Respond naturally and concisely
- Focus on actionable guidance
- Consider the time of day and user's routine patterns
- Be proactive but not intrusive
- Use the object context to provide relevant assistance
- Keep responses under 100 words for AR display

Current time: ${new Date().toLocaleTimeString()}`;
  }

  /**
   * Process visual context from camera feed
   */
  async processVisualContext(
    imageData: string,
    detectedObjects: DemoObject[]
  ): Promise<GeminiResponse> {
    try {
      const prompt = `Analyze this AR scene and provide contextual assistance based on the detected objects:

Detected Objects: ${detectedObjects.map(obj => 
  `${obj.name} (confidence: ${obj.detection_confidence})`
).join(', ')}

Provide helpful suggestions for what the user might want to do next.`;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      return {
        text: text,
        confidence: 0.85,
        safety_ratings: response.candidates?.[0]?.safetyRatings || []
      };
    } catch (error) {
      console.error('Gemini Visual Processing Error:', error);
      throw new Error(`Visual context processing failed: ${error}`);
    }
  }

  /**
   * Generate object-specific suggestions
   */
  async generateObjectSuggestions(objectType: string): Promise<string[]> {
    const objectConfig = DEMO_OBJECTS[objectType as keyof typeof DEMO_OBJECTS];
    if (!objectConfig) {
      return ['How can I help you today?'];
    }

    const prompt = `Generate 3 helpful suggestions for someone interacting with a ${objectType} during their morning routine. 
    Context: ${objectConfig.ai_context}
    Available actions: ${objectConfig.triggers.join(', ')}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse suggestions from response
      return text.split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 3)
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim());
    } catch (error) {
      console.error('Suggestion generation error:', error);
      return objectConfig.voice_prompts.slice(0, 3);
    }
  }
}
