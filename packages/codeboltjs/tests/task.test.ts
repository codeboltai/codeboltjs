/**
 * Comprehensive Test Suite for Task Module
 *
 * This test suite covers all methods in the task module:
 * - createTask, updateTask, deleteTask
 * - getTaskDetail, getTaskList
 * - assignAgentToTask, executeTaskWithAgent
 * - getTaskStatus, getTaskSummary
 *
 * Each test includes proper state cleanup and verification logging.
 */

const codebolt = require("../dist");

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function to clean up all test tasks
 */
async function cleanupTasks() {
    try {
        // Get all tasks
        const listResponse = await codebolt.task.getTaskList({});

        if (listResponse.tasks && Array.isArray(listResponse.tasks) && listResponse.tasks.length > 0) {
            // Delete all tasks
            for (const task of listResponse.tasks) {
                try {
                    await codebolt.task.deleteTask(task.id);
                } catch (error) {
                    // Task might already be deleted or have dependencies
                    console.log(`Failed to delete task ${task.id}:`, error);
                }
            }
        }
    } catch (error) {
        console.log('Cleanup error (may be expected if no tasks exist):', error);
    }
}

/**
 * Helper function to log verification details
 */
async function logVerification(testName: string, details: any) {
    console.log(`\n=== VERIFICATION: ${testName} ===`);
    console.log('Details:', JSON.stringify(details, null, 2));
    console.log('Please verify the above result manually.\n');
}

/**
 * Helper function to get a unique test thread ID
 */
function getTestThreadId(): string {
    return `test-thread-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Helper function to get a unique test agent ID
 */
function getTestAgentId(): string {
    return `test-agent-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// ============================================================================
// Test Cases
// ============================================================================

const testCases = [
    // ========================================================================
    // CREATE TASK TESTS
    // ========================================================================
    {
        name: 'createTask should create a new task with basic parameters',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Test: Create a basic task
            const response = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Test Task - Basic',
                description: 'This is a test task for basic functionality'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.id).toBeDefined();
            expect(response.task.name).toBe('Test Task - Basic');
            expect(response.task.description).toBe('This is a test task for basic functionality');
            expect(response.task.threadId).toBe(threadId);

            // Log verification
            await logVerification('createTask - Basic', {
                taskId: response.task.id,
                name: response.task.name,
                description: response.task.description,
                status: response.task.status,
                threadId: response.task.threadId
            });

            // Cleanup
            await codebolt.task.deleteTask(response.task.id);
        }
    },

    {
        name: 'createTask should create a task with priority and tags',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Test: Create task with priority and tags
            const response = await codebolt.task.createTask({
                threadId: threadId,
                name: 'High Priority Task',
                description: 'Task with priority and tags',
                priority: 'high',
                tags: ['urgent', 'frontend', 'bug']
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.name).toBe('High Priority Task');
            expect(response.task.priority).toBe('high');
            expect(response.task.tags).toEqual(['urgent', 'frontend', 'bug']);

            // Log verification
            await logVerification('createTask - With Priority and Tags', {
                taskId: response.task.id,
                name: response.task.name,
                priority: response.task.priority,
                tags: response.task.tags
            });

            // Cleanup
            await codebolt.task.deleteTask(response.task.id);
        }
    },

    {
        name: 'createTask should create a task with project information',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Test: Create task with project info
            const response = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Project Task',
                description: 'Task associated with a project',
                projectId: 123,
                projectPath: '/Users/test/project',
                projectName: 'TestProject'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.name).toBe('Project Task');
            expect(response.task.projectId).toBe(123);
            expect(response.task.projectPath).toBe('/Users/test/project');
            expect(response.task.projectName).toBe('TestProject');

            // Log verification
            await logVerification('createTask - With Project Info', {
                taskId: response.task.id,
                name: response.task.name,
                projectId: response.task.projectId,
                projectPath: response.task.projectPath,
                projectName: response.task.projectName
            });

            // Cleanup
            await codebolt.task.deleteTask(response.task.id);
        }
    },

    {
        name: 'createTask should create a task with due date',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

            // Test: Create task with due date
            const response = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Task with Due Date',
                description: 'Task that has a deadline',
                dueDate: dueDate
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.name).toBe('Task with Due Date');
            expect(response.task.dueDate).toBeDefined();

            // Log verification
            await logVerification('createTask - With Due Date', {
                taskId: response.task.id,
                name: response.task.name,
                dueDate: response.task.dueDate
            });

            // Cleanup
            await codebolt.task.deleteTask(response.task.id);
        }
    },

    {
        name: 'createTask should create a task with dependencies',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a parent task first
            const parentResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Parent Task',
                description: 'This is the parent task'
            });

            // Test: Create task with dependency
            const response = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Dependent Task',
                description: 'Task that depends on another task',
                dependsOnTaskId: parentResponse.task.id
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.name).toBe('Dependent Task');
            expect(response.task.dependsOnTaskId).toBe(parentResponse.task.id);

            // Log verification
            await logVerification('createTask - With Dependency', {
                taskId: response.task.id,
                parentTaskId: parentResponse.task.id,
                dependency: response.task.dependsOnTaskId
            });

            // Cleanup
            await codebolt.task.deleteTask(response.task.id);
            await codebolt.task.deleteTask(parentResponse.task.id);
        }
    },

    // ========================================================================
    // UPDATE TASK TESTS
    // ========================================================================
    {
        name: 'updateTask should update task name and description',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task first
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Original Name',
                description: 'Original description'
            });
            const taskId = createResponse.task.id;

            // Test: Update the name and description
            const updateResponse = await codebolt.task.updateTask(taskId, {
                name: 'Updated Name',
                description: 'Updated description'
            });

            // Verify response
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.task).toBeDefined();
            expect(updateResponse.task.id).toBe(taskId);
            expect(updateResponse.task.name).toBe('Updated Name');
            expect(updateResponse.task.description).toBe('Updated description');

            // Log verification
            await logVerification('updateTask - Name and Description', {
                taskId: taskId,
                originalName: 'Original Name',
                updatedName: updateResponse.task.name
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    {
        name: 'updateTask should update task priority',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Priority Update Test',
                priority: 'low'
            });
            const taskId = createResponse.task.id;

            // Test: Update priority to urgent
            const updateResponse = await codebolt.task.updateTask(taskId, {
                priority: 'urgent'
            });

            // Verify response
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.task.priority).toBe('urgent');

            // Log verification
            await logVerification('updateTask - Priority', {
                taskId: taskId,
                originalPriority: 'low',
                updatedPriority: updateResponse.task.priority
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    {
        name: 'updateTask should update task status',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Status Update Test',
                status: 'pending'
            });
            const taskId = createResponse.task.id;

            // Test: Update status to processing
            const updateResponse = await codebolt.task.updateTask(taskId, {
                status: 'processing'
            });

            // Verify response
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.task.status).toBe('processing');

            // Log verification
            await logVerification('updateTask - Status', {
                taskId: taskId,
                originalStatus: 'pending',
                updatedStatus: updateResponse.task.status
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    {
        name: 'updateTask should update multiple properties at once',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Multi-update Test',
                priority: 'low',
                tags: ['initial']
            });
            const taskId = createResponse.task.id;

            // Test: Update multiple properties
            const updateResponse = await codebolt.task.updateTask(taskId, {
                name: 'Multi-update Test - Updated',
                priority: 'high',
                status: 'processing',
                tags: ['urgent', 'backend', 'feature']
            });

            // Verify response
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.task.name).toBe('Multi-update Test - Updated');
            expect(updateResponse.task.priority).toBe('high');
            expect(updateResponse.task.status).toBe('processing');
            expect(updateResponse.task.tags).toEqual(['urgent', 'backend', 'feature']);

            // Log verification
            await logVerification('updateTask - Multiple Properties', {
                taskId: taskId,
                updatedProperties: {
                    name: updateResponse.task.name,
                    priority: updateResponse.task.priority,
                    status: updateResponse.task.status,
                    tags: updateResponse.task.tags
                }
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    // ========================================================================
    // DELETE TASK TESTS
    // ========================================================================
    {
        name: 'deleteTask should delete an existing task',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Task to Delete'
            });
            const taskId = createResponse.task.id;

            // Test: Delete the task
            const deleteResponse = await codebolt.task.deleteTask(taskId);

            // Verify response
            expect(deleteResponse.success).toBe(true);

            // Verify task is deleted by trying to get it
            try {
                await codebolt.task.getTaskDetail({ taskId });
                // If we get here, the task still exists (should fail)
                expect(true).toBe(false); // Force test failure
            } catch (error) {
                // Expected - task should not exist
                expect(error).toBeDefined();
            }

            // Log verification
            await logVerification('deleteTask', {
                taskId: taskId,
                deleted: true,
                message: 'Task was successfully deleted'
            });
        }
    },

    // ========================================================================
    // GET TASK DETAIL TESTS
    // ========================================================================
    {
        name: 'getTaskDetail should retrieve task details',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Detail Test Task',
                description: 'Testing getTaskDetail',
                priority: 'high',
                tags: ['test', 'detail']
            });
            const taskId = createResponse.task.id;

            // Test: Get task details
            const response = await codebolt.task.getTaskDetail({
                taskId: taskId
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.id).toBe(taskId);
            expect(response.task.name).toBe('Detail Test Task');
            expect(response.task.description).toBe('Testing getTaskDetail');
            expect(response.task.priority).toBe('high');
            expect(response.task.tags).toEqual(['test', 'detail']);

            // Log verification
            await logVerification('getTaskDetail', {
                taskId: taskId,
                task: response.task
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    {
        name: 'getTaskDetail should include steps when requested',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task with steps
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Task with Steps',
                description: 'Testing step inclusion',
                steps: [
                    {
                        type: 'agent',
                        userMessage: 'Step 1',
                        isMainTask: true,
                        status: 'pending'
                    },
                    {
                        type: 'agent',
                        userMessage: 'Step 2',
                        isMainTask: false,
                        status: 'pending'
                    }
                ]
            });
            const taskId = createResponse.task.id;

            // Test: Get task details with steps
            const response = await codebolt.task.getTaskDetail({
                taskId: taskId,
                includeSteps: true
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.steps).toBeDefined();
            expect(Array.isArray(response.task.steps)).toBe(true);

            // Log verification
            await logVerification('getTaskDetail - With Steps', {
                taskId: taskId,
                stepCount: response.task.steps?.length || 0,
                steps: response.task.steps
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    // ========================================================================
    // GET TASK LIST TESTS
    // ========================================================================
    {
        name: 'getTaskList should retrieve all tasks',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create multiple tasks
            const task1 = await codebolt.task.createTask({
                threadId: threadId,
                name: 'List Test Task 1',
                priority: 'high'
            });
            const task2 = await codebolt.task.createTask({
                threadId: threadId,
                name: 'List Test Task 2',
                priority: 'medium'
            });
            const task3 = await codebolt.task.createTask({
                threadId: threadId,
                name: 'List Test Task 3',
                priority: 'low'
            });

            // Test: Get task list
            const response = await codebolt.task.getTaskList({});

            // Verify response
            expect(response.success).toBe(true);
            expect(response.tasks).toBeDefined();
            expect(Array.isArray(response.tasks)).toBe(true);
            expect(response.tasks.length).toBeGreaterThanOrEqual(3);

            // Verify our created tasks are in the list
            const createdIds = [task1.task.id, task2.task.id, task3.task.id];
            const responseIds = response.tasks.map(t => t.id);
            for (const id of createdIds) {
                expect(responseIds).toContain(id);
            }

            // Log verification
            await logVerification('getTaskList', {
                totalTasks: response.tasks.length,
                createdTasks: createdIds.length,
                tasks: response.tasks.map(t => ({
                    id: t.id,
                    name: t.name,
                    status: t.status,
                    priority: t.priority
                }))
            });

            // Cleanup
            for (const id of createdIds) {
                await codebolt.task.deleteTask(id);
            }
        }
    },

    {
        name: 'getTaskList should filter by status',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create tasks with different statuses
            const task1 = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Pending Task',
                status: 'pending'
            });

            const task2 = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Processing Task',
                status: 'processing'
            });

            const task3 = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Completed Task',
                status: 'completed'
            });

            // Test: Get only pending tasks
            const response = await codebolt.task.getTaskList({
                status: 'pending'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.tasks).toBeDefined();
            expect(Array.isArray(response.tasks)).toBe(true);

            // Verify only pending tasks are returned
            const hasPending = response.tasks.some(t => t.status === 'pending');
            const hasProcessing = response.tasks.some(t => t.status === 'processing');
            const hasCompleted = response.tasks.some(t => t.status === 'completed');

            expect(hasPending).toBe(true);
            expect(hasProcessing).toBe(false);
            expect(hasCompleted).toBe(false);

            // Log verification
            await logVerification('getTaskList - Filter by Status', {
                filter: 'pending',
                taskCount: response.tasks.length,
                tasks: response.tasks.map(t => ({
                    id: t.id,
                    name: t.name,
                    status: t.status
                }))
            });

            // Cleanup
            await codebolt.task.deleteTask(task1.task.id);
            await codebolt.task.deleteTask(task2.task.id);
            await codebolt.task.deleteTask(task3.task.id);
        }
    },

    {
        name: 'getTaskList should filter by threadId',
        testFunction: async () => {
            await codebolt.activate();

            const threadId1 = getTestThreadId();
            const threadId2 = getTestThreadId();

            // Setup: Create tasks in different threads
            const task1 = await codebolt.task.createTask({
                threadId: threadId1,
                name: 'Thread 1 Task'
            });

            const task2 = await codebolt.task.createTask({
                threadId: threadId2,
                name: 'Thread 2 Task'
            });

            // Test: Get tasks for thread 1 only
            const response = await codebolt.task.getTaskList({
                threadId: threadId1
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.tasks).toBeDefined();
            expect(Array.isArray(response.tasks)).toBe(true);

            // Verify only thread 1 tasks are returned
            const responseIds = response.tasks.map(t => t.id);
            expect(responseIds).toContain(task1.task.id);
            expect(responseIds).not.toContain(task2.task.id);

            // Log verification
            await logVerification('getTaskList - Filter by Thread ID', {
                threadId: threadId1,
                taskCount: response.tasks.length,
                tasks: response.tasks.map(t => ({
                    id: t.id,
                    name: t.name,
                    threadId: t.threadId
                }))
            });

            // Cleanup
            await codebolt.task.deleteTask(task1.task.id);
            await codebolt.task.deleteTask(task2.task.id);
        }
    },

    {
        name: 'getTaskList should support pagination',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create multiple tasks
            const tasks = [];
            for (let i = 1; i <= 5; i++) {
                const task = await codebolt.task.createTask({
                    threadId: threadId,
                    name: `Pagination Test Task ${i}`
                });
                tasks.push(task.task);
            }

            // Test: Get first page
            const page1 = await codebolt.task.getTaskList({
                threadId: threadId,
                limit: 2,
                offset: 0
            });

            // Test: Get second page
            const page2 = await codebolt.task.getTaskList({
                threadId: threadId,
                limit: 2,
                offset: 2
            });

            // Verify response
            expect(page1.success).toBe(true);
            expect(page2.success).toBe(true);
            expect(page1.tasks.length).toBeLessThanOrEqual(2);
            expect(page2.tasks.length).toBeLessThanOrEqual(2);

            // Verify pages don't overlap
            const page1Ids = page1.tasks.map(t => t.id);
            const page2Ids = page2.tasks.map(t => t.id);
            const hasOverlap = page1Ids.some(id => page2Ids.includes(id));
            expect(hasOverlap).toBe(false);

            // Log verification
            await logVerification('getTaskList - Pagination', {
                page1Count: page1.tasks.length,
                page2Count: page2.tasks.length,
                totalCreated: tasks.length
            });

            // Cleanup
            for (const task of tasks) {
                await codebolt.task.deleteTask(task.id);
            }
        }
    },

    // ========================================================================
    // ASSIGN AGENT TO TASK TESTS
    // ========================================================================
    {
        name: 'assignAgentToTask should assign an agent to a task',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();
            const agentId = getTestAgentId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Agent Assignment Test'
            });
            const taskId = createResponse.task.id;

            // Test: Assign agent to task
            const response = await codebolt.task.assignAgentToTask(taskId, agentId);

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.id).toBe(taskId);
            expect(response.task.assignedTo).toBe(agentId);

            // Log verification
            await logVerification('assignAgentToTask', {
                taskId: taskId,
                agentId: agentId,
                assignedTo: response.task.assignedTo
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    // ========================================================================
    // EXECUTE TASK WITH AGENT TESTS
    // ========================================================================
    {
        name: 'executeTaskWithAgent should assign and start a task',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();
            const agentId = getTestAgentId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Execute Task Test',
                description: 'Testing executeTaskWithAgent'
            });
            const taskId = createResponse.task.id;

            // Test: Execute task with agent
            const response = await codebolt.task.executeTaskWithAgent(taskId, agentId);

            // Verify response
            expect(response.success).toBe(true);
            expect(response.task).toBeDefined();
            expect(response.task.id).toBe(taskId);
            expect(response.task.assignedTo).toBe(agentId);

            // Log verification
            await logVerification('executeTaskWithAgent', {
                taskId: taskId,
                agentId: agentId,
                assignedTo: response.task.assignedTo,
                status: response.task.status
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    // ========================================================================
    // GET TASK STATUS TESTS
    // ========================================================================
    {
        name: 'getTaskStatus should retrieve task status',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Status Test Task',
                status: 'pending'
            });
            const taskId = createResponse.task.id;

            // Test: Get task status
            const status = await codebolt.task.getTaskStatus(taskId);

            // Verify response
            expect(status).toBeDefined();
            expect(status).toBe('pending');

            // Log verification
            await logVerification('getTaskStatus', {
                taskId: taskId,
                status: status
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    {
        name: 'getTaskStatus should reflect updated status',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Status Update Test',
                status: 'pending'
            });
            const taskId = createResponse.task.id;

            // Update status
            await codebolt.task.updateTask(taskId, { status: 'processing' });

            // Test: Get updated status
            const status = await codebolt.task.getTaskStatus(taskId);

            // Verify response
            expect(status).toBeDefined();
            expect(status).toBe('processing');

            // Log verification
            await logVerification('getTaskStatus - After Update', {
                taskId: taskId,
                originalStatus: 'pending',
                updatedStatus: status
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    // ========================================================================
    // GET TASK SUMMARY TESTS
    // ========================================================================
    {
        name: 'getTaskSummary should retrieve task description',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create a task with description
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Summary Test Task',
                description: 'This is a detailed description of the task'
            });
            const taskId = createResponse.task.id;

            // Test: Get task summary
            const summary = await codebolt.task.getTaskSummary(taskId);

            // Verify response
            expect(summary).toBeDefined();
            expect(summary).toBe('This is a detailed description of the task');

            // Log verification
            await logVerification('getTaskSummary', {
                taskId: taskId,
                summary: summary
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    },

    // ========================================================================
    // INTEGRATION TESTS
    // ========================================================================
    {
        name: 'Full CRUD workflow should work end-to-end',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Step 1: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'CRUD Test Task',
                description: 'Testing full CRUD workflow',
                priority: 'medium'
            });
            expect(createResponse.success).toBe(true);
            const taskId = createResponse.task.id;

            // Step 2: Read the task
            const readResponse = await codebolt.task.getTaskDetail({ taskId });
            expect(readResponse.success).toBe(true);
            expect(readResponse.task.name).toBe('CRUD Test Task');

            // Step 3: Update the task
            const updateResponse = await codebolt.task.updateTask(taskId, {
                name: 'CRUD Test Task - Updated',
                priority: 'high'
            });
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.task.name).toBe('CRUD Test Task - Updated');
            expect(updateResponse.task.priority).toBe('high');

            // Step 4: Verify the update
            const verifyResponse = await codebolt.task.getTaskDetail({ taskId });
            expect(verifyResponse.task.name).toBe('CRUD Test Task - Updated');

            // Step 5: Delete the task
            const deleteResponse = await codebolt.task.deleteTask(taskId);
            expect(deleteResponse.success).toBe(true);

            // Step 6: Verify deletion
            try {
                await codebolt.task.getTaskDetail({ taskId });
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                // Expected - task should not exist
            }

            // Log verification
            await logVerification('Full CRUD Workflow', {
                workflow: 'Create -> Read -> Update -> Verify -> Delete',
                taskId: taskId,
                success: true
            });
        }
    },

    {
        name: 'getTaskList and getTaskDetail should return consistent data',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();

            // Setup: Create multiple tasks
            const tasks = [];
            for (let i = 1; i <= 3; i++) {
                const task = await codebolt.task.createTask({
                    threadId: threadId,
                    name: `Consistency Test Task ${i}`,
                    priority: i % 2 === 0 ? 'high' : 'low'
                });
                tasks.push(task.task);
            }

            // Test: Get all tasks
            const listResponse = await codebolt.task.getTaskList({});

            // Test: Get details for each task
            for (const task of tasks) {
                const detailResponse = await codebolt.task.getTaskDetail({
                    taskId: task.id
                });

                // Verify consistency
                expect(detailResponse.task.id).toBe(task.id);
                expect(detailResponse.task.name).toBe(task.name);
                expect(detailResponse.task.priority).toBe(task.priority);
            }

            // Verify all tasks are in the list
            const listIds = listResponse.tasks.map(t => t.id);
            for (const task of tasks) {
                expect(listIds).toContain(task.id);
            }

            // Log verification
            await logVerification('getTaskList & getTaskDetail - Consistency', {
                totalTasksInList: listResponse.tasks.length,
                verifiedTasks: tasks.length,
                tasks: tasks.map(t => ({
                    id: t.id,
                    name: t.name,
                    priority: t.priority
                }))
            });

            // Cleanup
            for (const task of tasks) {
                await codebolt.task.deleteTask(task.id);
            }
        }
    },

    {
        name: 'Task assignment and execution workflow',
        testFunction: async () => {
            await codebolt.activate();

            const threadId = getTestThreadId();
            const agentId = getTestAgentId();

            // Step 1: Create a task
            const createResponse = await codebolt.task.createTask({
                threadId: threadId,
                name: 'Workflow Test Task',
                description: 'Testing assignment and execution workflow'
            });
            const taskId = createResponse.task.id;
            expect(createResponse.success).toBe(true);

            // Step 2: Verify initial state
            const initialStatus = await codebolt.task.getTaskStatus(taskId);
            expect(initialStatus).toBeDefined();

            // Step 3: Assign agent to task
            const assignResponse = await codebolt.task.assignAgentToTask(taskId, agentId);
            expect(assignResponse.success).toBe(true);
            expect(assignResponse.task.assignedTo).toBe(agentId);

            // Step 4: Verify assignment
            const detailResponse = await codebolt.task.getTaskDetail({ taskId });
            expect(detailResponse.task.assignedTo).toBe(agentId);

            // Step 5: Execute task with agent
            const executeResponse = await codebolt.task.executeTaskWithAgent(taskId, agentId);
            expect(executeResponse.success).toBe(true);

            // Log verification
            await logVerification('Task Assignment and Execution Workflow', {
                taskId: taskId,
                agentId: agentId,
                steps: [
                    'Task created',
                    'Agent assigned',
                    'Assignment verified',
                    'Task executed'
                ],
                finalStatus: executeResponse.task.status
            });

            // Cleanup
            await codebolt.task.deleteTask(taskId);
        }
    }
];

// ============================================================================
// Test Suite
// ============================================================================

describe('Task Module - Comprehensive Test Suite', () => {
    // Setup: Run before all tests
    beforeAll(async () => {
        await codebolt.activate();
    });

    // Cleanup: Run after each test
    afterEach(async () => {
        await cleanupTasks();
    });

    // Run all test cases
    test.each(testCases)('%s', async (testCase) => {
        await testCase.testFunction();
    });
});
