import { ClientConnection, Message, formatLogMessage } from "../../types";
import { ReadFileHandler, WriteFileHandler } from "../../localAgentRequestFulfilment/index.js";
import { ConnectionManager } from "../../core/connectionManagers/connectionManager.js";
import { NotificationService } from "../../services/NotificationService.js";
import { SendMessageToApp } from "../appMessaging/sendMessageToApp.js";
import { SendMessageToTui } from "../tuiMessaging/sendMessageToTui.js";
import { SendMessageToRemote } from "../remoteMessaging/sendMessageToRemote";
import { logger } from "../../utils/logger";
import { ReadFileEvent, WriteToFileEvent } from "@codebolt/types/agent-to-app-ws-types";

/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class AgentMessageRouter {
  private readFileHandler: ReadFileHandler;
  private writeFileHandler: WriteFileHandler;
  private sendMessageToApp: SendMessageToApp;
  private sendMessageToTui: SendMessageToTui;
  private connectionManager: ConnectionManager;
  private notificationService: NotificationService;
  private sendMessageToRemote: SendMessageToRemote;

  constructor() {
    this.readFileHandler = new ReadFileHandler();
    this.writeFileHandler = new WriteFileHandler();
    this.sendMessageToApp = new SendMessageToApp();
    this.sendMessageToTui = new SendMessageToTui();
    this.connectionManager = ConnectionManager.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.sendMessageToRemote = new SendMessageToRemote();
  }

  /**
   * Handle requests from agents (asking app to do file operations)
   * This method implements the functionality of fsService.handleFsEvents within the switch cases
   */
  async handleAgentRequestMessage(
    agent: ClientConnection,
    message: Message | ReadFileEvent | WriteToFileEvent 
  ) {
    logger.info(
      formatLogMessage(
        "info",
        "MessageRouter",
        `Handling agent request: ${message.type} from ${agent.id
        }`
      )
    );

    // Handle read file requests locally before forwarding
    if (message.type === "fsEvent" && message.action === "readFile") {
      await this.readFileHandler.handleReadFile(agent, message as any);
      return;
    }

    if (message.type === "fsEvent" && message.action === "writeToFile") {
      await this.writeFileHandler.handleWriteFile(agent, message as any);
      return;
    }

    // Forward the message to the related app instead of sending back to client

    // Cache the message ID -> agent ID mapping for response routing
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const appManager = this.connectionManager.getAppConnectionManager();
    const processManager = this.connectionManager.getProcessManager();

 

    // Get the client ID and client type for this agent
    let targetClientId: string | undefined;
    let clientType: "app" | "tui" | undefined;

    // First try to get parent ID from agent connections manager
    const parentId = agentManager.getParentByAgent(agent.id);
    if (parentId) {
      // Check if parent is an app
      if (appManager.getApp(parentId)) {
        targetClientId = parentId;
        clientType = "app";
      }
      // Check if parent is a tui
      else {
        const tuiManager = this.connectionManager.getTuiConnectionManager();
        if (tuiManager.getTui(parentId)) {
          targetClientId = parentId;
          clientType = "tui";
        }
      }
    }

    // Fallback to connectionId mapping if parent mapping not found
    if (!targetClientId && agent.connectionId) {
      targetClientId = processManager.getClientIdForConnection(
        agent.connectionId
      );
      // If we have a client ID from connection mapping, determine its type
      if (targetClientId) {
        if (appManager.getApp(targetClientId)) {
          clientType = "app";
        } else {
          const tuiManager = this.connectionManager.getTuiConnectionManager();
          if (tuiManager.getTui(targetClientId)) {
            clientType = "tui";
          }
        }
      }
    }

    // Add agentId and agentInstanceId to the message so the client knows where to send response back
    const messageWithAgentId = {
      ...message,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
    };

    // If we have a specific client ID and type, send to that client using the appropriate messaging class
    if (targetClientId && clientType) {
      if (clientType === "app") {
        this.sendMessageToApp.forwardToApp(agent, messageWithAgentId);
        return;
      } else if (clientType === "tui") {
        this.sendMessageToTui.sendToTui(targetClientId, messageWithAgentId);
        return;
      }
    }

    const tuiManager = this.connectionManager.getTuiConnectionManager();
    const tuis = tuiManager.getAllTuis();

    if (tuis.length > 0) {
      // Try to send to first available tui
      const tui = tuis[0];
      this.sendMessageToTui.sendToTui(tui.id, messageWithAgentId);
    } else {
      logger.info(
        formatLogMessage(
          "info",
          "MessageRouter",
          "No local apps or tuis available"
        )
      );
      this.connectionManager.sendError(
        agent.id,
        "No local clients available"
      );
    }

    this.sendMessageToRemote.forwardAgentMessage(agent, messageWithAgentId);

  }
}
