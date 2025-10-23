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

interface PendingRequest {
  agent: ClientConnection;
  request: ListDirectoryEvent;
  targetClient?: { id: string; type: "app" | "tui" };
}

export interface ListDirectoryEvent {
  type: "fsEvent";
  action: "listDirectory";
  requestId: string;
  message: {
    path: string;
  };
}

type ListDirectoryResult = Awaited<ReturnType<FileServices["listDirectory"]>>;

export class ListDirectoryHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();
  private readonly fileServices: FileServices;

  private readonly pendingRequests = new Map<string, PendingRequest>();
  private readonly grantedPermissions = new Set<string>();

  constructor() {
    const config = {
      targetDir: process.cwd(),
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
  }

  async handleListDirectory(agent: ClientConnection, event: ListDirectoryEvent): Promise<void> {
    const targetClient = this.resolveParent(agent);

    // If there's no target client (parent), execute directly without permission check
    if (!targetClient) {
      await this.executeListDirectory(agent, event);
      return;
    }

    // If we already have permission for this path, execute directly
    if (this.hasPermission(agent.id, event.message.path)) {
      await this.executeListDirectory(agent, event, targetClient);
      return;
    }

    // Otherwise, request permission from the parent
    const messageId = uuidv4();
    this.pendingRequests.set(messageId, { agent, request: event, targetClient });

    this.requestApproval(agent, targetClient, messageId, event);
  }

  private async executeListDirectory(
    agent: ClientConnection,
    event: ListDirectoryEvent,
    targetClient?: { id: string; type: "app" | "tui" }
  ): Promise<void> {
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

  private resolveParent(
    agent: ClientConnection,
  ): { id: string; type: "app" | "tui" } | undefined {
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    const parentId = agentManager.getParentByAgent(agent.id);
    if (!parentId) {
      return undefined;
    }

    if (appManager.getApp(parentId)) {
      return { id: parentId, type: "app" };
    }

    if (tuiManager.getTui(parentId)) {
      return { id: parentId, type: "tui" };
    }

    return undefined;
  }

  private requestApproval(
    agent: ClientConnection,
    targetClient: { id: string; type: "app" | "tui" },
    messageId: string,
    event: ListDirectoryEvent,
  ): void {
    const { requestId, message } = event;

    // For directory listing, we'll send a simple confirmation request
    const payload = {
      type: "message",
      actionType: "LISTDIRECTORY",
      templateType: "LISTDIRECTORY",
      sender: "agent",
      messageId,
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
        stateEvent: "ASK_FOR_CONFIRMATION"
      }
    };

    if (targetClient.type === "app") {
      this.connectionManager.getAppConnectionManager().sendToApp(targetClient.id, payload);
    } else {
      this.connectionManager.getTuiConnectionManager().sendToTui(targetClient.id, payload);
    }

    this.sendMessageToRemote.forwardAgentMessage(agent, payload);

    logger.info(
      formatLogMessage(
        "info",
        "ListDirectoryHandler",
        `Requested approval for listDirectory on ${message.path}`,
      ),
    );
  }

  private hasPermission(agentId: string, path: string): boolean {
    return this.grantedPermissions.has(this.permissionKey(agentId, path));
  }

  private grantPermission(agentId: string, path: string): void {
    this.grantedPermissions.add(this.permissionKey(agentId, path));
  }

  private permissionKey(agentId: string, path: string): string {
    return `${agentId}:${path}`;
  }
}