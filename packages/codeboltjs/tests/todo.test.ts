/**
 * Comprehensive Test Suite for Todo Module
 *
 * This test suite covers all methods in the todo module:
 * - addTodo, updateTodo
 * - getTodoList, getAllIncompleteTodos
 * - exportTodos, importTodos
 *
 * Each test includes proper state cleanup and AskUserQuestion for verification.
 */

import Codebolt from '../src/core/Codebolt';

const codebolt = new Codebolt();

/**
 * Helper function to clean up all todos between tests
 */
async function cleanupTodos() {
    try {
        // Get all incomplete todos and mark them as cancelled
        const incompleteResponse = await codebolt.todo.getAllIncompleteTodos();
        if (incompleteResponse.todos && incompleteResponse.todos.length > 0) {
            for (const todo of incompleteResponse.todos) {
                await codebolt.todo.updateTodo({
                    id: todo.id,
                    status: 'cancelled'
                });
            }
        }

        // Get all todos (including completed/cancelled) to ensure cleanup
        const listResponse = await codebolt.todo.getTodoList();
        if (listResponse.todoList && listResponse.todoList.todos) {
            for (const todo of listResponse.todoList.todos) {
                await codebolt.todo.updateTodo({
                    id: todo.id,
                    status: 'cancelled'
                });
            }
        }
    } catch (error) {
        console.log('Cleanup error (may be expected if no todos exist):', error);
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
        // await codebolt.notify.userNotification({
        //     type: 'question',
        //     message: `Verify test: ${testName}`,
        //     data: details
        // });
    } catch (error) {
        console.log('Verification request error:', error);
    }
}

const testCases = [
    {
        name: 'addTodo should create a new todo item with basic parameters',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Test: Create a basic todo
            const response = await codebolt.todo.addTodo({
                title: 'Test todo item'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.todo).toBeDefined();
            expect(response.todo.title).toBe('Test todo item');
            expect(response.todo.id).toBeDefined();
            expect(response.todo.status).toBe('pending');

            // Ask user to verify
            await verifyWithUser('addTodo - Basic', {
                todoId: response.todo.id,
                title: response.todo.title,
                status: response.todo.status
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: response.todo.id,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'addTodo should create a new todo with priority and tags',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Test: Create todo with priority and tags
            const response = await codebolt.todo.addTodo({
                title: 'High priority todo with tags',
                priority: 'high',
                tags: ['urgent', 'frontend', 'bug']
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.todo).toBeDefined();
            expect(response.todo.title).toBe('High priority todo with tags');
            expect(response.todo.priority).toBe('high');
            expect(response.todo.tags).toEqual(['urgent', 'frontend', 'bug']);
            expect(response.todo.tags.length).toBe(3);

            // Ask user to verify
            await verifyWithUser('addTodo - With Priority and Tags', {
                todoId: response.todo.id,
                title: response.todo.title,
                priority: response.todo.priority,
                tags: response.todo.tags
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: response.todo.id,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'updateTodo should update todo title',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create a todo first
            const createResponse = await codebolt.todo.addTodo({
                title: 'Original title'
            });
            const todoId = createResponse.todo.id;

            // Test: Update the title
            const updateResponse = await codebolt.todo.updateTodo({
                id: todoId,
                title: 'Updated title'
            });

            // Verify response
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.todo).toBeDefined();
            expect(updateResponse.todo.id).toBe(todoId);
            expect(updateResponse.todo.title).toBe('Updated title');

            // Ask user to verify
            await verifyWithUser('updateTodo - Title', {
                todoId: todoId,
                originalTitle: 'Original title',
                updatedTitle: updateResponse.todo.title
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: todoId,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'updateTodo should update todo status',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create a todo first
            const createResponse = await codebolt.todo.addTodo({
                title: 'Status test todo'
            });
            const todoId = createResponse.todo.id;

            // Test: Update status to processing
            const updateResponse = await codebolt.todo.updateTodo({
                id: todoId,
                status: 'processing'
            });

            // Verify response
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.todo.status).toBe('processing');

            // Test: Update status to completed
            const completeResponse = await codebolt.todo.updateTodo({
                id: todoId,
                status: 'completed'
            });

            expect(completeResponse.success).toBe(true);
            expect(completeResponse.todo.status).toBe('completed');

            // Ask user to verify
            await verifyWithUser('updateTodo - Status', {
                todoId: todoId,
                statusTransitions: ['pending', 'processing', 'completed'],
                finalStatus: completeResponse.todo.status
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: todoId,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'updateTodo should update multiple properties at once',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create a todo first
            const createResponse = await codebolt.todo.addTodo({
                title: 'Multi-update test',
                priority: 'low',
                tags: ['initial']
            });
            const todoId = createResponse.todo.id;

            // Test: Update multiple properties
            const updateResponse = await codebolt.todo.updateTodo({
                id: todoId,
                title: 'Multi-update test - updated',
                priority: 'high',
                status: 'processing',
                tags: ['urgent', 'backend', 'feature']
            });

            // Verify response
            expect(updateResponse.success).toBe(true);
            expect(updateResponse.todo.title).toBe('Multi-update test - updated');
            expect(updateResponse.todo.priority).toBe('high');
            expect(updateResponse.todo.status).toBe('processing');
            expect(updateResponse.todo.tags).toEqual(['urgent', 'backend', 'feature']);

            // Ask user to verify
            await verifyWithUser('updateTodo - Multiple Properties', {
                todoId: todoId,
                updatedProperties: {
                    title: updateResponse.todo.title,
                    priority: updateResponse.todo.priority,
                    status: updateResponse.todo.status,
                    tags: updateResponse.todo.tags
                }
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: todoId,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'getTodoList should retrieve all todos',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create multiple todos
            const todo1 = await codebolt.todo.addTodo({
                title: 'Todo 1 for list test',
                priority: 'high'
            });
            const todo2 = await codebolt.todo.addTodo({
                title: 'Todo 2 for list test',
                priority: 'medium'
            });
            const todo3 = await codebolt.todo.addTodo({
                title: 'Todo 3 for list test',
                priority: 'low'
            });

            // Test: Get todo list
            const response = await codebolt.todo.getTodoList();

            // Verify response
            expect(response.success).toBe(true);
            expect(response.todoList).toBeDefined();
            expect(Array.isArray(response.todoList.todos)).toBe(true);
            expect(response.todoList.todos.length).toBeGreaterThanOrEqual(3);

            // Verify our created todos are in the list
            const createdIds = [todo1.todo.id, todo2.todo.id, todo3.todo.id];
            const responseIds = response.todoList.todos.map(t => t.id);
            for (const id of createdIds) {
                expect(responseIds).toContain(id);
            }

            // Ask user to verify
            await verifyWithUser('getTodoList', {
                totalTodos: response.todoList.todos.length,
                createdTodos: createdIds.length,
                todos: response.todoList.todos.map(t => ({
                    id: t.id,
                    title: t.title,
                    status: t.status,
                    priority: t.priority
                }))
            });

            // Cleanup
            for (const id of createdIds) {
                await codebolt.todo.updateTodo({
                    id: id,
                    status: 'cancelled'
                });
            }
        }
    },
    {
        name: 'getTodoList should support filtering by listId',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create a todo
            const todo = await codebolt.todo.addTodo({
                title: 'Filtered list test todo'
            });

            // Test: Get todo list without filters
            const allResponse = await codebolt.todo.getTodoList({});
            expect(allResponse.success).toBe(true);

            // Test: Get todo list with specific listId (if applicable)
            const listId = allResponse.todoList.id;
            const filteredResponse = await codebolt.todo.getTodoList({
                listId: listId
            });

            // Verify response
            expect(filteredResponse.success).toBe(true);
            expect(filteredResponse.todoList).toBeDefined();
            expect(filteredResponse.todoList.id).toBe(listId);

            // Ask user to verify
            await verifyWithUser('getTodoList - Filtered by List ID', {
                listId: listId,
                todoCount: filteredResponse.todoList.todos.length
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: todo.todo.id,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'getAllIncompleteTodos should retrieve only incomplete todos',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create todos with different statuses
            const todo1 = await codebolt.todo.addTodo({
                title: 'Pending todo'
            });

            const todo2 = await codebolt.todo.addTodo({
                title: 'Processing todo'
            });
            await codebolt.todo.updateTodo({
                id: todo2.todo.id,
                status: 'processing'
            });

            const todo3 = await codebolt.todo.addTodo({
                title: 'Completed todo'
            });
            await codebolt.todo.updateTodo({
                id: todo3.todo.id,
                status: 'completed'
            });

            // Test: Get all incomplete todos
            const response = await codebolt.todo.getAllIncompleteTodos();

            // Verify response
            expect(response.success).toBe(true);
            expect(response.todos).toBeDefined();
            expect(Array.isArray(response.todos)).toBe(true);

            // Verify only pending and processing todos are returned
            const hasPending = response.todos.some(t => t.status === 'pending');
            const hasProcessing = response.todos.some(t => t.status === 'processing');
            const hasCompleted = response.todos.some(t => t.status === 'completed');

            expect(hasPending || hasProcessing).toBe(true);
            expect(hasCompleted).toBe(false);

            // Verify our incomplete todos are in the list
            const responseIds = response.todos.map(t => t.id);
            expect(responseIds).toContain(todo1.todo.id);
            expect(responseIds).toContain(todo2.todo.id);
            expect(responseIds).not.toContain(todo3.todo.id);

            // Ask user to verify
            await verifyWithUser('getAllIncompleteTodos', {
                incompleteCount: response.todos.length,
                todos: response.todos.map(t => ({
                    id: t.id,
                    title: t.title,
                    status: t.status
                }))
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: todo1.todo.id,
                status: 'cancelled'
            });
            await codebolt.todo.updateTodo({
                id: todo2.todo.id,
                status: 'cancelled'
            });
            await codebolt.todo.updateTodo({
                id: todo3.todo.id,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'exportTodos should export todos in JSON format',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create test todos
            const todo1 = await codebolt.todo.addTodo({
                title: 'Export test todo 1',
                priority: 'high',
                tags: ['export', 'test']
            });
            const todo2 = await codebolt.todo.addTodo({
                title: 'Export test todo 2',
                priority: 'medium',
                tags: ['export']
            });

            // Test: Export todos as JSON
            const response = await codebolt.todo.exportTodos({
                format: 'json'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.format).toBe('json');
            expect(response.count).toBeDefined();
            expect(response.count).toBeGreaterThanOrEqual(2);

            // Verify JSON is valid
            const parsedData = JSON.parse(response.data);
            expect(Array.isArray(parsedData)).toBe(true);
            expect(parsedData.length).toBeGreaterThanOrEqual(2);

            // Verify our todos are in the export
            const exportedIds = parsedData.map(t => t.id);
            expect(exportedIds).toContain(todo1.todo.id);
            expect(exportedIds).toContain(todo2.todo.id);

            // Ask user to verify
            await verifyWithUser('exportTodos - JSON Format', {
                format: response.format,
                count: response.count,
                dataPreview: parsedData.slice(0, 2)
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: todo1.todo.id,
                status: 'cancelled'
            });
            await codebolt.todo.updateTodo({
                id: todo2.todo.id,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'exportTodos should export todos in Markdown format',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create test todos
            const todo1 = await codebolt.todo.addTodo({
                title: 'Markdown export test 1',
                priority: 'high',
                tags: ['markdown']
            });
            const todo2 = await codebolt.todo.addTodo({
                title: 'Markdown export test 2',
                priority: 'low',
                tags: ['markdown', 'test']
            });

            // Test: Export todos as markdown
            const response = await codebolt.todo.exportTodos({
                format: 'markdown'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(typeof response.data).toBe('string');
            expect(response.format).toBe('markdown');
            expect(response.count).toBeDefined();
            expect(response.count).toBeGreaterThanOrEqual(2);

            // Verify markdown format contains expected elements
            expect(response.data).toContain('#'); // Markdown headers
            expect(response.data).toContain('-'); // Markdown lists
            expect(response.data).toContain('Markdown export test 1');
            expect(response.data).toContain('Markdown export test 2');

            // Ask user to verify
            await verifyWithUser('exportTodos - Markdown Format', {
                format: response.format,
                count: response.count,
                markdownPreview: response.data.substring(0, 500) + '...'
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: todo1.todo.id,
                status: 'cancelled'
            });
            await codebolt.todo.updateTodo({
                id: todo2.todo.id,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'exportTodos should filter by status when exporting',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create todos with different statuses
            const todo1 = await codebolt.todo.addTodo({
                title: 'Pending for filter'
            });

            const todo2 = await codebolt.todo.addTodo({
                title: 'Completed for filter'
            });
            await codebolt.todo.updateTodo({
                id: todo2.todo.id,
                status: 'completed'
            });

            // Test: Export only pending todos
            const response = await codebolt.todo.exportTodos({
                format: 'json',
                status: ['pending']
            });

            // Verify response
            expect(response.success).toBe(true);
            const parsedData = JSON.parse(response.data);

            // Verify only pending todos are exported
            const hasCompleted = parsedData.some(t => t.status === 'completed');
            const hasPending = parsedData.some(t => t.status === 'pending');

            expect(hasCompleted).toBe(false);
            expect(hasPending).toBe(true);

            // Ask user to verify
            await verifyWithUser('exportTodos - Filtered by Status', {
                format: response.format,
                filter: ['pending'],
                count: response.count,
                exportedTodos: parsedData.map(t => ({
                    id: t.id,
                    title: t.title,
                    status: t.status
                }))
            });

            // Cleanup
            await codebolt.todo.updateTodo({
                id: todo1.todo.id,
                status: 'cancelled'
            });
            await codebolt.todo.updateTodo({
                id: todo2.todo.id,
                status: 'cancelled'
            });
        }
    },
    {
        name: 'importTodos should import todos from JSON with replace strategy',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create existing todos
            const existingTodo = await codebolt.todo.addTodo({
                title: 'Existing todo to be replaced',
                priority: 'medium'
            });

            // Test: Import new todos with replace strategy
            const importData = JSON.stringify([
                {
                    title: 'Imported todo 1',
                    priority: 'high',
                    tags: ['imported', 'test']
                },
                {
                    title: 'Imported todo 2',
                    priority: 'low',
                    tags: ['imported']
                }
            ]);

            const response = await codebolt.todo.importTodos({
                data: importData,
                format: 'json',
                mergeStrategy: 'replace'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.count).toBeDefined();
            expect(response.count).toBe(2);
            expect(response.todos).toBeDefined();
            expect(response.todos.length).toBe(2);

            // Verify imported todos have correct data
            expect(response.todos[0].title).toBe('Imported todo 1');
            expect(response.todos[0].priority).toBe('high');
            expect(response.todos[1].title).toBe('Imported todo 2');
            expect(response.todos[1].priority).toBe('low');

            // Verify old todo was replaced
            const currentList = await codebolt.todo.getTodoList();
            const hasOldTodo = currentList.todoList.todos.some(t => t.id === existingTodo.todo.id);
            expect(hasOldTodo).toBe(false); // Old todo should be gone

            // Ask user to verify
            await verifyWithUser('importTodos - JSON with Replace', {
                strategy: 'replace',
                importedCount: response.count,
                todos: response.todos.map(t => ({
                    id: t.id,
                    title: t.title,
                    priority: t.priority,
                    tags: t.tags
                }))
            });

            // Cleanup
            for (const todo of response.todos) {
                await codebolt.todo.updateTodo({
                    id: todo.id,
                    status: 'cancelled'
                });
            }
        }
    },
    {
        name: 'importTodos should import todos from JSON with merge strategy',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create existing todos
            const existingTodo = await codebolt.todo.addTodo({
                title: 'Existing todo to keep',
                priority: 'medium',
                tags: ['existing']
            });

            // Test: Import new todos with merge strategy
            const importData = JSON.stringify([
                {
                    title: 'Imported todo 1',
                    priority: 'high',
                    tags: ['imported', 'merge']
                },
                {
                    title: 'Imported todo 2',
                    priority: 'low',
                    tags: ['imported']
                }
            ]);

            const response = await codebolt.todo.importTodos({
                data: importData,
                format: 'json',
                mergeStrategy: 'merge'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.count).toBeDefined();
            expect(response.result).toBeDefined();
            expect(response.result.added).toBe(2);

            // Verify existing todo is still there
            const currentList = await codebolt.todo.getTodoList();
            const hasExistingTodo = currentList.todoList.todos.some(t => t.id === existingTodo.todo.id);
            expect(hasExistingTodo).toBe(true);

            // Verify imported todos are added
            const responseIds = response.todos.map(t => t.id);
            expect(responseIds).toContain(existingTodo.todo.id);

            // Ask user to verify
            await verifyWithUser('importTodos - JSON with Merge', {
                strategy: 'merge',
                result: response.result,
                totalTodos: currentList.todoList.todos.length,
                todos: currentList.todoList.todos.map(t => ({
                    id: t.id,
                    title: t.title,
                    tags: t.tags
                }))
            });

            // Cleanup
            const allTodos = await codebolt.todo.getTodoList();
            for (const todo of allTodos.todoList.todos) {
                await codebolt.todo.updateTodo({
                    id: todo.id,
                    status: 'cancelled'
                });
            }
        }
    },
    {
        name: 'importTodos should import todos from Markdown format',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Test: Import todos from markdown
            const markdownData = `# My Todo List

## High Priority
- [ ] Urgent feature implementation
- [ ] Critical bug fix

## Medium Priority
- [ ] Code refactoring
- [ ] Documentation update

## Low Priority
- [ ] Nice to have feature
`;

            const response = await codebolt.todo.importTodos({
                data: markdownData,
                format: 'markdown',
                mergeStrategy: 'replace'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.count).toBeDefined();
            expect(response.count).toBeGreaterThan(0);
            expect(response.todos).toBeDefined();
            expect(response.todos.length).toBeGreaterThan(0);

            // Verify imported todos contain expected content
            const titles = response.todos.map(t => t.title);
            expect(titles).toContain('Urgent feature implementation');
            expect(titles).toContain('Critical bug fix');
            expect(titles).toContain('Code refactoring');
            expect(titles).toContain('Documentation update');

            // Ask user to verify
            await verifyWithUser('importTodos - Markdown Format', {
                format: 'markdown',
                strategy: 'replace',
                importedCount: response.count,
                todos: response.todos.map(t => ({
                    id: t.id,
                    title: t.title,
                    status: t.status
                }))
            });

            // Cleanup
            for (const todo of response.todos) {
                await codebolt.todo.updateTodo({
                    id: todo.id,
                    status: 'cancelled'
                });
            }
        }
    },
    {
        name: 'importTodos should handle empty data gracefully',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Test: Import empty JSON array
            const emptyData = JSON.stringify([]);

            const response = await codebolt.todo.importTodos({
                data: emptyData,
                format: 'json',
                mergeStrategy: 'replace'
            });

            // Verify response
            expect(response.success).toBe(true);
            expect(response.count).toBe(0);
            expect(response.todos).toBeDefined();
            expect(response.todos.length).toBe(0);

            // Ask user to verify
            await verifyWithUser('importTodos - Empty Data', {
                format: 'json',
                strategy: 'replace',
                importedCount: response.count,
                message: 'Successfully handled empty import data'
            });
        }
    },
    {
        name: 'importTodos and exportTodos should work together (round-trip test)',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create initial todos
            const todo1 = await codebolt.todo.addTodo({
                title: 'Round-trip test 1',
                priority: 'high',
                tags: ['round-trip']
            });
            const todo2 = await codebolt.todo.addTodo({
                title: 'Round-trip test 2',
                priority: 'medium',
                tags: ['round-trip', 'test']
            });

            // Step 1: Export todos
            const exportResponse = await codebolt.todo.exportTodos({
                format: 'json'
            });
            expect(exportResponse.success).toBe(true);

            // Step 2: Clear existing todos
            await codebolt.todo.updateTodo({
                id: todo1.todo.id,
                status: 'cancelled'
            });
            await codebolt.todo.updateTodo({
                id: todo2.todo.id,
                status: 'cancelled'
            });

            // Step 3: Import exported todos
            const importResponse = await codebolt.todo.importTodos({
                data: exportResponse.data,
                format: 'json',
                mergeStrategy: 'replace'
            });
            expect(importResponse.success).toBe(true);
            expect(importResponse.count).toBe(2);

            // Step 4: Verify data integrity
            const finalExport = await codebolt.todo.exportTodos({
                format: 'json'
            });
            const finalTodos = JSON.parse(finalExport.data);

            expect(finalTodos.length).toBe(2);
            const titles = finalTodos.map(t => t.title);
            expect(titles).toContain('Round-trip test 1');
            expect(titles).toContain('Round-trip test 2');

            // Ask user to verify
            await verifyWithUser('importTodos & exportTodos - Round-trip', {
                originalExportCount: exportResponse.count,
                importedCount: importResponse.count,
                finalExportCount: finalExport.count,
                dataIntegrity: 'Preserved',
                todos: finalTodos.map(t => ({
                    id: t.id,
                    title: t.title,
                    priority: t.priority,
                    tags: t.tags
                }))
            });

            // Cleanup
            for (const todo of finalTodos) {
                await codebolt.todo.updateTodo({
                    id: todo.id,
                    status: 'cancelled'
                });
            }
        }
    },
    {
        name: 'getTodoList and getAllIncompleteTodos should return consistent data',
        testFunction: async () => {
            await codebolt.waitForReady();

            // Setup: Create todos with different statuses
            const todos = [];
            for (let i = 1; i <= 5; i++) {
                const todo = await codebolt.todo.addTodo({
                    title: `Consistency test todo ${i}`,
                    priority: i % 2 === 0 ? 'high' : 'low'
                });
                todos.push(todo.todo);

                // Mark some as completed
                if (i % 2 === 0) {
                    await codebolt.todo.updateTodo({
                        id: todo.todo.id,
                        status: 'completed'
                    });
                } else {
                    await codebolt.todo.updateTodo({
                        id: todo.todo.id,
                        status: 'processing'
                    });
                }
            }

            // Test: Get all todos
            const allResponse = await codebolt.todo.getTodoList();

            // Test: Get incomplete todos
            const incompleteResponse = await codebolt.todo.getAllIncompleteTodos();

            // Verify consistency
            expect(allResponse.success).toBe(true);
            expect(incompleteResponse.success).toBe(true);

            const allTodoIds = allResponse.todoList.todos.map(t => t.id);
            const incompleteTodoIds = incompleteResponse.todos.map(t => t.id);

            // All incomplete todos should be in the complete list
            for (const incompleteId of incompleteTodoIds) {
                expect(allTodoIds).toContain(incompleteId);
            }

            // Count should be different
            expect(allResponse.todoList.todos.length).toBeGreaterThanOrEqual(incompleteResponse.todos.length);

            // Ask user to verify
            await verifyWithUser('getTodoList & getAllIncompleteTodos - Consistency', {
                totalTodos: allResponse.todoList.todos.length,
                incompleteTodos: incompleteResponse.todos.length,
                completedTodos: allResponse.todoList.todos.length - incompleteResponse.todos.length,
                allTodoIds: allTodoIds,
                incompleteTodoIds: incompleteTodoIds
            });

            // Cleanup
            for (const todo of todos) {
                await codebolt.todo.updateTodo({
                    id: todo.id,
                    status: 'cancelled'
                });
            }
        }
    }
];

describe('Todo Module - Comprehensive Test Suite', () => {
    // Setup: Run before all tests
    beforeAll(async () => {
        await codebolt.waitForReady();
    });

    // Cleanup: Run after each test
    afterEach(async () => {
        await cleanupTodos();
    });

    // Run all test cases
    test.each(testCases)('%s', async (testCase) => {
        await testCase.testFunction();
    });
});
