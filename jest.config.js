module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  setupFiles: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/src/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/_mocks/'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/db/schema.sql',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  clearMocks: true,
  resetModules: true,
  verbose: true
};
