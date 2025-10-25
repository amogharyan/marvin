/**
 * Marvin AR Core - Main Entry Point
 * 
 * Integrates all AR components (object detection, spatial tracking,
 * gesture recognition, and AR overlays) into a cohesive system.
 * 
 * This is the main coordinator for the AR experience on Snap Spectacles.
 */

import {
  Script,
  UpdateEvent,
  SceneObject,
  ObjectTracking,
  MLComponent,
  HandTracking,
  DeviceTracking,
  SceneUnderstanding,
  CameraTextureProvider,
  RemoteServiceModule,
  vec3,
} from './types/lens-studio';

import { ObjectTracker } from './ObjectDetection/ObjectTracker';
import { SpatialAnchorsManager } from './ObjectDetection/SpatialAnchors';
import { OverlayManager } from './AROverlays/OverlayManager';
import { GestureHandler } from './Gestures/GestureHandler';

import {
  ARConfig,
  DemoObject,
  ObjectDetectionEvent,
  GestureEvent,
  SystemEvent,
  PerformanceMetrics,
  ARError,
  ARErrorType,
  PerformanceThresholds,
} from './types/core';

import { DEMO_OBJECTS_CONFIG } from './ObjectDetection/DemoObjects';

/**
 * Main AR System
 * 
 * Coordinates all AR components and manages the application lifecycle
 */
export class MarvinARSystem {
  // Core components
  private objectTracker?: ObjectTracker;
  private spatialAnchors?: SpatialAnchorsManager;
  private overlayManager?: OverlayManager;
  private gestureHandler?: GestureHandler;
  
  // Lens Studio components
  private script?: Script;
  private deviceTracking?: DeviceTracking;
  private sceneUnderstanding?: SceneUnderstanding;
  private cameraProvider?: CameraTextureProvider;
  private remoteService?: RemoteServiceModule;
  
  // Configuration
  private readonly config: ARConfig;
  
  // State
  private isInitialized: boolean = false;
  private isRunning: boolean = false;
  
  // Performance monitoring
  private lastPerformanceCheck: number = 0;
  private performanceCheckInterval: number = 1000; // 1 second
  
  /**
   * Create new MarvinARSystem
   */
  constructor(config: ARConfig) {
    this.config = config;
    console.log('[MarvinAR] System created');
  }
  
  // ==========================================================================
  // Initialization
  // ==========================================================================
  
  /**
   * Initialize the AR system with Lens Studio components
   */
  public async initialize(
    script: Script,
    sceneRoot: SceneObject,
    objectTracking: ObjectTracking,
    mlComponent: MLComponent,
    handTracking: HandTracking,
    deviceTracking: DeviceTracking,
    sceneUnderstanding: SceneUnderstanding,
    cameraProvider: CameraTextureProvider,
    remoteService: RemoteServiceModule
  ): Promise<void> {
    try {
      console.log('[MarvinAR] Initializing system...');
      
      // Store Lens Studio components
      this.script = script;
      this.deviceTracking = deviceTracking;
      this.sceneUnderstanding = sceneUnderstanding;
      this.cameraProvider = cameraProvider;
      this.remoteService = remoteService;
      
      // Initialize Object Tracker
      console.log('[MarvinAR] Initializing ObjectTracker...');
      this.objectTracker = new ObjectTracker({
        enablePerformanceMonitoring: this.config.enablePerformanceMonitoring,
        debugMode: this.config.logLevel === 'debug',
        maxTrackedObjects: 10,
        updateFrequency: 60,
      });
      await this.objectTracker.initialize(objectTracking, mlComponent);
      
      // Initialize Spatial Anchors
      console.log('[MarvinAR] Initializing SpatialAnchorsManager...');
      this.spatialAnchors = new SpatialAnchorsManager({
        enableLearning: this.config.enableSpatialMemory,
        debugMode: this.config.logLevel === 'debug',
      });
      
      // Initialize Overlay Manager
      console.log('[MarvinAR] Initializing OverlayManager...');
      this.overlayManager = new OverlayManager({
        parentScene: sceneRoot,
        maxOverlays: 20,
        adaptiveBrightness: true,
        defaultBillboard: true,
        defaultDistance: 0.5,
        debugMode: this.config.logLevel === 'debug',
      });
      
      // Initialize Gesture Handler
      console.log('[MarvinAR] Initializing GestureHandler...');
      this.gestureHandler = new GestureHandler({
        confidenceThreshold: 0.85,
        interactionDistance: 0.3,
        debugMode: this.config.logLevel === 'debug',
      });
      this.gestureHandler.initialize(handTracking);
      
      // Setup event handlers
      this.setupEventHandlers();
      
      // Setup update loop
      this.setupUpdateLoop();
      
      this.isInitialized = true;
      console.log('[MarvinAR] System initialized successfully');
      
    } catch (error) {
      console.error('[MarvinAR] Initialization failed:', error);
      throw new ARError(
        ARErrorType.ML_MODEL_LOAD_FAILED,
        'Failed to initialize MarvinAR system',
        { originalError: error }
      );
    }
  }
  
  /**
   * Setup event handlers for component communication
   */
  private setupEventHandlers(): void {
    // Object detection events
    this.objectTracker?.on((event: ObjectDetectionEvent) => {
      this.handleObjectDetectionEvent(event);
    });
    
    // Gesture events
    this.gestureHandler?.on((event: GestureEvent) => {
      this.handleGestureEvent(event);
    });
  }
  
  /**
   * Setup main update loop
   */
  private setupUpdateLoop(): void {
    if (!this.script) {
      throw new Error('Script not initialized');
    }
    
    const updateEvent = this.script.createEvent('UpdateEvent');
    updateEvent.bind(() => {
      this.update();
    });
  }
  
  // ==========================================================================
  // System Control
  // ==========================================================================
  
  /**
   * Start the AR system
   */
  public start(): void {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }
    
    if (this.isRunning) {
      return;
    }
    
    console.log('[MarvinAR] Starting system...');
    
    // Start tracking
    this.objectTracker?.startTracking();
    this.gestureHandler?.startTracking();
    
    this.isRunning = true;
    console.log('[MarvinAR] System started');
  }
  
  /**
   * Stop the AR system
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    console.log('[MarvinAR] Stopping system...');
    
    // Stop tracking
    this.objectTracker?.stopTracking();
    this.gestureHandler?.stopTracking();
    
    this.isRunning = false;
    console.log('[MarvinAR] System stopped');
  }
  
  // ==========================================================================
  // Update Loop
  // ==========================================================================
  
  /**
   * Main update loop called every frame
   */
  private update(): void {
    if (!this.isRunning) {
      return;
    }
    
    try {
      // Update camera position for overlays
      this.updateCameraPosition();
      
      // Update environmental brightness for adaptive overlays
      this.updateEnvironmentalBrightness();
      
      // Update billboard rotations
      this.overlayManager?.updateBillboards();
      
      // Update gesture handler with tracked objects
      const trackedObjects = this.objectTracker?.getTrackedObjects() || [];
      this.gestureHandler?.updateTrackedObjects(trackedObjects);
      
      // Check for expired overlays
      this.overlayManager?.checkExpiredOverlays();
      
      // Cleanup old anchors periodically
      this.spatialAnchors?.cleanupOldAnchors();
      
      // Performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.checkPerformance();
      }
      
    } catch (error) {
      console.error('[MarvinAR] Error in update loop:', error);
    }
  }
  
  /**
   * Update camera position for billboard effect
   */
  private updateCameraPosition(): void {
    if (!this.deviceTracking || !this.overlayManager) {
      return;
    }
    
    const cameraPosition = this.deviceTracking.getPosition();
    this.overlayManager.updateCameraPosition(cameraPosition);
  }
  
  /**
   * Update environmental brightness for adaptive overlays
   */
  private updateEnvironmentalBrightness(): void {
    if (!this.sceneUnderstanding || !this.overlayManager) {
      return;
    }
    
    const lighting = this.sceneUnderstanding.getLighting();
    
    // Normalize brightness (0-1)
    // Assuming brightness is in lux, normalize to 0-1 range
    // Demo environment: 800 lux, so we'll use 1000 as max
    const normalizedBrightness = Math.min(1.0, lighting.brightness / 1000);
    
    this.overlayManager.updateEnvironmentalBrightness(normalizedBrightness);
  }
  
  // ==========================================================================
  // Event Handlers
  // ==========================================================================
  
  /**
   * Handle object detection event
   */
  private handleObjectDetectionEvent(event: ObjectDetectionEvent): void {
    console.log(`[MarvinAR] Object ${event.type}: ${event.object.name}`);
    
    switch (event.type) {
      case 'object_detected':
        this.onObjectDetected(event.object);
        break;
        
      case 'object_lost':
        this.onObjectLost(event.object);
        break;
        
      case 'object_updated':
        this.onObjectUpdated(event.object);
        break;
    }
  }
  
  /**
   * Handle new object detected
   */
  private onObjectDetected(object: DemoObject): void {
    // Create spatial anchor
    this.spatialAnchors?.createOrUpdateAnchor(object);
    
    // Create AR overlay for object
    this.createObjectOverlay(object);
    
    // TODO: Notify backend via RemoteService
  }
  
  /**
   * Handle object tracking lost
   */
  private onObjectLost(object: DemoObject): void {
    // Remove overlay
    this.overlayManager?.removeOverlay(`overlay_${object.id}`);
    
    // Keep spatial anchor for memory
  }
  
  /**
   * Handle object tracking updated
   */
  private onObjectUpdated(object: DemoObject): void {
    // Update spatial anchor
    this.spatialAnchors?.createOrUpdateAnchor(object);
    
    // Update overlay position
    this.overlayManager?.attachToPosition(
      `overlay_${object.id}`,
      object.spatialPosition
    );
  }
  
  /**
   * Handle gesture event
   */
  private handleGestureEvent(event: GestureEvent): void {
    console.log(`[MarvinAR] Gesture: ${event.type} (${event.handedness})`);
    
    if (event.targetObjectId) {
      const object = this.objectTracker?.getObjectById(event.targetObjectId);
      if (object) {
        this.onObjectInteraction(object, event);
      }
    }
  }
  
  /**
   * Handle object interaction via gesture
   */
  private onObjectInteraction(object: DemoObject, gesture: GestureEvent): void {
    console.log(`[MarvinAR] Interaction: ${gesture.type} with ${object.name}`);
    
    // Update last interaction time
    object.lastInteraction = Date.now();
    
    // Show interaction feedback overlay
    this.showInteractionFeedback(object, gesture);
    
    // TODO: Trigger AI processing via RemoteService
    // TODO: Request voice response via backend
  }
  
  // ==========================================================================
  // Overlay Management
  // ==========================================================================
  
  /**
   * Create AR overlay for detected object
   */
  private createObjectOverlay(object: DemoObject): void {
    if (!this.overlayManager) {
      return;
    }
    
    const config = DEMO_OBJECTS_CONFIG[object.type];
    
    this.overlayManager.createOverlay({
      id: `overlay_${object.id}`,
      type: 'text',
      position: new vec3(
        object.spatialPosition.x,
        object.spatialPosition.y + 0.2, // Slightly above object
        object.spatialPosition.z
      ),
      content: config.displayName,
      style: config.overlayStyle,
      billboard: true,
      visible: true,
      opacity: 1.0,
      attachedTo: object.id,
    });
  }
  
  /**
   * Show interaction feedback overlay
   */
  private showInteractionFeedback(object: DemoObject, gesture: GestureEvent): void {
    if (!this.overlayManager) {
      return;
    }
    
    const config = DEMO_OBJECTS_CONFIG[object.type];
    
    // Create temporary feedback overlay
    this.overlayManager.createOverlay({
      id: `feedback_${gesture.id}`,
      type: 'notification',
      position: gesture.position,
      content: `${gesture.type} detected`,
      style: config.overlayStyle,
      billboard: true,
      visible: true,
      opacity: 1.0,
      ttl: 2000, // Auto-remove after 2 seconds
    });
  }
  
  // ==========================================================================
  // Performance Monitoring
  // ==========================================================================
  
  /**
   * Check system performance
   */
  private checkPerformance(): void {
    const now = Date.now();
    
    if (now - this.lastPerformanceCheck < this.performanceCheckInterval) {
      return;
    }
    
    this.lastPerformanceCheck = now;
    
    // Get metrics from all components
    const metrics: PerformanceMetrics = {
      fps: this.calculateFPS(),
      detectionLatency: this.objectTracker?.getAverageDetectionLatency() || 0,
      renderLatency: this.overlayManager?.getAverageRenderLatency() || 0,
      gestureLatency: this.gestureHandler?.getAverageRecognitionLatency() || 0,
      trackedObjectCount: this.objectTracker?.getTrackedObjectCount() || 0,
      activeOverlayCount: this.overlayManager?.getOverlayCount() || 0,
      memoryUsage: 0, // TODO: Get actual memory usage
      timestamp: now,
    };
    
    // Check against thresholds
    this.validatePerformance(metrics);
    
    // Log metrics in debug mode
    if (this.config.logLevel === 'debug') {
      console.log('[MarvinAR] Performance:', metrics);
    }
  }
  
  /**
   * Calculate current FPS
   */
  private calculateFPS(): number {
    // TODO: Implement actual FPS calculation
    // For now, assume target 60fps
    return 60;
  }
  
  /**
   * Validate performance against thresholds
   */
  private validatePerformance(metrics: PerformanceMetrics): void {
    const thresholds = this.config.performance;
    
    // Check FPS (FR-063: 60fps requirement)
    if (metrics.fps < thresholds.minFps) {
      console.warn(`[MarvinAR] FPS ${metrics.fps} below threshold ${thresholds.minFps}`);
    }
    
    // Check detection latency (FR-005: <100ms)
    if (metrics.detectionLatency > thresholds.maxDetectionLatency) {
      console.warn(
        `[MarvinAR] Detection latency ${metrics.detectionLatency.toFixed(2)}ms ` +
        `exceeds ${thresholds.maxDetectionLatency}ms threshold`
      );
    }
    
    // Check render latency (FR-005: <100ms)
    if (metrics.renderLatency > thresholds.maxRenderLatency) {
      console.warn(
        `[MarvinAR] Render latency ${metrics.renderLatency.toFixed(2)}ms ` +
        `exceeds ${thresholds.maxRenderLatency}ms threshold`
      );
    }
  }
  
  // ==========================================================================
  // Public API
  // ==========================================================================
  
  /**
   * Get all tracked objects
   */
  public getTrackedObjects(): DemoObject[] {
    return this.objectTracker?.getTrackedObjects() || [];
  }
  
  /**
   * Get spatial memory for object
   */
  public getObjectLocation(objectId: string): vec3 | null {
    return this.spatialAnchors?.getLastKnownPosition(objectId) || null;
  }
  
  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return {
      fps: this.calculateFPS(),
      detectionLatency: this.objectTracker?.getAverageDetectionLatency() || 0,
      renderLatency: this.overlayManager?.getAverageRenderLatency() || 0,
      gestureLatency: this.gestureHandler?.getAverageRecognitionLatency() || 0,
      trackedObjectCount: this.objectTracker?.getTrackedObjectCount() || 0,
      activeOverlayCount: this.overlayManager?.getOverlayCount() || 0,
      memoryUsage: 0,
      timestamp: Date.now(),
    };
  }
  
  // ==========================================================================
  // Cleanup
  // ==========================================================================
  
  /**
   * Dispose and clean up all resources
   */
  public dispose(): void {
    console.log('[MarvinAR] Disposing system...');
    
    this.stop();
    
    this.objectTracker?.dispose();
    this.spatialAnchors?.dispose();
    this.overlayManager?.dispose();
    this.gestureHandler?.dispose();
    
    this.isInitialized = false;
    console.log('[MarvinAR] System disposed');
  }
}

/**
 * Create default AR configuration
 */
export function createDefaultConfig(): ARConfig {
  return {
    performance: {
      minFps: 60,
      maxDetectionLatency: 100,
      maxRenderLatency: 100,
      targetAccuracy: 0.95,
    },
    demoObjects: DEMO_OBJECTS_CONFIG,
    gestures: [],
    defaultOverlayStyle: {
      primaryColor: [0.53, 0.91, 0.72, 1.0],
      backgroundColor: [0.02, 0.03, 0.07, 0.8],
      fontSize: 24,
      animation: 'fade',
      animationDuration: 300,
    },
    enableSpatialMemory: true,
    enablePerformanceMonitoring: true,
    demoMode: false,
    logLevel: 'info',
  };
}

// Export for use in Lens Studio
export default MarvinARSystem;

