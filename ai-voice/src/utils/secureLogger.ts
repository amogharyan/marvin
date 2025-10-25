// Secure logging utility for Dev 2 AI & Voice services
// Prevents PII leakage in production logs

import crypto from 'crypto';

export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

export interface SecureLogOptions {
  redactSensitive?: boolean;
  hashSensitive?: boolean;
  includeMetadata?: boolean;
  maxLength?: number;
}

class SecureLogger {
  private isProduction: boolean;
  private debugEnabled: boolean;
  private logLevel: string;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.debugEnabled = process.env.DEBUG_LOGGING === 'true';
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  /**
   * Hash sensitive text for logging (one-way hash)
   */
  private hashText(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex').substring(0, 8);
  }

  /**
   * Redact sensitive text by replacing with placeholder
   */
  private redactText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) {
      return '[REDACTED]';
    }
    return `[REDACTED_${text.length}chars]`;
  }

  /**
   * Extract metadata from text without exposing content
   */
  private extractMetadata(text: string): object {
    return {
      length: text.length,
      wordCount: text.split(/\s+/).length,
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(text),
      language: this.detectLanguage(text)
    };
  }

  /**
   * Simple language detection based on character patterns
   */
  private detectLanguage(text: string): string {
    // Simple heuristic - can be enhanced with proper language detection
    if (/[\u4e00-\u9fff]/.test(text)) return 'chinese';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'japanese';
    if (/[\u1100-\u11ff\uac00-\ud7af]/.test(text)) return 'korean';
    if (/[\u0600-\u06ff]/.test(text)) return 'arabic';
    if (/[\u0400-\u04ff]/.test(text)) return 'cyrillic';
    return 'latin';
  }

  /**
   * Secure logging for sensitive text (voice input, user messages, etc.)
   */
  secureLog(
    message: string,
    sensitiveData?: string,
    options: SecureLogOptions = {}
  ): void {
    const {
      redactSensitive = true,
      hashSensitive = false,
      includeMetadata = true,
      maxLength = 50
    } = options;

    // In production, never log sensitive data unless explicitly enabled
    if (this.isProduction && !this.debugEnabled) {
      console.log(`${message} [SENSITIVE_DATA_REDACTED]`);
      return;
    }

    // In development or when debug is enabled
    if (sensitiveData) {
      let processedData: string | object;

      if (redactSensitive) {
        processedData = this.redactText(sensitiveData, maxLength);
      } else if (hashSensitive) {
        processedData = this.hashText(sensitiveData);
      } else {
        processedData = sensitiveData;
      }

      const metadata = includeMetadata ? this.extractMetadata(sensitiveData) : {};

      console.log(`${message}:`, {
        data: processedData,
        metadata: includeMetadata ? metadata : undefined
      });
    } else {
      console.log(message);
    }
  }

  /**
   * Safe logging for non-sensitive data
   */
  safeLog(message: string, data?: any): void {
    console.log(message, data);
  }

  /**
   * Debug logging (only enabled in development or with DEBUG_LOGGING=true)
   */
  debugLog(message: string, data?: any): void {
    if (!this.isProduction || this.debugEnabled) {
      console.log(`🐛 DEBUG: ${message}`, data);
    }
  }

  /**
   * Error logging (always enabled)
   */
  errorLog(message: string, error?: any): void {
    console.error(`❌ ERROR: ${message}`, error);
  }

  /**
   * Warning logging (always enabled)
   */
  warnLog(message: string, data?: any): void {
    console.warn(`⚠️ WARNING: ${message}`, data);
  }

  /**
   * Info logging (always enabled, but sanitized)
   */
  infoLog(message: string, data?: any): void {
    console.log(`ℹ️ INFO: ${message}`, data);
  }
}

// Export singleton instance
export const secureLogger = new SecureLogger();

// Export convenience methods with proper binding
export const secureLog = secureLogger.secureLog.bind(secureLogger);
export const safeLog = secureLogger.safeLog.bind(secureLogger);
export const debugLog = secureLogger.debugLog.bind(secureLogger);
export const errorLog = secureLogger.errorLog.bind(secureLogger);
export const warnLog = secureLogger.warnLog.bind(secureLogger);
export const infoLog = secureLogger.infoLog.bind(secureLogger);
