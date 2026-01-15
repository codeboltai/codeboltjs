
import { GitWorktreeProviderService } from './dist/services/GitWorktreeProviderService.js';
import type { ProviderInitVars, AgentStartMessage } from '@codebolt/types/provider';

// Helper to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    console.log('Starting Integrated Startup Flow Test...');

    const TEST_PORT = 3334;
    const TEST_PROJECT_PATH = process.cwd();

    const provider = new GitWorktreeProviderService({
        agentServerPort: TEST_PORT,
        worktreeBaseDir: '/Users/ravirawat/Documents/cbtest/environment-test/.test_worktree_actual'
    });

    // Initial Cleanup - Removed as requested
    // try { await provider.stopAgentServer(); } catch { }

    try {
        const initVars: ProviderInitVars = {
            projectPath: TEST_PROJECT_PATH,
            environmentName: `test-env-actual-${Date.now()}`,
        } as any;

        const agentMsg: AgentStartMessage = {
            type: 'messageResponse',
            message: {
                type: 'messageResponse',
                userMessage: 'hi\n\n',
                currentFile: '',
                selectedAgent: { id: '', name: '', lastMessage: {} },
                mentionedFiles: [],
                mentionedFolders: [],
                mentionedMultiFile: [],
                mentionedMCPs: [],
                uploadedImages: [],
                actions: [],
                mentionedAgents: [],
                mentionedDocs: [],
                links: [],
                universalAgentLastMessage: '',
                selection: null,
                controlFiles: [],
                feedbackMessage: '',
                terminalMessage: '',
                messageId: '',
                threadId: '40fcbebc-3003-45a8-b119-aa4fd346d0af',
                templateType: 'userChat',
                processId: '',
                activeFile: '/Users/ravirawat/Documents/cbtest/environment-test/.codeboltAgents/providers/git-work-tree-provider/remote.json',
                openedFiles: [
                    '/Users/ravirawat/Documents/cbtest/environment-test/.codeboltAgents/providers/git-work-tree-provider/remote.json'
                ],
                isRemoteTask: true,
                environment: {
                    name: 'fdfdfdsfdsfdsfdsf',
                    provider: [Object],
                    config: [Object],
                    id: 'f178ad7c-f7b7-468e-ab64-1b2b2609ed60',
                    createdAt: '2026-01-15T11:58:53.063Z',
                    updatedAt: '2026-01-15T11:58:53.064Z'
                },
                shadowGitHash: 'f8fa43778f843f79671680d87837d3b5620f24f7'
            },
            sender: { senderType: 'user', senderInfo: {} },
            templateType: 'userChat',
            data: { text: 'hi' }
        } as any;

        // Step 1: Provider Start
        console.log('\nStep 1: Calling onProviderStart...');
        await provider.onProviderStart(initVars);
        console.log('Step 1 Complete: Provider started successfully.');

        // Step 2: Agent Start
        console.log('\nStep 2: Calling onProviderAgentStart...');
        await provider.onProviderAgentStart(agentMsg);
        console.log('Step 2 Complete: Agent started successfully.');

    } catch (e: any) {
        console.error('Test Failed:', e);
        process.exit(1);
    } finally {
        console.log('\nTest execution completed.');
        // await provider.stopAgentServer(); // Removed as requested
    }
}

runTests().catch(e => {
    console.error('Unhandled Error:', e);
    process.exit(1);
});
