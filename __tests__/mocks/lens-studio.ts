/**
 * Mock implementations of Lens Studio APIs for testing
 * 
 * These mocks allow testing TypeScript components without Lens Studio runtime
 */

// Mock Event class
export class MockEvent<T> {
  private callbacks: Array<(data: T) => void> = [];
  
  add(callback: (data: T) => void): void {
    this.callbacks.push(callback);
  }
  
  remove(callback: (data: T) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }
  
  trigger(data: T): void {
    this.callbacks.forEach(cb => cb(data));
  }
}

// Mock InternetModule for Fetch API testing
export class MockInternetModule {
  fetch(url: string, options: any): Promise<any> {
    return Promise.resolve({
      status: 200,
      body: JSON.stringify({ success: true }),
      headers: {}
    });
  }
}

// Mock RemoteServiceModule for Gemini testing
export class MockRemoteServiceModule {
  apiSpecId: string = 'test-api';
  
  createRequest(endpoint: string): any {
    return {
      send: (data: any) => Promise.resolve({ success: true })
    };
  }
  
  performApiRequest(request: any, callback: (response: any) => void): void {
    setTimeout(() => {
      callback({ success: true, data: 'mock response' });
    }, 100);
  }
}

// Mock MLComponent for object detection testing
export class MockMLComponent {
  private detectionCallback: ((result: any) => void) | null = null;
  
  onRunningFinished = new MockEvent<any>();
  
  build(inputs: any[]): void {
    // Mock build
  }
  
  runImmediate(): void {
    if (this.detectionCallback) {
      this.detectionCallback({
        label: 'medicine',
        confidence: 0.95,
        boundingBox: { x: 0, y: 0, width: 100, height: 100 }
      });
    }
  }
  
  setDetectionCallback(callback: (result: any) => void): void {
    this.detectionCallback = callback;
  }
}

// Mock ObjectTracking3D
export class MockObjectTracking3D {
  isTracking(): boolean {
    return true;
  }
  
  getTrackingQuality(): number {
    return 0.9;
  }
}

// Mock AudioComponent
export class MockAudioComponent {
  audioTrack: any = null;
  
  play(): void {
    // Mock play
  }
  
  stop(): void {
    // Mock stop
  }
  
  pause(): void {
    // Mock pause
  }
}

// Mock RenderMeshVisual for AR overlay testing
export class MockRenderMeshVisual {
  enabled: boolean = true;
  
  mainPass = {
    baseTex: null,
    baseColor: new vec3(1, 1, 1)
  };
}

// Mock Text component
export class MockText {
  text: string = '';
  size: number = 1;
  
  getComponent(type: any): any {
    return this;
  }
}

// Mock SceneObject
export class MockSceneObject {
  private components: Map<string, any> = new Map();
  
  name: string = 'MockObject';
  enabled: boolean = true;
  
  getTransform(): any {
    return {
      getWorldPosition: () => new vec3(0, 0, 0),
      setWorldPosition: (pos: vec3) => {},
      getWorldRotation: () => new quat(0, 0, 0, 1),
      setWorldRotation: (rot: quat) => {}
    };
  }
  
  createComponent(type: string): any {
    const component = new MockComponent();
    this.components.set(type, component);
    return component;
  }
  
  getComponent(type: string): any {
    return this.components.get(type);
  }
}

// Mock generic component
export class MockComponent {
  enabled: boolean = true;
  sceneObject: MockSceneObject = new MockSceneObject();
}

// Mock SupabaseClient
export class MockSupabaseClient {
  from(table: string): any {
    return {
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: {}, error: null })
        })
      }),
      insert: (data: any) => Promise.resolve({ data, error: null }),
      update: (data: any) => ({
        eq: () => Promise.resolve({ data, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    };
  }
  
  channel(name: string): any {
    return {
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {}
    };
  }
}

// Mock vec3 (if not using global)
export class vec3 {
  x: number;
  y: number;
  z: number;
  
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  static zero() {
    return new vec3(0, 0, 0);
  }
  
  static one() {
    return new vec3(1, 1, 1);
  }
}

// Mock quat (if not using global)
export class quat {
  x: number;
  y: number;
  z: number;
  w: number;
  
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  
  static identity() {
    return new quat(0, 0, 0, 1);
  }
}
