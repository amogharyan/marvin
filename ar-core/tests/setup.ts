/**
 * Jest test setup
 * 
 * Global setup and mocks for testing Lens Studio components
 */

// Mock Lens Studio vec3 class
class MockVec3 {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}
  
  add(other: MockVec3): MockVec3 {
    return new MockVec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }
  
  sub(other: MockVec3): MockVec3 {
    return new MockVec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }
  
  scale(scalar: number): MockVec3 {
    return new MockVec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }
  
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  
  normalize(): MockVec3 {
    const mag = this.magnitude();
    if (mag === 0) return new MockVec3(0, 0, 0);
    return new MockVec3(this.x / mag, this.y / mag, this.z / mag);
  }
}

// Mock Lens Studio quat class
class MockQuat {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
    public w: number = 1
  ) {}
  
  static fromEulerAngles(euler: MockVec3): MockQuat {
    // Simplified quaternion from Euler angles
    const cy = Math.cos(euler.z * 0.5);
    const sy = Math.sin(euler.z * 0.5);
    const cp = Math.cos(euler.y * 0.5);
    const sp = Math.sin(euler.y * 0.5);
    const cr = Math.cos(euler.x * 0.5);
    const sr = Math.sin(euler.x * 0.5);
    
    return new MockQuat(
      sr * cp * cy - cr * sp * sy,
      cr * sp * cy + sr * cp * sy,
      cr * cp * sy - sr * sp * cy,
      cr * cp * cy + sr * sp * sy
    );
  }
}

// Add to global scope
(global as any).vec3 = MockVec3;
(global as any).quat = MockQuat;

// Mock performance.now() for consistent timing tests
let mockTime = 0;
global.performance = {
  now: () => {
    mockTime += 16.67; // Simulate 60fps (16.67ms per frame)
    return mockTime;
  },
} as any;

// Reset mock time before each test
beforeEach(() => {
  mockTime = 0;
});

