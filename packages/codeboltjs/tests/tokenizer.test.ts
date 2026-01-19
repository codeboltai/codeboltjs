/**
 * Test Suite for Tokenizer Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Tokenizer Module', () => {
    beforeAll(async () => {
        console.log('[Tokenizer Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Tokenizer Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should add token', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.tokenizer.addToken('test-token-key');

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify token addition
        console.log('✅ AskUserQuestion: Was the token added successfully?');
        console.log('   Success:', response.success);
    });

    test('should get token', async () => {
        const codebolt = sharedCodebolt();

        // First add a token
        await codebolt.tokenizer.addToken('test-get-token');

        // Then retrieve it
        const response = await codebolt.tokenizer.getToken('test-get-token');

        expect(response).toBeDefined();
        expect(response.token).toBeDefined();

        // AskUserQuestion: Verify token retrieval
        console.log('✅ AskUserQuestion: Was the token retrieved successfully?');
        console.log('   Token:', response.token?.item);
    });
});
