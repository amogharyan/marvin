// Memory Manager - Context Memory Service
// Core memory operations and conversation management

import { ConversationContext, DemoObject, ChatMessage, UserPreferences } from '../../types';
import { errorLog } from '../../utils/secureLogger';
import { LEARNING_CONSTANTS } from '../../constants/learningConstants';
import { MemoryType, ReminderFrequency } from '../../types/enums';

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  content: any;
  timestamp: Date;
  confidence: number;
  tags: string[];
}

export class MemoryManager {
  private conversationMemory: Map<string, ConversationContext> = new Map();
  private objectInteractionHistory: Map<string, DemoObject[]> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();

  constructor() {
    console.log('🧠 Memory Manager initialized');
  }

  /**
   * Store conversation context
   */
  public storeConversationContext(context: ConversationContext): void {
    try {
      this.conversationMemory.set(context.session_id, context);
      console.log(`Stored conversation context for session: ${context.session_id}`);
    } catch (error) {
      errorLog('Failed to store conversation context:', error);
    }
  }

  /**
   * Retrieve conversation context
   */
  public getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.conversationMemory.get(sessionId);
  }

  /**
   * Update conversation context
   */
  public updateConversationContext(
    sessionId: string,
    updates: Partial<ConversationContext>
  ): boolean {
    try {
      const existing = this.conversationMemory.get(sessionId);
      if (!existing) return false;

      const updated = { ...existing, ...updates };
      this.conversationMemory.set(sessionId, updated);
      return true;
    } catch (error) {
      errorLog('Failed to update conversation context:', error);
      return false;
    }
  }

  /**
   * Remove conversation context
   */
  public removeConversationContext(sessionId: string): boolean {
    try {
      const context = this.conversationMemory.get(sessionId);
      if (context) {
        // Remove learning patterns by userId
        this.removeLearningPatternsByUserId(context.user_id);
        this.conversationMemory.delete(sessionId);
        return true;
      }
      return false;
    } catch (error) {
      errorLog('Failed to remove conversation context:', error);
      return false;
    }
  }

  /**
   * Store user preferences
   */
  public storeUserPreferences(userId: string, preferences: UserPreferences): void {
    try {
      this.userPreferences.set(userId, preferences);
      console.log(`Stored user preferences for user: ${userId}`);
    } catch (error) {
      errorLog('Failed to store user preferences:', error);
    }
  }

  /**
   * Get user preferences
   */
  public getUserPreferences(userId: string): UserPreferences | undefined {
    return this.userPreferences.get(userId);
  }

  /**
   * Store object interaction history
   */
  public storeObjectInteraction(userId: string, object: DemoObject): void {
    try {
      const existing = this.objectInteractionHistory.get(userId) || [];
      existing.push(object);
      this.objectInteractionHistory.set(userId, existing);
    } catch (error) {
      errorLog('Failed to store object interaction:', error);
    }
  }

  /**
   * Get object interaction history
   */
  public getObjectInteractionHistory(userId: string): DemoObject[] {
    return this.objectInteractionHistory.get(userId) || [];
  }

  /**
   * Store a message in conversation history
   */
  public storeMessage(
    sessionId: string,
    userId: string,
    message: ChatMessage
  ): void {
    try {
      const existing = this.conversationMemory.get(sessionId);
      
      if (existing) {
        // Check for duplicates before adding
        const isDuplicate = existing.conversation_history.some(existingMsg => 
          this.areMessagesDuplicate(existingMsg, message)
        );

        if (!isDuplicate) {
          existing.conversation_history.push(message);
          
          // Trim to max length
          if (existing.conversation_history.length > 20) {
            existing.conversation_history = existing.conversation_history.slice(-20);
          }
          
          this.conversationMemory.set(sessionId, existing);
        }
      } else {
        // Create new context
        const newContext: ConversationContext = {
          user_id: userId,
          session_id: sessionId,
          conversation_history: [message],
          user_preferences: this.getDefaultUserPreferences()
        };
        this.conversationMemory.set(sessionId, newContext);
      }
    } catch (error) {
      errorLog('Failed to store message:', error);
    }
  }

  /**
   * Merge conversation contexts
   */
  public mergeConversationContexts(
    existingContext: ConversationContext,
    newContext: ConversationContext
  ): ConversationContext {
    try {
      // Merge conversation history (avoiding duplicates)
      const mergedHistory = [...existingContext.conversation_history];
      
      newContext.conversation_history.forEach(newMsg => {
        const isDuplicate = mergedHistory.some(existingMsg => 
          this.areMessagesDuplicate(existingMsg, newMsg)
        );
        
        if (!isDuplicate) {
          mergedHistory.push(newMsg);
        }
      });

      // Trim to max length
      const trimmedHistory = mergedHistory.length > 20 
        ? mergedHistory.slice(-20) 
        : mergedHistory;

      // Merge user preferences safely
      const mergedPreferences = this.mergeUserPreferences(
        existingContext.user_preferences,
        newContext.user_preferences
      );

      return {
        user_id: existingContext.user_id,
        session_id: existingContext.session_id,
        conversation_history: trimmedHistory,
        user_preferences: mergedPreferences,
        object_context: newContext.object_context || existingContext.object_context
      };
    } catch (error) {
      errorLog('Failed to merge conversation contexts:', error);
      return existingContext;
    }
  }

  /**
   * Check if two messages are duplicates
   */
  private areMessagesDuplicate(msg1: ChatMessage, msg2: ChatMessage): boolean {
    // Normalize timestamps to Date objects
    const timestamp1 = this.normalizeTimestamp(msg1.timestamp);
    const timestamp2 = this.normalizeTimestamp(msg2.timestamp);
    
    // Check if timestamps are valid
    if (!timestamp1 || !timestamp2) {
      return false; // Treat invalid timestamps as non-duplicates
    }

    // Check content and role match
    const contentMatch = msg1.content === msg2.content;
    const roleMatch = msg1.role === msg2.role;
    
    // Check if timestamps are within 5 seconds (likely duplicate)
    const timeDiff = Math.abs(timestamp1.getTime() - timestamp2.getTime());
    const isTimeClose = timeDiff < 5000; // 5 seconds

    return contentMatch && roleMatch && isTimeClose;
  }

  /**
   * Normalize timestamp to Date object
   */
  private normalizeTimestamp(timestamp: Date | string | number): Date | null {
    try {
      if (timestamp instanceof Date) {
        return isNaN(timestamp.getTime()) ? null : timestamp;
      }
      
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Merge user preferences safely
   */
  private mergeUserPreferences(
    existing?: UserPreferences,
    incoming?: UserPreferences
  ): UserPreferences {
    const safeExisting = this.safeGetUserPreferences(existing);
    const safeIncoming = this.safeGetUserPreferences(incoming);

    return {
      voice_settings: {
        preferred_voice: safeIncoming.voice_settings.preferred_voice || safeExisting.voice_settings.preferred_voice,
        speech_rate: safeIncoming.voice_settings.speech_rate || safeExisting.voice_settings.speech_rate,
        pitch: safeIncoming.voice_settings.pitch || safeExisting.voice_settings.pitch
      },
      interaction_preferences: {
        proactive_assistance: safeIncoming.interaction_preferences.proactive_assistance ?? safeExisting.interaction_preferences.proactive_assistance,
        detailed_explanations: safeIncoming.interaction_preferences.detailed_explanations ?? safeExisting.interaction_preferences.detailed_explanations,
        reminder_frequency: safeIncoming.interaction_preferences.reminder_frequency || safeExisting.interaction_preferences.reminder_frequency
      },
      routine_patterns: {
        typical_wake_time: safeIncoming.routine_patterns.typical_wake_time || safeExisting.routine_patterns.typical_wake_time,
        breakfast_preferences: safeIncoming.routine_patterns.breakfast_preferences.length > 0 
          ? safeIncoming.routine_patterns.breakfast_preferences 
          : safeExisting.routine_patterns.breakfast_preferences,
        medicine_schedule: safeIncoming.routine_patterns.medicine_schedule.length > 0 
          ? safeIncoming.routine_patterns.medicine_schedule 
          : safeExisting.routine_patterns.medicine_schedule
      }
    };
  }

  /**
   * Get safe user preferences with defaults
   */
  private safeGetUserPreferences(preferences?: UserPreferences): UserPreferences {
    if (!preferences) {
      return this.getDefaultUserPreferences();
    }

    return {
      voice_settings: {
        preferred_voice: preferences.voice_settings?.preferred_voice || 'default',
        speech_rate: preferences.voice_settings?.speech_rate || LEARNING_CONSTANTS.VOICE_SETTINGS.SPEECH_RATE.NORMAL,
        pitch: preferences.voice_settings?.pitch || LEARNING_CONSTANTS.VOICE_SETTINGS.SPEECH_RATE.NORMAL
      },
      interaction_preferences: {
        proactive_assistance: preferences.interaction_preferences?.proactive_assistance ?? true,
        detailed_explanations: preferences.interaction_preferences?.detailed_explanations ?? true,
        reminder_frequency: preferences.interaction_preferences?.reminder_frequency || ReminderFrequency.MEDIUM
      },
      routine_patterns: {
        typical_wake_time: preferences.routine_patterns?.typical_wake_time || '7:00 AM',
        breakfast_preferences: preferences.routine_patterns?.breakfast_preferences || ['cereal', 'fruit', 'coffee'],
        medicine_schedule: preferences.routine_patterns?.medicine_schedule || ['morning_vitamins', 'blood_pressure_medication']
      }
    };
  }

  /**
   * Get default user preferences
   */
  private getDefaultUserPreferences(): UserPreferences {
    return {
      voice_settings: {
        preferred_voice: 'default',
        speech_rate: LEARNING_CONSTANTS.VOICE_SETTINGS.SPEECH_RATE.NORMAL,
        pitch: LEARNING_CONSTANTS.VOICE_SETTINGS.SPEECH_RATE.NORMAL
      },
      interaction_preferences: {
        proactive_assistance: true,
        detailed_explanations: true,
        reminder_frequency: ReminderFrequency.MEDIUM
      },
      routine_patterns: {
        typical_wake_time: '7:00 AM',
        breakfast_preferences: ['cereal', 'fruit', 'coffee'],
        medicine_schedule: ['morning_vitamins', 'blood_pressure_medication']
      }
    };
  }

  /**
   * Remove learning patterns by user ID
   */
  private removeLearningPatternsByUserId(userId: string): void {
    // This would integrate with the learning patterns storage
    console.log(`Removing learning patterns for user: ${userId}`);
  }

  /**
   * Get all conversation contexts
   */
  public getAllConversationContexts(): ConversationContext[] {
    return Array.from(this.conversationMemory.values());
  }

  /**
   * Get conversation context count
   */
  public getConversationContextCount(): number {
    return this.conversationMemory.size;
  }

  /**
   * Clear all memory (for testing)
   */
  public clearAllMemory(): void {
    this.conversationMemory.clear();
    this.objectInteractionHistory.clear();
    this.userPreferences.clear();
    console.log('All memory cleared');
  }
}
