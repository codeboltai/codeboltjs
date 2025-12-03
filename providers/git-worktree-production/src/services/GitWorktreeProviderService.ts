import type { ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import WebSocket from 'ws';
import codebolt from '@codebolt/codeboltjs';
import type { ProviderInitVars, AgentStartMessage, RawMessageForAgent } from '@codebolt/types/provider';
import {
  BaseProvider,
  ProviderStartResult,

} from '@codebolt/provider';
import {
  IProviderService,
  DiffResult,
  WorktreeInfo,
  ProviderConfig
} from '../interfaces/IProviderService';
import { createPrefixedLogger, type Logger } from '../utils/logger';
import { createWorktree as createWorktreeUtil, removeWorktree as removeWorktreeUtil, mergeWorktreeAsPatch as mergeWorktreeAsPatchUtil, pushWorktreeBranch as pushWorktreeBranchUtil } from '../utils/gitWorktree';
import { getDiff } from '../utils/gitDiff';
import {
  startAgentServer as startAgentServerUtil,
  stopAgentServer as stopAgentServerUtil,
  isAgentServerRunning as isAgentServerRunningUtil,
  testServerHealth,
  isPortInUse,
} from '../utils/agentServer';

export class GitWorktreeProviderService
  extends BaseProvider
  implements IProviderService {
  private worktreeInfo: WorktreeInfo = {
    path: null,
    branch: null,
    isCreated: false,
  };

  private baseRepoPath: string | null = null; // Store the base git repository path

  private readonly providerConfig: ProviderConfig;
  private readonly logger: Logger;

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
      worktreeBaseDir: config.worktreeBaseDir ?? '.worktree',
      timeouts: {
        agentServerStartup: config.timeouts?.agentServerStartup ?? 30_000,
        wsConnection: config.timeouts?.wsConnection ?? 10_000,
        gitOperations: config.timeouts?.gitOperations ?? 30_000,
        cleanup: config.timeouts?.cleanup ?? 15_000,
      },
    };

    this.logger = createPrefixedLogger('[Git WorkTree Provider]');
    // Initialize agent server URL
    // Agent server URL will be set by the base class
  }

  async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
    this.logger.log('Starting provider with environment:', initVars.environmentName);

    // Initialize base repo path from initVars
    const projectPath = initVars.projectPath as string | undefined;
    if (!projectPath) {
      throw new Error('Project path is not available in initVars');
    }
    this.baseRepoPath = projectPath;

    const result = await super.onProviderStart(initVars);
    this.logger.log('Started Environment with :', this.worktreeInfo.path ?? result.workspacePath);

    return {
      ...result,
      worktreePath: this.worktreeInfo.path ?? result.workspacePath,
    };
  }

  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    this.logger.log('Agent start requested, forwarding to agent server:', agentMessage);
    await super.onProviderAgentStart(agentMessage);
  }

  /**
   * Provider stop handler - stops the agent server and cleans up resources
   */
  async onProviderStop(initVars: ProviderInitVars): Promise<void> {
    this.logger.log('Provider stop requested for environment:', initVars.environmentName);

    try {
      // Stop the agent server
      await this.stopAgentServer();

      // Remove the worktree
      if (this.state.projectPath) {
        await this.removeWorktree(this.state.projectPath);
      }

      // Disconnect transport
      await this.disconnectTransport();

      // Reset state
      this.resetState();

      this.logger.log('Provider stopped successfully for environment:', initVars.environmentName);
    } catch (error) {
      this.logger.error('Error stopping provider for environment:', initVars.environmentName, error);
      throw error;
    }
  }

  async onGetDiffFiles(): Promise<DiffResult> {
    this.logger.log('Getting diff files from worktree');

    try {
      if (!this.worktreeInfo.path || !this.worktreeInfo.isCreated) {
        throw new Error('No worktree available - provider not initialized');
      }

      return await getDiff({
        worktreePath: this.worktreeInfo.path,
        providerConfig: this.providerConfig,
        logger: this.logger,
      });
    } catch (error: any) {
      this.logger.error('Error getting diff files:', error.message);
      if (error.stdout) this.logger.error('stdout:', error.stdout);
      if (error.stderr) this.logger.error('stderr:', error.stderr);
      throw new Error(`Failed to get diff files: ${error.message}`);
    }
  }

  async onReadFile(filePath: string): Promise<string> {
    this.logger.log('Reading file:', filePath);
    try {
      if (!this.worktreeInfo.path) {
        throw new Error('No worktree available');
      }
      const fullPath = path.join(this.worktreeInfo.path, filePath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error: any) {
      this.logger.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async onWriteFile(filePath: string, content: string): Promise<void> {
    this.logger.log('Writing file:', filePath);
    try {
      if (!this.worktreeInfo.path) {
        throw new Error('No worktree available');
      }
      const fullPath = path.join(this.worktreeInfo.path, filePath);
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
      if (!this.worktreeInfo.path) {
        throw new Error('No worktree available');
      }
      const fullPath = path.join(this.worktreeInfo.path, filePath);
      await fs.unlink(fullPath);
    } catch (error: any) {
      this.logger.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async onDeleteFolder(folderPath: string): Promise<void> {
    this.logger.log('Deleting folder:', folderPath);
    try {
      if (!this.worktreeInfo.path) {
        throw new Error('No worktree available');
      }
      const fullPath = path.join(this.worktreeInfo.path, folderPath);
      await fs.rm(fullPath, { recursive: true, force: true });
    } catch (error: any) {
      this.logger.error('Error deleting folder:', error);
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }

  async onRenameItem(oldPath: string, newPath: string): Promise<void> {
    this.logger.log('Renaming item:', oldPath, 'to', newPath);
    try {
      if (!this.worktreeInfo.path) {
        throw new Error('No worktree available');
      }
      const fullOldPath = path.join(this.worktreeInfo.path, oldPath);
      const fullNewPath = path.join(this.worktreeInfo.path, newPath);
      await fs.rename(fullOldPath, fullNewPath);
    } catch (error: any) {
      this.logger.error('Error renaming item:', error);
      throw new Error(`Failed to rename item: ${error.message}`);
    }
  }

  async onCreateFolder(folderPath: string): Promise<void> {
    this.logger.log('Creating folder:', folderPath);
    try {
      if (!this.worktreeInfo.path) {
        throw new Error('No worktree available');
      }
      const fullPath = path.join(this.worktreeInfo.path, folderPath);
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error: any) {
      this.logger.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  async onGetProject(parentId: string = 'root'): Promise<any[]> {
    this.logger.log('Getting project structure for parentId:', parentId);
    try {
      if (!this.worktreeInfo.path) {
        throw new Error('No worktree available');
      }

      // Construct parent path
      const parentPath = parentId === 'root'
        ? this.worktreeInfo.path
        : path.join(this.worktreeInfo.path, parentId);

      // Use async stat to check if path exists and is directory
      const parentStats = await fs.stat(parentPath);

      if (!parentStats.isDirectory()) {
        return []; // Not a folder, no children
      }

      // Read directory contents asynchronously
      const items = await fs.readdir(parentPath, { withFileTypes: true });

      // Process items in parallel using Promise.all
      const children = await Promise.all(
        items
          .filter(item => {
            // For files: show all files including hidden ones
            // Exclude .DS_Store files
            if (!item.isDirectory() && item.name !== '.DS_Store') return true;
            // For folders: hide hidden folders except .codeboltAgents
            return !item.name.startsWith('.') || item.name === '.codeboltAgents' || item.name === '.codebolt';
          })
          .map(async (item) => {
            const itemPath = path.join(parentPath, item.name);
            const relativePath = parentId === 'root'
              ? item.name
              : path.join(parentId, item.name);

            // Get stats for each item (parallelized)
            const stats = await fs.stat(itemPath);

            return {
              id: relativePath,
              name: item.name,
              path: itemPath,
              isFolder: item.isDirectory(),
              size: item.isDirectory() ? 0 : stats.size,
              lastModified: stats.mtime.toISOString()
            };
          })
      );

      // Sort the results
      children.sort((a, b) => {
        // Sort folders first, then files, both alphabetically
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
    this.logger.log('Merging worktree as patch');
    try {
      if (!this.baseRepoPath || !this.worktreeInfo.branch) {
        throw new Error('Base repo path or worktree branch not available');
      }
      return await mergeWorktreeAsPatchUtil({
        projectPath: this.baseRepoPath,
        environmentName: this.worktreeInfo.branch,
        providerConfig: this.providerConfig,
        logger: this.logger,
      });
    } catch (error: any) {
      this.logger.error('Error merging worktree as patch:', error);
      throw new Error(`Failed to merge worktree as patch: ${error.message}`);
    }
  }

  async onSendPR(): Promise<void> {
    this.logger.log('Sending PR (pushing branch)');
    try {
      if (!this.baseRepoPath || !this.worktreeInfo.branch) {
        throw new Error('Base repo path or worktree branch not available');
      }
      await pushWorktreeBranchUtil({
        projectPath: this.baseRepoPath,
        environmentName: this.worktreeInfo.branch,
        providerConfig: this.providerConfig,
        logger: this.logger,
      });
    } catch (error: any) {
      this.logger.error('Error sending PR:', error);
      throw new Error(`Failed to send PR: ${error.message}`);
    }
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
    this.logger.log('Starting agent server...');

    if (this.agentServer.process && !this.agentServer.process.killed) {
      this.logger.log('Agent server process already exists, skipping startup');
      return;
    }

    this.agentServer.process = await startAgentServerUtil({ logger: this.logger });
  }

  async connectToAgentServer(worktreePath: string, environmentName: string): Promise<void> {
    if (this.agentServer.isConnected) {
      return;
    }

    this.logger.log('Ensuring WebSocket connection to agent server...');
    await this.ensureTransportConnection({ environmentName, type: 'gitworktree' });
  }

  async sendMessageToAgent(message: RawMessageForAgent): Promise<boolean> {
    return this.sendToAgentServer(message);
  }

  async stopAgentServer(): Promise<boolean> {
    const result = await stopAgentServerUtil({
      logger: this.logger,
      processRef: this.agentServer.process,
    });

    this.agentServer.process = null;

    return result;
  }

  async createWorktree(projectPath: string, environmentName: string): Promise<WorktreeInfo> {
    try {
      const worktreeInfo = await createWorktreeUtil({
        projectPath,
        environmentName,
        providerConfig: this.providerConfig,
        logger: this.logger,
      });

      this.worktreeInfo = worktreeInfo;
      return worktreeInfo;
    } catch (error: any) {
      this.logger.error('Failed to create worktree:', error.message);
      if (error.stdout) this.logger.error('stdout:', error.stdout);
      if (error.stderr) this.logger.error('stderr:', error.stderr);
      throw new Error(`Git worktree creation failed: ${error.message}`);
    }
  }

  async removeWorktree(projectPath: string): Promise<boolean> {
    const updated = await removeWorktreeUtil({
      projectPath,
      worktreeInfo: this.worktreeInfo,
      providerConfig: this.providerConfig,
      logger: this.logger,
    });

    this.worktreeInfo = updated;

    return true;
  }

  getWorktreeInfo(): WorktreeInfo {
    return { ...this.worktreeInfo };
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
    return this.worktreeInfo.isCreated && this.agentServer.isConnected;
  }

  protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
    // Use the base repository path that was set from initVars in onProviderStart
    if (!this.baseRepoPath) {
      throw new Error('Base repository path is not available');
    }

    // Construct the worktree path
    const worktreePath = path.join(this.baseRepoPath, this.providerConfig.worktreeBaseDir!, initVars.environmentName);

    // Use the worktree path as the project path (this is the actual worktree project path)
    this.state.projectPath = worktreePath;
  }

  protected async resolveWorkspacePath(initVars: ProviderInitVars): Promise<string> {
    // Since resolveProjectContext already constructed the worktree path in this.state.projectPath
    // we can just return it directly
    if (!this.state.projectPath) {
      throw new Error('Project path is undefined in provider state');
    }

    return this.state.projectPath;
  }

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    if (!this.baseRepoPath) {
      throw new Error('Base repository path is not available');
    }

    // Create worktree using the base repo path
    const worktreeInfo = await this.createWorktree(this.baseRepoPath, initVars.environmentName);
    this.worktreeInfo = worktreeInfo;

    // Set workspace path to the worktree path
    if (worktreeInfo.path) {
      this.state.workspacePath = worktreeInfo.path;
      this.state.projectPath = worktreeInfo.path; // Use worktree path as project path
    }
  }

  protected async teardownEnvironment(): Promise<void> {
    // Use baseRepoPath to remove the worktree (needs to point to the base git repo, not the worktree)
    if (!this.baseRepoPath) {
      return;
    }

    await this.removeWorktree(this.baseRepoPath);
  }

  protected async ensureAgentServer(): Promise<void> {
    const isRunning = await this.isAgentServerRunning();
    if (isRunning) {
      this.logger.log('Agent server already running, skipping startup');
      return;
    }

    await this.startAgentServer();
    await new Promise(resolve => setTimeout(resolve, 10_000));
  }

  protected async beforeClose(): Promise<void> {
    this.logger.log('Received close signal, initiating cleanup...');
    await this.stopAgentServer();
  }

  protected buildWebSocketUrl(initVars: ProviderInitVars): string {
    const query = new URLSearchParams({
      clientType: 'app',
      appId: `git-worktree-${initVars.environmentName}`,
      projectName: initVars.environmentName,
    });

    // Use state.projectPath which contains the worktree path
    if (this.state.projectPath) {
      query.set('currentProject', this.state.projectPath);
    }

    return `${this.agentServer.serverUrl}?${query.toString()}`;
  }

  protected handleTransportMessage(message: RawMessageForAgent): void {
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
  }

  private async isPortInUse(port: number, host: string = 'localhost'): Promise<boolean> {
    return isPortInUse({ port, host });
  }

  private async isAgentServerRunning(): Promise<boolean> {
    try {
      const portInUse = await this.isPortInUse(
        this.providerConfig.agentServerPort!,
        this.providerConfig.agentServerHost!
      );

      if (!portInUse) {
        this.logger.log(`Port ${this.providerConfig.agentServerPort} is not in use`);
        return false;
      }

      this.logger.log(`Port ${this.providerConfig.agentServerPort} is in use, testing server health...`);

      const isHealthy = await this.testServerHealth();
      if (isHealthy) {
        this.logger.log('Agent server is running and healthy');
        return true;
      }

      this.logger.log('Port is in use but server is not responding correctly');
      return false;
    } catch (error) {
      this.logger.warn('Error checking if agent server is running:', error);
      return false;
    }
  }

  private async testServerHealth(): Promise<boolean> {
    return new Promise((resolve) => {
      const testSocket = new WebSocket(this.agentServer.serverUrl);

      const timeout = setTimeout(() => {
        testSocket.close();
        resolve(false);
      }, 3_000);

      testSocket.on('open', () => {
        clearTimeout(timeout);
        testSocket.close();
        resolve(true);
      });

      testSocket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  async onCloseSignal(): Promise<void> {
    this.logger.log('Received close signal, initiating cleanup...');
    await this.stopAgentServer();
    await this.teardownEnvironment();
  }
}