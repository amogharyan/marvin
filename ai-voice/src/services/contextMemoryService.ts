// Context Memory Service for Advanced Conversation Management - Dev 2 Phase 2
// Orchestrates pattern analysis, suggestion generation, and memory management

import { ConversationContext, DemoObject, ChatMessage, UserPreferences } from '../types';
import { errorLog } from '../utils/secureLogger';
import { ConversationRole, ReminderFrequency } from '../types/enums';
import { MemoryManager, MemoryEntry } from './contextMemory/memoryManager';
import { PatternAnalyzer, LearningPattern } from './contextMemory/patternAnalyzer';
import { SuggestionGenerator, PersonalizedSuggestion } from './contextMemory/suggestionGenerator';

export class ContextMemoryService {
  private memoryManager: MemoryManager;
  private patternAnalyzer: PatternAnalyzer;
  private suggestionGenerator: SuggestionGenerator;
  private learningPatterns: Map<string, LearningPattern[]> = new Map();

  constructor() {
    this.memoryManager = new MemoryManager();
    this.patternAnalyzer = new PatternAnalyzer();
    this.suggestionGenerator = new SuggestionGenerator();
    console.log('🧠 Context Memory Service initialized');
  }

  /**
   * Store conversation context
   */
  public storeConversationContext(context: ConversationContext): void {
    try {
      const existing = this.memoryManager.getConversationContext(context.session_id);
      
      if (existing) {
        const merged = this.memoryManager.mergeConversationContexts(existing, context);
        this.memoryManager.storeConversationContext(merged);
      } else {
        this.memoryManager.storeConversationContext(context);
      }

      // Store user preferences separately
      this.memoryManager.storeUserPreferences(context.user_id, context.user_preferences);

      // Analyze patterns from the conversation
      this.analyzeAndStorePatterns(context);
    } catch (error) {
      errorLog('Failed to store conversation context:', error);
    }
  }

  /**
   * Retrieve conversation context
   */
  public getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.memoryManager.getConversationContext(sessionId);
  }

  /**
   * Get enhanced conversation context (alias for backward compatibility)
   */
  public getEnhancedConversationContext(sessionId: string): ConversationContext | undefined {
    return this.getConversationContext(sessionId);
  }

  /**
   * Store a message in conversation history
   */
  public storeMessage(sessionId: string, userId: string, message: ChatMessage): void {
    this.memoryManager.storeMessage(sessionId, userId, message);
  }

  /**
   * Remove conversation context
   */
  public removeConversationContext(sessionId: string): boolean {
    const context = this.memoryManager.getConversationContext(sessionId);
    if (context) {
      // Remove learning patterns by userId
      this.learningPatterns.delete(context.user_id);
    }
    return this.memoryManager.removeConversationContext(sessionId);
  }

  /**
   * Generate personalized suggestions
   */
  public generatePersonalizedSuggestions(
    context: ConversationContext,
    objectContext?: DemoObject
  ): PersonalizedSuggestion[] {
    try {
      const patterns = this.learningPatterns.get(context.user_id) || [];
      return this.suggestionGenerator.generatePersonalizedSuggestions(
        context,
        objectContext,
        patterns
      );
    } catch (error) {
      errorLog('Failed to generate personalized suggestions:', error);
      return [];
    }
  }

  /**
   * Generate routine suggestions
   */
  public generateRoutineSuggestions(
    _context: ConversationContext,
    _objectContext?: DemoObject
  ): PersonalizedSuggestion[] {
    // This would integrate with the suggestion generator
    return [];
  }

  /**
   * Generate preference suggestions
   */
  public generatePreferenceSuggestions(
    _context: ConversationContext,
    _objectContext?: DemoObject
  ): PersonalizedSuggestion[] {
    // This would integrate with the suggestion generator
    return [];
  }

  /**
   * Store learning pattern
   */
  public storeLearningPattern(pattern: LearningPattern): void {
    try {
      const existing = this.learningPatterns.get(pattern.user_id) || [];
      existing.push(pattern);
      this.learningPatterns.set(pattern.user_id, existing);
    } catch (error) {
      errorLog('Failed to store learning pattern:', error);
    }
  }

  /**
   * Get learning patterns for user
   */
  public getLearningPatterns(userId: string): LearningPattern[] {
    return this.learningPatterns.get(userId) || [];
  }

  /**
   * Analyze and store patterns from conversation context
   */
  private analyzeAndStorePatterns(context: ConversationContext): void {
    try {
      // Analyze conversation patterns
      const conversationPattern = this.patternAnalyzer.analyzeConversationPatterns(context);
      if (conversationPattern) {
        this.storeLearningPattern(conversationPattern);
      }

      // Analyze user preferences
      const preferencePattern = this.patternAnalyzer.analyzeUserPreferences(context);
      if (preferencePattern) {
        this.storeLearningPattern(preferencePattern);
      }

      // Analyze behavioral patterns
      const behaviorPattern = this.patternAnalyzer.analyzeBehaviorPatterns(context);
      if (behaviorPattern) {
        this.storeLearningPattern(behaviorPattern);
      }
    } catch (error) {
      errorLog('Failed to analyze and store patterns:', error);
    }
  }

  /**
   * Store user preferences
   */
  public storeUserPreferences(userId: string, preferences: UserPreferences): void {
    this.memoryManager.storeUserPreferences(userId, preferences);
  }

  /**
   * Update user preferences (alias for backward compatibility)
   */
  public updateUserPreferences(userId: string, preferences: UserPreferences): void {
    this.storeUserPreferences(userId, preferences);
  }

  /**
   * Remove user preferences
   */
  public removeUserPreferences(userId: string): void {
    this.memoryManager.removeUserPreferences(userId);
  }

  /**
   * Get user preferences
   */
  public getUserPreferences(userId: string): UserPreferences | undefined {
    return this.memoryManager.getUserPreferences(userId);
  }

  /**
   * Store object interaction
   */
  public storeObjectInteraction(userId: string, object: DemoObject): void {
    this.memoryManager.storeObjectInteraction(userId, object);
  }

  /**
   * Get object interaction history
   */
  public getObjectInteractionHistory(userId: string): DemoObject[] {
    return this.memoryManager.getObjectInteractionHistory(userId);
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Test basic operations
      const testSessionId = `health_check_test_${Date.now()}`;
      const testUserId = `health_check_user_${Date.now()}`;
      
      const testContext: ConversationContext = {
        user_id: testUserId,
        session_id: testSessionId,
        conversation_history: [
          {
            role: ConversationRole.USER,
            content: 'Test message',
            timestamp: new Date()
          }
        ],
        user_preferences: this.memoryManager['getDefaultUserPreferences']()
      };

      // Test storing and retrieving
      this.storeConversationContext(testContext);
      const retrieved = this.getConversationContext(testSessionId);
      
      // Clean up test data
      this.removeConversationContext(testSessionId);
      this.memoryManager.removeUserPreferences(testUserId);
      
      return retrieved !== undefined;
    } catch (error) {
      errorLog('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get service statistics
   */
  public getServiceStats(): {
    conversationContexts: number;
    learningPatterns: number;
    userPreferences: number;
  } {
    const totalPatterns = Array.from(this.learningPatterns.values())
      .reduce((sum, patterns) => sum + patterns.length, 0);

    return {
      conversationContexts: this.memoryManager.getConversationContextCount(),
      learningPatterns: totalPatterns,
      userPreferences: this.memoryManager['userPreferences'].size
    };
  }

  /**
   * Clear all memory (for testing)
   */
  public clearAllMemory(): void {
    this.memoryManager.clearAllMemory();
    this.learningPatterns.clear();
    console.log('All context memory cleared');
  }
}

// Re-export interfaces for backward compatibility
export type { MemoryEntry, LearningPattern, PersonalizedSuggestion };