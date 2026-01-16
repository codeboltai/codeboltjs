import WebSocket from "ws";
import codebolt from "@codebolt/codeboltjs";
import {
  AgentServerConnection,
  BaseProviderConfig,
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

  constructor(config?: Partial<BaseProviderConfig>) {
    this.config = {
      agentServerPort: 3001,
      agentServerHost: "localhost",
      reconnectAttempts: 10,
      reconnectDelay: 1_000,
      wsRegistrationTimeout: 10_000,
      transport: "websocket",
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
   * {@link sendToAgentServer}.
   */
  async onProviderAgentStart(agentMessage: AgentStartMessage): Promise<void> {
    if (!this.agentServer.isConnected) {
      throw new Error("Agent server is not connected. Cannot start agent");
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
      await this.teardownEnvironment();
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
      await this.teardownEnvironment();
      this.state.initialized = false;
    }
  }

  /**
   * Handle raw incoming messages from the platform. Default behavior is to
   * forward the payload to the agent server transport.
   */
  async onRawMessage(message: RawMessageForAgent): Promise<void> {
    if (!this.agentServer.isConnected || !this.agentServer.wsConnection) {
      throw new Error("Agent server connection is not established");
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
    if (this.agentServer.wsConnection) {
      try {
        this.agentServer.wsConnection.close();
      } catch (error) {
        console.warn("[BaseProvider] Error closing WebSocket", error);
      }
      this.agentServer.metadata = {};
      this.agentServer.wsConnection = null;
      this.agentServer.isConnected = false;
    }
  }

  /**
   * Helper to send messages to the agent server.
   */
  async sendToAgentServer(message: RawMessageForAgent | AgentStartMessage): Promise<boolean> {
    if (!this.agentServer.wsConnection) {
      throw new Error("WebSocket connection is not open");
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
      console.error("[BaseProvider] Failed to send message to agent server", error);
      return false;
    }
  }

  /**
   * Optional hook: execute custom logic before closing.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async beforeClose(): Promise<void> { }

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

    console.log('[BaseProvider] Heartbeat monitoring started');
  }

  /**
   * Stop sending provider heartbeats.
   */
  protected stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('[BaseProvider] Heartbeat monitoring stopped');
    }
    if (this.environmentHeartbeatInterval) {
      clearInterval(this.environmentHeartbeatInterval);
      this.environmentHeartbeatInterval = null;
      console.log('[BaseProvider] Environment heartbeat monitoring stopped');
    }
  }

  /**
   * Send a provider heartbeat to the main application.
   */
  protected sendProviderHeartbeat(): void {
    if (!codebolt.ready) {
      console.warn('[BaseProvider] Cannot send heartbeat - Codebolt not ready');
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
      console.error('[BaseProvider] Failed to send provider heartbeat:', error);
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

    console.log(`[BaseProvider] Environment heartbeat started for: ${environmentId}`);
  }

  /**
   * Send an environment heartbeat to the main application.
   */
  protected sendEnvironmentHeartbeat(environmentId: string): void {
    if (!codebolt.ready) {
      console.warn('[BaseProvider] Cannot send environment heartbeat - Codebolt not ready');
      return;
    }

    try {
      // Cast to any since heartbeat methods may not be exported in types yet
      (codebolt as any).sendEnvironmentHeartbeat({
        environmentId,
        providerId: this.state.providerId || this.state.environmentName || 'unknown',
      });
    } catch (error) {
      console.error('[BaseProvider] Failed to send environment heartbeat:', error);
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
          console.error("[BaseProvider] Failed to parse WebSocket message", error);
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
        this.agentServer.isConnected = false;
        this.agentServer.wsConnection = null;
        this.agentServer.metadata = { closedAt: Date.now() };
      });
    });
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
        console.warn("[BaseProvider] Unable to forward message to Codebolt websocket", error);
      }
    }
  }
}


