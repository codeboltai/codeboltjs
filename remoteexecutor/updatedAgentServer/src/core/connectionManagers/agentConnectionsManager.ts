import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { ClientConnection, ProjectInfo, createErrorResponse, formatLogMessage } from '../../types';
import { ChildAgentProcessManager } from '../../utils/childAgentManager/childAgentProcessManager';
import { logger } from '../../utils/logger';

/**
 * Manages lifecycle and operations for agent WebSocket connections.
 */
export class AgentConnectionsManager {
  private static instance: AgentConnectionsManager;

  private readonly agents = new Map<string, ClientConnection>();
  private readonly messageToAgentCache = new Map<string, string>();
  private readonly parentToAgentsMapping = new Map<string, Set<{ connectionId: string; instanceId?: string }>>();
  private readonly agentToParentMapping = new Map<string, string>();
  private readonly childAgentProcessManager = new ChildAgentProcessManager();

  private constructor() {}

  static getInstance(): AgentConnectionsManager {
    if (!AgentConnectionsManager.instance) {
      AgentConnectionsManager.instance = new AgentConnectionsManager();
    }

    return AgentConnectionsManager.instance;
  }

  registerAgent(connection: ClientConnection, parentId?: string): void {
    this.agents.set(connection.id, connection);

    if (parentId) {
      this.agentToParentMapping.set(connection.id, parentId);

      if (!this.parentToAgentsMapping.has(parentId)) {
        this.parentToAgentsMapping.set(parentId, new Set());
      }

      this.parentToAgentsMapping.get(parentId)!.add({ connectionId: connection.id, instanceId: connection.instanceId });

      logger.info(
        formatLogMessage(
          'info',
          'AgentConnectionsManager',
          `Agent registered: ${connection.id} with parent: ${parentId}${connection.currentProject ? ` and project: ${connection.currentProject.path}` : ''}${connection.instanceId ? ` and instanceId: ${connection.instanceId}` : ''}`
        )
      );
    } else {
      logger.info(
        formatLogMessage(
          'info',
          'AgentConnectionsManager',
          `Agent registered: ${connection.id} (no parent)${connection.currentProject ? ` with project: ${connection.currentProject.path}` : ''}${connection.instanceId ? ` and instanceId: ${connection.instanceId}` : ''}`
        )
      );
    }
  }

  removeAgent(agentId: string): void {
    const removed = this.agents.delete(agentId);

    if (!removed) {
      return;
    }

    const parentId = this.agentToParentMapping.get(agentId);

    if (parentId) {
      this.agentToParentMapping.delete(agentId);
      const siblings = this.parentToAgentsMapping.get(parentId);

      if (siblings) {
        for (const sibling of siblings) {
          if (sibling.connectionId === agentId) {
            siblings.delete(sibling);
            break;
          }
        }

        if (siblings.size === 0) {
          this.parentToAgentsMapping.delete(parentId);
        }
      }
    }

    logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Agent disconnected: ${agentId}`));
  }

  clearParentMappings(parentId: string): void {
    const agentData = this.parentToAgentsMapping.get(parentId);

    if (!agentData) {
      return;
    }

    agentData.forEach((agent) => {
      this.agentToParentMapping.delete(agent.connectionId);
    });

    this.parentToAgentsMapping.delete(parentId);
  }

  getAgent(agentId: string): ClientConnection | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): ClientConnection[] {
    return Array.from(this.agents.values());
  }

  getAgentCount(): number {
    return this.agents.size;
  }

  getAgentsByParent(parentId: string): ClientConnection[] {
    const agentData = this.parentToAgentsMapping.get(parentId);

    if (!agentData) {
      return [];
    }

    const agents: ClientConnection[] = [];
    agentData.forEach((information) => {
      const agent = this.agents.get(information.connectionId);
      if (agent) {
        agents.push(agent);
      }
    });

    return agents;
  }

  getParentByAgent(agentId: string): string | undefined {
    return this.agentToParentMapping.get(agentId);
  }

  getAgentIdsByParent(parentId: string): string[] {
    const agentData = this.parentToAgentsMapping.get(parentId);
    return agentData ? Array.from(agentData).map((agent) => agent.connectionId) : [];
  }

  isAgentOwnedByParent(agentId: string, parentId: string): boolean {
    return this.agentToParentMapping.get(agentId) === parentId;
  }

  logAllParentMappings(): void {
    logger.info(formatLogMessage('info', 'AgentConnectionsManager', '=== Parent-Child Mappings ==='));

    if (this.parentToAgentsMapping.size === 0) {
      logger.info(formatLogMessage('info', 'AgentConnectionsManager', 'No parent-child mappings found'));
      return;
    }

    this.parentToAgentsMapping.forEach((agentData, parentId) => {
      const agentInfo = Array.from(agentData).map((agent) => `${agent.connectionId}${agent.instanceId ? ` (instanceId: ${agent.instanceId})` : ''}`);
      logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Parent ${parentId} -> Agents: [${agentInfo.join(', ')}]`));
    });

    logger.info(formatLogMessage('info', 'AgentConnectionsManager', '=============================='));
  }

  cacheMessageToAgent(messageId: string, agentId: string): void {
    this.messageToAgentCache.set(messageId, agentId);
    logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Cached message ${messageId} for agent ${agentId}`));
  }

  getAndRemoveAgentForMessage(messageId: string): string | undefined {
    const agentId = this.messageToAgentCache.get(messageId);

    if (agentId) {
      this.messageToAgentCache.delete(messageId);
      logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Retrieved cached agent ${agentId} for message ${messageId}`));
    }

    return agentId;
  }

  sendToAgent(message: unknown): boolean {
    const agents = this.getAllAgents();
    logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Sending message to ${agents.length} agent(s)`));

    if (agents.length === 0) {
      logger.warn(formatLogMessage('warn', 'AgentConnectionsManager', 'No agents available'));
      return false;
    }

    const agent = agents[0];

    try {
      agent.ws.send(JSON.stringify(message));
      logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Message sent to agent ${agent.id}`));
      return true;
    } catch (error) {
      logger.error(formatLogMessage('error', 'AgentConnectionsManager', `Error sending message to agent: ${error}`));
      return false;
    }
  }

  async sendToSpecificAgent(agentId: string, applicationId: string, message: unknown): Promise<boolean> {
    const agent = this.agents.get(agentId);

    if (!agent) {
      const started = await this.childAgentProcessManager.startAgent(agentId, applicationId);

      if (!started) {
        logger.error(formatLogMessage('error', 'AgentConnectionsManager', `Failed to start agent ${agentId}`));
        return false;
      }

      await this.waitForAgentConnectionAndReady(agentId);
      const newAgent = this.agents.get(agentId)!;
      return this.sendMessageToReadyAgent(newAgent, agentId, message);
    }

    if (!this.isWebSocketReady(agent.ws)) {
      logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Agent ${agentId} WebSocket not ready, waiting...`));
      await this.waitForWebSocketReady(agent.ws);
    }

    return this.sendMessageToReadyAgent(agent, agentId, message);
  }

  sendError(agentId: string, errorMessage: string, messageId?: string): boolean {
    const agent = this.agents.get(agentId);

    if (!agent) {
      logger.warn(formatLogMessage('warn', 'AgentConnectionsManager', `Agent ${agentId} not found when sending error`));
      return false;
    }

    const error = createErrorResponse(messageId || uuidv4(), errorMessage);

    try {
      agent.ws.send(JSON.stringify(error));
      return true;
    } catch (sendError) {
      logger.error(formatLogMessage('error', 'AgentConnectionsManager', `Error sending error message to ${agentId}: ${sendError}`));
      return false;
    }
  }

  getProcessManager(): ChildAgentProcessManager {
    return this.childAgentProcessManager;
  }

  cleanupOldCacheEntries(): void {
    logger.info(
      formatLogMessage('info', 'AgentConnectionsManager', `Cache cleanup completed. Current cache size: ${this.messageToAgentCache.size}`)
    );
  }

  getAllParentMappings(): { [parentId: string]: string[] } {
    const result: { [parentId: string]: string[] } = {};

    this.parentToAgentsMapping.forEach((agentData, parentId) => {
      result[parentId] = Array.from(agentData).map((agent) => agent.connectionId);
    });

    return result;
  }

  getAgentProject(agentId: string): ProjectInfo | undefined {
    return this.agents.get(agentId)?.currentProject;
  }

  getAgentsByProject(projectPath: string): ClientConnection[] {
    return Array.from(this.agents.values()).filter((connection) => connection.currentProject?.path === projectPath);
  }

  getAllConnectionsWithProjects(): Array<{ connection: ClientConnection; project?: ProjectInfo }> {
    return Array.from(this.agents.values()).map((connection) => ({
      connection,
      project: connection.currentProject
    }));
  }

  updateAgentProject(agentId: string, projectInfo: ProjectInfo): boolean {
    const agent = this.agents.get(agentId);

    if (!agent) {
      logger.warn(formatLogMessage('warn', 'AgentConnectionsManager', `Agent ${agentId} not found for project update`));
      return false;
    }

    agent.currentProject = projectInfo;
    logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Updated project for agent ${agentId}: ${projectInfo.path}`));
    return true;
  }

  private sendMessageToReadyAgent(agent: ClientConnection, agentId: string, message: unknown): boolean {
    try {
      agent.ws.send(JSON.stringify(message));
      logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Message sent to agent ${agentId}`));
      return true;
    } catch (error) {
      logger.error(formatLogMessage('error', 'AgentConnectionsManager', `Error sending message to agent ${agentId}: ${error}`));
      return false;
    }
  }

  private async waitForAgentConnectionAndReady(agentId: string): Promise<void> {
    const checkInterval = 500;

    while (true) {
      const agent = this.agents.get(agentId);
      if (agent && this.isWebSocketReady(agent.ws)) {
        logger.info(formatLogMessage('info', 'AgentConnectionsManager', `Agent ${agentId} is connected and ready`));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }
  }

  private isWebSocketReady(ws: WebSocket): boolean {
    return ws.readyState === WebSocket.OPEN;
  }

  private async waitForWebSocketReady(ws: WebSocket): Promise<void> {
    if (this.isWebSocketReady(ws)) {
      return;
    }

    return new Promise((resolve) => {
      const checkInterval = 100;

      const checkReady = (): void => {
        if (this.isWebSocketReady(ws)) {
          logger.info(formatLogMessage('info', 'AgentConnectionsManager', 'WebSocket is now ready'));
          resolve();
          return;
        }

        setTimeout(checkReady, checkInterval);
      };

      checkReady();
    });
  }
}
