// Configuration management for Dev 2 AI & Voice services

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface Config {
  // Gemini API Configuration
  gemini: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  
  // ElevenLabs Configuration
  elevenlabs: {
    apiKey: string;
    voiceId: string;
    baseUrl: string;
  };
  
  // Server Configuration
  server: {
    port: number;
    environment: string;
  };
  
  // External Services
  external: {
    arClientUrl: string;
    backendUrl: string;
  };
}

function validateConfig(): Config {
  const requiredEnvVars = [
    'GEMINI_API_KEY',
    'ELEVENLABS_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY!,
      model: process.env.GEMINI_MODEL || 'gemini-pro-vision',
      maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '1000')
    },
    
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY!,
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'default',
      baseUrl: process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1'
    },
    
    server: {
      port: parseInt(process.env.PORT || '3001'),
      environment: process.env.NODE_ENV || 'development'
    },
    
    external: {
      arClientUrl: process.env.AR_CLIENT_URL || 'http://localhost:3000',
      backendUrl: process.env.BACKEND_URL || 'http://localhost:3002'
    }
  };
}

export const config = validateConfig();

// Log configuration status (without sensitive data)
console.log('🔧 Dev 2 AI & Voice Configuration Loaded:');
console.log(`   Gemini Model: ${config.gemini.model}`);
console.log(`   ElevenLabs Voice: ${config.elevenlabs.voiceId}`);
console.log(`   Server Port: ${config.server.port}`);
console.log(`   Environment: ${config.server.environment}`);
