/**
 * Test Suite for Episodic Memory Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Episodic Memory Module', () => {
    let testMemoryId: string;

    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Episodic Memory module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Episodic Memory module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should create a new episodic memory', async () => {
        const codebolt = sharedCodebolt();

        const params = {
            title: 'Test Episodic Memory'
        };

        const response = await codebolt.episodicMemory.createMemory(params);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        testMemoryId = response.data?.id || '';

        // AskUserQuestion: Verify episodic memory creation
        console.log('✅ AskUserQuestion: Was the episodic memory created successfully?');
        console.log('   Memory title:', params.title);
        console.log('   Memory ID:', testMemoryId);
        console.log('   Success:', response.success);
    });

    test('should get an episodic memory by ID', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const response = await codebolt.episodicMemory.getMemory({ memoryId: testMemoryId });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data?.id).toBe(testMemoryId);

        // AskUserQuestion: Verify episodic memory retrieval
        console.log('✅ AskUserQuestion: Was the episodic memory retrieved successfully?');
        console.log('   Memory ID:', testMemoryId);
        console.log('   Memory title:', response.data?.title);
    });

    test('should list all episodic memories', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.episodicMemory.listMemories();

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data)).toBe(true);

        // AskUserQuestion: Verify episodic memory listing
        console.log('✅ AskUserQuestion: Was the list of episodic memories retrieved successfully?');
        console.log('   Total memories:', response.data?.length);
    });

    test('should append an event to episodic memory', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const eventParams = {
            memoryId: testMemoryId,
            event_type: 'test_event',
            emitting_agent_id: 'agent-123',
            tags: ['test', 'unit-test'],
            payload: {
                message: 'Test event payload',
                timestamp: new Date().toISOString()
            }
        };

        const response = await codebolt.episodicMemory.appendEvent(eventParams);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        // AskUserQuestion: Verify event appending
        console.log('✅ AskUserQuestion: Was the event appended to episodic memory successfully?');
        console.log('   Memory ID:', testMemoryId);
        console.log('   Event type:', eventParams.event_type);
        console.log('   Event ID:', response.data?.id);
    });

    test('should query events from episodic memory', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const queryParams = {
            memoryId: testMemoryId,
            lastCount: 10,
            event_type: 'test_event'
        };

        const response = await codebolt.episodicMemory.queryEvents(queryParams);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data?.events)).toBe(true);

        // AskUserQuestion: Verify event querying
        console.log('✅ AskUserQuestion: Were events queried from episodic memory successfully?');
        console.log('   Memory ID:', testMemoryId);
        console.log('   Events found:', response.data?.events?.length);
        console.log('   Total events:', response.data?.total);
    });

    test('should get event types from episodic memory', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const response = await codebolt.episodicMemory.getEventTypes({ memoryId: testMemoryId });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data)).toBe(true);

        // AskUserQuestion: Verify event types retrieval
        console.log('✅ AskUserQuestion: Were event types retrieved successfully?');
        console.log('   Memory ID:', testMemoryId);
        console.log('   Event types:', response.data?.join(', '));
    });

    test('should get tags from episodic memory', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const response = await codebolt.episodicMemory.getTags({ memoryId: testMemoryId });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data)).toBe(true);

        // AskUserQuestion: Verify tags retrieval
        console.log('✅ AskUserQuestion: Were tags retrieved from episodic memory successfully?');
        console.log('   Memory ID:', testMemoryId);
        console.log('   Tags:', response.data?.join(', '));
    });

    test('should update episodic memory title', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const newTitle = 'Updated Test Episodic Memory';

        const response = await codebolt.episodicMemory.updateTitle({
            memoryId: testMemoryId,
            title: newTitle
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify memory title update
        console.log('✅ AskUserQuestion: Was the episodic memory title updated successfully?');
        console.log('   Memory ID:', testMemoryId);
        console.log('   New title:', newTitle);
    });

    test('should archive episodic memory', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const response = await codebolt.episodicMemory.archiveMemory({ memoryId: testMemoryId });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify memory archiving
        console.log('✅ AskUserQuestion: Was the episodic memory archived successfully?');
        console.log('   Memory ID:', testMemoryId);
    });

    test('should unarchive episodic memory', async () => {
        const codebolt = sharedCodebolt();

        if (!testMemoryId) {
            console.log('Skipping test - no memory ID available');
            return;
        }

        const response = await codebolt.episodicMemory.unarchiveMemory({ memoryId: testMemoryId });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify memory unarchiving
        console.log('✅ AskUserQuestion: Was the episodic memory unarchived successfully?');
        console.log('   Memory ID:', testMemoryId);
    });
});
