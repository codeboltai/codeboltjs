/**
 * Test Suite for Search Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Search Module', () => {
    beforeAll(async () => {
        console.log('[Search Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Search Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should initialize search', async () => {
        const codebolt = sharedCodebolt();

        // Note: This is a synchronous operation
        codebolt.search.init('bing');

        // AskUserQuestion: Verify initialization
        console.log('✅ AskUserQuestion: Was the search module initialized?');
        console.log('   Engine: bing');
    });

    test('should perform search', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.search.search('test query');

        expect(response).toBeDefined();
        expect(typeof response).toBe('string');

        // AskUserQuestion: Verify search
        console.log('✅ AskUserQuestion: Was the search performed successfully?');
        console.log('   Query: test query');
        console.log('   Results Preview:', response.substring(0, 100));
    });

    test('should get first search result link', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.search.get_first_link('test query');

        expect(response).toBeDefined();
        expect(typeof response).toBe('string');

        // AskUserQuestion: Verify first link retrieval
        console.log('✅ AskUserQuestion: Was the first link retrieved successfully?');
        console.log('   Link:', response);
    });
});
