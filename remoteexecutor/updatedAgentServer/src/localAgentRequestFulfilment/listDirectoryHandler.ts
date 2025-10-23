import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";
import { getErrorMessage } from "../utils/errors";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../fsutils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../fsutils/DefaultWorkspaceContext";

import type { ListDirectorySuccess, ListDirectoryError } from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export interface ListDirectoryEvent {
  type: "fsEvent";
  action: "listDirectory";
  requestId: string;
  message: {
    path: string;
  };
}

type ListDirectoryResult = Awaited<ReturnType<FileServices["listDirectory"]>>;

export interface ListDirectoryEvent {
  type: "fsEvent";
  action: "listDirectory";
  requestId: string;
  message: {
    path: string;
  };
}

export class ListDirectoryHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();
  private readonly fileServices: FileServices;

  constructor() {
    const config = {
      targetDir: process.cwd(),
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
  }

  async handleListDirectory(agent: ClientConnection, event: ListDirectoryEvent): Promise<void> {
    const { requestId, message } = event;
    
    // Log that we received a list directory event
    logger.info(
      formatLogMessage("info", "ListDirectoryHandler", `Handling list directory for path: ${message.path}`)
    );
    
    try {
      // Use FileServices to list the directory
      const result: ListDirectoryResult = await this.fileServices.listDirectory(message.path);
      
      if (result.success && result.entries) {
        const entries = result.entries.map(entry => ({
          name: entry.name,
          path: entry.path,
          isDirectory: entry.isDirectory,
          size: entry.size,
          modifiedTime: entry.modifiedTime,
          permissions: undefined,
          relativePath: entry.path
        }));
        
        const response: ListDirectorySuccess = {
          type: "message",
          actionType: "LISTDIRECTORY",
          templateType: "LISTDIRECTORY",
          sender: "agent",
          messageId: requestId,
          threadId: requestId,
          timestamp: Date.now().toString(),
          agentId: agent.id,
          agentInstanceId: agent.instanceId,
          payload: {
            type: "listDirectory",
            path: message.path,
            entries: entries,
            totalCount: entries.length,
            shownCount: entries.length,
            isTruncated: false,
            stateEvent: "DIRECTORY_LISTED_SUCCESS"
          }
        };
        
        this.connectionManager.sendToConnection(agent.id, {
          ...response,
          clientId: agent.id,
        });
        
        this.sendMessageToRemote.forwardAgentMessage(agent, response);
      } else {
        const response: ListDirectoryError = {
          type: "message",
          actionType: "LISTDIRECTORY",
          templateType: "LISTDIRECTORY",
          sender: "agent",
          messageId: requestId,
          threadId: requestId,
          timestamp: Date.now().toString(),
          agentId: agent.id,
          agentInstanceId: agent.instanceId,
          payload: {
            type: "listDirectory",
            path: message.path,
            entries: [],
            totalCount: 0,
            shownCount: 0,
            isTruncated: false,
            stateEvent: "DIRECTORY_LIST_ERROR"
          }
        };
        
        this.connectionManager.sendToConnection(agent.id, {
          ...response,
          clientId: agent.id,
        });
        
        this.sendMessageToRemote.forwardAgentMessage(agent, response);
      }
    } catch (error) {
      logger.error(
        formatLogMessage(
          "error",
          "ListDirectoryHandler",
          `List directory failed for ${message.path}`
        ),
        error
      );
      
      const response: ListDirectoryError = {
        type: "message",
        actionType: "LISTDIRECTORY",
        templateType: "LISTDIRECTORY",
        sender: "agent",
        messageId: requestId,
        threadId: requestId,
        timestamp: Date.now().toString(),
        agentId: agent.id,
        agentInstanceId: agent.instanceId,
        payload: {
          type: "listDirectory",
          path: message.path,
          entries: [],
          totalCount: 0,
          shownCount: 0,
          isTruncated: false,
          stateEvent: "DIRECTORY_LIST_ERROR"
        }
      };
      
      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });
      
      this.sendMessageToRemote.forwardAgentMessage(agent, response);
    }
  }
}