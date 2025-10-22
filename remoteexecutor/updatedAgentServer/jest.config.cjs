module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@codebolt/types/(.*)$': '<rootDir>/../../../common/types/dist/$1',
    '^@codebolt/types/sdk$': '<rootDir>/../../../common/types/dist/sdk-types',
    '^@codebolt/codeboltjs$': '<rootDir>/../../../packages/codeboltjs/dist',
  }
};