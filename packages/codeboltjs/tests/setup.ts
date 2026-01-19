/**
 * CodeboltJS Test Setup File
 *
 * This file provides a comprehensive test setup for the CodeboltJS library.
 * It creates a shared CodeboltSDK instance that persists across all tests,
 * preventing the creation of multiple WebSocket connections and ensuring
 * efficient resource utilization.
 *
 * Key Features:
 * - Singleton pattern for shared Codebolt instance
 * - Automatic WebSocket connection management
 * - Helper functions for testing
 * - Mock utilities for isolated testing
 * - Proper cleanup and teardown
 */

import Codebolt from '../src/core/Codebolt';

// ============================================================================
// SECTION 1: Type Definitions
// ============================================================================

/**
 * Connection status for tracking WebSocket state
 */
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Configuration options for test setup
 */
interface TestSetupConfig {
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
interface MockData {
    messages: any[];
    responses: Map<string, any>;
    errors: Map<string, Error>;
}

// ============================================================================
// SECTION 2: Global State Management
// ============================================================================

/**
 * Global state for the test setup
 * This ensures the singleton pattern works across all test files
 */
const testState = {
    /** The shared Codebolt instance */
    sharedCodebolt: null as Codebolt | null,

    /** Current connection status */
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' as ConnectionStatus,

    /** Connection promise for concurrent access */
    connectionPromise: null as Promise<void> | null,

    /** Configuration for the test setup */
    config: {
        connectionTimeout: 30000,
        debug: false,
    } as Required<TestSetupConfig>,

    /** Mock data storage */
    mockData: {
        messages: [] as any[],
        responses: new Map<string, any>(),
        errors: new Map<string, Error>(),
    } as MockData,

    /** Test counters for tracking */
    counters: {
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 0,
    },
};

// ============================================================================
// SECTION 3: Singleton Instance Management
// ============================================================================

/**
 * Gets or creates the shared Codebolt instance.
 * This ensures all tests use the same connection.
 *
 * @returns {Codebolt} The shared Codebolt instance
 *
 * @example
 * ```ts
 * const codebolt = getSharedCodebolt();
 * await codebolt.waitForReady();
 * ```
 */
export function getSharedCodebolt(): Codebolt {
    if (!testState.sharedCodebolt) {
        if (testState.config.debug) {
            console.log('[TestSetup] Creating new shared Codebolt instance');
        }
        testState.sharedCodebolt = new Codebolt();
    }
    return testState.sharedCodebolt;
}

/**
 * Alias for getSharedCodebolt() for easier imports
 * Export as 'sharedCodebolt' as requested
 */
export const sharedCodebolt = getSharedCodebolt;

// ============================================================================
// SECTION 4: Connection Management
// ============================================================================

/**
 * Initializes the shared Codebolt connection.
 * This function is idempotent - multiple calls will return the same promise.
 *
 * @param {TestSetupConfig} config - Optional configuration
 * @returns {Promise<void>} Resolves when connection is ready
 *
 * @example
 * ```ts
 * beforeAll(async () => {
 *   await setupTestEnvironment();
 * });
 * ```
 */
export async function setupTestEnvironment(config?: TestSetupConfig): Promise<void> {
    // Update config if provided
    if (config) {
        testState.config = { ...testState.config, ...config };
    }

    // If already connecting/connected, return existing promise
    if (testState.connectionPromise) {
        return testState.connectionPromise;
    }

    // Create new connection promise
    testState.connectionPromise = (async () => {
        try {
            testState.connectionStatus = 'connecting';

            if (testState.config.debug) {
                console.log('[TestSetup] Initializing Codebolt connection...');
            }

            const codebolt = getSharedCodebolt();

            // Wait for connection with timeout
            await Promise.race([
                codebolt.waitForReady(),
                new Promise<void>((_, reject) =>
                    setTimeout(
                        () => reject(new Error(`Connection timeout after ${testState.config.connectionTimeout}ms`)),
                        testState.config.connectionTimeout
                    )
                ),
            ]);

            testState.connectionStatus = 'connected';

            if (testState.config.debug) {
                console.log('[TestSetup] Codebolt connection established successfully');
            }
        } catch (error) {
            testState.connectionStatus = 'error';
            console.error('[TestSetup] Failed to establish Codebolt connection:', error);
            throw error;
        }
    })();

    return testState.connectionPromise;
}

/**
 * Cleans up the test environment after all tests complete.
 *
 * @example
 * ```ts
 * afterAll(async () => {
 *   await teardownTestEnvironment();
 * });
 * ```
 */
export async function teardownTestEnvironment(): Promise<void> {
    if (testState.config.debug) {
        console.log('[TestSetup] Tearing down test environment...');
    }

    // Log test statistics
    console.log(`[TestSetup] Tests run: ${testState.counters.testsRun}`);
    console.log(`[TestSetup] Tests passed: ${testState.counters.testsPassed}`);
    console.log(`[TestSetup] Tests failed: ${testState.counters.testsFailed}`);

    // Note: We don't close the WebSocket connection here
    // The singleton instance should persist for the entire test suite
    // If you need to reset state between tests, use resetTestState() instead

    testState.connectionPromise = null;
}

/**
 * Resets the test state between test suites if needed.
 * This clears mock data and counters but keeps the connection alive.
 *
 * @example
 * ```ts
 * afterEach(() => {
 *   resetTestState();
 * });
 * ```
 */
export function resetTestState(): void {
    testState.mockData = {
        messages: [],
        responses: new Map(),
        errors: new Map(),
    };

    if (testState.config.debug) {
        console.log('[TestSetup] Test state reset');
    }
}

// ============================================================================
// SECTION 5: Connection Readiness Helpers
// ============================================================================

/**
 * Waits for the Codebolt instance to be ready with timeout.
 *
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 30000)
 * @returns {Promise<void>} Resolves when ready or rejects on timeout
 *
 * @example
 * ```ts
 * test('my test', async () => {
 *   await waitForConnection();
 *   // Now safe to use Codebolt
 * });
 * ```
 */
export async function waitForConnection(timeout: number = 30000): Promise<void> {
    const codebolt = getSharedCodebolt();

    await Promise.race([
        codebolt.waitForReady(),
        new Promise<void>((_, reject) =>
            setTimeout(
                () => reject(new Error(`Connection timeout after ${timeout}ms`)),
                timeout
            )
        ),
    ]);

    if (testState.config.debug) {
        console.log('[TestSetup] Connection confirmed ready');
    }
}

/**
 * Checks if the Codebolt instance is currently ready.
 *
 * @returns {boolean} True if ready, false otherwise
 *
 * @example
 * ```ts
 * if (isConnectionReady()) {
 *   // Safe to use Codebolt
 * }
 * ```
 */
export function isConnectionReady(): boolean {
    const codebolt = getSharedCodebolt();
    return codebolt.ready;
}

/**
 * Waits for connection with retry logic.
 *
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @returns {Promise<void>} Resolves when connection is ready
 *
 * @example
 * ```ts
 * await waitForConnectionWithRetry(5, 2000);
 * ```
 */
export async function waitForConnectionWithRetry(
    maxRetries: number = 3,
    delay: number = 1000
): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await waitForConnection(10000);
            return;
        } catch (error) {
            lastError = error as Error;
            console.warn(`[TestSetup] Connection attempt ${attempt}/${maxRetries} failed:`, error);

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('Connection failed after maximum retries');
}

// ============================================================================
// SECTION 6: Mock Utilities
// ============================================================================

/**
 * Creates a mock response for testing.
 *
 * @template T - The type of response data
 * @param {T} data - The mock response data
 * @param {number} delay - Simulated network delay in ms (default: 0)
 * @returns {Promise<T>} Promise that resolves with mock data
 *
 * @example
 * ```ts
 * const mockResponse = await createMockResponse({ success: true, data: 'test' }, 100);
 * ```
 */
export function createMockResponse<T>(data: T, delay: number = 0): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), delay);
    });
}

/**
 * Creates a mock error for testing error handling.
 *
 * @param {string} message - Error message
 * @param {string} code - Error code (default: 'TEST_ERROR')
 * @returns {Error} The created error
 *
 * @example
 * ```ts
 * const mockError = createMockError('Connection failed', 'CONN_ERROR');
 * ```
 */
export function createMockError(message: string, code: string = 'TEST_ERROR'): Error {
    const error = new Error(message);
    (error as any).code = code;
    return error;
}

/**
 * Mocks a WebSocket message for testing.
 *
 * @param {string} type - Message type
 * @param {any} data - Message data
 * @returns {any} The mock message object
 *
 * @example
 * ```ts
 * const mockMsg = mockWebSocketMessage('messageResponse', { text: 'hello' });
 * ```
 */
export function mockWebSocketMessage(type: string, data: any): any {
    const message = { type, ...data };
    testState.mockData.messages.push(message);
    return message;
}

/**
 * Records a mock response for later retrieval.
 *
 * @param {string} key - Response key/identifier
 * @param {any} value - Response value
 *
 * @example
 * ```ts
 * setMockResponse('getUser', { id: 1, name: 'Test User' });
 * ```
 */
export function setMockResponse(key: string, value: any): void {
    testState.mockData.responses.set(key, value);
}

/**
 * Retrieves a previously recorded mock response.
 *
 * @param {string} key - Response key/identifier
 * @returns {any | undefined} The mock response or undefined
 *
 * @example
 * ```ts
 * const response = getMockResponse('getUser');
 * ```
 */
export function getMockResponse(key: string): any {
    return testState.mockData.responses.get(key);
}

/**
 * Clears all mock data.
 *
 * @example
 * ```ts
 * clearMockData();
 * ```
 */
export function clearMockData(): void {
    testState.mockData.messages = [];
    testState.mockData.responses.clear();
    testState.mockData.errors.clear();
}

// ============================================================================
// SECTION 7: Test Helper Functions
// ============================================================================

/**
 * Runs a test function with automatic setup and teardown.
 *
 * @template T - Return type of test function
 * @param {() => Promise<T>} testFn - The test function to run
 * @returns {Promise<T>} The result of the test function
 *
 * @example
 * ```ts
 * const result = await runTest(async () => {
 *   const codebolt = sharedCodebolt();
 *   return await codebolt.fs.readFile('test.txt');
 * });
 * ```
 */
export async function runTest<T>(testFn: () => Promise<T>): Promise<T> {
    testState.counters.testsRun++;

    try {
        // Ensure connection is ready
        if (!isConnectionReady()) {
            await waitForConnection();
        }

        // Run the test
        const result = await testFn();

        testState.counters.testsPassed++;
        return result;
    } catch (error) {
        testState.counters.testsFailed++;
        throw error;
    }
}

/**
 * Creates a timeout promise that rejects after specified duration.
 *
 * @param {number} ms - Timeout in milliseconds
 * @param {string} message - Timeout message (default: 'Operation timed out')
 * @returns {Promise<never>} Promise that rejects after timeout
 *
 * @example
 * ```ts
 * await Promise.race([
 *   myAsyncOperation(),
 *   createTimeout(5000, 'Operation took too long')
 * ]);
 * ```
 */
export function createTimeout(
    ms: number,
    message: string = 'Operation timed out'
): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
    });
}

/**
 * Delays execution for specified duration.
 *
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after delay
 *
 * @example
 * ```ts
 * await delay(1000); // Wait 1 second
 * ```
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries an async operation with exponential backoff.
 *
 * @template T - Return type of the operation
 * @param {() => Promise<T>} operation - The operation to retry
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise<T>} Result of successful operation
 *
 * @example
 * ```ts
 * const result = await retryOperation(
 *   () => codebolt.fs.readFile('test.txt'),
 *   5,
 *   2000
 * );
 * ```
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.warn(`[TestSetup] Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('Operation failed after maximum retries');
}

/**
 * Wraps an async function with timeout.
 *
 * @template T - Return type of the function
 * @param {() => Promise<T>} fn - Function to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} timeoutMsg - Timeout message (default: 'Operation timed out')
 * @returns {Promise<T>} Result of the function or timeout error
 *
 * @example
 * ```ts
 * const result = await withTimeout(
 *   () => codebolt.fs.readFile('test.txt'),
 *   5000,
 *   'File read timed out'
 * );
 * ```
 */
export async function withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    timeoutMsg: string = 'Operation timed out'
): Promise<T> {
    return Promise.race([
        fn(),
        createTimeout(timeoutMs, timeoutMsg),
    ]);
}

// ============================================================================
// SECTION 8: Jest Integration
// ============================================================================

/**
 * Jest setup function to be called in setupFilesAfterEnv.
 * This automatically sets up the test environment before any tests run.
 *
 * @param {TestSetupConfig} config - Optional configuration
 *
 * Add this to your Jest config:
 * ```json
 * {
 *   "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"]
 * }
 * ```
 */
export async function jestSetup(config?: TestSetupConfig): Promise<void> {
    // Set up test environment
    await setupTestEnvironment(config);

    // Set up global beforeAll/afterAll hooks
    beforeAll(async () => {
        if (!isConnectionReady()) {
            await setupTestEnvironment(config);
        }
    });

    afterAll(async () => {
        await teardownTestEnvironment();
    });

    // Optionally reset state between tests
    afterEach(() => {
        resetTestState();
    });
}

// ============================================================================
// SECTION 9: Direct Exports
// ============================================================================

/**
 * Default export - the shared Codebolt instance
 * This allows importing as:
 * ```ts
 * import sharedCodebolt from './setup';
 * ```
 */
export default getSharedCodebolt;

/**
 * Export all test utilities
 */
export const testUtils = {
    runTest,
    createTimeout,
    delay,
    retryOperation,
    withTimeout,
    waitForConnection,
    isConnectionReady,
    waitForConnectionWithRetry,
    resetTestState,
};

/**
 * Export all mock utilities
 */
export const mockUtils = {
    createMockResponse,
    createMockError,
    mockWebSocketMessage,
    setMockResponse,
    getMockResponse,
    clearMockData,
};

/**
 * Export test state for advanced usage
 */
export const getTestState = () => ({ ...testState });

// ============================================================================
// SECTION 10: Auto-Setup for Jest
// ============================================================================

// Automatically set up if this file is loaded by Jest
if (typeof beforeAll !== 'undefined' && typeof afterAll !== 'undefined') {
    // We're in a Jest environment
    if (testState.config.debug) {
        console.log('[TestSetup] Detected Jest environment, setting up hooks');
    }

    // Don't auto-setup to allow manual control
    // Users can call jestSetup() in their test files if needed
}
