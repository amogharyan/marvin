// Pattern Analyzer - Context Memory Service
// Analyzes conversation patterns and extracts learning insights

import { ConversationContext, ChatMessage, UserPreferences } from '../../types';
import { LEARNING_CONSTANTS } from '../../constants/learningConstants';
import { PatternType, ReminderFrequency, VolumeLevel } from '../../types/enums';

export interface LearningPattern {
  pattern_id: string;
  user_id: string;
  pattern_type: PatternType;
  data: Record<string, any>;
  confidence: number;
  last_updated: Date;
}

export class PatternAnalyzer {
  /**
   * Analyze conversation patterns from message history
   */
  public analyzeConversationPatterns(
    context: ConversationContext
  ): LearningPattern | null {
    const messages = context.conversation_history;
    if (messages.length < 3) return null;

    try {
      // Extract time patterns
      const timePatterns = this.extractTimePatterns(messages);
      
      // Extract object interaction patterns
      const objectPatterns = this.extractObjectPatterns(messages);
      
      // Only create pattern if we have meaningful data
      if (timePatterns.length > 0 || objectPatterns.length > 0) {
        return {
          pattern_id: `conversation_${Date.now()}`,
          user_id: context.user_id,
          pattern_type: PatternType.ROUTINE,
          data: {
            time_patterns: timePatterns,
            object_patterns: objectPatterns,
            frequency: messages.length
          },
          confidence: Math.min(
            LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_MESSAGE_FREQUENCY_MAX, 
            messages.length / LEARNING_CONSTANTS.CONTEXT.MESSAGE_FREQUENCY_DIVISOR
          ),
          last_updated: new Date()
        };
      }
    } catch (error) {
      console.error('Pattern analysis error:', error);
    }

    return null;
  }

  /**
   * Analyze user preferences from conversation history
   */
  public analyzeUserPreferences(
    context: ConversationContext
  ): LearningPattern | null {
    const messages = context.conversation_history;
    const preferences: Record<string, any> = {};

    try {
      // Extract voice preferences
      const voicePrefs = this.extractVoicePreferences(messages);
      Object.assign(preferences, voicePrefs);

      // Extract interaction preferences
      const interactionPrefs = this.extractInteractionPreferences(messages);
      Object.assign(preferences, interactionPrefs);

      // Extract routine preferences
      const routinePrefs = this.extractRoutinePreferences(messages);
      Object.assign(preferences, routinePrefs);

      if (Object.keys(preferences).length > 0) {
        return {
          pattern_id: `preference_${Date.now()}`,
          user_id: context.user_id,
          pattern_type: PatternType.PREFERENCE,
          data: preferences,
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_PREFERENCE_PATTERN,
          last_updated: new Date()
        };
      }
    } catch (error) {
      console.error('Preference analysis error:', error);
    }

    return null;
  }

  /**
   * Analyze behavioral patterns from conversation history
   */
  public analyzeBehaviorPatterns(
    context: ConversationContext
  ): LearningPattern | null {
    const messages = context.conversation_history;
    if (messages.length < 2) return null;

    try {
      const behaviors: Record<string, any> = {};
      
      // Analyze response patterns
      behaviors.average_response_time = this.calculateAverageResponseTime(messages);
      behaviors.average_response_length = this.calculateAverageResponseLength(messages);
      behaviors.question_frequency = this.calculateQuestionFrequency(messages);
      behaviors.preference_mentions = this.extractPreferenceMentions(messages);

      // Only create pattern if we have meaningful behavioral data
      if (Object.keys(behaviors).length > 0) {
        return {
          pattern_id: `behavior_${Date.now()}`,
          user_id: context.user_id,
          pattern_type: PatternType.BEHAVIOR,
          data: behaviors,
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_BEHAVIOR_PATTERN,
          last_updated: new Date()
        };
      }
    } catch (error) {
      console.error('Behavior analysis error:', error);
    }

    return null;
  }

  /**
   * Extract time patterns from messages
   */
  private extractTimePatterns(messages: ChatMessage[]): string[] {
    const timePatterns: string[] = [];
    
    messages.forEach(message => {
      const hour = new Date(message.timestamp).getHours();
      if (hour >= 6 && hour < 12) timePatterns.push('morning');
      else if (hour >= 12 && hour < 17) timePatterns.push('afternoon');
      else if (hour >= 17 && hour < 22) timePatterns.push('evening');
      else timePatterns.push('night');
    });

    // Return unique patterns
    return [...new Set(timePatterns)];
  }

  /**
   * Extract object interaction patterns from messages
   */
  private extractObjectPatterns(messages: ChatMessage[]): string[] {
    const objectPatterns: string[] = [];
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      if (content.includes('medicine')) objectPatterns.push('medicine');
      if (content.includes('breakfast')) objectPatterns.push('breakfast');
      if (content.includes('laptop')) objectPatterns.push('laptop');
      if (content.includes('keys')) objectPatterns.push('keys');
      if (content.includes('phone')) objectPatterns.push('phone');
    });

    return [...new Set(objectPatterns)];
  }

  /**
   * Extract voice preferences from messages
   */
  private extractVoicePreferences(messages: ChatMessage[]): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      if (content.includes('slow')) preferences.speech_rate = LEARNING_CONSTANTS.VOICE_SETTINGS.SPEECH_RATE.SLOW;
      if (content.includes('fast')) preferences.speech_rate = LEARNING_CONSTANTS.VOICE_SETTINGS.SPEECH_RATE.FAST;
      if (content.includes('loud')) preferences.volume = LEARNING_CONSTANTS.VOICE_SETTINGS.VOLUME.HIGH;
      if (content.includes('quiet')) preferences.volume = VolumeLevel.LOW;
    });

    return preferences;
  }

  /**
   * Extract interaction preferences from messages
   */
  private extractInteractionPreferences(messages: ChatMessage[]): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      if (content.includes('proactive')) preferences.proactive_assistance = true;
      if (content.includes('detailed')) preferences.detailed_explanations = true;
      if (content.includes('frequent')) preferences.reminder_frequency = ReminderFrequency.HIGH;
      if (content.includes('occasional')) preferences.reminder_frequency = ReminderFrequency.LOW;
    });

    return preferences;
  }

  /**
   * Extract routine preferences from messages
   */
  private extractRoutinePreferences(messages: ChatMessage[]): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      if (content.includes('wake up')) preferences.typical_wake_time = this.extractTimeFromText(content);
      if (content.includes('breakfast')) preferences.breakfast_preferences = this.extractFoodPreferences(content);
      if (content.includes('medicine')) preferences.medicine_schedule = this.extractMedicineSchedule(content);
    });

    return preferences;
  }

  /**
   * Calculate average response time between messages
   */
  private calculateAverageResponseTime(messages: ChatMessage[]): number {
    if (messages.length < 2) return 0;

    let totalTime = 0;
    let count = 0;

    for (let i = 1; i < messages.length; i++) {
      const prevTime = new Date(messages[i - 1].timestamp).getTime();
      const currTime = new Date(messages[i].timestamp).getTime();
      totalTime += currTime - prevTime;
      count++;
    }

    return count > 0 ? totalTime / count : 0;
  }

  /**
   * Calculate average response length
   */
  private calculateAverageResponseLength(messages: ChatMessage[]): number {
    if (messages.length === 0) return 0;

    const totalLength = messages.reduce((sum, message) => sum + message.content.length, 0);
    return totalLength / messages.length;
  }

  /**
   * Calculate question frequency
   */
  private calculateQuestionFrequency(messages: ChatMessage[]): number {
    if (messages.length === 0) return 0;

    const questionCount = messages.filter(message => 
      message.content.includes('?')
    ).length;

    return questionCount / messages.length;
  }

  /**
   * Extract preference mentions from messages
   */
  private extractPreferenceMentions(messages: ChatMessage[]): string[] {
    const mentions: string[] = [];
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      if (content.includes('prefer')) mentions.push('preference_mentioned');
      if (content.includes('like')) mentions.push('liking_mentioned');
      if (content.includes('dislike')) mentions.push('dislike_mentioned');
    });

    return [...new Set(mentions)];
  }

  /**
   * Extract time from text content
   */
  private extractTimeFromText(content: string): string {
    const timeMatch = content.match(/(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm))/i);
    return timeMatch ? timeMatch[0] : '7:00 AM';
  }

  /**
   * Extract food preferences from text content
   */
  private extractFoodPreferences(content: string): string[] {
    const foods = ['cereal', 'fruit', 'coffee', 'toast', 'eggs', 'yogurt'];
    return foods.filter(food => content.includes(food));
  }

  /**
   * Extract medicine schedule from text content
   */
  private extractMedicineSchedule(content: string): string[] {
    const medicines = ['vitamins', 'blood pressure', 'medication', 'pills'];
    return medicines.filter(med => content.includes(med));
  }
}
