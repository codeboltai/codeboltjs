import WebSocket from 'ws';
import { DockerProviderConfig } from '@codebolt/types/remote';
import { DockerProviderMessageHandler } from '../handlers/messageHandler';

/**
 * Simple WebSocket client for connecting to Codebolt application
 */
export class CodeboltWebSocketClient {
  private websocket!: WebSocket;
  private config: DockerProviderConfig;
  private messageHandler: DockerProviderMessageHandler;
  private onDockerServerMessageCallback?: (message: Record<string, unknown>) => void;

  constructor(config: DockerProviderConfig) {
    this.config = config;
    this.messageHandler = new DockerProviderMessageHandler();
  }

  /**
   * Set callback for forwarding messages to Docker server
   */
  public setDockerServerCallback(callback: (message: Record<string, unknown>) => void): void {
    this.onDockerServerMessageCallback = callback;
    this.messageHandler.setDockerServerCallback(callback);
  }

  /**
   * Connect to Codebolt server
   */
  public async initializeWebSocket(): Promise<void> {
    const wsUrl = `ws://${this.config.serverUrl}:${this.config.socketPort}/codebolt?agentId=${this.config.agentId}&IS_PROVIDER=true&IS_REMOTE_PROVIDER=true&providerId=${this.config.providerId}&storedTaskId=${this.config.storedTaskId}`;
    console.log('[CodeboltWS] Connecting to:', wsUrl);
    
    this.websocket = new WebSocket(wsUrl);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.config.connectionTimeout);

      this.websocket.on('open', () => {
        clearTimeout(timeout);
        console.log('[CodeboltWS] Connected');
        
        // Register as docker provider agent
        this.sendMessage({
          type: 'register',
          clientType: 'agent',
          agentType: 'docker-provider',
          agentId: this.config.agentId,
          providerId: this.config.providerId,
          storedTaskId: this.config.storedTaskId,
          agentTask: this.config.agentTask,
          isDev: this.config.isDev,
          serverUrl: this.config.serverUrl,
          socketPort: this.config.socketPort,
          IS_REMOTE_PROVIDER:true
        });
        
        resolve();
      });

      this.websocket.on('error', (error) => {
        clearTimeout(timeout);
        console.error('[CodeboltWS] Connection error:', error);
        reject(error);
      });

      this.websocket.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message?.type === 'providerProspectivePath' || message?.action === 'providerProspectivePath') {
            this.sendProspectivePathResponse(message);
            return;
          }
          this.messageHandler.handleMessage(message);
        } catch (error) {
          console.error('[CodeboltWS] Message parse error:', error);
        }
      });

      this.websocket.on('close', () => {
        console.log('[CodeboltWS] Connection closed');
      });
    });
  }

  /**
   * Send message to Codebolt server
   */
  public sendMessage(message: Record<string, unknown>): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  /**
   * Send message from Docker server to Codebolt
   */
  public sendFromDockerServer(message: Record<string, unknown>): void {
    this.sendMessage(message);
  }

  private sendProspectivePathResponse(message: Record<string, any>): void {
    const requestedPath = String(message.environmentPath || message.requestedPath || message.resolvedPath || message.path || '').trim();
    const projectName = String(message.projectName || 'codebolt-project').replace(/[^a-zA-Z0-9_.-]/g, '-');
    const resolvedPath = requestedPath || `/workspace/${projectName || 'codebolt-project'}`;
    const syncPolicy = this.getSyncPolicy();
    this.sendMessage({
      type: 'remoteProviderEvent',
      action: 'providerProspectivePathResponse',
      requestId: message.requestId,
      status: true,
      data: {
        path: resolvedPath,
        projectPath: resolvedPath,
        resolvedPath,
        environmentPath: resolvedPath,
        requestedPath: requestedPath || undefined,
        pathSource: requestedPath ? 'user_override' : 'provider_proposed',
        source: requestedPath ? 'user_override' : 'provider_proposed',
        syncMode: 'workspace_sync',
        mergeStrategy: 'workspace_sync',
        editable: true,
        syncPolicy,
        defaultSyncMode: syncPolicy.defaultSyncMode,
        supportedSyncModes: ['workspace_sync'],
        supportedMergeStrategies: ['workspace_sync'],
      },
    });
  }

  private getSyncPolicy(): Record<string, any> {
    return {
      defaultSyncMode: 'workspace_sync',
      modes: [
        {
          value: 'workspace_sync',
          label: 'Workspace sync',
          description: 'Use the Docker workspace mount for initial data sync and cleanup.',
          createsGitWorktree: false,
          usesWorkspaceSync: true,
          cleanup: 'runtime_provider',
        },
      ],
    };
  }

  /**
   * Close connection
   */
  public close(): void {
    if (this.websocket) {
      this.websocket.close();
    }
  }
}
