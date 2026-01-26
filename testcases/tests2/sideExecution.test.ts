/**
 * Test Suite for SideExecution Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('SideExecution Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for SideExecution module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All SideExecution module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should list action blocks', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.sideExecution.listActionBlocks();

        expect(response).toBeDefined();
        expect(Array.isArray(response.actionBlocks)).toBe(true);

        // AskUserQuestion: Verify action blocks listing
        console.log('✅ AskUserQuestion: Were action blocks listed successfully?');
        console.log('   Total Action Blocks:', response.actionBlocks?.length || 0);
    });

    test('should start side execution with code', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.sideExecution.startWithCode(
            'console.log("Hello from side execution");',
            { testParam: 'testValue' },
            60000
        );

        expect(response).toBeDefined();
        expect(response.sideExecutionId).toBeDefined();

        // AskUserQuestion: Verify side execution start
        console.log('✅ AskUserQuestion: Was the side execution started successfully?');
        console.log('   Execution ID:', response.sideExecutionId);

        // Cleanup: Stop the execution
        if (response.sideExecutionId) {
            await codebolt.sideExecution.stop(response.sideExecutionId);
        }
    });

    test('should get side execution status', async () => {
        const codebolt = sharedCodebolt();

        // Start an execution first
        const startResponse = await codebolt.sideExecution.startWithCode(
            'console.log("Status test");',
            {},
            60000
        );
        const executionId = startResponse.sideExecutionId || '';

        // Get status
        const response = await codebolt.sideExecution.getStatus(executionId);

        expect(response).toBeDefined();
        expect(response.status).toBeDefined();

        // AskUserQuestion: Verify status retrieval
        console.log('✅ AskUserQuestion: Was the side execution status retrieved successfully?');
        console.log('   Status:', response.status);

        // Cleanup
        if (executionId) {
            await codebolt.sideExecution.stop(executionId);
        }
    });
});
