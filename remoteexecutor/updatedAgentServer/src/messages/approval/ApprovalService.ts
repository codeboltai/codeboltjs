import type { ClientConnection } from "../../types";
import { formatLogMessage } from "../../types/utils";
import { ConnectionManager } from "../../main/core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../../main/utils/logger";
import type { TargetClient } from "../../shared/utils/ClientResolver";

import type {
  FileWriteConfirmation,
  FileReadConfirmation,
  FolderReadConfirmation,
  SearchConfirmation,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export type ApprovalType = "WRITEFILE" | "READFILE" | "FOLDERREAD" | "SMARTEDIT" | "REPLACEINFILE" | "SEARCHFILECONTENT" | "READMANYFILES";

export interface ApprovalRequestParams {
  agent: ClientConnection;
  targetClient: TargetClient;
  messageId: string;
  requestId: string;
  approvalType: ApprovalType;
  filePath?: string;
  content?: string;
  originalContent?: string;
  offset?: number;
  limit?: number;
  entries?: string[];
}

/**
 * Service for handling approval requests across all handlers
 */
export class ApprovalService {
  private connectionManager: ConnectionManager;
  private sendMessageToRemote: SendMessageToRemote;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToRemote = new SendMessageToRemote();
  }

  /**
   * Request approval for a file write operation
   */
  requestWriteFileApproval(params: {
    agent: ClientConnection;
    targetClient: TargetClient;
    messageId: string;
    requestId: string;
    filePath: string;
    newContent: string;
  }): void {
    const { agent, targetClient, messageId, requestId, filePath, newContent } = params;

    const payload: FileWriteConfirmation = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: filePath,
        content: newContent,
        originalContent: "",
        stateEvent: "askForConfirmation" as const,
      },
    };

    this.sendApprovalMessage(agent, targetClient, payload, `writing file ${filePath}`);
  }

  /**
   * Request approval for a file read operation
   */
  requestReadFileApproval(params: {
    agent: ClientConnection;
    targetClient: TargetClient;
    messageId: string;
    requestId: string;
    filePath: string;
    offset?: number;
    limit?: number;
  }): void {
    const { agent, targetClient, messageId, requestId, filePath, offset, limit } = params;

    const payload: FileReadConfirmation = {
      type: "message" as const,
      actionType: "READFILE" as const,
      templateType: "READFILE" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: filePath,
        offset,
        limit,
        content: "",
        stateEvent: "ASK_FOR_CONFIRMATION" as const,
      },
    };

    this.sendApprovalMessage(agent, targetClient, payload, `reading file ${filePath}`);
  }

  /**
   * Request approval for a folder read operation
   */
  requestFolderReadApproval(params: {
    agent: ClientConnection;
    targetClient: TargetClient;
    messageId: string;
    requestId: string;
    path: string;
  }): void {
    const { agent, targetClient, messageId, requestId, path } = params;

    const payload: FolderReadConfirmation = {
      type: "message" as const,
      actionType: "FOLDERREAD" as const,
      templateType: "FOLDERREAD" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "folder" as const,
        path,
        content: [],
        stateEvent: "ASK_FOR_CONFIRMATION" as const,
      },
    };

    this.sendApprovalMessage(agent, targetClient, payload, `listing directory ${path}`);
  }

  /**
   * Request approval for a smart edit operation
   */
  requestSmartEditApproval(params: {
    agent: ClientConnection;
    targetClient: TargetClient;
    messageId: string;
    requestId: string;
    filePath: string;
    newContent: string;
    originalContent: string;
  }): void {
    const { agent, targetClient, messageId, requestId, filePath, newContent, originalContent } = params;

    const payload: FileWriteConfirmation = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: filePath,
        content: newContent,
        originalContent,
        stateEvent: "askForConfirmation" as const,
      },
    };

    this.sendApprovalMessage(agent, targetClient, payload, `smart edit on ${filePath}`);
  }

  /**
   * Request approval for replace in file operation
   */
  requestReplaceInFileApproval(params: {
    agent: ClientConnection;
    targetClient: TargetClient;
    messageId: string;
    requestId: string;
    filePath: string;
    oldString: string;
    newString: string;
  }): void {
    const { agent, targetClient, messageId, requestId, filePath, oldString, newString } = params;

    const payload: FileWriteConfirmation = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: filePath,
        content: newString,
        originalContent: oldString,
        stateEvent: "askForConfirmation" as const,
      },
    };

    this.sendApprovalMessage(agent, targetClient, payload, `replace in file ${filePath}`);
  }

  /**
   * Request approval for search file content operation
   */
  requestSearchFileContentApproval(params: {
    agent: ClientConnection;
    targetClient: TargetClient;
    messageId: string;
    requestId: string;
    pattern: string;
    path?: string;
  }): void {
    const { agent, targetClient, messageId, requestId, pattern, path } = params;

    const payload: SearchConfirmation = {
      type: "message" as const,
      actionType: "FILESEARCH" as const,
      templateType: "FILESEARCH" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "search" as const,
        query: pattern,
        path: path || "*",
        results: [],
        stateEvent: "ASK_FOR_CONFIRMATION" as const,
      },
    };

    this.sendApprovalMessage(agent, targetClient, payload, `search file content with pattern: ${pattern}`);
  }

  /**
   * Request approval for read many files operation
   */
  requestReadManyFilesApproval(params: {
    agent: ClientConnection;
    targetClient: TargetClient;
    messageId: string;
    requestId: string;
    paths: string[];
  }): void {
    const { agent, targetClient, messageId, requestId, paths } = params;

    const payload: FileReadConfirmation = {
      type: "message" as const,
      actionType: "READFILE" as const,
      templateType: "READFILE" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: paths.join(", "),
        content: "",
        stateEvent: "ASK_FOR_CONFIRMATION" as const,
      },
    };

    this.sendApprovalMessage(agent, targetClient, payload, `reading ${paths.length} files`);
  }

  /**
   * Send approval message to the target client
   */
  private sendApprovalMessage(
    agent: ClientConnection,
    targetClient: TargetClient,
    payload: FileWriteConfirmation | FileReadConfirmation | FolderReadConfirmation | SearchConfirmation,
    operationDescription: string
  ): void {
    if (targetClient.type === "app") {
      this.connectionManager.getAppConnectionManager().sendToApp(targetClient.id, payload);
    } else {
      this.connectionManager.getTuiConnectionManager().sendToTui(targetClient.id, payload);
    }

    this.sendMessageToRemote.forwardAgentMessage(agent, payload);

    logger.info(
      formatLogMessage(
        "info",
        "ApprovalService",
        `Requested approval for ${operationDescription}`
      )
    );
  }

  /**
   * Static factory method for one-off usage
   */
  static getInstance(): ApprovalService {
    return new ApprovalService();
  }
}
