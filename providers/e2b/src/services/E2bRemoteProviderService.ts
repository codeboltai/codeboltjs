import * as path from 'path';
import * as fs from 'fs/promises';
import type { ProviderInitVars, AgentStartMessage, RawMessageForAgent } from '@codebolt/types/provider';
import {
  BaseProvider,
  ProviderStartResult,
} from '@codebolt/provider';
import WebSocket from 'ws';
import { createPrefixedLogger, type Logger } from '../utils/logger';

// The e2b SDK requires chalk@5 (ESM-only) which breaks in Electron's CJS runtime.
// We intercept Module._resolveFilename to provide a CJS-compatible chalk stub
// before loading the SDK. Chalk is only used for log coloring in e2b.
const Module = require('module');
const _origResolveFilename = Module._resolveFilename;
function installChalkShim(): void {
  Module._resolveFilename = function (request: string, parent: any, ...args: any[]) {
    if (request === 'chalk' && parent?.filename?.includes('e2b')) {
      // Provide a no-op chalk stub that passes strings through
      const stubPath = '__e2b_chalk_stub__';
      if (!require.cache[stubPath]) {
        const identity = (s: string) => s;
        const chalkStub: any = identity;
        chalkStub.red = identity;
        chalkStub.gray = identity;
        chalkStub.dim = identity;
        chalkStub.hex = () => identity;
        chalkStub.default = chalkStub;
        const stubModule: any = new Module(stubPath);
        stubModule.exports = chalkStub;
        stubModule.loaded = true;
        require.cache[stubPath] = stubModule;
      }
      return stubPath;
    }
    return _origResolveFilename.apply(this, [request, parent, ...args]);
  };
}
function removeChalkShim(): void {
  Module._resolveFilename = _origResolveFilename;
}

let _SandboxClass: any = null;
async function getE2bSandbox(): Promise<any> {
  if (!_SandboxClass) {
    installChalkShim();
    try {
      const mod = require('@e2b/code-interpreter');
      _SandboxClass = mod.Sandbox;
    } finally {
      removeChalkShim();
    }
  }
  return _SandboxClass;
}

interface E2bProviderConfig {
  agentServerPort?: number;
  agentServerHost?: string;
  e2bApiKey?: string;
  sandboxTemplate?: string;
  autoStopInterval?: number;
  /** Path to a local agent server bundle (server.mjs) to upload to the sandbox.
   *  When set, the file is uploaded directly instead of running `npm install @codebolt/agentserver@11.0.5`.
   *  Useful for development/testing with a custom build. */
  localAgentServerPath?: string;
  timeouts?: {
    agentServerStartup?: number;
    wsConnection?: number;
    cleanup?: number;
  };
}

export class E2bRemoteProviderService extends BaseProvider {
  private sandbox: any = null;
  private sandboxId: string | null = null;
  private baseProjectPath: string | null = null;
  private sandboxWorkspacePath: string = '/home/user';
  private isStartupCheck = false;
  private setupInProgress = false;
  private backgroundCommand: any = null;
  private pendingMessages: any[] = [];

  private readonly providerConfig: E2bProviderConfig;
  private readonly logger: Logger;

  constructor(config: E2bProviderConfig = {}) {
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
      e2bApiKey: "e2b_f2901dc6085be9d5754d792ab344f85bf28e46f8",// config.e2bApiKey ?? process.env.E2B_API_KEY,
      sandboxTemplate: config.sandboxTemplate,
      autoStopInterval: config.autoStopInterval ?? 0,
      timeouts: {
        agentServerStartup: config.timeouts?.agentServerStartup ?? 60_000,
        wsConnection: config.timeouts?.wsConnection ?? 30_000,
        cleanup: config.timeouts?.cleanup ?? 15_000,
      },
    };

    this.logger = createPrefixedLogger('[E2B Remote Provider]');
  }

  // --- Path helpers ---

  private resolveSandboxPath(inputPath: string): string {
    if (path.isAbsolute(inputPath)) {
      return inputPath;
    }

    if (this.state.workspacePath && inputPath.startsWith(this.state.workspacePath)) {
      const relativePath = inputPath.slice(this.state.workspacePath.length);
      return path.join(this.sandboxWorkspacePath, relativePath.startsWith('/') ? relativePath.slice(1) : relativePath);
    }

    return path.join(this.sandboxWorkspacePath, inputPath);
  }

  // --- Lifecycle overrides ---

  async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
    this.logger.log('Starting provider with environment:', initVars.environmentName);

    const projectPath = initVars.projectPath as string | undefined;
    if (!projectPath) {
      throw new Error('Project path is not available in initVars');
    }
    this.baseProjectPath = projectPath;

    // Allow runtime override of E2B config from initVars
    if (initVars.e2bApiKey) {
      this.providerConfig.e2bApiKey = initVars.e2bApiKey as string;
    }
    if (initVars.sandboxTemplate) {
      this.providerConfig.sandboxTemplate = initVars.sandboxTemplate as string;
    }

    // Custom startup order: sandbox first, then agent server, then transport.
    this.resetState();
    this.state.environmentName = initVars.environmentName;

    await this.resolveProjectContext(initVars);
    this.state.workspacePath = await this.resolveWorkspacePath(initVars);

    // 1. Create sandbox and copy code
    await this.setupEnvironment(initVars);

    // 2. Start agent server inside the sandbox
    await this.ensureAgentServer();

    // 3. Connect WebSocket transport to sandbox agent server
    await this.ensureTransportConnection(initVars);

    this.state.initialized = true;

    const startResult: ProviderStartResult = {
      success: true,
      environmentName: initVars.environmentName,
      agentServerUrl: this.agentServer.serverUrl,
      workspacePath: this.state.workspacePath!,
      transport: this.config.transport,
    };

    await this.afterConnected(startResult);

    // Flush any messages that arrived while the agent server was being set up
    await this.flushPendingMessages();

    this.logger.log('Started environment with workspace:', startResult.workspacePath);

    this.startHeartbeat();

    if (initVars.environmentName) {
      this.registerConnectedEnvironment(initVars.environmentName);
      this.startEnvironmentHeartbeat(initVars.environmentName);
    }

    return startResult;
  }

  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    this.logger.log('Agent start requested, forwarding to agent server');
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

      // Forward narrative context to sandbox NarrativeService so exports
      // are attributed to the parent server's agent run (avoids fallback hierarchy)
      const narrativeContext = (agentMessage as any).narrativeContext;
      if (narrativeContext?.objective_id && narrativeContext?.narrative_thread_id && narrativeContext?.agent_run_id) {
        this.logger.log('Sending narrative context to sandbox agent server');
        await this.sendToAgentServer({
          type: 'setNarrativeContext',
          narrativeContext,
        } as any);
      }

      await super.onProviderAgentStart(agentMessage);
    } finally {
      this.isStartupCheck = false;
    }
  }

  async onRawMessage(message: any): Promise<void> {
    if (!this.agentServer.isConnected || !this.agentServer.wsConnection) {
      this.logger.warn('Agent server not connected yet, queuing message:', message?.type);
      this.pendingMessages.push(message);
      return;
    }
    if (message?.type === 'providerSendPR') {
      this.logger.log('Handling providerSendPR locally');
      try {
        const result = await this.onSendPR();
        this.handleTransportMessage({
          type: 'remoteProviderEvent',
          action: 'providerSendPRResponse',
          message: result,
        } as any);
      } catch (error: any) {
        this.logger.error('Error handling sendPR:', error);
        this.handleTransportMessage({
          type: 'remoteProviderEvent',
          action: 'providerSendPRResponse',
          error: error instanceof Error ? error.message : 'Unknown error',
        } as any);
      }
      return;
    }
    if (message?.type === 'providerHeartbeatResponse' || message?.type === 'providerHeartbeatAck') {
      return;
    }
    await super.onRawMessage(message);
  }

  private async flushPendingMessages(): Promise<void> {
    if (this.pendingMessages.length === 0) return;
    this.logger.log('Flushing', this.pendingMessages.length, 'pending messages to agent server');
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];
    for (const msg of messages) {
      try {
        if (msg?.type === 'providerSendPR') {
          try {
            const result = await this.onSendPR();
            this.handleTransportMessage({
              type: 'remoteProviderEvent',
              action: 'providerSendPRResponse',
              message: result,
            } as any);
          } catch (sendPRError: any) {
            this.logger.error('Error handling queued sendPR:', sendPRError);
            this.handleTransportMessage({
              type: 'remoteProviderEvent',
              action: 'providerSendPRResponse',
              error: sendPRError instanceof Error ? sendPRError.message : 'Unknown error',
            } as any);
          }
        } else if (msg?.type !== 'providerHeartbeatResponse' && msg?.type !== 'providerHeartbeatAck') {
          await super.onRawMessage(msg);
        }
      } catch (error) {
        this.logger.error('Error flushing pending message:', error);
      }
    }
  }

  async onProviderStop(initVars: ProviderInitVars): Promise<void> {
    this.logger.log('Provider stop requested for environment:', initVars.environmentName);

    try {
      this.stopHeartbeat();
      this.stopWsPing();
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      if (initVars.environmentName) {
        this.unregisterConnectedEnvironment(initVars.environmentName);
      }

      await this.stopAgentServer();

      // Teardown E2B sandbox
      if (this.sandbox) {
        try {
          await this.sandbox.kill();
          this.logger.log('E2B sandbox killed');
        } catch (error) {
          this.logger.error('Error killing E2B sandbox:', error);
        }
        this.sandbox = null;
        this.sandboxId = null;
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
    // Diff tracking is handled via narrative snapshots, not git.
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

  async onReadFile(filePath: string): Promise<string> {
    this.logger.log('Reading file:', filePath);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }
      const sandboxPath = this.resolveSandboxPath(filePath);
      const content = await this.sandbox.files.read(sandboxPath);
      return content;
    } catch (error: any) {
      this.logger.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async onWriteFile(filePath: string, content: string): Promise<void> {
    this.logger.log('Writing file:', filePath);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }
      const sandboxPath = this.resolveSandboxPath(filePath);
      // Ensure parent directory exists
      const parentDir = path.dirname(sandboxPath);
      try {
        await this.sandbox.commands.run(`mkdir -p "${parentDir}"`);
      } catch {
        // Parent directory may already exist
      }
      await this.sandbox.files.write(sandboxPath, content);
    } catch (error: any) {
      this.logger.error('Error writing file:', error);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  async onDeleteFile(filePath: string): Promise<void> {
    this.logger.log('Deleting file:', filePath);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }
      const sandboxPath = this.resolveSandboxPath(filePath);
      await this.sandbox.commands.run(`rm -f "${sandboxPath}"`);
    } catch (error: any) {
      this.logger.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async onDeleteFolder(folderPath: string): Promise<void> {
    this.logger.log('Deleting folder:', folderPath);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }
      const sandboxPath = this.resolveSandboxPath(folderPath);
      await this.sandbox.commands.run(`rm -rf "${sandboxPath}"`);
    } catch (error: any) {
      this.logger.error('Error deleting folder:', error);
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }

  async onRenameItem(oldPath: string, newPath: string): Promise<void> {
    this.logger.log('Renaming item:', oldPath, '->', newPath);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }
      const sandboxOldPath = this.resolveSandboxPath(oldPath);
      const sandboxNewPath = this.resolveSandboxPath(newPath);
      await this.sandbox.commands.run(`mv "${sandboxOldPath}" "${sandboxNewPath}"`);
    } catch (error: any) {
      this.logger.error('Error renaming item:', error);
      throw new Error(`Failed to rename item: ${error.message}`);
    }
  }

  async onCreateFolder(folderPath: string): Promise<void> {
    this.logger.log('Creating folder:', folderPath);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }
      const sandboxPath = this.resolveSandboxPath(folderPath);
      await this.sandbox.commands.run(`mkdir -p "${sandboxPath}"`);
    } catch (error: any) {
      this.logger.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  async onCopyFile(sourcePath: string, destinationPath: string): Promise<void> {
    this.logger.log('Copying file:', sourcePath, '->', destinationPath);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }
      const sandboxSrc = this.resolveSandboxPath(sourcePath);
      const sandboxDst = this.resolveSandboxPath(destinationPath);
      await this.sandbox.commands.run(`cp "${sandboxSrc}" "${sandboxDst}"`);
    } catch (error: any) {
      this.logger.error('Error copying file:', error);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  async onCopyFolder(sourcePath: string, destinationPath: string): Promise<void> {
    this.logger.log('Copying folder:', sourcePath, '->', destinationPath);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }
      const sandboxSrc = this.resolveSandboxPath(sourcePath);
      const sandboxDst = this.resolveSandboxPath(destinationPath);
      await this.sandbox.commands.run(`cp -r "${sandboxSrc}" "${sandboxDst}"`);
    } catch (error: any) {
      this.logger.error('Error copying folder:', error);
      throw new Error(`Failed to copy folder: ${error.message}`);
    }
  }

  async onGetProject(parentId: string = 'root'): Promise<any[]> {
    this.logger.log('Getting project structure for parentId:', parentId);
    try {
      if (!this.sandbox) {
        throw new Error('No sandbox available');
      }

      const targetPath = parentId === 'root'
        ? this.sandboxWorkspacePath
        : this.resolveSandboxPath(parentId);

      const items = await this.sandbox.files.list(targetPath);

      const children = items
        .filter((item: any) => {
          const name = item.name || path.basename(item.path || '');
          if (name === '.DS_Store') return false;
          if (item.type === 'dir' && name.startsWith('.') && name !== '.codeboltAgents' && name !== '.codebolt') return false;
          return true;
        })
        .map((item: any) => {
          const name = item.name || path.basename(item.path || '');
          const relativePath = parentId === 'root'
            ? name
            : path.join(parentId, name);

          return {
            id: relativePath,
            name,
            path: item.path || path.join(targetPath, name),
            isFolder: item.type === 'dir',
            size: item.size ?? 0,
            lastModified: item.modifiedTime || new Date().toISOString(),
          };
        });

      children.sort((a: any, b: any) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });

      return children;
    } catch (error: any) {
      this.logger.error('Error getting project structure:', error);
      throw new Error(`Failed to get project structure: ${error.message}`);
    }
  }

  async onGetFullProject(): Promise<any[]> {
    return this.onGetProject('root');
  }

  async onMergeAsPatch(): Promise<string> {
    this.logger.log('Merge as patch not supported for e2b provider');
    return '';
  }

  async onSendPR(): Promise<any> {
    this.logger.log('onSendPR started — delegating snapshot export to remote agent server');

    // If an export is already in-flight, reuse its promise to avoid
    // overwriting _pendingExportResolve and leaving the first caller hanging.
    if (this._pendingExportPromise) {
      this.logger.log('Export already in-flight, reusing existing request');
      return this._pendingExportPromise;
    }

    if (!this.sandbox) {
      throw new Error('No sandbox available');
    }

    // Send snapshotExportRequest to the agent server running in the sandbox.
    // The agent server's NarrativeService will handle snapshot creation and bundle export.
    const environmentId = this.state.environmentName || 'unknown';
    const exportRequest = {
      type: 'snapshotExportRequest',
      id: `export-${Date.now()}`,
      environmentId,
    };

    this.logger.log('Sending snapshotExportRequest to agent server for environment:', environmentId);

    // Wait for the snapshotBundleExport response from the agent server
    this._pendingExportPromise = new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this._pendingExportResolve = null;
        this._pendingExportPromise = null;
        reject(new Error('Snapshot export timed out after 120 seconds'));
      }, 120_000);

      // Register a one-time listener for the export response
      this._pendingExportResolve = (response: any) => {
        clearTimeout(timeout);
        this._pendingExportPromise = null;
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || 'Snapshot export failed'));
        }
      };

      this.sendToAgentServer(exportRequest as any).catch((error) => {
        clearTimeout(timeout);
        this._pendingExportResolve = null;
        this._pendingExportPromise = null;
        reject(error);
      });
    });

    const result = await this._pendingExportPromise;

    this.logger.log('Snapshot export received from agent server:', result.snapshotId);

    return {
      bundleData: result.bundleData,
      baseSnapshotId: result.baseSnapshotId,
      snapshot: { snapshot_id: result.snapshotId },
    };
  }

  /** Pending resolve callback for snapshot export response from agent server */
  private _pendingExportResolve: ((response: any) => void) | null = null;
  /** In-flight export promise — shared across concurrent onSendPR callers */
  private _pendingExportPromise: Promise<any> | null = null;

  /**
   * Sends the deferred snapshotArchiveImport message to the agent server
   * once the WS connection is established.
   */
  private async flushPendingSnapshotImport(): Promise<void> {
    if (!this._pendingSnapshotImport) return;

    const { archivePath, environmentId, environmentName, snapshotId } = this._pendingSnapshotImport;
    this._pendingSnapshotImport = null;

    try {
      const archiveBuffer = await fs.readFile(archivePath);
      const archiveBase64 = archiveBuffer.toString('base64');

      this.logger.log('Sending snapshotArchiveImport to agent server for environment:', environmentId);
      await this.sendToAgentServer({
        type: 'snapshotArchiveImport',
        id: `import-${Date.now()}`,
        archiveData: archiveBase64,
        environmentId,
        environmentName,
        snapshotId: snapshotId || undefined,
        workspacePath: this.sandboxWorkspacePath,
      } as any);
      this.logger.log('snapshotArchiveImport sent to agent server');
    } catch (error) {
      this.logger.error('Failed to send snapshot import to agent server:', error);
    }
  }

  /** Pending snapshot import to send to agent server once WS is connected */
  private _pendingSnapshotImport: {
    archivePath: string;
    environmentId: string;
    environmentName: string;
    snapshotId: string | null;
  } | null = null;

  // --- BaseProvider abstract method implementations ---

  protected async resolveProjectContext(initVars: ProviderInitVars): Promise<void> {
    if (!this.baseProjectPath) {
      throw new Error('Base project path is not available');
    }

    const workspacePath = path.join(
      this.baseProjectPath,
      '.codebolt',
      'remote-envs',
      initVars.environmentName,
    );

    this.state.projectPath = workspacePath;
  }

  protected async setupEnvironment(initVars: ProviderInitVars): Promise<void> {
    if (!this.state.projectPath) {
      this.logger.error('Project path is not available');
      throw new Error('Project path is not available');
    }

    // Guard against concurrent setupEnvironment calls
    if (this.setupInProgress) {
      this.logger.warn('setupEnvironment already in progress, skipping duplicate call');
      return;
    }
    if (this.sandbox) {
      this.logger.warn('Sandbox already exists, skipping setupEnvironment');
      return;
    }
    this.setupInProgress = true;

    try {
      await this.doSetupEnvironment(initVars);
    } finally {
      this.setupInProgress = false;
    }
  }

  private async doSetupEnvironment(initVars: ProviderInitVars): Promise<void> {
    // Create local metadata directory
    await fs.mkdir(this.state.projectPath!, { recursive: true });
    this.state.workspacePath = this.state.projectPath;
    this.logger.log('Created local metadata directory:', this.state.projectPath);

    // Set E2B API key if provided
    if (this.providerConfig.e2bApiKey) {
      process.env.E2B_API_KEY = this.providerConfig.e2bApiKey;
    }

    // Reconnect to existing sandbox or create a new one
    const existingSandboxId = initVars.sandboxId as string | undefined;
    if (existingSandboxId) {
      try {
        const SandboxCls = await getE2bSandbox();
        this.sandbox = await SandboxCls.connect(existingSandboxId);
        this.sandboxId = existingSandboxId;
        this.logger.log('Reconnected to existing sandbox:', existingSandboxId);
      } catch (error) {
        this.logger.warn('Failed to reconnect to sandbox:', existingSandboxId, '- creating new one');
        this.sandbox = null;
      }
    }

    if (!this.sandbox) {
      const createParams: any = {
        timeoutMs: this.providerConfig.autoStopInterval
          ? this.providerConfig.autoStopInterval * 1000
          : 60 * 60 * 1000, // Default 1 hour (E2B max for base tier)
        metadata: {
          provider: 'e2b-remote',
          environment: initVars.environmentName,
        },
      };

      if (this.providerConfig.sandboxTemplate) {
        createParams.template = this.providerConfig.sandboxTemplate;
      }

      if (initVars.envVars && typeof initVars.envVars === 'object') {
        createParams.envs = initVars.envVars as Record<string, string>;
      }

      const SandboxCls = await getE2bSandbox();
      this.sandbox = await SandboxCls.create(createParams);
      this.sandboxId = this.sandbox.sandboxId || null;
      this.logger.log('Created new E2B sandbox:', this.sandboxId);
    }

    // Clone git repo if provided
    const gitUrl = initVars.gitUrl as string | undefined;
    if (gitUrl && this.sandbox) {
      this.logger.log('Cloning repository:', gitUrl);
      const branch = initVars.gitBranch as string | undefined;
      const cloneCmd = branch
        ? `git clone --branch ${branch} ${gitUrl} ${this.sandboxWorkspacePath}`
        : `git clone ${gitUrl} ${this.sandboxWorkspacePath}`;
      await this.sandbox.commands.run(cloneCmd);
      this.logger.log('Repository cloned successfully');
    }

    // Import snapshot archive if provided — upload to sandbox and send to agent server's NarrativeService
    const archivePath = initVars.archivePath as string | undefined;
    const serverSnapshotId = (initVars as any).snapshotId || null;
    const environmentId = (process.env.environmentId as string) || initVars.environmentName;

    if (archivePath) {
      // Upload archive to sandbox and extract it there
      if (this.sandbox) {
        const remoteTmpArchive = '/tmp/snapshot-archive.tar.gz';
        this.logger.log('Uploading snapshot archive to sandbox:', archivePath, '->', remoteTmpArchive);
        const archiveBuffer = await fs.readFile(archivePath);
        await this.sandbox.files.write(remoteTmpArchive, archiveBuffer.toString('base64'));

        // Decode base64 and extract
        this.logger.log('Extracting archive in sandbox to:', this.sandboxWorkspacePath);
        await this.sandbox.commands.run(
          `base64 -d ${remoteTmpArchive} > /tmp/snapshot-archive-decoded.tar.gz && tar -xzf /tmp/snapshot-archive-decoded.tar.gz -C ${this.sandboxWorkspacePath}`,
        );

        // Cleanup
        await this.sandbox.commands.run(`rm -f ${remoteTmpArchive} /tmp/snapshot-archive-decoded.tar.gz`);
        this.logger.log('Snapshot files extracted to sandbox successfully');
      }

      // Send archive to agent server's NarrativeService for snapshot tracking via WS
      // (deferred until agent server WS is connected — see connectTransport)
      this._pendingSnapshotImport = {
        archivePath,
        environmentId,
        environmentName: initVars.environmentName,
        snapshotId: serverSnapshotId,
      };
    }
  }

  private async syncLocalToSandbox(localDir: string, sandboxDir: string): Promise<void> {
    if (!this.sandbox) return;

    const entries = await fs.readdir(localDir, { withFileTypes: true });

    for (const entry of entries) {
      const localPath = path.join(localDir, entry.name);
      const remotePath = path.join(sandboxDir, entry.name);

      if (entry.name.startsWith('.') && entry.name !== '.codebolt' && entry.name !== '.codeboltAgents') {
        continue;
      }

      if (entry.isDirectory()) {
        try {
          this.logger.log('Creating folder:', localPath, '->', remotePath);
          await this.sandbox.commands.run(`mkdir -p "${remotePath}"`);
        } catch {
          // Folder may already exist
        }
        await this.syncLocalToSandbox(localPath, remotePath);
      } else {
        try {
          const content = await fs.readFile(localPath, 'utf-8');
          this.logger.log('Uploading file:', localPath, '->', remotePath);
          await this.sandbox.files.write(remotePath, content);
        } catch (error) {
          this.logger.warn('Failed to upload file to sandbox:', localPath, '->', remotePath, error);
        }
      }
    }
  }

  protected async teardownEnvironment(): Promise<void> {
    if (this.sandbox) {
      try {
        await this.sandbox.kill();
        this.logger.log('E2B sandbox killed');
      } catch (error) {
        this.logger.error('Error killing E2B sandbox:', error);
      }
      this.sandbox = null;
      this.sandboxId = null;
    }
  }

  protected async ensureAgentServer(): Promise<void> {
    if (!this.sandbox) {
      this.logger.log('Sandbox not available yet, deferring agent server startup');
      return;
    }

    // Check if agent server is already running
    try {
      const check = await this.sandbox.commands.run(
        `curl -sf -o /dev/null http://localhost:${this.providerConfig.agentServerPort}/`,
      );
      if (check.exitCode === 0) {
        this.logger.log('Agent server already running in sandbox');
        return;
      }
    } catch {
      // Not running, need to start
    }

    await this.startAgentServerInSandbox();
  }

  protected async beforeClose(): Promise<void> {
    try {
      this.logger.log('Received close signal, initiating cleanup...');
      await this.stopAgentServer();
    } catch (error) {
      this.logger.error('Error during beforeClose cleanup:', error);
    }
  }

  /**
   * Override transport connection to connect WebSocket to E2B sandbox.
   * E2B exposes ports via getHost() which returns a public hostname.
   */
  async ensureTransportConnection(initVars: ProviderInitVars): Promise<void> {
    if (this.agentServer.wsConnection && this.agentServer.isConnected) {
      return;
    }

    const url = this.buildWebSocketUrl(initVars);
    this.logger.log('Connecting WebSocket to:', url);

    await new Promise<void>((resolve, reject) => {
      const wsOptions: any = {
        followRedirects: true,
        maxRedirects: 5,
        headers: {} as Record<string, string>,
        perMessageDeflate: {
          zlibDeflateOptions: { level: 6 },
          threshold: 1024, // compress messages larger than 1KB
        },
        maxPayload: 0, // unlimited payload size
      };

      const ws = new WebSocket(url, wsOptions);
      let isRegistered = false;

      const registrationTimeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket registration timeout'));
      }, this.config.wsRegistrationTimeout);

      ws.on('open', () => {
        this.agentServer.wsConnection = ws;
        this.agentServer.isConnected = true;
        this.agentServer.metadata = { connectedAt: Date.now() };
        this.logger.log('WebSocket connection established');
      });

      ws.on('message', (data: any) => {
        try {
          const payload = JSON.parse(data.toString());
          // Respond to application-level pings from agent server
          // (WebSocket control frame pings may not traverse E2B's proxy)
          if (payload.type === '__ping') {
            try {
              ws.send(JSON.stringify({ type: '__pong', timestamp: Date.now() }));
            } catch { /* ignore */ }
            return;
          }
          this.logger.log('WebSocket message received from agent server:', payload?.type);
          if (!isRegistered && payload.type === 'registered') {
            isRegistered = true;
            clearTimeout(registrationTimeout);
            this.logger.log('WebSocket registered with agent server');
            // Send pending snapshot import to agent server's NarrativeService
            this.flushPendingSnapshotImport();
            resolve();
          }
          this.handleTransportMessage(payload);
        } catch (error) {
          this.logger.error('Failed to parse WebSocket message', error);
        }
      });

      ws.on('unexpected-response', (_req: any, res: any) => {
        let body = '';
        res.on('data', (chunk: any) => { body += chunk; });
        res.on('end', () => {
          this.logger.error(
            `WebSocket upgrade rejected: ${res.statusCode}`,
            'headers:', JSON.stringify(res.headers),
            'body:', body,
          );
          clearTimeout(registrationTimeout);
          this.agentServer.isConnected = false;
          this.agentServer.wsConnection = null;
          reject(new Error(`WebSocket upgrade rejected with status ${res.statusCode}: ${body}`));
        });
      });

      ws.on('error', (error: any) => {
        clearTimeout(registrationTimeout);
        this.agentServer.isConnected = false;
        this.agentServer.wsConnection = null;
        this.agentServer.metadata = { lastError: error };
        this.logger.error('WebSocket error:', error.message || error);
        reject(error);
      });

      ws.on('close', () => {
        clearTimeout(registrationTimeout);
        this.stopWsPing();
        this.agentServer.isConnected = false;
        this.agentServer.wsConnection = null;
        this.agentServer.metadata = { closedAt: Date.now() };
        this.logger.log('WebSocket connection closed');

        if (!isRegistered) {
          reject(new Error('WebSocket closed before registration'));
        } else {
          // Connection dropped after registration — attempt reconnect
          this.scheduleReconnect();
        }
      });
    });

    // Start ping/pong keepalive after successful connection
    this.startWsPing();
  }

  private wsPingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 10;
  private readonly WS_PING_INTERVAL = 20_000; // 20 seconds

  private startWsPing(): void {
    this.stopWsPing();
    this.wsPingInterval = setInterval(() => {
      const ws = this.agentServer.wsConnection;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, this.WS_PING_INTERVAL);
  }

  private stopWsPing(): void {
    if (this.wsPingInterval) {
      clearInterval(this.wsPingInterval);
      this.wsPingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.logger.error(`Max reconnect attempts (${this.MAX_RECONNECT_ATTEMPTS}) reached, giving up`);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // exponential backoff, max 30s
    this.reconnectAttempts++;
    this.logger.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        if (this.agentServer.isConnected) return; // already reconnected

        if (!this.state.environmentName) return;

        // Before reconnecting WebSocket, ensure the agent server port is actually open
        if (this.sandbox) {
          let portOpen = false;
          try {
            const portCheck = await this.sandbox.commands.run(
              `curl -sf -o /dev/null http://localhost:${this.providerConfig.agentServerPort}/`,
            );
            portOpen = portCheck.exitCode === 0;
          } catch {
            // E2B SDK throws CommandExitError on non-zero exit codes (e.g. curl exit 7 = connection refused)
            portOpen = false;
          }

          if (!portOpen) {
            this.logger.warn('Agent server port not open, attempting to restart agent server...');
            try {
              await this.startAgentServerInSandbox();
            } catch (restartError) {
              this.logger.error('Failed to restart agent server:', restartError);
              this.scheduleReconnect();
              return;
            }
          }
        }

        await this.ensureTransportConnection({
          environmentName: this.state.environmentName,
          projectPath: this.state.projectPath ?? undefined,
        } as any);
        this.reconnectAttempts = 0;
        this.logger.log('WebSocket reconnected successfully');
        await this.flushPendingMessages();
      } catch (error) {
        this.logger.error('WebSocket reconnect failed:', error);
        this.scheduleReconnect();
      }
    }, delay);
  }

  protected buildWebSocketUrl(initVars: ProviderInitVars): string {
    const query = new URLSearchParams({
      clientType: 'app',
      appId: `e2b-${initVars.environmentName}`,
      projectName: initVars.environmentName,
    });

    // Use sandbox workspace path since agent server runs inside sandbox
    query.set('currentProject', this.sandboxWorkspacePath);

    return `${this.agentServer.serverUrl}?${query.toString()}`;
  }

  protected handleTransportMessage(message: RawMessageForAgent): void {
    try {
      if (message?.type) {
        this.logger.log('WebSocket message received from E2B:', message.type);
      }

      // Log snapshot archive import result from agent server
      if (message.type === 'snapshotArchiveImportResult') {
        const importResult = message as any;
        if (importResult.success) {
          this.logger.log('Snapshot archive imported by agent server: snapshot=', importResult.snapshotId);
        } else {
          this.logger.error('Snapshot archive import failed on agent server:', importResult.error);
        }
        return;
      }

      // Intercept snapshot bundle export response from agent server
      if (message.type === 'snapshotBundleExport' && this._pendingExportResolve) {
        this.logger.log('Received snapshotBundleExport from agent server');
        const resolve = this._pendingExportResolve;
        this._pendingExportResolve = null;
        resolve(message);
        return;
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
        case 'processStoped':
        case 'processStopped':
          this.logger.log('Agent process stopped, sending PR to parent before forwarding');
          this.sendPROnAgentFinish(message);
          return; // Don't forward yet - sendPROnAgentFinish will forward after PR
        case 'snapshotBundleExport':
          // Additional snapshotBundleExport messages after the pending resolve was consumed.
          // The agent server may emit multiple exports (one per snapshot); only the first
          // is used by onSendPR — the rest can be safely ignored.
          this.logger.log('Ignoring additional snapshotBundleExport (no pending resolve), snapshotId:', (message as any).snapshotId);
          return; // Don't forward to parent
        default:
          this.logger.log('Unhandled message type:', message.type);
      }

      super.handleTransportMessage(message);
    } catch (error) {
      this.logger.error('Error handling transport message:', error);
    }
  }

  /**
   * When an agent finishes, automatically send a PR to the parent
   * before forwarding the processStopped message.
   */
  private async sendPROnAgentFinish(originalMessage: RawMessageForAgent): Promise<void> {
    try {
      this.logger.log('Triggering automatic PR submission on agent finish');
      const prResult = await this.onSendPR();
      this.logger.log('PR submitted successfully on agent finish');

      // Send the PR result to the parent app
      super.handleTransportMessage({
        type: 'remoteProviderEvent',
        action: 'providerSendPRResponse',
        requestId: originalMessage.requestId || '',
        message: prResult,
      } as any);
    } catch (error: any) {
      this.logger.error('Failed to send PR on agent finish:', error);
      // Send error notification but don't block the process stop
      super.handleTransportMessage({
        type: 'remoteProviderEvent',
        action: 'providerSendPRResponse',
        requestId: originalMessage.requestId || '',
        error: error instanceof Error ? error.message : 'Failed to send PR on agent finish',
      } as any);
    } finally {
      // Always forward the original processStopped message after PR attempt
      super.handleTransportMessage(originalMessage);
    }
  }

  // --- Agent server management ---

  private async startAgentServerInSandbox(): Promise<void> {
    if (!this.sandbox) {
      throw new Error('Cannot start agent server: sandbox not available');
    }

    const port = this.providerConfig.agentServerPort!;
    let serverEntrypoint: string;

    if (this.providerConfig.localAgentServerPath) {
      // Dev/test mode: upload local agent server bundle directly to sandbox
      const remoteServerPath = '/home/user/.codebolt-agentserver/server.mjs';
      const localServerPath = this.providerConfig.localAgentServerPath;
      this.logger.log(`Uploading local agent server to sandbox: ${localServerPath} -> ${remoteServerPath}`);
      const serverContent = await fs.readFile(localServerPath, 'utf-8');
      await this.sandbox.commands.run('mkdir -p /home/user/.codebolt-agentserver');
      await this.sandbox.files.write(remoteServerPath, serverContent);
      this.logger.log('Agent server uploaded to sandbox');
      serverEntrypoint = remoteServerPath;
    } else {
      // Production mode: install globally from npm registry
      // Using -g so it doesn't pollute the project's node_modules or package.json
      // Use --ignore-scripts to avoid onnxruntime-node's post-install downloading ~500MB GPU binaries
      // which OOM-kills small sandbox instances (exit code 137).
      this.logger.log(`Installing @codebolt/agentserver@11.0.5 globally in sandbox...`);
      const installResult = await this.sandbox.commands.run(
        `sudo npm install -g --ignore-scripts @codebolt/agentserver@11.0.5`,
        { timeoutMs: 300_000 }, // 5 minutes — large package tree
      );
      if (installResult.exitCode !== 0) {
        throw new Error(`Failed to install @codebolt/agentserver@11.0.5 in sandbox: ${installResult.stderr}`);
      }
      this.logger.log('Installed @codebolt/agentserver@11.0.5 globally in sandbox');
      // npm -g installs the "bin" entry as `codebolt-agentserver` on PATH
      serverEntrypoint = '$(which codebolt-agentserver)';
    }

    // Start the agent server as a background command
    const startCmd = `cd ${this.sandboxWorkspacePath} && node ${serverEntrypoint} --noui --port ${port} --project-path ${this.sandboxWorkspacePath}`;

    this.backgroundCommand = await this.sandbox.commands.run(startCmd, {
      background: true,
      timeoutMs: 24 * 60 * 60 * 1000, // 24 hours — agent server must run for the sandbox lifetime
      onStdout: (data: any) => {
        this.logger.log('[sandbox stdout]', data);
      },
      onStderr: (data: any) => {
        this.logger.error('[sandbox stderr]', data);
      },
    });
    this.logger.log('Agent server process started in sandbox as background command');

    // Wait for the server to be ready
    await this.waitForAgentServerReady(port);

    // Build the WebSocket URL using E2B's getHost
    const host = this.sandbox.getHost(port);
    const wsUrl = `wss://${host}`;
    this.agentServer.serverUrl = wsUrl;

    this.logger.log('Agent server accessible at:', wsUrl);
  }

  private async waitForAgentServerReady(port: number): Promise<void> {
    const timeout = this.providerConfig.timeouts?.agentServerStartup ?? 60_000;
    const pollInterval = 1_000;
    const startTime = Date.now();

    this.logger.log(`Waiting for agent server to be ready on port ${port} (timeout: ${timeout}ms)...`);

    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.sandbox!.commands.run(
          `curl -sf -o /dev/null http://localhost:${port}/`,
        );
        if (result.exitCode === 0) {
          this.logger.log('Agent server is ready (port is listening)');
          return;
        }
      } catch {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Agent server in sandbox failed to start within ${timeout}ms`);
  }

  private async stopAgentServer(): Promise<boolean> {
    if (!this.sandbox) {
      this.logger.log('No sandbox available, skipping agent server stop');
      return true;
    }

    try {
      if (this.backgroundCommand) {
        this.logger.log('Killing agent server background command...');
        await this.backgroundCommand.kill();
        this.backgroundCommand = null;
        this.logger.log('Agent server background command killed');
      } else {
        // Fallback: kill by port
        this.logger.log('Stopping agent server by killing process on port...');
        await this.sandbox.commands.run(
          `kill $(lsof -t -i:${this.providerConfig.agentServerPort}) 2>/dev/null || true`,
        );
      }
    } catch (error) {
      this.logger.warn('Error stopping agent server:', error);
    }

    this.agentServer.process = null;
    return true;
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
