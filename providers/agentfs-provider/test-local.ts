import { AgentFSProviderService } from './dist/services/AgentFSProviderService.js';
import type { ProviderInitVars } from '@codebolt/types/provider';

const TEST_CONFIG = {
    projectPath: process.env.TEST_PROJECT_PATH || process.cwd(),
    environmentName: process.env.TEST_ENV_NAME || `agentfs-local-${Date.now()}`,
};

async function main() {
    const provider = new AgentFSProviderService({
        agentFSSdkPackage: process.env.AGENTFS_SDK_PACKAGE || 'agentfs-sdk',
        agentFSIdPrefix: process.env.AGENTFS_ID_PREFIX || 'codebolt-local-test',
    });

    const initVars: ProviderInitVars = {
        projectPath: TEST_CONFIG.projectPath,
        environmentName: TEST_CONFIG.environmentName,
    } as any;

    try {
        const startResult = await provider.onProviderStart(initVars);
        console.log('Started AgentFS provider:', {
            workspacePath: startResult.workspacePath,
            environmentPath: startResult.environmentPath,
            agentFSId: startResult.agentFSId,
        });

        await provider.onWriteFile('local-test/notes.txt', 'AgentFS local test');
        const content = await provider.onReadFile('local-test/notes.txt');
        console.log('Read content:', content);

        const entries = await provider.onGetProject('local-test');
        console.log('Directory entries:', entries.map((entry: any) => entry.name));

        await provider.onDeleteFile('local-test/notes.txt');
        console.log('Deleted local-test/notes.txt');
    } finally {
        await provider.onProviderStop(initVars);
    }
}

main().catch((error) => {
    console.error('AgentFS local test failed:', error);
    process.exit(1);
});
