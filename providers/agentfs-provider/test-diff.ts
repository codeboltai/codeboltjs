import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { ProviderInitVars } from '@codebolt/types/provider';
import { AgentFSProviderService } from './dist/services/AgentFSProviderService.js';

async function runDiffTest(): Promise<void> {
    const testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'agentfs-provider-diff-'));
    const originalWorkingDirectory = process.cwd();
    const parentPath = path.join(testRoot, 'parent');
    const environmentPath = path.join(testRoot, 'environment');
    const environmentName = `agentfs-diff-${Date.now()}`;

    await fs.mkdir(path.join(parentPath, 'src'), { recursive: true });
    await fs.mkdir(path.join(parentPath, 'removed'), { recursive: true });
    await fs.writeFile(path.join(parentPath, 'unchanged.txt'), 'unchanged\n');
    await fs.writeFile(path.join(parentPath, 'src', 'modified.txt'), 'before\n');
    await fs.writeFile(path.join(parentPath, 'removed', 'deleted.txt'), 'delete me\n');

    const provider = new AgentFSProviderService({
        agentFSSdkPackage: process.env.AGENTFS_SDK_PACKAGE || 'agentfs-sdk',
        agentFSIdPrefix: 'codebolt-diff-test',
        cloneBaseProject: true,
    });
    const initVars = {
        projectPath: parentPath,
        environmentPath,
        environmentName,
    } as ProviderInitVars;

    let started = false;
    try {
        // AgentFS stores its local SQLite data beneath the current working
        // directory. Keep test state inside testRoot so cleanup is complete.
        process.chdir(testRoot);
        const startResult = await provider.onProviderStart(initVars);
        started = true;
        assert.equal(startResult.environmentPath, environmentPath);

        // Simulate commands executed inside the cloned environment directory.
        await fs.writeFile(path.join(environmentPath, 'src', 'modified.txt'), 'after\n');
        await fs.mkdir(path.join(environmentPath, 'added'), { recursive: true });
        await fs.writeFile(path.join(environmentPath, 'added', 'new.txt'), 'new file\n');
        await fs.rm(path.join(environmentPath, 'removed'), { recursive: true });

        const result = await provider.onGetDiffFiles();
        const filesByPath = new Map(result.files.map((file) => [file.path, file]));

        assert.equal(result.summary?.totalFiles, 3);
        assert.equal(filesByPath.get(path.join('src', 'modified.txt'))?.status, 'modified');
        assert.equal(filesByPath.get(path.join('added', 'new.txt'))?.status, 'added');
        assert.equal(filesByPath.get(path.join('removed', 'deleted.txt'))?.status, 'deleted');
        assert.equal(filesByPath.has('unchanged.txt'), false);

        assert.match(filesByPath.get(path.join('src', 'modified.txt'))?.diff ?? '', /^diff --git/m);
        assert.match(filesByPath.get(path.join('added', 'new.txt'))?.diff ?? '', /^\+new file$/m);
        assert.match(filesByPath.get(path.join('removed', 'deleted.txt'))?.diff ?? '', /^-delete me$/m);
        assert.ok((result.summary?.totalAdditions ?? 0) >= 2);
        assert.ok((result.summary?.totalDeletions ?? 0) >= 2);
        assert.ok(result.rawDiff?.includes('src/modified.txt'));

        console.log('AgentFS provider directory diff test passed:', result.summary);
    } finally {
        if (started) {
            await provider.onProviderStop(initVars);
        }
        process.chdir(originalWorkingDirectory);
        await fs.rm(testRoot, { recursive: true, force: true });
    }
}

runDiffTest().catch((error) => {
    console.error('AgentFS provider directory diff test failed:', error);
    process.exitCode = 1;
});
