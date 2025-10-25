# Snap Spectacles API Reference
**Last Updated:** October 25, 2025  
**Source:** https://developers.snap.com/lens-studio

## Overview

This document provides a comprehensive reference for building AR experiences on Snap Spectacles using Lens Studio. All code examples are TypeScript-based and follow official Snap API patterns.

---

## Table of Contents

1. [Remote Service Module & API Integration](#remote-service-module--api-integration)
2. [Fetch API & Internet Module](#fetch-api--internet-module)
3. [Remote Service Gateway](#remote-service-gateway)
4. [Object Detection & Tracking](#object-detection--tracking)
5. [AR Rendering & Components](#ar-rendering--components)
6. [Camera Providers](#camera-providers)
7. [Scene Management](#scene-management)
8. [Collision Detection](#collision-detection)
9. [Best Practices](#best-practices)

---

## Remote Service Module & API Integration

### Overview
The Remote Service Module provides access to external APIs and internet connectivity for Spectacles. Available from Lens Studio v4.0+.

### Basic API Request

```typescript
// Asset type for remote services
Asset.RemoteServiceModule

// Create and perform API request
const req = RemoteApiRequest.create();
req.endpoint = 'ENDPOINT_NAME';

script.remoteServiceModule.performApiRequest(req, function (response) {
  handleAPIResponse(response);
});
```

### TypeScript Implementation

```typescript
@component
export class RemoteAPIHandler extends BaseScriptComponent {
  @input
  remoteServiceModule: Asset.RemoteServiceModule;
  
  async performRequest(endpoint: string): Promise<RemoteApiResponse> {
    return new Promise((resolve, reject) => {
      const req = RemoteApiRequest.create();
      req.endpoint = endpoint;
      
      this.remoteServiceModule.performApiRequest(req, (response) => {
        if (response.statusCode === 200) {
          resolve(response);
        } else {
          reject(new Error(`API request failed: ${response.statusCode}`));
        }
      });
    });
  }
}
```

### Request/Response Types

```typescript
interface RemoteApiRequest {
  endpoint: string;
  method?: HttpRequestMethod;
  headers?: Record<string, string>;
  body?: string;
}

interface RemoteApiResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  linkedResource?: LinkedResource;
}

interface LinkedResource {
  // Resource metadata
  url: string;
  type: string;
}
```

### HTTP Methods

```typescript
enum HttpRequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

// Usage
const request = new RemoteServiceHttpRequest({
  url: 'https://api.example.com/data',
  method: HttpRequestMethod.GET
});
```

---

## Fetch API & Internet Module

### Overview
The Internet Module provides Fetch API-compatible HTTP requests for external service integration.

### Fetch Image to Texture Example

```typescript
@component
export class FetchImageToTexture extends BaseScriptComponent {
  @input
  internetModule: InternetModule;

  @input
  renderMeshVisual: RenderMeshVisual;

  async onAwake() {
    const request = new Request(
      'https://developers.snap.com/img/spectacles/spectacles-2024-hero.png',
      { method: 'GET' }
    );
    
    const response = await this.internetModule.fetch(request);
    print('Response status: ' + response.status);
    
    if (response.status === 200) {
      const bytes = await response.bytes();
      const base64 = Base64.encode(bytes);
      const texture = await this.decodeBase64ToTexture(base64);
      this.displayTexture(texture);
    }
  }

  decodeBase64ToTexture(base64: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      Base64.decodeTextureAsync(base64, resolve, reject);
    });
  }

  displayTexture(texture: Texture) {
    if (this.renderMeshVisual) {
      this.renderMeshVisual.mainMaterial.mainPass.baseTex = texture;
    }
  }
}
```

### Fetch API for External Services

```typescript
@component
export class ExternalAPIClient extends BaseScriptComponent {
  @input
  internetModule: InternetModule;
  
  async callExternalAPI(url: string, data: any): Promise<any> {
    try {
      const request = new Request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN'
        },
        body: JSON.stringify(data)
      });
      
      const response = await this.internetModule.fetch(request);
      
      if (response.status === 200) {
        const text = await response.text();
        return JSON.parse(text);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      print(`Fetch error: ${error.message}`);
      throw error;
    }
  }
}
```

### Use Cases for Fetch API

**✅ ElevenLabs Voice Synthesis**
```typescript
const response = await this.internetModule.fetch(
  new Request('https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID', {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: 'Hello from Spectacles',
      model_id: 'eleven_multilingual_v2'
    })
  })
);
```

**✅ Chroma Vector Database**
```typescript
const response = await this.internetModule.fetch(
  new Request('https://your-chroma-server.com/api/v1/collections/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query_embeddings: [embedding],
      n_results: 5
    })
  })
);
```

---

## Remote Service Gateway

### Overview
The Remote Service Gateway provides secure token-based authentication for external API calls.

### Token Generation

1. Open Lens Studio
2. Navigate to: `Windows` → `Remote Service Gateway Token`
3. Click `Generate Token`
4. Copy the token for use in your API calls

### Token Revocation

To revoke a token:
1. `Windows` → `Remote Service Gateway Token`
2. Click `Revoke Token`

### Using Tokens

```typescript
@component
export class SecureAPIClient extends BaseScriptComponent {
  @input
  remoteServiceModule: Asset.RemoteServiceModule;
  
  @input
  gatewayToken: string;
  
  async authenticatedRequest(endpoint: string): Promise<any> {
    const req = RemoteApiRequest.create();
    req.endpoint = endpoint;
    req.headers = {
      'Authorization': `Bearer ${this.gatewayToken}`
    };
    
    return new Promise((resolve, reject) => {
      this.remoteServiceModule.performApiRequest(req, (response) => {
        if (response.statusCode === 200) {
          resolve(JSON.parse(response.body));
        } else {
          reject(new Error(`Auth failed: ${response.statusCode}`));
        }
      });
    });
  }
}
```

---

## Object Detection & Tracking

### Object Tracking Component

```typescript
@component
export class ObjectDetector extends BaseScriptComponent {
  @input
  objectTracking: ObjectTracking3D;
  
  @input
  mlComponent: MachineLearning.MLComponent;
  
  private trackedObjects: Map<string, TrackedObject> = new Map();
  
  onAwake() {
    this.setupObjectTracking();
  }
  
  private setupObjectTracking() {
    const tracker = this.objectTracking.createTracker();
    
    tracker.onTrackerUpdate.add((args) => {
      this.processDetection(args);
    });
  }
  
  private processDetection(detection: TrackerUpdateArgs): void {
    if (detection.confidence > 0.7) {
      const obj: TrackedObject = {
        id: detection.id,
        label: detection.label,
        confidence: detection.confidence,
        position: detection.transform.getWorldPosition(),
        timestamp: getTime()
      };
      
      this.trackedObjects.set(obj.id, obj);
      this.onObjectDetected(obj);
    }
  }
  
  private onObjectDetected(obj: TrackedObject): void {
    print(`Object detected: ${obj.label} (${obj.confidence})`);
  }
}

interface TrackedObject {
  id: string;
  label: string;
  confidence: number;
  position: vec3;
  timestamp: number;
}
```

---

## AR Rendering & Components

### Render Mesh Visual

```typescript
@component
export class AROverlayRenderer extends BaseScriptComponent {
  @input
  renderMeshVisual: RenderMeshVisual;
  
  @input
  textComponent: Text;
  
  createOverlay(position: vec3, text: string): SceneObject {
    const overlay = this.getSceneObject().createChild();
    
    // Position overlay
    overlay.getTransform().setWorldPosition(position);
    
    // Add text
    const textComp = overlay.createComponent('Text');
    textComp.text = text;
    textComp.size = 0.1;
    
    return overlay;
  }
  
  updateTexture(texture: Texture): void {
    if (this.renderMeshVisual) {
      this.renderMeshVisual.mainMaterial.mainPass.baseTex = texture;
    }
  }
}
```

### Text Component Styling

```typescript
@component
export class TextStyler extends BaseScriptComponent {
  @input
  textComponent: Text;
  
  applyStyle(config: TextConfig): void {
    this.textComponent.text = config.content;
    this.textComponent.size = config.size;
    this.textComponent.textFill.color = config.color;
    this.textComponent.font = config.font;
  }
}

interface TextConfig {
  content: string;
  size: number;
  color: vec4;
  font: Font;
}
```

---

## Camera Providers

### Camera Provider System

```typescript
// Available Camera Providers
import { CameraProvider } from 'SpectaclesInteractionKit.lspkg/Providers/CameraProvider';
import { ARCameraFinderProvider } from 'SpectaclesInteractionKit.lspkg/Providers/CameraProvider';
import { WorldCameraFinderProvider } from 'SpectaclesInteractionKit.lspkg/Providers/CameraProvider';

@component
export class CameraManager extends BaseScriptComponent {
  @input
  cameraProvider: CameraProvider;
  
  private arCamera: Camera;
  private worldCamera: Camera;
  
  onAwake() {
    this.findCameras();
  }
  
  private findCameras(): void {
    // Find AR camera
    const arFinder = new ARCameraFinderProvider();
    this.arCamera = arFinder.findCamera();
    
    // Find world camera
    const worldFinder = new WorldCameraFinderProvider();
    this.worldCamera = worldFinder.findCamera();
  }
  
  getCameraTexture(): Texture {
    return this.arCamera.renderTarget.getTexture();
  }
}
```

---

## Scene Management

### Scene Object Utilities

```typescript
// Finding scene objects by name
function findSceneObjectByName(name: string): SceneObject {
  return global.scene.root.find(name);
}

// Check hierarchy
function isDescendantOf(child: SceneObject, parent: SceneObject): boolean {
  let current = child.getParent();
  while (current) {
    if (current === parent) return true;
    current = current.getParent();
  }
  return false;
}

@component
export class SceneManager extends BaseScriptComponent {
  findObjectByName(name: string): SceneObject | null {
    return findSceneObjectByName(name);
  }
  
  createSceneObject(name: string, parent?: SceneObject): SceneObject {
    const obj = global.scene.createSceneObject(name);
    if (parent) {
      obj.setParent(parent);
    }
    return obj;
  }
}
```

---

## Collision Detection

### Collider Component

```typescript
@component
export class CollisionHandler extends BaseScriptComponent {
  @input
  collider: ColliderComponent;
  
  onAwake() {
    this.setupCollisionEvents();
  }
  
  private setupCollisionEvents(): void {
    // Collision enter
    this.collider.onCollisionEnter.add((eventArgs) => {
      this.handleCollisionEnter(eventArgs);
    });
    
    // Collision exit
    this.collider.onCollisionExit.add((eventArgs) => {
      this.handleCollisionExit(eventArgs);
    });
    
    // Collision stay
    this.collider.onCollisionStay.add((eventArgs) => {
      this.handleCollisionStay(eventArgs);
    });
  }
  
  private handleCollisionEnter(args: CollisionEnterEventArgs): void {
    print(`Collision detected with: ${args.other.getSceneObject().name}`);
  }
  
  private handleCollisionExit(args: CollisionExitEventArgs): void {
    print(`Collision ended with: ${args.other.getSceneObject().name}`);
  }
  
  private handleCollisionStay(args: CollisionStayEventArgs): void {
    // Handle continuous collision
  }
}
```

---

## Best Practices

### 1. Error Handling

```typescript
@component
export class RobustAPIClient extends BaseScriptComponent {
  @input
  internetModule: InternetModule;
  
  async fetchWithRetry(url: string, maxRetries: number = 3): Promise<any> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await this.internetModule.fetch(new Request(url));
        if (response.status === 200) {
          return await response.json();
        }
      } catch (error) {
        lastError = error;
        print(`Retry ${i + 1}/${maxRetries} failed: ${error.message}`);
        await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
      }
    }
    
    throw lastError;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const delayEvent = script.createEvent('DelayedCallbackEvent');
      delayEvent.bind(() => resolve());
      delayEvent.reset(ms / 1000);
    });
  }
}
```

### 2. Performance Optimization

```typescript
@component
export class PerformanceOptimizer extends BaseScriptComponent {
  private updateInterval: number = 0.1; // seconds
  private lastUpdate: number = 0;
  
  onUpdate() {
    const currentTime = getTime();
    
    if (currentTime - this.lastUpdate >= this.updateInterval) {
      this.performExpensiveOperation();
      this.lastUpdate = currentTime;
    }
  }
  
  private performExpensiveOperation(): void {
    // Expensive operations here
  }
}
```

### 3. Memory Management

```typescript
@component
export class ResourceManager extends BaseScriptComponent {
  private resources: Map<string, any> = new Map();
  
  addResource(key: string, resource: any): void {
    this.resources.set(key, resource);
  }
  
  removeResource(key: string): void {
    const resource = this.resources.get(key);
    if (resource && resource.destroy) {
      resource.destroy();
    }
    this.resources.delete(key);
  }
  
  onDestroy() {
    // Clean up all resources
    this.resources.forEach((resource, key) => {
      this.removeResource(key);
    });
  }
}
```

### 4. Type Safety

```typescript
// Always use explicit types
@component
export class TypeSafeComponent extends BaseScriptComponent {
  @input
  private config: ComponentConfig;
  
  private state: ComponentState = ComponentState.Idle;
  
  initialize(params: InitParams): void {
    // Type-safe initialization
  }
}

enum ComponentState {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error'
}

interface ComponentConfig {
  enabled: boolean;
  updateRate: number;
  debugMode: boolean;
}

interface InitParams {
  apiKey: string;
  endpoint: string;
}
```

---

## Additional Resources

- **Official Documentation**: https://developers.snap.com/lens-studio
- **API Reference**: https://developers.snap.com/lens-studio/api
- **Spectacles SDK**: https://developers.snap.com/spectacles
- **Remote Service Gateway**: https://developers.snap.com/spectacles/about-spectacles-features/apis/remoteservice-gateway
- **Sample Projects**: https://github.com/snapchat/spectacles-sample

---

## Version History

- **v1.0.0** (Oct 2025) - Initial comprehensive reference based on official Snap documentation
