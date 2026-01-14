import { ClientConnection, Message, formatLogMessage } from "../../types";
import {
  ReadFileHandler,
  ToolHandler,
  WriteFileHandler,
} from "../../localAgentRequestFulfilment/index.js";
import { ConnectionManager } from "../../core/connectionManagers/connectionManager.js";
import { NotificationService } from "../../services/NotificationService.js";
import { SendMessageToApp } from "../appMessaging/sendMessageToApp.js";
import { SendMessageToTui } from "../tuiMessaging/sendMessageToTui.js";
import { SendMessageToRemote } from "../remoteMessaging/sendMessageToRemote";
import { logger } from "../../main/utils/logger";
import type {
  ReadFileEvent as SchemaReadFileEvent,
  WriteToFileEvent as SchemaWriteToFileEvent,
  DeleteFileEvent as SchemaDeleteFileEvent,
  GrepSearchEvent as SchemaGrepSearchEvent,

  GetEnabledToolBoxesEvent,
  GetLocalToolBoxesEvent,
  GetAvailableToolBoxesEvent,
  SearchAvailableToolBoxesEvent,
  ListToolsFromToolBoxesEvent,
  ConfigureToolBoxEvent,
  GetToolsEvent,
  ExecuteToolEvent,
  McpEvent,
  LLMEvent,
  GetChatHistoryEvent,
  ProjectEvent,
  SendMessageEvent,
} from "@codebolt/types/agent-to-app-ws-types";
import { AIRequesteHandler } from "@/localAgentRequestFulfilment/llmRequestHandler";
import { ChatHistoryHandler } from "@/localAgentRequestFulfilment/chatHistoryHandler";
import { ProjectRequestHandler } from "@/localAgentRequestFulfilment/projectRequestHandler";
import { SendMessage } from "@codebolt/types/wstypes/app-to-ui-ws/coreMessageSchemas";
import { ChatMessageHandler } from "@/localAgentRequestFulfilment/chatMessageHandler";

// Define interfaces that match what the handlers expect
interface ReadFileEvent {
  type: "fsEvent";
  action: "readFile";
  requestId: string;
  message: {
    relPath: string;
    offset?: number;
    limit?: number;
  };
}

interface WriteToFileEvent {
  type: "fsEvent";
  action: "writeToFile";
  requestId: string;
  message: {
    relPath: string;
    newContent: string;
  };
}

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

  private toolHandler: ToolHandler
  private chatHistoryHandler: ChatHistoryHandler
  private llmRequestHandler: AIRequesteHandler;
  private projectRequestHandler: ProjectRequestHandler
  private chatMessageRequestHandler:ChatMessageHandler

  constructor() {
    this.readFileHandler = new ReadFileHandler();
    this.writeFileHandler = new WriteFileHandler();

    this.sendMessageToApp = new SendMessageToApp();
    this.sendMessageToTui = new SendMessageToTui();
    this.toolHandler = new ToolHandler()
    this.connectionManager = ConnectionManager.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.sendMessageToRemote = new SendMessageToRemote();
    this.llmRequestHandler = new AIRequesteHandler();
    this.chatHistoryHandler = new ChatHistoryHandler();
    this.projectRequestHandler = new ProjectRequestHandler()
    this.chatMessageRequestHandler = new ChatMessageHandler()
  }

  /**
   * Handle requests from agents (asking app to do file operations)
   * This method implements the functionality of fsService.handleFsEvents within the switch cases
   */
  async handleAgentRequestMessage(
    agent: ClientConnection,
    message: Message |
      SchemaReadFileEvent |
      SchemaWriteToFileEvent |
      SchemaDeleteFileEvent |
      SchemaGrepSearchEvent |
      McpEvent |
      LLMEvent |
      GetChatHistoryEvent|
      ProjectEvent|
      SendMessageEvent
  ) {
    logger.info(
      formatLogMessage(
        "info",
        "MessageRouter",
        `Handling agent request: ${message.type} from ${agent.id}`
      )
    );

    // Handle read file requests locally before forwarding
    if (message.type === "fsEvent" && message.action === "readFile") {
      // Convert schema-based event to handler-based event
      const readFileEvent: ReadFileEvent = {
        type: "fsEvent",
        action: "readFile",
        requestId: message.requestId,
        message: {
          relPath: (message as SchemaReadFileEvent).message.filePath,
          // offset and limit are not in the schema, so we leave them undefined
        }
      };
      await this.readFileHandler.handleReadFile(agent, readFileEvent);
      return;
    }

    if (message.type === "fsEvent" && message.action === "writeToFile") {
      // Convert schema-based event to handler-based event
      const writeFileEvent: WriteToFileEvent = {
        type: "fsEvent",
        action: "writeToFile",
        requestId: message.requestId,
        message: {
          relPath: (message as SchemaWriteToFileEvent).message.relPath,
          newContent: (message as SchemaWriteToFileEvent).message.newContent,
        }
      };
      await this.writeFileHandler.handleWriteFile(agent, writeFileEvent);
      return;
    }
    if (message.type === "codebolttools") {
      await this.toolHandler.handleToolEvent(agent, message);
      return;
    }
    if (message.type == 'inference') {
      await this.llmRequestHandler.handleAiRequest(agent, message);
      return;
    }
    if (message.type === 'getChatHistory') {
      await this.chatHistoryHandler.handleChatHistoryEvent(agent, message as GetChatHistoryEvent)
    }
    if (message.type === 'projectEvent') {
      await this.projectRequestHandler.handleProjectEvent(agent, message as ProjectEvent);
      return;
    }
    if(message.type =='sendMessage'){
      await this.chatMessageRequestHandler.handleChatMessageRequest(agent, message as SendMessageEvent)
      return
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

    // If we have a specific client ID and type, send to that client using the appropriate messaging class
    if (targetClientId && clientType) {
      if (clientType === "app") {
        this.sendMessageToApp.forwardToApp(agent, message as Message);
        return;
      } else if (clientType === "tui") {
        this.sendMessageToTui.sendToTui(targetClientId, message as Message);
        return;
      }
    }

    const tuiManager = this.connectionManager.getTuiConnectionManager();
    const tuis = tuiManager.getAllTuis();

    if (tuis.length > 0) {
      // Try to send to first available tui
      const tui = tuis[0];
      this.sendMessageToTui.sendToTui(tui.id, message as Message);
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

    this.sendMessageToRemote.forwardAgentMessage(agent, message as Message);
  }
}