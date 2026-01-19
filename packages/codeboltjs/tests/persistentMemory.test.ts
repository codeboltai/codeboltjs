/**
 * Test Suite for Persistent Memory Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Persistent Memory Module', () => {
    let testMemoryId: string;

    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Persistent Memory module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Persistent Memory module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should create a new persistent memory', async () => {
        const codebolt = sharedCodebolt();

        const config = {
            name: 'test-persistent-memory',
            description: 'Test persistent memory configuration',
            retrievalConfig: {
                type: 'semantic',
                embeddingModel: 'text-embedding-ada-002'
            }
        };

        const response = await codebolt.persistentMemory.create(config);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        testMemoryId = response.data?.id || '';

        // AskUserQuestion: Verify persistent memory creation
        console.log('✅ AskUserQuestion: Was the persistent memory created successfully?');
        console.log('   Memory name:', config.name);
        console.log('   Memory ID:', testMemoryId);
        console.log('   Success:', response.success);
    });

    test('should get a persistent memory by ID', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const response = await codebolt.persistentMemory.get(testMemoryId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        // AskUserQuestion: Verify persistent memory retrieval
        console.log('✅ AskUserQuestion: Was the persistent memory retrieved successfully?');
        console.log('   Memory ID:', testMemoryId);
        console.log('   Memory name:', response.data?.name);
    });

    test('should list all persistent memories', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.persistentMemory.list();

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data?.memories)).toBe(true);

        // AskUserQuestion: Verify persistent memory listing
        console.log('✅ AskUserQuestion: Was the list of persistent memories retrieved successfully?');
        console.log('   Total memories:', response.data?.memories?.length);
    });

    test('should update a persistent memory', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const updates = {
            name: 'updated-persistent-memory',
            description: 'Updated description'
        };

        const response = await codebolt.persistentMemory.update(testMemoryId, updates);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify persistent memory update
        console.log('✅ AskUserQuestion: Was the persistent memory updated successfully?');
        console.log('   Memory ID:', testMemoryId);
        console.log('   New name:', updates.name);
    });

    test('should delete a persistent memory', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const response = await codebolt.persistentMemory.delete(testMemoryId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify persistent memory deletion
        console.log('✅ AskUserQuestion: Was the persistent memory deleted successfully?');
        console.log('   Memory ID:', testMemoryId);
    });

    test('should execute retrieval pipeline', async () => {
        const codebolt = sharedCodebolt();

        // First create a test memory
        const createResponse = await codebolt.persistentMemory.create({
            name: 'test-retrieval-memory',
            description: 'Memory for testing retrieval'
        });

        if (!createResponse.success || !createResponse.data?.id) {
            console.log('Skipping test - failed to create test memory');
            return;
        }

        const memoryId = createResponse.data.id;

        const intent = {
            query: 'test query for retrieval',
            context: {
                userId: 'user-123',
                sessionId: 'session-456'
            }
        };

        const response = await codebolt.persistentMemory.executeRetrieval(memoryId, intent);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // Clean up
        await codebolt.persistentMemory.delete(memoryId);

        // AskUserQuestion: Verify retrieval pipeline execution
        console.log('✅ AskUserQuestion: Was the retrieval pipeline executed successfully?');
        console.log('   Memory ID:', memoryId);
        console.log('   Query:', intent.query);
    });

    test('should validate a memory configuration', async () => {
        const codebolt = sharedCodebolt();

        const memoryConfig = {
            name: 'test-validation-memory',
            description: 'Memory for testing validation',
            retrievalConfig: {
                type: 'semantic',
                embeddingModel: 'text-embedding-ada-002'
            }
        };

        const response = await codebolt.persistentMemory.validate(memoryConfig);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify memory configuration validation
        console.log('✅ AskUserQuestion: Was the memory configuration validated successfully?');
        console.log('   Memory name:', memoryConfig.name);
        console.log('   Valid:', response.valid);
    });
});
