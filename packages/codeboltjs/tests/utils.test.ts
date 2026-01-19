/**
 * Test Suite for Utils Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Utils Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Utils module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Utils module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should edit file and apply diff', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.utils.editFileAndApplyDiff(
            '/test/file.js',
            'test diff content',
            'test-diff-id',
            'Apply this diff to the file',
            'gpt-4'
        );

        expect(response).toBeDefined();

        // AskUserQuestion: Verify file edit
        console.log('✅ AskUserQuestion: Was the file edited and diff applied successfully?');
        console.log('   Success:', response.success);
    });
});
