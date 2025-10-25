// Gemini API Integration Service

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { GeminiRequest, GeminiResponse, DemoObject, DEMO_OBJECTS, ChatMessage } from '../types';
import { secureLog, errorLog } from '../utils/secureLogger';

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
        confidence: this.calculateConfidence(response),
        safety_ratings: response.candidates?.[0]?.safetyRatings || []
      };
    } catch (error) {
      errorLog('Gemini API Error', error);
      throw new Error(`Gemini processing failed: ${error}`);
    }
  }

  /**
   * Calculate confidence score based on Gemini response data
   * 
   * Returns a computed confidence score (0.1-1.0) based on:
   * - Candidate existence (undefined if no candidate)
   * - Safety ratings severity (reduced confidence for high/medium severity)
   * - Finish reason (boost for STOP, reduction for SAFETY)
   * - Response length (reduction for very short responses)
   * 
   * @param response - Gemini API response object
   * @returns Confidence score (0.1-1.0) or undefined if cannot be determined
   */
  private calculateConfidence(response: any): number | undefined {
    try {
      const candidate = response.candidates?.[0];
      
      // No candidate means no response
      if (!candidate) {
        return undefined;
      }
      
      // Check for high-severity safety ratings that would reduce confidence
      const safetyRatings = candidate.safetyRatings || [];
      const hasHighSeveritySafety = safetyRatings.some((rating: any) => 
        rating.severity === 'HIGH' || rating.severity === 'MEDIUM'
      );
      
      // Base confidence on candidate existence and safety
      let confidence = 0.8; // Base confidence for successful response
      
      // Reduce confidence for safety issues
      if (hasHighSeveritySafety) {
        confidence -= 0.3;
      }
      
      // Check if response has finish reason (indicates completion)
      if (candidate.finishReason === 'STOP') {
        confidence += 0.1; // Slight boost for complete responses
      } else if (candidate.finishReason === 'SAFETY') {
        confidence -= 0.2; // Reduce for safety-related stops
      }
      
      // Check response length (very short responses might be less confident)
      const text = response.text?.() || '';
      if (text.length < 10) {
        confidence -= 0.1;
      } else if (text.length > 100) {
        confidence += 0.05; // Slight boost for detailed responses
      }
      
      // Normalize to valid range
      return Math.max(0.1, Math.min(1.0, confidence));
      
    } catch (error) {
      // If calculation fails, return undefined to indicate unknown confidence
      return undefined;
    }
  }
  async processMultimodalContext(
    imageData: string,
    voiceText: string,
    objectContext?: DemoObject,
    conversationHistory?: ChatMessage[],
    mimeType: string = 'image/jpeg'
  ): Promise<GeminiResponse> {
    try {
      secureLog('🔍 Advanced multimodal processing', voiceText, {
        redactSensitive: true,
        includeMetadata: true,
        maxLength: 100
      });
      
      const multimodalPrompt = this.buildMultimodalPrompt(
        voiceText,
        objectContext,
        conversationHistory
      );

      // Add voice input as separate text part to avoid PII exposure in template
      const voiceInputPart = `USER VOICE INPUT: "${voiceText}"`;

      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: multimodalPrompt },
              { text: voiceInputPart },
              { inlineData: { data: imageData, mimeType: mimeType } }
            ]
          }
        ]
      });

      const response = await result.response;
      const text = response.text();

      return {
        text: text,
        confidence: this.calculateConfidence(response),
        safety_ratings: response.candidates?.[0]?.safetyRatings || []
      };
    } catch (error) {
      errorLog('Multimodal processing error', error);
      throw new Error(`Multimodal processing failed: ${error}`);
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
   * Build advanced multimodal prompt combining visual and conversational context
   */
  private buildMultimodalPrompt(
    voiceText: string,
    objectContext?: DemoObject,
    conversationHistory?: ChatMessage[]
  ): string {
    const systemContext = this.buildAdvancedSystemContext();
    
    let objectSpecificContext = '';
    if (objectContext && DEMO_OBJECTS[objectContext.name as keyof typeof DEMO_OBJECTS]) {
      const objectConfig = DEMO_OBJECTS[objectContext.name as keyof typeof DEMO_OBJECTS];
      objectSpecificContext = `
OBJECT DETECTED: ${objectContext.name}
- Detection Confidence: ${objectContext.detection_confidence}
- Spatial Position: (${objectContext.spatial_position.x}, ${objectContext.spatial_position.y}, ${objectContext.spatial_position.z})
- Context: ${objectConfig.ai_context}
- Available Actions: ${objectConfig.triggers.join(', ')}
- Suggested Prompts: ${objectConfig.voice_prompts.join(', ')}
`;
    }

    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-5); // Last 5 messages
      conversationContext = `
RECENT CONVERSATION:
${recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
`;
    }

    return `${systemContext}

${objectSpecificContext}

${conversationContext}

USER VOICE INPUT: [PROCESSED VOICE INPUT]

VISUAL ANALYSIS: Analyze the image in context with the detected object and user's voice input.

INSTRUCTIONS:
1. Consider both the visual scene and the user's spoken request
2. Provide contextual assistance based on the detected object
3. Reference conversation history for continuity
4. Be proactive but not intrusive
5. Keep responses concise (under 100 words) for AR display
6. Include specific, actionable suggestions

Provide a helpful response that combines visual understanding with conversational context.`;
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
   * Build advanced system context for multimodal processing
   */
  private buildAdvancedSystemContext(): string {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    return `You are SnapJarvis, an advanced AR morning assistant with multimodal AI capabilities. You provide intelligent, contextual assistance through:

CORE CAPABILITIES:
- Visual scene understanding and object recognition
- Conversational AI with memory and context awareness
- Proactive assistance based on user patterns and preferences
- Multimodal processing combining vision, voice, and context

ASSISTANCE AREAS:
- Medicine reminders and health tracking
- Nutrition analysis and recipe suggestions  
- Calendar management and meeting preparation
- Object location and departure assistance
- Device integration and connectivity help

ADVANCED GUIDELINES:
- Process both visual and auditory input simultaneously
- Maintain conversation context and user preferences
- Provide personalized suggestions based on detected objects
- Adapt responses to time of day and user patterns
- Be proactive but not intrusive
- Keep responses concise (under 100 words) for AR display
- Include specific, actionable suggestions

CURRENT CONTEXT:
- Time: ${currentTime.toLocaleTimeString()}
- Time of Day: ${timeOfDay}
- Processing Mode: Multimodal (Visual + Voice + Context)`;
  }

  /**
   * Process visual context from camera feed
   */
  async processVisualContext(
    imageData: string,
    detectedObjects: DemoObject[],
    mimeType: string = 'image/jpeg'
  ): Promise<GeminiResponse> {
    try {
      const prompt = `Analyze this AR scene and provide contextual assistance based on the detected objects:

Detected Objects: ${detectedObjects.map(obj => 
  `${obj.name} (confidence: ${obj.detection_confidence})`
).join(', ')}

Provide helpful suggestions for what the user might want to do next.`;

      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { data: imageData, mimeType: mimeType } }
            ]
          }
        ]
      });

      const response = await result.response;
      const text = response.text();

      return {
        text: text,
        confidence: this.calculateConfidence(response),
        safety_ratings: response.candidates?.[0]?.safetyRatings || []
      };
    } catch (error) {
      errorLog('Gemini Visual Processing Error', error);
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
      errorLog('Suggestion generation error', error);
      return objectConfig.voice_prompts.slice(0, 3);
    }
  }
}
