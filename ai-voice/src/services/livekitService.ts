// LiveKit Voice Streaming Service - Dev 2 Phase 2.5
// Handles LiveKit room creation, token generation, and audio streaming

import { secureLog, errorLog } from '../utils/secureLogger';

interface LiveKitTokenRequest {
  userId: string;
  sessionId: string;
}

interface LiveKitTokenResponse {
  token: string;
  roomUrl: string;
  roomName: string;
}

export class LiveKitService {
  private apiKey: string | undefined;
  private apiSecret: string | undefined;
  private livekitUrl: string | undefined;
  private isInitialized: boolean = false;

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY;
    this.apiSecret = process.env.LIVEKIT_API_SECRET;
    this.livekitUrl = process.env.LIVEKIT_URL;

    if (this.apiKey && this.apiSecret && this.livekitUrl) {
      secureLog('🎙️ LiveKit Service initialized');
    } else {
      errorLog('LiveKit credentials not configured - falling back to ElevenLabs');
    }
  }

  /**
   * Initialize the LiveKit service
   */
  public async initialize(): Promise<void> {
    try {
      if (!this.apiKey || !this.apiSecret || !this.livekitUrl) {
        secureLog('🎙️ LiveKit Service running in fallback mode (using ElevenLabs)');
        this.isInitialized = false;
        return;
      }

      // Test connection or perform any initialization
      secureLog('🎙️ LiveKit Service ready for voice streaming');
      this.isInitialized = true;
    } catch (error) {
      errorLog('Failed to initialize LiveKit service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Generate LiveKit access token for a user session
   */
  public async generateToken(request: LiveKitTokenRequest): Promise<LiveKitTokenResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('LiveKit service not initialized');
      }

      const roomName = `marvin-${request.sessionId}`;
      
      // Call Supabase Edge Function for token generation
      const supabaseUrl = process.env.BACKEND_URL || 'http://localhost:3002';
      const response = await fetch(`${supabaseUrl}/functions/v1/voice-enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          userId: request.userId,
          sessionId: request.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate LiveKit token: ${response.statusText}`);
      }

      const data: any = await response.json();
      
      return {
        token: data.token,
        roomUrl: data.roomUrl || this.livekitUrl,
        roomName: roomName
      };
    } catch (error) {
      errorLog('LiveKit token generation failed:', error);
      throw new Error('Failed to generate LiveKit token');
    }
  }

  /**
   * Check if LiveKit is available
   */
  public isAvailable(): boolean {
    return this.isInitialized && this.apiKey !== undefined && this.apiSecret !== undefined;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    available: boolean;
    initialized: boolean;
    configured: boolean;
  } {
    return {
      available: this.isAvailable(),
      initialized: this.isInitialized,
      configured: !!(this.apiKey && this.apiSecret && this.livekitUrl)
    };
  }

  /**
   * Health check for LiveKit service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      return this.isInitialized;
    } catch (error) {
      errorLog('LiveKit health check failed:', error);
      return false;
    }
  }
}

