// Chroma Metadata Validation Utility
// Handles sanitization of metadata for Chroma vector database

/**
 * Chroma metadata validation and sanitization
 * Chroma only supports string, number, boolean, and null values
 */
export class ChromaMetadataValidator {
  /**
   * Sanitize metadata to ensure Chroma compatibility
   * @param metadata - Raw metadata object
   * @returns Sanitized metadata compatible with Chroma
   */
  public static sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      // Chroma only supports string, number, boolean, and null
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
        sanitized[key] = value;
      } else if (value instanceof Date) {
        // Convert Date to ISO string
        sanitized[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        // Convert array to comma-separated string
        sanitized[key] = value.join(',');
      } else if (typeof value === 'object' && value !== null) {
        // Convert object to JSON string
        sanitized[key] = JSON.stringify(value);
      } else if (typeof value === 'undefined') {
        // Skip undefined values
        continue;
      } else {
        // Convert other types to string
        sanitized[key] = String(value);
      }
    }
    
    return sanitized;
  }

  /**
   * Validate metadata before sending to Chroma
   * @param metadata - Metadata to validate
   * @returns True if valid, false otherwise
   */
  public static validateMetadata(metadata: Record<string, any>): boolean {
    for (const value of Object.values(metadata)) {
      if (typeof value !== 'string' && 
          typeof value !== 'number' && 
          typeof value !== 'boolean' && 
          value !== null) {
        return false;
      }
    }
    return true;
  }

  /**
   * Create conversation metadata with proper sanitization
   * @param sessionId - Session identifier
   * @param userId - User identifier
   * @param timestamp - Timestamp (Date, string, or number)
   * @param objectType - Type of object detected
   * @param interactionType - Type of interaction
   * @param confidence - Confidence score
   * @param tags - Array of tags
   * @returns Sanitized metadata object
   */
  public static createConversationMetadata(
    sessionId: string,
    userId: string,
    timestamp: Date | string | number,
    objectType: string,
    interactionType: string,
    confidence: number,
    tags: string[]
  ): Record<string, any> {
    return this.sanitizeMetadata({
      sessionId,
      userId,
      timestamp: this.normalizeTimestamp(timestamp),
      objectType,
      interactionType,
      confidence,
      tags: tags.join(',')
    });
  }

  /**
   * Create learning pattern metadata with proper sanitization
   * @param userId - User identifier
   * @param patternType - Type of pattern
   * @param confidence - Confidence score
   * @param frequency - Pattern frequency
   * @param lastSeen - Last seen timestamp
   * @param tags - Array of tags
   * @returns Sanitized metadata object
   */
  public static createLearningPatternMetadata(
    userId: string,
    patternType: string,
    confidence: number,
    frequency: number,
    lastSeen: Date,
    tags: string[]
  ): Record<string, any> {
    return this.sanitizeMetadata({
      userId,
      patternType,
      confidence,
      frequency,
      lastSeen: lastSeen.toISOString(),
      tags: tags.join(',')
    });
  }

  /**
   * Create user preference metadata with proper sanitization
   * @param sessionId - Session identifier
   * @param userId - User identifier
   * @param interactionType - Type of interaction
   * @param confidence - Confidence score
   * @param tags - Array of tags
   * @returns Sanitized metadata object
   */
  public static createUserPreferenceMetadata(
    sessionId: string,
    userId: string,
    interactionType: string,
    confidence: number,
    tags: string[]
  ): Record<string, any> {
    return this.sanitizeMetadata({
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
      interactionType,
      confidence,
      tags: tags.join(',')
    });
  }

  /**
   * Normalize timestamp to ISO string
   * @param timestamp - Timestamp in various formats
   * @returns ISO string timestamp
   */
  private static normalizeTimestamp(timestamp: Date | string | number): string {
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    } else if (typeof timestamp === 'string') {
      return timestamp;
    } else if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString();
    } else {
      return new Date().toISOString();
    }
  }

  /**
   * Sanitize document content for Chroma storage
   * @param content - Raw content
   * @returns Sanitized content string
   */
  public static sanitizeDocumentContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    } else if (typeof content === 'object' && content !== null) {
      return JSON.stringify(content);
    } else {
      return String(content);
    }
  }

  /**
   * Create a complete Chroma entry with sanitized metadata and content
   * @param id - Entry ID
   * @param content - Entry content
   * @param metadata - Raw metadata
   * @returns Sanitized Chroma entry
   */
  public static createChromaEntry(
    id: string,
    content: any,
    metadata: Record<string, any>
  ): { id: string; content: string; metadata: Record<string, any> } {
    return {
      id,
      content: this.sanitizeDocumentContent(content),
      metadata: this.sanitizeMetadata(metadata)
    };
  }

  /**
   * Batch sanitize multiple metadata objects
   * @param metadataArray - Array of metadata objects
   * @returns Array of sanitized metadata objects
   */
  public static sanitizeMetadataBatch(metadataArray: Record<string, any>[]): Record<string, any>[] {
    return metadataArray.map(metadata => this.sanitizeMetadata(metadata));
  }

  /**
   * Get metadata validation errors
   * @param metadata - Metadata to validate
   * @returns Array of validation error messages
   */
  public static getValidationErrors(metadata: Record<string, any>): string[] {
    const errors: string[] = [];
    
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value !== 'string' && 
          typeof value !== 'number' && 
          typeof value !== 'boolean' && 
          value !== null) {
        errors.push(`Key '${key}' has invalid type '${typeof value}'. Chroma only supports string, number, boolean, and null.`);
      }
    }
    
    return errors;
  }
}
