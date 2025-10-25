// Suggestion Generator - Context Memory Service
// Generates personalized suggestions based on user patterns and preferences

import { ConversationContext, DemoObject, UserPreferences } from '../../types';
import { LEARNING_CONSTANTS } from '../../constants/learningConstants';
import { 
  Priority, 
  LearningStage, 
  ContextType, 
  TimeOfDay,
  PatternType
} from '../../types/enums';

export interface PersonalizedSuggestion {
  suggestion: string;
  confidence: number;
  context: string;
  reasoning: string;
  priority: Priority;
}

export interface LearningPattern {
  pattern_id: string;
  user_id: string;
  pattern_type: PatternType;
  data: Record<string, any>;
  confidence: number;
  last_updated: Date;
}

export class SuggestionGenerator {
  /**
   * Generate personalized suggestions based on context
   */
  public generatePersonalizedSuggestions(
    context: ConversationContext,
    objectContext?: DemoObject,
    patterns?: LearningPattern[]
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    try {
      // Generate object-specific suggestions
      if (objectContext) {
        suggestions.push(...this.generateObjectSpecificSuggestions(objectContext, patterns));
      }

      // Generate preference-based suggestions
      suggestions.push(...this.generatePreferenceSuggestions(context.user_preferences));

      // Generate routine-based suggestions
      suggestions.push(...this.generateRoutineSuggestions(context, patterns));

      // Sort by priority and confidence
      return suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });
    } catch (error) {
      console.error('Suggestion generation error:', error);
      return [];
    }
  }

  /**
   * Generate object-specific suggestions
   */
  private generateObjectSpecificSuggestions(
    objectContext: DemoObject,
    patterns?: LearningPattern[]
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    const objectName = objectContext.name;

    // Find relevant patterns for this object
    const relevantPatterns = patterns?.filter(pattern => 
      pattern.data.object_patterns?.includes(objectName)
    );

    if (relevantPatterns && relevantPatterns.length > 0) {
      suggestions.push({
        suggestion: `You often interact with ${objectName} around this time`,
        confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_OBJECT_INTERACTION,
        context: 'object_interaction',
        reasoning: `Historical interaction pattern with ${objectName}`,
        priority: Priority.MEDIUM
      });
    }

    // Generate context-specific suggestions based on object type
    switch (objectName) {
      case 'medicine_bottle':
        suggestions.push({
          suggestion: 'Would you like me to remind you about your medication schedule?',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_OBJECT_INTERACTION,
          context: 'medication_reminder',
          reasoning: 'Medicine bottle detected - proactive medication assistance',
          priority: Priority.HIGH
        });
        break;

      case 'breakfast_bowl':
        suggestions.push({
          suggestion: 'I can provide nutritional information for your breakfast',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_OBJECT_INTERACTION,
          context: 'nutrition_assistance',
          reasoning: 'Breakfast bowl detected - nutritional guidance available',
          priority: Priority.MEDIUM
        });
        break;

      case 'laptop':
        suggestions.push({
          suggestion: 'Would you like me to check your schedule for today?',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_OBJECT_INTERACTION,
          context: 'schedule_assistance',
          reasoning: 'Laptop detected - work/productivity context',
          priority: Priority.MEDIUM
        });
        break;

      case 'keys':
        suggestions.push({
          suggestion: 'I can help you prepare for departure',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_OBJECT_INTERACTION,
          context: 'departure_assistance',
          reasoning: 'Keys detected - departure preparation context',
          priority: Priority.HIGH
        });
        break;

      case 'phone':
        suggestions.push({
          suggestion: 'Would you like to sync your phone with today\'s schedule?',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_OBJECT_INTERACTION,
          context: 'device_sync',
          reasoning: 'Phone detected - device synchronization context',
          priority: Priority.MEDIUM
        });
        break;
    }

    return suggestions;
  }

  /**
   * Generate preference-based suggestions
   */
  private generatePreferenceSuggestions(
    preferences: UserPreferences
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    // Voice preference suggestions
    if (preferences.voice_settings.preferred_voice !== 'default') {
      suggestions.push({
        suggestion: `Using your preferred voice settings`,
        confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_VOICE_PREFERENCE,
        context: 'voice_preference',
        reasoning: `User prefers ${preferences.voice_settings.preferred_voice} voice`,
        priority: Priority.LOW
      });
    }

    // Interaction preference suggestions
    if (preferences.interaction_preferences.proactive_assistance) {
      suggestions.push({
        suggestion: `I'll provide proactive assistance based on your preferences`,
        confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
        context: 'interaction_preference',
        reasoning: 'User prefers proactive assistance',
        priority: Priority.MEDIUM
      });
    }

    // Routine preference suggestions
    if (preferences.routine_patterns.typical_wake_time) {
      suggestions.push({
        suggestion: `Based on your typical wake time of ${preferences.routine_patterns.typical_wake_time}, I can optimize your morning routine`,
        confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
        context: 'routine_optimization',
        reasoning: 'User has established wake time pattern',
        priority: Priority.MEDIUM
      });
    }

    return suggestions;
  }

  /**
   * Generate routine-based suggestions
   */
  private generateRoutineSuggestions(
    context: ConversationContext,
    patterns?: LearningPattern[]
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    // Find routine patterns
    const routinePatterns = patterns?.filter(pattern => 
      pattern.pattern_type === 'routine'
    );

    if (routinePatterns && routinePatterns.length > 0) {
      const timePatterns = routinePatterns[0].data.time_patterns || [];
      const objectPatterns = routinePatterns[0].data.object_patterns || [];

      if (timePatterns.length > 0) {
        suggestions.push({
          suggestion: `I notice you're active during ${timePatterns.join(', ')} times`,
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'routine_pattern',
          reasoning: 'User has established time-based interaction patterns',
          priority: Priority.LOW
        });
      }

      if (objectPatterns.length > 0) {
        suggestions.push({
          suggestion: `I can help optimize your interactions with ${objectPatterns.join(', ')}`,
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'routine_optimization',
          reasoning: 'User has established object interaction patterns',
          priority: Priority.MEDIUM
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate contextual suggestions based on time of day
   */
  public generateTimeBasedSuggestions(timeOfDay: TimeOfDay): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    switch (timeOfDay) {
      case TimeOfDay.MORNING:
        suggestions.push({
          suggestion: 'Good morning! Ready to start your day?',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'morning_greeting',
          reasoning: 'Morning time - proactive day start assistance',
          priority: Priority.MEDIUM
        });
        break;

      case TimeOfDay.AFTERNOON:
        suggestions.push({
          suggestion: 'How is your day going? Need help with anything?',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'afternoon_checkin',
          reasoning: 'Afternoon time - productivity check-in',
          priority: Priority.LOW
        });
        break;

      case TimeOfDay.EVENING:
        suggestions.push({
          suggestion: 'Would you like me to help you prepare for tomorrow?',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'evening_preparation',
          reasoning: 'Evening time - next day preparation',
          priority: Priority.MEDIUM
        });
        break;

      case TimeOfDay.NIGHT:
        suggestions.push({
          suggestion: 'Time to wind down. Need help with anything before bed?',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'night_winddown',
          reasoning: 'Night time - bedtime preparation',
          priority: Priority.LOW
        });
        break;
    }

    return suggestions;
  }

  /**
   * Generate learning progression suggestions
   */
  public generateLearningProgressionSuggestions(
    learningStage: LearningStage,
    totalInteractions: number
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    switch (learningStage) {
      case LearningStage.DAY_1:
        suggestions.push({
          suggestion: 'I\'m learning your preferences. The more we interact, the better I can help!',
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'learning_progression',
          reasoning: 'Early learning stage - encouraging interaction',
          priority: Priority.LOW
        });
        break;

      case LearningStage.DAY_7:
        suggestions.push({
          suggestion: `I've learned ${totalInteractions} interaction patterns. I can now provide more personalized assistance!`,
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'learning_progression',
          reasoning: 'Pattern recognition stage - highlighting personalization',
          priority: Priority.MEDIUM
        });
        break;

      case LearningStage.DAY_30:
        suggestions.push({
          suggestion: `With ${totalInteractions} interactions learned, I can now predict your needs and provide proactive assistance!`,
          confidence: LEARNING_CONSTANTS.CONFIDENCE.CONTEXT_INTERACTION_PREFERENCE,
          context: 'learning_progression',
          reasoning: 'Advanced learning stage - highlighting predictive capabilities',
          priority: Priority.HIGH
        });
        break;
    }

    return suggestions;
  }
}
