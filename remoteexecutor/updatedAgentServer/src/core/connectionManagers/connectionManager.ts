import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { ClientConnection, ProjectInfo, createErrorResponse, formatLogMessage } from '../../types';
import { AgentConnectionsManager } from './agentConnectionsManager';
import { AppConnectionsManager } from './appConnectionsManager';
import { ChildAgentProcessManager } from '../../utils/childAgentProcessManager';

/**
 * Coordinates operations across agent and app connection managers.
 */
export class ConnectionManager {
  private static instance: ConnectionManager;

  private readonly agentManager = AgentConnectionsManager.getInstance();
  private readonly appManager = AppConnectionsManager.getInstance();

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }

    return ConnectionManager.instance;
  }

  registerConnection(
    connectionId: string,
    ws: WebSocket,
    connectionType: 'app' | 'agent',
    parentId?: string,
    projectInfo?: ProjectInfo,
    instanceId?: string
  ): void {
    const connection: ClientConnection = {
      id: connectionId,
      ws,
      type: connectionType,
      connectedAt: new Date(),
      currentProject: projectInfo,
      instanceId
    };

    if (connectionType === 'agent') {
      this.agentManager.registerAgent(connection, parentId);
    } else {
      this.appManager.registerApp(connection);
    }

    this.sendRegistrationConfirmation(ws, connectionId, connectionType, parentId);
  }

  removeConnection(connectionId: string): void {
    if (this.appManager.getApp(connectionId)) {
      this.appManager.removeApp(connectionId);
      this.agentManager.clearParentMappings(connectionId);
      return;
    }

    if (this.agentManager.getAgent(connectionId)) {
      this.agentManager.removeAgent(connectionId);
    }
  }

  getAppConnectionManager(): AppConnectionsManager {
    return this.appManager;
  }

  getAgentConnectionManager(): AgentConnectionsManager {
    return this.agentManager;
  }

  getConnection(connectionId: string): ClientConnection | undefined {
    return this.appManager.getApp(connectionId) || this.agentManager.getAgent(connectionId);
  }

  getAllConnections(): ClientConnection[] {
    return [...this.appManager.getAllApps(), ...this.agentManager.getAllAgents()];
  }

  sendToConnection(connectionId: string, message: unknown): boolean {
    const connection = this.getConnection(connectionId);

    if (!connection) {
      console.warn(formatLogMessage('warn', 'ConnectionManager', `Connection ${connectionId} not found`));
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending message to ${connectionId}: ${error}`));
      return false;
    }
  }

  sendError(connectionId: string, errorMessage: string, messageId?: string): boolean {
    const error = createErrorResponse(messageId || uuidv4(), errorMessage);
    return this.sendToConnection(connectionId, error);
  }

  sendErrorDirect(ws: WebSocket, errorMessage: string, messageId?: string): void {
    const error = createErrorResponse(messageId || uuidv4(), errorMessage);

    try {
      ws.send(JSON.stringify(error));
    } catch (sendError) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending error message: ${sendError}`));
    }
  }

  getAndRemoveAgentForMessage(messageId: string): string | undefined {
    return this.agentManager.getAndRemoveAgentForMessage(messageId);
  }

  getProcessManager(): ChildAgentProcessManager {
    return this.agentManager.getProcessManager();
  }

  cleanupOldCacheEntries(): void {
    this.agentManager.cleanupOldCacheEntries();
  }

  getConnectionCounts(): { apps: number; agents: number } {
    return {
      apps: this.appManager.getAppCount(),
      agents: this.agentManager.getAgentCount()
    };
  }

  updateConnectionProject(connectionId: string, projectInfo: ProjectInfo): boolean {
    if (this.appManager.getApp(connectionId)) {
      return this.appManager.updateAppProject(connectionId, projectInfo);
    }

    if (this.agentManager.getAgent(connectionId)) {
      return this.agentManager.updateAgentProject(connectionId, projectInfo);
    }

    console.warn(formatLogMessage('warn', 'ConnectionManager', `Connection ${connectionId} not found for project update`));
    return false;
  }

  getConnectionProject(connectionId: string): ProjectInfo | undefined {
    return this.appManager.getAppProject(connectionId) || this.agentManager.getAgentProject(connectionId);
  }

  getAllConnectionsWithProjects(): Array<{ connection: ClientConnection; project?: ProjectInfo }> {
    return [
      ...this.appManager.getAllConnectionsWithProjects(),
      ...this.agentManager.getAllConnectionsWithProjects()
    ];
  }

  getConnectionsByProject(projectPath: string): ClientConnection[] {
    return [
      ...this.appManager.getAppsByProject(projectPath),
      ...this.agentManager.getAgentsByProject(projectPath)
    ];
  }

  private sendRegistrationConfirmation(
    ws: WebSocket,
    connectionId: string,
    connectionType: 'app' | 'agent',
    parentId?: string
  ): void {
    const payload = {
      type: 'registered',
      connectionId,
      connectionType,
      message: `Successfully registered as ${connectionType}`,
      parentId
    };

    try {
      ws.send(JSON.stringify(payload));
    } catch (error) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending registration response: ${error}`));
    }
  }
}