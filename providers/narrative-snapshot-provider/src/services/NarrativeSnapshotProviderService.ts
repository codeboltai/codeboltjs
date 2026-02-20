import type { ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as net from 'net';
import type { ProviderInitVars, AgentStartMessage, RawMessageForAgent } from '@codebolt/types/provider';
import {
  BaseProvider,
  ProviderStartResult,
} from '@codebolt/provider';
import { NarrativeClient } from '@codebolt/narrative';
import { createPrefixedLogger, type Logger } from '../utils/logger';
import {
  startAgentServer as startAgentServerUtil,
  stopAgentServer as stopAgentServerUtil,
  isPortInUse,
} from '../utils/agentServer';

interface ProviderConfig {
  agentServerPort?: number;
  agentServerHost?: string;
  timeouts?: {
    agentServerStartup?: number;
    wsConnection?: number;
    cleanup?: number;
  };
}

export class NarrativeSnapshotProviderService extends BaseProvider {
  private narrativeClient: NarrativeClient | null = null;
  private importedSnapshotId: string | null = null;
  private serverSnapshotId: string | null = null;
  private baseProjectPath: string | null = null;
  private isStartupCheck = false;

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
      timeouts: {
        agentServerStartup: config.timeouts?.agentServerStartup ?? 60_000,
        wsConnection: config.timeouts?.wsConnection ?? 30_000,
        cleanup: config.timeouts?.cleanup ?? 15_000,
      },
    };

    this.logger = createPrefixedLogger('[Narrative Snapshot Provider]');
  }

  async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
    this.logger.log('Starting provider with environment:', initVars.environmentName);

    const projectPath = initVars.projectPath as string | undefined;
    if (!projectPath) {
      throw new Error('Project path is not available in initVars');
    }
    this.baseProjectPath = projectPath;

    this.isStartupCheck = true;
    try {
      const result = await super.onProviderStart(initVars);
      this.logger.log('Started environment with workspace:', result.workspacePath);

      // Start heartbeat monitoring after successful provider start
      this.startHeartbeat();

      // Register this environment as connected
      if (initVars.environmentName) {
        this.registerConnectedEnvironment(initVars.environmentName);
        this.startEnvironmentHeartbeat(initVars.environmentName);
      }

      return result;
    } finally {
      this.isStartupCheck = false;
    }
  }

  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    this.logger.log('Agent start requested, forwarding to agent server');
    this.isStartupCheck = true;
    try {
      await this.ensureAgentServer();

      // Ensure transport is connected
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

      // Shutdown narrative engine
      if (this.narrativeClient) {
        try {
          await this.narrativeClient.shutdown();
        } catch (error) {
          this.logger.error('Error shutting down narrative client:', error);
        }
        this.narrativeClient = null;
      }

      await this.disconnectTransport();
      this.resetState();

      this.logger.log('Provider stopped successfully');
    } catch (error) {
      this.logger.error('Error stopping provider:', error);
      throw error;
    }
  }

  async onGetDiffFiles(): Promise<{ files: any[]; summary?: any }> {
    // Narrative snapshot provider doesn't track diffs the same way as git worktree.
    // Return empty diff.
    return {
      files: [],
      summary: {
        totalFiles: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        totalChanges: 0,
      },
    };
  }

  // --- File operation handlers ---

  private normalizeRelativePath(inputPath: string): string {
    if (!this.state.workspacePath) {
      return inputPath;
    }

    if (inputPath.startsWith(this.state.workspacePath)) {
      const relativePath = inputPath.slice(this.state.workspacePath.length);
      return relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    }

    return inputPath;
  }

  async onReadFile(filePath: string): Promise<string> {
    this.logger.log('Reading file:', filePath);
    try {
      if (!this.state.workspacePath) {
        throw new Error('No workspace available');
      }
      const normalizedPath = this.normalizeRelativePath(filePath);
      const fullPath = path.join(this.state.workspacePath, normalizedPath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error: any) {
      this.logger.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async onWriteFile(filePath: string, content: string): Promise<void> {
    this.logger.log('Writing file:', filePath);
    try {
      if (!this.state.workspacePath) {
        throw new Error('No workspace available');
      }
      const normalizedPath = this.normalizeRelativePath(filePath);
      const fullPath = path.join(this.state.workspacePath, normalizedPath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error: any) {
      this.logger.error('Error writing file:', error);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  async onGetProject(parentId: string = 'root'): Promise<any[]> {
    this.logger.log('Getting project structure for parentId:', parentId);
    try {
      if (!this.state.workspacePath) {
        throw new Error('No workspace available');
      }

      const parentPath = parentId === 'root'
        ? this.state.workspacePath
        : path.join(this.state.workspacePath, parentId);

      const parentStats = await fs.stat(parentPath);
      if (!parentStats.isDirectory()) {
        return [];
      }

      const items = await fs.readdir(parentPath, { withFileTypes: true });

      const children = await Promise.all(
        items
          .filter(item => {
            if (!item.isDirectory() && item.name !== '.DS_Store') return true;
            return !item.name.startsWith('.') || item.name === '.codeboltAgents' || item.name === '.codebolt';
          })
          .map(async (item) => {
            const itemPath = path.join(parentPath, item.name);
            const relativePath = parentId === 'root'
              ? item.name
              : path.join(parentId, item.name);

            const stats = await fs.stat(itemPath);

            return {
              id: relativePath,
              name: item.name,
              path: itemPath,
              isFolder: item.isDirectory(),
              size: item.isDirectory() ? 0 : stats.size,
              lastModified: stats.mtime.toISOString(),
            };
          }),
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
    this.logger.log('Merge as patch not supported for narrative snapshot provider');
    return '';
  }

  async onSendPR(): Promise<any> {
    this.logger.log('Creating snapshot and exporting bundle...');

    if (!this.narrativeClient) {
      throw new Error('Narrative client is not initialized');
    }

    // Step 1: Create a snapshot of the current workspace
    const { objective_id } = await this.narrativeClient.narrative.createObjective({
      description: 'Send PR snapshot',
    });
    const { thread_id } = await this.narrativeClient.narrative.createThread({
      objective_id,
      name: 'send-pr',
    });
    const { agent_run_id } = await this.narrativeClient.narrative.createAgentRun({
      thread_id,
      agent_name: 'send-pr',
    });

    const snapshotResult = await this.narrativeClient.snapshot.createSnapshot({
      agent_run_id,
      description: 'send-pr-snapshot',
    });

    this.logger.log('Created snapshot:', snapshotResult.snapshot_id);

    // Step 2: Export the snapshot as a git bundle
    const bundleResult = await this.narrativeClient.snapshot.exportSnapshotBundle({
      snapshot_id: snapshotResult.snapshot_id,
      incremental: false,
    });

    this.logger.log('Exported bundle:', bundleResult.bundle_path);

    // Echo back the server-side snapshot ID as the diff base.
    // This ID originates from the server's local narrative DB, so it
    // is guaranteed to exist there when computing the diff.
    return {
      snapshot: snapshotResult,
      bundle: bundleResult,
      baseSnapshotId: this.serverSnapshotId,
    };
  }

  // --- BaseProvider abstract method implementations ---

  protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
    if (!this.baseProjectPath) {
      throw new Error('Base project path is not available');
    }

    // Create workspace under .codebolt/remote-envs/{environmentName}/
    const workspacePath = path.join(
      this.baseProjectPath,
      '.codebolt',
      'remote-envs',
      initVars.environmentName,
    );

    this.state.projectPath = workspacePath;
  }

  protected async resolveWorkspacePath(_initVars: ProviderInitVars): Promise<string> {
    if (!this.state.projectPath) {
      throw new Error('Project path is undefined in provider state');
    }
    return this.state.projectPath;
  }

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    if (!this.state.projectPath) {
      this.logger.error('Project path is not available');
      throw new Error('Project path is not available');
    }

    // Create workspace directory
    await fs.mkdir(this.state.projectPath, { recursive: true });
    this.state.workspacePath = this.state.projectPath;

    this.logger.log('Created workspace directory:', this.state.projectPath);

    // Get environment ID from process env or initVars
    const environmentId = (process.env.environmentId as string) || initVars.environmentName;

    // Start NarrativeClient in remote mode
    this.narrativeClient = new NarrativeClient({
      environmentId,
      workspace: this.state.projectPath,
      remote: true,
    });

    await this.narrativeClient.start();
    this.logger.log('Narrative engine started in remote mode for environment:', environmentId);

    // Import snapshot archive if provided
    const archivePath = initVars.archivePath as string | undefined;
    // Store the server-side snapshot ID so we can echo it back in onSendPR
    this.serverSnapshotId = (initVars as any).snapshotId || null;
    if (archivePath) {
      this.logger.log('Importing snapshot archive:', archivePath);

      const importResult = await this.narrativeClient.snapshot.importSnapshotArchive({
        archive_path: archivePath,
        thread_id: 'provider-init',
        remote_environment_id: environmentId,
      });

      this.importedSnapshotId = importResult.snapshot_id;
      this.logger.log('Imported snapshot:', importResult.snapshot_id, 'tree_hash:', importResult.tree_hash);
      this.logger.log('Server snapshot ID (for diff base):', this.serverSnapshotId);
    } else {
      this.logger.warn('No archivePath provided in initVars, workspace will be empty');
    }
  }

  protected async teardownEnvironment(): Promise<void> {
    if (this.narrativeClient) {
      try {
        await this.narrativeClient.shutdown();
        this.logger.log('Narrative engine shut down');
      } catch (error) {
        this.logger.error('Error shutting down narrative engine:', error);
      }
      this.narrativeClient = null;
    }
  }

  protected async ensureAgentServer(): Promise<void> {
    try {
      const portInUse = await isPortInUse({
        port: this.providerConfig.agentServerPort ?? 3001,
        host: this.providerConfig.agentServerHost ?? 'localhost',
      });

      if (portInUse) {
        this.logger.log('Agent server already running, skipping startup');
        return;
      }

      await this.startAgentServer();
    } catch (error: any) {
      this.logger.error('Error ensuring agent server:', error);
      throw new Error(`Failed to ensure agent server: ${error.message}`);
    }
  }

  protected async beforeClose(): Promise<void> {
    try {
      this.logger.log('Received close signal, initiating cleanup...');
      await this.stopAgentServer();
    } catch (error) {
      this.logger.error('Error during beforeClose cleanup:', error);
    }
  }

  protected buildWebSocketUrl(initVars: ProviderInitVars): string {
    const query = new URLSearchParams({
      clientType: 'app',
      appId: `narrative-snapshot-${initVars.environmentName}`,
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
          break;
        case 'agentMessage':
          this.logger.log('Agent message:', message.data ?? 'no message');
          break;
        case 'notification':
          this.logger.log('Agent notification:', message.action, message.data);
          break;
        case 'error':
          this.logger.error('Agent server error:', (message as any).message ?? 'unknown error');
          break;
        default:
          this.logger.log('Unhandled message type:', message.type);
      }

      super.handleTransportMessage(message);
    } catch (error) {
      this.logger.error('Error handling transport message:', error);
    }
  }

  // --- Agent server management ---

  private async startAgentServer(): Promise<void> {
    this.logger.log('Starting agent server...');

    try {
      if (this.agentServer.process && !(this.agentServer.process as ChildProcess).killed) {
        this.logger.log('Agent server process already exists, skipping startup');
        return;
      }

      const preferredPort = this.providerConfig.agentServerPort!;
      const availablePort = await this.findAvailablePort(preferredPort);

      if (availablePort !== preferredPort) {
        this.logger.log(`Using port ${availablePort} instead of configured port ${preferredPort}`);
        this.providerConfig.agentServerPort = availablePort;
      }

      this.agentServer.process = await startAgentServerUtil({
        logger: this.logger,
        port: availablePort,
        projectPath: this.state.projectPath ?? undefined,
      });

      (this.agentServer.process as ChildProcess).on('exit', (code, signal) => {
        this.logger.warn(`Agent server process exited with code ${code} and signal ${signal}`);
        this.agentServer.process = null;
        this.agentServer.isConnected = false;
      });
    } catch (error: any) {
      this.logger.error('Error starting agent server:', error);
      throw new Error(`Failed to start agent server: ${error.message}`);
    }
  }

  private async stopAgentServer(): Promise<boolean> {
    try {
      const result = await stopAgentServerUtil({
        logger: this.logger,
        processRef: this.agentServer.process as ChildProcess | null,
      });

      this.agentServer.process = null;
      return result;
    } catch (error: any) {
      this.logger.error('Error stopping agent server:', error);
      return false;
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

  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port, '127.0.0.1');
    });
  }

  async onCloseSignal(): Promise<void> {
    try {
      this.logger.log('Received close signal, initiating cleanup...');
      await this.stopAgentServer();
      await this.teardownEnvironment();
    } catch (error) {
      this.logger.error('Error during onCloseSignal cleanup:', error);
    }
  }
}
