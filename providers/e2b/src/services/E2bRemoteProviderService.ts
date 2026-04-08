import * as path from 'path';
import * as fs from 'fs/promises';
import { execSync } from 'child_process';
import type { ProviderInitVars, AgentStartMessage, RawMessageForAgent } from '@codebolt/types/provider';
import {
  BaseProvider,
  ProviderStartResult,
} from '@codebolt/provider';
import WebSocket from 'ws';
import { createPrefixedLogger, type Logger } from '../utils/logger';

let _SandboxClass: any = null;
async function getE2bSandbox(): Promise<any> {
  if (!_SandboxClass) {
    const mod = require('@e2b/code-interpreter');
    _SandboxClass = mod.Sandbox;
  }
  return _SandboxClass;
}

interface E2bProviderConfig {
  pluginPort?: number;
  e2bApiKey?: string;
  /** E2B sandbox template ID. The template should have codebolt and the
   *  remote-execution-plugin pre-installed (see E2B template docs).
   *  This is the recommended approach — avoids runtime installs. */
  sandboxTemplate?: string;
  autoStopInterval?: number;
  /** Custom command to start codebolt in the sandbox.
   *  When empty/undefined, uses `npx codebolt start --headless`. */
  codeboltStartCommand?: string;
  timeouts?: {
    codeboltStartup?: number;
    wsConnection?: number;
    cleanup?: number;
  };
}

export class E2bRemoteProviderService extends BaseProvider {
  private sandbox: any = null;
  private sandboxId: string | null = null;
  private baseProjectPath: string | null = null;
  private sandboxWorkspacePath: string = '/home/user';
  private setupInProgress = false;
  private backgroundCommand: any = null;
  private pendingNarrativeRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (err: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  private readonly providerConfig: E2bProviderConfig;
  private readonly logger: Logger;

  constructor(config: E2bProviderConfig = {}) {
    super({
      agentServerPort: config.pluginPort ?? 3100,
      agentServerHost: 'localhost',
      wsRegistrationTimeout: config.timeouts?.wsConnection ?? 30_000,
      reconnectAttempts: 10,
      reconnectDelay: 1_000,
      transport: 'websocket',
    });

    this.providerConfig = {
      pluginPort: config.pluginPort ?? 3100,
      e2bApiKey:  config.e2bApiKey ?? process.env.E2B_API_KEY,
      sandboxTemplate: config.sandboxTemplate ?? 'codebolt-remote-execution',
      autoStopInterval: config.autoStopInterval ?? 0,
      codeboltStartCommand: config.codeboltStartCommand,
      timeouts: {
        codeboltStartup: config.timeouts?.codeboltStartup ?? 120_000,
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
    this.lastInitVars = initVars;

    // Set sandbox workspace path using project name so code goes into a subdirectory
    const projectName = (initVars as any).projectName || path.basename(projectPath);
    if (projectName) {
      this.sandboxWorkspacePath = `/home/user/${projectName}`;
      this.logger.log('Sandbox workspace path set to:', this.sandboxWorkspacePath);
    }

    // Allow runtime override of E2B config from initVars
    if (initVars.e2bApiKey) {
      this.providerConfig.e2bApiKey = initVars.e2bApiKey as string;
    }
    if (initVars.sandboxTemplate) {
      this.providerConfig.sandboxTemplate = initVars.sandboxTemplate as string;
    }

    // Custom startup order: sandbox first, then CodeBolt + plugin, then transport.
    this.resetState();
    this.state.environmentName = initVars.environmentName;

    await this.resolveProjectContext(initVars);
    this.state.workspacePath = await this.resolveWorkspacePath(initVars);

    // 1. Create sandbox and copy code
    await this.setupEnvironment(initVars);

    // 2. Start CodeBolt with remote-execution-plugin inside the sandbox
    await this.ensureAgentServer();

    // 3. Connect WebSocket transport to plugin WS server
    await this.ensureTransportConnection(initVars);

    // 4. Import narrative unified bundle into the in-sandbox unified server
    // (delegated to the plugin so narrative semantics stay out of the provider).
    const narrativeBundlePath = (initVars as any).narrativeBundlePath as string | undefined;
    if (narrativeBundlePath && this.sandbox) {
      try {
        const remoteBundle = await this.uploadFileToSandbox(
          narrativeBundlePath,
          '/tmp/narrative-unified.tar.gz',
        );
        this.logger.log('Sending narrativeArchiveImport to plugin:', remoteBundle);
        const ack = await this.sendNarrativeRequest('narrativeArchiveImport', {
          bundlePath: remoteBundle,
          environmentId: initVars.environmentName,
          workspace: this.sandboxWorkspacePath,
          snapshotId: (initVars as any).snapshotId,
          narrativeContext: (initVars as any).narrativeContext,
        });
        this.logger.log(
          `Narrative bundle imported: snapshots=${ack?.snapshot_ids?.length ?? 0} narrative_imported=${ack?.narrative_imported}`,
        );
        await this.sandbox.commands.run(`rm -f ${remoteBundle}`);
      } catch (err: any) {
        this.logger.error('Narrative bundle import failed:', err?.message ?? err);
        throw new Error(`Narrative bundle import failed in sandbox: ${err?.message ?? err}`);
      }
    }

    this.state.initialized = true;

    const startResult: ProviderStartResult = {
      success: true,
      environmentName: initVars.environmentName,
      agentServerUrl: this.agentServer.serverUrl,
      workspacePath: this.state.workspacePath!,
      transport: this.config.transport,
    };

    await this.afterConnected(startResult);

    this.logger.log('Started environment with workspace:', startResult.workspacePath);

    this.startHeartbeat();

    if (initVars.environmentName) {
      this.registerConnectedEnvironment(initVars.environmentName);
      this.startEnvironmentHeartbeat(initVars.environmentName);
    }

    return startResult;
  }

  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    this.logger.log('Agent start requested, forwarding to sandbox CodeBolt server', JSON.stringify(agentMessage));
    try {
      await this.ensureAgentServer();

      if (!this.agentServer.isConnected && this.state.environmentName) {
        this.logger.log('Plugin not connected, attempting to reconnect transport...');
        await this.ensureTransportConnection({
          environmentName: this.state.environmentName,
          projectPath: this.state.projectPath ?? undefined,
        } as any);
      }

      // Send user message to sandbox CodeBolt server via the plugin WS.
      if (this.agentServer.wsConnection && this.agentServer.isConnected) {
        const ws = this.agentServer.wsConnection;
        const userMessage = (agentMessage as any).userMessage || agentMessage;
        ws.send(JSON.stringify(userMessage));
        this.logger.log('Agent start message sent to plugin as messageResponse');
      } else {
        throw new Error('Plugin WS not connected. Cannot start agent.');
      }
    } catch (error) {
      throw error;
    }
  }

  async onRawMessage(message: any): Promise<void> {
    if (!this.agentServer.isConnected || !this.agentServer.wsConnection) {
      // Queue via base class
      await super.onRawMessage(message);
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

    // Check if this is a reply to a pending execution request
    const pendingRequestId = this.matchPendingExecutionRequest(message);
    if (pendingRequestId) {
      this.sendExecutionReply(pendingRequestId, message);
      return;
    }

    // Forward as a raw message to plugin
    await super.onRawMessage(message);
  }

  async onProviderStop(initVars: ProviderInitVars): Promise<void> {
    this.logger.log('Provider stop requested for environment:', initVars.environmentName);

    try {
      this.stopHeartbeat();

      if (initVars.environmentName) {
        this.unregisterConnectedEnvironment(initVars.environmentName);
      }

      await this.stopCodeBoltInSandbox();

      // disconnectTransport handles cancelReconnect + stopWsPing + clearAllPendingRequests
      await this.disconnectTransport();
      await this.teardownEnvironment();
      this.resetState();

      this.logger.log('Provider stopped successfully');
    } catch (error) {
      this.logger.error('Error stopping provider:', error);
      throw error;
    }
  }

  async onGetDiffFiles(): Promise<{ files: any[]; summary?: any }> {
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

  // --- Execution request/reply tracking ---

  /**
   * Match an outgoing message to a pending execution request.
   * Returns the requestId if matched, null otherwise.
   */
  private matchPendingExecutionRequest(message: any): string | null {
    // Match by message type to the originalType of pending requests
    if (!message?.type) {
      this.logger.log('matchPendingExecutionRequest: no message type, skipping');
      return null;
    }

    this.logger.log(`matchPendingExecutionRequest: looking for match for type="${message.type}" requestId="${message.requestId || 'none'}", pending count=${this.pendingRequests.size}`);

    for (const [requestId, pending] of this.pendingRequests) {
      const matchByType = pending.type === message.type;
      const matchByRequestId = message.requestId === requestId;
      if (matchByType || matchByRequestId) {
        this.logger.log(`matchPendingExecutionRequest: matched requestId="${requestId}" (byType=${matchByType}, byRequestId=${matchByRequestId}, originalType="${pending.type}")`);
        return requestId;
      }
    }

    this.logger.log(`matchPendingExecutionRequest: no match found for type="${message.type}"`);
    return null;
  }

  /**
   * Send an executionReply back to the plugin for a completed request.
   */
  private sendExecutionReply(requestId: string, result: any): void {
    this.resolveRequest(requestId);
    const ws = this.agentServer.wsConnection;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const reply = JSON.stringify({
        type: 'executionReply',
        requestId,
        result,
      });
      ws.send(reply);
      this.logger.log('Sent executionReply for requestId:', requestId);
    } else {
      this.logger.warn('Cannot send executionReply, WS not open for requestId:', requestId);
    }
  }

  /**
   * Override onRequestTimeout to send error executionReply back to plugin.
   */
  protected onRequestTimeout(requestId: string): void {
    this.logger.warn(`Request ${requestId} timed out, sending error reply`);
    this.pendingRequests.delete(requestId);
    const ws = this.agentServer.wsConnection;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'executionReply',
        requestId,
        result: { error: 'Request timed out' },
      }));
    }
  }

  /**
   * Run `npm pack` in a local package directory and return the absolute path
   * to the resulting .tgz tarball.
   */
  private async packLocalDir(dir: string): Promise<string> {
    // npm pack --json prints metadata for each tarball; capture it.
    const out = execSync('npm pack --json --silent', {
      cwd: dir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(out);
    const entry = Array.isArray(parsed) ? parsed[0] : parsed;
    const filename = entry?.filename;
    if (!filename) {
      throw new Error(`npm pack in ${dir} did not produce a filename`);
    }
    return path.resolve(dir, filename);
  }

  /**
   * Upload a local tarball to the sandbox and `npm install -g` it.
   */
  private async installLocalTarballInSandbox(localTarballPath: string): Promise<void> {
    if (!this.sandbox) throw new Error('No sandbox available');
    this.logger.log('[dev-install] Uploading local tarball:', localTarballPath);
    const remoteTar = '/tmp/codebolt-local.tgz';
    await this.uploadFileToSandbox(localTarballPath, remoteTar);
    this.logger.log('[dev-install] Installing local tarball globally');
    const result = await this.sandbox.commands.run(
      `npm install -g --ignore-scripts ${remoteTar}`,
      { user: 'root' as any },
    );
    if ((result as any)?.exitCode && (result as any).exitCode !== 0) {
      throw new Error(`npm install -g <tarball> failed: exit ${(result as any).exitCode}`);
    }
    await this.sandbox.commands.run(`rm -f ${remoteTar}`);
  }

  // --- Dev-mode installer (replicates e2b-template setup at runtime) ---

  /**
   * Mirror the e2b-template's setup steps so we can iterate on plugin / server
   * code without rebuilding and republishing the template.
   *
   * All steps are skipped unless their env var is set, so this is a no-op in
   * production runs that use a pre-baked template.
   */
  private async installLocalDevArtifacts(): Promise<void> {
    if (!this.sandbox) return;

    const installCodebolt = process.env.CODEBOLT_DEV_INSTALL_CODEBOLT === '1'
      || process.env.CODEBOLT_DEV_INSTALL_CODEBOLT === 'true';
    const serverTarball = process.env.CODEBOLT_DEV_SERVER_TARBALL;
    const cliDir = process.env.CODEBOLT_DEV_CLI_DIR;
    const pluginDir = process.env.CODEBOLT_DEV_PLUGIN_DIR
      || '/Users/ravirawat/Documents/codeboltai/AiEditor/CodeBolt/packages/plugins/remote-execution-plugin';

    if (!installCodebolt && !serverTarball && !cliDir && !pluginDir) {
      return; // nothing to do — use whatever the template has baked in
    }

    this.logger.log('[dev-install] Starting local dev artifact installation');

    // 1. Install codebolt globally from npm (only if requested or if missing)
    if (installCodebolt) {
      this.logger.log('[dev-install] Running: npm install -g --ignore-scripts codebolt');
      const result = await this.sandbox.commands.run(
        'npm install -g --ignore-scripts codebolt',
        { user: 'root' as any },
      );
      if ((result as any)?.exitCode && (result as any).exitCode !== 0) {
        throw new Error(`npm install -g codebolt failed: exit ${(result as any).exitCode}`);
      }
    }

    // 2a. Install codebolt from a LOCAL tarball (overrides whatever's there)
    // Build the tarball locally with `npm pack` in packages/cli (or wherever
    // your codebolt package lives) and point CODEBOLT_DEV_SERVER_TARBALL at it.
    if (serverTarball) {
      await this.installLocalTarballInSandbox(serverTarball);
    }

    // 2b. Pack a local cli dir on-the-fly and install — saves the manual
    // `npm pack` step. Set CODEBOLT_DEV_CLI_DIR=/path/to/packages/cli.
    if (cliDir) {
      this.logger.log('[dev-install] Packing local cli dir:', cliDir);
      const tarballPath = await this.packLocalDir(cliDir);
      try {
        await this.installLocalTarballInSandbox(tarballPath);
      } finally {
        // Clean up the local tarball npm pack just produced
        try { await fs.unlink(tarballPath); } catch { /* ignore */ }
      }
    }

    // 3. Upload local plugin dir (package.json + dist/index.js) to
    //    ~/.codebolt/plugins/<plugin-name> so the unified server picks it up
    //    on its next plugin scan.
    if (pluginDir) {
      this.logger.log('[dev-install] Uploading local plugin dir:', pluginDir);
      const pkgJsonPath = path.join(pluginDir, 'package.json');
      const distIndexPath = path.join(pluginDir, 'dist', 'index.js');

      const pkgJsonRaw = await fs.readFile(pkgJsonPath, 'utf-8');
      const pkgJson = JSON.parse(pkgJsonRaw);
      const pluginName = (pkgJson.name || '').replace(/^@[^/]+\//, '');
      if (!pluginName) {
        throw new Error(`Could not derive plugin folder name from ${pkgJsonPath}`);
      }
      const remotePluginDir = `/home/user/.codebolt/plugins/${pluginName}`;
      // Also overwrite the builtin plugin shipped with the codebolt npm package,
      // since codebolt loads it by default and errors if its dist/index.js is missing.
      const builtinPluginDir = `/usr/lib/node_modules/codebolt/dist/plugins/${pluginName}`;

      const distMapPath = path.join(pluginDir, 'dist', 'index.js.map');
      let hasMap = false;
      try { await fs.access(distMapPath); hasMap = true; } catch { /* no map */ }

      for (const targetDir of [remotePluginDir, builtinPluginDir]) {
        // Wipe + recreate the plugin dir so stale files don't leak across runs.
        // Chown to user so subsequent uploads (which run as user) can write into it.
        await this.sandbox.commands.run(
          `rm -rf ${targetDir} && mkdir -p ${targetDir}/dist && chown -R user:user ${targetDir}`,
          { user: 'root' as any },
        );

        // Upload package.json
        await this.sandbox.files.write(`${targetDir}/package.json`, pkgJsonRaw);

        // Upload dist/index.js (binary-safe via base64 round-trip helper)
        await this.uploadFileToSandbox(distIndexPath, `${targetDir}/dist/index.js`);

        // Optional: upload sourcemap if present
        if (hasMap) {
          await this.uploadFileToSandbox(distMapPath, `${targetDir}/dist/index.js.map`);
        }

        this.logger.log(`[dev-install] Plugin uploaded to ${targetDir}`);
      }

      // Fix ownership so the user can read/execute the files
      await this.sandbox.commands.run(
        `chown -R user:user /home/user/.codebolt`,
        { user: 'root' as any },
      );
    }

    this.logger.log('[dev-install] Local dev artifact installation complete');
  }

  // --- Narrative bundle round-trip (delegated to in-sandbox plugin) ---

  /**
   * Send a narrative-control message to the in-sandbox plugin and await its ack.
   * The plugin handles `narrativeArchiveImport` / `narrativeArchiveExport` by
   * calling the unified server's narrativePluginHandler in the same process.
   */
  private sendNarrativeRequest(
    type: 'narrativeArchiveImport' | 'narrativeArchiveExport',
    payload: Record<string, any>,
    timeoutMs: number = 120_000,
  ): Promise<any> {
    const ws = this.agentServer.wsConnection;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Plugin WS not connected; cannot send narrative request'));
    }
    const requestId = `narr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingNarrativeRequests.delete(requestId);
        reject(new Error(`Narrative request ${type} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pendingNarrativeRequests.set(requestId, { resolve, reject, timeout });
      try {
        ws.send(JSON.stringify({ type, requestId, ...payload }));
      } catch (err: any) {
        clearTimeout(timeout);
        this.pendingNarrativeRequests.delete(requestId);
        reject(err);
      }
    });
  }

  /**
   * Upload a local file into the sandbox at a known path. Mirrors the existing
   * archive-upload pattern (base64 round-trip for transport safety).
   * Returns the decoded path inside the sandbox.
   */
  private async uploadFileToSandbox(localPath: string, remoteBase: string): Promise<string> {
    if (!this.sandbox) throw new Error('No sandbox available');
    const buf = await fs.readFile(localPath);
    const remoteB64 = `${remoteBase}.b64`;
    await this.sandbox.files.write(remoteB64, buf.toString('base64'));
    await this.sandbox.commands.run(`base64 -d ${remoteB64} > ${remoteBase} && rm -f ${remoteB64}`);
    return remoteBase;
  }

  /**
   * Read a file from the sandbox to a local path.
   * sandbox.files.read returns a string; for binary content the caller must
   * ensure the sandbox has produced something base64-safe, or read as bytes.
   * Here we ask the sandbox to base64-encode the file first, then decode locally.
   */
  private async downloadFileFromSandbox(remotePath: string, localPath: string): Promise<void> {
    if (!this.sandbox) throw new Error('No sandbox available');
    const remoteB64 = `${remotePath}.b64`;
    await this.sandbox.commands.run(`base64 ${remotePath} > ${remoteB64}`);
    const b64 = await this.sandbox.files.read(remoteB64);
    await this.sandbox.commands.run(`rm -f ${remoteB64}`);
    await fs.writeFile(localPath, Buffer.from(b64, 'base64'));
  }

  /**
   * Handle messages from the remote-execution-plugin WS server.
   */
  private handlePluginMessage(message: any): void {
    // Narrative ack — resolve any pending narrative request
    if ((message?.type === 'narrativeArchiveImportAck' || message?.type === 'narrativeArchiveExportAck')
        && message.requestId) {
      const pending = this.pendingNarrativeRequests.get(message.requestId);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingNarrativeRequests.delete(message.requestId);
        if (message.success) {
          pending.resolve(message);
        } else {
          pending.reject(new Error(message.error || 'narrative request failed'));
        }
      }
      return;
    }

    switch (message.type) {
      case 'executionRequest': {
        const { requestId, originalType, originalMessage } = message;
        this.logger.log(`Received executionRequest: ${requestId} (originalType: ${originalType})`);

        // Track this request via base class (with timeout)
        this.trackRequest(requestId, originalType);

        // Forward the original message to the local CodeBolt platform
        super.handleTransportMessage(originalMessage as any);
        break;
      }

      case 'executionNotification': {
        // Unwrap the notification — forward the result (or originalMessage) with the original type
        // so the local server can route it properly (e.g. SendMessage → chat UI)
        const result = message.result || message.originalMessage;
        if (result) {
          const unwrapped = { ...result, type: result.type || message.originalType };
          this.logger.log('Forwarding executionNotification to local:', unwrapped.type);
          super.handleTransportMessage(unwrapped as any);
        } else {
          this.logger.log('Received executionNotification with no result/originalMessage, skipping');
        }
        break;
      }

      default:
        // Forward any other message types to the platform as-is
        this.logger.log('Received plugin message:', message.type);
        super.handleTransportMessage(message as any);
        break;
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
    this.logger.log('onSendPR — requesting unified narrative bundle from in-sandbox plugin');

    if (!this.sandbox) {
      throw new Error('No sandbox available');
    }

    // Ask the plugin (which talks to the in-sandbox unified server) to create a
    // unified bundle of the current workspace's narrative state. The plugin
    // returns a path inside the sandbox; we then download those bytes locally.
    const lastSnapshotId = (this.lastInitVars as any)?.snapshotId as string | undefined;
    if (!lastSnapshotId) {
      throw new Error('No snapshotId available on lastInitVars; cannot export narrative bundle');
    }

    const ack = await this.sendNarrativeRequest('narrativeArchiveExport', {
      snapshotId: lastSnapshotId,
      environmentId: this.state.environmentName,
      workspace: this.sandboxWorkspacePath,
      incremental: false,
    });

    const remoteBundlePath = ack?.bundlePath;
    if (!remoteBundlePath) {
      throw new Error('Plugin did not return a bundlePath in narrativeArchiveExportAck');
    }

    // Download the bundle to a local temp file
    const localTmp = path.join(
      process.env.TMPDIR || '/tmp',
      `e2b-narrative-${Date.now()}.tar.gz`,
    );
    await this.downloadFileFromSandbox(remoteBundlePath, localTmp);

    // Cleanup remote
    try {
      await this.sandbox.commands.run(`rm -f ${remoteBundlePath}`);
    } catch { /* ignore */ }

    // Read back as base64 for transport to parent (preserves existing wire shape)
    const bundleBuffer = await fs.readFile(localTmp);
    const bundleData = bundleBuffer.toString('base64');

    this.logger.log(
      `Narrative bundle exported from sandbox: snapshotId=${ack.snapshotId} bytes=${bundleBuffer.length}`,
    );

    return {
      bundleData,
      bundlePath: localTmp,
      snapshot: { snapshot_id: ack.snapshotId },
      snapshotId: ack.snapshotId,
      baseSnapshotId: ack.baseSnapshotId,
      narrativeSummary: ack.narrativeSummary,
    };
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
    // Try persisted resource ID first, then fall back to initVars.sandboxId
    const existingSandboxId = this.getPersistedResourceId(initVars)
      || (initVars.sandboxId as string | undefined);
    if (existingSandboxId) {
      try {
        const SandboxCls = await getE2bSandbox();
        this.sandbox = await SandboxCls.connect(existingSandboxId);
        this.sandboxId = existingSandboxId;
        this.logger.log('Reconnected to existing sandbox:', existingSandboxId);
      } catch (error) {
        this.logger.warn('Failed to reconnect to sandbox:', existingSandboxId, '- creating new one');
        await this.onEnvironmentRecoveryFailed(existingSandboxId);
        this.sandbox = null;
      }
    }

    if (!this.sandbox) {
      const createParams: any = {
        timeoutMs: this.providerConfig.autoStopInterval
          ? this.providerConfig.autoStopInterval * 1000
          : 60 * 60 * 1000,
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

    // Persist sandbox ID for recovery across restarts
    if (this.sandboxId) {
      this.setEnvironmentResourceId(this.sandboxId);
    }

    // Dev-mode installer: replicate template setup steps at runtime so we can
    // iterate on plugin/server code without rebuilding the e2b template image.
    // Controlled by env vars (all optional):
    //   CODEBOLT_DEV_INSTALL_CODEBOLT=1     → npm install -g codebolt (or @latest)
    //   CODEBOLT_DEV_SERVER_TARBALL=<path>  → upload local codebolt tarball + npm install -g it
    //   CODEBOLT_DEV_PLUGIN_DIR=<path>      → upload local plugin (package.json + dist/) to ~/.codebolt/plugins/<name>
    if (this.sandbox) {
      try {
        await this.installLocalDevArtifacts();
      } catch (err: any) {
        this.logger.error('Dev artifact install failed:', err?.message ?? err);
        throw err;
      }
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

    // NOTE: snapshot/archive materialization is intentionally NOT done here.
    // The in-sandbox remote-execution-plugin handles workspace + git + narrative
    // state via narrative.importUnifiedBundle (see narrativeArchiveImport flow
    // in onProviderStart). Extracting the archive here would bypass that path
    // and silently mask import failures.
    if (this.sandbox) {
      await this.sandbox.commands.run(`mkdir -p ${this.sandboxWorkspacePath}`);
    }

    // Upload essential .codebolt config files to the sandbox so the
    // ExecutionGateway can proxy requests (LLM, git, fs) back to local.
    if (this.sandbox && this.baseProjectPath) {
      const codeboltDir = path.join(this.baseProjectPath, '.codebolt');
      const sandboxCodeboltDir = `${this.sandboxWorkspacePath}/.codebolt`;
      await this.sandbox.commands.run(`mkdir -p ${sandboxCodeboltDir}`);

      // List of project-level config files to upload
      const configFiles = ['proxyExecution.json', 'projectState.json', 'gateway-thread-map.json'];
      for (const fileName of configFiles) {
        try {
          const content = await fs.readFile(path.join(codeboltDir, fileName), 'utf-8');
          await this.sandbox.files.write(`${sandboxCodeboltDir}/${fileName}`, content);
          this.logger.log(`Uploaded .codebolt/${fileName} to sandbox`);
        } catch {
          // File doesn't exist locally — skip
        }
      }

      // Upload global ~/.codebolt/settings.json (LLM keys, user prefs) to sandbox
      const globalCodeboltDir = path.join(process.env.HOME || '/tmp', '.codebolt');
      const globalSettingsPath = path.join(globalCodeboltDir, 'settings.json');
      try {
        const settingsContent = await fs.readFile(globalSettingsPath, 'utf-8');
        await this.sandbox.commands.run('mkdir -p /home/user/.codebolt');
        await this.sandbox.files.write('/home/user/.codebolt/settings.json', settingsContent);
        this.logger.log('Uploaded global settings.json to sandbox');
      } catch {
        this.logger.log('No global settings.json found at:', globalSettingsPath);
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

  /**
   * Ensure CodeBolt with remote-execution-plugin is running in the sandbox.
   * Overrides BaseProvider.ensureAgentServer().
   */
  protected async ensureAgentServer(): Promise<void> {
    if (!this.sandbox) {
      this.logger.log('Sandbox not available yet, deferring CodeBolt startup');
      return;
    }

    const port = this.providerConfig.pluginPort!;

    // Check if plugin WS server is already running (TCP port check)
    try {
      const check = await this.sandbox.commands.run(
        `(echo > /dev/tcp/localhost/${port}) 2>/dev/null && echo OPEN || echo CLOSED`,
      );
      if (check.stdout?.includes('OPEN')) {
        this.logger.log('remote-execution-plugin already running in sandbox');
        return;
      }
    } catch {
      // Not running, need to start
    }

    await this.startCodeBoltInSandbox();
  }

  protected async beforeClose(): Promise<void> {
    try {
      this.logger.log('Received close signal, initiating cleanup...');
      await this.stopCodeBoltInSandbox();
    } catch (error) {
      this.logger.error('Error during beforeClose cleanup:', error);
    }
  }

  // --- CodeBolt + Plugin management in sandbox ---

  /**
   * Start CodeBolt in the sandbox.
   * The sandbox template should have codebolt + remote-execution-plugin pre-installed.
   * This just starts the codebolt process which auto-discovers and starts the plugin.
   */
  private async startCodeBoltInSandbox(): Promise<void> {
    if (!this.sandbox) {
      throw new Error('Cannot start CodeBolt: sandbox not available');
    }

    const port = this.providerConfig.pluginPort!;

    // Find codebolt binary — check known paths directly (PATH may be broken after archive extraction)
    const verifyResult = await this.sandbox.commands.run(
      'for p in /usr/local/bin/codebolt /usr/bin/codebolt; do test -f "$p" && echo "$p" && exit 0; done; which codebolt 2>/dev/null || echo "NOT_FOUND"',
    );
    let codeboltBin = verifyResult.stdout?.trim() || 'NOT_FOUND';
    this.logger.log('CodeBolt binary search result:', codeboltBin);

    if (codeboltBin === 'NOT_FOUND') {
      // codebolt not pre-installed (no template or outdated template) — install at runtime as fallback
      this.logger.log('CodeBolt not found in sandbox, installing at runtime...');
      const installResult = await this.sandbox.commands.run(
        'npm install -g --ignore-scripts codebolt@1.12.14',
        { user: 'root', timeoutMs: 300_000 },
      );
      if (installResult.exitCode !== 0) {
        throw new Error(`Failed to install codebolt in sandbox: ${installResult.stderr}`);
      }
      this.logger.log('CodeBolt installed in sandbox');

      // Re-resolve after install
      const resolvedPath = await this.sandbox.commands.run(
        'for p in /usr/local/bin/codebolt /usr/bin/codebolt; do test -f "$p" && echo "$p" && exit 0; done; echo "/usr/local/bin/codebolt"',
      );
      codeboltBin = resolvedPath.stdout?.trim() || '/usr/local/bin/codebolt';

      // Plugin won't be in the template either — download from API
      await this.ensurePluginInstalled(codeboltBin);

      // Re-apply local dev plugin overrides — npm install -g codebolt may have
      // overwritten the builtin plugin dir we populated earlier in installLocalDevArtifacts.
      try {
        await this.installLocalDevArtifacts();
      } catch (err: any) {
        this.logger.error('Re-applying local dev artifacts failed:', err?.message ?? err);
      }
    }

    this.logger.log('Using codebolt binary:', codeboltBin);

    // Ensure .codebolt dir is owned by user (may have been touched by root during install)
    await this.sandbox.commands.run('chown -R user:user /home/user/.codebolt 2>/dev/null || true', { user: 'root' });

    // Override startCmd with the resolved path
    const finalStartCmd = this.providerConfig.codeboltStartCommand
      || `REMOTE_EXECUTION_PORT=${port} ${codeboltBin} --server --project ${this.sandboxWorkspacePath}`;

    // Track if the process fails immediately (e.g. command not found)
    let startupError: string | null = null;

    this.backgroundCommand = await this.sandbox.commands.run(finalStartCmd, {
      background: true,
      timeoutMs: 24 * 60 * 60 * 1000,
      onStdout: (data: any) => {
        this.logger.log('[sandbox stdout]', data);
      },
      onStderr: (data: any) => {
        const msg = typeof data === 'string' ? data : String(data);
        this.logger.error('[sandbox stderr]', msg);
        if (msg.includes('command not found') || msg.includes('No such file')) {
          startupError = msg;
        }
      },
    });
    this.logger.log('CodeBolt started in sandbox as background process');

    // Give a moment for immediate failures to surface
    await new Promise(resolve => setTimeout(resolve, 2_000));
    if (startupError) {
      throw new Error(`CodeBolt failed to start in sandbox: ${startupError}`);
    }

    // Wait for the plugin WS server to be ready
    await this.waitForPluginReady(port);

    // Build the WebSocket URL using E2B's getHost
    const host = this.sandbox.getHost(port);
    const wsUrl = `wss://${host}`;
    this.agentServer.serverUrl = wsUrl;

    this.logger.log('Plugin WS server accessible at:', wsUrl);
  }

  /**
   * Ensure the remote-execution-plugin is installed in the sandbox.
   * Downloads the plugin from the Codebolt API and extracts it into both
   * the codebolt built-in plugins dir and ~/.codebolt/plugins/.
   */
  private async ensurePluginInstalled(codeboltBin: string): Promise<void> {
    if (!this.sandbox) return;

    const PLUGIN_ID = '@codebolt/remote-execution-plugin';

    // Find the codebolt package root (e.g. /usr/lib/node_modules/codebolt)
    const pkgRootResult = await this.sandbox.commands.run(
      `node -e "console.log(require.resolve('codebolt/package.json').replace('/package.json',''))"  2>/dev/null || dirname $(dirname ${codeboltBin})`,
    );
    const codeboltRoot = pkgRootResult.stdout?.trim() || '/usr/lib/node_modules/codebolt';
    const builtinPluginDir = `${codeboltRoot}/dist/plugins/remote-execution-plugin`;
    const globalPluginDir = '/home/user/.codebolt/plugins/remote-execution-plugin';

    // Check if plugin exists in either location
    const checkResult = await this.sandbox.commands.run(
      `test -f ${builtinPluginDir}/dist/index.js && echo "BUILTIN" || (test -f ${globalPluginDir}/dist/index.js && echo "GLOBAL" || echo "MISSING")`,
    );
    const pluginLocation = checkResult.stdout?.trim();
    this.logger.log('Plugin check result:', pluginLocation);

    if (pluginLocation === 'BUILTIN' || pluginLocation === 'GLOBAL') {
      this.logger.log('remote-execution-plugin already installed at:', pluginLocation);
      return;
    }

    // Download plugin from API
    this.logger.log('Downloading remote-execution-plugin from API...');
    const downloadCmd = [
      `mkdir -p ${builtinPluginDir}/dist ${globalPluginDir}/dist`,
      `PLUGIN_ZIP_URL=$(curl -sf "https://api.codebolt.ai/api/plugins/detailbyuid?unique_id=${encodeURIComponent(PLUGIN_ID)}" | jq -r '.zipFilePath' 2>/dev/null)`,
      `echo "Plugin zip URL: $PLUGIN_ZIP_URL"`,
      `curl -sfL -o /tmp/plugin-dist.zip "$PLUGIN_ZIP_URL"`,
      `unzip -o /tmp/plugin-dist.zip -d ${builtinPluginDir}/`,
      `unzip -o /tmp/plugin-dist.zip -d ${globalPluginDir}/`,
      `rm -f /tmp/plugin-dist.zip`,
    ].join(' && ');

    const downloadResult = await this.sandbox.commands.run(downloadCmd, { user: 'root', timeoutMs: 60_000 });
    if (downloadResult.exitCode !== 0) {
      throw new Error(`Failed to download remote-execution-plugin: ${downloadResult.stderr}`);
    }

    // Fix ownership
    await this.sandbox.commands.run('chown -R user:user /home/user/.codebolt 2>/dev/null || true', { user: 'root' });

    this.logger.log('remote-execution-plugin installed in sandbox');
  }

  private async waitForPluginReady(port: number): Promise<void> {
    const timeout = this.providerConfig.timeouts?.codeboltStartup ?? 120_000;
    const pollInterval = 2_000;
    const startTime = Date.now();

    this.logger.log(`Waiting for plugin WS server on port ${port} (timeout: ${timeout}ms)...`);

    while (Date.now() - startTime < timeout) {
      try {
        // Use TCP port check since the plugin runs a raw WebSocket server
        // (not an HTTP server), so curl/HTTP won't get a 200
        const result = await this.sandbox!.commands.run(
          `(echo > /dev/tcp/localhost/${port}) 2>/dev/null && echo OPEN || echo CLOSED`,
        );
        if (result.stdout?.includes('OPEN')) {
          this.logger.log('Plugin WS server is ready (port is open)');
          return;
        }
      } catch {
        // Not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`CodeBolt plugin WS server failed to start within ${timeout}ms`);
  }

  private async stopCodeBoltInSandbox(): Promise<boolean> {
    if (!this.sandbox) {
      this.logger.log('No sandbox available, skipping CodeBolt stop');
      return true;
    }

    try {
      if (this.backgroundCommand) {
        this.logger.log('Killing CodeBolt background process...');
        await this.backgroundCommand.kill();
        this.backgroundCommand = null;
        this.logger.log('CodeBolt process killed');
      } else {
        // Fallback: kill by port
        this.logger.log('Stopping CodeBolt by killing process on port...');
        await this.sandbox.commands.run(
          `kill $(lsof -t -i:${this.providerConfig.pluginPort}) 2>/dev/null || true`,
        );
      }
    } catch (error) {
      this.logger.warn('Error stopping CodeBolt in sandbox:', error);
    }

    this.agentServer.process = null;
    return true;
  }

  // --- Transport connection to plugin WS server ---

  /**
   * Connect to the remote-execution-plugin's WebSocket server as a provider client.
   * The plugin does not send a "registered" handshake — connection itself means ready.
   */
  async ensureTransportConnection(initVars: ProviderInitVars): Promise<void> {
    if (this.agentServer.wsConnection && this.agentServer.isConnected) {
      return;
    }

    const url = this.buildWebSocketUrl(initVars);
    this.logger.log('Connecting to plugin WS server:', url);

    await new Promise<void>((resolve, reject) => {
      const wsOptions: any = {
        followRedirects: true,
        maxRedirects: 5,
        headers: {} as Record<string, string>,
        perMessageDeflate: {
          zlibDeflateOptions: { level: 6 },
          threshold: 1024,
        },
        maxPayload: 0,
      };

      const ws = new WebSocket(url, wsOptions);

      const connectionTimeout = setTimeout(() => {
        ws.close();
        reject(new Error('Plugin WS connection timeout'));
      }, this.config.wsRegistrationTimeout);

      ws.on('open', () => {
        clearTimeout(connectionTimeout);
        this.agentServer.wsConnection = ws;
        this.agentServer.isConnected = true;
        this.agentServer.metadata = { connectedAt: Date.now() };
        this.logger.log('Connected to plugin WS server');
        resolve();
      });

      ws.on('message', (data: any) => {
        try {
          const message = JSON.parse(data.toString());
          this.handlePluginMessage(message);
        } catch (error) {
          this.logger.error('Failed to parse plugin WS message', error);
        }
      });

      ws.on('unexpected-response', (_req: any, res: any) => {
        let body = '';
        res.on('data', (chunk: any) => { body += chunk; });
        res.on('end', () => {
          this.logger.error(
            `Plugin WS upgrade rejected: ${res.statusCode}`,
            'headers:', JSON.stringify(res.headers),
            'body:', body,
          );
          clearTimeout(connectionTimeout);
          this.agentServer.isConnected = false;
          this.agentServer.wsConnection = null;
          reject(new Error(`Plugin WS upgrade rejected with status ${res.statusCode}: ${body}`));
        });
      });

      ws.on('error', (error: any) => {
        clearTimeout(connectionTimeout);
        this.agentServer.isConnected = false;
        this.agentServer.wsConnection = null;
        this.agentServer.metadata = { lastError: error };
        this.logger.error('Plugin WS error:', error.message || error);
        reject(error);
      });

      ws.on('close', () => {
        clearTimeout(connectionTimeout);
        this.stopWsPing();
        const wasConnected = this.agentServer.isConnected;
        this.agentServer.isConnected = false;
        this.agentServer.wsConnection = null;
        this.agentServer.metadata = { closedAt: Date.now() };
        this.logger.log('Plugin WS connection closed');

        if (wasConnected) {
          // Use base class exponential backoff reconnect
          this.scheduleReconnect();
        } else {
          reject(new Error('Plugin WS closed before connection established'));
        }
      });
    });

    // Start keepalive ping (base class)
    this.startWsPing();
  }

  /**
   * Pre-reconnect hook: check if sandbox plugin port is still open.
   * If not, restart CodeBolt in the sandbox before attempting WS reconnect.
   */
  protected async onReconnectAttempt(): Promise<void> {
    if (!this.sandbox) return;

    let portOpen = false;
    try {
      const portCheck = await this.sandbox.commands.run(
        `(echo > /dev/tcp/localhost/${this.providerConfig.pluginPort}) 2>/dev/null && echo OPEN || echo CLOSED`,
      );
      portOpen = portCheck.stdout?.includes('OPEN') ?? false;
    } catch {
      portOpen = false;
    }

    if (!portOpen) {
      this.logger.warn('Plugin port not open, attempting to restart CodeBolt...');
      await this.startCodeBoltInSandbox();
    }
  }

  /**
   * Handle orphaned sandbox cleanup when recovery fails.
   */
  protected async onEnvironmentRecoveryFailed(oldResourceId: string): Promise<void> {
    this.logger.warn('Environment recovery failed for sandbox:', oldResourceId, '- attempting cleanup');
    try {
      const SandboxCls = await getE2bSandbox();
      const orphan = await SandboxCls.connect(oldResourceId);
      await orphan.kill();
      this.logger.log('Killed orphaned sandbox:', oldResourceId);
    } catch (error) {
      this.logger.warn('Could not kill orphaned sandbox:', oldResourceId, error);
    }
  }

  /**
   * Check if the sandbox environment is alive by running a simple command.
   */
  protected async checkEnvironmentHealth(): Promise<boolean> {
    if (!this.sandbox) return false;
    try {
      const result = await this.sandbox.commands.run('echo OK', { timeoutMs: 5_000 });
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Build WebSocket URL for connecting to the remote-execution-plugin.
   * Plugin expects `?providerId=xxx` query param.
   */
  protected buildWebSocketUrl(initVars: ProviderInitVars): string {
    const providerId = `e2b-${initVars.environmentName}`;
    return `${this.agentServer.serverUrl}?providerId=${encodeURIComponent(providerId)}`;
  }

  /**
   * Override handleTransportMessage to intercept processStopped for auto-PR.
   */
  protected handleTransportMessage(message: RawMessageForAgent): void {
    try {
      if (message?.type === 'processStoped' || message?.type === 'processStopped') {
        this.logger.log('Agent process stopped, sending PR before forwarding');
        this.sendPROnAgentFinish(message);
        return;
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

      super.handleTransportMessage({
        type: 'remoteProviderEvent',
        action: 'providerSendPRResponse',
        requestId: originalMessage.requestId || '',
        message: prResult,
      } as any);
    } catch (error: any) {
      this.logger.error('Failed to send PR on agent finish:', error);
      super.handleTransportMessage({
        type: 'remoteProviderEvent',
        action: 'providerSendPRResponse',
        requestId: originalMessage.requestId || '',
        error: error instanceof Error ? error.message : 'Failed to send PR on agent finish',
      } as any);
    } finally {
      super.handleTransportMessage(originalMessage);
    }
  }

  async onCloseSignal(): Promise<void> {
    try {
      this.logger.log('Received close signal, initiating cleanup...');
      await this.stopCodeBoltInSandbox();
      await this.teardownEnvironment();
    } catch (error) {
      this.logger.error('Error during onCloseSignal cleanup:', error);
    }
  }
}
