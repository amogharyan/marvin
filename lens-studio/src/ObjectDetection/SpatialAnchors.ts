/**
 * Spatial Anchors System
 * 
 * Manages persistent spatial positioning for tracked objects.
 * Creates and maintains spatial anchors so objects maintain stable
 * AR tracking even when temporarily occluded.
 * 
 * Implements:
 * - FR-003: Spatial position tracking with anchors
 * - FR-031: Object placement pattern learning
 * - Task 1.5: Spatial anchor system for persistent positioning
 */

import {
  SpatialAnchor,
  vec3,
  quat,
} from '../types/lens-studio';
import {
  DemoObject,
  DemoObjectType,
  SpatialAnchorData,
  SpatialMemory,
  ARError,
  ARErrorType,
} from '../types/core';
import { getDemoObjectConfig } from './DemoObjects';

/**
 * Configuration for Spatial Anchors System
 */
export interface SpatialAnchorsConfig {
  /** Whether to enable spatial memory learning */
  enableLearning: boolean;
  
  /** Minimum confidence threshold for creating anchors */
  minConfidenceThreshold: number;
  
  /** Maximum age of anchor before automatic removal (ms) */
  maxAnchorAge: number;
  
  /** Whether to enable debug logging */
  debugMode: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SpatialAnchorsConfig = {
  enableLearning: true,
  minConfidenceThreshold: 0.9,
  maxAnchorAge: 24 * 60 * 60 * 1000, // 24 hours
  debugMode: false,
};

/**
 * SpatialAnchorsManager handles persistent object positioning
 * 
 * This class creates and maintains spatial anchors for demo objects,
 * enabling stable AR tracking and learning typical object locations.
 */
export class SpatialAnchorsManager {
  private readonly config: SpatialAnchorsConfig;
  
  // Mapping of object ID to spatial anchor
  private readonly anchors: Map<string, SpatialAnchorData>;
  
  // Mapping of object ID to Lens Studio SpatialAnchor
  private readonly lensStudioAnchors: Map<string, SpatialAnchor>;
  
  // Spatial memory for learning object locations
  private readonly spatialMemory: Map<string, SpatialMemory>;
  
  /**
   * Create new SpatialAnchorsManager
   */
  constructor(config: Partial<SpatialAnchorsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.anchors = new Map();
    this.lensStudioAnchors = new Map();
    this.spatialMemory = new Map();
    
    this.log('SpatialAnchorsManager created');
  }
  
  // ==========================================================================
  // Anchor Management
  // ==========================================================================
  
  /**
   * Create or update spatial anchor for object
   * 
   * @param object - Demo object to anchor
   * @returns Anchor ID
   * @throws {ARError} If anchor creation fails
   */
  public createOrUpdateAnchor(object: DemoObject): string {
    try {
      // Check if object type should have spatial memory
      const config = getDemoObjectConfig(object.type);
      if (!config.enableSpatialMemory) {
        this.log(`Spatial memory disabled for ${object.type}`);
        return object.id;
      }
      
      // Check confidence threshold
      if (object.detectionConfidence < this.config.minConfidenceThreshold) {
        this.log(
          `Object ${object.id} confidence ${object.detectionConfidence} ` +
          `below threshold ${this.config.minConfidenceThreshold}`
        );
        return object.id;
      }
      
      // Check if anchor already exists
      const existingAnchor = this.anchors.get(object.id);
      
      if (existingAnchor) {
        // Update existing anchor
        this.updateAnchor(object);
      } else {
        // Create new anchor
        this.createNewAnchor(object);
      }
      
      // Update spatial memory
      if (this.config.enableLearning) {
        this.updateSpatialMemory(object);
      }
      
      return object.id;
      
    } catch (error) {
      const arError = new ARError(
        ARErrorType.SPATIAL_TRACKING_LOST,
        `Failed to create anchor for object ${object.id}`,
        { originalError: error, objectId: object.id }
      );
      this.logError('Anchor creation failed', arError);
      throw arError;
    }
  }
  
  /**
   * Create new spatial anchor
   */
  private createNewAnchor(object: DemoObject): void {
    // Create Lens Studio spatial anchor
    const lensAnchor = SpatialAnchor.create(
      object.spatialPosition,
      object.rotation
    );
    
    // Create our anchor data
    const anchorData: SpatialAnchorData = {
      id: lensAnchor.id,
      objectId: object.id,
      position: object.spatialPosition,
      rotation: object.rotation,
      isTracked: true,
      lastUpdated: Date.now(),
      trackingConfidence: object.detectionConfidence,
    };
    
    // Store references
    this.anchors.set(object.id, anchorData);
    this.lensStudioAnchors.set(object.id, lensAnchor);
    
    // Update object with anchor ID
    object.anchorId = lensAnchor.id;
    
    this.log(`Created anchor ${lensAnchor.id} for object ${object.name}`);
  }
  
  /**
   * Update existing spatial anchor
   */
  private updateAnchor(object: DemoObject): void {
    const anchorData = this.anchors.get(object.id);
    
    if (!anchorData) {
      return;
    }
    
    // Update anchor data
    anchorData.position = object.spatialPosition;
    anchorData.rotation = object.rotation;
    anchorData.lastUpdated = Date.now();
    anchorData.trackingConfidence = object.detectionConfidence;
    anchorData.isTracked = object.isVisible;
    
    this.log(`Updated anchor for object ${object.name}`);
  }
  
  /**
   * Remove spatial anchor for object
   */
  public removeAnchor(objectId: string): void {
    const anchorData = this.anchors.get(objectId);
    const lensAnchor = this.lensStudioAnchors.get(objectId);
    
    if (lensAnchor) {
      lensAnchor.remove();
      this.lensStudioAnchors.delete(objectId);
    }
    
    if (anchorData) {
      this.anchors.delete(objectId);
      this.log(`Removed anchor for object ${objectId}`);
    }
  }
  
  /**
   * Get anchor data for object
   */
  public getAnchor(objectId: string): SpatialAnchorData | undefined {
    return this.anchors.get(objectId);
  }
  
  /**
   * Get all active anchors
   */
  public getAllAnchors(): SpatialAnchorData[] {
    return Array.from(this.anchors.values());
  }
  
  /**
   * Check if object has anchor
   */
  public hasAnchor(objectId: string): boolean {
    return this.anchors.has(objectId);
  }
  
  // ==========================================================================
  // Spatial Memory & Learning
  // ==========================================================================
  
  /**
   * Update spatial memory with object position
   * Learns typical object locations over time
   */
  private updateSpatialMemory(object: DemoObject): void {
    let memory = this.spatialMemory.get(object.id);
    
    if (!memory) {
      // Create new memory
      memory = {
        objectId: object.id,
        objectType: object.type,
        lastKnownPosition: object.spatialPosition,
        positionHistory: [],
      };
      this.spatialMemory.set(object.id, memory);
    }
    
    // Update last known position
    memory.lastKnownPosition = object.spatialPosition;
    
    // Add to position history
    memory.positionHistory.push({
      position: object.spatialPosition,
      timestamp: Date.now(),
    });
    
    // Keep last 100 positions
    if (memory.positionHistory.length > 100) {
      memory.positionHistory.shift();
    }
    
    // Calculate typical location if we have enough data
    if (memory.positionHistory.length >= 10) {
      memory.typicalLocation = this.calculateTypicalLocation(memory.positionHistory);
      memory.locationConfidence = this.calculateLocationConfidence(memory.positionHistory);
    }
  }
  
  /**
   * Calculate typical location from position history
   * Uses clustering/averaging of positions
   */
  private calculateTypicalLocation(
    history: Array<{ position: vec3; timestamp: number }>
  ): vec3 {
    // Simple average of positions
    // In production, could use more sophisticated clustering
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    
    for (const entry of history) {
      sumX += entry.position.x;
      sumY += entry.position.y;
      sumZ += entry.position.z;
    }
    
    const count = history.length;
    return new vec3(
      sumX / count,
      sumY / count,
      sumZ / count
    );
  }
  
  /**
   * Calculate confidence in typical location
   * Based on consistency of positions (low variance = high confidence)
   */
  private calculateLocationConfidence(
    history: Array<{ position: vec3; timestamp: number }>
  ): number {
    if (history.length < 2) {
      return 0;
    }
    
    const typical = this.calculateTypicalLocation(history);
    
    // Calculate average distance from typical location
    let totalDistance = 0;
    for (const entry of history) {
      totalDistance += this.calculateDistance(entry.position, typical);
    }
    const avgDistance = totalDistance / history.length;
    
    // Convert distance to confidence (closer = higher confidence)
    // Confidence drops off exponentially with distance
    // 0.1m distance = ~0.9 confidence, 1m distance = ~0.4 confidence
    const confidence = Math.exp(-avgDistance * 2);
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Get spatial memory for object
   */
  public getSpatialMemory(objectId: string): SpatialMemory | undefined {
    return this.spatialMemory.get(objectId);
  }
  
  /**
   * Get all spatial memories
   */
  public getAllSpatialMemories(): SpatialMemory[] {
    return Array.from(this.spatialMemory.values());
  }
  
  /**
   * Get typical location for object type
   * Useful for "Where are my keys?" feature
   */
  public getTypicalLocationForType(objectType: DemoObjectType): vec3 | null {
    for (const memory of this.spatialMemory.values()) {
      if (memory.objectType === objectType && memory.typicalLocation) {
        return memory.typicalLocation;
      }
    }
    return null;
  }
  
  // ==========================================================================
  // Anchor Recovery
  // ==========================================================================
  
  /**
   * Attempt to recover anchor for lost object
   * Uses spatial memory to guide user to last known location
   */
  public getLastKnownPosition(objectId: string): vec3 | null {
    // Check anchor first
    const anchor = this.anchors.get(objectId);
    if (anchor) {
      return anchor.position;
    }
    
    // Check spatial memory
    const memory = this.spatialMemory.get(objectId);
    if (memory) {
      return memory.lastKnownPosition;
    }
    
    return null;
  }
  
  /**
   * Get direction arrow to object's last known position
   * Returns normalized direction vector from current position to object
   */
  public getDirectionToObject(
    objectId: string,
    currentPosition: vec3
  ): vec3 | null {
    const lastPosition = this.getLastKnownPosition(objectId);
    
    if (!lastPosition) {
      return null;
    }
    
    // Calculate direction vector
    const direction = new vec3(
      lastPosition.x - currentPosition.x,
      lastPosition.y - currentPosition.y,
      lastPosition.z - currentPosition.z
    );
    
    // Normalize
    return direction.normalize();
  }
  
  // ==========================================================================
  // Cleanup & Maintenance
  // ==========================================================================
  
  /**
   * Remove old anchors that exceed max age
   */
  public cleanupOldAnchors(): void {
    const now = Date.now();
    const anchorsToRemove: string[] = [];
    
    for (const [objectId, anchor] of this.anchors.entries()) {
      const age = now - anchor.lastUpdated;
      
      if (age > this.config.maxAnchorAge) {
        anchorsToRemove.push(objectId);
      }
    }
    
    for (const objectId of anchorsToRemove) {
      this.removeAnchor(objectId);
      this.log(`Removed old anchor for object ${objectId}`);
    }
  }
  
  /**
   * Clear all anchors and spatial memory
   */
  public clear(): void {
    // Remove all Lens Studio anchors
    for (const lensAnchor of this.lensStudioAnchors.values()) {
      lensAnchor.remove();
    }
    
    this.anchors.clear();
    this.lensStudioAnchors.clear();
    this.spatialMemory.clear();
    
    this.log('Cleared all anchors and spatial memory');
  }
  
  /**
   * Dispose and clean up resources
   */
  public dispose(): void {
    this.log('Disposing SpatialAnchorsManager');
    this.clear();
  }
  
  // ==========================================================================
  // Utilities
  // ==========================================================================
  
  /**
   * Calculate distance between two 3D points
   */
  private calculateDistance(a: vec3, b: vec3): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Get statistics about spatial anchors
   */
  public getStatistics(): {
    totalAnchors: number;
    trackedAnchors: number;
    memoriesWithTypicalLocation: number;
    averageTrackingConfidence: number;
  } {
    const allAnchors = this.getAllAnchors();
    const trackedAnchors = allAnchors.filter(a => a.isTracked);
    const memoriesWithLocation = this.getAllSpatialMemories()
      .filter(m => m.typicalLocation !== undefined);
    
    const avgConfidence = allAnchors.length > 0
      ? allAnchors.reduce((sum, a) => sum + a.trackingConfidence, 0) / allAnchors.length
      : 0;
    
    return {
      totalAnchors: allAnchors.length,
      trackedAnchors: trackedAnchors.length,
      memoriesWithTypicalLocation: memoriesWithLocation.length,
      averageTrackingConfidence: avgConfidence,
    };
  }
  
  // ==========================================================================
  // Logging
  // ==========================================================================
  
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debugMode) {
      console.log(`[SpatialAnchors] ${message}`, ...args);
    }
  }
  
  private logError(message: string, error: unknown): void {
    console.error(`[SpatialAnchors] ${message}`, error);
  }
}

/**
 * Factory function to create SpatialAnchorsManager
 */
export function createSpatialAnchorsManager(
  config?: Partial<SpatialAnchorsConfig>
): SpatialAnchorsManager {
  return new SpatialAnchorsManager(config);
}

