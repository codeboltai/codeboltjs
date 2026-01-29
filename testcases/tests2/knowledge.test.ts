/**
 * Test Suite for Knowledge Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Knowledge Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Knowledge module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Knowledge module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should initialize knowledge module', async () => {
        const codebolt = sharedCodebolt();

        // Test initialization
        const initResponse = codebolt.knowledge.init();

        expect(initResponse).toBeDefined();

        // AskUserQuestion: Verify knowledge initialization
        console.log('✅ AskUserQuestion: Was the knowledge module initialized successfully?');
        console.log('   Init response:', initResponse);
    });

    test('should add knowledge with filename and file path', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.knowledge.add_file(
            'test-knowledge.txt',
            '/test/path/test-knowledge.txt'
        );

        expect(response).toBeDefined();

        // AskUserQuestion: Verify knowledge addition
        console.log('✅ AskUserQuestion: Was the knowledge file added successfully?');
        console.log('   Filename: test-knowledge.txt');
        console.log('   Path: /test/path/test-knowledge.txt');
    });

    test('should retrieve related knowledge for a query', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.knowledge.retrieve_related_knowledge(
            'test query',
            'test-knowledge.txt'
        );

        expect(response).toBeDefined();

        // AskUserQuestion: Verify knowledge retrieval
        console.log('✅ AskUserQuestion: Was related knowledge retrieved successfully?');
        console.log('   Query: test query');
        console.log('   Filename: test-knowledge.txt');
        console.log('   Retrieved knowledge:', response);
    });

    test('should handle multiple knowledge file additions', async () => {
        const codebolt = sharedCodebolt();

        const files = [
            { name: 'file1.txt', path: '/test/path/file1.txt' },
            { name: 'file2.txt', path: '/test/path/file2.txt' },
            { name: 'file3.txt', path: '/test/path/file3.txt' }
        ];

        const responses = await Promise.all(
            files.map(file => codebolt.knowledge.add_file(file.name, file.path))
        );

        expect(responses).toHaveLength(3);
        expect(responses.every(r => r !== undefined)).toBe(true);

        // AskUserQuestion: Verify multiple knowledge additions
        console.log('✅ AskUserQuestion: Were all 3 knowledge files added successfully?');
        console.log('   Files added:', files.map(f => f.name).join(', '));
    });

    test('should retrieve knowledge for different file types', async () => {
        const codebolt = sharedCodebolt();

        const testCases = [
            { filename: 'test.ts', query: 'TypeScript code' },
            { filename: 'test.js', query: 'JavaScript code' },
            { filename: 'test.py', query: 'Python code' }
        ];

        for (const testCase of testCases) {
            const response = await codebolt.knowledge.retrieve_related_knowledge(
                testCase.query,
                testCase.filename
            );

            expect(response).toBeDefined();
        }

        // AskUserQuestion: Verify knowledge retrieval for different file types
        console.log('✅ AskUserQuestion: Was knowledge retrieved for all file types?');
        console.log('   File types tested: .ts, .js, .py');
    });
});
