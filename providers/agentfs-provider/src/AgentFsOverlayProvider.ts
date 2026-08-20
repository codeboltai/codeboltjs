import { execFile, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { promises as host } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import type { ProviderInitVars } from '@codebolt/types/provider';

type ChangeStatus = 'added' | 'modified' | 'deleted';

interface GitRevisionBootstrap {
  type: 'git_revision';
  reviewRequestId?: string;
  baseCommitSha?: string;
  headCommitSha: string;
  retainedRef?: string;
  branchName?: string;
}

interface AgentFsChange {
  status: ChangeStatus;
  type: 'f' | 'd' | 'l' | '?';
  path: string;
}

const run = promisify(execFile);

export class AgentFsOverlayProvider {
  private mountProcess: ChildProcessWithoutNullStreams | null = null;
  private basePath = '';
  private environmentPath = '';
  private statePath = '';
  private databasePath = '';
  private reviewRepositoryPath = '';
  private agentFsBin = '';
  private environmentName = '';
  private baseRef = '';
  private baseSha = '';
  private headRef = '';
  private bootstrapResult: Record<string, unknown> | undefined;

  async onProviderStart(vars: ProviderInitVars): Promise<Record<string, unknown>> {
    console.log('[agentfs-provider] providerStart received', JSON.stringify({
      environmentName: vars.environmentName,
      projectPath: vars.projectPath,
      environmentPath: vars.environmentPath,
    }));
    await this.cleanup();
    if (!vars.projectPath) throw new Error('AgentFS provider requires projectPath');

    this.basePath = path.resolve(String(vars.projectPath));
    const base = await host.stat(this.basePath).catch(() => null);
    if (!base?.isDirectory()) throw new Error(`Project directory does not exist: ${this.basePath}`);

    const name = vars.environmentName.replace(/[^a-zA-Z0-9_.-]/g, '-');
    this.environmentName = vars.environmentName;
    const bootstrap = (vars as Record<string, unknown>).bootstrap as GitRevisionBootstrap | undefined;
    if (bootstrap && (bootstrap.type !== 'git_revision' || !bootstrap.headCommitSha)) {
      throw new Error('AgentFS review bootstrap requires git_revision and headCommitSha');
    }
    this.baseRef = (await this.git(['rev-parse', '--abbrev-ref', 'HEAD'], this.basePath)).trim();
    const parentSha = (await this.git(['rev-parse', 'HEAD^{commit}'], this.basePath)).trim();
    this.baseSha = bootstrap?.baseCommitSha || parentSha;
    this.headRef = bootstrap?.branchName || `codebolt/agentfs/${name}`;
    this.environmentPath = path.resolve(String(
      vars.environmentPath || path.join(os.tmpdir(), 'codebolt-agentfs', name, 'workspace'),
    ));
    this.statePath = `${this.environmentPath}.agentfs`;
    this.databasePath = path.join(this.statePath, '.agentfs', 'overlay.db');
    this.reviewRepositoryPath = path.join(this.statePath, 'review.git');
    await host.mkdir(this.environmentPath, { recursive: true });
    await host.mkdir(this.statePath, { recursive: true });

    const reviewRepositoryExists = await host.access(
      path.join(this.reviewRepositoryPath, 'HEAD'),
    ).then(() => true, () => false);
    if (!reviewRepositoryExists) {
      await this.git(['clone', '--quiet', '--bare', '--shared', this.basePath, this.reviewRepositoryPath], this.statePath);
    }
    if (bootstrap) {
      await this.reviewGit(['fetch', '--quiet', '--no-tags', this.basePath, bootstrap.headCommitSha]);
    } else {
      const storedBase = await this.reviewGit(['rev-parse', '--verify', 'refs/codebolt/base'])
        .then((value) => value.trim(), () => '');
      if (storedBase) this.baseSha = storedBase;
      else await this.reviewGit(['update-ref', 'refs/codebolt/base', this.baseSha]);
    }
    const branchExists = await this.reviewGit(
      ['show-ref', '--verify', '--quiet', `refs/heads/${this.headRef}`],
    ).then(() => true, () => false);
    if (bootstrap || !branchExists) {
      await this.reviewGit([
        'update-ref', `refs/heads/${this.headRef}`,
        bootstrap?.headCommitSha || this.baseSha,
      ]);
    }
    await this.reviewGit(['symbolic-ref', 'HEAD', `refs/heads/${this.headRef}`]);

    const cargoAgentFs = path.join(os.homedir(), '.cargo', 'bin', 'agentfs');
    this.agentFsBin = process.env.AGENTFS_BIN
      || await host.access(cargoAgentFs).then(() => cargoAgentFs, () => 'agentfs');
    try {
      const { stdout: version } = await run(this.agentFsBin, ['--version']);
      if (process.platform === 'darwin' && !/^agentfs v0\.(?:[6-9]|[1-9]\d)\./.test(version.trim())) {
        throw new Error(`AgentFS 0.6.0 or newer is required for macOS mounts; found ${version.trim()}`);
      }

      const databaseExists = await host.access(this.databasePath).then(() => true, () => false);
      if (!databaseExists) {
        await run(this.agentFsBin, ['init', '--base', this.basePath, 'overlay'], { cwd: this.statePath });
      }

      await this.mountOverlay();

      await host.readdir(this.environmentPath);

      if (bootstrap) {
        const patchFile = path.join(this.statePath, 'bootstrap.diff');
        const patch = await this.reviewGit(['diff', '--binary', parentSha, bootstrap.headCommitSha]);
        if (patch) {
          await host.writeFile(patchFile, patch);
          await this.git(['apply', '--whitespace=nowarn', patchFile], this.environmentPath);
        }
        const actualRevision = bootstrap.headCommitSha;
        if (actualRevision !== bootstrap.headCommitSha) {
          throw new Error(`AgentFS review bootstrap mismatch: expected ${bootstrap.headCommitSha}, got ${actualRevision}`);
        }
        this.bootstrapResult = {
          type: 'git_revision',
          verified: true,
          expectedRevision: bootstrap.headCommitSha,
          actualRevision,
          reviewRequestId: bootstrap.reviewRequestId,
          retainedRef: bootstrap.retainedRef,
        };
      }
    } catch (error) {
      await this.cleanup();
      throw error;
    }

    console.log('[agentfs-provider] overlay mounted', JSON.stringify({
      environmentName: vars.environmentName,
      environmentPath: this.environmentPath,
      databasePath: this.databasePath,
    }));

    return {
      success: true,
      environmentName: vars.environmentName,
      agentServerUrl: '',
      transport: 'custom',
      workspacePath: this.environmentPath,
      worktreePath: this.environmentPath,
      environmentPath: this.environmentPath,
      resolvedPath: this.environmentPath,
      parentPath: this.basePath,
      parentProjectPath: this.basePath,
      requestedPath: vars.requestedPath || vars.environmentPath,
      pathSource: vars.pathSource || (vars.environmentPath ? 'user_override' : 'provider_proposed'),
      executionMode: 'local_thread_pool',
      filesystem: { type: 'provider', root: this.environmentPath },
      syncMode: 'git',
      mergeStrategy: 'git',
      rmrSourceType: 'git',
      supportedSyncModes: ['git'],
      supportedMergeStrategies: ['git'],
      gitBaseRef: this.baseRef,
      gitHeadRef: this.headRef,
      bootstrapResult: this.bootstrapResult,
      overlay: {
        type: 'agentfs-mount',
        basePath: this.basePath,
        databasePath: this.databasePath,
      },
    };
  }

  async onReadFile(filePath: string): Promise<string> {
    return host.readFile(this.resolve(filePath), 'utf8');
  }

  async onWriteFile(filePath: string, content: string): Promise<void> {
    const target = this.resolve(filePath);
    await host.mkdir(path.dirname(target), { recursive: true });
    await host.writeFile(target, content);
  }

  async onDeleteFile(filePath: string): Promise<void> {
    const target = this.resolve(filePath);
    await host.rm(target, { force: true });
  }

  async onDeleteFolder(folderPath: string): Promise<void> {
    await this.removeTree(this.resolve(folderPath));
  }

  async onCreateFolder(folderPath: string): Promise<void> {
    const target = this.resolve(folderPath);
    await host.mkdir(target, { recursive: true });
  }

  async onRenameItem(oldPath: string, newPath: string): Promise<void> {
    const source = this.resolve(oldPath);
    const target = this.resolve(newPath);
    await host.mkdir(path.dirname(target), { recursive: true });
    await host.rename(source, target);
  }

  async onCopyFile(sourcePath: string, destinationPath: string): Promise<void> {
    const target = this.resolve(destinationPath);
    await host.mkdir(path.dirname(target), { recursive: true });
    await host.copyFile(this.resolve(sourcePath), target);
  }

  async onCopyFolder(sourcePath: string, destinationPath: string): Promise<void> {
    const target = this.resolve(destinationPath);
    await host.cp(this.resolve(sourcePath), target, { recursive: true });
  }

  async onGetProject(parentId = 'root'): Promise<Record<string, unknown>[]> {
    const directory = this.resolve(parentId === 'root' ? '' : parentId);
    const entries = await host.readdir(directory, { withFileTypes: true });
    return Promise.all(entries.map(async (entry) => {
      const child = path.join(directory, entry.name);
      const stats = await host.stat(child);
      return {
        id: path.relative(this.environmentPath, child),
        name: entry.name,
        path: child,
        isFolder: entry.isDirectory(),
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
      };
    }));
  }

  async onGetFullProject(): Promise<Record<string, unknown>> {
    return { root: this.environmentPath, children: await this.onGetProject('root') };
  }

  async onGetDiffFiles(): Promise<Record<string, unknown>> {
    let changes: AgentFsChange[] = [];
    await this.unmountOverlay();
    try {
      changes = await this.readAgentFsChanges();
    } finally {
      await this.mountOverlay();
    }
    const files = changes.filter((change) => change.type !== 'd').map(({ path: file, status }) => ({
      file, path: file, status, changes: 0, insertions: 0, deletions: 0, binary: false,
    }));
    return {
      files,
      insertions: 0,
      deletions: 0,
      changed: files.length,
      summary: {
        totalFiles: files.length,
        totalAdditions: 0,
        totalDeletions: 0,
        totalChanges: files.length,
      },
    };
  }

  async onMergeAsPatch(): Promise<string> {
    if (!this.environmentPath || !this.baseSha) throw new Error('AgentFS provider is not started');
    await this.unmountOverlay();
    try {
      const changes = await this.readAgentFsChanges();
      const exportPath = path.join(this.statePath, '.review-delta');
      const inputPath = path.join(this.statePath, '.review-changes.json');
      const changedFiles = changes
        .filter((change) => change.status !== 'deleted' && change.type !== 'd')
        .filter((change) => change.path !== '.git' && !change.path.startsWith('.git/'))
        .map((change) => change.path);
      await host.rm(exportPath, { recursive: true, force: true });
      await host.writeFile(inputPath, JSON.stringify(changedFiles));
      await run(process.execPath, [
        path.join(__dirname, 'extractDelta.js'),
        this.databasePath,
        inputPath,
        exportPath,
      ], {
        env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
        maxBuffer: 10 * 1024 * 1024,
      });
      try {
        await this.reviewGit(['read-tree', this.baseSha]);
        for (const change of changes) {
          if (!change.path || change.path === '.git' || change.path.startsWith('.git/')) continue;
          if (change.status === 'deleted') {
            const tracked = (await this.reviewGit([
              'ls-tree', '-r', '--name-only', this.baseSha, '--', change.path,
            ])).split('\n').filter(Boolean);
            for (const file of tracked) {
              await this.reviewGit(['update-index', '--force-remove', '--', file]);
            }
            continue;
          }
        }
        const manifest = JSON.parse(
          await host.readFile(path.join(exportPath, 'manifest.json'), 'utf8'),
        ) as Array<{ path: string; file: string; mode: number; symlink: boolean }>;
        for (const file of manifest) {
          const blobSha = (await this.reviewGit([
            'hash-object', '-w', path.join(exportPath, file.file),
          ])).trim();
          const mode = file.symlink ? '120000' : (file.mode & 0o111) ? '100755' : '100644';
          await this.reviewGit(['update-index', '--add', '--cacheinfo', `${mode},${blobSha},${file.path}`]);
        }
        const treeSha = (await this.reviewGit(['write-tree'])).trim();
        return this.reviewGit(['diff', '--binary', this.baseSha, treeSha]);
      } finally {
        await host.rm(exportPath, { recursive: true, force: true });
        await host.rm(inputPath, { force: true });
      }
    } finally {
      await this.mountOverlay();
    }
  }

  async onSendPR(): Promise<Record<string, unknown>> {
    if (!this.environmentPath || !this.basePath) throw new Error('AgentFS provider is not started');
    const diffPatch = await this.onMergeAsPatch();
    const majorFilesChanged = (await this.reviewGit(
      ['diff', '--cached', '--name-only', this.baseSha],
    )).split('\n').filter(Boolean);
    const treeSha = (await this.reviewGit(['write-tree'])).trim();
    const headTree = (await this.reviewGit(['rev-parse', 'HEAD^{tree}'])).trim();
    if (treeSha !== headTree) {
      await this.reviewGit([
        '-c', 'user.name=CodeBolt',
        '-c', 'user.email=codebolt@local.invalid',
        'commit', '-m', `CodeBolt AgentFS review: ${this.environmentName}`,
      ]);
    }
    const headSha = (await this.reviewGit(['rev-parse', 'HEAD^{commit}'])).trim();
    const git = {
      provider: 'local_git',
      transport: 'local_merge',
      repositoryPath: this.basePath,
      checkoutPath: this.reviewRepositoryPath,
      baseRef: this.baseRef,
      headRef: this.headRef,
      headSha,
    };
    return {
      sourceType: 'git',
      rmrSourceType: 'git',
      title: `AgentFS changes: ${this.environmentName}`,
      description: `Local AgentFS review from ${this.environmentName}`,
      majorFilesChanged,
      diffPatch,
      headRef: this.headRef,
      headSha,
      baseRef: this.baseRef,
      checkoutPath: this.reviewRepositoryPath,
      repositoryPath: this.basePath,
      mergeConfig: { strategy: 'git', sourceType: 'git', git },
      git,
    };
  }

  async onCreatePatchRequest(): Promise<Record<string, unknown>> {
    return { success: true, patch: await this.onMergeAsPatch() };
  }

  async onCreatePullRequestRequest(): Promise<Record<string, unknown>> {
    return this.onSendPR();
  }

  async onProviderStop(vars: ProviderInitVars): Promise<Record<string, unknown>> {
    await this.cleanup();
    return { success: true, environmentName: vars.environmentName };
  }

  async onCloseSignal(): Promise<void> {
    await this.cleanup();
  }

  private resolve(input: string): string {
    if (!this.environmentPath) throw new Error('AgentFS provider is not started');
    const value = input === 'root' ? '' : input;
    const target = path.isAbsolute(value) ? path.resolve(value) : path.resolve(this.environmentPath, value);
    const relative = path.relative(this.environmentPath, target);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`Path is outside the AgentFS environment: ${input}`);
    }
    return target;
  }

  private async git(args: string[], cwd: string): Promise<string> {
    try {
      return (await run('git', args, { cwd, maxBuffer: 100 * 1024 * 1024 })).stdout;
    } catch (error) {
      const detail = error as { stderr?: string; message?: string };
      throw new Error(`Git ${args.join(' ')} failed: ${detail.stderr || detail.message || error}`);
    }
  }

  private async reviewGit(args: string[]): Promise<string> {
    return this.git([
      `--git-dir=${this.reviewRepositoryPath}`,
      `--work-tree=${this.environmentPath}`,
      ...args,
    ], this.statePath);
  }

  private async removeTree(directory: string): Promise<void> {
    const entries = await host.readdir(directory, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) await this.removeTree(target);
      else await host.unlink(target).catch(() => undefined);
    }
    await host.rmdir(directory).catch(() => undefined);
  }

  private async readAgentFsChanges(): Promise<AgentFsChange[]> {
    const { stdout } = await run(this.agentFsBin, ['diff', this.databasePath], {
      maxBuffer: 50 * 1024 * 1024,
    });
    const changes = new Map<string, AgentFsChange>();
    for (const line of stdout.split('\n').filter(Boolean)) {
      const match = line.match(/^([AMD]) ([fdl?]) \/?(.*)$/);
      if (!match || !match[3]) continue;
      changes.set(match[3], {
        status: match[1] === 'A' ? 'added' : match[1] === 'D' ? 'deleted' : 'modified',
        type: match[2] as AgentFsChange['type'],
        path: match[3],
      });
    }
    return [...changes.values()];
  }

  private async mountOverlay(): Promise<void> {
    if (this.mountProcess?.exitCode === null) return;
    const backend = process.platform === 'darwin' ? 'nfs' : 'fuse';
    const mount = spawn(this.agentFsBin, [
      'mount', '--backend', backend, '--foreground', '--auto-unmount',
      this.databasePath, this.environmentPath,
    ], { stdio: ['pipe', 'pipe', 'pipe'] });
    mount.stdin.end();
    this.mountProcess = mount;

    await new Promise<void>((resolve, reject) => {
      let output = '';
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        mount.kill('SIGINT');
        reject(new Error(`Timed out mounting AgentFS at ${this.environmentPath}: ${output.trim()}`));
      }, 30_000);
      const receive = (data: Buffer) => {
        const message = data.toString();
        output += message;
        console.log(`[agentfs-provider] ${message.trimEnd()}`);
        if (!settled && output.includes('Mounted at')) {
          settled = true;
          clearTimeout(timer);
          resolve();
        }
      };
      mount.stdout.on('data', receive);
      mount.stderr.on('data', receive);
      mount.once('error', (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      });
      mount.once('exit', (code, signal) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error(`AgentFS mount exited before ready (${code ?? signal}): ${output.trim()}`));
      });
    });
  }

  private async unmountOverlay(): Promise<void> {
    const mount = this.mountProcess;
    this.mountProcess = null;
    if (!mount || mount.exitCode !== null) return;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        mount.kill('SIGKILL');
        resolve();
      }, 5_000);
      mount.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
      mount.kill('SIGINT');
    });
  }

  private async cleanup(): Promise<void> {
    await this.unmountOverlay();
    this.basePath = '';
    this.environmentPath = '';
    this.statePath = '';
    this.databasePath = '';
    this.reviewRepositoryPath = '';
    this.agentFsBin = '';
    this.environmentName = '';
    this.baseRef = '';
    this.baseSha = '';
    this.headRef = '';
    this.bootstrapResult = undefined;
  }
}
