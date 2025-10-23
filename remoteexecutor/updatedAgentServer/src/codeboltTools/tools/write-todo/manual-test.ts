/**
 * Manual test for WriteTodosTool
 */

import { WriteTodosTool } from '../write-todo';
import fs from 'fs';
import path from 'path';
import todoService from '../../../services/todoService';

async function runManualTest() {
    console.log('Running manual test for WriteTodosTool...\n');

    // Create temp directory for testing
    const tempDir = fs.mkdtempSync(path.join(__dirname, 'test-'));
    console.log(`Created temp directory: ${tempDir}`);

    try {
        // Initialize todoService with temp directory
        todoService.init(tempDir);
        console.log('Initialized todoService');

        // Create the WriteTodosTool
        const tool = new WriteTodosTool();
        console.log('Created WriteTodosTool');

        // Test creating todos
        console.log('\n--- Test 1: Creating todos ---');
        const todos = [
            { description: 'First task', status: 'pending' as const },
            { description: 'Second task', status: 'in_progress' as const },
            { description: 'Third task', status: 'completed' as const }
        ];

        const result = await tool.buildAndExecute({
            todos
        }, new AbortController().signal);

        if (result.error) {
            console.error('Tool execution failed:', result.error.message);
            return;
        }

        console.log('Tool execution successful');
        console.log('Result:', result.llmContent);

        // Check if todos were created
        const createdTodos = todoService.getTodosByThreadId('default-thread');
        console.log(`Created ${createdTodos.length} todos:`);
        for (const todo of createdTodos) {
            console.log(`  - ${todo.title} (${todo.status})`);
        }

        // Test clearing todos
        console.log('\n--- Test 2: Clearing todos ---');
        const clearResult = await tool.buildAndExecute({
            todos: []
        }, new AbortController().signal);

        if (clearResult.error) {
            console.error('Clear tool execution failed:', clearResult.error.message);
            return;
        }

        console.log('Clear tool execution successful');
        console.log('Result:', clearResult.llmContent);

        // Check if todos were cleared
        const clearedTodos = todoService.getTodosByThreadId('default-thread');
        console.log(`Remaining todos: ${clearedTodos.length}`);

        console.log('\nManual test completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // Cleanup
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log(`Cleaned up temp directory: ${tempDir}`);
        }
    }
}

// Run the manual test
runManualTest().catch(console.error);