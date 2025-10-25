// Voice Processing Service for Basic Conversational Logic

import { ConversationContext, DemoObject, ChatMessage, DEMO_OBJECTS } from '../types';
import { secureLog, safeLog } from '../utils/secureLogger';

export class VoiceProcessingService {
  private conversationMemory: Map<string, ConversationContext> = new Map();

  constructor() {
    safeLog('🎤 Voice Processing Service initialized');
  }

  /**
   * Process voice input with basic conversational logic
   */
  async processVoiceInput(
    voiceText: string,
    conversationContext: ConversationContext,
    objectContext?: DemoObject
  ): Promise<{ response: string; confidence: number; suggested_actions: string[] }> {
    try {
      secureLog('🎤 Processing voice input', voiceText, {
        redactSensitive: true,
        includeMetadata: true,
        maxLength: 100
      });

      // Update conversation context
      this.updateConversationContext(conversationContext);

      // Generate contextual response
      const response = this.generateContextualResponse(voiceText, objectContext, conversationContext);
      
      // Add to conversation history
      this.addToConversationHistory(
        conversationContext.session_id,
        'assistant',
        response,
        objectContext?.name
      );

      return {
        response: response,
        confidence: 0.8,
        suggested_actions: this.extractSuggestedActions(response, objectContext)
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      
      return {
        response: 'I heard you, but I\'m having trouble processing that right now. Can you try again?',
        confidence: 0.3,
        suggested_actions: ['Try again', 'Speak clearly', 'Use text']
      };
    }
  }

  /**
   * Generate contextual response based on voice input and object context
   */
  private generateContextualResponse(
    voiceText: string,
    objectContext?: DemoObject,
    conversationContext?: ConversationContext
  ): string {
    const lowerText = voiceText.toLowerCase();
    
    // Object-specific responses
    if (objectContext) {
      const objectConfig = DEMO_OBJECTS[objectContext.name as keyof typeof DEMO_OBJECTS];
      if (objectConfig) {
        return this.generateObjectSpecificResponse(lowerText, objectContext, objectConfig);
      }
    }

    // General conversational responses
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return 'Hello! I\'m here to help with your morning routine. What would you like to do?';
    }
    
    if (lowerText.includes('help') || lowerText.includes('what can you do')) {
      return 'I can help you with medicine reminders, breakfast suggestions, calendar briefings, finding your keys, and more. What do you need help with?';
    }
    
    if (lowerText.includes('schedule') || lowerText.includes('calendar')) {
      return 'I can help you check your schedule. Let me look at your calendar for today.';
    }
    
    if (lowerText.includes('medicine') || lowerText.includes('medication')) {
      return 'I can help you with medicine reminders. What medication do you need to take?';
    }
    
    if (lowerText.includes('breakfast') || lowerText.includes('food')) {
      return 'I can help you with breakfast suggestions and nutrition information. What would you like to eat?';
    }
    
    if (lowerText.includes('keys') || lowerText.includes('where')) {
      return 'I can help you find your keys. Let me check their last known location.';
    }
    
    if (lowerText.includes('thank') || lowerText.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }

    // Default response
    return 'I understand. How can I help you with your morning routine?';
  }

  /**
   * Generate object-specific responses
   */
  private generateObjectSpecificResponse(
    voiceText: string,
    objectContext: DemoObject,
    objectConfig: any
  ): string {
    const objectName = objectContext.name;
    
    switch (objectName) {
      case 'breakfast_bowl':
        if (voiceText.includes('what') || voiceText.includes('breakfast')) {
          return 'I can see your breakfast bowl. I can help you with nutrition information and suggest healthy options. What would you like to know?';
        }
        return 'I see your breakfast bowl. Ready for breakfast? I can help with nutrition info and recipe suggestions.';
        
      case 'laptop':
        if (voiceText.includes('schedule') || voiceText.includes('calendar')) {
          return 'I can see your laptop. Let me check your schedule for today and prepare your meeting briefings.';
        }
        return 'I see your laptop. I can help you with your schedule, meeting prep, and day overview.';
        
      case 'keys':
        if (voiceText.includes('where') || voiceText.includes('find')) {
          return 'I can see your keys right here! Ready to leave? Let me check your departure checklist.';
        }
        return 'I found your keys! Are you ready to leave? I can help with your departure checklist.';
        
      case 'medicine_bottle':
        if (voiceText.includes('medicine') || voiceText.includes('take')) {
          return 'I can see your medicine bottle. Time for your medication? Let me check your schedule.';
        }
        return 'I see your medicine bottle. Ready for your medication reminder?';
        
      case 'phone':
        if (voiceText.includes('connect') || voiceText.includes('sync')) {
          return 'I can see your phone. I can help you check connectivity and sync your devices.';
        }
        return 'I see your phone. I can help with connectivity and device integration.';
        
      default:
        return `I can see a ${objectName}. How can I help you with it?`;
    }
  }

  /**
   * Extract suggested actions from response
   */
  private extractSuggestedActions(response: string, objectContext?: DemoObject): string[] {
    const actions: string[] = [];
    
    if (response.includes('schedule') || response.includes('calendar')) {
      actions.push('Show my schedule', 'Check meetings', 'Day overview');
    }
    
    if (response.includes('medicine') || response.includes('medication')) {
      actions.push('Medicine reminder', 'Health schedule', 'Track medication');
    }
    
    if (response.includes('breakfast') || response.includes('nutrition')) {
      actions.push('Nutrition info', 'Recipe suggestions', 'Calorie tracking');
    }
    
    if (response.includes('keys') || response.includes('departure')) {
      actions.push('Departure checklist', 'Location tracking', 'Ready to leave');
    }
    
    if (response.includes('phone') || response.includes('connect')) {
      actions.push('Check connectivity', 'Sync devices', 'Backup mode');
    }
    
    // Default actions if no specific ones found
    if (actions.length === 0) {
      actions.push('Tell me more', 'Show options', 'Help me');
    }
    
    return actions.slice(0, 3); // Return max 3 actions
  }

  /**
   * Update conversation context in memory
   */
  private updateConversationContext(context: ConversationContext): void {
    this.conversationMemory.set(context.session_id, context);
  }

  /**
   * Add message to conversation history
   */
  private addToConversationHistory(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    objectContext?: string
  ): void {
    const context = this.conversationMemory.get(sessionId);
    if (context) {
      context.conversation_history.push({
        role,
        content,
        timestamp: new Date(),
        object_context: objectContext
      });
      
      // Keep only last 10 messages to prevent memory bloat
      if (context.conversation_history.length > 10) {
        context.conversation_history = context.conversation_history.slice(-10);
      }
    }
  }

  /**
   * Generate proactive assistance based on context
   */
  async generateProactiveAssistance(
    conversationContext: ConversationContext,
    timeOfDay: string
  ): Promise<{ response: string; confidence: number; suggested_actions: string[] }> {
    try {
      console.log(`⏰ Generating proactive assistance for ${timeOfDay}`);

      const hour = new Date().getHours();
      let response = '';
      let suggested_actions: string[] = [];

      if (hour >= 6 && hour < 9) {
        response = 'Good morning! Time to start your routine. What would you like to focus on first?';
        suggested_actions = ['Take medicine', 'Check schedule', 'Have breakfast'];
      } else if (hour >= 9 && hour < 12) {
        response = 'Morning is going well! Any tasks or reminders you need help with?';
        suggested_actions = ['Check meetings', 'Find keys', 'Review schedule'];
      } else {
        response = 'How can I help you with your day?';
        suggested_actions = ['Check schedule', 'Find items', 'Get reminders'];
      }

      return {
        response: response,
        confidence: 0.9,
        suggested_actions: suggested_actions
      };
    } catch (error) {
      console.error('Proactive assistance error:', error);
      
      return {
        response: 'Good morning! Ready to start your day?',
        confidence: 0.6,
        suggested_actions: ['Check schedule', 'Take medicine', 'Have breakfast']
      };
    }
  }

  /**
   * Get conversation context by session ID
   */
  getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.conversationMemory.get(sessionId);
  }

  /**
   * Clear conversation context
   */
  clearConversationContext(sessionId: string): void {
    this.conversationMemory.delete(sessionId);
  }

  /**
   * Health check for voice processing service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple test to ensure service is working
      const testResponse = this.generateContextualResponse('test', undefined, undefined);
      return testResponse.length > 0;
    } catch (error) {
      console.error('Voice processing health check failed:', error);
      return false;
    }
  }
}
