import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientConnection,
  createErrorResponse,
  formatLogMessage
} from '@codebolt/shared-types';
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
  // Mapping from parentId (app connection ID) to agent connection IDs
  private parentToAgentsMapping: Map<string, Set<string>> = new Map();
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
  registerConnection(connectionId: string, ws: WebSocket, connectionType: 'app' | 'agent', parentId?: string): void {
    const connection: ClientConnection = {
      id: connectionId,
      ws: ws,
      type: connectionType,
      connectedAt: new Date()
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
        this.parentToAgentsMapping.get(parentId)!.add(connectionId);
        
        console.log(formatLogMessage('info', 'ConnectionManager', `Agent registered: ${connectionId} with parent: ${parentId}`));
      } else {
        console.log(formatLogMessage('info', 'ConnectionManager', `Agent registered: ${connectionId} (no parent)`));
      }
    } else if (connectionType === 'app') {
      this.apps.set(connectionId, connection);
      console.log(formatLogMessage('info', 'ConnectionManager', `App registered: ${connectionId}`));
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
      const agentIds = this.parentToAgentsMapping.get(connectionId);
      if (agentIds) {
        agentIds.forEach(agentId => {
          this.agentToParentMapping.delete(agentId);
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
          siblings.delete(connectionId);
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
    const agentIds = this.parentToAgentsMapping.get(parentId);
    if (!agentIds) {
      return [];
    }
    
    const agents: ClientConnection[] = [];
    agentIds.forEach(agentId => {
      const agent = this.agents.get(agentId);
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
    const agentIds = this.parentToAgentsMapping.get(parentId);
    return agentIds ? Array.from(agentIds) : [];
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
    this.parentToAgentsMapping.forEach((agentIds, parentId) => {
      result[parentId] = Array.from(agentIds);
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
      this.parentToAgentsMapping.forEach((agentIds, parentId) => {
        console.log(formatLogMessage('info', 'ConnectionManager', `Parent ${parentId} -> Agents: [${Array.from(agentIds).join(', ')}]`));
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
      console.warn(formatLogMessage('warn', 'ConnectionManager', `Agent ${agentId} not found, attempting to start...`));
      
      // Try to start the agent
      const started = await this.processManager.startAgent(agentId,applicationId);
      if (!started) {
        console.error(formatLogMessage('error', 'ConnectionManager', `Failed to start agent ${agentId}`));
        return false;
      }
      
      // Wait a moment for the agent to connect
      await this.waitForAgentConnection(agentId, 1000000); // 10 second timeout
      
      // Check if agent is now connected
      const newAgent = this.agents.get(agentId);
      if (!newAgent) {
        console.error(formatLogMessage('error', 'ConnectionManager', `Agent ${agentId} started but did not connect within timeout`));
        return false;
      }
      
      // Send message to the newly connected agent
      try {
        const messageToSend = {type:'messageResponse',message:message};
        newAgent.ws.send(JSON.stringify(messageToSend));
        console.log(formatLogMessage('info', 'ConnectionManager', `Message sent to newly started agent ${agentId}`));
        
        // Send chat notification to the app
        // this.sendChatNotificationToApp(agentId, message, 'sendMessageRequest');
        
        return true;
      } catch (error) {
        console.error(formatLogMessage('error', 'ConnectionManager', `Error sending message to newly started agent ${agentId}: ${error}`));
        return false;
      }
    }

    try {
      const messageToSend = {type:'messageResponse',message:message};

      agent.ws.send(JSON.stringify(messageToSend));
      console.log(formatLogMessage('info', 'ConnectionManager', `Message sent to specific agent ${agentId}`));
      
      // Send chat notification to the app
      // this.sendChatNotificationToApp(agentId, message, 'sendMessageRequest');
      
      return true;
    } catch (error) {
      console.error(formatLogMessage('error', 'ConnectionManager', `Error sending message to agent ${agentId}: ${error}`));
      return false;
    }
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
}