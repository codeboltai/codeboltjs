import { execFile } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import { promisify } from 'util';
import type { ProviderInitVars } from '@codebolt/types/provider';
import {
  BaseProvider,
  ProviderStartResult,
} from '@codebolt/provider';
import {
  IProviderService,
  DiffResult,
  WorktreeInfo,
  ProviderConfig,
  LocalThreadpoolProspectivePathRequest,
  LocalThreadpoolProspectivePathResponse,
  LocalThreadpoolSyncMode,
  LocalThreadpoolPathSource,
  LocalThreadpoolSyncPolicy,
} from '../interfaces/IProviderService';
import { createPrefixedLogger, type Logger } from '../utils/logger';
import { getDiff } from '../utils/gitDiff';

const execFileAsync = promisify(execFile);

export class GitWorktreeProviderService
  extends BaseProvider
  implements IProviderService {
  private logger: Logger;
  private environmentPath: string | null = null;
  private baseProjectPath: string | null = null;
  private readonly providerConfig: ProviderConfig;
  private readonly syncPolicy: LocalThreadpoolSyncPolicy = {
    defaultSyncMode: 'git',
    modes: [

      {
        value: 'none',
        label: 'None',
        description: 'Create an empty provider-managed folder without initial sync.',
        pathFolder: 'environments',
        createsGitWorktree: false,
        usesWorkspaceSync: false,
        cleanup: 'filesystem',
      },
    ],
  };
  private readonly supportedSyncModes: LocalThreadpoolSyncMode[] = this.syncPolicy.modes.map((mode) => mode.value);
  private currentSyncMode: LocalThreadpoolSyncMode = 'git';
  private currentPathSource: LocalThreadpoolPathSource = 'provider_proposed';
  private requestedPath: string | undefined;

  private readonly defaultEmptyDiffResult: DiffResult = {
    files: [],
    summary: {
      totalFiles: 0,
      totalAdditions: 0,
      totalDeletions: 0,
      totalChanges: 0,
    },
    rawDiff: '',
  };

  private environmentInfo: WorktreeInfo = {
    path: null,
    tag: null,
    isCreated: false,
  };

  constructor(config: ProviderConfig = {}) {
    super({
      agentServerPort: 0,
      agentServerHost: 'localhost',
      wsRegistrationTimeout: config.timeouts?.wsConnection ?? 10_000,
      reconnectAttempts: 10,
      reconnectDelay: 1_000,
      transport: 'websocket',
    });

    this.providerConfig = {
      cleanupEnvironmentPath: config.cleanupEnvironmentPath ?? true,
      executionMode: config.executionMode ?? this.getExecutionModeFromEnv(),
      workspaceSyncExcludes: config.workspaceSyncExcludes ?? [
        '.git',
        path.join('.codebolt', 'environments'),
        path.join('.codebolt', 'worktree'),
        path.join('.codebolt', 'worktrees'),
      ],
      timeouts: {
        wsConnection: config.timeouts?.wsConnection ?? 30_000,
        gitOperations: config.timeouts?.gitOperations ?? 30_000,
        cleanup: config.timeouts?.cleanup ?? 15_000,
      },
    };

    this.logger = createPrefixedLogger('[Local Threadpool Environment Provider]');
  }

  async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
    this.logger.log('Starting provider with environment:', initVars.environmentName);

    try {
      const result = await super.onProviderStart(initVars);
      this.logger.log('Started environment workspace:', this.state.workspacePath);

      this.startHeartbeat();

      if (initVars.environmentName) {
        this.registerConnectedEnvironment(initVars.environmentName);
        this.startEnvironmentHeartbeat(initVars.environmentName);
      }

      return {
        ...result,
        worktreePath: this.state.workspacePath ?? undefined,
        resolvedPath: this.environmentPath ?? this.state.workspacePath ?? undefined,
        environmentPath: this.environmentPath ?? this.state.workspacePath ?? undefined,
        requestedPath: this.requestedPath,
        pathSource: this.currentPathSource,
        syncMode: this.currentSyncMode,
        mergeStrategy: this.currentSyncMode,
        parentPath: this.baseProjectPath ?? undefined,
        syncPolicy: this.syncPolicy,
        defaultSyncMode: this.syncPolicy.defaultSyncMode,
        supportedSyncModes: this.supportedSyncModes,
      } as ProviderStartResult & { worktreePath?: string };
    } finally {
      // No secondary agent server is managed by this provider.
    }
  }

  async onProviderStop(initVars: ProviderInitVars): Promise<void> {
    this.logger.log('Provider stop requested for environment:', initVars.environmentName);

    try {
      this.stopHeartbeat();

      if (initVars.environmentName) {
        this.unregisterConnectedEnvironment(initVars.environmentName);
      }

      await this.teardownEnvironment();
      await this.disconnectTransport();

      this.state.initialized = false;
      this.state.workspacePath = null;
      this.state.projectPath = null;
      this.environmentPath = null;
      this.environmentInfo = {
        path: null,
        tag: null,
        isCreated: false,
      };
      this.currentSyncMode = 'git';
      this.currentPathSource = 'provider_proposed';
      this.requestedPath = undefined;

      this.resetState();

      this.logger.log('Provider stopped successfully for environment:', initVars.environmentName);
    } catch (error) {
      this.logger.error('Error stopping provider for environment:', initVars.environmentName, error);
      throw error;
    }
  }

  async onGetDiffFiles(): Promise<DiffResult> {
    this.logger.log('Getting diff files for environment');

    try {
      if (!this.state.projectPath) {
        return this.defaultEmptyDiffResult;
      }

      return await getDiff({
        workspacePath: this.state.projectPath,
        providerConfig: this.providerConfig,
        logger: this.logger,
      });
    } catch (error: any) {
      this.logger.warn('Diff operation failed; returning empty diff:', error.message);
      return {
        ...this.defaultEmptyDiffResult,
        rawDiff: '',
      };
    }
  }

  getProspectivePath(request: LocalThreadpoolProspectivePathRequest): LocalThreadpoolProspectivePathResponse {
    return this.resolveLaunchPaths(request);
  }

  private resolveLaunchPaths(request: LocalThreadpoolProspectivePathRequest): LocalThreadpoolProspectivePathResponse {
    const syncMode = this.normalizeSyncMode(
      this.getString(request, 'syncMode') ??
      this.getString(request, 'sync_mode') ??
      this.getString(request, 'mergeStrategy') ??
      this.getString(request, 'merge_strategy')
    );
    const environmentName = this.getString(request, 'environmentName') || 'environment';
    const parentPath = this.resolveOptionalPath(
      this.getString(request, 'projectPath') ??
      this.getString(request, 'parentPath') ??
      this.getString(request, 'parentProjectPath') ??
      this.getString(request, 'parentBasePath'),
      undefined
    );
    const requestedPath =
      this.getString(request, 'environmentPath') ??
      this.getString(request, 'requestedPath') ??
      this.getString(request, 'resolvedPath') ??
      this.getString(request, 'path');

    const pathSource: LocalThreadpoolPathSource = requestedPath ? 'user_override' : 'provider_proposed';
    const resolvedPath = requestedPath
      ? this.resolvePathInput(requestedPath, parentPath)
      : this.getDefaultEnvironmentPath(parentPath, environmentName, syncMode);

    return {
      resolvedPath,
      environmentPath: resolvedPath,
      requestedPath,
      pathSource,
      syncMode,
      mergeStrategy: syncMode,
      parentPath,
      syncPolicy: this.syncPolicy,
      supportedSyncModes: this.supportedSyncModes,
      defaultSyncMode: this.syncPolicy.defaultSyncMode,
    };
  }

  private normalizeSyncMode(value: string | undefined): LocalThreadpoolSyncMode {
    if (value && this.supportedSyncModes.includes(value as LocalThreadpoolSyncMode)) {
      return value as LocalThreadpoolSyncMode;
    }

    return this.syncPolicy.defaultSyncMode;
  }

  private getString(source: Record<string, unknown>, key: string): string | undefined {
    const value = source[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private safeEnvironmentName(environmentName: string): string {
    return (environmentName || 'environment').replace(/[^a-zA-Z0-9_.-]/g, '-');
  }

  private resolveOptionalPath(inputPath: string | undefined, basePath: string | undefined): string | undefined {
    return inputPath ? this.resolvePathInput(inputPath, basePath) : undefined;
  }

  private resolvePathInput(inputPath: string, basePath: string | undefined): string {
    if (inputPath === '~') {
      return os.homedir();
    }

    if (inputPath.startsWith(`~${path.sep}`) || inputPath.startsWith('~/')) {
      return path.resolve(os.homedir(), inputPath.slice(2));
    }

    if (path.isAbsolute(inputPath)) {
      return path.resolve(inputPath);
    }

    return path.resolve(basePath || process.cwd(), inputPath);
  }

  private getDefaultEnvironmentPath(
    parentPath: string | undefined,
    environmentName: string,
    syncMode: LocalThreadpoolSyncMode
  ): string {
    const basePath = parentPath || this.baseProjectPath || process.cwd();
    const safeName = this.safeEnvironmentName(environmentName);
    const folder = syncMode === 'git' ? 'worktree' : 'environments';
    return path.join(basePath, '.codebolt', folder, safeName);
  }

  private isSamePath(targetPath: string): boolean {
    const normalizedTarget = path.resolve(targetPath);

    if (this.baseProjectPath) {
      return normalizedTarget === path.resolve(this.baseProjectPath);
    }

    return false;
  }

  private shouldCleanupWorkspace(targetPath: string): boolean {
    if (this.providerConfig.cleanupEnvironmentPath === false) {
      return false;
    }

    return !this.isSamePath(targetPath);
  }

  private shouldCopyWorkspaceEntry(sourcePath: string, basePath: string, targetPath: string): boolean {
    const normalizedSource = path.resolve(sourcePath);
    const normalizedBase = path.resolve(basePath);
    const normalizedTarget = path.resolve(targetPath);

    if (normalizedSource === normalizedTarget || normalizedSource.startsWith(`${normalizedTarget}${path.sep}`)) {
      return false;
    }

    const relativePath = path.relative(normalizedBase, normalizedSource);
    if (!relativePath || relativePath === '.') {
      return true;
    }

    const excludes = this.providerConfig.workspaceSyncExcludes || [];
    return !excludes.some((excludePattern) => {
      const normalizedExclude = path.normalize(excludePattern);
      return relativePath === normalizedExclude || relativePath.startsWith(`${normalizedExclude}${path.sep}`);
    });
  }

  private async syncWorkspaceFromParent(parentPath: string, targetPath: string): Promise<void> {
    const normalizedParent = path.resolve(parentPath);
    const normalizedTarget = path.resolve(targetPath);

    if (normalizedParent === normalizedTarget) {
      this.logger.log('Workspace sync target is the parent project path; skipping copy:', normalizedTarget);
      return;
    }

    await fs.mkdir(normalizedTarget, { recursive: true });
    this.logger.log('Syncing workspace data from parent project:', normalizedParent, 'to:', normalizedTarget);

    await fs.cp(normalizedParent, normalizedTarget, {
      recursive: true,
      force: true,
      errorOnExist: false,
      filter: (sourcePath) => this.shouldCopyWorkspaceEntry(sourcePath, normalizedParent, normalizedTarget),
    });
  }

  private normalizeRelativePath(inputPath: string): string {
    const workspacePath = this.environmentPath;
    if (!workspacePath) {
      return inputPath;
    }

    if (!inputPath) {
      return inputPath;
    }

    if (path.isAbsolute(inputPath)) {
      if (inputPath === workspacePath || inputPath.startsWith(`${workspacePath}${path.sep}`)) {
        return path.relative(workspacePath, inputPath);
      }
      return inputPath;
    }

    return inputPath;
  }

  async onReadFile(filePath: string): Promise<string> {
    this.logger.log('Reading file:', filePath);
    try {
      if (!this.environmentPath) {
        throw new Error('No environment path available');
      }
      const normalizedPath = this.normalizeRelativePath(filePath);
      const fullPath = path.join(this.environmentPath, normalizedPath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error: any) {
      this.logger.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async onWriteFile(filePath: string, content: string): Promise<void> {
    this.logger.log('Writing file:', filePath);
    try {
      if (!this.environmentPath) {
        throw new Error('No environment path available');
      }
      const normalizedPath = this.normalizeRelativePath(filePath);
      const fullPath = path.join(this.environmentPath, normalizedPath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error: any) {
      this.logger.error('Error writing file:', error);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  async onDeleteFile(filePath: string): Promise<void> {
    this.logger.log('Deleting file:', filePath);
    try {
      if (!this.environmentPath) {
        throw new Error('No environment path available');
      }
      const normalizedPath = this.normalizeRelativePath(filePath);
      const fullPath = path.join(this.environmentPath, normalizedPath);
      await fs.unlink(fullPath);
    } catch (error: any) {
      this.logger.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async onDeleteFolder(folderPath: string): Promise<void> {
    this.logger.log('Deleting folder:', folderPath);
    try {
      if (!this.environmentPath) {
        throw new Error('No environment path available');
      }
      const normalizedPath = this.normalizeRelativePath(folderPath);
      const fullPath = path.join(this.environmentPath, normalizedPath);
      await fs.rm(fullPath, { recursive: true, force: true });
    } catch (error: any) {
      this.logger.error('Error deleting folder:', error);
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }

  async onRenameItem(oldPath: string, newPath: string): Promise<void> {
    this.logger.log('Renaming item:', oldPath, 'to', newPath);
    try {
      if (!this.environmentPath) {
        throw new Error('No environment path available');
      }
      const normalizedOldPath = this.normalizeRelativePath(oldPath);
      const normalizedNewPath = this.normalizeRelativePath(newPath);
      const fullOldPath = path.join(this.environmentPath, normalizedOldPath);
      const fullNewPath = path.join(this.environmentPath, normalizedNewPath);
      await fs.rename(fullOldPath, fullNewPath);
    } catch (error: any) {
      this.logger.error('Error renaming item:', error);
      throw new Error(`Failed to rename item: ${error.message}`);
    }
  }

  async onCreateFolder(folderPath: string): Promise<void> {
    this.logger.log('Creating folder:', folderPath);
    try {
      if (!this.environmentPath) {
        throw new Error('No environment path available');
      }
      const normalizedPath = this.normalizeRelativePath(folderPath);
      const fullPath = path.join(this.environmentPath, normalizedPath);
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error: any) {
      this.logger.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  async onGetProject(parentId: string = 'root'): Promise<any[]> {
    this.logger.log('Getting project structure for parentId:', parentId);
    try {
      if (!this.environmentPath) {
        throw new Error('No environment path available');
      }

      const parentPath = parentId === 'root' ? this.environmentPath : path.join(this.environmentPath, parentId);
      const parentStats = await fs.stat(parentPath);

      if (!parentStats.isDirectory()) {
        return [];
      }

      const items = await fs.readdir(parentPath, { withFileTypes: true });

      const children = await Promise.all(
        items
          .filter((item) => {
            if (!item.isDirectory() && item.name !== '.DS_Store') return true;
            return !item.name.startsWith('.') || item.name === '.codeboltAgents' || item.name === '.codebolt';
          })
          .map(async (item) => {
            const itemPath = path.join(parentPath, item.name);
            const relativePath = parentId === 'root' ? item.name : path.join(parentId, item.name);
            const stats = await fs.stat(itemPath);

            return {
              id: relativePath,
              name: item.name,
              path: itemPath,
              isFolder: item.isDirectory(),
              size: item.isDirectory() ? 0 : stats.size,
              lastModified: stats.mtime.toISOString(),
            };
          })
      );

      children.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });

      return children;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.logger.warn('Parent folder not found:', parentId);
        return [];
      }
      this.logger.error('Error getting project structure:', error);
      throw new Error(`Failed to get project structure: ${error.message}`);
    }
  }

  async onMergeAsPatch(): Promise<string> {
    this.logger.log('Merge/push workflow is not supported for local threadpool environment mode.');
    throw new Error('Merge/push workflow is not supported for local threadpool environment mode.');
  }

  async onSendPR(): Promise<void> {
    this.logger.log('PR workflow is not supported for local threadpool environment mode.');
    throw new Error('PR workflow is not supported for local threadpool environment mode.');
  }

  onCreatePatchRequest(): void {
    throw new Error('Function not implemented.');
  }

  onCreatePullRequestRequest(): void {
    throw new Error('Function not implemented.');
  }

  async createWorktree(projectPath: string, environmentName: string, targetPath?: string): Promise<WorktreeInfo> {
    try {
      const basePath = path.resolve(projectPath);
      await this.git(['rev-parse', '--is-inside-work-tree'], basePath);

      const safeEnvironmentName = this.safeEnvironmentName(environmentName);
      const tag = `${safeEnvironmentName}-${Date.now()}`;
      const worktreePath = targetPath
        ? path.resolve(targetPath)
        : this.getDefaultEnvironmentPath(basePath, environmentName, 'git');
      const worktreeRoot = path.dirname(worktreePath);
      const branchName = `codebolt/local-threadpool-${tag}`;

      await fs.mkdir(worktreeRoot, { recursive: true });
      await this.git(['worktree', 'add', '-b', branchName, worktreePath, 'HEAD'], basePath);

      return {
        path: worktreePath,
        tag: branchName,
        isCreated: true,
        syncMode: 'git',
      };
    } catch (error: any) {
      this.logger.error('Failed to initialize git worktree environment:', error.message);
      throw new Error(`Could not initialize git worktree environment: ${error.message}`);
    }
  }

  async removeWorktree(projectPath: string): Promise<boolean> {
    try {
      const normalizedPath = path.resolve(projectPath);
      if (!this.shouldCleanupWorkspace(normalizedPath)) {
        this.logger.log('Skipping environment workspace cleanup due to provider config:', normalizedPath);
        return true;
      }

      let branchName = this.environmentInfo.tag || '';
      if (this.environmentInfo.syncMode && this.environmentInfo.syncMode !== 'git') {
        this.logger.log('Removing local environment workspace:', normalizedPath);
        await fs.rm(normalizedPath, { recursive: true, force: true });
        return true;
      }

      try {
        const { stdout } = await this.git(['rev-parse', '--abbrev-ref', 'HEAD'], normalizedPath);
        branchName = stdout.trim() || branchName;
      } catch {
        // Best-effort cleanup continues below.
      }

      const basePath = this.baseProjectPath || path.resolve(normalizedPath, '..', '..', '..');
      this.logger.log('Removing git worktree:', normalizedPath, 'from base repo:', basePath);
      try {
        await this.git(['worktree', 'remove', '--force', normalizedPath], basePath);
      } catch (error: any) {
        this.logger.warn('git worktree remove failed; falling back to filesystem cleanup:', error.stderr || error.message);
        await fs.rm(normalizedPath, { recursive: true, force: true });
        try {
          await this.git(['worktree', 'prune'], basePath);
        } catch (pruneError: any) {
          this.logger.warn('git worktree prune failed after filesystem cleanup:', pruneError.stderr || pruneError.message);
        }
      }

      if (branchName && branchName !== 'HEAD') {
        try {
          await this.git(['branch', '-D', branchName], basePath);
        } catch (error: any) {
          this.logger.warn('Unable to delete worktree branch; it may already be gone or checked out elsewhere:', error.stderr || error.message);
        }
      }

      return true;
    } catch (error: any) {
      this.logger.error('Error removing local environment path:', error);
      throw new Error(`Failed to remove local environment path: ${error.message}`);
    }
  }

  getWorktreeInfo(): WorktreeInfo {
    return { ...this.environmentInfo };
  }

  isInitialized(): boolean {
    return this.state.initialized;
  }

  protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
    const launch = this.resolveLaunchPaths(initVars as LocalThreadpoolProspectivePathRequest);
    const projectPath = (initVars as any).projectPath as string | undefined;
    const executionMode = (initVars as any).executionMode as ProviderConfig['executionMode'] | undefined;

    if (executionMode) {
      this.providerConfig.executionMode = executionMode;
    }

    this.currentSyncMode = launch.syncMode;
    this.currentPathSource = launch.pathSource;
    this.requestedPath = launch.requestedPath;
    this.state.projectPath = launch.resolvedPath;

    if (projectPath) {
      this.baseProjectPath = path.resolve(projectPath);
    } else if (launch.parentPath) {
      this.baseProjectPath = launch.parentPath;
    } else {
      this.baseProjectPath = path.resolve(launch.resolvedPath, '..', '..', '..');
    }

    this.environmentPath = launch.resolvedPath;
  }

  protected async ensureAgentServer(): Promise<void> {
    if (this.providerConfig.executionMode === 'local_thread_pool') {
      this.logger.log('Local threadpool mode: no agent server required during provider start');
      return;
    }

    await super.ensureAgentServer();
  }

  async ensureTransportConnection(initVars: ProviderInitVars): Promise<void> {
    if (this.providerConfig.executionMode === 'local_thread_pool') {
      this.logger.log('Local threadpool mode: no secondary transport required during provider start');
      return;
    }

    await super.ensureTransportConnection(initVars);
  }

  protected async resolveWorkspacePath(initVars: ProviderInitVars): Promise<string> {
    if (!this.state.projectPath) {
      throw new Error('Project path is undefined in provider state');
    }

    return this.state.projectPath;
  }

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    try {
      const workspacePath = this.state.projectPath;
      if (!workspacePath) {
        throw new Error('Project path is not available');
      }

      if (this.currentSyncMode === 'git') {
        const basePath = this.baseProjectPath || workspacePath;
        const createdInfo = await this.createWorktree(basePath, initVars.environmentName, workspacePath);
        this.environmentInfo = createdInfo;
        this.state.workspacePath = createdInfo.path;
        this.state.projectPath = createdInfo.path;
        this.environmentPath = createdInfo.path;
        return;
      }

      await fs.mkdir(workspacePath, { recursive: true });

      if (this.currentSyncMode === 'workspace_sync' && this.baseProjectPath) {
        await this.syncWorkspaceFromParent(this.baseProjectPath, workspacePath);
      }

      this.environmentInfo = {
        path: workspacePath,
        tag: null,
        isCreated: true,
        syncMode: this.currentSyncMode,
      };
      this.state.workspacePath = workspacePath;
      this.state.projectPath = workspacePath;
      this.environmentPath = workspacePath;
    } catch (error: any) {
      this.logger.error('Error setting up environment:', error);
      throw new Error(`Failed to setup environment: ${error.message}`);
    }
  }

  protected async teardownEnvironment(): Promise<void> {
    try {
      const workspacePath = this.state.workspacePath || this.environmentPath;
      if (!workspacePath) {
        return;
      }

      await this.removeWorktree(workspacePath);
    } catch (error: any) {
      this.logger.error('Error tearing down environment:', error);
    }
  }

  protected async beforeClose(): Promise<void> {
    this.logger.log('Received close signal; no secondary agent server cleanup is required.');
  }

  protected buildWebSocketUrl(initVars: ProviderInitVars): string {
    const query = new URLSearchParams({
      clientType: 'app',
      appId: `local-threadpool-${initVars.environmentName}`,
      projectName: initVars.environmentName,
    });

    if (this.state.projectPath) {
      query.set('currentProject', this.state.projectPath);
    }

    return `${this.agentServer.serverUrl}?${query.toString()}`;
  }

  private async git(args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
    return execFileAsync('git', args, {
      cwd,
      timeout: this.providerConfig.timeouts?.gitOperations ?? 30_000,
    });
  }

  private getExecutionModeFromEnv(): ProviderConfig['executionMode'] {
    try {
      const envConfig = process.env.ENVIRONMENT_CONFIG ? JSON.parse(process.env.ENVIRONMENT_CONFIG) : {};
      return envConfig.executionMode;
    } catch {
      return undefined;
    }
  }

  async onCloseSignal(): Promise<void> {
    try {
      this.logger.log('Received close signal, initiating cleanup...');
      await this.teardownEnvironment();
    } catch (error: any) {
      this.logger.error('Error during onCloseSignal cleanup:', error);
    }
  }
}
