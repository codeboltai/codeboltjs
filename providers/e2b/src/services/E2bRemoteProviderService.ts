import * as path from 'path';
import * as fs from 'fs/promises';
import type { ProviderInitVars, AgentStartMessage, RawMessageForAgent } from '@codebolt/types/provider';
import {
  BaseProvider,
  ProviderStartResult,
} from '@codebolt/provider';
import { NarrativeClient } from '@codebolt/narrative';
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
   *  When set, the file is uploaded directly instead of running `npm install @codebolt/agentserver`.
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
  private narrativeClient: NarrativeClient | null = null;
  private importedSnapshotId: string | null = null;
  private serverSnapshotId: string | null = null;
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
      e2bApiKey: config.e2bApiKey ?? process.env.E2B_API_KEY,
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
    await super.onRawMessage(message);
  }

  private async flushPendingMessages(): Promise<void> {
    if (this.pendingMessages.length === 0) return;
    this.logger.log('Flushing', this.pendingMessages.length, 'pending messages to agent server');
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];
    for (const msg of messages) {
      try {
        await super.onRawMessage(msg);
      } catch (error) {
        this.logger.error('Error flushing pending message:', error);
      }
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

      // Shutdown NarrativeClient
      if (this.narrativeClient) {
        try {
          await this.narrativeClient.shutdown();
          this.logger.log('Narrative client shut down');
        } catch (error) {
          this.logger.error('Error shutting down narrative client:', error);
        }
        this.narrativeClient = null;
      }

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
    const emptyResult = { files: [], summary: { totalFiles: 0, totalAdditions: 0, totalDeletions: 0, totalChanges: 0 } };

    if (!this.sandbox) {
      return emptyResult;
    }

    try {
      // Check if a git repo exists in the sandbox workspace before querying
      const gitCheck = await this.sandbox.commands.run(
        `cd ${this.sandboxWorkspacePath} && git rev-parse --is-inside-work-tree`,
      );
      if (gitCheck.exitCode !== 0) {
        this.logger.log('No git repository in sandbox workspace, returning empty diff');
        return emptyResult;
      }

      const statusResult = await this.sandbox.commands.run(
        `cd ${this.sandboxWorkspacePath} && git status --porcelain`,
      );
      const diffResult = await this.sandbox.commands.run(
        `cd ${this.sandboxWorkspacePath} && git diff --stat`,
      );

      const files = (statusResult.stdout || '').split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => ({
          status: line.substring(0, 2).trim(),
          path: line.substring(3).trim(),
        }));

      return {
        files,
        summary: {
          totalFiles: files.length,
          totalAdditions: 0,
          totalDeletions: 0,
          totalChanges: files.length,
          diffOutput: diffResult.stdout,
        },
      };
    } catch (error) {
      this.logger.error('Error getting diff files:', error);
      return emptyResult;
    }
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
    this.logger.log('Generating patch from git diff...');
    try {
      if (!this.sandbox) {
        return '';
      }
      const result = await this.sandbox.commands.run(
        `cd ${this.sandboxWorkspacePath} && git diff HEAD`,
      );
      return result.stdout || '';
    } catch (error) {
      this.logger.error('Error generating patch:', error);
      return '';
    }
  }

  async onSendPR(): Promise<any> {
    this.logger.log('Sending PR - creating snapshot, staging, committing, and pushing changes...');

    if (!this.sandbox) {
      throw new Error('No sandbox available');
    }

    // Create a narrative snapshot to record the change point
    let snapshotResult: any = null;
    let bundleResult: any = null;
    if (this.narrativeClient) {
      try {
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

        snapshotResult = await this.narrativeClient.snapshot.createSnapshot({
          agent_run_id,
          description: 'send-pr-snapshot',
        });
        this.logger.log('Created narrative snapshot:', snapshotResult.snapshot_id);

        bundleResult = await this.narrativeClient.snapshot.exportSnapshotBundle({
          snapshot_id: snapshotResult.snapshot_id,
          incremental: false,
        });
        this.logger.log('Exported snapshot bundle:', bundleResult.bundle_path);
      } catch (error) {
        this.logger.error('Error creating narrative snapshot (continuing with git push):', error);
      }
    }

    // Push changes via git commands in E2B sandbox
    try {
      await this.sandbox.commands.run(
        `cd ${this.sandboxWorkspacePath} && git add .`,
      );
      const commitResult = await this.sandbox.commands.run(
        `cd ${this.sandboxWorkspacePath} && git -c user.name="CodeBolt" -c user.email="codebolt@codebolt.ai" commit -m "Changes from E2B remote environment"`,
      );
      await this.sandbox.commands.run(
        `cd ${this.sandboxWorkspacePath} && git push`,
      );

      this.logger.log('Changes pushed successfully, commit:', commitResult.stdout);
      return {
        success: true,
        commit: commitResult.stdout,
        snapshot: snapshotResult,
        bundle: bundleResult,
        baseSnapshotId: this.serverSnapshotId,
      };
    } catch (error: any) {
      this.logger.error('Error sending PR:', error);
      throw new Error(`Failed to send PR: ${error.message}`);
    }
  }

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

    // Initialize NarrativeClient for snapshot tracking (optional)
    const environmentId = (process.env.environmentId as string) || initVars.environmentName;
    try {
      this.narrativeClient = new NarrativeClient({
        environmentId,
        workspace: this.state.projectPath ?? undefined,
        remote: true,
      });

      await this.narrativeClient.start();
      this.logger.log('Narrative engine started in remote mode for environment:', environmentId);
    } catch (narrativeError) {
      this.logger.warn('Narrative engine not available, snapshot features will be disabled:', narrativeError);
      this.narrativeClient = null;
    }

    // Import snapshot archive if provided
    const archivePath = initVars.archivePath as string | undefined;
    this.serverSnapshotId = (initVars as any).snapshotId || null;
    if (archivePath) {
      // Track snapshot metadata locally via narrative engine (if available)
      if (this.narrativeClient) {
        this.logger.log('Importing snapshot metadata via narrative engine:', archivePath);
        const importResult = await this.narrativeClient.snapshot.importSnapshotArchive({
          archive_path: archivePath,
          thread_id: 'provider-init',
          remote_environment_id: environmentId,
        });
        this.importedSnapshotId = importResult.snapshot_id;
        this.logger.log('Imported snapshot:', importResult.snapshot_id, 'tree_hash:', importResult.tree_hash);
        this.logger.log('Server snapshot ID (for diff base):', this.serverSnapshotId);
      }

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
    if (this.narrativeClient) {
      try {
        await this.narrativeClient.shutdown();
        this.logger.log('Narrative engine shut down');
      } catch (error) {
        this.logger.error('Error shutting down narrative engine:', error);
      }
      this.narrativeClient = null;
    }

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
          this.logger.log('WebSocket message received from agent server:', payload);
          if (!isRegistered && payload.type === 'registered') {
            isRegistered = true;
            clearTimeout(registrationTimeout);
            this.logger.log('WebSocket registered with agent server');
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
        this.agentServer.isConnected = false;
        this.agentServer.wsConnection = null;
        this.agentServer.metadata = { closedAt: Date.now() };
        this.logger.log('WebSocket connection closed');
      });
    });
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
      // Production mode: install from npm registry
      this.logger.log(`Installing @codebolt/agentserver in sandbox...`);
      const installResult = await this.sandbox.commands.run(
        `cd ${this.sandboxWorkspacePath} && npm install @codebolt/agentserver`,
      );
      if (installResult.exitCode !== 0) {
        throw new Error(`Failed to install @codebolt/agentserver in sandbox: ${installResult.stderr}`);
      }
      this.logger.log('Installed @codebolt/agentserver in sandbox');
      serverEntrypoint = `$(node -p "require.resolve('@codebolt/agentserver')")`;
    }

    // Start the agent server as a background command
    const startCmd = `cd ${this.sandboxWorkspacePath} && node ${serverEntrypoint} --noui --port ${port} --project-path ${this.sandboxWorkspacePath}`;

    this.backgroundCommand = await this.sandbox.commands.run(startCmd, {
      background: true,
      onStdout: (data: any) => {
        this.logger.log('[sandbox stdout]', data);
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
