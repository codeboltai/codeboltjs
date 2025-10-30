import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { BaseConnection, ClientConnection, ProjectInfo, createErrorResponse, formatLogMessage } from '../../types';
import { AgentConnectionsManager } from './agentConnectionsManager';
import { AppConnectionsManager } from './appConnectionsManager';
import { TuiConnectionsManager } from './tuiConnectionsManager';
import { ChildAgentProcessManager } from '../../utils/childAgentManager/childAgentProcessManager';
import { logger } from '../../utils/logger';

/**
 * Coordinates operations across agent and app connection managers.
 */
export class ConnectionManager {
  private static instance: ConnectionManager;

  private readonly agentManager = AgentConnectionsManager.getInstance();
  private readonly appManager = AppConnectionsManager.getInstance();
  private readonly tuiManager = TuiConnectionsManager.getInstance();

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
    connectionType: 'app' | 'agent' | 'tui',
    threadId?:string,
    parentId?: string,
    instanceId?: string,
    connectionIdentifier?: string,
    projectInfo?: ProjectInfo
  ): void {
    const connection: ClientConnection = {
      id: connectionId,
      ws,
      type: connectionType,
      threadId: threadId || '',
      connectedAt: new Date(),
      instanceId: instanceId || '',
      connectionId: connectionIdentifier,
      parentAgentInstanceId: '',
      parentId: '',
      currentProject: projectInfo
    };

    if (connectionType === 'agent') {
      this.agentManager.registerAgent(connection, parentId);
    } else if (connectionType === 'tui') {
      this.tuiManager.registerTui(connection);
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
      return;
    }

    if (this.tuiManager.getTui(connectionId)) {
      this.tuiManager.removeTui(connectionId);
    }
  }

  getAppConnectionManager(): AppConnectionsManager {
    return this.appManager;
  }

  getAgentConnectionManager(): AgentConnectionsManager {
    return this.agentManager;
  }

  getTuiConnectionManager(): TuiConnectionsManager {
    return this.tuiManager;
  }

  getConnection(connectionId: string): ClientConnection | undefined {
    return this.appManager.getApp(connectionId) || this.agentManager.getAgent(connectionId) || this.tuiManager.getTui(connectionId);
  }

  getAllConnections(): ClientConnection[] {
    return [...this.appManager.getAllApps(), ...this.agentManager.getAllAgents(), ...this.tuiManager.getAllTuis()];
  }

  sendToConnection(connectionId: string, message: unknown): boolean {
    const connection = this.getConnection(connectionId);

    if (!connection) {
      logger.warn(formatLogMessage('warn', 'ConnectionManager', `Connection ${connectionId} not found`));
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error(formatLogMessage('error', 'ConnectionManager', `Error sending message to ${connectionId}: ${error}`));
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
      logger.error(formatLogMessage('error', 'ConnectionManager', `Error sending error message: ${sendError}`));
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

  getConnectionCounts(): { apps: number; agents: number; tuis: number } {
    return {
      apps: this.appManager.getAppCount(),
      agents: this.agentManager.getAgentCount(),
      tuis: this.tuiManager.getTuiCount()
    };
  }


  private sendRegistrationConfirmation(
    ws: WebSocket,
    connectionId: string,
    connectionType: 'app' | 'agent' | 'tui',
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
      logger.error(formatLogMessage('error', 'ConnectionManager', `Error sending registration response: ${error}`));
    }
  }
}