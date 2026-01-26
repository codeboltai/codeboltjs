/**
 * Test Suite for RAG (Retrieval-Augmented Generation) Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('RAG Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for RAG module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All RAG module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should initialize RAG module', async () => {
        const codebolt = sharedCodebolt();

        // Test initialization
        const initResponse = codebolt.rag.init();

        expect(initResponse).toBeDefined();

        // AskUserQuestion: Verify RAG initialization
        console.log('✅ AskUserQuestion: Was the RAG module initialized successfully?');
        console.log('   Init response:', initResponse);
    });

    test('should add file to RAG system', async () => {
        const codebolt = sharedCodebolt();

        const filename = 'test-rag-file.txt';
        const filePath = '/test/path/test-rag-file.txt';

        const response = await codebolt.rag.add_file(filename, filePath);

        expect(response).toBeDefined();

        // AskUserQuestion: Verify file addition to RAG
        console.log('✅ AskUserQuestion: Was the file added to the RAG system successfully?');
        console.log('   Filename:', filename);
        console.log('   File path:', filePath);
    });

    test('should retrieve related knowledge from RAG', async () => {
        const codebolt = sharedCodebolt();

        const query = 'test query for RAG retrieval';
        const filename = 'test-rag-file.txt';

        const response = await codebolt.rag.retrieve_related_knowledge(query, filename);

        expect(response).toBeDefined();

        // AskUserQuestion: Verify RAG knowledge retrieval
        console.log('✅ AskUserQuestion: Was related knowledge retrieved from RAG successfully?');
        console.log('   Query:', query);
        console.log('   Filename:', filename);
        console.log('   Retrieved knowledge:', response);
    });

    test('should handle multiple RAG file additions and retrievals', async () => {
        const codebolt = sharedCodebolt();

        const files = [
            { name: 'rag1.txt', path: '/test/path/rag1.txt' },
            { name: 'rag2.txt', path: '/test/path/rag2.txt' },
            { name: 'rag3.txt', path: '/test/path/rag3.txt' }
        ];

        // Add all files
        const addResponses = await Promise.all(
            files.map(file => codebolt.rag.add_file(file.name, file.path))
        );

        expect(addResponses).toHaveLength(3);

        // Retrieve knowledge for each file
        const retrieveResponses = await Promise.all(
            files.map(file => codebolt.rag.retrieve_related_knowledge('test query', file.name))
        );

        expect(retrieveResponses).toHaveLength(3);

        // AskUserQuestion: Verify multiple RAG operations
        console.log('✅ AskUserQuestion: Were all RAG files added and retrieved successfully?');
        console.log('   Files processed:', files.map(f => f.name).join(', '));
    });

    test('should handle different query types in RAG retrieval', async () => {
        const codebolt = sharedCodebolt();

        const queries = [
            'simple query',
            'complex multi-word query with details',
            'query with special characters: @#$%'
        ];

        const filename = 'test-query-variations.txt';

        for (const query of queries) {
            const response = await codebolt.rag.retrieve_related_knowledge(query, filename);
            expect(response).toBeDefined();
        }

        // AskUserQuestion: Verify RAG handles different query types
        console.log('✅ AskUserQuestion: Did RAG handle all different query types successfully?');
        console.log('   Query types tested:', queries.length);
    });
});
