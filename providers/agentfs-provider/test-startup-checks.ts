
import { AgentFSProviderService } from './dist/services/AgentFSProviderService.js';
import type { ProviderInitVars, AgentStartMessage } from '@codebolt/types/provider';

// Helper to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    console.log('Starting Integrated Startup Flow Test for AgentFS Provider...');

    const TEST_PORT = 3335;
    const TEST_PROJECT_PATH = process.cwd();

    const provider = new AgentFSProviderService({
        agentServerPort: TEST_PORT,
        agentFSBinaryPath: process.env.AGENTFS_BINARY_PATH || 'agentfs'
    });

    try {
        const initVars: ProviderInitVars = {
            projectPath: TEST_PROJECT_PATH,
            environmentName: `test-env-agentfs-${Date.now()}`,
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
                threadId: 'test-thread-id',
                templateType: 'userChat',
                processId: '',
                activeFile: '',
                openedFiles: [],
                isRemoteTask: true,
                environment: {
                    name: initVars.environmentName,
                    provider: { type: 'agentfs-provider' },
                    config: {},
                    id: 'test-env-id',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                shadowGitHash: ''
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
        await provider.stopAgentServer();
    }
}

runTests().catch(e => {
    console.error('Unhandled Error:', e);
    process.exit(1);
});
