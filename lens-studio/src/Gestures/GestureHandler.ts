/**
 * Gesture Handler
 * 
 * Manages hand tracking and gesture recognition for AR interactions.
 * Detects when users reach for, touch, or interact with objects.
 * 
 * Implements:
 * - FR-004: Hand gesture detection for object interaction
 * - Task 1.7: Implement gesture detection with HandTracking API
 */

import {
  HandTracking,
  TrackedHand,
  HandGesture as LensGesture,
  vec3,
} from '../types/lens-studio';
import {
  GestureEvent,
  GestureType,
  GestureConfig,
  DemoObject,
  ARError,
  ARErrorType,
  EventCallback,
} from '../types/core';

/**
 * Configuration for GestureHandler
 */
export interface GestureHandlerConfig {
  /** Confidence threshold for gesture recognition (0-1) */
  confidenceThreshold: number;
  
  /** Maximum distance from object to trigger interaction (meters) */
  interactionDistance: number;
  
  /** Enabled gesture types */
  enabledGestures: Set<GestureType>;
  
  /** Enable debug mode */
  debugMode: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: GestureHandlerConfig = {
  confidenceThreshold: 0.85,
  interactionDistance: 0.3, // 30cm
  enabledGestures: new Set(['reach', 'touch', 'grab', 'pinch', 'point']),
  debugMode: false,
};

/**
 * GestureHandler manages hand tracking and gesture recognition
 * 
 * This class integrates with Lens Studio's HandTracking API to detect
 * user gestures and trigger appropriate object interactions.
 */
export class GestureHandler {
  private readonly config: GestureHandlerConfig;
  private readonly eventCallbacks: Set<EventCallback<GestureEvent>>;
  private readonly gestureConfigs: Map<GestureType, GestureConfig>;
  
  private handTracking?: HandTracking;
  private trackedObjects: DemoObject[] = [];
  
  private isInitialized: boolean = false;
  private isTracking: boolean = false;
  
  // Gesture state tracking
  private lastGestureTime: Map<string, number> = new Map();
  private readonly gestureDebounceMs: number = 500; // Prevent duplicate gestures
  
  // Performance tracking
  private recognitionLatencies: number[] = [];
  
  /**
   * Create new GestureHandler
   */
  constructor(config: Partial<GestureHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.eventCallbacks = new Set();
    this.gestureConfigs = new Map();
    
    // Initialize default gesture configs
    this.initializeDefaultGestureConfigs();
    
    this.log('GestureHandler created');
  }
  
  // ==========================================================================
  // Initialization
  // ==========================================================================
  
  /**
   * Initialize gesture handler with Lens Studio HandTracking component
   */
  public initialize(handTracking: HandTracking): void {
    if (this.isInitialized) {
      this.log('Already initialized');
      return;
    }
    
    try {
      this.handTracking = handTracking;
      
      // Setup event handlers
      this.setupEventHandlers();
      
      this.isInitialized = true;
      this.log('GestureHandler initialized');
      
    } catch (error) {
      const arError = new ARError(
        ARErrorType.GESTURE_RECOGNITION_FAILED,
        'Failed to initialize GestureHandler',
        { originalError: error }
      );
      this.logError('Initialization failed', arError);
      throw arError;
    }
  }
  
  /**
   * Setup event handlers for hand tracking
   */
  private setupEventHandlers(): void {
    if (!this.handTracking) {
      throw new Error('HandTracking component not initialized');
    }
    
    // Hand found callback
    this.handTracking.onHandFound = (hand: TrackedHand) => {
      this.log(`Hand detected: ${hand.handedness}`);
    };
    
    // Hand lost callback
    this.handTracking.onHandLost = (handId: string) => {
      this.log(`Hand lost: ${handId}`);
    };
    
    // Hand updated callback
    this.handTracking.onHandUpdated = (hand: TrackedHand) => {
      this.handleHandUpdate(hand);
    };
  }
  
  /**
   * Initialize default gesture configurations
   */
  private initializeDefaultGestureConfigs(): void {
    const defaultGestures: Array<{type: GestureType; threshold: number}> = [
      { type: 'reach', threshold: 0.85 },
      { type: 'touch', threshold: 0.90 },
      { type: 'grab', threshold: 0.88 },
      { type: 'pinch', threshold: 0.85 },
      { type: 'point', threshold: 0.80 },
      { type: 'wave', threshold: 0.75 },
      { type: 'swipe', threshold: 0.80 },
    ];
    
    for (const gesture of defaultGestures) {
      this.gestureConfigs.set(gesture.type, {
        type: gesture.type,
        confidenceThreshold: gesture.threshold,
        enabled: this.config.enabledGestures.has(gesture.type),
      });
    }
  }
  
  // ==========================================================================
  // Tracking Control
  // ==========================================================================
  
  /**
   * Start gesture tracking
   */
  public startTracking(): void {
    if (!this.isInitialized) {
      throw new ARError(
        ARErrorType.GESTURE_RECOGNITION_FAILED,
        'Cannot start tracking: GestureHandler not initialized'
      );
    }
    
    if (this.isTracking) {
      return;
    }
    
    if (this.handTracking) {
      this.handTracking.isTracking = true;
      this.isTracking = true;
      this.log('Gesture tracking started');
    }
  }
  
  /**
   * Stop gesture tracking
   */
  public stopTracking(): void {
    if (!this.isTracking) {
      return;
    }
    
    if (this.handTracking) {
      this.handTracking.isTracking = false;
      this.isTracking = false;
      this.log('Gesture tracking stopped');
    }
  }
  
  /**
   * Update list of tracked objects for interaction detection
   */
  public updateTrackedObjects(objects: DemoObject[]): void {
    this.trackedObjects = objects;
  }
  
  // ==========================================================================
  // Hand Update Processing
  // ==========================================================================
  
  /**
   * Handle hand tracking update
   */
  private handleHandUpdate(hand: TrackedHand): void {
    const startTime = performance.now();
    
    try {
      // Check confidence threshold
      if (hand.confidence < this.config.confidenceThreshold) {
        return;
      }
      
      // Recognize gesture from hand pose
      const recognizedGesture = this.recognizeGesture(hand);
      
      if (!recognizedGesture) {
        return;
      }
      
      // Check if this gesture is enabled
      const gestureConfig = this.gestureConfigs.get(recognizedGesture);
      if (!gestureConfig || !gestureConfig.enabled) {
        return;
      }
      
      // Check debounce
      if (this.isGestureDebounced(hand.id, recognizedGesture)) {
        return;
      }
      
      // Find nearest object for interaction
      const targetObject = this.findNearestObject(hand.wristPosition);
      
      // Create gesture event
      const gestureEvent: GestureEvent = {
        id: `gesture_${Date.now()}_${hand.id}`,
        type: recognizedGesture,
        handedness: hand.handedness,
        position: hand.wristPosition,
        confidence: hand.confidence,
        timestamp: Date.now(),
        targetObjectId: targetObject?.id,
      };
      
      // Emit event
      this.emitGestureEvent(gestureEvent);
      
      // Update debounce
      this.lastGestureTime.set(`${hand.id}_${recognizedGesture}`, Date.now());
      
      // Record performance
      const latency = performance.now() - startTime;
      this.recordRecognitionLatency(latency);
      
      this.log(`Gesture recognized: ${recognizedGesture} (${hand.handedness})`);
      
    } catch (error) {
      this.logError('Error processing hand update', error);
    }
  }
  
  // ==========================================================================
  // Gesture Recognition
  // ==========================================================================
  
  /**
   * Recognize gesture from hand pose
   * Maps Lens Studio hand gestures to our gesture types
   */
  private recognizeGesture(hand: TrackedHand): GestureType | null {
    // If Lens Studio provides gesture, use it
    if (hand.gesture) {
      switch (hand.gesture) {
        case 'pinch':
          return 'pinch';
        case 'point':
          return 'point';
        case 'fist':
          return 'grab';
        case 'open_palm':
          // Determine if it's a wave or reach based on movement
          return this.detectWaveOrReach(hand);
        default:
          return null;
      }
    }
    
    // Otherwise, analyze hand pose
    return this.analyzeHandPose(hand);
  }
  
  /**
   * Detect if open palm is a wave or reach gesture
   */
  private detectWaveOrReach(hand: TrackedHand): GestureType {
    // Check if hand is moving horizontally (wave) or moving toward objects (reach)
    // For demo, we'll use reach as it's more useful for object interaction
    
    // Check if hand is near any object
    const nearestObject = this.findNearestObject(hand.wristPosition);
    if (nearestObject) {
      const distance = this.calculateDistance(hand.wristPosition, nearestObject.spatialPosition);
      if (distance < this.config.interactionDistance) {
        return 'reach';
      }
    }
    
    return 'wave';
  }
  
  /**
   * Analyze hand pose for gesture recognition
   * Fallback when Lens Studio doesn't provide gesture
   */
  private analyzeHandPose(hand: TrackedHand): GestureType | null {
    // Check if hand is reaching toward an object
    const nearestObject = this.findNearestObject(hand.wristPosition);
    
    if (nearestObject) {
      const distance = this.calculateDistance(hand.wristPosition, nearestObject.spatialPosition);
      
      // Touch gesture - very close to object
      if (distance < 0.05) { // 5cm
        return 'touch';
      }
      
      // Reach gesture - approaching object
      if (distance < this.config.interactionDistance) {
        return 'reach';
      }
    }
    
    return null;
  }
  
  // ==========================================================================
  // Object Interaction Detection
  // ==========================================================================
  
  /**
   * Find nearest object to hand position
   */
  private findNearestObject(handPosition: vec3): DemoObject | null {
    if (this.trackedObjects.length === 0) {
      return null;
    }
    
    let nearest: DemoObject | null = null;
    let minDistance = Infinity;
    
    for (const obj of this.trackedObjects) {
      if (!obj.isVisible) {
        continue;
      }
      
      const distance = this.calculateDistance(handPosition, obj.spatialPosition);
      
      if (distance < minDistance && distance < this.config.interactionDistance) {
        minDistance = distance;
        nearest = obj;
      }
    }
    
    return nearest;
  }
  
  /**
   * Check if hand is interacting with object
   */
  public isInteractingWithObject(
    handPosition: vec3,
    object: DemoObject
  ): boolean {
    const distance = this.calculateDistance(handPosition, object.spatialPosition);
    return distance < this.config.interactionDistance;
  }
  
  // ==========================================================================
  // Gesture Debouncing
  // ==========================================================================
  
  /**
   * Check if gesture should be debounced (prevent duplicates)
   */
  private isGestureDebounced(handId: string, gestureType: GestureType): boolean {
    const key = `${handId}_${gestureType}`;
    const lastTime = this.lastGestureTime.get(key);
    
    if (!lastTime) {
      return false;
    }
    
    const elapsed = Date.now() - lastTime;
    return elapsed < this.gestureDebounceMs;
  }
  
  // ==========================================================================
  // Event System
  // ==========================================================================
  
  /**
   * Subscribe to gesture events
   */
  public on(callback: EventCallback<GestureEvent>): () => void {
    this.eventCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventCallbacks.delete(callback);
    };
  }
  
  /**
   * Emit gesture event
   */
  private emitGestureEvent(event: GestureEvent): void {
    for (const callback of this.eventCallbacks) {
      try {
        callback(event);
      } catch (error) {
        this.logError('Error in gesture event callback', error);
      }
    }
    
    // Also call specific gesture config callback if set
    const config = this.gestureConfigs.get(event.type);
    if (config?.onDetected) {
      try {
        config.onDetected(event);
      } catch (error) {
        this.logError('Error in gesture config callback', error);
      }
    }
  }
  
  // ==========================================================================
  // Gesture Configuration
  // ==========================================================================
  
  /**
   * Configure gesture recognition
   */
  public configureGesture(config: GestureConfig): void {
    this.gestureConfigs.set(config.type, config);
    this.log(`Configured gesture: ${config.type}`);
  }
  
  /**
   * Enable gesture type
   */
  public enableGesture(type: GestureType): void {
    const config = this.gestureConfigs.get(type);
    if (config) {
      config.enabled = true;
      this.config.enabledGestures.add(type);
    }
  }
  
  /**
   * Disable gesture type
   */
  public disableGesture(type: GestureType): void {
    const config = this.gestureConfigs.get(type);
    if (config) {
      config.enabled = false;
      this.config.enabledGestures.delete(type);
    }
  }
  
  // ==========================================================================
  // Querying
  // ==========================================================================
  
  /**
   * Get all currently tracked hands
   */
  public getTrackedHands(): TrackedHand[] {
    if (!this.handTracking) {
      return [];
    }
    
    return this.handTracking.getTrackedHands();
  }
  
  /**
   * Check if any hands are currently tracked
   */
  public hasTrackedHands(): boolean {
    return this.getTrackedHands().length > 0;
  }
  
  // ==========================================================================
  // Performance Monitoring
  // ==========================================================================
  
  /**
   * Record gesture recognition latency
   */
  private recordRecognitionLatency(latency: number): void {
    this.recognitionLatencies.push(latency);
    
    // Keep last 100 measurements
    if (this.recognitionLatencies.length > 100) {
      this.recognitionLatencies.shift();
    }
  }
  
  /**
   * Get average recognition latency
   */
  public getAverageRecognitionLatency(): number {
    if (this.recognitionLatencies.length === 0) {
      return 0;
    }
    
    const sum = this.recognitionLatencies.reduce((a, b) => a + b, 0);
    return sum / this.recognitionLatencies.length;
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
    this.log('Disposing GestureHandler');
    
    this.stopTracking();
    this.eventCallbacks.clear();
    this.lastGestureTime.clear();
    this.trackedObjects = [];
    
    this.isInitialized = false;
    this.log('GestureHandler disposed');
  }
  
  // ==========================================================================
  // Logging
  // ==========================================================================
  
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debugMode) {
      console.log(`[GestureHandler] ${message}`, ...args);
    }
  }
  
  private logError(message: string, error: unknown): void {
    console.error(`[GestureHandler] ${message}`, error);
  }
}

/**
 * Factory function to create and initialize GestureHandler
 */
export function createGestureHandler(
  handTracking: HandTracking,
  config?: Partial<GestureHandlerConfig>
): GestureHandler {
  const handler = new GestureHandler(config);
  handler.initialize(handTracking);
  return handler;
}

