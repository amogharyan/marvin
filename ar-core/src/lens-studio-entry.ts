/**
 * Lens Studio Entry Point
 *
 * This file creates the bridge between Lens Studio's component system
 * and the MarvinARSystem TypeScript code.
 *
 * USAGE IN LENS STUDIO:
 * 1. Import this script (after building)
 * 2. Add as Script component to a Scene Object
 * 3. Wire up all the input components in Inspector
 * 4. The system will auto-start on scene load
 */

import { MarvinARSystem, createDefaultConfig } from './main';
import {
  Script,
  SceneObject,
  ObjectTracking,
  MLComponent,
  HandTracking,
  DeviceTracking,
  SceneUnderstanding,
  CameraTextureProvider,
  RemoteServiceModule,
} from './types/lens-studio';

// Declare inputs that will appear in Lens Studio Inspector
// @input SceneObject sceneRoot
// @input Component.ObjectTracking objectTracking
// @input Component.MLComponent mlComponent
// @input Component.HandTracking handTracking
// @input Component.DeviceTracking deviceTracking
// @input Component.SceneUnderstanding sceneUnderstanding {"optional": true}
// @input Component.Camera camera
// @input Component.RemoteServiceModule remoteService {"optional": true}

// Get the script instance
const script = script as Script;

// Access inputs (Lens Studio will populate these)
declare const sceneRoot: SceneObject;
declare const objectTracking: ObjectTracking;
declare const mlComponent: MLComponent;
declare const handTracking: HandTracking;
declare const deviceTracking: DeviceTracking;
declare const sceneUnderstanding: SceneUnderstanding;
declare const camera: any; // Camera component
declare const remoteService: RemoteServiceModule;

// Create the AR system
let arSystem: MarvinARSystem;

/**
 * Initialize and start the AR system
 */
async function initializeSystem() {
  try {
    print('[LensStudioEntry] Initializing Marvin AR System...');

    // Validate required inputs
    if (!sceneRoot) {
      throw new Error('sceneRoot is required');
    }
    if (!objectTracking) {
      throw new Error('objectTracking is required');
    }
    if (!mlComponent) {
      throw new Error('mlComponent is required');
    }
    if (!handTracking) {
      throw new Error('handTracking is required');
    }
    if (!deviceTracking) {
      throw new Error('deviceTracking is required');
    }
    if (!camera) {
      throw new Error('camera is required');
    }

    // Get camera texture provider
    const cameraProvider = camera.getComponent('Component.Camera') as CameraTextureProvider;

    // Create config
    const config = createDefaultConfig();
    config.logLevel = 'debug'; // Enable debug logging for development

    // Create AR system instance
    arSystem = new MarvinARSystem(config);

    // Initialize with all components
    await arSystem.initialize(
      script,
      sceneRoot,
      objectTracking,
      mlComponent,
      handTracking,
      deviceTracking,
      sceneUnderstanding, // Optional, may be undefined
      cameraProvider,
      remoteService // Optional, may be undefined
    );

    // Start the system
    arSystem.start();

    print('[LensStudioEntry] Marvin AR System started successfully!');

  } catch (error) {
    print('[LensStudioEntry] Failed to initialize: ' + error.message);
    print('[LensStudioEntry] Stack: ' + error.stack);
  }
}

/**
 * Scene Load Event - Initialize when scene loads
 */
const sceneLoadEvent = script.createEvent('SceneEvent.OnStart');
sceneLoadEvent.bind(() => {
  print('[LensStudioEntry] Scene loaded, initializing...');
  initializeSystem();
});

/**
 * Handle scene destruction
 */
const sceneUnloadEvent = script.createEvent('SceneEvent.OnDestroy');
sceneUnloadEvent.bind(() => {
  print('[LensStudioEntry] Scene unloading, cleaning up...');
  if (arSystem) {
    arSystem.dispose();
  }
});

/**
 * Export for debugging
 */
(global as any).marvinAR = {
  getSystem: () => arSystem,
  getTrackedObjects: () => arSystem?.getTrackedObjects() || [],
  getPerformance: () => arSystem?.getPerformanceMetrics(),
};
