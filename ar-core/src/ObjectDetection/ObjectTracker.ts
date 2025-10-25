/**
 * Object Tracker
 * 
 * Main coordinator for object detection and tracking in the AR environment.
 * Integrates with Snap Spectacles ObjectTracking and MLComponent APIs.
 * 
 * Implements:
 * - FR-001: Native Snap Spectacles object detection
 * - FR-002: Recognition of 5 demo objects
 * - FR-003: Spatial position tracking
 * - FR-005: <100ms latency requirement
 * - FR-007: Object occlusion handling
 * 
 * Task Coverage: 1.5 (Core object detection)
 */

import {
  ObjectTracking,
  TrackedObject,
  MLComponent,
  vec3,
  quat,
} from '../types/lens-studio';
import {
  DemoObject,
  DemoObjectType,
  ObjectDetectionEvent,
  ARError,
  ARErrorType,
  PerformanceMetrics,
  EventCallback,
} from '../types/core';
import {
  getDemoObjectConfig,
  getObjectTypeFromLabel,
  meetsConfidenceThreshold,
  getAllMLLabels,
} from './DemoObjects';

/**
 * Configuration for ObjectTracker
 */
export interface ObjectTrackerConfig {
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  
  /** Whether to enable debug logging */
  debugMode: boolean;
  
  /** Maximum number of objects to track simultaneously */
  maxTrackedObjects: number;
  
  /** Update frequency in Hz (default: 60 for 60fps) */
  updateFrequency: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ObjectTrackerConfig = {
  enablePerformanceMonitoring: true,
  debugMode: false,
  maxTrackedObjects: 10,
  updateFrequency: 60,
};

/**
 * ObjectTracker manages detection and tracking of demo objects
 * 
 * This class integrates with Lens Studio's ObjectTracking API and
 * coordinates with the ML model for object classification.
 */
export class ObjectTracker {
  private readonly config: ObjectTrackerConfig;
  private readonly trackedObjects: Map<string, DemoObject>;
  private readonly eventCallbacks: Set<EventCallback<ObjectDetectionEvent>>;
  
  private objectTracking?: ObjectTracking;
  private mlComponent?: MLComponent;
  
  private isInitialized: boolean = false;
  private isTracking: boolean = false;
  
  // Performance monitoring
  private lastUpdateTime: number = 0;
  private detectionLatencies: number[] = [];
  
  /**
   * Create new ObjectTracker instance
   */
  constructor(config: Partial<ObjectTrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.trackedObjects = new Map();
    this.eventCallbacks = new Set();
    
    this.log('ObjectTracker created', this.config);
  }
  
  // ==========================================================================
  // Initialization
  // ==========================================================================
  
  /**
   * Initialize the object tracker with Lens Studio components
   * 
   * @param objectTracking - Lens Studio ObjectTracking component
   * @param mlComponent - Lens Studio MLComponent for object classification
   * @throws {ARError} If initialization fails
   */
  public async initialize(
    objectTracking: ObjectTracking,
    mlComponent: MLComponent
  ): Promise<void> {
    if (this.isInitialized) {
      this.log('Already initialized, skipping');
      return;
    }
    
    try {
      this.log('Initializing ObjectTracker...');
      
      // Store component references
      this.objectTracking = objectTracking;
      this.mlComponent = mlComponent;
      
      // Configure object tracking
      this.objectTracking.maxTrackedObjects = this.config.maxTrackedObjects;
      this.objectTracking.confidenceThreshold = 0.9; // Base threshold, refined per object
      
      // Load ML model
      if (!this.mlComponent.isLoaded) {
        this.log('Loading ML model...');
        await this.mlComponent.load();
        this.log('ML model loaded successfully');
      }
      
      // Register event handlers
      this.setupEventHandlers();
      
      this.isInitialized = true;
      this.log('ObjectTracker initialized successfully');
      
    } catch (error) {
      const arError = new ARError(
        ARErrorType.ML_MODEL_LOAD_FAILED,
        'Failed to initialize ObjectTracker',
        { originalError: error }
      );
      this.logError('Initialization failed', arError);
      throw arError;
    }
  }
  
  /**
   * Setup event handlers for Lens Studio callbacks
   */
  private setupEventHandlers(): void {
    if (!this.objectTracking) {
      throw new Error('ObjectTracking component not initialized');
    }
    
    // Object found callback
    this.objectTracking.onObjectFound = (trackedObject: TrackedObject) => {
      this.handleObjectFound(trackedObject);
    };
    
    // Object lost callback
    this.objectTracking.onObjectLost = (objectId: string) => {
      this.handleObjectLost(objectId);
    };
    
    // Object updated callback
    this.objectTracking.onObjectUpdated = (trackedObject: TrackedObject) => {
      this.handleObjectUpdated(trackedObject);
    };
  }
  
  // ==========================================================================
  // Tracking Control
  // ==========================================================================
  
  /**
   * Start object tracking
   */
  public startTracking(): void {
    if (!this.isInitialized) {
      throw new ARError(
        ARErrorType.OBJECT_DETECTION_FAILED,
        'Cannot start tracking: ObjectTracker not initialized'
      );
    }
    
    if (this.isTracking) {
      this.log('Already tracking');
      return;
    }
    
    if (this.objectTracking) {
      this.objectTracking.isTracking = true;
      this.isTracking = true;
      this.log('Object tracking started');
    }
  }
  
  /**
   * Stop object tracking
   */
  public stopTracking(): void {
    if (!this.isTracking) {
      return;
    }
    
    if (this.objectTracking) {
      this.objectTracking.isTracking = false;
      this.isTracking = false;
      this.log('Object tracking stopped');
    }
  }
  
  /**
   * Check if tracker is currently tracking
   */
  public isActivelyTracking(): boolean {
    return this.isTracking && this.isInitialized;
  }
  
  // ==========================================================================
  // Object Detection Event Handlers
  // ==========================================================================
  
  /**
   * Handle new object detected
   */
  private handleObjectFound(trackedObject: TrackedObject): void {
    const startTime = performance.now();
    
    try {
      // Convert TrackedObject to DemoObject
      const demoObject = this.convertToDemoObject(trackedObject);
      
      if (!demoObject) {
        // Object not recognized as demo object
        this.log(`Object not recognized: ${trackedObject.classification}`);
        return;
      }
      
      // Check confidence threshold
      const objectType = demoObject.type;
      if (!meetsConfidenceThreshold(objectType, demoObject.detectionConfidence)) {
        this.log(
          `Object ${objectType} confidence ${demoObject.detectionConfidence} ` +
          `below threshold, ignoring`
        );
        return;
      }
      
      // Store tracked object
      this.trackedObjects.set(demoObject.id, demoObject);
      
      // Emit event
      this.emitObjectEvent('object_detected', demoObject);
      
      this.log(`Object detected: ${demoObject.name} (${demoObject.id})`);
      
      // Record performance
      if (this.config.enablePerformanceMonitoring) {
        const latency = performance.now() - startTime;
        this.recordDetectionLatency(latency);
        
        // FR-005: <100ms latency requirement
        if (latency > 100) {
          this.logWarn(`Detection latency ${latency.toFixed(2)}ms exceeds 100ms threshold`);
        }
      }
      
    } catch (error) {
      this.logError('Error handling object found', error);
    }
  }
  
  /**
   * Handle object tracking lost
   */
  private handleObjectLost(objectId: string): void {
    const demoObject = this.trackedObjects.get(objectId);
    
    if (!demoObject) {
      return;
    }
    
    // Mark as not visible
    demoObject.isVisible = false;
    
    // Emit event
    this.emitObjectEvent('object_lost', demoObject);
    
    // Remove from tracked objects
    this.trackedObjects.delete(objectId);
    
    this.log(`Object lost: ${demoObject.name} (${objectId})`);
  }
  
  /**
   * Handle object tracking updated
   */
  private handleObjectUpdated(trackedObject: TrackedObject): void {
    const demoObject = this.trackedObjects.get(trackedObject.id);
    
    if (!demoObject) {
      // Object not in our tracking map, might need to add it
      this.handleObjectFound(trackedObject);
      return;
    }
    
    // Update position and confidence
    demoObject.spatialPosition = trackedObject.position;
    demoObject.rotation = trackedObject.rotation;
    demoObject.detectionConfidence = trackedObject.confidence;
    demoObject.isVisible = trackedObject.isVisible;
    
    // Emit event
    this.emitObjectEvent('object_updated', demoObject);
  }
  
  // ==========================================================================
  // Object Conversion
  // ==========================================================================
  
  /**
   * Convert Lens Studio TrackedObject to DemoObject
   * Returns null if object is not a recognized demo object
   */
  private convertToDemoObject(trackedObject: TrackedObject): DemoObject | null {
    // Get object type from ML classification
    const objectType = getObjectTypeFromLabel(trackedObject.classification);
    
    if (!objectType) {
      return null;
    }
    
    // Get configuration
    const config = getDemoObjectConfig(objectType);
    
    // Create DemoObject
    const demoObject: DemoObject = {
      id: trackedObject.id,
      type: objectType,
      name: config.displayName,
      detectionConfidence: trackedObject.confidence,
      spatialPosition: trackedObject.position,
      rotation: trackedObject.rotation,
      lastInteraction: Date.now(),
      firstDetected: Date.now(),
      associatedActions: config.triggers,
      isVisible: trackedObject.isVisible,
      metadata: {
        mlLabel: trackedObject.classification,
        dimensions: trackedObject.dimensions,
      },
    };
    
    return demoObject;
  }
  
  // ==========================================================================
  // Querying
  // ==========================================================================
  
  /**
   * Get all currently tracked objects
   */
  public getTrackedObjects(): DemoObject[] {
    return Array.from(this.trackedObjects.values());
  }
  
  /**
   * Get tracked object by ID
   */
  public getObjectById(id: string): DemoObject | undefined {
    return this.trackedObjects.get(id);
  }
  
  /**
   * Get tracked objects by type
   */
  public getObjectsByType(type: DemoObjectType): DemoObject[] {
    return this.getTrackedObjects().filter(obj => obj.type === type);
  }
  
  /**
   * Get object closest to position
   */
  public getClosestObject(position: vec3): DemoObject | null {
    const objects = this.getTrackedObjects();
    
    if (objects.length === 0) {
      return null;
    }
    
    let closest: DemoObject | null = null;
    let minDistance = Infinity;
    
    for (const obj of objects) {
      const distance = this.calculateDistance(position, obj.spatialPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closest = obj;
      }
    }
    
    return closest;
  }
  
  /**
   * Get count of tracked objects
   */
  public getTrackedObjectCount(): number {
    return this.trackedObjects.size;
  }
  
  // ==========================================================================
  // Event System
  // ==========================================================================
  
  /**
   * Subscribe to object detection events
   */
  public on(callback: EventCallback<ObjectDetectionEvent>): () => void {
    this.eventCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventCallbacks.delete(callback);
    };
  }
  
  /**
   * Emit object detection event
   */
  private emitObjectEvent(
    type: 'object_detected' | 'object_lost' | 'object_updated',
    object: DemoObject
  ): void {
    const event: ObjectDetectionEvent = {
      type,
      object,
      timestamp: Date.now(),
    };
    
    for (const callback of this.eventCallbacks) {
      try {
        callback(event);
      } catch (error) {
        this.logError('Error in event callback', error);
      }
    }
  }
  
  // ==========================================================================
  // Performance Monitoring
  // ==========================================================================
  
  /**
   * Record detection latency for performance monitoring
   */
  private recordDetectionLatency(latency: number): void {
    this.detectionLatencies.push(latency);
    
    // Keep last 100 measurements
    if (this.detectionLatencies.length > 100) {
      this.detectionLatencies.shift();
    }
  }
  
  /**
   * Get average detection latency
   */
  public getAverageDetectionLatency(): number {
    if (this.detectionLatencies.length === 0) {
      return 0;
    }
    
    const sum = this.detectionLatencies.reduce((a, b) => a + b, 0);
    return sum / this.detectionLatencies.length;
  }
  
  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): Partial<PerformanceMetrics> {
    return {
      detectionLatency: this.getAverageDetectionLatency(),
      trackedObjectCount: this.getTrackedObjectCount(),
      timestamp: Date.now(),
    };
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
   * Clean up resources
   */
  public dispose(): void {
    this.log('Disposing ObjectTracker');
    
    // Stop tracking
    this.stopTracking();
    
    // Clear tracked objects
    this.trackedObjects.clear();
    
    // Clear callbacks
    this.eventCallbacks.clear();
    
    // Unload ML model
    if (this.mlComponent?.isLoaded) {
      this.mlComponent.unload();
    }
    
    this.isInitialized = false;
    this.log('ObjectTracker disposed');
  }
  
  // ==========================================================================
  // Logging
  // ==========================================================================
  
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debugMode) {
      console.log(`[ObjectTracker] ${message}`, ...args);
    }
  }
  
  private logWarn(message: string, ...args: unknown[]): void {
    console.warn(`[ObjectTracker] ${message}`, ...args);
  }
  
  private logError(message: string, error: unknown): void {
    console.error(`[ObjectTracker] ${message}`, error);
  }
}

/**
 * Factory function to create and initialize ObjectTracker
 */
export async function createObjectTracker(
  objectTracking: ObjectTracking,
  mlComponent: MLComponent,
  config?: Partial<ObjectTrackerConfig>
): Promise<ObjectTracker> {
  const tracker = new ObjectTracker(config);
  await tracker.initialize(objectTracking, mlComponent);
  return tracker;
}

