/**
 * Jest Configuration for CodeboltJS
 *
 * This configuration is optimized for testing the CodeboltJS library
 * with the custom test setup utilities.
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.ts',
        '**/tests/**/*.test.js',
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.test.js',
    ],

    // File extensions to process
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // Transform TypeScript files with ts-jest
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.test.json',
        }],
    },

    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

    // Module name mapper for path aliases (if using)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
    },

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/core/Codebolt.ts', // Main class typically tested through integration tests
        '!**/node_modules/**',
    ],

    // Coverage reporters
    coverageReporters: [
        'text',
        'text-summary',
        'html',
        'lcov',
    ],

    // Coverage thresholds (adjust as needed)
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60,
        },
    },

    // Timeout for tests (default: 5000ms, increased for WebSocket operations)
    testTimeout: 30000,

    // Ignore these patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
    ],

    // Module directories
    moduleDirectories: [
        'node_modules',
        'src',
        'tests',
    ],

    // Clear mocks between tests
    clearMocks: true,

    // Reset mocks between tests
    resetMocks: false, // Set to false to preserve singleton instance

    // Restore mocks after each test
    restoreMocks: false, // Set to false to preserve singleton instance

    // Verbose output
    verbose: true,

    // Maximum number of workers (set to 1 for serial execution)
    maxWorkers: 1,

    // Use serial runner to prevent race conditions with WebSocket
    runner: 'jest-serial-runner',

    // Global variables
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },

    // Transform ignore patterns
    transformIgnorePatterns: [
        '/node_modules/',
        '/dist/',
    ],
};
