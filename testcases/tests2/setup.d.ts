/**
 * TypeScript Declarations for Test Setup Utilities
 *
 * This file provides TypeScript type definitions for the test setup utilities.
 * It improves IDE autocompletion and type checking.
 */

import { Codebolt } from '../src/core/Codebolt';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Connection status for tracking WebSocket state
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Configuration options for test setup
 */
export interface TestSetupConfig {
    /** Maximum time to wait for connection (default: 30000ms) */
    connectionTimeout?: number;
    /** Whether to enable debug logging (default: false) */
    debug?: boolean;
    /** Custom WebSocket server URL (overrides environment variables) */
    serverUrl?: string;
    /** Custom WebSocket port (overrides environment variables) */
    port?: string;
}

/**
 * Mock data for testing
 */
export interface MockData {
    messages: any[];
    responses: Map<string, any>;
    errors: Map<string, Error>;
}

/**
 * Test state information
 */
export interface TestState {
    sharedCodebolt: Codebolt | null;
    connectionStatus: ConnectionStatus;
    connectionPromise: Promise<void> | null;
    config: Required<TestSetupConfig>;
    mockData: MockData;
    counters: {
        testsRun: number;
        testsPassed: number;
        testsFailed: number;
    };
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Gets or creates the shared Codebolt instance.
 * @returns The shared Codebolt instance
 */
export function getSharedCodebolt(): Codebolt;

/**
 * Alias for getSharedCodebolt() for easier imports.
 * @returns The shared Codebolt instance
 */
export const sharedCodebolt: () => Codebolt;

/**
 * Initializes the shared Codebolt connection.
 * @param config - Optional configuration
 * @returns Resolves when connection is ready
 */
export function setupTestEnvironment(config?: TestSetupConfig): Promise<void>;

/**
 * Cleans up the test environment after all tests complete.
 * @returns Resolves when cleanup is complete
 */
export function teardownTestEnvironment(): Promise<void>;

/**
 * Resets the test state between test suites if needed.
 */
export function resetTestState(): void;

// ============================================================================
// Connection Management
// ============================================================================

/**
 * Waits for the Codebolt instance to be ready with timeout.
 * @param timeout - Maximum time to wait in milliseconds (default: 30000)
 * @returns Resolves when ready or rejects on timeout
 */
export function waitForConnection(timeout?: number): Promise<void>;

/**
 * Checks if the Codebolt instance is currently ready.
 * @returns True if ready, false otherwise
 */
export function isConnectionReady(): boolean;

/**
 * Waits for connection with retry logic.
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delay - Delay between retries in ms (default: 1000)
 * @returns Resolves when connection is ready
 */
export function waitForConnectionWithRetry(maxRetries?: number, delay?: number): Promise<void>;

// ============================================================================
// Mock Utilities
// ============================================================================

/**
 * Creates a mock response for testing.
 * @param data - The mock response data
 * @param delay - Simulated network delay in ms (default: 0)
 * @returns Promise that resolves with mock data
 */
export function createMockResponse<T>(data: T, delay?: number): Promise<T>;

/**
 * Creates a mock error for testing error handling.
 * @param message - Error message
 * @param code - Error code (default: 'TEST_ERROR')
 * @returns The created error
 */
export function createMockError(message: string, code?: string): Error;

/**
 * Mocks a WebSocket message for testing.
 * @param type - Message type
 * @param data - Message data
 * @returns The mock message object
 */
export function mockWebSocketMessage(type: string, data: any): any;

/**
 * Records a mock response for later retrieval.
 * @param key - Response key/identifier
 * @param value - Response value
 */
export function setMockResponse(key: string, value: any): void;

/**
 * Retrieves a previously recorded mock response.
 * @param key - Response key/identifier
 * @returns The mock response or undefined
 */
export function getMockResponse(key: string): any;

/**
 * Clears all mock data.
 */
export function clearMockData(): void;

// ============================================================================
// Test Helper Functions
// ============================================================================

/**
 * Runs a test function with automatic setup and teardown.
 * @param testFn - The test function to run
 * @returns The result of the test function
 */
export function runTest<T>(testFn: () => Promise<T>): Promise<T>;

/**
 * Creates a timeout promise that rejects after specified duration.
 * @param ms - Timeout in milliseconds
 * @param message - Timeout message (default: 'Operation timed out')
 * @returns Promise that rejects after timeout
 */
export function createTimeout(ms: number, message?: string): Promise<never>;

/**
 * Delays execution for specified duration.
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void>;

/**
 * Retries an async operation with exponential backoff.
 * @param operation - The operation to retry
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @param baseDelay - Base delay in ms (default: 1000)
 * @returns Result of successful operation
 */
export function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    baseDelay?: number
): Promise<T>;

/**
 * Wraps an async function with timeout.
 * @param fn - Function to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMsg - Timeout message (default: 'Operation timed out')
 * @returns Result of the function or timeout error
 */
export function withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    timeoutMsg?: string
): Promise<T>;

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Test utility functions collection
 */
export const testUtils: {
    runTest: typeof runTest;
    createTimeout: typeof createTimeout;
    delay: typeof delay;
    retryOperation: typeof retryOperation;
    withTimeout: typeof withTimeout;
    waitForConnection: typeof waitForConnection;
    isConnectionReady: typeof isConnectionReady;
    waitForConnectionWithRetry: typeof waitForConnectionWithRetry;
    resetTestState: typeof resetTestState;
};

/**
 * Mock utility functions collection
 */
export const mockUtils: {
    createMockResponse: typeof createMockResponse;
    createMockError: typeof createMockError;
    mockWebSocketMessage: typeof mockWebSocketMessage;
    setMockResponse: typeof setMockResponse;
    getMockResponse: typeof getMockResponse;
    clearMockData: typeof clearMockData;
};

/**
 * Get current test state
 * @returns Clone of current test state
 */
export function getTestState(): TestState;

/**
 * Jest setup function to be called in setupFilesAfterEnv.
 * @param config - Optional configuration
 */
export function jestSetup(config?: TestSetupConfig): Promise<void>;

// ============================================================================
// Default Export
// ============================================================================

/**
 * Default export - the shared Codebolt instance getter
 */
export default getSharedCodebolt;
