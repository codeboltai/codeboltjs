import WebSocket from "ws";
import codebolt from "@codebolt/codeboltjs";
import {
  AgentServerConnection,
  BaseProviderConfig,
  PendingRequest,
  ProviderEventHandlers,
  ProviderLifecycleHandlers,
  ProviderStartResult,
  ProviderState,
  ProviderTransport,

} from "./ProviderTypes";
import { ProviderInitVars } from "@codebolt/types/provider";

import { AgentStartMessage, RawMessageForAgent } from "@codebolt/types/provider";

// Heartbeat configuration
const HEARTBEAT_INTERVAL = 10_000; // 10 seconds
const ENVIRONMENT_HEARTBEAT_INTERVAL = 15_000; // 15 seconds

/**
 * BaseProvider encapsulates shared functionality for environment providers.
 * Concrete providers can extend this class and override protected methods
 * to customize setup logic or communication transport.
 */
export abstract class BaseProvider
  implements ProviderLifecycleHandlers, ProviderTransport {
  protected readonly config: BaseProviderConfig;
  protected state: ProviderState & {
    providerId?: string;
    environmentId?: string;
    startTime?: number;
    connectedEnvironments?: string[];
  };
  protected agentServer: AgentServerConnection;

  // Heartbeat tracking
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private environmentHeartbeatInterval: NodeJS.Timeout | null = null;

  // Phase 1: Pending message queue
  private pendingMessages: Array<RawMessageForAgent | AgentStartMessage> = [];

  // Phase 2: WS Reconnect with exponential backoff
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  protected lastInitVars: ProviderInitVars | null = null;

  // Phase 3: WS Keepalive (ping/pong)
  private wsPingInterval: NodeJS.Timeout | null = null;

  // Phase 4: Request timeouts
  protected pendingRequests: Map<string, PendingRequest> = new Map();

  constructor(config?: Partial<BaseProviderConfig>) {
    this.config = {
      agentServerPort: 3001,
      agentServerHost: "localhost",
      reconnectAttempts: 10,
      reconnectDelay: 1_000,
      wsRegistrationTimeout: 10_000,
      transport: "websocket",
      maxReconnectAttempts: 10,
      maxReconnectDelay: 30_000,
      wsKeepaliveInterval: 20_000,
      requestTimeout: 120_000,
      ...config,
    } as BaseProviderConfig;

    this.state = {
      initialized: false,
      environmentName: null,
      projectPath: null,
      workspacePath: null,
      providerId: undefined,
      environmentId: undefined,
      startTime: undefined,
      connectedEnvironments: [],
    };

    this.agentServer = {
      serverUrl: this.buildAgentServerUrl(),
      wsConnection: null,
      isConnected: false,
      metadata: {},
      process: null,
    };
  }

  /**
   * Entry point called by the platform when a provider is started.
   * Subclasses should override {@link setupEnvironment} and
   * {@link afterConnected} for custom logic rather than overriding this method.
   */
  async onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult> {
    this.resetState();
    this.state.environmentName = initVars.environmentName;
    this.lastInitVars = initVars;

    // Store merge config from init vars or environment config
    if (initVars.mergeConfig) {
      this.state.mergeConfig = initVars.mergeConfig;
    } else {
      // Try reading from ENVIRONMENT_CONFIG env var (set by server when spawning provider)
      try {
        const envConfig = process.env.ENVIRONMENT_CONFIG;
        if (envConfig) {
          const parsed = JSON.parse(envConfig);
          if (parsed.mergeConfig) {
            this.state.mergeConfig = parsed.mergeConfig;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    await this.resolveProjectContext(initVars);
    this.state.workspacePath = await this.resolveWorkspacePath(initVars);

    await this.ensureAgentServer();
    await this.setupEnvironment(initVars);
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

    return startResult;
  }

  /**
   * Called after {@link onProviderStart} completes to begin the agent loop.
   * Default implementation forwards the message to the agent server through
   * {@link sendToAgentServer}. If WS is not connected, queues the message.
   */
  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    if (!this.agentServer.isConnected) {
      this.pendingMessages.push(agentMessage);
      return;
    }

    const success = await this.sendToAgentServer(agentMessage);
    if (!success) {
      throw new Error("Failed to forward agent start message to agent server");
    }
  }

  /**
   * Provider stop handler - stops the provider and cleans up resources
   */
  async onProviderStop(initVars: ProviderInitVars): Promise<void> {
    this.resetState();
    this.state.environmentName = initVars.environmentName;

    try {
      await this.beforeClose();
    } finally {
      await this.disconnectTransport();
      await this.teardownEnvironmentWithTimeout();
      this.state.initialized = false;
    }
  }

  /**
   * Get diff files handler - returns diff information for changed files
   * Must be implemented by subclasses.
   */
  abstract onGetDiffFiles(): Promise<any>;

  /**
   * Graceful shutdown and cleanup entry point.
   */
  async onCloseSignal(): Promise<void> {
    try {
      await this.beforeClose();
    } finally {
      await this.disconnectTransport();
      await this.teardownEnvironmentWithTimeout();
      this.state.initialized = false;
    }
  }

  /**
   * Handle raw incoming messages from the platform. Default behavior is to
   * forward the payload to the agent server transport. If not connected, queues the message.
   */
  async onRawMessage(message: RawMessageForAgent): Promise<void> {
    if (!this.agentServer.isConnected || !this.agentServer.wsConnection) {
      this.pendingMessages.push(message);
      return;
    }

    const success = await this.sendToAgentServer(message);
    if (!success) {
      throw new Error("Failed to forward message to agent server");
    }
  }

  /**
   * Returns provider lifecycle event handlers that can be used by the host
   * application to register callbacks in a consistent way.
   */
  getEventHandlers(): ProviderEventHandlers {
    return {
      onProviderStart: (vars) => this.onProviderStart(vars),
      onProviderAgentStart: (msg) => this.onProviderAgentStart(msg),
      onProviderStop: (vars) => this.onProviderStop(vars),
      onGetDiffFiles: () => this.onGetDiffFiles(),
      onCloseSignal: () => this.onCloseSignal(),
      onRawMessage: (msg) => this.onRawMessage(msg),
    };
  }

  /**
   * Transport: establish connection to agent server.
   */
  async ensureTransportConnection(initVars: ProviderInitVars): Promise<void> {
    if (this.config.transport === "websocket") {
      await this.connectWebSocket(initVars);
    }
  }

  /**
   * Transport: disconnect from agent server.
   */
  protected async disconnectTransport(): Promise<void> {
    this.cancelReconnect();
    this.stopWsPing();
    this.clearAllPendingRequests();

    if (this.agentServer.wsConnection) {
      try {
        this.agentServer.wsConnection.close();
      } catch (error) {
        // console.warn("[BaseProvider] Error closing WebSocket", error);
      }
      this.agentServer.metadata = {};
      this.agentServer.wsConnection = null;
      this.agentServer.isConnected = false;
    }
  }

  /**
   * Helper to send messages to the agent server.
   * If WS is not connected, queues the message and returns true.
   */
  async sendToAgentServer(message: RawMessageForAgent | AgentStartMessage): Promise<boolean> {
    if (!this.agentServer.wsConnection || !this.agentServer.isConnected) {
      this.pendingMessages.push(message);
      return true;
    }

    try {
      const json = JSON.stringify({
        ...message,
        timestamp: message.timestamp ?? Date.now(),
      });
      this.agentServer.wsConnection.send(json);
      return true;
    } catch (error) {
      this.agentServer.metadata = { lastSendError: error };
      // console.error("[BaseProvider] Failed to send message to agent server", error);
      return false;
    }
  }

  /**
   * Optional hook: execute custom logic before closing.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async beforeClose(): Promise<void> { }

  /**
   * Get the merge configuration for this provider's environment.
   * Returns undefined if no merge config was provided.
   */
  getMergeConfig() {
    return this.state.mergeConfig;
  }

  // ===== PHASE 1: PENDING MESSAGE QUEUE =====

  /**
   * Flush all queued messages to the agent server.
   * Called automatically after WS connection is established.
   */
  protected async flushPendingMessages(): Promise<void> {
    if (this.pendingMessages.length === 0) return;
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];
    for (const msg of messages) {
      try {
        if (this.agentServer.wsConnection && this.agentServer.isConnected) {
          const json = JSON.stringify({
            ...msg,
            timestamp: (msg as any).timestamp ?? Date.now(),
          });
          this.agentServer.wsConnection.send(json);
        }
      } catch (error) {
        // console.error("[BaseProvider] Error flushing pending message:", error);
      }
    }
  }

  /**
   * Clear all pending messages without sending them.
   */
  protected clearPendingMessages(): void {
    this.pendingMessages = [];
  }

  // ===== PHASE 2: WS RECONNECT WITH EXPONENTIAL BACKOFF =====

  /**
   * Schedule a reconnect attempt with exponential backoff.
   */
  protected scheduleReconnect(): void {
    const maxAttempts = this.config.maxReconnectAttempts ?? 10;
    if (this.reconnectAttempts >= maxAttempts) {
      // console.error(`[BaseProvider] Max reconnect attempts (${maxAttempts}) reached, giving up`);
      return;
    }

    const maxDelay = this.config.maxReconnectDelay ?? 30_000;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), maxDelay);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(async () => {
      await this.attemptReconnect();
    }, delay);
  }

  /**
   * Attempt to reconnect to the agent server.
   */
  protected async attemptReconnect(): Promise<void> {
    try {
      if (this.agentServer.isConnected) return;
      if (!this.state.environmentName) return;

      await this.onReconnectAttempt();

      const initVars = this.lastInitVars || {
        environmentName: this.state.environmentName,
        projectPath: this.state.projectPath ?? undefined,
      } as any;

      await this.ensureTransportConnection(initVars);
      await this.flushPendingMessages();
    } catch (error) {
      // console.error("[BaseProvider] Reconnect failed:", error);
      this.scheduleReconnect();
    }
  }

  /**
   * Cancel any pending reconnect timer.
   */
  protected cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Hook called before each reconnect attempt. Subclasses can override
   * to perform pre-reconnect checks (e.g., verify sandbox is alive).
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async onReconnectAttempt(): Promise<void> { }

  // ===== PHASE 3: WS KEEPALIVE (PING/PONG) =====

  /**
   * Start sending WS ping frames at the configured interval.
   */
  protected startWsPing(): void {
    this.stopWsPing();
    const interval = this.config.wsKeepaliveInterval ?? 20_000;
    this.wsPingInterval = setInterval(() => {
      const ws = this.agentServer.wsConnection;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, interval);
  }

  /**
   * Stop sending WS ping frames.
   */
  protected stopWsPing(): void {
    if (this.wsPingInterval) {
      clearInterval(this.wsPingInterval);
      this.wsPingInterval = null;
    }
  }

  // ===== PHASE 4: REQUEST TIMEOUTS =====

  /**
   * Track a pending request with an automatic timeout.
   */
  protected trackRequest(requestId: string, type: string): void {
    const timeout = this.config.requestTimeout ?? 120_000;
    const timeoutHandle = setTimeout(() => {
      this.onRequestTimeout(requestId);
    }, timeout);

    this.pendingRequests.set(requestId, {
      requestId,
      type,
      timestamp: Date.now(),
      timeoutHandle,
    });
  }

  /**
   * Resolve a pending request (remove from tracking, clear timeout).
   * Returns the entry if found, undefined otherwise.
   */
  protected resolveRequest(requestId: string): PendingRequest | undefined {
    const entry = this.pendingRequests.get(requestId);
    if (entry) {
      clearTimeout(entry.timeoutHandle);
      this.pendingRequests.delete(requestId);
    }
    return entry;
  }

  /**
   * Called when a tracked request times out. Default logs a warning.
   * Subclasses can override to send error responses.
   */
  protected onRequestTimeout(requestId: string): void {
    // console.warn(`[BaseProvider] Request ${requestId} timed out`);
    this.pendingRequests.delete(requestId);
  }

  /**
   * Clear all pending request timeout handles.
   */
  private clearAllPendingRequests(): void {
    for (const [, entry] of this.pendingRequests) {
      clearTimeout(entry.timeoutHandle);
    }
    this.pendingRequests.clear();
  }

  // ===== PHASE 5: ENVIRONMENT ID PERSISTENCE & ORPHAN PREVENTION =====

  /**
   * Set the environment resource ID (sandbox ID, worktree path, container ID, etc.)
   * and persist it to the server.
   */
  protected setEnvironmentResourceId(id: string): void {
    this.state.environmentResourceId = id;

    if (codebolt.ready) {
      try {
        (codebolt as any).sendMessage?.({
          type: 'setResourceId',
          resourceId: id,
          providerId: this.state.providerId || this.state.environmentName || 'unknown',
          environmentId: this.state.environmentId || this.state.environmentName || 'unknown',
        });
      } catch {
        // Server may not support this message yet
      }
    }
  }

  /**
   * Get a persisted resource ID from initVars (passed by server on spawn).
   */
  protected getPersistedResourceId(initVars: ProviderInitVars): string | undefined {
    return (initVars as any).resourceId as string | undefined;
  }

  /**
   * Wrap teardownEnvironment() with a timeout using config.timeouts.cleanup.
   */
  protected async teardownEnvironmentWithTimeout(): Promise<void> {
    const timeout = this.config.timeouts?.cleanup ?? 15_000;
    try {
      await Promise.race([
        this.teardownEnvironment(),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Teardown timed out')), timeout)
        ),
      ]);
    } catch (error) {
      // console.warn("[BaseProvider] Teardown timed out or failed:", error);
    }
  }

  /**
   * Hook called when environment recovery fails (e.g., can't reconnect to
   * existing sandbox). Subclasses can override to clean up orphaned resources.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async onEnvironmentRecoveryFailed(_oldResourceId: string): Promise<void> { }

  // ===== PHASE 6: ENVIRONMENT HEALTH CHECK =====

  /**
   * Check if the environment is alive. Default returns true.
   * Subclasses can override for actual health verification.
   */
  protected async checkEnvironmentHealth(): Promise<boolean> {
    return true;
  }

  // ===== HEARTBEAT METHODS =====

  /**
   * Start sending provider heartbeats at regular intervals.
   * Called automatically after connection is established.
   */
  protected startHeartbeat(): void {
    if (this.heartbeatInterval) {
      return; // Already running
    }

    this.state.startTime = Date.now();

    // Send initial heartbeat
    this.sendProviderHeartbeat();

    // Set up interval
    this.heartbeatInterval = setInterval(() => {
      this.sendProviderHeartbeat();
    }, HEARTBEAT_INTERVAL);

    // console.log('[BaseProvider] Heartbeat monitoring started');
  }

  /**
   * Stop sending provider heartbeats.
   */
  protected stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      // console.log('[BaseProvider] Heartbeat monitoring stopped');
    }
    if (this.environmentHeartbeatInterval) {
      clearInterval(this.environmentHeartbeatInterval);
      this.environmentHeartbeatInterval = null;
      // console.log('[BaseProvider] Environment heartbeat monitoring stopped');
    }
  }

  /**
   * Send a provider heartbeat to the main application.
   */
  protected sendProviderHeartbeat(): void {
    if (!codebolt.ready) {
      // console.warn('[BaseProvider] Cannot send heartbeat - Codebolt not ready');
      return;
    }

    const uptime = this.state.startTime
      ? Math.floor((Date.now() - this.state.startTime) / 1000)
      : 0;

    try {
      // Cast to any since heartbeat methods may not be exported in types yet
      (codebolt as any).sendProviderHeartbeat({
        providerId: this.state.providerId || this.state.environmentName || 'unknown',
        status: this.getProviderHealthStatus(),
        connectedEnvironments: this.state.connectedEnvironments || [],
        uptime,
        metadata: {
          transport: this.config.transport,
          initialized: this.state.initialized,
        },
      });
    } catch (error) {
      // console.error('[BaseProvider] Failed to send provider heartbeat:', error);
    }
  }

  /**
   * Start environment-specific heartbeat monitoring.
   * Subclasses can override to implement custom environment health checks.
   */
  protected startEnvironmentHeartbeat(environmentId: string): void {
    if (this.environmentHeartbeatInterval) {
      return; // Already running
    }

    this.state.environmentId = environmentId;

    this.environmentHeartbeatInterval = setInterval(() => {
      this.sendEnvironmentHeartbeat(environmentId);
    }, ENVIRONMENT_HEARTBEAT_INTERVAL);

    // console.log(`[BaseProvider] Environment heartbeat started for: ${environmentId}`);
  }

  /**
   * Send an environment heartbeat to the main application.
   * Includes environment health check result.
   */
  protected async sendEnvironmentHeartbeat(environmentId: string): Promise<void> {
    if (!codebolt.ready) {
      // console.warn('[BaseProvider] Cannot send environment heartbeat - Codebolt not ready');
      return;
    }

    let environmentAlive = true;
    try {
      environmentAlive = await this.checkEnvironmentHealth();
    } catch {
      environmentAlive = false;
    }

    try {
      // Cast to any since heartbeat methods may not be exported in types yet
      (codebolt as any).sendEnvironmentHeartbeat({
        environmentId,
        providerId: this.state.providerId || this.state.environmentName || 'unknown',
        environmentAlive,
      });
    } catch (error) {
      // console.error('[BaseProvider] Failed to send environment heartbeat:', error);
    }
  }

  /**
   * Get the current health status of the provider.
   * Subclasses can override for custom health determination.
   */
  protected getProviderHealthStatus(): 'healthy' | 'degraded' | 'error' {
    if (!this.state.initialized) {
      return 'error';
    }
    if (!this.agentServer.isConnected) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Register an environment as connected to this provider.
   */
  protected registerConnectedEnvironment(environmentId: string): void {
    if (!this.state.connectedEnvironments) {
      this.state.connectedEnvironments = [];
    }
    if (!this.state.connectedEnvironments.includes(environmentId)) {
      this.state.connectedEnvironments.push(environmentId);
    }
  }

  /**
   * Unregister an environment from this provider.
   */
  protected unregisterConnectedEnvironment(environmentId: string): void {
    if (this.state.connectedEnvironments) {
      this.state.connectedEnvironments = this.state.connectedEnvironments.filter(
        id => id !== environmentId
      );
    }
  }

  // ===== END HEARTBEAT METHODS =====

  /**
   * Optional hook: execute logic after connection is established.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async afterConnected(_startResult: ProviderStartResult): Promise<void> { }

  /**
   * Set up provider-specific environment (e.g., create worktree).
   * Must be implemented by subclasses.
   */
  protected abstract setupEnvironment(initVars: ProviderInitVars): Promise<void>;

  /**
   * Tear down provider-specific environment. Default implementation is a no-op.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async teardownEnvironment(): Promise<void> { }

  /**
   * Ensure agent server availability (start or reuse). Subclasses can override.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async ensureAgentServer(): Promise<void> { }

  /**
   * Resolve workspace path based on provider requirements.
   */
  protected async resolveWorkspacePath(initVars: ProviderInitVars): Promise<string> {
    if (!this.state.projectPath) {
      throw new Error("Project path is undefined in provider state");
    }

    return this.state.projectPath;
  }

  /**
   * Resolve project context (project path, metadata, etc.). Must be implemented
   * by subclasses because repository layout may vary per provider.
   */
  protected abstract resolveProjectContext(initVars: ProviderInitVars): Promise<void>;

  /**
   * Construct agent server URL from config.
   */
  protected buildAgentServerUrl(): string {
    return `ws://${this.config.agentServerHost}:${this.config.agentServerPort}`;
  }

  /**
   * Reset mutable state prior to start.
   */
  protected resetState(): void {
    this.cancelReconnect();
    this.reconnectAttempts = 0;
    this.clearPendingMessages();

    this.state = {
      initialized: false,
      environmentName: null,
      projectPath: null,
      workspacePath: null,
    };
    this.agentServer = {
      serverUrl: this.buildAgentServerUrl(),
      wsConnection: null,
      isConnected: false,
      metadata: {},
      process: null,
    };
  }

  private async connectWebSocket(initVars: ProviderInitVars): Promise<void> {
    if (this.agentServer.wsConnection && this.agentServer.isConnected) {
      return;
    }

    const url = this.buildWebSocketUrl(initVars);

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url);
      let isRegistered = false;

      const registrationTimeout = setTimeout(() => {
        ws.close();
        reject(new Error("WebSocket registration timeout"));
      }, this.config.wsRegistrationTimeout);

      ws.on("open", () => {
        this.agentServer.wsConnection = ws;
        this.agentServer.isConnected = true;
        this.agentServer.metadata = { connectedAt: Date.now() };
        this.reconnectAttempts = 0;
      });

      ws.on("message", (data) => {
        try {
          const payload = JSON.parse(data.toString());
          if (!isRegistered && payload.type === "registered") {
            isRegistered = true;
            clearTimeout(registrationTimeout);
            resolve();
          }

          this.handleTransportMessage(payload);
        } catch (error) {
          // console.error("[BaseProvider] Failed to parse WebSocket message", error);
        }
      });

      ws.on("error", (error) => {
        clearTimeout(registrationTimeout);
        this.agentServer.isConnected = false;
        this.agentServer.wsConnection = null;
        this.agentServer.metadata = { lastError: error };
        reject(error);
      });

      ws.on("close", () => {
        clearTimeout(registrationTimeout);
        this.stopWsPing();
        const wasConnected = this.agentServer.isConnected;
        this.agentServer.isConnected = false;
        this.agentServer.wsConnection = null;
        this.agentServer.metadata = { closedAt: Date.now() };

        if (wasConnected) {
          this.scheduleReconnect();
        }
      });
    });

    // Start keepalive ping and flush queued messages after successful connection
    this.startWsPing();
    await this.flushPendingMessages();
  }

  /**
   * Build the WebSocket URL used to connect to the agent server. Subclasses can
   * override to adjust query params.
   */
  protected buildWebSocketUrl(initVars: ProviderInitVars): string {
    const query = new URLSearchParams({
      clientType: "app",
      appId: `${initVars.environmentName}`,
      projectName: initVars.environmentName,
    });

    // Send projectPath instead of workspacePath
    if (this.state.projectPath) {
      query.set("currentProject", this.state.projectPath);
    }

    return `${this.agentServer.serverUrl}?${query.toString()}`;
  }

  /**
   * Handle incoming transport messages and forward to Codebolt runtime by
   * default. Subclasses can override for custom routing.
   */
  protected handleTransportMessage(message: RawMessageForAgent): void {
    if (!message) {
      return;
    }

    if (codebolt.websocket && codebolt.websocket.readyState === WebSocket.OPEN) {
      try {
        codebolt.websocket.send(JSON.stringify(message));
      } catch (error) {
        // console.warn("[BaseProvider] Unable to forward message to Codebolt websocket", error);
      }
    }
  }
}
