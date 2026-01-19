/**
 * Test Suite for CodebaseSearch Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('CodebaseSearch Module', () => {
    beforeAll(async () => {
        console.log('[CodebaseSearch] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[CodebaseSearch] Connection ready');
    });

    describe('CodebaseSearch Module', () => {
        test('should perform semantic search', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.codebaseSearch.search('authentication function', ['src']);

            expect(response).toBeDefined();
            expect(Array.isArray(response.results)).toBe(true);

            // AskUserQuestion: Verify semantic search
            console.log('✅ AskUserQuestion: Was the semantic search performed successfully?');
            console.log('   Results Found:', response.results?.length || 0);
        });

        test('should search MCP tools', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.codebaseSearch.searchMcpTool('database', ['query', 'sql']);

            expect(response).toBeDefined();
            expect(Array.isArray(response.tools)).toBe(true);

            // AskUserQuestion: Verify MCP tool search
            console.log('✅ AskUserQuestion: Was the MCP tool search performed successfully?');
            console.log('   Tools Found:', response.tools?.length || 0);
        });
    });
});
