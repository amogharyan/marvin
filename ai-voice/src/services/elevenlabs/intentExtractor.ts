// Intent Extractor - ElevenLabs Integration
// Extracts intents and entities from voice text and object context

import { DemoObject } from '../../types';

export interface ExtractedIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

export class IntentExtractor {
  private intentMap: Record<string, string[]> = {
    medicine: ['medicine', 'medication', 'pill', 'vitamin', 'drug', 'prescription'],
    nutrition: ['breakfast', 'food', 'meal', 'eat', 'hungry', 'cereal', 'fruit'],
    schedule: ['schedule', 'calendar', 'meeting', 'appointment', 'time', 'when'],
    location: ['keys', 'location', 'where', 'find', 'lost', 'missing'],
    device: ['phone', 'device', 'sync', 'connect', 'pair', 'bluetooth'],
    health: ['health', 'doctor', 'sick', 'pain', 'symptom', 'blood pressure'],
    work: ['work', 'task', 'project', 'deadline', 'email', 'presentation'],
    general: ['help', 'what', 'how', 'why', 'tell me', 'explain']
  };

  private entityPatterns: Record<string, RegExp> = {
    time: /(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm|AM|PM))/g,
    medication: /(vitamin|pill|medication|medicine|drug|prescription)/gi,
    food: /(cereal|fruit|breakfast|lunch|dinner|meal)/gi,
    object: /(keys|phone|laptop|medicine|breakfast|bowl)/gi,
    action: /(take|find|locate|schedule|remind|help)/gi
  };

  /**
   * Extract intent from voice text and object context
   */
  public extractIntent(voiceText: string, objectContext?: DemoObject): ExtractedIntent {
    const lowerText = voiceText.toLowerCase();
    
    // Find matching intent
    const matchedIntent = this.findMatchingIntent(lowerText, objectContext);
    
    // Extract entities
    const entities = this.extractEntities(voiceText, objectContext);
    
    // Calculate confidence based on text match and object context
    const confidence = this.calculateIntentConfidence(lowerText, matchedIntent, objectContext);

    return {
      intent: matchedIntent,
      confidence,
      entities
    };
  }

  /**
   * Find the best matching intent
   */
  private findMatchingIntent(text: string, objectContext?: DemoObject): string {
    let bestMatch = 'general_query';
    let maxScore = 0;

    for (const [intent, keywords] of Object.entries(this.intentMap)) {
      const score = this.calculateIntentScore(text, keywords, objectContext);
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = this.formatIntentName(intent);
      }
    }

    return bestMatch;
  }

  /**
   * Calculate intent matching score
   */
  private calculateIntentScore(
    text: string, 
    keywords: string[], 
    objectContext?: DemoObject
  ): number {
    let score = 0;

    // Count keyword matches
    const keywordMatches = keywords.filter(keyword => text.includes(keyword)).length;
    score += keywordMatches * 0.3;

    // Boost score if object context matches
    if (objectContext) {
      const objectName = objectContext.name.toLowerCase();
      const objectMatch = keywords.some(keyword => objectName.includes(keyword));
      if (objectMatch) {
        score += 0.5;
      }
    }

    // Boost score for specific patterns
    if (text.includes('remind') && keywords.includes('medicine')) {
      score += 0.2;
    }
    if (text.includes('schedule') && keywords.includes('schedule')) {
      score += 0.2;
    }

    return score;
  }

  /**
   * Format intent name with appropriate suffix
   */
  private formatIntentName(intent: string): string {
    const intentSuffixes: Record<string, string> = {
      medicine: 'reminder',
      nutrition: 'info',
      schedule: 'query',
      location: 'search',
      device: 'sync',
      health: 'query',
      work: 'task',
      general: 'query'
    };

    const suffix = intentSuffixes[intent] || 'query';
    return `${intent}_${suffix}`;
  }

  /**
   * Extract entities from voice text
   */
  public extractEntities(voiceText: string, objectContext?: DemoObject): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract time entities
    const timeMatches = voiceText.match(this.entityPatterns.time);
    if (timeMatches) {
      entities.time = timeMatches[0];
    }

    // Extract medication entities
    const medicationMatches = voiceText.match(this.entityPatterns.medication);
    if (medicationMatches) {
      entities.medication = medicationMatches[0];
    }

    // Extract food entities
    const foodMatches = voiceText.match(this.entityPatterns.food);
    if (foodMatches) {
      entities.food = foodMatches[0];
    }

    // Extract object entities
    const objectMatches = voiceText.match(this.entityPatterns.object);
    if (objectMatches) {
      entities.object = objectMatches[0];
    }

    // Extract action entities
    const actionMatches = voiceText.match(this.entityPatterns.action);
    if (actionMatches) {
      entities.action = actionMatches[0];
    }

    // Add object context as entity if available
    if (objectContext) {
      entities.detectedObject = {
        name: objectContext.name,
        confidence: objectContext.detection_confidence,
        position: objectContext.spatial_position
      };
    }

    // Extract urgency level
    const urgencyKeywords = ['urgent', 'asap', 'immediately', 'now', 'quickly'];
    const hasUrgency = urgencyKeywords.some(keyword => 
      voiceText.toLowerCase().includes(keyword)
    );
    if (hasUrgency) {
      entities.urgency = 'high';
    }

    // Extract quantity if mentioned
    const quantityMatch = voiceText.match(/(\d+)\s*(pills?|tablets?|vitamins?|times?)/i);
    if (quantityMatch) {
      entities.quantity = parseInt(quantityMatch[1]);
    }

    return entities;
  }

  /**
   * Calculate confidence for intent extraction
   */
  private calculateIntentConfidence(
    text: string, 
    intent: string, 
    objectContext?: DemoObject
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence for exact keyword matches
    const intentKeywords = this.intentMap[intent.split('_')[0]] || [];
    const exactMatches = intentKeywords.filter(keyword => text.includes(keyword)).length;
    confidence += exactMatches * 0.1;

    // Boost confidence if object context supports the intent
    if (objectContext) {
      const objectName = objectContext.name.toLowerCase();
      const objectSupportsIntent = intentKeywords.some(keyword => 
        objectName.includes(keyword)
      );
      if (objectSupportsIntent) {
        confidence += 0.2;
      }
    }

    // Boost confidence for longer, more specific queries
    if (text.length > 20) {
      confidence += 0.1;
    }

    // Cap confidence at 1.0
    return Math.min(1.0, confidence);
  }

  /**
   * Get suggested actions based on intent
   */
  public getSuggestedActions(intent: string, entities: Record<string, any>): string[] {
    const actionMap: Record<string, string[]> = {
      medicine_reminder: ['Show medicine schedule', 'Set reminder', 'Track medication'],
      nutrition_info: ['Nutrition analysis', 'Recipe suggestions', 'Health tips'],
      schedule_query: ['Show calendar', 'Meeting prep', 'Task priorities'],
      location_search: ['Show location', 'Departure checklist', 'Time reminder'],
      device_sync: ['Sync calendar', 'Update reminders', 'Backup data'],
      health_query: ['Health summary', 'Symptom tracker', 'Doctor contact'],
      work_task: ['Task management', 'Project overview', 'Deadline alerts'],
      general_query: ['Get help', 'Show options', 'Learn more']
    };

    const baseActions = actionMap[intent] || ['Get help', 'Show options'];
    
    // Add context-specific actions based on entities
    if (entities.urgency === 'high') {
      baseActions.unshift('Priority assistance');
    }
    
    if (entities.time) {
      baseActions.push('Time-based reminder');
    }

    return baseActions;
  }
}
