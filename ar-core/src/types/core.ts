/**
 * Core type definitions for Marvin AR Assistant
 * 
 * These types define the core data structures used throughout the AR system
 * for object detection, tracking, and user interaction.
 */

import { vec3, quat } from './lens-studio';

// ============================================================================
// Demo Object Types
// ============================================================================

/**
 * Unique identifier for each demo object type
 */
export type DemoObjectType = 
  | 'medicine_bottle'
  | 'breakfast_bowl'
  | 'laptop'
  | 'keys'
  | 'phone';

/**
 * Represents a detected and tracked object in the AR environment
 * Based on PRD Appendix A specification
 */
export interface DemoObject {
  /** Unique identifier for this object instance */
  id: string;
  
  /** Type of demo object */
  type: DemoObjectType;
  
  /** Human-readable name */
  name: string;
  
  /** Detection confidence score (0-1) */
  detectionConfidence: number;
  
  /** Current 3D position in world space */
  spatialPosition: vec3;
  
  /** Current rotation */
  rotation: quat;
  
  /** Timestamp of last interaction (milliseconds since epoch) */
  lastInteraction: number;
  
  /** Timestamp when object was first detected */
  firstDetected: number;
  
  /** List of available actions for this object */
  associatedActions: string[];
  
  /** Whether object is currently visible to camera */
  isVisible: boolean;
  
  /** Spatial anchor ID for persistent tracking */
  anchorId?: string;
  
  /** Additional metadata specific to object type */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for a demo object type
 * Defines behavior and AI context for each object
 */
export interface DemoObjectConfig {
  /** Object type identifier */
  type: DemoObjectType;
  
  /** Display name */
  displayName: string;
  
  /** ML model labels that map to this object */
  mlLabels: string[];
  
  /** Minimum confidence threshold for detection (0-1) */
  confidenceThreshold: number;
  
  /** Actions triggered when object is detected */
  triggers: string[];
  
  /** AI context prompt for this object */
  aiContext: string;
  
  /** Voice prompts available for this object */
  voicePrompts: string[];
  
  /** Visual styling for AR overlays */
  overlayStyle: OverlayStyle;
  
  /** Whether to track spatial position persistently */
  enableSpatialMemory: boolean;
}

// ============================================================================
// AR Overlay Types
// ============================================================================

/**
 * Type of AR overlay to render
 */
export type OverlayType = 
  | 'text'
  | 'panel'
  | 'arrow'
  | 'icon'
  | 'progress'
  | 'notification';

/**
 * Visual styling for AR overlays
 */
export interface OverlayStyle {
  /** Primary color (RGBA) */
  primaryColor: [number, number, number, number];
  
  /** Background color (RGBA) */
  backgroundColor: [number, number, number, number];
  
  /** Font size for text overlays */
  fontSize: number;
  
  /** Icon identifier if applicable */
  icon?: string;
  
  /** Animation style */
  animation?: 'fade' | 'slide' | 'pulse' | 'none';
  
  /** Duration of animation in milliseconds */
  animationDuration?: number;
}

/**
 * Properties for rendering an AR overlay
 */
export interface AROverlayProps {
  /** Unique identifier */
  id: string;
  
  /** Type of overlay */
  type: OverlayType;
  
  /** Position in world space */
  position: vec3;
  
  /** Rotation */
  rotation?: quat;
  
  /** Content to display */
  content: string | OverlayContent;
  
  /** Visual styling */
  style: OverlayStyle;
  
  /** Whether overlay should face camera */
  billboard: boolean;
  
  /** Distance from camera to render overlay */
  distance?: number;
  
  /** Whether overlay is currently visible */
  visible: boolean;
  
  /** Opacity (0-1) */
  opacity: number;
  
  /** Object this overlay is attached to */
  attachedTo?: string;
  
  /** Time-to-live in milliseconds (auto-remove after) */
  ttl?: number;
}

/**
 * Rich content for overlays
 */
export interface OverlayContent {
  /** Main text */
  title?: string;
  
  /** Subtitle or description */
  subtitle?: string;
  
  /** Icon name */
  icon?: string;
  
  /** Progress value (0-1) for progress bars */
  progress?: number;
  
  /** Additional data */
  data?: Record<string, unknown>;
}

// ============================================================================
// Gesture Types
// ============================================================================

/**
 * Recognized gesture types
 */
export type GestureType =
  | 'reach'
  | 'touch'
  | 'grab'
  | 'pinch'
  | 'point'
  | 'wave'
  | 'swipe';

/**
 * Gesture recognition event
 */
export interface GestureEvent {
  /** Unique identifier */
  id: string;
  
  /** Type of gesture */
  type: GestureType;
  
  /** Hand performing gesture */
  handedness: 'left' | 'right';
  
  /** Position where gesture occurred */
  position: vec3;
  
  /** Direction vector for directional gestures */
  direction?: vec3;
  
  /** Confidence of recognition (0-1) */
  confidence: number;
  
  /** Timestamp */
  timestamp: number;
  
  /** Object being interacted with (if any) */
  targetObjectId?: string;
}

/**
 * Gesture recognition configuration
 */
export interface GestureConfig {
  /** Gesture type to recognize */
  type: GestureType;
  
  /** Minimum confidence threshold */
  confidenceThreshold: number;
  
  /** Whether this gesture is enabled */
  enabled: boolean;
  
  /** Callback when gesture is detected */
  onDetected?: (event: GestureEvent) => void;
}

// ============================================================================
// Spatial Tracking Types
// ============================================================================

/**
 * Spatial anchor for persistent object positioning
 */
export interface SpatialAnchorData {
  /** Unique identifier */
  id: string;
  
  /** Associated object ID */
  objectId: string;
  
  /** World position */
  position: vec3;
  
  /** Rotation */
  rotation: quat;
  
  /** Whether anchor is currently tracked */
  isTracked: boolean;
  
  /** Timestamp of last update */
  lastUpdated: number;
  
  /** Confidence of tracking (0-1) */
  trackingConfidence: number;
}

/**
 * Spatial memory record for object location
 */
export interface SpatialMemory {
  /** Object ID */
  objectId: string;
  
  /** Object type */
  objectType: DemoObjectType;
  
  /** Last known position */
  lastKnownPosition: vec3;
  
  /** History of positions */
  positionHistory: Array<{
    position: vec3;
    timestamp: number;
  }>;
  
  /** Typical location (learned) */
  typicalLocation?: vec3;
  
  /** Confidence in typical location (0-1) */
  locationConfidence?: number;
}

// ============================================================================
// Performance Metrics Types
// ============================================================================

/**
 * Performance metrics for monitoring system health
 */
export interface PerformanceMetrics {
  /** Frames per second */
  fps: number;
  
  /** Object detection latency (ms) */
  detectionLatency: number;
  
  /** AR overlay render time (ms) */
  renderLatency: number;
  
  /** Gesture recognition latency (ms) */
  gestureLatency: number;
  
  /** Number of tracked objects */
  trackedObjectCount: number;
  
  /** Number of active overlays */
  activeOverlayCount: number;
  
  /** Memory usage (MB) */
  memoryUsage: number;
  
  /** Timestamp of measurement */
  timestamp: number;
}

/**
 * Performance requirements and thresholds
 */
export interface PerformanceThresholds {
  /** Minimum acceptable FPS */
  minFps: number;
  
  /** Maximum acceptable detection latency (ms) */
  maxDetectionLatency: number;
  
  /** Maximum acceptable render latency (ms) */
  maxRenderLatency: number;
  
  /** Target object detection accuracy (0-1) */
  targetAccuracy: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * AR system error types
 */
export enum ARErrorType {
  OBJECT_DETECTION_FAILED = 'OBJECT_DETECTION_FAILED',
  SPATIAL_TRACKING_LOST = 'SPATIAL_TRACKING_LOST',
  GESTURE_RECOGNITION_FAILED = 'GESTURE_RECOGNITION_FAILED',
  OVERLAY_RENDER_FAILED = 'OVERLAY_RENDER_FAILED',
  ML_MODEL_LOAD_FAILED = 'ML_MODEL_LOAD_FAILED',
  CAMERA_ACCESS_DENIED = 'CAMERA_ACCESS_DENIED',
  PERFORMANCE_DEGRADED = 'PERFORMANCE_DEGRADED',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * Structured error for AR system
 */
export class ARError extends Error {
  constructor(
    public readonly type: ARErrorType,
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ARError';
    Object.setPrototypeOf(this, ARError.prototype);
  }
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Overall AR system configuration
 */
export interface ARConfig {
  /** Performance thresholds */
  performance: PerformanceThresholds;
  
  /** Demo object configurations */
  demoObjects: Record<DemoObjectType, DemoObjectConfig>;
  
  /** Gesture configurations */
  gestures: GestureConfig[];
  
  /** Overlay default styles */
  defaultOverlayStyle: OverlayStyle;
  
  /** Whether to enable spatial memory */
  enableSpatialMemory: boolean;
  
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  
  /** Demo mode flag */
  demoMode: boolean;
  
  /** Logging level */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Object detection event
 */
export interface ObjectDetectionEvent {
  type: 'object_detected' | 'object_lost' | 'object_updated';
  object: DemoObject;
  timestamp: number;
}

/**
 * System event types
 */
export type SystemEvent =
  | ObjectDetectionEvent
  | GestureEvent
  | { type: 'performance_warning'; metrics: PerformanceMetrics }
  | { type: 'error'; error: ARError }
  | { type: 'initialized' }
  | { type: 'shutdown' };

/**
 * Event callback type
 */
export type EventCallback<T extends SystemEvent = SystemEvent> = (event: T) => void;

