/**
 * Test Suite for Codemap Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Codemap Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Codemap module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Codemap module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should list codemaps', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.codemap.list();

        expect(response).toBeDefined();
        expect(Array.isArray(response.codemaps)).toBe(true);

        // AskUserQuestion: Verify codemaps listing
        console.log('✅ AskUserQuestion: Were codemaps listed successfully?');
        console.log('   Total Codemaps:', response.codemaps?.length || 0);
    });

    test('should create codemap', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.codemap.create({
            name: `Test Codemap ${Date.now()}`,
            description: 'Test codemap description'
        });

        expect(response).toBeDefined();
        expect(response.codemap).toBeDefined();

        // AskUserQuestion: Verify codemap creation
        console.log('✅ AskUserQuestion: Was the codemap created successfully?');
        console.log('   Codemap ID:', response.codemap?.id);
    });

    test('should get codemap detail', async () => {
        const codebolt = sharedCodebolt();

        // First create a codemap
        const createResponse = await codebolt.codemap.create({
            name: `Test Codemap for Get ${Date.now()}`
        });
        const codemapId = createResponse.codemap?.id || '';

        // Get codemap detail
        const response = await codebolt.codemap.get(codemapId);

        expect(response).toBeDefined();
        expect(response.codemap).toBeDefined();

        // AskUserQuestion: Verify codemap retrieval
        console.log('✅ AskUserQuestion: Was the codemap retrieved successfully?');
        console.log('   Codemap:', response.codemap?.name);
    });

    test('should update codemap status', async () => {
        const codebolt = sharedCodebolt();

        // First create a codemap
        const createResponse = await codebolt.codemap.create({
            name: `Test Codemap for Status ${Date.now()}`
        });
        const codemapId = createResponse.codemap?.id || '';

        // Update status
        const response = await codebolt.codemap.setStatus(codemapId, 'generating');

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify status update
        console.log('✅ AskUserQuestion: Was the codemap status updated successfully?');
        console.log('   Success:', response.success);
    });
});
