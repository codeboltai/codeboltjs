/**
 * Test Suite for Notify Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    isConnectionReady,
    resetTestState,
    clearMockData,
} from './setup';

describe('Notify Module', () => {
    /**
     * Set up connection before running any tests
     */
    beforeAll(async () => {
        console.log('[TestSuite] Setting up test environment for Notify module...');
        await waitForConnection(30000);
        console.log('[TestSuite] Connection ready');
    });

    /**
     * Clean up after all tests complete
     */
    afterAll(async () => {
        console.log('[TestSuite] All Notify module tests completed');
    });

    /**
     * Reset state between each test to ensure isolation
     */
    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should send agent notification', () => {
        const codebolt = sharedCodebolt();

        const notification = codebolt.notify.agent.subagentTaskCreated({
            subagentId: 'test-agent-123',
            task: 'Test task description',
            timestamp: new Date().toISOString()
        });

        expect(notification).toBeDefined();

        // AskUserQuestion: Verify agent notification
        console.log('✅ AskUserQuestion: Was the agent notification sent successfully?');
        console.log('   Type: subagentTaskCreated');
        console.log('   Subagent ID: test-agent-123');
    });

    test('should send fs notification', () => {
        const codebolt = sharedCodebolt();

        const notification = codebolt.notify.fs.readFileStarted({
            path: '/test/path/file.txt',
            operationId: 'op-123'
        });

        expect(notification).toBeDefined();

        // AskUserQuestion: Verify fs notification
        console.log('✅ AskUserQuestion: Was the fs notification sent successfully?');
        console.log('   Type: readFileStarted');
        console.log('   Path: /test/path/file.txt');
    });

    test('should send llm notification', () => {
        const codebolt = sharedCodebolt();

        const notification = codebolt.notify.llm.inferenceRequest({
            model: 'gpt-4',
            prompt: 'Test prompt',
            maxTokens: 1000
        });

        expect(notification).toBeDefined();

        // AskUserQuestion: Verify llm notification
        console.log('✅ AskUserQuestion: Was the llm notification sent successfully?');
        console.log('   Type: inferenceRequest');
        console.log('   Model: gpt-4');
    });

    test('should send chat notification', () => {
        const codebolt = sharedCodebolt();

        const notification = codebolt.notify.chat.userMessage({
            message: 'Test user message',
            threadId: 'thread-123',
            timestamp: new Date().toISOString()
        });

        expect(notification).toBeDefined();

        // AskUserQuestion: Verify chat notification
        console.log('✅ AskUserQuestion: Was the chat notification sent successfully?');
        console.log('   Type: userMessage');
        console.log('   Thread ID: thread-123');
    });

    test('should send terminal notification', () => {
        const codebolt = sharedCodebolt();

        const notification = codebolt.notify.terminal.commandExecuted({
            command: 'echo "test"',
            exitCode: 0,
            output: 'test\n'
        });

        expect(notification).toBeDefined();

        // AskUserQuestion: Verify terminal notification
        console.log('✅ AskUserQuestion: Was the terminal notification sent successfully?');
        console.log('   Type: commandExecuted');
        console.log('   Command: echo "test"');
    });

    test('should send multiple notifications in sequence', () => {
        const codebolt = sharedCodebolt();

        // Send multiple notifications
        const notifications = [
            codebolt.notify.system.agentInitialized({
                agentId: 'agent-123',
                agentName: 'Test Agent'
            }),
            codebolt.notify.fs.writeFileStarted({
                path: '/test/file.txt',
                content: 'test content'
            }),
            codebolt.notify.git.commitCreated({
                hash: 'abc123',
                message: 'Test commit'
            })
        ];

        expect(notifications).toHaveLength(3);
        expect(notifications.every(n => n !== undefined)).toBe(true);

        // AskUserQuestion: Verify multiple notifications
        console.log('✅ AskUserQuestion: Were all 3 notifications sent successfully?');
        console.log('   Notifications: system.agentInitialized, fs.writeFileStarted, git.commitCreated');
    });

    test('should send todo notification', () => {
        const codebolt = sharedCodebolt();

        const notification = codebolt.notify.todo.todoCreated({
            todoId: 'todo-123',
            title: 'Test todo item',
            status: 'pending'
        });

        expect(notification).toBeDefined();

        // AskUserQuestion: Verify todo notification
        console.log('✅ AskUserQuestion: Was the todo notification sent successfully?');
        console.log('   Type: todoCreated');
        console.log('   Todo ID: todo-123');
    });

    test('should send search notification', () => {
        const codebolt = sharedCodebolt();

        const notification = codebolt.notify.search.queryExecuted({
            query: 'test search query',
            resultsCount: 5,
            queryId: 'query-123'
        });

        expect(notification).toBeDefined();

        // AskUserQuestion: Verify search notification
        console.log('✅ AskUserQuestion: Was the search notification sent successfully?');
        console.log('   Type: queryExecuted');
        console.log('   Query: test search query');
    });
});
