/**
 * Test Suite for Codeutils Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Codeutils Module', () => {
    beforeAll(async () => {
        console.log('[Codeutils Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Codeutils Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should get all files as markdown', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.codeutils.getAllFilesAsMarkDown();

        expect(response).toBeDefined();
        expect(typeof response.markdown).toBe('string');

        // AskUserQuestion: Verify markdown retrieval
        console.log('✅ AskUserQuestion: Were files converted to markdown successfully?');
        console.log('   Markdown Length:', response.markdown?.length || 0);
    });

    test('should get matcher list', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.codeutils.getMatcherList();

        expect(response).toBeDefined();
        expect(Array.isArray(response.matchers)).toBe(true);

        // AskUserQuestion: Verify matcher list
        console.log('✅ AskUserQuestion: Was the matcher list retrieved successfully?');
        console.log('   Total Matchers:', response.matchers?.length || 0);
    });

    test('should perform match operation', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.codeutils.performMatch(
            {
                name: 'test-matcher',
                pattern: 'test-pattern',
                language: 'javascript'
            },
            [
                {
                    pattern: 'const.*=.*require',
                    severity: 'warning',
                    message: 'Use ES6 imports instead'
                }
            ]
        );

        expect(response).toBeDefined();

        // AskUserQuestion: Verify match operation
        console.log('✅ AskUserQuestion: Was the match operation performed successfully?');
        console.log('   Problems Found:', response.problems?.length || 0);
    });
});
