// Chroma Vector Database Integration Service - Dev 2 Phase 3
// Provides contextual memory storage and retrieval using vector embeddings

import { CloudClient } from 'chromadb';
import { randomUUID } from 'crypto';
import { secureLog, errorLog, debugLog } from '../utils/secureLogger';
import { ConversationContext, ChatMessage, DemoObject, UserPreferences } from '../types';
import { ChromaMetadataValidator } from '../utils/chromaMetadataValidator';

export interface VectorMemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>; // Allow flexible metadata structure
}

export interface LearningPattern {
  id: string;
  patternType: 'routine' | 'preference' | 'behavior' | 'temporal';
  data: Record<string, any>;
  confidence: number;
  frequency: number;
  lastSeen: Date;
  userId: string;
}

export interface PersonalizedSuggestion {
  suggestion: string;
  confidence: number;
  context: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  learningStage: 'day_1' | 'day_7' | 'day_30';
}

export class ChromaService {
  private client: CloudClient;
  private collections: Map<string, any> = new Map();
  private isInitialized: boolean = false;

  // Collection names for different types of memory
  private readonly COLLECTIONS = {
    CONVERSATIONS: 'conversation_memory',
    PREFERENCES: 'user_preferences',
    PATTERNS: 'learning_patterns',
    CONTEXT: 'contextual_memory'
  };

  constructor() {
    try {
      // Initialize Chroma Cloud client
      const apiKey = process.env.CHROMA_API_KEY;
      const tenant = process.env.CHROMA_TENANT;
      const database = process.env.CHROMA_DATABASE;
      
      if (apiKey && tenant && database) {
        // Use Chroma Cloud
        this.client = new CloudClient({
          apiKey: apiKey,
          tenant: tenant,
          database: database
        });
        secureLog('🧠 Chroma Cloud Service initialized');
      } else {
        // Fallback to mock mode for demo
        this.client = null as any;
        secureLog('🧠 Chroma Service running in mock mode for demo');
      }
    } catch (error) {
      errorLog('Failed to initialize Chroma client:', error);
      // Fallback to mock mode for demo
      this.client = null as any;
      secureLog('🧠 Chroma Service running in mock mode for demo');
    }
  }

  /**
   * Initialize Chroma collections
   */
  public async initialize(): Promise<void> {
    if (!this.client) {
      debugLog('Chroma client not available, using mock mode');
      this.isInitialized = true;
      return;
    }

    try {
      // Create collections for different memory types
      await this.createCollection(this.COLLECTIONS.CONVERSATIONS, 'Conversation history and context');
      await this.createCollection(this.COLLECTIONS.PREFERENCES, 'User preferences and settings');
      await this.createCollection(this.COLLECTIONS.PATTERNS, 'Learning patterns and behaviors');
      await this.createCollection(this.COLLECTIONS.CONTEXT, 'Contextual memory and associations');

      this.isInitialized = true;
      secureLog('✅ Chroma collections initialized successfully');
    } catch (error) {
      errorLog('Failed to initialize Chroma collections:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Create a collection with metadata schema
   */
  private async createCollection(name: string, description: string): Promise<void> {
    try {
      const collection = await this.client.createCollection({
        name,
        metadata: { description },
        embeddingFunction: undefined // Use default embedding function
      });
      this.collections.set(name, collection);
      debugLog(`Created collection: ${name}`);
    } catch (error) {
      // Collection might already exist
      const collection = await this.client.getCollection({ 
        name,
        embeddingFunction: undefined // Use default embedding function
      });
      this.collections.set(name, collection);
      debugLog(`Retrieved existing collection: ${name}`);
    }
  }

  /**
   * Store conversation context in vector database
   */
  public async storeConversationContext(
    sessionId: string,
    userId: string,
    context: ConversationContext,
    objectContext?: DemoObject
  ): Promise<void> {
    if (!this.isInitialized) {
      debugLog('Chroma not initialized, skipping vector storage');
      return;
    }

    try {
      const collection = this.collections.get(this.COLLECTIONS.CONVERSATIONS);
      if (!collection) throw new Error('Conversation collection not found');

      // Create vector entries for conversation history
      const entries: VectorMemoryEntry[] = [];
      
      context.conversation_history.forEach((message, index) => {
        entries.push({
          id: randomUUID(),
          content: `${message.role}: ${message.content}`,
          metadata: ChromaMetadataValidator.createConversationMetadata(
            sessionId,
            userId,
            message.timestamp,
            objectContext?.name || 'unknown',
            'conversation',
            1.0,
            this.extractMessageTags(message)
          )
        });
      });

      // Store user preferences separately
      if (context.user_preferences) {
        entries.push({
          id: randomUUID(),
          content: ChromaMetadataValidator.sanitizeDocumentContent(context.user_preferences),
          metadata: ChromaMetadataValidator.createUserPreferenceMetadata(
            sessionId,
            userId,
            'preference',
            0.9,
            ['preferences', 'user_settings']
          )
        });
      }

      // Add entries to collection
      await collection.add({
        ids: entries.map(e => e.id),
        documents: entries.map(e => e.content),
        metadatas: entries.map(e => e.metadata)
      });

      secureLog(`Stored ${entries.length} conversation entries for session ${sessionId}`);
    } catch (error) {
      errorLog('Failed to store conversation context:', error);
    }
  }

  /**
   * Retrieve similar conversation contexts
   */
  public async retrieveSimilarContexts(
    query: string,
    userId: string,
    limit: number = 5
  ): Promise<VectorMemoryEntry[]> {
    if (!this.isInitialized) {
      debugLog('Chroma not initialized, returning empty results');
      return [];
    }

    try {
      const collection = this.collections.get(this.COLLECTIONS.CONVERSATIONS);
      if (!collection) throw new Error('Conversation collection not found');

      const results = await collection.query({
        queryTexts: [query],
        nResults: limit,
        where: { userId }
      });

      const entries: VectorMemoryEntry[] = [];
      if (results.ids && results.ids[0]) {
        for (let i = 0; i < results.ids[0].length; i++) {
          entries.push({
            id: results.ids[0][i],
            content: results.documents[0][i],
            metadata: results.metadatas[0][i] as any
          });
        }
      }

      return entries;
    } catch (error) {
      errorLog('Failed to retrieve similar contexts:', error);
      return [];
    }
  }

  /**
   * Store learning patterns
   */
  public async storeLearningPattern(
    userId: string,
    pattern: LearningPattern
  ): Promise<void> {
    if (!this.isInitialized) {
      debugLog('Chroma not initialized, skipping pattern storage');
      return;
    }

    try {
      const collection = this.collections.get(this.COLLECTIONS.PATTERNS);
      if (!collection) throw new Error('Patterns collection not found');

      await collection.add({
        ids: [pattern.id],
        documents: [ChromaMetadataValidator.sanitizeDocumentContent(pattern.data)],
        metadatas: [ChromaMetadataValidator.createLearningPatternMetadata(
          userId,
          pattern.patternType,
          pattern.confidence,
          pattern.frequency,
          pattern.lastSeen,
          ['learning_pattern', pattern.patternType]
        )]
      });

      debugLog(`Stored learning pattern: ${pattern.patternType} for user ${userId}`);
    } catch (error) {
      errorLog('Failed to store learning pattern:', error);
    }
  }

  /**
   * Retrieve learning patterns for user
   */
  public async retrieveLearningPatterns(
    userId: string,
    patternType?: string
  ): Promise<LearningPattern[]> {
    if (!this.isInitialized) {
      debugLog('Chroma not initialized, returning empty patterns');
      return [];
    }

    try {
      const collection = this.collections.get(this.COLLECTIONS.PATTERNS);
      if (!collection) throw new Error('Patterns collection not found');

      const whereClause: any = { userId };
      if (patternType) {
        whereClause.patternType = patternType;
      }

      const results = await collection.get({
        where: whereClause
      });

      const patterns: LearningPattern[] = [];
      if (results.ids) {
        for (let i = 0; i < results.ids.length; i++) {
          patterns.push({
            id: results.ids[i],
            patternType: results.metadatas[i].patternType,
            data: JSON.parse(results.documents[i]),
            confidence: results.metadatas[i].confidence,
            frequency: results.metadatas[i].frequency,
            lastSeen: new Date(results.metadatas[i].lastSeen),
            userId
          });
        }
      }

      return patterns;
    } catch (error) {
      errorLog('Failed to retrieve learning patterns:', error);
      return [];
    }
  }

  /**
   * Generate personalized suggestions based on learning patterns
   */
  public async generatePersonalizedSuggestions(
    userId: string,
    currentContext: string,
    objectContext?: DemoObject
  ): Promise<PersonalizedSuggestion[]> {
    const suggestions: PersonalizedSuggestion[] = [];
    
    try {
      // Retrieve learning patterns
      const patterns = await this.retrieveLearningPatterns(userId);
      
      // Retrieve similar contexts
      const similarContexts = await this.retrieveSimilarContexts(currentContext, userId, 3);
      
      // Determine learning stage based on pattern frequency
      const learningStage = this.determineLearningStage(patterns);
      
      // Generate suggestions based on patterns and context
      suggestions.push(...this.generatePatternBasedSuggestions(patterns, learningStage));
      suggestions.push(...this.generateContextBasedSuggestions(similarContexts, objectContext, learningStage));
      
      // Sort by confidence and priority
      suggestions.sort((a, b) => {
        if (a.priority === b.priority) {
          return b.confidence - a.confidence;
        }
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      return suggestions.slice(0, 5); // Return top 5 suggestions
    } catch (error) {
      errorLog('Failed to generate personalized suggestions:', error);
      return [];
    }
  }

  /**
   * Determine learning stage based on pattern frequency
   */
  private determineLearningStage(patterns: LearningPattern[]): 'day_1' | 'day_7' | 'day_30' {
    const totalFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0);
    
    if (totalFrequency < 5) return 'day_1';
    if (totalFrequency < 20) return 'day_7';
    return 'day_30';
  }

  /**
   * Generate suggestions based on learning patterns
   */
  private generatePatternBasedSuggestions(
    patterns: LearningPattern[],
    learningStage: 'day_1' | 'day_7' | 'day_30'
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    
    patterns.forEach(pattern => {
      switch (pattern.patternType) {
        case 'routine':
          suggestions.push({
            suggestion: `Based on your routine patterns, it's time for your usual activities`,
            confidence: pattern.confidence,
            context: 'routine_pattern',
            reasoning: `Pattern observed ${pattern.frequency} times`,
            priority: 'high',
            learningStage
          });
          break;
        case 'preference':
          suggestions.push({
            suggestion: `Using your preferred settings and configurations`,
            confidence: pattern.confidence,
            context: 'preference_pattern',
            reasoning: `Preference pattern established`,
            priority: 'medium',
            learningStage
          });
          break;
        case 'temporal':
          suggestions.push({
            suggestion: `Based on your timing patterns, this is optimal timing`,
            confidence: pattern.confidence,
            context: 'temporal_pattern',
            reasoning: `Timing pattern observed`,
            priority: 'medium',
            learningStage
          });
          break;
      }
    });
    
    return suggestions;
  }

  /**
   * Generate suggestions based on similar contexts
   */
  private generateContextBasedSuggestions(
    contexts: VectorMemoryEntry[],
    objectContext?: DemoObject,
    learningStage: 'day_1' | 'day_7' | 'day_30' = 'day_1'
  ): PersonalizedSuggestion[] {
    const suggestions: PersonalizedSuggestion[] = [];
    
    if (contexts.length === 0) {
      // Day 1 suggestions - generic
      suggestions.push({
        suggestion: 'Welcome! I\'m learning your preferences and will personalize suggestions over time.',
        confidence: 0.8,
        context: 'welcome',
        reasoning: 'First-time user, providing generic guidance',
        priority: 'high',
        learningStage: 'day_1'
      });
      return suggestions;
    }
    
    // Analyze similar contexts for patterns
    const objectInteractions = contexts.filter(c => c.metadata.objectType);
    const recentInteractions = contexts.filter(c => 
      new Date(c.metadata.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    
    if (objectInteractions.length > 0) {
      suggestions.push({
        suggestion: `I notice you frequently interact with ${objectContext?.name || 'objects'}. Let me help optimize this experience.`,
        confidence: 0.7,
        context: 'object_interaction',
        reasoning: `Found ${objectInteractions.length} similar object interactions`,
        priority: 'medium',
        learningStage
      });
    }
    
    if (recentInteractions.length > 2) {
      suggestions.push({
        suggestion: 'You\'ve been active recently. I\'m adapting to your usage patterns.',
        confidence: 0.6,
        context: 'usage_pattern',
        reasoning: `Recent activity detected (${recentInteractions.length} interactions)`,
        priority: 'low',
        learningStage
      });
    }
    
    return suggestions;
  }

  /**
   * Extract tags from chat message
   */
  private extractMessageTags(message: ChatMessage): string[] {
    const tags: string[] = [];
    const content = message.content.toLowerCase();
    
    if (content.includes('medicine') || content.includes('medication')) {
      tags.push('health', 'medicine');
    }
    if (content.includes('breakfast') || content.includes('food')) {
      tags.push('nutrition', 'breakfast');
    }
    if (content.includes('schedule') || content.includes('calendar')) {
      tags.push('schedule', 'calendar');
    }
    if (content.includes('keys') || content.includes('location')) {
      tags.push('location', 'keys');
    }
    if (content.includes('phone') || content.includes('device')) {
      tags.push('device', 'phone');
    }
    
    return tags;
  }

  /**
   * Health check for Chroma service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) {
        debugLog('Chroma client not available, health check passed (mock mode)');
        return true;
      }
      
      // Test basic connectivity
      await this.client.heartbeat();
      return true;
    } catch (error) {
      errorLog('Chroma health check failed:', error);
      return false;
    }
  }

  /**
   * Clean up test data
   */
  public async cleanupTestData(): Promise<void> {
    if (!this.isInitialized || !this.client) {
      debugLog('Chroma not initialized, skipping cleanup');
      return;
    }

    try {
      // Remove test data from all collections
      for (const [name, collection] of this.collections) {
        await collection.delete({
          where: { 
            $or: [
              { sessionId: { $like: '%test%' } },
              { userId: { $like: '%test%' } }
            ]
          }
        });
      }
      
      debugLog('Cleaned up test data from Chroma collections');
    } catch (error) {
      errorLog('Failed to cleanup test data:', error);
    }
  }
}
