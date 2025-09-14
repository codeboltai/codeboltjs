module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^epoml$': '<rootDir>/../epoml/src',
    '^epoml/(.*)$': '<rootDir>/../epoml/src/$1',
  },
  collectCoverageFrom: [
    '../epoml/src/**/*.ts',
    '!../epoml/src/**/*.d.ts',
    '!../epoml/src/**/index.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};