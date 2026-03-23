module.exports = {
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  testMatch: [
    '<rootDir>/blocks/**/*.test.js',
    '<rootDir>/scripts/**/*.test.js',
  ],
  collectCoverageFrom: [
    '<rootDir>/blocks/**/*.js',
    '<rootDir>/scripts/**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**',
    '!scripts/dompurify.min.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
