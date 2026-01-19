/**
 * Test Suite for ActionBlock Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('ActionBlock Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for ActionBlock module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All ActionBlock module tests completed');
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

        const response = await codebolt.actionBlock.list();

        expect(response).toBeDefined();
        expect(Array.isArray(response.actionBlocks)).toBe(true);

        // AskUserQuestion: Verify action blocks listing
        console.log('✅ AskUserQuestion: Were action blocks listed successfully?');
        console.log('   Total Action Blocks:', response.actionBlocks?.length || 0);
    });

    test('should get action block detail', async () => {
        const codebolt = sharedCodebolt();

        // First list to get a name
        const listResponse = await codebolt.actionBlock.list();
        const actionBlockName = listResponse.actionBlocks?.[0]?.name || 'test-action-block';

        const response = await codebolt.actionBlock.getDetail(actionBlockName);

        expect(response).toBeDefined();

        // AskUserQuestion: Verify action block detail
        console.log('✅ AskUserQuestion: Was the action block detail retrieved successfully?');
        console.log('   Action Block:', response.actionBlock?.name);
    });

    test('should start action block', async () => {
        const codebolt = sharedCodebolt();

        // First list to get a name
        const listResponse = await codebolt.actionBlock.list();
        const actionBlockName = listResponse.actionBlocks?.[0]?.name;

        if (actionBlockName) {
            const response = await codebolt.actionBlock.start(actionBlockName, {
                testParam: 'testValue'
            });

            expect(response).toBeDefined();
            expect(response.sideExecutionId).toBeDefined();

            // AskUserQuestion: Verify action block start
            console.log('✅ AskUserQuestion: Was the action block started successfully?');
            console.log('   Execution ID:', response.sideExecutionId);
        } else {
            console.log('⚠️  No action blocks available to test');
        }
    });
});
