// Context Memory Service for Advanced Conversation Management - Dev 2 Phase 2

import { ConversationContext, DemoObject, ChatMessage, UserPreferences } from '../types';
import { errorLog } from '../utils/secureLogger';

export interface MemoryEntry {
  id: string;
  type: 'conversation' | 'preference' | 'pattern' | 'object_interaction';
  content: any;
  timestamp: Date;
  confidence: number;
  tags: string[];
}

export interface LearningPattern {
  pattern_id: string;
  user_id: string;
  pattern_type: 'routine' | 'preference' | 'behavior';
  data: Record<string, any>;
  confidence: number;
  last_updated: Date;
}

export interface PersonalizedSuggestion {
  suggestion: string;
  confidence: number;
  context: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
}

export class ContextMemoryService {
  private conversationMemory: Map<string, ConversationContext> = new Map();
  private learningPatterns: Map<string, LearningPattern[]> = new Map();
  private objectInteractionHistory: Map<string, DemoObject[]> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();

  constructor() {
    console.log('🧠 Context Memory Service initialized');
  }

  /**
   * Check if two messages are duplicates based on content and timestamp
   */
  private areMessagesDuplicate(msg1: ChatMessage, msg2: ChatMessage): boolean {
    // Normalize timestamps to Date objects
    const timestamp1 = this.normalizeTimestamp(msg1.timestamp);
    const timestamp2 = this.normalizeTimestamp(msg2.timestamp);
    
    // If either timestamp is invalid, treat as non-duplicates
    if (!timestamp1 || !timestamp2) {
      return false;
    }
    
    // Check if messages have the same content and are within 1 second of each other
    const timeDiff = Math.abs(timestamp1.getTime() - timestamp2.getTime());
    return msg1.content === msg2.content && 
           msg1.role === msg2.role && 
           timeDiff < 1000; // Within 1 second
  }

  /**
   * Normalize timestamp to Date object and validate
   */
  private normalizeTimestamp(timestamp: Date | string | number | undefined): Date | null {
    if (!timestamp) {
      return null;
    }
    
    let date: Date;
    
    // Handle different timestamp types
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return null;
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  }

  /**
   * Merge conversation histories with deduplication
   */
  private mergeConversationHistories(
    existingHistory: ChatMessage[],
    incomingHistory: ChatMessage[]
  ): ChatMessage[] {
    // If no existing history, return incoming
    if (!existingHistory || existingHistory.length === 0) {
      return incomingHistory;
    }

    // If no incoming history, return existing
    if (!incomingHistory || incomingHistory.length === 0) {
      return existingHistory;
    }

    // Start with existing history
    const mergedHistory = [...existingHistory];

    // Add incoming messages, checking for duplicates
    for (const incomingMsg of incomingHistory) {
      const isDuplicate = mergedHistory.some(existingMsg => 
        this.areMessagesDuplicate(existingMsg, incomingMsg)
      );
      
      if (!isDuplicate) {
        mergedHistory.push(incomingMsg);
      }
    }

    return mergedHistory;
  }

  /**
   * Store conversation context with advanced memory management
   */
  async storeConversationContext(
    sessionId: string,
    context: ConversationContext,
    message?: ChatMessage
  ): Promise<void> {
    try {
      console.log(`🧠 Storing conversation context for session: ${sessionId}`);

      // Update existing context or create new one
      const existingContext = this.conversationMemory.get(sessionId);
      if (existingContext) {
        // Merge contexts intelligently with deduplication
        context.conversation_history = this.mergeConversationHistories(
          existingContext.conversation_history,
          context.conversation_history
        );

        // Trim to last 20 messages after merging
        if (context.conversation_history.length > 20) {
          context.conversation_history = context.conversation_history.slice(-20);
        }

        // Update user preferences if provided
        if (context.user_preferences) {
          context.user_preferences = this.mergeUserPreferences(
            existingContext.user_preferences, // Safe to pass undefined
            context.user_preferences
          );
          // Persist merged preferences to the userPreferences Map
          this.userPreferences.set(context.user_id, context.user_preferences);
        }
      }

      // Store user preferences to the Map if provided (even for new contexts)
      if (context.user_preferences) {
        this.userPreferences.set(context.user_id, context.user_preferences);
      }

      this.conversationMemory.set(sessionId, context);

      // Store individual message if provided
      if (message) {
        await this.storeMessage(sessionId, message);
      }

      // Extract and store learning patterns
      await this.extractLearningPatterns(sessionId, context);
    } catch (error) {
      errorLog('Error storing conversation context', error);
    }
  }

  /**
   * Store individual message with context analysis
   */
  public async storeMessage(sessionId: string, message: ChatMessage): Promise<void> {
    // Store in conversation history with deduplication and trimming
    const context = this.conversationMemory.get(sessionId);
    if (context) {
      // Check if this message is a duplicate of the last message
      const lastMessage = context.conversation_history[context.conversation_history.length - 1];
      const isDuplicate = lastMessage && this.areMessagesDuplicate(lastMessage, message);
      
      if (!isDuplicate) {
        context.conversation_history.push(message);
        
        // Trim to last 20 messages after adding
        if (context.conversation_history.length > 20) {
          context.conversation_history = context.conversation_history.slice(-20);
        }
      }
    }
  }

  /**
   * Extract learning patterns from conversation context
   */
  private async extractLearningPatterns(sessionId: string, context: ConversationContext): Promise<void> {
    try {
      const userId = context.user_id;
      const patterns: LearningPattern[] = [];

      // Extract routine patterns
      const routinePattern = this.extractRoutinePattern(context);
      if (routinePattern) {
        patterns.push(routinePattern);
      }

      // Extract preference patterns
      const preferencePattern = this.extractPreferencePattern(context);
      if (preferencePattern) {
        patterns.push(preferencePattern);
      }

      // Extract behavior patterns
      const behaviorPattern = this.extractBehaviorPattern(context);
      if (behaviorPattern) {
        patterns.push(behaviorPattern);
      }

      // Store patterns
      if (patterns.length > 0) {
        const existingPatterns = this.learningPatterns.get(userId) || [];
        const updatedPatterns = [...existingPatterns, ...patterns];
        this.learningPatterns.set(userId, updatedPatterns);
      }
    } catch (error) {
      errorLog('Error extracting learning patterns', error);
    }
  }

  /**
   * Extract routine patterns from conversation
   */
  private extractRoutinePattern(context: ConversationContext): LearningPattern | null {
    const messages = context.conversation_history;
    const timePatterns: string[] = [];
    const objectPatterns: string[] = [];

    messages.forEach(msg => {
      if (msg.object_context) {
        objectPatterns.push(msg.object_context);
      }
      
      // Extract time patterns from messages
      const timeMatch = msg.content.match(/\b\d{1,2}:\d{2}\s*(am|pm)?\b/i);
      if (timeMatch) {
        timePatterns.push(timeMatch[0]);
      }
    });

    if (timePatterns.length > 0 || objectPatterns.length > 0) {
      return {
        pattern_id: `routine_${Date.now()}`,
        user_id: context.user_id,
        pattern_type: 'routine',
        data: {
          time_patterns: timePatterns,
          object_patterns: objectPatterns,
          frequency: messages.length
        },
        confidence: Math.min(0.9, messages.length / 10),
        last_updated: new Date()
      };
    }

    return null;
  }

  /**
   * Extract preference patterns from conversation
   */
  private extractPreferencePattern(context: ConversationContext): LearningPattern | null {
    const messages = context.conversation_history;
    const preferences: Record<string, any> = {};

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Extract voice preferences
      if (content.includes('voice') || content.includes('speak')) {
        preferences.voice_preferences = this.extractVoicePreferences(content);
      }
      
      // Extract interaction preferences
      if (content.includes('remind') || content.includes('alert')) {
        preferences.reminder_preferences = this.extractReminderPreferences(content);
      }
      
      // Extract routine preferences
      if (content.includes('morning') || content.includes('routine')) {
        preferences.routine_preferences = this.extractRoutinePreferences(content);
      }
    });

    if (Object.keys(preferences).length > 0) {
      return {
        pattern_id: `preference_${Date.now()}`,
        user_id: context.user_id,
        pattern_type: 'preference',
        data: preferences,
        confidence: 0.8,
        last_updated: new Date()
      };
    }

    return null;
  }

  /**
   * Extract behavior patterns from conversation
   */
  private extractBehaviorPattern(context: ConversationContext): LearningPattern | null {
    const messages = context.conversation_history;
    const behaviors: Record<string, any> = {};

    // Analyze interaction patterns
    const interactionTypes = messages.map(msg => this.categorizeInteraction(msg.content));
    const interactionCounts = this.countInteractions(interactionTypes);

    if (Object.keys(interactionCounts).length > 0) {
      behaviors.interaction_patterns = interactionCounts;
      behaviors.total_interactions = messages.length;
      behaviors.average_response_length = this.calculateAverageResponseLength(messages);

      return {
        pattern_id: `behavior_${Date.now()}`,
        user_id: context.user_id,
        pattern_type: 'behavior',
        data: behaviors,
        confidence: 0.7,
        last_updated: new Date()
      };
    }

    return null;
  }

  /**
   * Generate personalized suggestions based on learned patterns
   */
  async generatePersonalizedSuggestions(
    userId: string,
    currentContext: ConversationContext,
    objectContext?: DemoObject
  ): Promise<PersonalizedSuggestion[]> {
    try {
      console.log(`🧠 Generating personalized suggestions for user: ${userId}`);

      const suggestions: PersonalizedSuggestion[] = [];
      const patterns = this.learningPatterns.get(userId) || [];
      
      // Try to get user preferences from the Map first, then from conversation context
      let userPrefs = this.userPreferences.get(userId);
      if (!userPrefs && currentContext.user_preferences) {
        // If not in Map but available in context, store it
        this.userPreferences.set(userId, currentContext.user_preferences);
        userPrefs = currentContext.user_preferences;
      }

      // Generate suggestions based on routine patterns
      const routineSuggestions = this.generateRoutineSuggestions(patterns, currentContext);
      suggestions.push(...routineSuggestions);

      // Generate suggestions based on object context
      if (objectContext) {
        const objectSuggestions = this.generateObjectSuggestions(objectContext, patterns);
        suggestions.push(...objectSuggestions);
      }

      // Generate suggestions based on user preferences
      if (userPrefs) {
        const preferenceSuggestions = this.generatePreferenceSuggestions(userPrefs, currentContext);
        suggestions.push(...preferenceSuggestions);
      }

      // Sort by priority and confidence
      return suggestions
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return b.confidence - a.confidence;
        })
        .slice(0, 5); // Return top 5 suggestions
    } catch (error) {
      errorLog('Error generating personalized suggestions', error);
      return [];
    }
  }

  /**
   * Generate routine-based suggestions
   */
  private generateRoutineSuggestions(
    patterns: LearningPattern[],
    _context: ConversationContext
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    const routinePatterns = patterns.filter(p => p.pattern_type === 'routine');

    routinePatterns.forEach(pattern => {
      const data = pattern.data;
      
      if (data.time_patterns && data.time_patterns.length > 0) {
        suggestions.push({
          suggestion: `Based on your routine, it's time for your usual activities`,
          confidence: pattern.confidence,
          context: 'routine_pattern',
          reasoning: `Detected time patterns: ${data.time_patterns.join(', ')}`,
          priority: 'medium'
        });
      }

      if (data.object_patterns && data.object_patterns.length > 0) {
        suggestions.push({
          suggestion: `You typically interact with ${data.object_patterns.join(', ')} around this time`,
          confidence: pattern.confidence,
          context: 'object_pattern',
          reasoning: `Frequent object interactions: ${data.object_patterns.join(', ')}`,
          priority: 'low'
        });
      }
    });

    return suggestions;
  }

  /**
   * Generate object-specific suggestions
   */
  private generateObjectSuggestions(
    objectContext: DemoObject,
    patterns: LearningPattern[]
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    const objectName = objectContext.name;

    // Find patterns related to this object
    const relevantPatterns = patterns.filter(pattern => 
      pattern.data.object_patterns?.includes(objectName)
    );

    if (relevantPatterns.length > 0) {
      suggestions.push({
        suggestion: `You often interact with ${objectName} around this time`,
        confidence: 0.8,
        context: 'object_interaction',
        reasoning: `Historical interaction pattern with ${objectName}`,
        priority: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Generate preference-based suggestions
   */
  private generatePreferenceSuggestions(
    preferences: UserPreferences,
    _context: ConversationContext
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];

    // Voice preference suggestions
    if (preferences.voice_settings.preferred_voice !== 'default') {
      suggestions.push({
        suggestion: `Using your preferred voice settings`,
        confidence: 0.9,
        context: 'voice_preference',
        reasoning: `User prefers ${preferences.voice_settings.preferred_voice} voice`,
        priority: 'low'
      });
    }

    // Interaction preference suggestions
    if (preferences.interaction_preferences.proactive_assistance) {
      suggestions.push({
        suggestion: `I'll provide proactive assistance based on your preferences`,
        confidence: 0.8,
        context: 'interaction_preference',
        reasoning: 'User prefers proactive assistance',
        priority: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * Get conversation context with enhanced memory
   */
  async getEnhancedConversationContext(sessionId: string): Promise<ConversationContext | null> {
    const context = this.conversationMemory.get(sessionId);
    if (!context) return null;

    // Enhance context with learned patterns
    const userId = context.user_id;
    const patterns = this.learningPatterns.get(userId) || [];
    
    // Add pattern insights to context
    const enhancedContext = {
      ...context,
      learned_patterns: patterns,
      memory_confidence: this.calculateMemoryConfidence(patterns)
    };

    return enhancedContext;
  }

  /**
   * Helper methods for pattern extraction
   */
  private extractMessageTags(message: ChatMessage): string[] {
    const tags: string[] = [];
    const content = message.content.toLowerCase();

    if (content.includes('medicine')) tags.push('medicine');
    if (content.includes('breakfast')) tags.push('nutrition');
    if (content.includes('schedule')) tags.push('calendar');
    if (content.includes('keys')) tags.push('location');
    if (content.includes('help')) tags.push('assistance');

    return tags;
  }

  private extractVoicePreferences(content: string): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    if (content.includes('slow')) preferences.speech_rate = 0.8;
    if (content.includes('fast')) preferences.speech_rate = 1.2;
    if (content.includes('loud')) preferences.volume = 'high';
    if (content.includes('quiet')) preferences.volume = 'low';

    return preferences;
  }

  private extractReminderPreferences(content: string): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    if (content.includes('frequent')) preferences.frequency = 'high';
    if (content.includes('rare')) preferences.frequency = 'low';
    if (content.includes('morning')) preferences.time_preference = 'morning';

    return preferences;
  }

  private extractRoutinePreferences(content: string): Record<string, any> {
    const preferences: Record<string, any> = {};
    
    if (content.includes('early')) preferences.wake_time = 'early';
    if (content.includes('late')) preferences.wake_time = 'late';
    if (content.includes('coffee')) preferences.breakfast_preferences = ['coffee'];

    return preferences;
  }

  private categorizeInteraction(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('?')) return 'question';
    if (lowerContent.includes('help')) return 'request';
    if (lowerContent.includes('thank')) return 'gratitude';
    if (lowerContent.includes('yes') || lowerContent.includes('no')) return 'confirmation';
    
    return 'statement';
  }

  private countInteractions(interactions: string[]): Record<string, number> {
    return interactions.reduce((counts, interaction) => {
      counts[interaction] = (counts[interaction] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private calculateAverageResponseLength(messages: ChatMessage[]): number {
    if (messages.length === 0) return 0;
    
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return totalLength / messages.length;
  }

  private calculateMemoryConfidence(patterns: LearningPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const totalConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0);
    return totalConfidence / patterns.length;
  }

  private mergeUserPreferences(
    existing: UserPreferences | undefined,
    updated: UserPreferences | undefined
  ): UserPreferences {
    // Defensive programming: ensure we always have valid objects
    const existingPrefs = this.safeGetUserPreferences(existing);
    const updatedPrefs = this.safeGetUserPreferences(updated);

    // Safe merge with null checks
    return {
      voice_settings: {
        ...existingPrefs.voice_settings,
        ...(updatedPrefs.voice_settings || {})
      },
      interaction_preferences: {
        ...existingPrefs.interaction_preferences,
        ...(updatedPrefs.interaction_preferences || {})
      },
      routine_patterns: {
        ...existingPrefs.routine_patterns,
        ...(updatedPrefs.routine_patterns || {})
      }
    };
  }

  /**
   * Safely get user preferences with fallback to defaults
   */
  private safeGetUserPreferences(preferences: UserPreferences | undefined): UserPreferences {
    if (!preferences) {
      return this.getDefaultUserPreferences();
    }

    // Ensure all required properties exist with safe defaults
    return {
      voice_settings: {
        preferred_voice: preferences.voice_settings?.preferred_voice || 'default',
        speech_rate: preferences.voice_settings?.speech_rate || 1.0,
        pitch: preferences.voice_settings?.pitch || 1.0
      },
      interaction_preferences: {
        proactive_assistance: preferences.interaction_preferences?.proactive_assistance ?? true,
        detailed_explanations: preferences.interaction_preferences?.detailed_explanations ?? true,
        reminder_frequency: preferences.interaction_preferences?.reminder_frequency || 'medium'
      },
      routine_patterns: {
        typical_wake_time: preferences.routine_patterns?.typical_wake_time || '7:00 AM',
        breakfast_preferences: preferences.routine_patterns?.breakfast_preferences || [],
        medicine_schedule: preferences.routine_patterns?.medicine_schedule || []
      }
    };
  }

  /**
   * Get user preferences by user ID
   */
  getUserPreferences(userId: string): UserPreferences | undefined {
    return this.userPreferences.get(userId);
  }

  /**
   * Remove conversation context and related data
   */
  removeConversationContext(sessionId: string): void {
    try {
      // First, get the context to extract userId for learning patterns cleanup
      const context = this.conversationMemory.get(sessionId);
      
      // Remove from conversation memory
      this.conversationMemory.delete(sessionId);
      
      // Remove learning patterns by userId (not sessionId)
      if (context?.user_id) {
        this.learningPatterns.delete(context.user_id);
      }
      
      // Remove from object interaction history
      this.objectInteractionHistory.delete(sessionId);
      
      // Note: We don't remove from userPreferences Map as it's keyed by userId, not sessionId
      // and might be shared across multiple sessions
    } catch (error) {
      errorLog(`Error removing conversation context for session ${sessionId}`, error);
    }
  }

  /**
   * Remove user preferences by user ID
   */
  removeUserPreferences(userId: string): void {
    try {
      this.userPreferences.delete(userId);
    } catch (error) {
      errorLog(`Error removing user preferences for user ${userId}`, error);
    }
  }

  /**
   * Update user preferences directly
   */
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void {
    const existingPrefs = this.userPreferences.get(userId);
    const mergedPrefs = this.mergeUserPreferences(existingPrefs, preferences as UserPreferences);
    this.userPreferences.set(userId, mergedPrefs);
  }

  /**
   * Get default user preferences when none are provided
   */
  private getDefaultUserPreferences(): UserPreferences {
    return {
      voice_settings: {
        preferred_voice: 'default',
        speech_rate: 1.0,
        pitch: 1.0
      },
      interaction_preferences: {
        proactive_assistance: true,
        detailed_explanations: true,
        reminder_frequency: 'medium'
      },
      routine_patterns: {
        typical_wake_time: '7:00 AM',
        breakfast_preferences: [],
        medicine_schedule: []
      }
    };
  }

  /**
   * Health check for context memory service
   */
  async healthCheck(): Promise<boolean> {
    // Use namespaced test IDs to avoid collisions
    const testSessionId = `health_check_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const testUserId = `health_check_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Test basic functionality
      const testContext: ConversationContext = {
        user_id: testUserId,
        session_id: testSessionId,
        conversation_history: [],
        user_preferences: {
          voice_settings: { preferred_voice: 'default', speech_rate: 1.0, pitch: 1.0 },
          interaction_preferences: { proactive_assistance: true, detailed_explanations: true, reminder_frequency: 'medium' },
          routine_patterns: { typical_wake_time: '7:00 AM', breakfast_preferences: [], medicine_schedule: [] }
        }
      };

      await this.storeConversationContext(testSessionId, testContext);
      const retrieved = await this.getEnhancedConversationContext(testSessionId);
      
      return retrieved !== null;
    } catch (error) {
      errorLog('Context memory health check failed', error);
      return false;
    } finally {
      // Always clean up test data, even if health check fails
      try {
        this.removeConversationContext(testSessionId);
        this.removeUserPreferences(testUserId);
      } catch (cleanupError) {
        // Log cleanup errors but don't let them mask the health check result
        errorLog(`Health check cleanup failed for session ${testSessionId}`, cleanupError);
      }
    }
  }
}
