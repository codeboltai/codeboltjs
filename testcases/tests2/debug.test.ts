/**
 * Test Suite for Debug Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Debug Module', () => {
    beforeAll(async () => {
        console.log('[Debug Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Debug Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should send debug log', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.debug.debug('Test debug log message', 'info');

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify debug log
        console.log('✅ AskUserQuestion: Was the debug log sent successfully?');
        console.log('   Success:', response.success);
    });

    test('should send error log', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.debug.debug('Test error message', 'error');

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify error log
        console.log('✅ AskUserQuestion: Was the error log sent successfully?');
        console.log('   Success:', response.success);
    });

    test('should open debug browser', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.debug.openDebugBrowser('http://localhost:3000', 9222);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify debug browser
        console.log('✅ AskUserQuestion: Was the debug browser opened successfully?');
        console.log('   Success:', response.success);
    });
});
