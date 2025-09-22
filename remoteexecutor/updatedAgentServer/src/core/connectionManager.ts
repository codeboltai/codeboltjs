import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientConnection,
  ProjectInfo,
  createErrorResponse,
  formatLogMessage
} from './../types';
import { ProcessManager } from './../utils/processManager';
import { NotificationService } from './../services/NotificationService';

/**
 * Centralized connection manager that handles all app and agent connections
 * Implements singleton pattern for global access
 */
export class ConnectionManager {
  private static instance: ConnectionManager;
  private apps: Map<string, ClientConnection> = new Map();
  private agents: Map<string, ClientConnection> = new Map();
  // Cache to map message IDs to agent IDs for response routing
  private messageToAgentCache: Map<string, string> = new Map();
  // Mapping from parentId (app connection ID) to agent connection data
  private parentToAgentsMapping: Map<string, Set<{connectionId: string, instanceId?: string}>> = new Map();
  // Mapping from agent connection ID to parentId (app connection ID)
  private agentToParentMapping: Map<string, string> = new Map();
  private processManager: ProcessManager;
  private _notificationService?: NotificationService;

  private constructor() {
    this.processManager = new ProcessManager();
    // Don't initialize NotificationService here to avoid circular dependency
  }

  /**
   * Get NotificationService instance with lazy initialization
   */
  private get notificationService(): NotificationService {
    if (!this._notificationService) {
      this._notificationService = NotificationService.getInstance();
    }
    return this._notificationService;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  /**
   * Register a new app or agent connection
   */
  registerConnection(connectionId: string, ws: WebSocket, connectionType: 'app' | 'agent', parentId?: string, projectInfo?: ProjectInfo, instanceId?: string): void {
    const connection: ClientConnection = {
      id: connectionId,
      ws: ws,
      type: connectionType,
      connectedAt: new Date(),
      currentProject: projectInfo,
      instanceId: instanceId
    };

    if (connectionType === 'agent') {
      this.agents.set(connectionId, connection);
      
      // Store parent-child mapping if parentId is provided
      if (parentId) {
        this.agentToParentMapping.set(connectionId, parentId);
        
        // Add agent to parent's agent set
        if (!this.parentToAgentsMapping.has(parentId)) {
          this.parentToAgentsMapping.set(parentId, new Set());
        }
        this.parentToAgentsMapping.get(parentId)!.add({connectionId, instanceId});
        
        console.log(formatLogMessage('info', 'ConnectionManager', `Agent registered: ${connectionId} with parent: ${parentId}${projectInfo ? ` and project: ${projectInfo.path}` : ''}${instanceId ? ` and instanceId: ${instanceId}` : ''}`));
      } else {
        console.log(formatLogMessage('info', 'ConnectionManager', `Agent registered: ${connectionId} (no parent)${projectInfo ? ` with project: ${projectInfo.path}` : ''}${instanceId ? ` and instanceId: ${instanceId}` : ''}`));
      }
    } else if (connectionType === 'app') {
      this.apps.set(connectionId, connection);
      console.log(formatLogMessage('info', 'ConnectionManager', `App registered: ${connectionId}${projectInfo ? ` with project: ${projectInfo.path}` : ''}${instanceId ? ` and instanceId: ${instanceId}` : ''}`));
    }

    // Confirm registration
    this.sendToConnection(connectionId, {
      type: 'registered',
      connectionId: connectionId,
      connectionType: connectionType,
      message: `Successfully registered as ${connectionType}`,
      parentId: parentId
    });
  }

  /**
   * Remove a connection (app or agent)
   */
  removeConnection(connectionId: string): void {
    const app = this.apps.get(connectionId);
    const agent = this.agents.get(connectionId);

    if (app) {
      this.apps.delete(connectionId);
      
      // Clean up any agents that belong to this app
      const agentData = this.parentToAgentsMapping.get(connectionId);
      if (agentData) {
        agentData.forEach(agent => {
          this.agentToParentMapping.delete(agent.connectionId);
        });
        this.parentToAgentsMapping.delete(connectionId);
      }
      
      console.log(formatLogMessage('info', 'ConnectionManager', `App disconnected: ${connectionId}`));
    } else if (agent) {
      this.agents.delete(connectionId);
      
      // Clean up parent-child mapping for this agent
      const parentId = this.agentToParentMapping.get(connectionId);
      if (parentId) {
        this.agentToParentMapping.delete(connectionId);
        const siblings = this.parentToAgentsMapping.get(parentId);
        if (siblings) {
          // Find and remove the agent with matching connectionId
          for (const agent of siblings) {
            if (agent.connectionId === connectionId) {
              siblings.delete(agent);
              break;
            }
          }
          // If no more agents for this parent, remove the parent entry
          if (siblings.size === 0) {
            this.parentToAgentsMapping.delete(parentId);
          }
        }
      }
      
      console.log(formatLogMessage('info', 'ConnectionManager', `Agent disconnected: ${connectionId}`));
    }
  }

  /**
   * Get a connection by ID (searches both apps and agents)
   */
  getConnection(connectionId: string): ClientConnection | undefined {
    return this.apps.get(connectionId) || this.agents.get(connectionId);
  }

  /**
   * Get all apps
   */
  getAllApps(): ClientConnection[] {
    return Array.from(this.apps.values());
  }

  /**
   * Get all agents
   */
  getAllAgents(): ClientConnection[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all connections (apps and agents)
   */
  getAllConnections(): ClientConnection[] {
    return [...this.getAllApps(), ...this.getAllAgents()];
  }

  /**
   * Get all agents that belong to a specific parent (app)
   */
  getAgentsByParent(parentId: string): ClientConnection[] {
    const agentData = this.parentToAgentsMapping.get(parentId);
    if (!agentData) {
      return [];
    }
    
    const agents: ClientConnection[] = [];
    agentData.forEach(agentInfo => {
      const agent = this.agents.get(agentInfo.connectionId);
      if (agent) {
        agents.push(agent);
      }
    });
    
    return agents;
  }

  /**
   * Get the parent (app) ID for a specific agent
   */
  getParentByAgent(agentId: string): string | undefined {
    return this.agentToParentMapping.get(agentId);
  }

  /**
   * Get all agent IDs that belong to a specific parent (app)
   */
  getAgentIdsByParent(parentId: string): string[] {
    const agentData = this.parentToAgentsMapping.get(parentId);
    return agentData ? Array.from(agentData).map(agent => agent.connectionId) : [];
  }

  /**
   * Check if an agent belongs to a specific parent
   */
  isAgentOwnedByParent(agentId: string, parentId: string): boolean {
    const actualParentId = this.agentToParentMapping.get(agentId);
    return actualParentId === parentId;
  }

  /**
   * Get all parent-agent mappings (for debugging/monitoring)
   */
  getAllParentMappings(): { [parentId: string]: string[] } {
    const result: { [parentId: string]: string[] } = {};
    this.parentToAgentsMapping.forEach((agentData, parentId) => {
      result[parentId] = Array.from(agentData).map(agent => agent.connectionId);
    });
    return result;
  }

  /**
   * Log all parent-child mappings for debugging
   */
  logAllMappings(): void {
    console.log(formatLogMessage('info', 'ConnectionManager', '=== Parent-Child Mappings ==='));
    if (this.parentToAgentsMapping.size === 0) {
      console.log(formatLogMessage('info', 'ConnectionManager', 'No parent-child mappings found'));
    } else {
      this.parentToAgentsMapping.forEach((agentData, parentId) => {
        const agentInfo = Array.from(agentData).map(agent => `${agent.connectionId}${agent.instanceId ? ` (instanceId: ${agent.instanceId})` : ''}`);
        console.log(formatLogMessage('info', 'ConnectionManager', `Parent ${parentId} -> Agents: [${agentInfo.join(', ')}]`));
      });
    }
    console.log(formatLogMessage('info', 'ConnectionManager', '=============================='));
  }

  /**
   * Send message to a specific connection
   */
  sendToConnection(connectionId: string, message: any): boolean {
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

  /**
   * Send message to a specific app
   */
  sendToApp(appId: string, message: unknown): boolean {
    const app = this.apps.get(appId);
    if (!app) {
      console.warn(formatLogMessage('warn', 'ConnectionManager', `App ${appId} not found`));
      return false;
    }

    try {
      app.ws.send(JSON.stringify(message));
      console.log(formatLogMessage('info', 'ConnectionManager', `Message sent to app ${appId}`));
      return true;
    } catch (error) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending message to app ${appId}: ${error}`));
      return false;
    }
  }

  /**
   * Send message to first available agent
   */
  sendToAgent(message: unknown): boolean {
    const agents = this.getAllAgents();
    
    if (agents.length === 0) {
      console.warn(formatLogMessage('warn', 'ConnectionManager', 'No agents available'));
      return false;
    }

    // For now, send to the first available agent
    // In the future, this could implement load balancing or agent selection logic
    const agent = agents[0];
    
    try {
      agent.ws.send(JSON.stringify(message));
      console.log(formatLogMessage('info', 'ConnectionManager', `Message sent to agent ${agent.id}`));
      return true;
    } catch (error) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending message to agent: ${error}`));
      return false;
    }
  }

  /**
   * Broadcast message to all apps
   */
  broadcastToApps(message: unknown): void {
    this.apps.forEach((app) => {
      try {
        app.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(formatLogMessage('error', 'ConnectionManager', `Error broadcasting to app ${app.id}: ${error}`));
      }
    });
  }

  /**
   * Send error message to a connection
   */
  sendError(connectionId: string, errorMessage: string, messageId?: string): boolean {
    const error = createErrorResponse(messageId || uuidv4(), errorMessage);
    return this.sendToConnection(connectionId, error);
  }

  /**
   * Send error message using WebSocket directly (for cases where connection isn't registered yet)
   */
  sendErrorDirect(ws: WebSocket, errorMessage: string, messageId?: string): void {
    const error = createErrorResponse(messageId || uuidv4(), errorMessage);

    try {
      ws.send(JSON.stringify(error));
    } catch (sendError) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending error message: ${sendError}`));
    }
  }

  /**
   * Cache message ID to agent ID mapping for response routing
   */
  cacheMessageToAgent(messageId: string, agentId: string): void {
    this.messageToAgentCache.set(messageId, agentId);
    console.log(formatLogMessage('info', 'ConnectionManager', `Cached message ${messageId} for agent ${agentId}`));
  }

  /**
   * Get agent ID for a message ID and remove from cache
   */
  getAndRemoveAgentForMessage(messageId: string): string | undefined {
    const agentId = this.messageToAgentCache.get(messageId);
    if (agentId) {
      this.messageToAgentCache.delete(messageId);
      console.log(formatLogMessage('info', 'ConnectionManager', `Retrieved and removed cached message ${messageId} for agent ${agentId}`));
    }
    return agentId;
  }

  /**
   * Send message to specific agent by ID, start agent if not found
   */
  async sendToSpecificAgent(agentId: string,applicationId:string, message: unknown): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      // console.warn(formatLogMessage('warn', 'ConnectionManager', `Agent ${agentId} not found, attempting to start...`));
      
      // Try to start the agent
      const started = await this.processManager.startAgent(agentId,applicationId);
      
      if (!started) {
        console.error(formatLogMessage('error', 'ConnectionManager', `Failed to start agent ${agentId}`));
        return false;
      }
      
      // Wait for the agent to connect and be ready
      await this.waitForAgentConnectionAndReady(agentId);
      
      // Get the ready agent and send message
      const newAgent = this.agents.get(agentId)!;
      return this.sendMessageToReadyAgent(newAgent, agentId, message);
    }

    // Agent exists, check if WebSocket is ready
    if (!this.isWebSocketReady(agent.ws)) {
      console.log(formatLogMessage('info', 'ConnectionManager', `Agent ${agentId} WebSocket not ready, waiting...`));
      
      // Wait for WebSocket to be ready
      await this.waitForWebSocketReady(agent.ws);
    }

    return this.sendMessageToReadyAgent(agent, agentId, message);
  }

  /**
   * Send chat notification to app when app message is sent to agent
   */
  private sendChatNotificationToApp(agentId: string, message: any, action: string): void {
    try {
      const requestId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Send user message request notification to the app (since this is app→agent communication)
      this.notificationService.sendUserMessageRequest(
        agentId,
        requestId,
        message.userMessage,
        { source: 'app', timestamp: new Date().toISOString() }
      );
      
      console.log(formatLogMessage('info', 'ConnectionManager', `App message notification sent to app for agent ${agentId}`));
    } catch (error) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending chat notification for agent ${agentId}: ${error}`));
    }
  }

  /**
   * Wait for an agent to connect within a timeout period
   */
  private async waitForAgentConnection(agentId: string, timeoutMs: number): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 500; // Check every 500ms

    while (Date.now() - startTime < timeoutMs) {
      if (this.agents.has(agentId)) {
        return true;
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    return false;
  }

  /**
   * Wait for an agent to connect and its WebSocket to be ready
   */
  private async waitForAgentConnectionAndReady(agentId: string): Promise<void> {
    const checkInterval = 500; // Check every 500ms

    while (true) {
      const agent = this.agents.get(agentId);
      if (agent && this.isWebSocketReady(agent.ws)) {
        console.log(formatLogMessage('info', 'ConnectionManager', `Agent ${agentId} is connected and ready`));
        return;
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }

  /**
   * Check if WebSocket is ready (open state)
   */
  private isWebSocketReady(ws: WebSocket): boolean {
    return ws.readyState === WebSocket.OPEN;
  }

  /**
   * Wait for WebSocket to be ready (without timeout)
   */
  private async waitForWebSocketReady(ws: WebSocket): Promise<void> {
    if (this.isWebSocketReady(ws)) {
      return;
    }

    return new Promise((resolve) => {
      const checkInterval = 100; // Check every 100ms for WebSocket readiness

      const checkReady = () => {
        if (this.isWebSocketReady(ws)) {
          console.log(formatLogMessage('info', 'ConnectionManager', 'WebSocket is now ready'));
          resolve();
          return;
        }

        setTimeout(checkReady, checkInterval);
      };

      checkReady();
    });
  }

  /**
   * Send message to a ready agent (helper method)
   */
  private sendMessageToReadyAgent(agent: ClientConnection, agentId: string, message: unknown): boolean {
    try {
      // const messageToSend = {type:'messageResponse',message:message};
      agent.ws.send(JSON.stringify(message));
      console.log(formatLogMessage('info', 'ConnectionManager', `Message sent to agent ${agentId}`));
      
      // Send chat notification to the app
      // this.sendChatNotificationToApp(agentId, message, 'sendMessageRequest');
      
      return true;
    } catch (error) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending message to agent ${agentId}: ${error}`));
      return false;
    }
  }

  /**
   * Get the process manager (for access to agent management)
   */
  getProcessManager(): ProcessManager {
    return this.processManager;
  }

  /**
   * Clean up old cache entries (optional - for memory management)
   */
  cleanupOldCacheEntries(maxAge: number = 300000): void { // 5 minutes default
    const now = Date.now();
    // Note: This is a simple cleanup. In production, you might want to store timestamps
    // and clean based on age. For now, we'll rely on the response flow to clean up.
    console.log(formatLogMessage('info', 'ConnectionManager', `Cache cleanup completed. Current cache size: ${this.messageToAgentCache.size}`));
  }

  /**
   * Get connection count for monitoring
   */
  getConnectionCounts(): { apps: number; agents: number } {
    return {
      apps: this.apps.size,
      agents: this.agents.size
    };
  }

  /**
   * Update project information for a connection
   */
  updateConnectionProject(connectionId: string, projectInfo: ProjectInfo): boolean {
    const connection = this.getConnection(connectionId);
    if (!connection) {
      console.warn(formatLogMessage('warn', 'ConnectionManager', `Connection ${connectionId} not found for project update`));
      return false;
    }

    connection.currentProject = projectInfo;
    console.log(formatLogMessage('info', 'ConnectionManager', `Updated project for ${connectionId}: ${projectInfo.path}`));
    return true;
  }

  /**
   * Get project information for a connection
   */
  getConnectionProject(connectionId: string): ProjectInfo | undefined {
    const connection = this.getConnection(connectionId);
    return connection?.currentProject;
  }

  /**
   * Get all connections with their project information
   */
  getAllConnectionsWithProjects(): Array<{ connection: ClientConnection; project?: ProjectInfo }> {
    const allConnections = this.getAllConnections();
    return allConnections.map(connection => ({
      connection,
      project: connection.currentProject
    }));
  }

  /**
   * Get connections by project path
   */
  getConnectionsByProject(projectPath: string): ClientConnection[] {
    const allConnections = this.getAllConnections();
    return allConnections.filter(connection => 
      connection.currentProject?.path === projectPath
    );
  }
}