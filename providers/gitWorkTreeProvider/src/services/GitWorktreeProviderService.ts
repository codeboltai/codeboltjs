import { exec, spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import WebSocket from 'ws';
import codebolt from '@codebolt/codeboltjs';
import {
  BaseProvider,
  AgentServerMessage,
  AgentStartMessage,
  ProviderInitVars,
  ProviderStartResult
} from '@codebolt/provider';
import {
  IProviderService,
  DiffResult,
  DiffFile,
  WorktreeInfo,
  ProviderConfig
} from '../interfaces/IProviderService';
import { FlatUserMessage } from '@codebolt/types/sdk-types';

const execAsync = promisify(exec);

export class GitWorktreeProviderService
  extends BaseProvider
  implements IProviderService {
  private worktreeInfo: WorktreeInfo = {
    path: null,
    branch: null,
    isCreated: false,
  };

  private readonly providerConfig: ProviderConfig;

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

    this.agentServer.serverUrl = this.buildAgentServerUrl();
    this.setupProcessCleanupHandlers();
  }

  async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
    console.log('[Git WorkTree Provider] Starting provider with environment:', initVars.environmentName);
    const result = await super.onProviderStart(initVars);

    return {
      ...result,
      worktreePath: this.worktreeInfo.path ?? result.workspacePath,
    };
  }

  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    console.log('[Git WorkTree Provider] Agent start requested, forwarding to agent server:', agentMessage);

    if (!this.agentServer.isConnected || !this.agentServer.wsConnection) {
      throw new Error('Agent server is not connected. Cannot forward agent start message.');
    }

    const success = await this.sendToAgentServer(agentMessage);
    if (success) {
      console.log('[Git WorkTree Provider] Agent start message successfully forwarded to agent server');
    } else {
      throw new Error('Failed to send message to agent server');
    }
  }

  async onGetDiffFiles(): Promise<DiffResult> {
    console.log('[Git WorkTree Provider] Getting diff files from worktree');

    try {
      if (!this.worktreeInfo.path || !this.worktreeInfo.isCreated) {
        throw new Error('No worktree available - provider not initialized');
      }

      const statusCommand = 'git status --porcelain';
      console.log('[Git WorkTree Provider] Getting git status:', statusCommand);

      const { stdout: statusOutput } = await execAsync(statusCommand, {
        cwd: this.worktreeInfo.path,
        timeout: this.providerConfig.timeouts?.gitOperations ?? 15_000,
      });

      const diffCommand = 'git diff HEAD';
      console.log('[Git WorkTree Provider] Getting git diff:', diffCommand);

      const { stdout: rawDiff } = await execAsync(diffCommand, {
        cwd: this.worktreeInfo.path,
        timeout: this.providerConfig.timeouts?.gitOperations ?? 15_000,
      });

      const statusLines = statusOutput.trim().split('\n').filter(line => line.trim());
      const files: DiffFile[] = [];

      for (const line of statusLines) {
        if (!line.trim()) continue;

        const status = line.substring(0, 2);
        const filename = line.substring(3);

        let fileStatus: 'added' | 'modified' | 'deleted' | 'renamed' = 'modified';
        if (status.includes('A')) fileStatus = 'added';
        else if (status.includes('D')) fileStatus = 'deleted';
        else if (status.includes('R')) fileStatus = 'renamed';

        const filePattern = new RegExp(
          `diff --git a/${filename.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')} b/${filename.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}[\\s\\S]*?(?=(?:diff --git)|$)`,
          'g'
        );
        const fileDiffMatch = rawDiff.match(filePattern);
        const fileDiff = fileDiffMatch ? fileDiffMatch[0] : '';

        const insertions = (fileDiff.match(/^[+](?![+][+])/gm) || []).length;
        const deletions = (fileDiff.match(/^-(?!--)/gm) || []).length;

        files.push({
          file: filename,
          changes: insertions + deletions,
          insertions,
          deletions,
          binary: false,
          status: fileStatus,
          diff: fileDiff,
        });
      }

      const result: DiffResult = {
        files,
        insertions: files.reduce((sum, file) => sum + file.insertions, 0),
        deletions: files.reduce((sum, file) => sum + file.deletions, 0),
        changed: files.length,
        rawDiff,
      };

      console.log('[Git WorkTree Provider] Found', result.changed, 'changed files');
      console.log('[Git WorkTree Provider] Total insertions:', result.insertions);
      console.log('[Git WorkTree Provider] Total deletions:', result.deletions);

      return result;
    } catch (error: any) {
      console.error('[Git WorkTree Provider] Error getting diff files:', error.message);
      if (error.stdout) console.error('[Git WorkTree Provider] stdout:', error.stdout);
      if (error.stderr) console.error('[Git WorkTree Provider] stderr:', error.stderr);
      throw new Error(`Failed to get diff files: ${error.message}`);
    }
  }

  onCreatePatchRequest(): void {
    throw new Error('Function not implemented.');
  }

  onCreatePullRequestRequest(): void {
    throw new Error('Function not implemented.');
  }

  async onMessage(userMessage: FlatUserMessage): Promise<void> {
    console.log('[GitWorktreeProviderService] onMessage received:', userMessage?.type ?? 'unknown');

    if (!this.agentServer.isConnected || !this.agentServer.wsConnection) {
      console.warn('[GitWorktreeProviderService] Agent server not connected, cannot forward message');
      return;
    }

    const success = await this.sendMessageToAgent(userMessage);
    if (!success) {
      console.warn('[GitWorktreeProviderService] Failed to forward message to agent server');
    }
  }

  async startAgentServer(): Promise<void> {
    console.log('[Git WorkTree Provider] Starting agent server...');

    if (this.agentServer.process && !this.agentServer.process.killed) {
      console.log('[Git WorkTree Provider] Agent server process already exists, skipping startup');
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.agentServer.process = spawn('npx', ['--yes', '@codebolt/agentserver', '--noui'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      });

      let serverStarted = false;

      this.agentServer.process.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('[Git WorkTree Provider] Agent Server:', output);
        if (!serverStarted) {
          serverStarted = true;
          resolve();
        }
      });

      this.agentServer.process.stderr?.on('data', (data) => {
        console.error('[Git WorkTree Provider] Agent Server Error:', data.toString());
      });

      this.agentServer.process.on('error', (error) => {
        console.error('[Git WorkTree Provider] Failed to start agent server:', error);
        this.agentServer.process = null;
        reject(error);
      });

      this.agentServer.process.on('exit', (code, signal) => {
        console.log(`[Git WorkTree Provider] Agent server exited with code ${code}, signal ${signal}`);
        this.agentServer.process = null;
        this.agentServer.isConnected = false;
        resolve();
      });
    });
  }

  async connectToAgentServer(worktreePath: string, environmentName: string): Promise<void> {
    if (this.agentServer.isConnected) {
      return;
    }

    console.log('[Git WorkTree Provider] Ensuring WebSocket connection to agent server...');
    await this.ensureTransportConnection({ environmentName });
  }

  async sendMessageToAgent(message: AgentServerMessage): Promise<boolean> {
    return this.sendToAgentServer(message);
  }

  async stopAgentServer(): Promise<boolean> {
    const processRef = this.agentServer.process;
    if (!processRef) {
      console.log('[Git WorkTree Provider] No agent server process to stop');
      return true;
    }

    console.log('[Git WorkTree Provider] Stopping agent server process...');

    return new Promise<boolean>((resolve) => {
      let resolved = false;

      const cleanup = (success: boolean) => {
        if (!resolved) {
          resolved = true;
          this.agentServer.process = null;
          console.log('[Git WorkTree Provider] Agent server process stopped');
          resolve(success);
        }
      };

      const handleExit = (code: number | null, signal: NodeJS.Signals | null) => {
        console.log(`[Git WorkTree Provider] Agent server exited with code ${code}, signal ${signal}`);
        cleanup(true);
      };

      processRef.on('exit', handleExit);
      processRef.on('error', (error) => {
        console.error('[Git WorkTree Provider] Agent server process error during shutdown:', error);
        cleanup(false);
      });

      try {
        console.log('[Git WorkTree Provider] Sending SIGTERM to agent server...');
        processRef.kill('SIGTERM');
      } catch (error) {
        console.warn('[Git WorkTree Provider] Error sending SIGTERM:', error);
        cleanup(false);
        return;
      }

      setTimeout(() => {
        if (!processRef.killed) {
          console.log('[Git WorkTree Provider] Graceful shutdown timeout, force killing agent server...');
          try {
            processRef.kill('SIGKILL');
          } catch (killError) {
            console.error('[Git WorkTree Provider] Error force killing process:', killError);
          }
        }
      }, 5_000);
    });
  }

  async createWorktree(projectPath: string, environmentName: string): Promise<WorktreeInfo> {
    const worktreeBaseDir = path.join(projectPath, this.providerConfig.worktreeBaseDir!);
    if (!fs.existsSync(worktreeBaseDir)) {
      console.log('[Git WorkTree Provider] Creating .worktree directory at:', worktreeBaseDir);
      fs.mkdirSync(worktreeBaseDir, { recursive: true });
    }

    const worktreePath = path.join(worktreeBaseDir, environmentName);
    console.log('[Git WorkTree Provider] Creating worktree at:', worktreePath);

    try {
      await execAsync('git rev-parse --git-dir', {
        cwd: projectPath,
        timeout: 10_000,
      });
      console.log('[Git WorkTree Provider] Valid git repository found, proceeding...');
    } catch (error: any) {
      throw new Error('Not a valid git repository. Please initialize git first.');
    }

    const worktreeBranch = environmentName;
    console.log('[Git WorkTree Provider] Creating worktree branch:', worktreeBranch);

    const command = `git worktree add -b "${worktreeBranch}" "${worktreePath}"`;
    console.log('[Git WorkTree Provider] Executing command:', command);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: projectPath,
        timeout: this.providerConfig.timeouts?.gitOperations ?? 30_000,
      });

      console.log('[Git WorkTree Provider] Worktree created successfully at:', worktreePath);
      if (stdout) console.log('[Git WorkTree Provider] Command output:', stdout.trim());
      if (stderr) console.log('[Git WorkTree Provider] Command stderr:', stderr.trim());

      this.worktreeInfo = {
        path: worktreePath,
        branch: worktreeBranch,
        isCreated: true,
      };

      return this.worktreeInfo;
    } catch (error: any) {
      console.error('[Git WorkTree Provider] Failed to create worktree:', error.message);
      if (error.stdout) console.error('[Git WorkTree Provider] stdout:', error.stdout);
      if (error.stderr) console.error('[Git WorkTree Provider] stderr:', error.stderr);
      throw new Error(`Git worktree creation failed: ${error.message}`);
    }
  }

  async removeWorktree(projectPath: string): Promise<boolean> {
    if (!this.worktreeInfo.path || !this.worktreeInfo.isCreated) {
      console.log('[Git WorkTree Provider] No worktree to clean up');
      return true;
    }

    console.log('[Git WorkTree Provider] Removing worktree at:', this.worktreeInfo.path);

    const performRemoval = async (force: boolean): Promise<void> => {
      const removeCommand = force
        ? `git worktree remove --force "${this.worktreeInfo.path}"`
        : `git worktree remove "${this.worktreeInfo.path}"`;

      const { stdout, stderr } = await execAsync(removeCommand, {
        cwd: projectPath,
        timeout: this.providerConfig.timeouts?.cleanup ?? 15_000,
      });

      console.log('[Git WorkTree Provider] Worktree removed:', this.worktreeInfo.path);
      if (stdout) console.log('[Git WorkTree Provider] Remove output:', stdout.trim());
      if (stderr) console.log('[Git WorkTree Provider] Remove stderr:', stderr.trim());
    };

    try {
      await performRemoval(false);
    } catch (error: any) {
      console.warn('[Git WorkTree Provider] Failed to remove worktree, retrying with force:', error.message);
      await performRemoval(true);
    }

    if (this.worktreeInfo.branch) {
      try {
        console.log('[Git WorkTree Provider] Deleting worktree branch:', this.worktreeInfo.branch);
        const deleteBranchCommand = `git branch -D "${this.worktreeInfo.branch}"`;
        const { stdout: branchStdout, stderr: branchStderr } = await execAsync(deleteBranchCommand, {
          cwd: projectPath,
          timeout: 10_000,
        });

        console.log('[Git WorkTree Provider] Successfully deleted branch:', this.worktreeInfo.branch);
        if (branchStdout) console.log('[Git WorkTree Provider] Branch delete output:', branchStdout.trim());
        if (branchStderr) console.log('[Git WorkTree Provider] Branch delete stderr:', branchStderr.trim());
      } catch (branchError: any) {
        console.warn('[Git WorkTree Provider] Failed to delete branch:', this.worktreeInfo.branch, branchError.message);
      }
    }

    this.worktreeInfo = {
      path: null,
      branch: null,
      isCreated: false,
    };

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
      console.log('[Git WorkTree Provider] Agent server already running, skipping startup');
      return;
    }

    await this.startAgentServer();
    await new Promise(resolve => setTimeout(resolve, 10_000));
  }

  protected async beforeClose(): Promise<void> {
    console.log('[Git WorkTree Provider] Received close signal, initiating cleanup...');
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

  protected handleTransportMessage(message: AgentServerMessage): void {
    if (message?.type) {
      console.log('[Git WorkTree Provider] WebSocket message received:', message.type);
    }

    switch (message.type) {
      case 'agentStartResponse':
        console.log('[Git WorkTree Provider] Agent start response:', message.data?.status ?? 'unknown');
        if (message.data?.error) {
          console.error('[Git WorkTree Provider] Agent start error:', message.data.error);
        }
        break;
      case 'agentMessage':
        console.log('[Git WorkTree Provider] Agent message:', message.data?.message ?? 'no message');
        break;
      case 'notification':
        console.log('[Git WorkTree Provider] Agent notification:', message.action, message.data);
        break;
      case 'error':
        console.error('[Git WorkTree Provider] Agent server error:', message.message ?? 'unknown error');
        break;
      default:
        console.log('[Git WorkTree Provider] Unhandled message type:', message.type);
    }

    super.handleTransportMessage(message);
  }

  private async isPortInUse(port: number, host: string = 'localhost'): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(port, host, () => {
        server.once('close', () => {
          resolve(false);
        });
        server.close();
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  private async isAgentServerRunning(): Promise<boolean> {
    try {
      const portInUse = await this.isPortInUse(
        this.providerConfig.agentServerPort!,
        this.providerConfig.agentServerHost!
      );

      if (!portInUse) {
        console.log(`[Git WorkTree Provider] Port ${this.providerConfig.agentServerPort} is not in use`);
        return false;
      }

      console.log(`[Git WorkTree Provider] Port ${this.providerConfig.agentServerPort} is in use, testing server health...`);

      const isHealthy = await this.testServerHealth();
      if (isHealthy) {
        console.log('[Git WorkTree Provider] Agent server is running and healthy');
        return true;
      }

      console.log('[Git WorkTree Provider] Port is in use but server is not responding correctly');
      return false;
    } catch (error) {
      console.warn('[Git WorkTree Provider] Error checking if agent server is running:', error);
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
      console.log(`[Git WorkTree Provider] Received ${signal}, initiating cleanup...`);
      try {
        await this.onCloseSignal();
      } catch (error) {
        console.error('[Git WorkTree Provider] Error during signal cleanup:', error);
      }
      process.exit(0);
    };

    process.on('SIGINT', () => cleanup('SIGINT'));
    process.on('SIGTERM', () => cleanup('SIGTERM'));

    process.on('uncaughtException', async (error) => {
      console.error('[Git WorkTree Provider] Uncaught exception:', error);
      try {
        await this.onCloseSignal();
      } catch (cleanupError) {
        console.error('[Git WorkTree Provider] Error during exception cleanup:', cleanupError);
      }
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('[Git WorkTree Provider] Unhandled rejection at:', promise, 'reason:', reason);
      try {
        await this.onCloseSignal();
      } catch (cleanupError) {
        console.error('[Git WorkTree Provider] Error during rejection cleanup:', cleanupError);
      }
      process.exit(1);
    });
  }
}
