// Voice Agent Manager - ElevenLabs Integration
// Manages voice agent configurations and agent-specific logic

import { LEARNING_CONSTANTS } from '../../constants/learningConstants';

export interface VoiceAgent {
  id: string;
  name: string;
  description: string;
  voiceId: string;
  modelId: string;
  systemPrompt: string;
  conversationConfig: {
    maxTurns: number;
    temperature: number;
    responseLength: 'short' | 'medium' | 'long';
  };
}

export class VoiceAgentManager {
  private voiceAgents: Map<string, VoiceAgent> = new Map();

  constructor() {
    // Only sync initialization in constructor
  }

  /**
   * Factory method to create and initialize the voice agent manager
   */
  public static async create(): Promise<VoiceAgentManager> {
    const manager = new VoiceAgentManager();
    await manager.initialize();
    return manager;
  }

  /**
   * Initialize voice agents
   */
  public async initialize(): Promise<void> {
    this.initializeVoiceAgents();
  }

  /**
   * Initialize predefined voice agents for different contexts
   */
  private initializeVoiceAgents(): void {
    // Morning Assistant Agent
    const morningAgent: VoiceAgent = {
      id: 'morning_assistant',
      name: 'Morning Assistant',
      description: 'Helps with morning routines and daily planning',
      voiceId: 'marvin_morning',
      modelId: 'eleven_multilingual_v2',
      systemPrompt: `You are Marvin, an AI assistant for Snap Spectacles AR glasses. 
You help users with their morning routines and daily tasks.

User context: {user_context}
Object context: {object_context}

Respond naturally, concisely, and focus on actionable guidance.`,
      conversationConfig: {
        maxTurns: LEARNING_CONSTANTS.ELEVENLABS.MAX_TURNS.MEDIUM,
        temperature: LEARNING_CONSTANTS.ELEVENLABS.TEMPERATURE.BALANCED,
        responseLength: 'medium'
      }
    };

    // Health Specialist Agent
    const healthAgent: VoiceAgent = {
      id: 'health_specialist',
      name: 'Health Specialist',
      description: 'Provides health and medication guidance',
      voiceId: 'marvin_health',
      modelId: 'eleven_multilingual_v2',
      systemPrompt: `You are Marvin's health specialist module. 
You provide helpful health information and medication reminders.

IMPORTANT: This is demo software only. Always remind users that this is not medical advice.
Always recommend consulting healthcare professionals for medical decisions.

User context: {user_context}
Object context: {object_context}
Learning stage: {learning_stage}
Health context: {health_context}`,
      conversationConfig: {
        maxTurns: LEARNING_CONSTANTS.ELEVENLABS.MAX_TURNS.SHORT,
        temperature: LEARNING_CONSTANTS.ELEVENLABS.TEMPERATURE.CONSERVATIVE,
        responseLength: 'short'
      }
    };

    // Productivity Agent
    const productivityAgent: VoiceAgent = {
      id: 'productivity_assistant',
      name: 'Productivity Assistant',
      description: 'Helps with work tasks and productivity',
      voiceId: 'marvin_productivity',
      modelId: 'eleven_multilingual_v2',
      systemPrompt: `You are Marvin's productivity assistant. 
You help users manage their work tasks, schedules, and productivity goals.

User context: {user_context}
Object context: {object_context}
Learning stage: {learning_stage}
Calendar context: {calendar_context}`,
      conversationConfig: {
        maxTurns: LEARNING_CONSTANTS.ELEVENLABS.MAX_TURNS.LONG,
        temperature: LEARNING_CONSTANTS.ELEVENLABS.TEMPERATURE.CREATIVE,
        responseLength: 'medium'
      }
    };

    this.voiceAgents.set('morning_assistant', morningAgent);
    this.voiceAgents.set('health_specialist', healthAgent);
    this.voiceAgents.set('productivity_assistant', productivityAgent);
  }

  /**
   * Get voice agent by ID
   */
  public getVoiceAgent(agentId: string): VoiceAgent | undefined {
    return this.voiceAgents.get(agentId);
  }

  /**
   * Get all available voice agents
   */
  public getAllVoiceAgents(): VoiceAgent[] {
    return Array.from(this.voiceAgents.values());
  }

  /**
   * Select appropriate voice agent based on context
   */
  public selectVoiceAgent(
    voiceText: string,
    objectContext?: any,
    learningStage?: string
  ): VoiceAgent {
    const lowerText = voiceText.toLowerCase();

    // Health-related queries
    if (this.isHealthRelated(lowerText, objectContext)) {
      return this.voiceAgents.get('health_specialist')!;
    }

    // Productivity/work-related queries
    if (this.isProductivityRelated(lowerText, objectContext)) {
      return this.voiceAgents.get('productivity_assistant')!;
    }

    // Default to morning assistant for general queries
    return this.voiceAgents.get('morning_assistant')!;
  }

  /**
   * Check if query is health-related
   */
  private isHealthRelated(text: string, objectContext?: any): boolean {
    const healthKeywords = [
      'medicine', 'medication', 'pill', 'vitamin', 'health', 'doctor',
      'sick', 'pain', 'symptom', 'blood pressure', 'heart', 'diabetes'
    ];

    const isHealthKeyword = healthKeywords.some(keyword => text.includes(keyword));
    const isHealthObject = objectContext?.name?.includes('medicine') || 
                          objectContext?.name?.includes('pill');

    return isHealthKeyword || isHealthObject;
  }

  /**
   * Check if query is productivity-related
   */
  private isProductivityRelated(text: string, objectContext?: any): boolean {
    const productivityKeywords = [
      'work', 'meeting', 'schedule', 'calendar', 'task', 'project',
      'deadline', 'email', 'presentation', 'laptop', 'computer'
    ];

    const isProductivityKeyword = productivityKeywords.some(keyword => text.includes(keyword));
    const isProductivityObject = objectContext?.name?.includes('laptop') || 
                                objectContext?.name?.includes('computer');

    return isProductivityKeyword || isProductivityObject;
  }

  /**
   * Build system prompt with context variables
   */
  public buildSystemPrompt(
    agent: VoiceAgent,
    userContext: string,
    objectContext?: any,
    learningStage?: string,
    additionalContext?: Record<string, string>
  ): string {
    let prompt = agent.systemPrompt;

    // Replace context variables
    prompt = prompt.replace('{user_context}', userContext || 'No specific user context');
    prompt = prompt.replace('{object_context}', objectContext?.name || 'No object detected');
    prompt = prompt.replace('{learning_stage}', learningStage || 'day_1');
    prompt = prompt.replace('{health_context}', additionalContext?.health || 'General health context');
    prompt = prompt.replace('{calendar_context}', additionalContext?.calendar || 'No calendar context');

    return prompt;
  }
}
