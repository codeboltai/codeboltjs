/**
 * Test Suite for History Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('History Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for History module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All History module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should summarize all chat history', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.history.summarizeAll();

        expect(response).toBeDefined();
        expect(Array.isArray(response.messages)).toBe(true);

        // AskUserQuestion: Verify summary
        console.log('✅ AskUserQuestion: Was the chat history summarized successfully?');
        console.log('   Summary Messages:', response.messages?.length || 0);
    });

    test('should summarize specific messages', async () => {
        const codebolt = sharedCodebolt();

        const messages = [
            { role: 'user', content: 'Test message 1' },
            { role: 'assistant', content: 'Test response 1' },
            { role: 'user', content: 'Test message 2' }
        ];

        const response = await codebolt.history.summarize(messages, 2);

        expect(response).toBeDefined();
        expect(Array.isArray(response.messages)).toBe(true);

        // AskUserQuestion: Verify partial summary
        console.log('✅ AskUserQuestion: Was the partial summary created successfully?');
        console.log('   Summary Messages:', response.messages?.length || 0);
    });
});
