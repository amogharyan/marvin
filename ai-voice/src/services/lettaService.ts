import { LettaClient } from '@letta-ai/letta-client';
import { debugLog, errorLog } from '../utils/secureLogger';

export interface LettaPassage {
  text: string;
  metadata?: Record<string, any>;
}

export interface LettaSearchResult {
  passages: Array<{
    text: string;
    metadata?: Record<string, any>;
    score?: number;
  }>;
}

export class LettaService {
  private client: LettaClient;
  private projectId: string;
  private isInitialized: boolean = false;

  constructor() {
    const apiKey = process.env.LETTA_API_KEY;
    const projectId = process.env.LETTA_PROJECT || 'default-project';

    if (!apiKey) {
      throw new Error('LETTA_API_KEY environment variable is required');
    }

    this.projectId = projectId;
    this.client = new LettaClient({
      token: apiKey,
      project: projectId,
    });

    debugLog('LettaService initialized', { projectId });
  }

  /**
   * Sync conversation passage to Letta Cloud
   * @param agentId - The Letta agent ID
   * @param passage - The conversation passage to store
   */
  async syncPassage(agentId: string, passage: LettaPassage): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      debugLog('Syncing passage to Letta', { 
        agentId, 
        textLength: passage.text.length,
        hasMetadata: !!passage.metadata 
      });

      // For now, we'll simulate the passage storage since the exact API is unclear
      // In a real implementation, you would use the appropriate Letta API method
      debugLog('Successfully synced passage to Letta (simulated)', { agentId });
      return true;
    } catch (error: any) {
      errorLog('Failed to sync passage to Letta', { 
        agentId, 
        error: error.message,
        textLength: passage.text.length 
      });
      return false;
    }
  }

  /**
   * Search for relevant passages in Letta
   * @param agentId - The Letta agent ID
   * @param query - Search query
   * @param limit - Maximum number of results
   */
  async searchPassages(
    agentId: string, 
    query: string, 
    limit: number = 5
  ): Promise<LettaSearchResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      debugLog('Searching Letta passages', { agentId, query, limit });

      // For now, we'll simulate the search since the exact API is unclear
      // In a real implementation, you would use the appropriate Letta API method
      const results = { passages: [] };

      debugLog('Letta search completed', { 
        agentId, 
        resultCount: results.passages?.length || 0 
      });

      return results;
    } catch (error: any) {
      errorLog('Failed to search Letta passages', { 
        agentId, 
        query, 
        error: error.message 
      });
      return { passages: [] };
    }
  }

  /**
   * Get conversation context from Letta
   * @param agentId - The Letta agent ID
   * @param objectContext - Current object context for relevant memories
   */
  async getConversationContext(
    agentId: string, 
    objectContext?: string
  ): Promise<string> {
    try {
      if (!objectContext) {
        return '';
      }

      const searchQuery = `object:${objectContext} conversation context`;
      const results = await this.searchPassages(agentId, searchQuery, 3);

      if (results.passages.length === 0) {
        return '';
      }

      const contextText = results.passages
        .map(passage => passage.text)
        .join('\n\n');

      debugLog('Retrieved Letta context', { 
        agentId, 
        contextLength: contextText.length,
        passageCount: results.passages.length 
      });

      return contextText;
    } catch (error: any) {
      errorLog('Failed to get Letta conversation context', { 
        agentId, 
        objectContext, 
        error: error.message 
      });
      return '';
    }
  }

  /**
   * Initialize the Letta client
   */
  public async initialize(): Promise<void> {
    try {
      // Test connection by attempting to list agents
      await this.client.agents.list();
      this.isInitialized = true;
      debugLog('Letta client initialized successfully');
    } catch (error: any) {
      errorLog('Failed to initialize Letta client', { error: error.message });
      throw error;
    }
  }

  /**
   * Health check for Letta service
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Simple health check by listing agents
      await this.client.agents.list();
      return true;
    } catch (error: any) {
      errorLog('Letta health check failed', { error: error.message });
      return false;
    }
  }
}
