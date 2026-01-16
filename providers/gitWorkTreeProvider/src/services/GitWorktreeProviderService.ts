import type { ChildProcess } from 'child_process';
import * as path from 'path';
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
import { createWorktree as createWorktreeUtil, removeWorktree as removeWorktreeUtil } from '../utils/gitWorktree';
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
    this.agentServer.serverUrl = this.buildAgentServerUrl();
    this.setupProcessCleanupHandlers();
  }

  async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
    this.logger.log('Starting provider with environment:', initVars.environmentName);
    const result = await super.onProviderStart(initVars);

    // Start heartbeat monitoring after successful provider start
    this.startHeartbeat();

    // Register this environment as connected
    if (initVars.environmentName) {
      this.registerConnectedEnvironment(initVars.environmentName);
      this.startEnvironmentHeartbeat(initVars.environmentName);
    }

    return {
      ...result,
      worktreePath: this.worktreeInfo.path ?? result.workspacePath,
    };
  }

  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    this.logger.log('Agent start requested, forwarding to agent server:', agentMessage);

    if (!this.agentServer.isConnected || !this.agentServer.wsConnection) {
      throw new Error('Agent server is not connected. Cannot forward agent start message.');
    }

    const success = await this.sendToAgentServer(agentMessage);
    if (success) {
      this.logger.log('Agent start message successfully forwarded to agent server');
    } else {
      throw new Error('Failed to send message to agent server');
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

  onCreatePatchRequest(): void {
    throw new Error('Function not implemented.');
  }

  onCreatePullRequestRequest(): void {
    throw new Error('Function not implemented.');
  }

  async onUserMessage(userMessage: RawMessageForAgent): Promise<void> {
    this.logger.log('onUserMessage received:', userMessage?.messageId ?? 'unknown');

    if (!this.agentServer.isConnected || !this.agentServer.wsConnection) {
      this.logger.warn('Agent server not connected, cannot forward message');
      return;
    }
    const success = await this.sendMessageToAgent(userMessage);
    if (!success) {
      this.logger.warn('Failed to forward message to agent server');
    }
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

  protected async resolveProjectContext(): Promise<void> {
    const { projectPath } = await codebolt.project.getProjectPath();
    if (!projectPath) {
      throw new Error('Project path is not available');
    }

    this.state.projectPath = projectPath;
  }

  protected async resolveWorkspacePath(initVars: ProviderInitVars): Promise<string> {
    if (!this.state.projectPath) {
      throw new Error('Project path is undefined in provider state');
    }

    return path.join(this.state.projectPath, this.providerConfig.worktreeBaseDir!, initVars.environmentName);
  }

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    if (!this.state.projectPath) {
      throw new Error('Project path is not available');
    }

    const worktreeInfo = await this.createWorktree(this.state.projectPath, initVars.environmentName);
    this.worktreeInfo = worktreeInfo;
    this.state.workspacePath = worktreeInfo.path;
  }

  protected async teardownEnvironment(): Promise<void> {
    if (!this.state.projectPath) {
      return;
    }

    await this.removeWorktree(this.state.projectPath);
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
    // Stop heartbeat monitoring
    this.stopHeartbeat();
    await this.stopAgentServer();
  }

  protected buildWebSocketUrl(initVars: ProviderInitVars): string {
    const query = new URLSearchParams({
      clientType: 'app',
      appId: `git-worktree-${initVars.environmentName}`,
      projectName: initVars.environmentName,
    });

    if (this.worktreeInfo.path) {
      query.set('currentProject', this.worktreeInfo.path);
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

  private setupProcessCleanupHandlers(): void {
    const cleanup = async (signal: string) => {
      this.logger.log(`Received ${signal}, initiating cleanup...`);
      try {
        await this.onCloseSignal();
      } catch (error) {
        this.logger.error('Error during signal cleanup:', error);
      }
      process.exit(0);
    };

    process.on('SIGINT', () => cleanup('SIGINT'));
    process.on('SIGTERM', () => cleanup('SIGTERM'));

    process.on('uncaughtException', async (error) => {
      this.logger.error('Uncaught exception:', error);
      try {
        await this.onCloseSignal();
      } catch (cleanupError) {
        this.logger.error('Error during exception cleanup:', cleanupError);
      }
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      this.logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      try {
        await this.onCloseSignal();
      } catch (cleanupError) {
        this.logger.error('Error during rejection cleanup:', cleanupError);
      }
      process.exit(1);
    });
  }
}
