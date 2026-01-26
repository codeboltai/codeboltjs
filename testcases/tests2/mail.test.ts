/**
 * Test Suite for Mail Module
 */

import {
    sharedCodebolt,
    waitForConnection,
    resetTestState,
    clearMockData,
} from './setup';

describe('Mail Module', () => {
    beforeAll(async () => {
        console.log('[Mail Module] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[Mail Module] Connection ready');
    });

    afterEach(() => {
        resetTestState();
        clearMockData();
    });

    test('should register an agent for mail', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.mail.registerAgent({
            agentId: 'test-mail-agent-123',
            agentName: 'Test Mail Agent',
            capabilities: ['send', 'receive', 'process']
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify agent registration
        console.log('✅ AskUserQuestion: Was the mail agent registered successfully?');
        console.log('   Agent ID:', response.agent?.id);
    });

    test('should list mail agents', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.mail.listAgents();

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(Array.isArray(response.agents)).toBe(true);

        // AskUserQuestion: Verify agent listing
        console.log('✅ AskUserQuestion: Were mail agents listed successfully?');
        console.log('   Total Agents:', response.agents?.length || 0);
    });

    test('should create a mail thread', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.mail.createThread({
            subject: 'Test Mail Thread',
            participants: ['agent-1', 'agent-2'],
            type: 'agent-to-agent',
            metadata: {
                priority: 'normal'
            }
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.thread).toBeDefined();

        // AskUserQuestion: Verify thread creation
        console.log('✅ AskUserQuestion: Was the mail thread created successfully?');
        console.log('   Thread ID:', response.thread?.id);
        console.log('   Subject:', response.thread?.subject);
    });

    test('should list mail threads', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.mail.listThreads({
            type: 'agent-to-agent',
            limit: 10
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(Array.isArray(response.threads)).toBe(true);

        // AskUserQuestion: Verify thread listing
        console.log('✅ AskUserQuestion: Were mail threads listed successfully?');
        console.log('   Total Threads:', response.threads?.length || 0);
    });

    test('should find or create mail thread', async () => {
        const codebolt = sharedCodebolt();

        const response = await codebolt.mail.findOrCreateThread({
            subject: 'Find or Create Test Thread',
            participants: ['agent-1', 'agent-2'],
            type: 'agent-to-agent'
        });

        expect(response).toBeDefined();
        expect(response.success).toBe(true);

        // AskUserQuestion: Verify find or create
        console.log('✅ AskUserQuestion: Was the thread found or created successfully?');
        console.log('   Thread ID:', response.thread?.id);
        console.log('   Created:', response.created);
    });
});
