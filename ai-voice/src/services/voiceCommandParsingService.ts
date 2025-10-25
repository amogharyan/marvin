// Voice Command Parsing and Intent Recognition Service - Dev 2 Phase 2

import { ConversationContext, DemoObject } from '../types';
import { secureLog, debugLog, errorLog } from '../utils/secureLogger';
import { LEARNING_CONSTANTS } from '../constants/learningConstants';

export interface VoiceIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  action: string;
  parameters: Record<string, any>;
}

export interface ParsedCommand {
  intent: VoiceIntent;
  context: string;
  suggested_response: string;
  follow_up_actions: string[];
}

export class VoiceCommandParsingService {
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private entityPatterns: Map<string, RegExp[]> = new Map();

  constructor() {
    this.initializeIntentPatterns();
    this.initializeEntityPatterns();
    debugLog('🎯 Voice Command Parsing Service initialized');
  }

  /**
   * Redact PII from text for safe logging
   */
  private redactPII(text: string): string {
    if (!text) return '[EMPTY]';
    
    // Redact common PII patterns
    let redacted = text
      // Phone numbers (various formats)
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      .replace(/\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      // Email addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      // SSN (XXX-XX-XXXX)
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      // Credit card numbers (basic pattern)
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
      // Common names (basic pattern - could be enhanced)
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');
    
    // If text is too long, truncate and add indicator
    if (redacted.length > 100) {
      redacted = redacted.substring(0, 97) + '...';
    }
    
    return redacted || '[REDACTED]';
  }

  /**
   * Parse voice input to extract intent and entities
   */
  async parseVoiceCommand(
    voiceText: string,
    objectContext?: DemoObject,
    conversationContext?: ConversationContext,
    correlationId?: string
  ): Promise<ParsedCommand> {
    try {
      // Secure logging with PII redaction
      secureLog('🎯 Parsing voice command', voiceText, {
        redactSensitive: true,
        includeMetadata: true,
        maxLength: 100
      });

      // Debug logging with correlation ID and redacted PII
      const redactedText = this.redactPII(voiceText);
      debugLog(`🎯 Parsing voice command [${correlationId || 'no-id'}]: ${redactedText}`);

      const normalizedText = voiceText.toLowerCase().trim();
      
      // Extract intent
      const intent = this.extractIntent(normalizedText, objectContext);
      
      // Extract entities
      const entities = this.extractEntities(normalizedText, intent.intent);
      
      // Determine action and parameters
      const action = this.determineAction(intent, entities, objectContext);
      const parameters = this.extractParameters(intent, entities, objectContext);
      
      // Generate context and suggestions
      const context = this.generateContext(intent, entities, objectContext);
      const suggestedResponse = this.generateSuggestedResponse(intent, entities, objectContext);
      const followUpActions = this.generateFollowUpActions(intent, entities, objectContext);

      return {
        intent: {
          intent: intent.intent,
          confidence: intent.confidence,
          entities,
          action,
          parameters
        },
        context,
        suggested_response: suggestedResponse,
        follow_up_actions: followUpActions
      };
    } catch (error) {
      errorLog('Voice command parsing error', error);
      
      return {
        intent: {
          intent: 'unknown',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.COMMAND_UNKNOWN,
          entities: {},
          action: 'clarify',
          parameters: {}
        },
        context: 'I didn\'t understand that. Can you try again?',
        suggested_response: 'Could you please rephrase that?',
        follow_up_actions: ['Try again', 'Speak clearly', 'Use different words']
      };
    }
  }

  /**
   * Initialize intent recognition patterns
   */
  private initializeIntentPatterns(): void {
    // Medicine-related intents
    this.intentPatterns.set('medicine_reminder', [
      /medicine|medication|pill|drug|prescription/i,
      /take.*medicine|medicine.*time|time.*medicine/i,
      /remind.*medicine|medicine.*remind/i
    ]);

    // Nutrition-related intents
    this.intentPatterns.set('nutrition_info', [
      /nutrition|calorie|calories|healthy|unhealthy/i,
      /breakfast|lunch|dinner|meal|food/i,
      /recipe|ingredient|cooking/i,
      /what.*eat|eat.*what|should.*eat/i
    ]);

    // Schedule-related intents
    this.intentPatterns.set('schedule_check', [
      /schedule|calendar|meeting|appointment/i,
      /what.*today|today.*what|day.*overview/i,
      /next.*meeting|meeting.*next/i,
      /when.*meeting|meeting.*when/i
    ]);

    // Location-related intents
    this.intentPatterns.set('find_object', [
      /where.*keys|keys.*where|find.*keys/i,
      /where.*phone|phone.*where|find.*phone/i,
      /where.*wallet|wallet.*where|find.*wallet/i,
      /lost.*item|item.*lost/i
    ]);

    // Departure-related intents
    this.intentPatterns.set('departure_check', [
      /ready.*leave|leave.*ready|going.*out/i,
      /checklist|check.*list|departure/i,
      /what.*need|need.*what|forgot.*something/i
    ]);

    // General assistance intents
    this.intentPatterns.set('general_help', [
      /help|assist|support|what.*can.*do/i,
      /how.*work|how.*use|explain/i,
      /tell.*me|show.*me|give.*me/i
    ]);

    // Greeting intents
    this.intentPatterns.set('greeting', [
      /hello|hi|hey|good morning|good afternoon/i,
      /start.*day|begin.*day/i
    ]);

    // Object interaction intents
    this.intentPatterns.set('object_interaction', [
      /this.*object|object.*this|what.*this/i,
      /tell.*about|about.*this|explain.*this/i,
      /how.*use|use.*this|interact.*with/i
    ]);
  }

  /**
   * Initialize entity extraction patterns
   */
  private initializeEntityPatterns(): void {
    // Time entities
    this.entityPatterns.set('time', [
      /\b\d{1,2}:\d{2}\s*(am|pm)?\b/i,
      /\b(morning|afternoon|evening|night)\b/i,
      /\b(now|later|soon|next)\b/i
    ]);

    // Object entities
    this.entityPatterns.set('object', [
      /\b(keys|phone|wallet|laptop|medicine|bowl|breakfast)\b/i,
      /\b(item|thing|object)\b/i
    ]);

    // Action entities
    this.entityPatterns.set('action', [
      /\b(take|find|check|show|tell|explain|help)\b/i,
      /\b(remind|schedule|plan|organize)\b/i
    ]);

    // Quantity entities
    this.entityPatterns.set('quantity', [
      /\b(one|two|three|four|five|some|all|few)\b/i,
      /\b\d+\b/
    ]);
  }

  /**
   * Extract intent from voice text
   */
  private extractIntent(text: string, objectContext?: DemoObject): { intent: string; confidence: number } {
    let bestMatch = { intent: 'unknown', confidence: 0 };
    
    for (const [intent, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          const confidence = this.calculateConfidence(text, pattern, objectContext);
          if (confidence > bestMatch.confidence) {
            bestMatch = { intent, confidence };
          }
        }
      }
    }

    // Boost confidence if object context matches
    if (objectContext && this.isObjectContextRelevant(bestMatch.intent, objectContext)) {
      bestMatch.confidence = Math.min(LEARNING_CONSTANTS.CONFIDENCE.MAX_CONFIDENCE, bestMatch.confidence + LEARNING_CONSTANTS.CONFIDENCE.COMMAND_OBJECT_CONTEXT_BOOST);
    }

    return bestMatch;
  }

  /**
   * Extract entities from voice text
   */
  private extractEntities(text: string, _intent: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    for (const [entityType, patterns] of this.entityPatterns) {
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          entities[entityType] = matches[0];
        }
      }
    }

    return entities;
  }

  /**
   * Determine action based on intent and entities
   */
  private determineAction(intent: { intent: string; confidence: number }, _entities: Record<string, any>, _objectContext?: DemoObject): string {
    switch (intent.intent) {
      case 'medicine_reminder':
        return 'show_medicine_schedule';
      case 'nutrition_info':
        return 'analyze_nutrition';
      case 'schedule_check':
        return 'show_calendar';
      case 'find_object':
        return 'locate_object';
      case 'departure_check':
        return 'show_departure_checklist';
      case 'general_help':
        return 'provide_help';
      case 'greeting':
        return 'greet_user';
      case 'object_interaction':
        return 'interact_with_object';
      default:
        return 'clarify_intent';
    }
  }

  /**
   * Extract parameters for the action
   */
  private extractParameters(intent: { intent: string; confidence: number }, entities: Record<string, any>, objectContext?: DemoObject): Record<string, any> {
    const parameters: Record<string, any> = {
      confidence: intent.confidence,
      timestamp: new Date().toISOString()
    };

    // Add entity parameters
    Object.assign(parameters, entities);

    // Add object context parameters
    if (objectContext) {
      parameters.object_type = objectContext.name;
      parameters.object_confidence = objectContext.detection_confidence;
      parameters.spatial_position = objectContext.spatial_position;
    }

    return parameters;
  }

  /**
   * Generate context for the parsed command
   */
  private generateContext(intent: { intent: string; confidence: number }, entities: Record<string, any>, objectContext?: DemoObject): string {
    let context = `Intent: ${intent.intent} (confidence: ${intent.confidence.toFixed(2)})`;
    
    if (Object.keys(entities).length > 0) {
      context += ` | Entities: ${Object.keys(entities).join(', ')}`;
    }
    
    if (objectContext) {
      context += ` | Object: ${objectContext.name}`;
    }

    return context;
  }

  /**
   * Generate suggested response based on parsed command
   */
  private generateSuggestedResponse(intent: { intent: string; confidence: number }, entities: Record<string, any>, objectContext?: DemoObject): string {
    switch (intent.intent) {
      case 'medicine_reminder':
        return 'I can help you with your medicine schedule. Let me check your medication reminders.';
      case 'nutrition_info':
        return 'I can analyze nutrition information and suggest healthy options for you.';
      case 'schedule_check':
        return 'Let me check your schedule and prepare your day overview.';
      case 'find_object':
        return 'I can help you locate your items. Let me check their last known positions.';
      case 'departure_check':
        return 'I\'ll help you prepare for departure. Let me run through your checklist.';
      case 'general_help':
        return 'I\'m here to help with your morning routine. What would you like assistance with?';
      case 'greeting':
        return 'Good morning! Ready to start your day? How can I help you?';
      case 'object_interaction':
        return `I can help you interact with the ${objectContext?.name || 'object'}. What would you like to know?`;
      default:
        return 'I understand you need help. Could you be more specific about what you\'d like me to do?';
    }
  }

  /**
   * Generate follow-up actions based on parsed command
   */
  private generateFollowUpActions(intent: { intent: string; confidence: number }, _entities: Record<string, any>, _objectContext?: DemoObject): string[] {
    switch (intent.intent) {
      case 'medicine_reminder':
        return ['Show medicine schedule', 'Set reminder', 'Track medication'];
      case 'nutrition_info':
        return ['Analyze nutrition', 'Suggest recipes', 'Track calories'];
      case 'schedule_check':
        return ['Show calendar', 'Check meetings', 'Day overview'];
      case 'find_object':
        return ['Locate items', 'Show locations', 'Track objects'];
      case 'departure_check':
        return ['Check checklist', 'Verify items', 'Ready to leave'];
      case 'general_help':
        return ['Show options', 'Explain features', 'Get assistance'];
      case 'greeting':
        return ['Start routine', 'Check schedule', 'Get reminders'];
      case 'object_interaction':
        return ['Interact with object', 'Get information', 'Show options'];
      default:
        return ['Try again', 'Get help', 'Show options'];
    }
  }

  /**
   * Calculate confidence score for intent matching
   */
  private calculateConfidence(text: string, pattern: RegExp, _objectContext?: DemoObject): number {
    const match = text.match(pattern);
    if (!match) return 0;

    let confidence = LEARNING_CONSTANTS.CONFIDENCE.COMMAND_BASE; // Base confidence

    // Boost confidence for exact matches
    if (match[0].length === text.length) {
      confidence += LEARNING_CONSTANTS.CONFIDENCE.COMMAND_EXACT_MATCH_BOOST;
    }

    // Boost confidence for longer matches
    confidence += Math.min(LEARNING_CONSTANTS.CONFIDENCE.COMMAND_LENGTH_BOOST_MAX, match[0].length / text.length);

    return Math.min(LEARNING_CONSTANTS.CONFIDENCE.MAX_CONFIDENCE, confidence);
  }

  /**
   * Check if object context is relevant to the intent
   */
  private isObjectContextRelevant(intent: string, objectContext: DemoObject): boolean {
    const relevantObjects: Record<string, string[]> = {
      'medicine_reminder': ['medicine_bottle'],
      'nutrition_info': ['breakfast_bowl'],
      'schedule_check': ['laptop'],
      'find_object': ['keys', 'phone'],
      'departure_check': ['keys'],
      'object_interaction': ['breakfast_bowl', 'laptop', 'keys', 'medicine_bottle', 'phone']
    };

    const relevantList = relevantObjects[intent] || [];
    return relevantList.includes(objectContext.name);
  }

  /**
   * Health check for voice command parsing service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testCommand = await this.parseVoiceCommand('help me with my medicine');
      return testCommand.intent.intent !== 'unknown';
    } catch (error) {
      errorLog('Voice command parsing health check failed', error);
      return false;
    }
  }
}
