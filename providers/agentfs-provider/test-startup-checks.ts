import { AgentFSProviderService } from './dist/services/AgentFSProviderService.js';
import type { ProviderInitVars } from '@codebolt/types/provider';

async function runTests() {
    console.log('Starting AgentFS provider filesystem-only startup smoke test...');

    const provider = new AgentFSProviderService({
        agentFSSdkPackage: process.env.AGENTFS_SDK_PACKAGE || 'agentfs-sdk',
        agentFSIdPrefix: process.env.AGENTFS_ID_PREFIX || 'codebolt-test',
    });

    const initVars: ProviderInitVars = {
        projectPath: process.cwd(),
        environmentName: `agentfs-smoke-${Date.now()}`,
    } as any;

    try {
        const startResult = await provider.onProviderStart(initVars);
        console.log('Provider started:', {
            workspacePath: startResult.workspacePath,
            agentFSId: startResult.agentFSId,
            transport: startResult.transport,
        });

        await provider.onWriteFile('smoke/hello.txt', 'hello from agentfs');
        const content = await provider.onReadFile('smoke/hello.txt');
        if (content !== 'hello from agentfs') {
            throw new Error(`Unexpected file content: ${content}`);
        }

        const children = await provider.onGetProject('smoke');
        if (!children.some((child: any) => child.name === 'hello.txt')) {
            throw new Error('Expected smoke/hello.txt in AgentFS directory listing');
        }

        await provider.onDeleteFile('smoke/hello.txt');
        console.log('Filesystem smoke test completed successfully.');
    } finally {
        await provider.onProviderStop(initVars);
    }
}

runTests().catch((error) => {
    console.error('AgentFS provider startup smoke test failed:', error);
    process.exit(1);
});
