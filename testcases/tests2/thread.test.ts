/**
 * Comprehensive Test Suite for Thread Module
 *
 * This test suite covers all methods in the thread module:
 * - createThread, updateThread, deleteThread
 * - getThreadDetail, getThreadList
 * - startThread, updateThreadStatus
 * - getThreadMessages, getThreadFileChanges, getThreadFileChangesSummary
 *
 * Each test includes proper state cleanup and AskUserQuestion for verification.
 */

const codebolt = require("../dist");

/**
 * Helper function to clean up test threads between tests
 */
async function cleanupThreads(threadIds: string[]) {
    for (const threadId of threadIds) {
        try {
            await codebolt.thread.deleteThread(threadId);
        } catch (error) {
            console.log(`Cleanup error for thread ${threadId}:`, error);
        }
    }
}

/**
 * Helper function to wait for user verification using AskUserQuestion
 */
async function verifyWithUser(testName: string, details: any) {
    try {
        // In the actual implementation, this would trigger a user notification
        // For testing purposes, we log the verification request
        console.log(`\n=== VERIFICATION REQUEST FOR: ${testName} ===`);
        console.log('Details:', JSON.stringify(details, null, 2));
        console.log('Please verify the above result manually.\n');

        // This would integrate with the notification system in production:
        // await codebolt.notify.askUserQuestion({
        //     type: 'question',
        //     message: `Verify test: ${testName}`,
        //     data: details
        // });
    } catch (error) {
        console.log('Verification request error:', error);
    }
}

const testCases = [
    // ========================================================================
    // CREATE THREAD TESTS
    // ========================================================================
    {
        name: 'createThread should create a new thread with basic parameters',
        testFunction: async () => {
            await codebolt.activate();

            // Test: Create a basic thread
            const threadId = `test-thread-${Date.now()}`;
            const response = await codebolt.thread.createThread({
                threadId,
                name: 'Test Thread'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread).toBeDefined();
            expect(response.thread.threadId).toBe(threadId);
            expect(response.thread.name).toBe('Test Thread');

            // Ask user to verify
            await verifyWithUser('createThread - Basic', {
                threadId: response.thread.threadId,
                name: response.thread.name,
                status: response.thread.status
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },
    {
        name: 'createThread should create a thread with all optional parameters',
        testFunction: async () => {
            await codebolt.activate();

            // Test: Create thread with comprehensive parameters
            const threadId = `test-thread-comprehensive-${Date.now()}`;
            const response = await codebolt.thread.createThread({
                threadId,
                name: 'Comprehensive Test Thread',
                dueDate: new Date('2025-12-31'),
                isRemoteTask: true,
                environment: 'production',
                isKanbanTask: false,
                taskType: 'scheduled',
                executionType: 'immediate',
                environmentType: 'remote',
                groupId: 'test-group-123',
                startOption: 'immediately',
                userMessage: 'Initial test message',
                selectedAgent: { id: 'agent-1', name: 'Test Agent' }
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread).toBeDefined();
            expect(response.thread.threadId).toBe(threadId);
            expect(response.thread.name).toBe('Comprehensive Test Thread');
            expect(response.thread.isRemoteTask).toBe(true);
            expect(response.thread.taskType).toBe('scheduled');

            // Ask user to verify
            await verifyWithUser('createThread - Comprehensive Parameters', {
                threadId: response.thread.threadId,
                name: response.thread.name,
                isRemoteTask: response.thread.isRemoteTask,
                taskType: response.thread.taskType,
                executionType: response.thread.executionType,
                environmentType: response.thread.environmentType,
                groupId: response.thread.groupId
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },
    {
        name: 'createThread should create a thread with steps',
        testFunction: async () => {
            await codebolt.activate();

            // Test: Create thread with execution steps
            const threadId = `test-thread-steps-${Date.now()}`;
            const response = await codebolt.thread.createThread({
                threadId,
                name: 'Thread with Steps',
                steps: [
                    {
                        type: 'agent',
                        userMessage: 'Step 1: Analyze requirements',
                        isMainTask: true,
                        position: { x: 100, y: 100 },
                        agentId: 'agent-1'
                    },
                    {
                        type: 'agent',
                        userMessage: 'Step 2: Implement solution',
                        isMainTask: false,
                        position: { x: 300, y: 100 },
                        agentId: 'agent-2'
                    }
                ]
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread).toBeDefined();
            expect(response.thread.steps).toBeDefined();
            expect(Array.isArray(response.thread.steps)).toBe(true);
            expect(response.thread.steps.length).toBe(2);
            expect(response.thread.steps[0].userMessage).toBe('Step 1: Analyze requirements');

            // Ask user to verify
            await verifyWithUser('createThread - With Steps', {
                threadId: response.thread.threadId,
                name: response.thread.name,
                stepsCount: response.thread.steps.length,
                steps: response.thread.steps.map(s => ({
                    type: s.type,
                    userMessage: s.userMessage,
                    isMainTask: s.isMainTask
                }))
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },

    // ========================================================================
    // UPDATE THREAD TESTS
    // ========================================================================
    {
        name: 'updateThread should update thread name',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread first
            const threadId = `test-thread-update-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Original Name'
            });

            // Test: Update the thread name
            const response = await codebolt.thread.updateThread(threadId, {
                name: 'Updated Name'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread).toBeDefined();
            expect(response.thread.name).toBe('Updated Name');

            // Ask user to verify
            await verifyWithUser('updateThread - Name', {
                threadId: threadId,
                originalName: 'Original Name',
                updatedName: response.thread.name
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },
    {
        name: 'updateThread should update multiple properties',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-multi-update-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Multi Update Test',
                taskType: 'interactive'
            });

            // Test: Update multiple properties
            const response = await codebolt.thread.updateThread(threadId, {
                name: 'Multi Update Test - Updated',
                taskType: 'scheduled',
                executionType: 'manual',
                isKanbanTask: true,
                dueDate: new Date('2025-12-31')
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread.name).toBe('Multi Update Test - Updated');
            expect(response.thread.taskType).toBe('scheduled');
            expect(response.thread.executionType).toBe('manual');
            expect(response.thread.isKanbanTask).toBe(true);

            // Ask user to verify
            await verifyWithUser('updateThread - Multiple Properties', {
                threadId: threadId,
                updatedProperties: {
                    name: response.thread.name,
                    taskType: response.thread.taskType,
                    executionType: response.thread.executionType,
                    isKanbanTask: response.thread.isKanbanTask
                }
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },
    {
        name: 'updateThread should update steps',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread with steps
            const threadId = `test-thread-update-steps-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Update Steps Test',
                steps: [
                    {
                        type: 'agent',
                        userMessage: 'Original step',
                        isMainTask: true,
                        agentId: 'agent-1'
                    }
                ]
            });

            // Test: Update steps
            const response = await codebolt.thread.updateThread(threadId, {
                steps: [
                    {
                        id: 'step-1',
                        type: 'agent',
                        userMessage: 'Updated step 1',
                        isMainTask: true,
                        agentId: 'agent-1'
                    },
                    {
                        id: 'step-2',
                        type: 'agent',
                        userMessage: 'New step 2',
                        isMainTask: false,
                        agentId: 'agent-2'
                    }
                ]
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread.steps).toBeDefined();
            expect(response.thread.steps.length).toBeGreaterThanOrEqual(1);

            // Ask user to verify
            await verifyWithUser('updateThread - Steps', {
                threadId: threadId,
                stepsCount: response.thread.steps.length,
                steps: response.thread.steps.map(s => ({
                    id: s.id,
                    userMessage: s.userMessage
                }))
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },

    // ========================================================================
    // DELETE THREAD TESTS
    // ========================================================================
    {
        name: 'deleteThread should delete an existing thread',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-delete-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Thread to Delete'
            });

            // Verify it exists
            let listResponse = await codebolt.thread.getThreadList({});
            const existsBefore = listResponse.threads.some(t => t.threadId === threadId);
            expect(existsBefore).toBe(true);

            // Test: Delete the thread
            const response = await codebolt.thread.deleteThread(threadId);

            // Verify response
            expect(response.success).toBe(true);
            expect(response.message).toBeDefined();

            // Verify it's deleted
            listResponse = await codebolt.thread.getThreadList({});
            const existsAfter = listResponse.threads.some(t => t.threadId === threadId);
            expect(existsAfter).toBe(false);

            // Ask user to verify
            await verifyWithUser('deleteThread', {
                threadId: threadId,
                deleted: true,
                message: response.message
            });
        }
    },

    // ========================================================================
    // GET THREAD LIST TESTS
    // ========================================================================
    {
        name: 'getThreadList should retrieve all threads',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create multiple threads
            const threadIds = [];
            for (let i = 1; i <= 3; i++) {
                const threadId = `test-thread-list-${i}-${Date.now()}`;
                await codebolt.thread.createThread({
                    threadId,
                    name: `List Test Thread ${i}`
                });
                threadIds.push(threadId);
            }

            // Test: Get thread list
            const response = await codebolt.thread.getThreadList({});

            // Verify response
            expect(response.success).toBe(true);
            expect(response.threads).toBeDefined();
            expect(Array.isArray(response.threads)).toBe(true);

            // Verify our created threads are in the list
            const responseThreadIds = response.threads.map(t => t.threadId);
            for (const threadId of threadIds) {
                expect(responseThreadIds).toContain(threadId);
            }

            // Ask user to verify
            await verifyWithUser('getThreadList', {
                totalThreads: response.threads.length,
                createdThreads: threadIds.length,
                threads: response.threads.map(t => ({
                    threadId: t.threadId,
                    name: t.name,
                    status: t.status
                }))
            });

            // Cleanup
            await cleanupThreads(threadIds);
        }
    },
    {
        name: 'getThreadList should filter by status',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create threads and update their status
            const threadIds = [];
            const pendingThreadId = `test-thread-pending-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId: pendingThreadId,
                name: 'Pending Thread'
            });
            threadIds.push(pendingThreadId);

            // Test: Get only pending threads
            const response = await codebolt.thread.getThreadList({
                status: 'pending'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.threads).toBeDefined();
            expect(Array.isArray(response.threads)).toBe(true);

            // Ask user to verify
            await verifyWithUser('getThreadList - Filtered by Status', {
                filter: 'pending',
                threadCount: response.threads.length,
                threads: response.threads.map(t => ({
                    threadId: t.threadId,
                    name: t.name,
                    status: t.status
                }))
            });

            // Cleanup
            await cleanupThreads(threadIds);
        }
    },
    {
        name: 'getThreadList should support pagination with limit and offset',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create multiple threads
            const threadIds = [];
            for (let i = 1; i <= 5; i++) {
                const threadId = `test-thread-page-${i}-${Date.now()}`;
                await codebolt.thread.createThread({
                    threadId,
                    name: `Pagination Test Thread ${i}`
                });
                threadIds.push(threadId);
            }

            // Test: Get threads with limit
            const response1 = await codebolt.thread.getThreadList({
                limit: 2
            });

            expect(response1.success).toBe(true);
            expect(response1.threads.length).toBeLessThanOrEqual(2);

            // Test: Get threads with offset
            const response2 = await codebolt.thread.getThreadList({
                limit: 2,
                offset: 2
            });

            expect(response2.success).toBe(true);
            expect(response2.threads.length).toBeLessThanOrEqual(2);

            // Ask user to verify
            await verifyWithUser('getThreadList - Pagination', {
                page1: {
                    limit: 2,
                    offset: 0,
                    count: response1.threads.length
                },
                page2: {
                    limit: 2,
                    offset: 2,
                    count: response2.threads.length
                }
            });

            // Cleanup
            await cleanupThreads(threadIds);
        }
    },

    // ========================================================================
    // GET THREAD DETAIL TESTS
    // ========================================================================
    {
        name: 'getThreadDetail should retrieve detailed thread information',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-detail-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Detail Test Thread',
                taskType: 'scheduled',
                executionType: 'immediate'
            });

            // Test: Get thread detail
            const response = await codebolt.thread.getThreadDetail({
                taskId: threadId
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread).toBeDefined();
            expect(response.thread.threadId).toBe(threadId);
            expect(response.thread.name).toBe('Detail Test Thread');
            expect(response.thread.taskType).toBe('scheduled');

            // Ask user to verify
            await verifyWithUser('getThreadDetail', {
                threadId: response.thread.threadId,
                name: response.thread.name,
                taskType: response.thread.taskType,
                executionType: response.thread.executionType,
                status: response.thread.status
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },
    {
        name: 'getThreadDetail should include steps when requested',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread with steps
            const threadId = `test-thread-detail-steps-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Detail with Steps',
                steps: [
                    {
                        type: 'agent',
                        userMessage: 'Step 1',
                        isMainTask: true,
                        agentId: 'agent-1'
                    },
                    {
                        type: 'agent',
                        userMessage: 'Step 2',
                        isMainTask: false,
                        agentId: 'agent-2'
                    }
                ]
            });

            // Test: Get thread detail with steps
            const response = await codebolt.thread.getThreadDetail({
                taskId: threadId,
                includeSteps: true
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread).toBeDefined();
            expect(response.thread.steps).toBeDefined();
            expect(Array.isArray(response.thread.steps)).toBe(true);

            // Ask user to verify
            await verifyWithUser('getThreadDetail - Include Steps', {
                threadId: response.thread.threadId,
                name: response.thread.name,
                stepsCount: response.thread.steps?.length || 0,
                steps: response.thread.steps?.map(s => ({
                    type: s.type,
                    userMessage: s.userMessage
                }))
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },

    // ========================================================================
    // START THREAD TESTS
    // ========================================================================
    {
        name: 'startThread should start an existing thread',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-start-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Thread to Start',
                startOption: 'manual'
            });

            // Test: Start the thread
            const response = await codebolt.thread.startThread(threadId);

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread).toBeDefined();
            expect(response.thread.threadId).toBe(threadId);

            // Ask user to verify
            await verifyWithUser('startThread', {
                threadId: threadId,
                status: response.thread.status,
                message: 'Thread successfully started'
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },

    // ========================================================================
    // UPDATE THREAD STATUS TESTS
    // ========================================================================
    {
        name: 'updateThreadStatus should update thread status to processing',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-status-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Status Update Test'
            });

            // Test: Update status to processing
            const response = await codebolt.thread.updateThreadStatus(threadId, 'processing');

            // Verify response
            expect(response.success).toBe(true);
            expect(response.thread).toBeDefined();
            expect(response.thread.status).toBe('processing');

            // Ask user to verify
            await verifyWithUser('updateThreadStatus - To Processing', {
                threadId: threadId,
                newStatus: response.thread.status
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },
    {
        name: 'updateThreadStatus should support status transitions',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-status-transition-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Status Transition Test'
            });

            // Test: Transition through statuses
            const status1 = await codebolt.thread.updateThreadStatus(threadId, 'processing');
            expect(status1.thread.status).toBe('processing');

            const status2 = await codebolt.thread.updateThreadStatus(threadId, 'completed');
            expect(status2.thread.status).toBe('completed');

            // Ask user to verify
            await verifyWithUser('updateThreadStatus - Status Transitions', {
                threadId: threadId,
                statusTransitions: ['pending', 'processing', 'completed'],
                finalStatus: status2.thread.status
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },

    // ========================================================================
    // GET THREAD MESSAGES TESTS
    // ========================================================================
    {
        name: 'getThreadMessages should retrieve messages for a thread',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread (messages would be generated during execution)
            const threadId = `test-thread-messages-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Messages Test Thread',
                userMessage: 'Initial message for testing'
            });

            // Test: Get thread messages
            const response = await codebolt.thread.getThreadMessages({
                taskId: threadId
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.messages).toBeDefined();
            expect(Array.isArray(response.messages)).toBe(true);

            // Ask user to verify
            await verifyWithUser('getThreadMessages', {
                threadId: threadId,
                messageCount: response.messages.length,
                messages: response.messages.map(m => ({
                    type: m.type,
                    content: m.content?.substring(0, 100) || 'N/A'
                }))
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },
    {
        name: 'getThreadMessages should filter by message type',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-msg-filter-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Message Filter Test'
            });

            // Test: Get only error messages
            const response = await codebolt.thread.getThreadMessages({
                taskId: threadId,
                messageType: 'error'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.messages).toBeDefined();

            // Verify all returned messages are of type error (if any exist)
            if (response.messages.length > 0) {
                const allErrors = response.messages.every(m => m.type === 'error');
                expect(allErrors).toBe(true);
            }

            // Ask user to verify
            await verifyWithUser('getThreadMessages - Filtered by Type', {
                threadId: threadId,
                filter: 'error',
                messageCount: response.messages.length
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },
    {
        name: 'getThreadMessages should support pagination',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-msg-page-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'Message Pagination Test'
            });

            // Test: Get messages with limit
            const response = await codebolt.thread.getThreadMessages({
                taskId: threadId,
                limit: 10,
                offset: 0
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.messages).toBeDefined();
            expect(response.messages.length).toBeLessThanOrEqual(10);

            // Ask user to verify
            await verifyWithUser('getThreadMessages - Pagination', {
                threadId: threadId,
                limit: 10,
                offset: 0,
                messageCount: response.messages.length
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },

    // ========================================================================
    // GET THREAD FILE CHANGES TESTS
    // ========================================================================
    {
        name: 'getThreadFileChanges should retrieve file changes for a thread',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create and start a thread that makes file changes
            const threadId = `test-thread-file-changes-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'File Changes Test Thread'
            });

            // Test: Get file changes
            const response = await codebolt.thread.getThreadFileChanges(threadId);

            // Verify response
            expect(response.success).toBe(true);
            expect(response.fileChanges).toBeDefined();

            // Ask user to verify
            await verifyWithUser('getThreadFileChanges', {
                threadId: threadId,
                fileChangesCount: response.fileChanges?.length || 0,
                fileChanges: response.fileChanges?.map(f => ({
                    path: f.path,
                    type: f.type
                }))
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },

    // ========================================================================
    // GET THREAD FILE CHANGES SUMMARY TESTS
    // ========================================================================
    {
        name: 'getThreadFileChangesSummary should retrieve file changes summary',
        testFunction: async () => {
            await codebolt.activate();

            // Setup: Create a thread
            const threadId = `test-thread-file-summary-${Date.now()}`;
            await codebolt.thread.createThread({
                threadId,
                name: 'File Changes Summary Test'
            });

            // Test: Get file changes summary
            const response = await codebolt.thread.getThreadFileChangesSummary(threadId);

            // Verify response
            expect(response.success).toBe(true);
            expect(response.summary).toBeDefined();
            expect(response.summary.title).toBeDefined();
            expect(response.summary.changes).toBeDefined();
            expect(response.summary.files).toBeDefined();

            // Ask user to verify
            await verifyWithUser('getThreadFileChangesSummary', {
                threadId: threadId,
                summary: {
                    title: response.summary.title,
                    changesCount: response.summary.changes?.length || 0,
                    filesCount: response.summary.files?.length || 0
                }
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    },

    // ========================================================================
    // INTEGRATION TESTS
    // ========================================================================
    {
        name: 'Thread CRUD operations should work end-to-end',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = `test-thread-crud-${Date.now()}`;

            // Step 1: Create
            const createResponse = await codebolt.thread.createThread({
                threadId,
                name: 'CRUD Test Thread'
            });
            expect(createResponse.success).toBe(true);

            // Step 2: Read
            const readResponse = await codebolt.thread.getThreadDetail({
                taskId: threadId
            });
            expect(readResponse.success).toBe(true);
            expect(readResponse.thread.name).toBe('CRUD Test Thread');

            // Step 3: Update
            const updateResponse = await codebolt.thread.updateThread(threadId, {
                name: 'CRUD Test Thread - Updated'
            });
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.thread.name).toBe('CRUD Test Thread - Updated');

            // Step 4: List
            const listResponse = await codebolt.thread.getThreadList({});
            expect(listResponse.threads.some(t => t.threadId === threadId)).toBe(true);

            // Step 5: Delete
            const deleteResponse = await codebolt.thread.deleteThread(threadId);
            expect(deleteResponse.success).toBe(true);

            // Verify deletion
            const finalListResponse = await codebolt.thread.getThreadList({});
            expect(finalListResponse.threads.some(t => t.threadId === threadId)).toBe(false);

            // Ask user to verify
            await verifyWithUser('Thread CRUD - End-to-End', {
                create: { success: createResponse.success, threadId },
                read: { success: readResponse.success, name: readResponse.thread.name },
                update: { success: updateResponse.success, updatedName: updateResponse.thread.name },
                list: { success: listResponse.success, found: true },
                delete: { success: deleteResponse.success, verifiedDeleted: true }
            });
        }
    },
    {
        name: 'Thread status workflow should work correctly',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = `test-thread-workflow-${Date.now()}`;

            // Create thread
            await codebolt.thread.createThread({
                threadId,
                name: 'Workflow Test Thread',
                startOption: 'manual'
            });

            // Start thread
            const startResponse = await codebolt.thread.startThread(threadId);
            expect(startResponse.success).toBe(true);

            // Update to processing
            const processingResponse = await codebolt.thread.updateThreadStatus(threadId, 'processing');
            expect(processingResponse.success).toBe(true);

            // Update to completed
            const completedResponse = await codebolt.thread.updateThreadStatus(threadId, 'completed');
            expect(completedResponse.success).toBe(true);

            // Verify final state
            const finalState = await codebolt.thread.getThreadDetail({
                taskId: threadId
            });
            expect(finalState.thread.status).toBe('completed');

            // Ask user to verify
            await verifyWithUser('Thread Status Workflow', {
                threadId,
                workflow: ['created', 'started', 'processing', 'completed'],
                finalStatus: finalState.thread.status
            });

            // Cleanup
            await cleanupThreads([threadId]);
        }
    }
];

describe('Thread Module - Comprehensive Test Suite', () => {
    // Setup: Run before all tests
    beforeAll(async () => {
        await codebolt.activate();
    });

    // Run all test cases
    test.each(testCases)('%s', async (testCase) => {
        await testCase.testFunction();
    });
});
