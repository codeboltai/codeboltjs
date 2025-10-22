/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { WriteTodosTool } from '../write-todo';
import fs from 'fs';
import path from 'path';
import todoService from '../../../services/todoService';

// Simple test framework
async function runTest(name: string, testFn: () => Promise<void>) {
    try {
        await testFn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}: ${error.message}`);
        throw error;
    }
}

async function expectEqual(actual: any, expected: any) {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
    }
}

async function expectContain(actual: string, expected: string) {
    if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
    }
}

async function expectLength(array: any[], expected: number) {
    if (array.length !== expected) {
        throw new Error(`Expected array length ${expected}, but got ${array.length}`);
    }
}

// Test suite
async function runTests() {
    console.log('Running WriteTodosTool tests...\n');

    let tool: WriteTodosTool;
    let tempDir: string;
    let todoFile: string;

    // Setup
    tool = new WriteTodosTool();
    tempDir = fs.mkdtempSync(path.join(__dirname, 'test-'));
    todoFile = path.join(tempDir, '.codebolt', 'todos.json');

    // Initialize todoService with temp directory
    todoService.init(tempDir);

    try {
        // Parameter validation tests
        await runTest('should require todos array', async () => {
            const result = await tool.buildAndExecute({} as any, new AbortController().signal);
            await expectEqual(result.error?.message.includes('todos'), true);
        });

        await runTest('should require todos to be an array', async () => {
            const result = await tool.buildAndExecute({
                todos: 'not-an-array'
            } as any, new AbortController().signal);
            await expectEqual(result.error?.message.includes('todos'), true);
        });

        await runTest('should require each todo to have description', async () => {
            const result = await tool.buildAndExecute({
                todos: [{ status: 'pending' }]
            } as any, new AbortController().signal);
            await expectEqual(result.error?.message.includes('description'), true);
        });

        await runTest('should require each todo to have valid status', async () => {
            const result = await tool.buildAndExecute({
                todos: [{ description: 'Test todo', status: 'invalid-status' }]
            } as any, new AbortController().signal);
            await expectEqual(result.error?.message.includes('status'), true);
        });

        await runTest('should allow only one in_progress task', async () => {
            const result = await tool.buildAndExecute({
                todos: [
                    { description: 'Task 1', status: 'in_progress' },
                    { description: 'Task 2', status: 'in_progress' }
                ]
            }, new AbortController().signal);
            await expectEqual(result.error?.message.includes('in_progress'), true);
        });

        // Todo creation tests
        await runTest('should create todos in todoService', async () => {
            const threadId = 'test-thread-1';
            const todos = [
                { description: 'First task', status: 'pending' as const },
                { description: 'Second task', status: 'in_progress' as const },
                { description: 'Third task', status: 'completed' as const }
            ];

            const result = await tool.buildAndExecute({
                todos
            }, new AbortController().signal);

            if (result.error) {
                throw new Error(`Tool execution failed: ${result.error.message}`);
            }

            await expectContain(result.llmContent, 'Successfully updated the todo list');

            // Verify todos were created in todoService
            const createdTodos = todoService.getTodosByThreadId(threadId);
            await expectLength(createdTodos, 3);

            // Check first todo
            await expectEqual(createdTodos[0].title, 'First task');
            await expectEqual(createdTodos[0].status, 'pending');

            // Check second todo (in_progress should be converted to processing)
            await expectEqual(createdTodos[1].title, 'Second task');
            await expectEqual(createdTodos[1].status, 'processing');

            // Check third todo
            await expectEqual(createdTodos[2].title, 'Third task');
            await expectEqual(createdTodos[2].status, 'completed');
        });

        await runTest('should clear existing todos when creating new ones', async () => {
            const threadId = 'test-thread-2';

            // Create initial todos
            const initialTodos = [{ description: 'Initial task', status: 'pending' as const }];
            await tool.buildAndExecute({
                todos: initialTodos
            }, new AbortController().signal);

            // Verify initial todo was created
            let todos = todoService.getTodosByThreadId(threadId);
            await expectLength(todos, 1);

            // Create new todos, which should clear the previous ones
            const newTodos = [{ description: 'New task', status: 'pending' as const }];
            await tool.buildAndExecute({
                todos: newTodos
            }, new AbortController().signal);

            // Verify only the new todo exists
            todos = todoService.getTodosByThreadId(threadId);
            await expectLength(todos, 1);
            await expectEqual(todos[0].title, 'New task');
        });

        await runTest('should handle empty todos array (clear todos)', async () => {
            const threadId = 'test-thread-3';

            // Create some initial todos
            await tool.buildAndExecute({
                todos: [{ description: 'Task to be cleared', status: 'pending' as const }]
            }, new AbortController().signal);

            // Verify initial todo was created
            let todos = todoService.getTodosByThreadId(threadId);
            await expectLength(todos, 1);

            // Clear todos with empty array
            const result = await tool.buildAndExecute({
                todos: []
            }, new AbortController().signal);

            if (result.error) {
                throw new Error(`Tool execution failed: ${result.error.message}`);
            }

            await expectContain(result.llmContent, 'Successfully cleared the todo list');

            // Verify todos were cleared
            todos = todoService.getTodosByThreadId(threadId);
            await expectLength(todos, 0);
        });

        // Utility methods tests
        await runTest('should provide correct description', async () => {
            const invocation = tool.build({
                todos: [
                    { description: 'Task 1', status: 'pending' as const },
                    { description: 'Task 2', status: 'in_progress' as const }
                ]
            });
            await expectEqual(invocation.getDescription(), 'Set 2 todo(s)');
        });

        await runTest('should provide correct description for empty todos', async () => {
            const invocation = tool.build({ todos: [] });
            await expectEqual(invocation.getDescription(), 'Cleared todo list');
        });

        console.log('\nAll tests passed!');
    } finally {
        // Cleanup
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});