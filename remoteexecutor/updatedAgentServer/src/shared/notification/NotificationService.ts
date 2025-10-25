import type { ClientConnection } from "../../types";
import { ConnectionManager } from "../../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../../handlers/remoteMessaging/sendMessageToRemote.js";
import type { TargetClient } from "../utils/ClientResolver";
export enum TemplateEnum {
  USER = "userChat",
  AGENT = "agentChat",
  INFOWITHLINK = "informationWithUILink",
  AIREQUEST = "aiRequest",
  AGENTCHATWITHBUTTON = "agentChatWithButton",
  CONFIRMATIONCHAT = "confirmationChat",
  CENTERINFO = "centerInfo",
  MULTIBUTTONSELECT = "multibuttonselect",
  AGENTINFOCARD = "agentinfocard",
  AGENTSINFOLISTCARD = "agentsinfolistcard",
  CODECONFIRMATION = "codeconfirmation",
  CODEVIEWINEDITOR = "codeviewineditor",
  CONFIRMATIONWITHFEEDBACK = "confirmationwithfeedback",
  MANUALSTOPTEMPLATE = "manualstoptemplate",
  PORTCHECKANDCHANGE = "portcheckandchange",
  COMMANDCONFIRMATION = "commandconfirmation",
  COMMANDCONFIRMATIONHISTORY = "commandconfirmationhistory",
  FILEREAD = "FILEREAD",
  READFILE = "READFILE",
  WRITEFILE = "WRITEFILE",
  FILEWRITE = "FILEWRITE",
  SHADOWGIT = "shadowgit",
  FILEREADHISTORY = "filereadhistory",
  CHILDAGENTSTARTED = "childagentstarted",
  CHILDAGENTFINISHED = "childagentfinished",
  NEWAGENTBOX = "newagentbox",
  FOLDERREAD = 'FOLDERREAD',
  FILESEARCH = 'FILESEARCH',
  CODEDEFINITIONS = 'CODEDEFINITIONS',
  MCP_TOOL = 'MCP_TOOL',
  READMANYFILES = 'READMANYFILES',
  LISTDIRECTORY = 'LISTDIRECTORY',
  CODEBASESEARCH = 'CODEBASESEARCH',
  EDITOR_STATUS = 'EDITOR_STATUS',
  REVIEWMODE = 'REVIEWMODE',
  CREATE_FOLDER = "CREATE_FOLDER",
  LIST_DIRECTORY = "LIST_DIRECTORY",
  AGENT_TASK = "AGENT_TASK",
  WRITE_TODOS = "WRITE_TODOS",

}

import type {
  FileReadResponseNotification,
  FileReadErrorNotification,
  WriteToFileResponseNotification,
  ListDirectoryResponseNotification
} from "@codebolt/types/wstypes/agent-to-app-ws/notification/fsNotificationSchemas"

import type {
  LlmRequestNotification,
  LlmResponseNotification
} from "@codebolt/types/wstypes/agent-to-app-ws/notification/llmNotificationSchemas"

import type {
  UserMessageRequestNotification
} from "@codebolt/types/wstypes/agent-to-app-ws/notification/chatNotificationSchemas"

import type {
  SearchResult,
  CodebaseSearchResult
} from "@codebolt/types/wstypes/agent-to-app-ws/notification/searchNotificationSchemas"

import {
  templateEnumSchema
} from '@codebolt/types/wstypes/app-to-ui-ws/coreMessageSchemas'
import { ChatNotification } from "@codebolt/types/agent-to-app-ws-types";
import { logger } from "@/utils/logger";



/**
 * Service for handling notifications across all handlers
 */
export class NotificationService {
  private connectionManager: ConnectionManager;
  private sendMessageToRemote: SendMessageToRemote;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToRemote = new SendMessageToRemote();
  }

  /**
   * Send approval notification for successful file write
   */
  sendFileWriteSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    filePath: string;
    content: string;
    originalContent?: string;
    diff?: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, filePath, content, originalContent, diff, targetClient } = params;

    const notification: WriteToFileResponseNotification = {
      action: "writeToFileResult",
      content: content,
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: false
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send rejection notification for file write
   */
  sendFileWriteRejection(params: {
    agent: ClientConnection;
    requestId: string;
    filePath: string;
    reason: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, filePath, reason, targetClient } = params;

    const notification: WriteToFileResponseNotification = {
      action: "writeToFileResult",
      content: reason,
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send approval notification for successful file read
   */
  sendFileReadSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    filePath: string;
    content: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, filePath, content, targetClient } = params;

    const notification: FileReadResponseNotification = {
      action: "readFileResult",
      data: {
        filePath:filePath,
        content: content
      },
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send approval notification for successful folder read
   */
  sendFolderReadSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    entries: string[];
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, path, entries, targetClient } = params;

    const notification: ListDirectoryResponseNotification = {
      action: "listDirectoryResult",
      content: entries,
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: false
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send rejection notification for folder read
   */
  sendFolderReadRejection(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    reason: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, path, reason, targetClient } = params;

    const notification: ListDirectoryResponseNotification = {
      action: "listDirectoryResult",
      content: reason,
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send error notification for file write
   */
  sendFileWriteError(params: {
    agent: ClientConnection;
    requestId: string;
    filePath: string;
    error: string;
    originalContent?: string;
    diff?: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, filePath, error, originalContent, diff, targetClient } = params;

    const notification: WriteToFileResponseNotification = {
      action: "writeToFileResult",
      content: error,
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send error notification for folder read
   */
  sendFolderReadError(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, path, error, targetClient } = params;

    const notification: ListDirectoryResponseNotification = {
      action: "listDirectoryResult",
      content: error,
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Notify all appropriate clients (app/tui) with the notification message
   */
  private notifyClients(
    agent: ClientConnection,
    notification:   any,
    targetClient?: TargetClient
  ): void {
    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    if (!targetClient) {
      appManager.broadcast(notification);
      tuiManager.broadcast(notification);
    } else if (targetClient.type === "app") {
      appManager.sendToApp(targetClient.id, notification);
    } else {
      tuiManager.sendToTui(targetClient.id, notification);
    }
    logger.info("sending notification to ui",notification)
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  /**
   * Send success notification for search
   */
  sendSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    path: string;
    results: any[];
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, path, results, targetClient } = params;

    const notification: SearchResult = {
      action: "searchResult",
      content: results,
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: false
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send rejection notification for search
   */
  sendSearchRejection(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    path: string;
    reason: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, path, reason, targetClient } = params;

    const notification: SearchResult = {
      action: "searchResult",
      content: reason,
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send error notification for search
   */
  sendSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    path: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, path, error, targetClient } = params;

    const notification: SearchResult = {
      action: "searchResult",
      content: error,
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: requestId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Static factory method for one-off usage
   */
  static getInstance(): NotificationService {
    return new NotificationService();
  }


  /**
   * Send Ai Request Notification
   */

  sendAiRequestNotification(
    params: {
      agent: ClientConnection;
      messageId: string,
      agentId: string,
      threadId: string,
      agentInstanceId: string,
      parentAgentInstanceId: string,
      message: string,
      parentId: string,
      requestId: string
      targetClient?: TargetClient;
    }

  ) {
    const { agent,
      messageId,
      agentId,
      threadId,
      agentInstanceId,
      parentAgentInstanceId,
      message,
      parentId,
      requestId,
      targetClient } = params;

    const notification: LlmRequestNotification = {
      action: "inferenceRequest",
      data: {
        messages: [],
        prompt: message
      },
      type: "llmnotify",
      messageId:messageId,
      requestId: requestId,
      toolUseId: requestId,
      threadId: threadId,
      agentId: agentId,
      agentInstanceId: agentInstanceId,
      parentAgentInstanceId: parentAgentInstanceId,
      parentId: parentId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  sendAiRequestErrorNotification(
    params: {
      agent: ClientConnection;
      messageId: string,
      agentId: string,
      threadId: string,
      agentInstanceId: string,
      parentAgentInstanceId: string,
      message: string,
      parentId: string,
      requestId: string
      targetClient?: TargetClient;
    }

  ) {
    const { agent,
      messageId,
      agentId,
      threadId,
      agentInstanceId,
      parentAgentInstanceId,
      message,
      parentId,
      requestId,
      targetClient } = params;

    const notification: LlmResponseNotification = {
      action: "inferenceResult",
      content: message,
      messageId:messageId,
      type: "llmnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: threadId,
      agentId: agentId,
      agentInstanceId: agentInstanceId,
      parentAgentInstanceId: parentAgentInstanceId,
      parentId: parentId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }
  sendAiRequestSuccessNotification(
    params: {
      agent: ClientConnection;
      messageId: string,
      agentId: string,
      threadId: string,
      agentInstanceId: string,
      parentAgentInstanceId: string,
      message: string,
      parentId: string,
      requestId: string
      targetClient?: TargetClient;
    }

  ) {
    const { agent,
      messageId,
      agentId,
      threadId,
      agentInstanceId,
      parentAgentInstanceId,
      message,
      parentId,
      requestId,
      targetClient } = params;

    const notification: LlmResponseNotification = {
      action: "inferenceResult",
      content: message,
      type: "llmnotify",
      requestId: requestId,
      messageId:messageId,
      toolUseId: requestId,
      threadId: threadId,
      agentId: agentId,
      agentInstanceId: agentInstanceId,
      parentAgentInstanceId: parentAgentInstanceId,
      parentId: parentId,
      isError: false
    };

    this.notifyClients(agent, notification, targetClient);
  }

  sendChatMessageNotification(params: {
    agent: ClientConnection;
    messageId: string,
    agentId: string,
    threadId: string,
    agentInstanceId: string,
    parentAgentInstanceId: string,
    message: string,
    parentId: string,
    requestId: string
    targetClient?: TargetClient;
  }) {
    const { agent,
      messageId,
      agentId,
      threadId,
      agentInstanceId,
      parentAgentInstanceId,
      message,
      parentId,
      requestId,
      targetClient } = params;

    const notification: UserMessageRequestNotification = {
      action: "sendMessageRequest",
      data: {
        message: message,
        payload: {
          text: message
        }
      },
      type: "chatnotify",
      requestId: requestId,
      toolUseId: messageId,
      threadId: threadId,
      agentId: agentId,
      agentInstanceId: agentInstanceId,
      parentAgentInstanceId: parentAgentInstanceId,
      parentId: parentId
    };

    this.notifyClients(agent, notification, targetClient);
  }


}
