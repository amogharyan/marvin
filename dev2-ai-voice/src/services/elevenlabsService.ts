// ElevenLabs Voice Synthesis Service

import axios from 'axios';
import { config } from '../config';
import { VoiceRequest, VoiceResponse } from '../types';

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.elevenlabs.apiKey;
    this.baseUrl = config.elevenlabs.baseUrl;
  }

  /**
   * Convert text to speech using ElevenLabs
   */
  async textToSpeech(request: VoiceRequest): Promise<VoiceResponse> {
    try {
      const voiceId = request.voice_id || config.elevenlabs.voiceId;
      
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: request.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      // Convert audio buffer to base64 for transmission
      const audioBase64 = Buffer.from(response.data).toString('base64');
      
      return {
        audio_url: `data:audio/mpeg;base64,${audioBase64}`,
        duration: this.estimateDuration(request.text),
        format: 'mp3'
      };
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw new Error(`Voice synthesis failed: ${error}`);
    }
  }

  /**
   * Generate speech with custom voice settings
   */
  async generateWithSettings(
    text: string,
    voiceId: string,
    settings: {
      stability?: number;
      similarity_boost?: number;
      style?: number;
      speed?: number;
    } = {}
  ): Promise<VoiceResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: settings.stability || 0.5,
            similarity_boost: settings.similarity_boost || 0.8,
            style: settings.style || 0.0,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBase64 = Buffer.from(response.data).toString('base64');
      
      return {
        audio_url: `data:audio/mpeg;base64,${audioBase64}`,
        duration: this.estimateDuration(text),
        format: 'mp3'
      };
    } catch (error) {
      console.error('ElevenLabs Custom TTS Error:', error);
      throw new Error(`Custom voice synthesis failed: ${error}`);
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      return response.data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description
      }));
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }


  /**
   * Estimate speech duration based on text length
   */
  private estimateDuration(text: string): number {
    // Rough estimate: ~150 words per minute
    const wordCount = text.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / 2.5)); // seconds
  }

  /**
   * Generate contextual voice responses for AR objects
   */
  async generateContextualVoice(
    text: string,
    objectType?: string,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<VoiceResponse> {
    const voiceSettings = this.getVoiceSettingsForContext(objectType, urgency);
    
    return this.generateWithSettings(
      text,
      config.elevenlabs.voiceId,
      voiceSettings
    );
  }

  /**
   * Get voice settings based on context and urgency
   */
  private getVoiceSettingsForContext(
    objectType?: string,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ) {
    const baseSettings = {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.0
    };

    // Adjust settings based on urgency
    switch (urgency) {
      case 'high':
        return {
          ...baseSettings,
          stability: 0.7,
          similarity_boost: 0.9,
          style: 0.2
        };
      case 'low':
        return {
          ...baseSettings,
          stability: 0.3,
          similarity_boost: 0.7,
          style: 0.0
        };
      default:
        return baseSettings;
    }
  }

  /**
   * Generate voice for different object types
   */
  async generateObjectSpecificVoice(
    text: string,
    objectType: string
  ): Promise<VoiceResponse> {
    const urgencyMap: Record<string, 'low' | 'medium' | 'high'> = {
      'medicine_bottle': 'high',
      'keys': 'medium',
      'breakfast_bowl': 'low',
      'laptop': 'medium',
      'phone': 'low'
    };

    const urgency = urgencyMap[objectType] || 'medium';
    return this.generateContextualVoice(text, objectType, urgency);
  }
}
