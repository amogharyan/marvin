module.exports = {
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'off', // Allow console.log in this project
    'no-unused-vars': 'off', // Turn off base rule
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-undef': 'off' // Turn off for TypeScript
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', 'tests/setup.ts']
};
