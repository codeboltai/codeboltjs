import * as path from 'path';
import * as fs from 'fs/promises';
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
    responseType: string;
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
      e2bApiKey: config.e2bApiKey ?? process.env.E2B_API_KEY,
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
    this.logger.log('Using E2B sandbox template:', this.providerConfig.sandboxTemplate);

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

    // 4. Import narrative unified bundle into the in-sandbox codebolt server.
    //    The plugin acts as a transparent bridge — it does NOT interpret
    //    narrative messages. The codebolt application in the remote sandbox
    //    owns the narrative engine and performs the import + checkout.
    const narrativeBundlePath = (initVars as any).narrativeBundlePath as string | undefined;
    if (narrativeBundlePath && this.sandbox) {
      try {
        const remoteBundle = await this.uploadFileToSandbox(
          narrativeBundlePath,
          '/tmp/narrative-unified.tar.gz',
        );
        this.logger.log('Sending narrative.importUnifiedBundle via plugin bridge:', remoteBundle);
        const importResp = await this.sendNarrativeRequest('narrative.importUnifiedBundle', {
          bundlePath: remoteBundle,
          environmentId: initVars.environmentName,
          workspace: this.sandboxWorkspacePath,
        });
        this.logger.log(
          `Narrative bundle imported: snapshots=${importResp?.snapshot_ids?.length ?? 0} narrative_imported=${importResp?.narrative_imported}`,
        );

        // Materialize the most recent snapshot's files into the workspace so
        // the remote agent can see them. Without this the workspace is empty
        // on a fresh sandbox — import only populates git refs + SQLite.
        const latestSnapshotId = importResp?.snapshot_ids?.[importResp.snapshot_ids.length - 1];
        if (latestSnapshotId) {
          try {
            const checkout = await this.sendNarrativeRequest('narrative.checkoutSnapshot', {
              snapshotId: latestSnapshotId,
              environmentId: initVars.environmentName,
              workspace: this.sandboxWorkspacePath,
              strategy: { type: 'revert' },
            });
            this.logger.log(
              `Checked out snapshot ${latestSnapshotId} → tree ${checkout?.restored_tree_hash}`,
            );
          } catch (err: any) {
            this.logger.error('narrative.checkoutSnapshot failed:', err?.message ?? err);
          }
        }

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

    // Drop narrative.* messages coming from the local host. Narrative work is
    // owned by the remote codebolt application; the local host is not a
    // participant in this protocol, so any narrative.* message here is either
    // a spurious echo or a loopback from its own handler.
    if (typeof message?.type === 'string' && message.type.startsWith('narrative.')) {
      this.logger.log(`Dropping local narrative message: ${message.type}`);
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
   * Send an executionGateway.reply back to the sandbox codebolt server for a
   * completed execution request. The `/plugins` endpoint delegates to
   * executionGatewayHandler which expects `executionGateway.reply` (the old
   * remote-execution-plugin used to translate from `executionReply` via its
   * plugin SDK wrapper — we now do it directly).
   */
  private sendExecutionReply(requestId: string, result: any): void {
    this.resolveRequest(requestId);
    const ws = this.agentServer.wsConnection;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const reply = JSON.stringify({
        type: 'executionGateway.reply',
        requestId: `reply-${requestId}`,
        replyRequestId: requestId,
        success: !(result && result.error),
        result,
      });
      ws.send(reply);
      this.logger.log('Sent executionGateway.reply for requestId:', requestId);
    } else {
      this.logger.warn('Cannot send executionGateway.reply, WS not open for requestId:', requestId);
    }
  }

  /**
   * Override onRequestTimeout to send error executionGateway.reply back to
   * the sandbox codebolt server.
   */
  protected onRequestTimeout(requestId: string): void {
    this.logger.warn(`Request ${requestId} timed out, sending error reply`);
    this.pendingRequests.delete(requestId);
    const ws = this.agentServer.wsConnection;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'executionGateway.reply',
        requestId: `reply-${requestId}`,
        replyRequestId: requestId,
        success: false,
        result: { error: 'Request timed out' },
      }));
    }
  }

  // --- Narrative bundle round-trip (delegated to in-sandbox plugin) ---

  /**
   * Send a `narrative.*` message through the in-sandbox remote-execution-plugin
   * (which acts as a transparent bridge) to the codebolt application's
   * narrativePluginHandler. Awaits the corresponding `narrative.*Response`.
   *
   * The plugin does NOT interpret these messages — all narrative work is done
   * by the codebolt application in the remote sandbox.
   */
  private sendNarrativeRequest(
    type: string,
    payload: Record<string, any>,
    timeoutMs: number = 120_000,
  ): Promise<any> {
    const ws = this.agentServer.wsConnection;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Plugin WS not connected; cannot send narrative request'));
    }
    const responseType = `${type}Response`;
    const requestId = `narr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingNarrativeRequests.delete(requestId);
        reject(new Error(`Narrative request ${type} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pendingNarrativeRequests.set(requestId, { resolve, reject, timeout, responseType });
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
    // Narrative response — resolve any pending narrative request whose
    // expected responseType matches. The message comes straight from the
    // codebolt application (bridged through the plugin).
    if (typeof message?.type === 'string' && message.type.startsWith('narrative.')) {
      if (message.type.endsWith('Response') && message.requestId) {
        const pending = this.pendingNarrativeRequests.get(message.requestId);
        if (pending && pending.responseType === message.type) {
          clearTimeout(pending.timeout);
          this.pendingNarrativeRequests.delete(message.requestId);
          if (message.success) {
            pending.resolve(message);
          } else {
            pending.reject(new Error(message.error || 'narrative request failed'));
          }
          return;
        }
      }
      // Swallow any unmatched narrative.* message — never forward it to the
      // local host, which would misinterpret narrative.*Response as a request
      // and loop it back as narrative.errorResponse.
      this.logger.log(`Ignoring unmatched narrative message: ${message.type}`);
      return;
    }

    switch (message.type) {
      // `executionRequest` is the shape the old remote-execution-plugin
      // forwarded through its own WS server. The server's
      // executionGatewayHandler now sends us `executionGateway.request`
      // directly on the /plugins socket, so we accept both.
      case 'executionRequest':
      case 'executionGateway.request': {
        const { requestId, originalType, originalMessage } = message;
        this.logger.log(`Received ${message.type}: ${requestId} (originalType: ${originalType})`);

        // Track this request via base class (with timeout)
        this.trackRequest(requestId, originalType);

        // Forward the original message to the local CodeBolt platform
        super.handleTransportMessage(originalMessage as any);
        break;
      }

      // Same story for notifications — old wrapper sent `executionNotification`,
      // server-direct sends `executionGateway.notification`.
      case 'executionNotification':
      case 'executionGateway.notification': {
        // Unwrap the notification — forward the result (or originalMessage) with the original type
        // so the local server can route it properly (e.g. SendMessage → chat UI)
        const result = message.result || message.originalMessage;
        if (result) {
          const unwrapped = { ...result, type: result.type || message.originalType };
          this.logger.log(`Forwarding ${message.type} to local:`, unwrapped.type);
          super.handleTransportMessage(unwrapped as any);
        } else {
          this.logger.log(`Received ${message.type} with no result/originalMessage, skipping`);
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

  // In-flight dedupe guard for onSendPR. Without this, the manual
  // `providerSendPR` from the framework AND the auto `sendPROnAgentFinish`
  // (triggered by processStopped) can both fire for the same agent finish,
  // each producing a ReviewMergeRequest on the local server. Returning the
  // same in-flight promise collapses concurrent calls into one.
  private inFlightSendPR: Promise<any> | null = null;

  async onSendPR(): Promise<any> {
    if (this.inFlightSendPR) {
      this.logger.log('onSendPR — coalescing with in-flight request');
      return this.inFlightSendPR;
    }
    this.inFlightSendPR = this.doSendPR().finally(() => {
      this.inFlightSendPR = null;
    });
    return this.inFlightSendPR;
  }

  private async doSendPR(): Promise<any> {
    this.logger.log('onSendPR — requesting unified narrative bundle from in-sandbox codebolt');

    if (!this.sandbox) {
      throw new Error('No sandbox available');
    }

    // Ask the in-sandbox codebolt application (bridged through the plugin) to
    // snapshot the CURRENT workspace state and export a unified bundle. The
    // plugin is a pure bridge — it does not interpret narrative messages.
    const snap = await this.sendNarrativeRequest('narrative.createSnapshot', {
      environmentId: this.state.environmentName,
      workspace: this.sandboxWorkspacePath,
      description: 'pre-export snapshot of current workspace',
    });
    const snapshotIdToExport = snap?.snapshot_id
      ?? (this.lastInitVars as any)?.snapshotId;
    if (!snapshotIdToExport) {
      throw new Error('No snapshotId available to export narrative bundle');
    }

    const ack = await this.sendNarrativeRequest('narrative.exportUnifiedBundle', {
      snapshotId: snapshotIdToExport,
      environmentId: this.state.environmentName,
      workspace: this.sandboxWorkspacePath,
      incremental: false,
    });

    const remoteBundlePath = ack?.bundlePath;
    if (!remoteBundlePath) {
      throw new Error('codebolt did not return a bundlePath in narrative.exportUnifiedBundleResponse');
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

      if (initVars.envVars && typeof initVars.envVars === 'object') {
        createParams.envs = initVars.envVars as Record<string, string>;
      }

      const SandboxCls = await getE2bSandbox();
      // E2B SDK v2: template is a positional arg, NOT an opts field.
      this.sandbox = this.providerConfig.sandboxTemplate
        ? await SandboxCls.create(this.providerConfig.sandboxTemplate, createParams)
        : await SandboxCls.create(createParams);
      this.sandboxId = this.sandbox.sandboxId || null;
      this.logger.log('Created new E2B sandbox:', this.sandboxId);
    }

    // Persist sandbox ID for recovery across restarts
    if (this.sandboxId) {
      this.setEnvironmentResourceId(this.sandboxId);
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
      throw new Error(
        'codebolt binary not found in sandbox. The e2b template must have codebolt + remote-execution-plugin pre-installed (see providers/e2b/e2b-template/build-template.ts).',
      );
    }

    this.logger.log('Using codebolt binary:', codeboltBin);

    // Ensure .codebolt dir is owned by user (may have been touched by root during install)
    await this.sandbox.commands.run('chown -R user:user /home/user/.codebolt 2>/dev/null || true', { user: 'root' });

    // Override startCmd with the resolved path.
    // We pass --port ${port} so the codebolt HTTP/WS server binds to the port
    // the provider will connect to for the /plugins endpoint.
    const finalStartCmd = this.providerConfig.codeboltStartCommand
      || `${codeboltBin} --server --port ${port} --project ${this.sandboxWorkspacePath}`;

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

    // Timeout — dump diagnostics from inside the sandbox before throwing
    try {
      this.logger.error(`[waitForPluginReady] Timeout reached. Collecting diagnostics from sandbox...`);

      const diagCmds: Array<{ label: string; cmd: string }> = [
        { label: 'listening sockets', cmd: `ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null || true` },
        { label: `port ${port} check`, cmd: `(echo > /dev/tcp/localhost/${port}) 2>/dev/null && echo OPEN || echo CLOSED` },
        { label: 'plugin process', cmd: `ps -ef | grep -i remote-execution-plugin | grep -v grep || echo '<no plugin process>'` },
        { label: 'all node processes', cmd: `ps -ef | grep -i node | grep -v grep || true` },
        { label: 'plugin dir (global)', cmd: `ls -la /usr/lib/node_modules/codebolt/dist/plugins/remote-execution-plugin 2>/dev/null || echo '<missing>'` },
        { label: 'plugin ws dep (global)', cmd: `ls /usr/lib/node_modules/codebolt/dist/plugins/remote-execution-plugin/node_modules/ws 2>/dev/null || echo '<ws missing in global plugin>'` },
        { label: 'plugin dir (user)', cmd: `ls -la /home/user/.codebolt/plugins/remote-execution-plugin 2>/dev/null || echo '<missing>'` },
        { label: 'plugin ws dep (user)', cmd: `ls /home/user/.codebolt/plugins/remote-execution-plugin/node_modules/ws 2>/dev/null || echo '<ws missing in user plugin>'` },
        { label: 'codebolt log tail', cmd: `tail -n 200 /home/user/.codebolt/logs/*.log 2>/dev/null || echo '<no codebolt logs>'` },
        { label: 'plugin log tail', cmd: `tail -n 200 /home/user/.codebolt/plugins/remote-execution-plugin/*.log 2>/dev/null || echo '<no plugin logs>'` },
        { label: 'plugin trace file', cmd: `cat /tmp/remote-execution-plugin.trace.log 2>/dev/null || echo '<no trace file — onStart never reached fs.appendFileSync OR plugin not running this build>'` },
      ];

      for (const { label, cmd } of diagCmds) {
        try {
          const r = await this.sandbox!.commands.run(cmd);
          this.logger.error(`[waitForPluginReady][${label}]\n${r.stdout ?? ''}${r.stderr ? `\nSTDERR: ${r.stderr}` : ''}`);
        } catch (e: any) {
          this.logger.error(`[waitForPluginReady][${label}] command failed: ${e?.message ?? e}`);
        }
      }
    } catch (e: any) {
      this.logger.error(`[waitForPluginReady] diagnostics collection failed: ${e?.message ?? e}`);
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
        this.logger.log('Connected to codebolt /plugins endpoint');
        // The /plugins endpoint auto-claims the ExecutionGateway on connect,
        // so we do NOT need to send executionGateway.claim/subscribe here.
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
    // Connect directly to the sandbox codebolt server's /plugins endpoint.
    // This replaces the previous hop through the remote-execution-plugin WS
    // server — the codebolt server now performs the bridging internally.
    return `${this.agentServer.serverUrl}/plugins?providerId=${encodeURIComponent(providerId)}`;
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
