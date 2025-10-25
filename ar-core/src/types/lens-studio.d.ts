/**
 * TypeScript type definitions for Snap Lens Studio API
 * 
 * Based on Lens Studio 5.13+ API documentation
 * These types provide TypeScript support for Lens Studio's native APIs
 */

declare namespace LensStudio {
  // ============================================================================
  // Core Types
  // ============================================================================

  /** 3D Vector representation */
  export class vec3 {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    add(other: vec3): vec3;
    sub(other: vec3): vec3;
    scale(scalar: number): vec3;
    magnitude(): number;
    normalize(): vec3;
  }

  /** Quaternion for rotations */
  export class quat {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x: number, y: number, z: number, w: number);
    static fromEulerAngles(euler: vec3): quat;
  }

  /** 4x4 transformation matrix */
  export class mat4 {
    constructor();
    static compose(position: vec3, rotation: quat, scale: vec3): mat4;
    getTranslation(): vec3;
    getRotation(): quat;
  }

  // ============================================================================
  // Object Tracking
  // ============================================================================

  /** Object tracking component for real-time object recognition */
  export class ObjectTracking extends Component {
    /** Whether object tracking is currently active */
    isTracking: boolean;
    
    /** Confidence threshold for object detection (0-1) */
    confidenceThreshold: number;
    
    /** Maximum number of objects to track simultaneously */
    maxTrackedObjects: number;
    
    /** Get all currently tracked objects */
    getTrackedObjects(): TrackedObject[];
    
    /** Register callback when new object is detected */
    onObjectFound: (object: TrackedObject) => void;
    
    /** Register callback when object tracking is lost */
    onObjectLost: (objectId: string) => void;
    
    /** Register callback when object tracking is updated */
    onObjectUpdated: (object: TrackedObject) => void;
  }

  /** Represents a tracked object in the scene */
  export interface TrackedObject {
    /** Unique identifier for this tracked object */
    id: string;
    
    /** Classification label from ML model */
    classification: string;
    
    /** Detection confidence score (0-1) */
    confidence: number;
    
    /** World position of the object */
    position: vec3;
    
    /** Rotation of the object */
    rotation: quat;
    
    /** Bounding box dimensions */
    dimensions: vec3;
    
    /** Timestamp of last update */
    lastUpdated: number;
    
    /** Whether object is currently visible */
    isVisible: boolean;
  }

  // ============================================================================
  // Machine Learning
  // ============================================================================

  /** ML component for running machine learning models */
  export class MLComponent extends Component {
    /** Path to the ML model file */
    modelPath: string;
    
    /** Whether the model is currently loaded */
    isLoaded: boolean;
    
    /** Run inference on input data */
    run(input: MLInput): Promise<MLOutput>;
    
    /** Load the ML model */
    load(): Promise<void>;
    
    /** Unload the ML model to free resources */
    unload(): void;
  }

  /** Input data for ML inference */
  export interface MLInput {
    /** Image data for visual models */
    image?: Texture;
    
    /** Additional input tensors */
    tensors?: Float32Array[];
  }

  /** Output from ML inference */
  export interface MLOutput {
    /** Detected objects with labels and confidence */
    detections?: Array<{
      label: string;
      confidence: number;
      boundingBox: { x: number; y: number; width: number; height: number };
    }>;
    
    /** Raw output tensors */
    tensors?: Float32Array[];
  }

  // ============================================================================
  // Hand Tracking
  // ============================================================================

  /** Hand tracking component for gesture recognition */
  export class HandTracking extends Component {
    /** Whether hand tracking is active */
    isTracking: boolean;
    
    /** Get all currently tracked hands */
    getTrackedHands(): TrackedHand[];
    
    /** Register callback when hand is detected */
    onHandFound: (hand: TrackedHand) => void;
    
    /** Register callback when hand tracking is lost */
    onHandLost: (handId: string) => void;
    
    /** Register callback when hand pose updates */
    onHandUpdated: (hand: TrackedHand) => void;
  }

  /** Represents a tracked hand */
  export interface TrackedHand {
    /** Unique identifier */
    id: string;
    
    /** Which hand (left or right) */
    handedness: 'left' | 'right';
    
    /** Wrist position */
    wristPosition: vec3;
    
    /** Finger joint positions */
    joints: HandJoint[];
    
    /** Current gesture being performed */
    gesture?: HandGesture;
    
    /** Confidence of tracking */
    confidence: number;
  }

  /** Hand joint definition */
  export interface HandJoint {
    name: string;
    position: vec3;
    rotation: quat;
  }

  /** Recognized hand gesture */
  export type HandGesture = 
    | 'pinch'
    | 'point'
    | 'fist'
    | 'open_palm'
    | 'thumbs_up'
    | 'peace'
    | 'unknown';

  // ============================================================================
  // Device Tracking & Spatial Anchors
  // ============================================================================

  /** Device tracking for spatial positioning */
  export class DeviceTracking extends Component {
    /** Current device position in world space */
    getPosition(): vec3;
    
    /** Current device rotation */
    getRotation(): quat;
    
    /** Device transformation matrix */
    getTransform(): mat4;
    
    /** Whether tracking is active */
    isTracking: boolean;
  }

  /** Spatial anchor for persistent positioning */
  export class SpatialAnchor {
    /** Unique identifier */
    id: string;
    
    /** World position */
    position: vec3;
    
    /** Rotation */
    rotation: quat;
    
    /** Whether anchor is actively tracked */
    isTracked: boolean;
    
    /** Create new spatial anchor at position */
    static create(position: vec3, rotation: quat): SpatialAnchor;
    
    /** Remove this anchor */
    remove(): void;
  }

  // ============================================================================
  // Scene Understanding
  // ============================================================================

  /** Scene understanding for environment mapping */
  export class SceneUnderstanding extends Component {
    /** Get detected planes in the environment */
    getPlanes(): DetectedPlane[];
    
    /** Get environmental lighting information */
    getLighting(): EnvironmentLighting;
    
    /** Ray cast into the scene */
    raycast(origin: vec3, direction: vec3): RaycastHit | null;
  }

  /** Detected plane in the environment */
  export interface DetectedPlane {
    id: string;
    center: vec3;
    normal: vec3;
    dimensions: { width: number; height: number };
    type: 'horizontal' | 'vertical';
  }

  /** Environment lighting information */
  export interface EnvironmentLighting {
    brightness: number;
    colorTemperature: number;
    direction: vec3;
  }

  /** Result of a raycast */
  export interface RaycastHit {
    point: vec3;
    normal: vec3;
    distance: number;
  }

  // ============================================================================
  // Rendering Components
  // ============================================================================

  /** Visual component for rendering 3D meshes */
  export class RenderMeshVisual extends Component {
    /** Mesh to render */
    mesh: RenderMesh;
    
    /** Material for rendering */
    material: Material;
    
    /** Whether this visual is enabled */
    enabled: boolean;
  }

  /** 3D mesh data */
  export interface RenderMesh {
    vertices: Float32Array;
    indices: Uint16Array;
    normals?: Float32Array;
    uvs?: Float32Array;
  }

  /** Material for rendering */
  export interface Material {
    name: string;
    mainPass: Pass;
  }

  /** Rendering pass */
  export interface Pass {
    baseColor: vec4;
    opacity: number;
    blendMode: 'normal' | 'add' | 'multiply';
  }

  /** Text rendering component */
  export class Text extends Component {
    /** Text content to display */
    text: string;
    
    /** Font size */
    size: number;
    
    /** Text color */
    color: vec4;
    
    /** Font weight */
    weight: 'normal' | 'bold';
    
    /** Text alignment */
    alignment: 'left' | 'center' | 'right';
    
    /** Whether text is visible */
    enabled: boolean;
  }

  /** 4D vector (RGBA color or quaternion) */
  export class vec4 {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x: number, y: number, z: number, w: number);
  }

  // ============================================================================
  // Scene & Component System
  // ============================================================================

  /** Base component class */
  export class Component {
    /** Transform of the scene object this component is attached to */
    getTransform(): Transform;
    
    /** Scene object this component is attached to */
    getSceneObject(): SceneObject;
    
    /** Whether this component is enabled */
    enabled: boolean;
  }

  /** Transform component for positioning */
  export class Transform extends Component {
    /** Local position */
    localPosition: vec3;
    
    /** Local rotation */
    localRotation: quat;
    
    /** Local scale */
    localScale: vec3;
    
    /** World position */
    worldPosition: vec3;
    
    /** World rotation */
    worldRotation: quat;
    
    /** World transformation matrix */
    worldTransform: mat4;
  }

  /** Scene object that can have components */
  export class SceneObject {
    /** Name of the scene object */
    name: string;
    
    /** Whether object is enabled */
    enabled: boolean;
    
    /** Get component of specified type */
    getComponent<T extends Component>(type: new () => T): T | null;
    
    /** Get all components of specified type */
    getComponents<T extends Component>(type: new () => T): T[];
    
    /** Create new component on this object */
    createComponent<T extends Component>(type: new () => T): T;
  }

  // ============================================================================
  // Events
  // ============================================================================

  /** Update event fired every frame */
  export class UpdateEvent {
    /** Delta time since last frame (seconds) */
    getDeltaTime(): number;
    
    /** Bind callback to update event */
    bind(callback: () => void): void;
  }

  /** Late update event fired after all updates */
  export class LateUpdateEvent {
    getDeltaTime(): number;
    bind(callback: () => void): void;
  }

  // ============================================================================
  // Camera & Texture
  // ============================================================================

  /** Camera texture provider for accessing camera feed */
  export class CameraTextureProvider {
    /** Current camera texture */
    texture: Texture;
    
    /** Get current frame as texture */
    getCurrentFrame(): Texture;
  }

  /** Texture data */
  export interface Texture {
    width: number;
    height: number;
    getPixels(): Uint8Array;
  }

  // ============================================================================
  // Remote Service Module
  // ============================================================================

  /** Remote service for external API calls */
  export class RemoteServiceModule {
    /** Perform HTTP request */
    performHttpRequest(request: HttpRequest): Promise<HttpResponse>;
  }

  /** HTTP request configuration */
  export interface HttpRequest {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  }

  /** HTTP response */
  export interface HttpResponse {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  // ============================================================================
  // Global Script Interface
  // ============================================================================

  /** Global script object available in Lens Studio */
  export interface Script {
    /** Create new update event */
    createEvent(eventType: 'UpdateEvent'): UpdateEvent;
    
    /** Create new late update event */
    createEvent(eventType: 'LateUpdateEvent'): LateUpdateEvent;
  }
}

// Export for use in TypeScript files
export = LensStudio;
export as namespace LensStudio;

