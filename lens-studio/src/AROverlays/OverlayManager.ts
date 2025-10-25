/**
 * AR Overlay Manager
 * 
 * Manages creation, updating, and rendering of AR overlays in the scene.
 * Coordinates with Lens Studio rendering components to display contextual
 * information for detected objects.
 * 
 * Implements:
 * - FR-043 to FR-049: AR UI requirements
 * - FR-005: <100ms rendering latency
 * - Task 1.14: Create AR overlay system
 * - Task 1.15: Build responsive AR UI
 */

import {
  SceneObject,
  RenderMeshVisual,
  Text,
  vec3,
  vec4,
  quat,
  Transform,
} from '../types/lens-studio';
import {
  AROverlayProps,
  OverlayType,
  OverlayContent,
  OverlayStyle,
  ARError,
  ARErrorType,
  PerformanceMetrics,
} from '../types/core';

/**
 * Configuration for OverlayManager
 */
export interface OverlayManagerConfig {
  /** Parent scene object for all overlays */
  parentScene: SceneObject;
  
  /** Maximum number of simultaneous overlays */
  maxOverlays: number;
  
  /** Enable adaptive brightness based on environment */
  adaptiveBrightness: boolean;
  
  /** Enable billboard effect (face camera) */
  defaultBillboard: boolean;
  
  /** Default distance from camera for overlays */
  defaultDistance: number;
  
  /** Enable debug mode */
  debugMode: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Partial<OverlayManagerConfig> = {
  maxOverlays: 20,
  adaptiveBrightness: true,
  defaultBillboard: true,
  defaultDistance: 0.5, // 0.5 meters
  debugMode: false,
};

/**
 * Internal overlay representation
 */
interface ManagedOverlay {
  props: AROverlayProps;
  sceneObject: SceneObject;
  components: {
    transform: Transform;
    visual?: RenderMeshVisual;
    text?: Text;
  };
  createdAt: number;
  lastUpdated: number;
}

/**
 * OverlayManager handles AR overlay lifecycle
 * 
 * This class creates and manages AR overlays, ensuring they render
 * smoothly with <100ms latency and adapt to environmental conditions.
 */
export class OverlayManager {
  private readonly config: OverlayManagerConfig;
  
  // Active overlays mapped by ID
  private readonly overlays: Map<string, ManagedOverlay>;
  
  // Camera reference for billboard effect
  private cameraPosition?: vec3;
  
  // Environmental lighting for adaptive brightness
  private environmentalBrightness: number = 1.0;
  
  // Performance tracking
  private renderLatencies: number[] = [];
  
  /**
   * Create new OverlayManager
   */
  constructor(config: OverlayManagerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as OverlayManagerConfig;
    this.overlays = new Map();
    
    this.log('OverlayManager created');
  }
  
  // ==========================================================================
  // Overlay Creation
  // ==========================================================================
  
  /**
   * Create new AR overlay
   * 
   * @param props - Overlay properties
   * @returns Overlay ID
   * @throws {ARError} If overlay creation fails
   */
  public createOverlay(props: AROverlayProps): string {
    const startTime = performance.now();
    
    try {
      // Check max overlays limit
      if (this.overlays.size >= this.config.maxOverlays) {
        this.removeOldestOverlay();
      }
      
      // Create scene object for overlay
      const sceneObject = this.createSceneObject(props);
      
      // Create overlay components based on type
      const components = this.createOverlayComponents(sceneObject, props);
      
      // Apply styling
      this.applyOverlayStyle(components, props.style);
      
      // Store managed overlay
      const managedOverlay: ManagedOverlay = {
        props,
        sceneObject,
        components,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      
      this.overlays.set(props.id, managedOverlay);
      
      // Record performance (FR-005: <100ms requirement)
      const latency = performance.now() - startTime;
      this.recordRenderLatency(latency);
      
      if (latency > 100) {
        this.logWarn(`Overlay render latency ${latency.toFixed(2)}ms exceeds 100ms threshold`);
      }
      
      this.log(`Created overlay ${props.id} (type: ${props.type}, latency: ${latency.toFixed(2)}ms)`);
      
      return props.id;
      
    } catch (error) {
      const arError = new ARError(
        ARErrorType.OVERLAY_RENDER_FAILED,
        `Failed to create overlay ${props.id}`,
        { originalError: error, overlayId: props.id }
      );
      this.logError('Overlay creation failed', arError);
      throw arError;
    }
  }
  
  /**
   * Create scene object for overlay
   */
  private createSceneObject(props: AROverlayProps): SceneObject {
    const sceneObject = this.config.parentScene.createComponent(SceneObject as any);
    sceneObject.name = `overlay_${props.id}`;
    sceneObject.enabled = props.visible;
    
    return sceneObject;
  }
  
  /**
   * Create overlay components based on type
   */
  private createOverlayComponents(
    sceneObject: SceneObject,
    props: AROverlayProps
  ): ManagedOverlay['components'] {
    const transform = sceneObject.getComponent(Transform)!;
    
    // Set position and rotation
    transform.worldPosition = props.position;
    if (props.rotation) {
      transform.worldRotation = props.rotation;
    }
    
    const components: ManagedOverlay['components'] = { transform };
    
    // Create type-specific components
    switch (props.type) {
      case 'text':
      case 'notification':
        components.text = this.createTextComponent(sceneObject, props);
        break;
        
      case 'panel':
      case 'icon':
      case 'progress':
        components.visual = this.createVisualComponent(sceneObject, props);
        if (props.type === 'panel' && typeof props.content !== 'string') {
          // Panel can have text + visual
          components.text = this.createTextComponent(sceneObject, props);
        }
        break;
        
      case 'arrow':
        components.visual = this.createArrowComponent(sceneObject, props);
        break;
    }
    
    return components;
  }
  
  /**
   * Create text component
   */
  private createTextComponent(sceneObject: SceneObject, props: AROverlayProps): Text {
    const text = sceneObject.createComponent(Text as any);
    
    // Set text content
    if (typeof props.content === 'string') {
      text.text = props.content;
    } else {
      const content = props.content as OverlayContent;
      text.text = content.title || content.subtitle || '';
    }
    
    // Set size and alignment
    text.size = props.style.fontSize;
    text.alignment = 'center';
    text.weight = 'normal';
    
    return text;
  }
  
  /**
   * Create visual component (mesh)
   */
  private createVisualComponent(sceneObject: SceneObject, props: AROverlayProps): RenderMeshVisual {
    const visual = sceneObject.createComponent(RenderMeshVisual as any);
    
    // Create appropriate mesh based on overlay type
    switch (props.type) {
      case 'panel':
        visual.mesh = this.createPanelMesh();
        break;
      case 'icon':
        visual.mesh = this.createIconMesh(props.style.icon);
        break;
      case 'progress':
        visual.mesh = this.createProgressBarMesh(props);
        break;
    }
    
    return visual;
  }
  
  /**
   * Create arrow component for navigation
   */
  private createArrowComponent(sceneObject: SceneObject, props: AROverlayProps): RenderMeshVisual {
    const visual = sceneObject.createComponent(RenderMeshVisual as any);
    visual.mesh = this.createArrowMesh();
    return visual;
  }
  
  // ==========================================================================
  // Overlay Updates
  // ==========================================================================
  
  /**
   * Update existing overlay
   */
  public updateOverlay(id: string, updates: Partial<AROverlayProps>): void {
    const overlay = this.overlays.get(id);
    
    if (!overlay) {
      this.logWarn(`Overlay ${id} not found for update`);
      return;
    }
    
    // Merge updates
    overlay.props = { ...overlay.props, ...updates };
    overlay.lastUpdated = Date.now();
    
    // Update position
    if (updates.position) {
      overlay.components.transform.worldPosition = updates.position;
    }
    
    // Update rotation
    if (updates.rotation) {
      overlay.components.transform.worldRotation = updates.rotation;
    }
    
    // Update visibility
    if (updates.visible !== undefined) {
      overlay.sceneObject.enabled = updates.visible;
    }
    
    // Update content
    if (updates.content && overlay.components.text) {
      if (typeof updates.content === 'string') {
        overlay.components.text.text = updates.content;
      } else {
        const content = updates.content as OverlayContent;
        overlay.components.text.text = content.title || content.subtitle || '';
      }
    }
    
    // Update style
    if (updates.style) {
      this.applyOverlayStyle(overlay.components, updates.style);
    }
    
    this.log(`Updated overlay ${id}`);
  }
  
  /**
   * Update overlay position to follow object
   */
  public attachToPosition(id: string, position: vec3): void {
    const overlay = this.overlays.get(id);
    
    if (!overlay) {
      return;
    }
    
    overlay.components.transform.worldPosition = position;
  }
  
  // ==========================================================================
  // Overlay Removal
  // ==========================================================================
  
  /**
   * Remove overlay
   */
  public removeOverlay(id: string): void {
    const overlay = this.overlays.get(id);
    
    if (!overlay) {
      return;
    }
    
    // Disable scene object (Lens Studio will clean up)
    overlay.sceneObject.enabled = false;
    
    // Remove from map
    this.overlays.delete(id);
    
    this.log(`Removed overlay ${id}`);
  }
  
  /**
   * Remove oldest overlay (for max overlays limit)
   */
  private removeOldestOverlay(): void {
    let oldestId: string | null = null;
    let oldestTime = Infinity;
    
    for (const [id, overlay] of this.overlays.entries()) {
      if (overlay.createdAt < oldestTime) {
        oldestTime = overlay.createdAt;
        oldestId = id;
      }
    }
    
    if (oldestId) {
      this.removeOverlay(oldestId);
    }
  }
  
  /**
   * Remove all overlays
   */
  public removeAllOverlays(): void {
    const ids = Array.from(this.overlays.keys());
    for (const id of ids) {
      this.removeOverlay(id);
    }
    this.log('Removed all overlays');
  }
  
  // ==========================================================================
  // Auto-Removal (TTL)
  // ==========================================================================
  
  /**
   * Check and remove expired overlays (based on TTL)
   * Should be called periodically (e.g., in update loop)
   */
  public checkExpiredOverlays(): void {
    const now = Date.now();
    const toRemove: string[] = [];
    
    for (const [id, overlay] of this.overlays.entries()) {
      if (overlay.props.ttl) {
        const age = now - overlay.createdAt;
        if (age > overlay.props.ttl) {
          toRemove.push(id);
        }
      }
    }
    
    for (const id of toRemove) {
      this.removeOverlay(id);
      this.log(`Removed expired overlay ${id}`);
    }
  }
  
  // ==========================================================================
  // Styling & Appearance
  // ==========================================================================
  
  /**
   * Apply visual style to overlay components
   */
  private applyOverlayStyle(
    components: ManagedOverlay['components'],
    style: OverlayStyle
  ): void {
    // Apply text color
    if (components.text) {
      const [r, g, b, a] = style.primaryColor;
      components.text.color = new vec4(r, g, b, a * this.getAdaptedOpacity());
      components.text.size = style.fontSize;
    }
    
    // Apply visual colors
    if (components.visual && components.visual.material) {
      const [r, g, b, a] = style.backgroundColor;
      components.visual.material.mainPass.baseColor = new vec4(
        r, g, b, a * this.getAdaptedOpacity()
      );
    }
    
    // TODO: Apply animations based on style.animation
  }
  
  /**
   * Get adapted opacity based on environmental brightness
   * FR-048: Adaptive brightness
   */
  private getAdaptedOpacity(): number {
    if (!this.config.adaptiveBrightness) {
      return 1.0;
    }
    
    // Increase opacity in bright environments, decrease in dark
    // environmentalBrightness: 0 (dark) to 1 (bright)
    // Output: 0.7 to 1.0
    return 0.7 + (this.environmentalBrightness * 0.3);
  }
  
  /**
   * Update environmental brightness for adaptive overlays
   */
  public updateEnvironmentalBrightness(brightness: number): void {
    this.environmentalBrightness = Math.max(0, Math.min(1, brightness));
    
    // Re-apply styles to all overlays
    for (const overlay of this.overlays.values()) {
      this.applyOverlayStyle(overlay.components, overlay.props.style);
    }
  }
  
  // ==========================================================================
  // Billboard Effect (Face Camera)
  // ==========================================================================
  
  /**
   * Update camera position for billboard effect
   */
  public updateCameraPosition(position: vec3): void {
    this.cameraPosition = position;
  }
  
  /**
   * Apply billboard effect to all overlays
   * Should be called in update loop
   */
  public updateBillboards(): void {
    if (!this.cameraPosition) {
      return;
    }
    
    for (const overlay of this.overlays.values()) {
      if (overlay.props.billboard) {
        this.applyBillboardRotation(overlay);
      }
    }
  }
  
  /**
   * Apply billboard rotation to make overlay face camera
   */
  private applyBillboardRotation(overlay: ManagedOverlay): void {
    if (!this.cameraPosition) {
      return;
    }
    
    const overlayPos = overlay.components.transform.worldPosition;
    const cameraPos = this.cameraPosition;
    
    // Calculate look-at direction
    const direction = new vec3(
      cameraPos.x - overlayPos.x,
      cameraPos.y - overlayPos.y,
      cameraPos.z - overlayPos.z
    );
    
    // Convert to rotation (simplified - production would use proper look-at)
    const rotation = this.calculateLookAtRotation(direction);
    overlay.components.transform.worldRotation = rotation;
  }
  
  /**
   * Calculate rotation to look at direction
   * Simplified implementation - production would use proper quaternion math
   */
  private calculateLookAtRotation(direction: vec3): quat {
    // Normalize direction
    const normalized = direction.normalize();
    
    // Calculate yaw (rotation around Y axis)
    const yaw = Math.atan2(normalized.x, normalized.z);
    
    // Calculate pitch (rotation around X axis)
    const pitch = Math.asin(-normalized.y);
    
    // Convert to quaternion (simplified)
    return quat.fromEulerAngles(new vec3(pitch, yaw, 0));
  }
  
  // ==========================================================================
  // Mesh Creation Helpers
  // ==========================================================================
  
  /**
   * Create panel mesh (rounded rectangle)
   */
  private createPanelMesh(): any {
    // TODO: Create actual mesh with vertices/indices
    // For now, return placeholder
    return {
      vertices: new Float32Array([]),
      indices: new Uint16Array([]),
    };
  }
  
  /**
   * Create icon mesh
   */
  private createIconMesh(icon?: string): any {
    // TODO: Load icon mesh from assets
    return {
      vertices: new Float32Array([]),
      indices: new Uint16Array([]),
    };
  }
  
  /**
   * Create progress bar mesh
   */
  private createProgressBarMesh(props: AROverlayProps): any {
    const progress = typeof props.content !== 'string' 
      ? (props.content as OverlayContent).progress || 0
      : 0;
    
    // TODO: Create progress bar mesh based on progress value
    return {
      vertices: new Float32Array([]),
      indices: new Uint16Array([]),
    };
  }
  
  /**
   * Create arrow mesh for navigation
   */
  private createArrowMesh(): any {
    // TODO: Create arrow mesh pointing forward
    return {
      vertices: new Float32Array([]),
      indices: new Uint16Array([]),
    };
  }
  
  // ==========================================================================
  // Querying
  // ==========================================================================
  
  /**
   * Get overlay by ID
   */
  public getOverlay(id: string): AROverlayProps | undefined {
    return this.overlays.get(id)?.props;
  }
  
  /**
   * Get all active overlays
   */
  public getAllOverlays(): AROverlayProps[] {
    return Array.from(this.overlays.values()).map(o => o.props);
  }
  
  /**
   * Get overlay count
   */
  public getOverlayCount(): number {
    return this.overlays.size;
  }
  
  /**
   * Check if overlay exists
   */
  public hasOverlay(id: string): boolean {
    return this.overlays.has(id);
  }
  
  // ==========================================================================
  // Performance Monitoring
  // ==========================================================================
  
  /**
   * Record render latency
   */
  private recordRenderLatency(latency: number): void {
    this.renderLatencies.push(latency);
    
    // Keep last 100 measurements
    if (this.renderLatencies.length > 100) {
      this.renderLatencies.shift();
    }
  }
  
  /**
   * Get average render latency
   */
  public getAverageRenderLatency(): number {
    if (this.renderLatencies.length === 0) {
      return 0;
    }
    
    const sum = this.renderLatencies.reduce((a, b) => a + b, 0);
    return sum / this.renderLatencies.length;
  }
  
  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): Partial<PerformanceMetrics> {
    return {
      renderLatency: this.getAverageRenderLatency(),
      activeOverlayCount: this.getOverlayCount(),
      timestamp: Date.now(),
    };
  }
  
  // ==========================================================================
  // Cleanup
  // ==========================================================================
  
  /**
   * Dispose and clean up
   */
  public dispose(): void {
    this.log('Disposing OverlayManager');
    this.removeAllOverlays();
  }
  
  // ==========================================================================
  // Logging
  // ==========================================================================
  
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debugMode) {
      console.log(`[OverlayManager] ${message}`, ...args);
    }
  }
  
  private logWarn(message: string, ...args: unknown[]): void {
    console.warn(`[OverlayManager] ${message}`, ...args);
  }
  
  private logError(message: string, error: unknown): void {
    console.error(`[OverlayManager] ${message}`, error);
  }
}

/**
 * Factory function to create OverlayManager
 */
export function createOverlayManager(
  config: OverlayManagerConfig
): OverlayManager {
  return new OverlayManager(config);
}

