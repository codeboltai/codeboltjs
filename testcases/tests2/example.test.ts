/**
 * Example Test File
 *
 * This file demonstrates how to use the test setup utilities
 * for testing CodeboltJS functionality.
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    runTest,
    withTimeout,
    retryOperation,
    delay,
    resetTestState,
    clearMockData,
    createMockResponse,
    createMockError,
    mockWebSocketMessage,
    setMockResponse,
    getMockResponse,
} from './setup';

// ============================================================================
// Test Suite Configuration
// ============================================================================

describe('CodeboltJS Example Tests', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] Tests completed');
        // Note: We don't close the connection to allow it to persist
        // across test suites for better performance
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    // ============================================================================
    // Basic Connection Tests
    // ============================================================================

    describe('Connection Management', () => {
        test('should establish connection successfully', async () => {
            const codebolt = sharedCodebolt();
            expect(codebolt).toBeDefined();
            expect(isConnectionReady()).toBe(true);
        });

        test('should handle connection checks', async () => {
            const codebolt = sharedCodebolt();

            // Connection should be ready
            expect(codebolt.ready).toBe(true);

            // Can also use the utility function
            expect(isConnectionReady()).toBe(true);
        });

        test('should wait for connection with timeout', async () => {
            // Should resolve immediately if already connected
            const startTime = Date.now();
            await waitForConnection(5000);
            const elapsed = Date.now() - startTime;

            expect(elapsed).toBeLessThan(1000); // Should be fast
        });
    });

    // ============================================================================
    // Mock Utility Tests
    // ============================================================================

    describe('Mock Utilities', () => {
        test('should create mock responses', async () => {
            const mockData = { success: true, data: 'test' };
            const response = await createMockResponse(mockData, 100);

            expect(response).toEqual(mockData);
        });

        test('should create mock errors', () => {
            const error = createMockError('Test error', 'TEST_ERROR');

            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Test error');
            expect((error as any).code).toBe('TEST_ERROR');
        });

        test('should mock WebSocket messages', () => {
            const mockMsg = mockWebSocketMessage('messageResponse', {
                userMessage: 'Hello',
                messageId: '123',
            });

            expect(mockMsg.type).toBe('messageResponse');
            expect(mockMsg.userMessage).toBe('Hello');
        });

        test('should store and retrieve mock responses', () => {
            setMockResponse('test-key', { value: 'test-data' });
            const retrieved = getMockResponse('test-key');

            expect(retrieved).toEqual({ value: 'test-data' });
        });
    });

    // ============================================================================
    // Test Helper Functions
    // ============================================================================

    describe('Test Helpers', () => {
        test('should run tests with automatic setup', async () => {
            const result = await runTest(async () => {
                const codebolt = sharedCodebolt();
                return {
                    ready: codebolt.ready,
                    timestamp: Date.now(),
                };
            });

            expect(result.ready).toBe(true);
            expect(result.timestamp).toBeGreaterThan(0);
        });

        test('should handle delays', async () => {
            const startTime = Date.now();
            await delay(500);
            const elapsed = Date.now() - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(500);
            expect(elapsed).toBeLessThan(600); // Allow some margin
        });

        test('should handle timeout protection', async () => {
            // This should complete quickly and not timeout
            const result = await withTimeout(
                async () => {
                    return { data: 'quick response' };
                },
                1000,
                'Operation timed out'
            );

            expect(result.data).toBe('quick response');
        });

        test('should timeout on slow operations', async () => {
            await expect(
                withTimeout(
                    async () => {
                        await delay(2000);
                        return { data: 'slow response' };
                    },
                    500,
                    'Should timeout'
                )
            ).rejects.toThrow('Should timeout');
        });

        test('should retry operations', async () => {
            let attempts = 0;

            const result = await retryOperation(
                async () => {
                    attempts++;
                    if (attempts < 3) {
                        throw new Error('Not ready yet');
                    }
                    return { success: true, attempts };
                },
                5, // max retries
                100 // base delay
            );

            expect(result.success).toBe(true);
            expect(result.attempts).toBe(3);
        });
    });

    // ============================================================================
    // Example Integration Tests
    // ============================================================================

    describe('Integration Examples', () => {
        test('example: testing with timeout and retry', async () => {
            const result = await runTest(async () => {
                return await retryOperation(
                    async () => {
                        return await withTimeout(
                            async () => {
                                // Simulate some operation
                                await delay(100);
                                return { operation: 'complete' };
                            },
                            2000,
                            'Operation timeout'
                        );
                    },
                    3,
                    500
                );
            });

            expect(result.operation).toBe('complete');
        });

        test('example: testing with mock data', async () => {
            // Set up mock data
            setMockResponse('user-123', {
                id: '123',
                name: 'Test User',
                email: 'test@example.com',
            });

            // Retrieve and use mock data
            const user = getMockResponse('user-123');

            expect(user.id).toBe('123');
            expect(user.name).toBe('Test User');
        });

        test('example: testing error handling', async () => {
            const mockError = createMockError(
                'Connection failed',
                'CONN_ERROR'
            );

            expect(mockError.message).toBe('Connection failed');
            expect((mockError as any).code).toBe('CONN_ERROR');
        });

        test('example: testing state management', async () => {
            // Get initial state
            const state1 = getMockResponse('state-key');
            expect(state1).toBeUndefined();

            // Set state
            setMockResponse('state-key', { value: 1 });

            // Get updated state
            const state2 = getMockResponse('state-key');
            expect(state2).toEqual({ value: 1 });

            // Clear and verify
            clearMockData();
            const state3 = getMockResponse('state-key');
            expect(state3).toBeUndefined();
        });
    });

    // ============================================================================
    // Performance Tests
    // ============================================================================

    describe('Performance Tests', () => {
        test('should handle multiple rapid operations', async () => {
            const operations = [];

            for (let i = 0; i < 10; i++) {
                operations.push(
                    runTest(async () => {
                        const codebolt = sharedCodebolt();
                        return { ready: codebolt.ready, index: i };
                    })
                );
            }

            const results = await Promise.all(operations);

            expect(results).toHaveLength(10);
            results.forEach((result, index) => {
                expect(result.ready).toBe(true);
                expect(result.index).toBe(index);
            });
        });

        test('should complete operations within reasonable time', async () => {
            const startTime = Date.now();

            await runTest(async () => {
                const codebolt = sharedCodebolt();
                // Simulate quick operation
                return { ready: codebolt.ready };
            });

            const elapsed = Date.now() - startTime;
            expect(elapsed).toBeLessThan(100); // Should be very fast
        });
    });

    // ============================================================================
    // Edge Cases
    // ============================================================================

    describe('Edge Cases', () => {
        test('should handle undefined mock responses', () => {
            const result = getMockResponse('nonexistent-key');
            expect(result).toBeUndefined();
        });

        test('should handle empty mock data', () => {
            clearMockData();

            const msg1 = mockWebSocketMessage('test', { data: 'test' });
            clearMockData();

            const msg2 = mockWebSocketMessage('test', { data: 'test2' });

            expect(msg1.data).not.toBe(msg2.data);
        });

        test('should handle zero delay', async () => {
            const start = Date.now();
            await delay(0);
            const elapsed = Date.now() - start;

            expect(elapsed).toBeLessThan(10);
        });

        test('should handle immediate timeouts', async () => {
            await expect(
                withTimeout(
                    async () => {
                        await delay(100);
                        return 'done';
                    },
                    10,
                    'Immediate timeout'
                )
            ).rejects.toThrow('Immediate timeout');
        });
    });

    // ============================================================================
    // Debug/Logging Tests
    // ============================================================================

    describe('Debugging Features', () => {
        test('should access test state', () => {
            const state = getMockResponse('debug-state');
            expect(state).toBeUndefined();

            setMockResponse('debug-state', { debug: true });
            const updatedState = getMockResponse('debug-state');

            expect(updatedState).toEqual({ debug: true });
        });

        test('should track test execution', async () => {
            // This test demonstrates that tests are tracked
            const initialResult = await runTest(async () => {
                return { tracked: true };
            });

            expect(initialResult.tracked).toBe(true);

            // Running another test should increment counters
            const secondResult = await runTest(async () => {
                return { tracked: true };
            });

            expect(secondResult.tracked).toBe(true);
        });
    });
});

// ============================================================================
// Additional Test Suites Examples
// ============================================================================

describe('Module-Specific Test Examples', () => {
    beforeAll(async () => {
        await waitForConnection();
    });

    afterEach(() => {
        clearMockData();
    });

    describe('FileSystem Module Tests', () => {
        test('example: test file reading with timeout', async () => {
            const result = await withTimeout(
                async () => {
                    const codebolt = sharedCodebolt();
                    // Example: reading a file
                    // const file = await codebolt.fs.readFile('test.txt');
                    // For this example, we'll just return a mock result
                    return {
                        content: 'mock file content',
                        path: 'test.txt',
                    };
                },
                5000,
                'File read operation timed out'
            );

            expect(result.content).toBeDefined();
        });

        test('example: test file writing with retry', async () => {
            const result = await retryOperation(
                async () => {
                    const codebolt = sharedCodebolt();
                    // Example: writing a file
                    // await codebolt.fs.writeFile('test.txt', 'content');
                    return {
                        success: true,
                        path: 'test.txt',
                    };
                },
                3,
                1000
            );

            expect(result.success).toBe(true);
        });
    });

    describe('Chat Module Tests', () => {
        test('example: test chat with error handling', async () => {
            try {
                const result = await withTimeout(
                    async () => {
                        const codebolt = sharedCodebolt();
                        // Example: sending a chat message
                        // const response = await codebolt.chat.send('Hello');
                        return {
                            message: 'Hello',
                            response: 'mock response',
                        };
                    },
                    5000,
                    'Chat operation timed out'
                );

                expect(result.response).toBeDefined();
            } catch (error) {
                // Handle timeout or other errors
                expect(error).toBeDefined();
            }
        });
    });

    describe('LLM Module Tests', () => {
        test('example: test LLM inference with all utilities', async () => {
            const result = await runTest(async () => {
                return await retryOperation(
                    async () => {
                        return await withTimeout(
                            async () => {
                                const codebolt = sharedCodebolt();
                                // Example: LLM inference
                                // const response = await codebolt.llm.chat('Test prompt');
                                return {
                                    prompt: 'Test prompt',
                                    completion: 'mock completion',
                                    tokens: 100,
                                };
                            },
                            10000,
                            'LLM inference timed out'
                        );
                    },
                    2,
                    2000
                );
            });

            expect(result.completion).toBeDefined();
            expect(result.tokens).toBeGreaterThan(0);
        });
    });
});
