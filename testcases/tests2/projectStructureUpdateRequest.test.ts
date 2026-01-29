/**
 * Test Suite for Project Structure Update Request Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Project Structure Update Request Module', () => {
    let testRequestId: string;

    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Project Structure Update Request module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Project Structure Update Request module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should create a new update request', async () => {
        const codebolt = sharedCodebolt();

        const data = {
            title: 'Test Update Request',
            description: 'Test update request description',
            changes: [
                {
                    type: 'create',
                    path: '/test/new-file.ts',
                    content: 'test content'
                }
            ]
        };

        const response = await codebolt.projectStructureUpdateRequest.create(data);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        testRequestId = response.data?.id || '';

        // AskUserQuestion: Verify update request creation
        console.log('✅ AskUserQuestion: Was the update request created successfully?');
        console.log('   Request title:', data.title);
        console.log('   Request ID:', testRequestId);
        console.log('   Success:', response.success);
    });

    test('should get an update request by ID', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const response = await codebolt.projectStructureUpdateRequest.get(testRequestId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(response.data?.id).toBe(testRequestId);

        // AskUserQuestion: Verify update request retrieval
        console.log('✅ AskUserQuestion: Was the update request retrieved successfully?');
        console.log('   Request ID:', testRequestId);
        console.log('   Request title:', response.data?.title);
    });

    test('should list all update requests', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.projectStructureUpdateRequest.list();

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(Array.isArray(response.data?.requests)).toBe(true);

        // AskUserQuestion: Verify update request listing
        console.log('✅ AskUserQuestion: Was the list of update requests retrieved successfully?');
        console.log('   Total requests:', response.data?.requests?.length);
    });

    test('should list update requests with filters', async () => {
        const codebolt = sharedCodebolt();

        const filters = {
            status: 'pending',
            limit: 10
        };

        const response = await codebolt.projectStructureUpdateRequest.list(filters);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        // AskUserQuestion: Verify filtered update request listing
        console.log('✅ AskUserQuestion: Were the filtered update requests retrieved successfully?');
        console.log('   Filter status:', filters.status);
        console.log('   Requests found:', response.data?.requests?.length);
    });

    test('should update an existing update request', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const updates = {
            title: 'Updated Test Request',
            description: 'Updated description'
        };

        const response = await codebolt.projectStructureUpdateRequest.update(testRequestId, updates);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify update request update
        console.log('✅ AskUserQuestion: Was the update request updated successfully?');
        console.log('   Request ID:', testRequestId);
        console.log('   New title:', updates.title);
    });

    test('should submit an update request for review', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const response = await codebolt.projectStructureUpdateRequest.submit(testRequestId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify update request submission
        console.log('✅ AskUserQuestion: Was the update request submitted successfully?');
        console.log('   Request ID:', testRequestId);
    });

    test('should start work on an update request', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const response = await codebolt.projectStructureUpdateRequest.startWork(testRequestId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify work start on update request
        console.log('✅ AskUserQuestion: Was work started on the update request successfully?');
        console.log('   Request ID:', testRequestId);
    });

    test('should complete work on an update request', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const response = await codebolt.projectStructureUpdateRequest.complete(testRequestId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify work completion on update request
        console.log('✅ AskUserQuestion: Was work completed on the update request successfully?');
        console.log('   Request ID:', testRequestId);
    });

    test('should add a dispute to an update request', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const disputeData = {
            reason: 'Test dispute reason',
            description: 'Test dispute description'
        };

        const response = await codebolt.projectStructureUpdateRequest.addDispute(testRequestId, disputeData);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify dispute addition
        console.log('✅ AskUserQuestion: Was the dispute added to the update request successfully?');
        console.log('   Request ID:', testRequestId);
        console.log('   Dispute reason:', disputeData.reason);
    });

    test('should add a comment to a dispute', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const commentData = {
            disputeId: 'dispute-123',
            comment: 'Test comment on dispute'
        };

        const response = await codebolt.projectStructureUpdateRequest.addComment(
            testRequestId,
            commentData.disputeId,
            commentData
        );

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify comment addition
        console.log('✅ AskUserQuestion: Was the comment added to the dispute successfully?');
        console.log('   Request ID:', testRequestId);
        console.log('   Dispute ID:', commentData.disputeId);
    });

    test('should watch an update request', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const watcherData = {
            watcherId: 'user-123',
            watcherName: 'Test User'
        };

        const response = await codebolt.projectStructureUpdateRequest.watch(testRequestId, watcherData);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify watching update request
        console.log('✅ AskUserQuestion: Was the update request watched successfully?');
        console.log('   Request ID:', testRequestId);
        console.log('   Watcher ID:', watcherData.watcherId);
    });

    test('should delete an update request', async () => {
        const codebolt = sharedCodebolt();

        if (!testRequestId) {
            console.log('Skipping test - no request ID available');
            return;
        }

        const response = await codebolt.projectStructureUpdateRequest.delete(testRequestId);

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify update request deletion
        console.log('✅ AskUserQuestion: Was the update request deleted successfully?');
        console.log('   Request ID:', testRequestId);
    });
});
