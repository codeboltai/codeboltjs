import { execFile } from 'child_process';
import type { ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { promisify } from 'util';
import WebSocket from 'ws';
import type { ProviderInitVars, AgentStartMessage, RawMessageForAgent } from '@codebolt/types/provider';
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
import {
  startAgentServer as startAgentServerUtil,
  stopAgentServer as stopAgentServerUtil,
  isAgentServerRunning as isAgentServerRunningUtil,
  isPortInUse,
} from '../utils/agentServer';

const execFileAsync = promisify(execFile);

export class GitWorktreeProviderService
  extends BaseProvider
  implements IProviderService {
  private logger: Logger;
  private environmentPath: string | null = null;
  private baseProjectPath: string | null = null;
  private isStartupCheck = false;

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
      agentServerPort: config.agentServerPort ?? 3001,
      agentServerHost: config.agentServerHost ?? 'localhost',
      wsRegistrationTimeout: config.timeouts?.wsConnection ?? 10_000,
      reconnectAttempts: 10,
      reconnectDelay: 1_000,
      transport: 'websocket',
    });

    this.providerConfig = {
      agentServerPort: config.agentServerPort ?? 3001,
      agentServerHost: config.agentServerHost ?? 'localhost',
      cleanupEnvironmentPath: config.cleanupEnvironmentPath ?? true,
      executionMode: config.executionMode ?? this.getExecutionModeFromEnv(),
      timeouts: {
        agentServerStartup: config.timeouts?.agentServerStartup ?? 60_000,
        wsConnection: config.timeouts?.wsConnection ?? 30_000,
        gitOperations: config.timeouts?.gitOperations ?? 30_000,
        cleanup: config.timeouts?.cleanup ?? 15_000,
      },
    };

    this.logger = createPrefixedLogger('[Local Threadpool Environment Provider]');
  }

  async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
    this.logger.log('Starting provider with environment:', initVars.environmentName);

    this.isStartupCheck = true;
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
      };
    } finally {
      this.isStartupCheck = false;
    }
  }

  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    this.logger.log('Agent start requested, forwarding to agent server:', agentMessage);
    if (this.providerConfig.executionMode === 'local_thread_pool') {
      this.logger.log('Local threadpool mode: agent execution is handled by the host thread pool.');
      return;
    }

    this.isStartupCheck = true;
    try {
      await this.ensureAgentServer();

      if (!this.agentServer.isConnected && this.state.environmentName) {
        this.logger.log('Agent server not connected, attempting to reconnect transport...');
        await this.ensureTransportConnection({
          environmentName: this.state.environmentName,
          projectPath: this.state.projectPath ?? undefined,
        } as any);
      }

      await super.onProviderAgentStart(agentMessage);
    } finally {
      this.isStartupCheck = false;
    }
  }

  async onProviderStop(initVars: ProviderInitVars): Promise<void> {
    this.logger.log('Provider stop requested for environment:', initVars.environmentName);

    try {
      this.stopHeartbeat();

      if (initVars.environmentName) {
        this.unregisterConnectedEnvironment(initVars.environmentName);
      }

      await this.stopAgentServer();
      await this.disconnectTransport();
      await this.teardownEnvironment();

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

  async onUserMessage(userMessage: RawMessageForAgent): Promise<void> {
    this.logger.log('onUserMessage received:', userMessage?.messageId ?? 'unknown');
    await super.onRawMessage(userMessage);
  }

  async startAgentServer(): Promise<void> {
    if (this.providerConfig.executionMode === 'local_thread_pool') {
      this.logger.log('Local threadpool mode: skipping agent server startup');
      return;
    }

    this.logger.log('Starting agent server...');

    try {
      if (this.agentServer.process && !this.agentServer.process.killed) {
        this.logger.log('Agent server process already exists, skipping startup');
        return;
      }

      const preferredPort = this.providerConfig.agentServerPort!;
      const availablePort = await this.findAvailablePort(preferredPort);

      if (availablePort !== preferredPort) {
        this.logger.log(`Using port ${availablePort} instead of configured port ${preferredPort}`);
        this.providerConfig.agentServerPort = availablePort;
      }

      this.agentServer.serverUrl = this.buildAgentServerUrl();

      this.agentServer.process = await startAgentServerUtil({
        logger: this.logger,
        port: availablePort,
        projectPath: this.environmentPath ?? this.state.projectPath ?? undefined,
      });

      this.agentServer.process.on('exit', (code, signal) => {
        this.logger.warn(`Agent server process exited unexpectedly with code ${code} and signal ${signal}`);
        this.agentServer.process = null;
        this.agentServer.isConnected = false;
      });
    } catch (error: any) {
      this.logger.error('Error starting agent server:', error);
      throw new Error(`Failed to start agent server: ${error.message}`);
    }
  }

  async connectToAgentServer(environmentPath: string, environmentName: string): Promise<void> {
    if (this.providerConfig.executionMode === 'local_thread_pool') {
      this.logger.log(`Local threadpool mode: skipping agent server connection for ${environmentName} at ${environmentPath}`);
      return;
    }

    try {
      this.logger.log(`Connecting to local environment workspace: ${environmentPath} (environment=${environmentName})`);
      if (this.agentServer.isConnected) {
        return;
      }

      this.logger.log('Ensuring WebSocket connection to agent server...');
      await this.ensureTransportConnection({ environmentName, type: 'local-threadpool' });
    } catch (error: any) {
      this.logger.error('Error connecting to agent server:', error);
      throw new Error(`Failed to connect to agent server: ${error.message}`);
    }
  }

  async sendMessageToAgent(message: RawMessageForAgent): Promise<boolean> {
    try {
      return await this.sendToAgentServer(message);
    } catch (error: any) {
      this.logger.error('Error sending message to agent:', error);
      return false;
    }
  }

  async stopAgentServer(): Promise<boolean> {
    try {
      const result = await stopAgentServerUtil({
        logger: this.logger,
        processRef: this.agentServer.process,
      });

      this.agentServer.process = null;

      return result;
    } catch (error: any) {
      this.logger.error('Error stopping agent server:', error);
      return false;
    }
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

  getAgentServerConnection(): {
    process: ChildProcess | null;
    wsConnection: WebSocket | null;
    serverUrl: string;
    isConnected: boolean;
    metadata: Record<string, unknown>;
  } {
    return {
      process: this.agentServer.process as ChildProcess | null,
      wsConnection: this.agentServer.wsConnection as WebSocket | null,
      serverUrl: this.agentServer.serverUrl,
      isConnected: this.agentServer.isConnected,
      metadata: this.agentServer.metadata,
    };
  }

  isInitialized(): boolean {
    return this.state.initialized && this.agentServer.isConnected;
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
    try {
      this.logger.log('Received close signal, initiating cleanup...');
      await this.stopAgentServer();
    } catch (error: any) {
      this.logger.error('Error during beforeClose cleanup:', error);
    }
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

  protected handleTransportMessage(message: RawMessageForAgent): void {
    try {
      if (message?.type) {
        this.logger.log('WebSocket message received:', message.type);
      }

      switch (message.type) {
        case 'agentStartResponse':
          this.logger.log('Agent start response:', message.data ?? 'unknown');
          if (message.data) {
            this.logger.error('Agent start error:', message.data);
          }
          break;
        case 'agentMessage':
          this.logger.log('Agent message:', message.data ?? 'no message');
          break;
        case 'notification':
          this.logger.log('Agent notification:', message.action, message.data);
          break;
        case 'error':
          this.logger.error('Agent server error:', message.message ?? 'unknown error');
          break;
        default:
          this.logger.log('Unhandled message type:', message.type);
      }

      super.handleTransportMessage(message);
    } catch (error: any) {
      this.logger.error('Error handling transport message:', error);
    }
  }

  private async isPortAvailable(port: number): Promise<boolean> {
    return !(await isPortInUse({ port, host: '127.0.0.1' }));
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

  private async findAvailablePort(preferredPort: number, maxAttempts: number = 10): Promise<number> {
    let port = preferredPort;
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
      this.logger.warn(`Port ${port} is in use, trying next port...`);
      port++;
    }
    throw new Error(`Could not find an available port after ${maxAttempts} attempts starting from ${preferredPort}`);
  }

  private async isAgentServerRunning(): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'test' && !this.isStartupCheck) {
        return true;
      }

      if (!this.agentServer.serverUrl) {
        this.agentServer.serverUrl = this.buildAgentServerUrl();
      }

      return await isAgentServerRunningUtil(
        {
          agentServerPort: this.providerConfig.agentServerPort,
          agentServerHost: this.providerConfig.agentServerHost,
          timeouts: this.providerConfig.timeouts,
        },
        this.logger,
        this.agentServer.serverUrl,
      );
    } catch (error) {
      this.logger.warn('Error checking if agent server is running:', error);
      return false;
    }
  }

  async onCloseSignal(): Promise<void> {
    try {
      this.logger.log('Received close signal, initiating cleanup...');
      await this.stopAgentServer();
      await this.teardownEnvironment();
    } catch (error: any) {
      this.logger.error('Error during onCloseSignal cleanup:', error);
    }
  }
}

