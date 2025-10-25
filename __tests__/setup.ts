// Global test setup and configuration
import '@testing-library/jest-dom';

// Mock Lens Studio global objects
global.print = jest.fn((...args) => console.log(...args));
global.printError = jest.fn((...args) => console.error(...args));

// Mock common Lens Studio classes
global.vec3 = class vec3 {
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
};

global.quat = class quat {
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
};

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);
