// Test file for ChromaMetadataValidator
// This demonstrates the usage and validates the functionality

import { ChromaMetadataValidator } from '../utils/chromaMetadataValidator';

// Test data with various types
const testMetadata = {
  stringValue: 'test string',
  numberValue: 42,
  booleanValue: true,
  nullValue: null,
  dateValue: new Date('2023-01-01T00:00:00Z'),
  arrayValue: ['item1', 'item2', 'item3'],
  objectValue: { nested: 'value', count: 5 },
  undefinedValue: undefined
};

console.log('Original metadata:', testMetadata);

// Test sanitization
const sanitized = ChromaMetadataValidator.sanitizeMetadata(testMetadata);
console.log('Sanitized metadata:', sanitized);

// Test validation
const isValid = ChromaMetadataValidator.validateMetadata(sanitized);
console.log('Is valid:', isValid);

// Test specific metadata creation methods
const conversationMetadata = ChromaMetadataValidator.createConversationMetadata(
  'session-123',
  'user-456',
  new Date(),
  'medicine_bottle',
  'conversation',
  0.95,
  ['morning', 'medicine', 'reminder']
);
console.log('Conversation metadata:', conversationMetadata);

const learningMetadata = ChromaMetadataValidator.createLearningPatternMetadata(
  'user-456',
  'routine',
  0.8,
  5,
  new Date(),
  ['morning', 'routine', 'pattern']
);
console.log('Learning pattern metadata:', learningMetadata);

// Test document content sanitization
const testContent = {
  complex: 'object',
  with: ['arrays', 'and', 'nested', { data: true }]
};
const sanitizedContent = ChromaMetadataValidator.sanitizeDocumentContent(testContent);
console.log('Sanitized content:', sanitizedContent);

// Test batch sanitization
const metadataArray = [
  { key1: 'value1', date: new Date() },
  { key2: 42, array: ['a', 'b', 'c'] },
  { key3: true, object: { nested: 'value' } }
];
const batchSanitized = ChromaMetadataValidator.sanitizeMetadataBatch(metadataArray);
console.log('Batch sanitized:', batchSanitized);

// Test validation errors
const invalidMetadata = {
  validString: 'test',
  invalidFunction: () => console.log('test'),
  invalidSymbol: Symbol('test')
};
const errors = ChromaMetadataValidator.getValidationErrors(invalidMetadata);
console.log('Validation errors:', errors);

export { testMetadata, sanitized, isValid };
