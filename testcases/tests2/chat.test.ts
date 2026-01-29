/**
 * Test Suite for Chat Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Chat Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Chat module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Chat module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should get chat history', async () => {
        const codebolt = sharedCodebolt();

        const testThreadId = `test-thread-${Date.now()}`;

        const response = await codebolt.chat.getChatHistory(testThreadId);

        expect(response).toBeDefined();

        // AskUserQuestion: Verify chat history
        console.log('✅ AskUserQuestion: Was the chat history retrieved successfully?');
        console.log('   Messages:', response.messages?.length || 0);
    });

    test('should send message', async () => {
        const codebolt = sharedCodebolt();

        // Note: This is a fire-and-forget operation
        codebolt.chat.sendMessage('Test message from comprehensive tests', {
            testKey: 'testValue'
        });

        // AskUserQuestion: Verify message send
        console.log('✅ AskUserQuestion: Was the message sent successfully?');
        console.log('   Message: Test message from comprehensive tests');
    });

    test('should wait for reply', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.chat.waitforReply('Test question');

        expect(response).toBeDefined();

        // AskUserQuestion: Verify reply
        console.log('✅ AskUserQuestion: Was the reply received successfully?');
        console.log('   Reply:', response.message?.substring(0, 100));
    });
});
