/**
 * Test Suite for ContextAssembly Module
 */

import {
    sharedCodebolt,
    waitForConnection,
} from './setup';

describe('ContextAssembly Module', () => {
    beforeAll(async () => {
        console.log('[ContextAssembly] Setting up test environment...');
        await waitForConnection(30000);
        console.log('[ContextAssembly] Connection ready');
    });

    describe('ContextAssembly Module', () => {
        test('should get context', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.contextAssembly.getContext({
                memoryTypes: ['episodic', 'semantic'],
                variables: {
                    agentId: 'test-agent-123',
                    task: 'test-task'
                }
            });

            expect(response).toBeDefined();
            expect(response.context).toBeDefined();

            // AskUserQuestion: Verify context retrieval
            console.log('✅ AskUserQuestion: Was the context assembled successfully?');
            console.log('   Context Items:', response.context?.items?.length || 0);
        });

        test('should validate context request', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.contextAssembly.validate({
                memoryTypes: ['episodic'],
                variables: {
                    agentId: 'test-agent'
                }
            });

            expect(response).toBeDefined();
            expect(response.valid).toBeDefined();

            // AskUserQuestion: Validate context request
            console.log('✅ AskUserQuestion: Was the context request validated successfully?');
            console.log('   Valid:', response.valid);
        });

        test('should list memory types', async () => {
            const codebolt = sharedCodebolt();

            const response = await codebolt.contextAssembly.listMemoryTypes();

            expect(response).toBeDefined();
            expect(Array.isArray(response.memoryTypes)).toBe(true);

            // AskUserQuestion: Verify memory types listing
            console.log('✅ AskUserQuestion: Were memory types listed successfully?');
            console.log('   Total Types:', response.memoryTypes?.length || 0);
        });
    });
});
