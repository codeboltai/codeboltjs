import { execFile } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
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

      const { agentServerUrl, ...localResult } = result as ProviderStartResult & { agentServerUrl?: string };
      void agentServerUrl;

      return {
        ...localResult,
        worktreePath: this.state.workspacePath ?? undefined,
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

  async createWorktree(projectPath: string, environmentName: string): Promise<WorktreeInfo> {
    try {
      const basePath = path.resolve(projectPath);
      await this.git(['rev-parse', '--is-inside-work-tree'], basePath);

      const safeEnvironmentName = (environmentName || 'environment').replace(/[^a-zA-Z0-9_.-]/g, '-');
      const tag = `${safeEnvironmentName}-${Date.now()}`;
      const worktreeRoot = path.join(basePath, '.codebolt', 'worktrees');
      const worktreePath = path.join(worktreeRoot, tag);
      const branchName = `codebolt/local-threadpool-${tag}`;

      await fs.mkdir(worktreeRoot, { recursive: true });
      await this.git(['worktree', 'add', '-b', branchName, worktreePath, 'HEAD'], basePath);

      return {
        path: worktreePath,
        tag: branchName,
        isCreated: true,
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
    const environmentPath = (initVars as any).environmentPath as string | undefined;
    const projectPath = (initVars as any).projectPath as string | undefined;
    const executionMode = (initVars as any).executionMode as ProviderConfig['executionMode'] | undefined;

    if (executionMode) {
      this.providerConfig.executionMode = executionMode;
    }

    if (environmentPath) {
      this.state.projectPath = path.resolve(environmentPath);
    } else if (projectPath) {
      this.state.projectPath = path.resolve(projectPath);
    } else {
      throw new Error('Neither environmentPath nor projectPath is available in provider start vars');
    }

    if (projectPath) {
      this.baseProjectPath = path.resolve(projectPath);
    } else if (environmentPath) {
      this.baseProjectPath = path.resolve(environmentPath);
    }

    this.environmentPath = this.state.projectPath;
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

      await fs.mkdir(workspacePath, { recursive: true });

      const createdInfo = await this.createWorktree(workspacePath, initVars.environmentName);
      this.environmentInfo = createdInfo;
      this.state.workspacePath = createdInfo.path;
      this.state.projectPath = createdInfo.path;
      this.environmentPath = createdInfo.path;
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




