/**
 * Jest setup file for AR Core tests
 * This file runs before each test suite
 */

// Extend Jest timeout for all tests (some AR processing may take longer)
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output
const consoleMock = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Override console
(global as any).console = consoleMock;

// Setup any global test utilities or mocks here
beforeAll(() => {
  // Global setup logic
});

afterAll(() => {
  // Global cleanup logic
});

// Add custom matchers if needed
expect.extend({
  // Custom matchers can be added here
});
