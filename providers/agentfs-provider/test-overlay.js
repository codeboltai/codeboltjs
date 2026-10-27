const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promises: fs } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { promisify } = require('node:util');
const { AgentFsOverlayProvider } = require('./dist/AgentFsOverlayProvider.js');

const run = promisify(execFile);

async function main() {
  const testRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'codebolt-agentfs-provider-test-'));
  const basePath = path.join(testRoot, 'base');
  const environmentPath = path.join(testRoot, 'virtual-environment');
  const provider = new AgentFsOverlayProvider();

  await fs.mkdir(path.join(basePath, 'folder'), { recursive: true });
  await fs.writeFile(path.join(basePath, 'original.txt'), 'base content');
  await fs.writeFile(path.join(basePath, 'delete-me.txt'), 'keep in base');
  await fs.writeFile(path.join(basePath, 'folder', 'nested.txt'), 'nested base');
  await run('git', ['init', '--quiet', '-b', 'main'], { cwd: basePath });
  await run('git', ['add', '-A'], { cwd: basePath });
  await run('git', [
    '-c', 'user.name=CodeBolt Test',
    '-c', 'user.email=codebolt-test@local.invalid',
    'commit', '--quiet', '-m', 'base',
  ], { cwd: basePath });
  const baseSha = (await run('git', ['rev-parse', 'HEAD'], { cwd: basePath })).stdout.trim();

  try {
    const result = await provider.onProviderStart({
      environmentName: `overlay-smoke-${process.pid}`,
      projectPath: basePath,
      environmentPath,
    });

    assert.equal(result.workspacePath, environmentPath);
    assert.deepEqual(result.filesystem, { type: 'provider', root: environmentPath });
    assert.equal(result.gitBaseRef, 'main');
    assert.match(result.gitHeadRef, /^codebolt\/agentfs\//);
    assert.equal(await provider.onReadFile(path.join(environmentPath, 'original.txt')), 'base content');
    assert((await fs.stat(environmentPath)).isDirectory());
    assert((await fs.readdir(environmentPath)).includes('original.txt'));

    await fs.writeFile(path.join(environmentPath, 'native-write.txt'), 'written without provider callback');
    assert.equal(await provider.onReadFile('native-write.txt'), 'written without provider callback');

    await provider.onWriteFile(path.join(environmentPath, 'original.txt'), 'overlay content');
    await provider.onWriteFile(path.join(environmentPath, 'created.txt'), 'created in overlay');
    await provider.onCreateFolder(path.join(environmentPath, 'new-folder'));
    await provider.onWriteFile(path.join(environmentPath, 'new-folder', 'before.txt'), 'rename me');
    await provider.onRenameItem(
      path.join(environmentPath, 'new-folder', 'before.txt'),
      path.join(environmentPath, 'new-folder', 'after.txt'),
    );
    await provider.onCopyFolder(
      path.join(environmentPath, 'folder'),
      path.join(environmentPath, 'folder-copy'),
    );
    await provider.onCopyFile('original.txt', 'copied.txt');
    await provider.onDeleteFile(path.join(environmentPath, 'delete-me.txt'));
    await provider.onDeleteFolder('folder');

    assert.equal(await provider.onReadFile('original.txt'), 'overlay content');
    assert.equal(await provider.onReadFile('new-folder/after.txt'), 'rename me');
    assert.equal(await provider.onReadFile('folder-copy/nested.txt'), 'nested base');
    assert.equal(await provider.onReadFile('copied.txt'), 'overlay content');
    await assert.rejects(provider.onReadFile('delete-me.txt'), /ENOENT/);
    await assert.rejects(provider.onReadFile('folder/nested.txt'), /ENOENT/);
    await assert.rejects(provider.onReadFile('../outside.txt'), /outside/);

    const tree = await provider.onGetProject('root');
    const names = tree.map((item) => item.name);
    assert(names.includes('original.txt'));
    assert(names.includes('created.txt'));
    assert(names.includes('folder-copy'));
    assert(!names.includes('delete-me.txt'));
    assert(!names.includes('folder'));

    assert.equal(await fs.readFile(path.join(basePath, 'original.txt'), 'utf8'), 'base content');
    assert.equal(await fs.readFile(path.join(basePath, 'delete-me.txt'), 'utf8'), 'keep in base');
    await assert.rejects(fs.stat(path.join(basePath, 'created.txt')), { code: 'ENOENT' });
    await assert.rejects(fs.stat(path.join(basePath, 'folder-copy')), { code: 'ENOENT' });
    await assert.rejects(fs.stat(path.join(basePath, 'native-write.txt')), { code: 'ENOENT' });

    const diff = await provider.onGetDiffFiles();
    const statuses = new Map(diff.files.map((file) => [file.path, file.status]));
    assert.equal(statuses.get('original.txt'), 'modified');
    assert.equal(statuses.get('created.txt'), 'added');
    assert.equal(statuses.get('delete-me.txt'), 'deleted');
    assert.equal(statuses.get('folder/nested.txt'), 'deleted');
    assert.equal(statuses.get('new-folder/after.txt'), 'added');
    assert.equal(statuses.get('folder-copy/nested.txt'), 'added');
    assert.equal(statuses.get('copied.txt'), 'added');
    assert.equal(statuses.get('native-write.txt'), 'added');

    const patch = await provider.onMergeAsPatch();
    assert.match(patch, /original\.txt/);
    assert.match(patch, /native-write\.txt/);

    const applyTarget = path.join(testRoot, 'apply-target');
    await run('git', ['clone', '--quiet', basePath, applyTarget]);
    const patchPath = path.join(testRoot, 'changes.diff');
    await fs.writeFile(patchPath, patch);
    await run('git', ['apply', '--check', patchPath], { cwd: applyTarget });
    await run('git', ['apply', patchPath], { cwd: applyTarget });
    assert.equal(await fs.readFile(path.join(applyTarget, 'original.txt'), 'utf8'), 'overlay content');
    assert.equal(await fs.readFile(path.join(applyTarget, 'native-write.txt'), 'utf8'), 'written without provider callback');

    const pullRequest = await provider.onSendPR();
    assert.equal(pullRequest.sourceType, 'git');
    assert.equal(pullRequest.mergeConfig.git.transport, 'local_merge');
    assert.equal(pullRequest.mergeConfig.git.repositoryPath, basePath);
    assert.equal(pullRequest.mergeConfig.git.checkoutPath, `${environmentPath}.agentfs/review.git`);
    assert.match(pullRequest.headSha, /^[0-9a-f]{40}$/);
    await assert.rejects(run('git', ['cat-file', '-e', `${pullRequest.headSha}^{commit}`], { cwd: basePath }));

    await run('git', ['fetch', '--no-tags', pullRequest.checkoutPath, pullRequest.headSha], { cwd: basePath });
    await run('git', ['update-ref', 'refs/codebolt/rmr/test', 'FETCH_HEAD'], { cwd: basePath });
    const retainedSha = (await run('git', ['rev-parse', 'refs/codebolt/rmr/test'], { cwd: basePath })).stdout.trim();
    assert.equal(retainedSha, pullRequest.headSha);

    await provider.onCloseSignal();
    const reviewPath = path.join(testRoot, 'review-environment');
    const reviewResult = await provider.onProviderStart({
      environmentName: `review-overlay-smoke-${process.pid}`,
      projectPath: basePath,
      environmentPath: reviewPath,
      bootstrap: {
        type: 'git_revision',
        reviewRequestId: 'rmr-test',
        baseCommitSha: baseSha,
        headCommitSha: retainedSha,
        retainedRef: 'refs/codebolt/rmr/test',
        branchName: `codebolt/review/test-${process.pid}`,
      },
    });
    assert.deepEqual(reviewResult.bootstrapResult, {
      type: 'git_revision',
      verified: true,
      expectedRevision: retainedSha,
      actualRevision: retainedSha,
      reviewRequestId: 'rmr-test',
      retainedRef: 'refs/codebolt/rmr/test',
    });
    assert.equal(await fs.readFile(path.join(reviewPath, 'original.txt'), 'utf8'), 'overlay content');
    assert.equal(await fs.readFile(path.join(reviewPath, 'native-write.txt'), 'utf8'), 'written without provider callback');
  } finally {
    await provider.onCloseSignal();
    await fs.rm(testRoot, { recursive: true, force: true });
  }

  console.log('AgentFS mounted overlay smoke test passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
