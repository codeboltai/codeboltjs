import type { ClientConnection } from "../../types";
import type { TargetClient } from "../../shared/utils/ClientResolver";
import { BaseNotificationService } from "../../main/notificationManager/BaseNotificationService";
import type {
  FileReadResponseNotification,
  FileReadErrorNotification,
  WriteToFileResponseNotification,
  ListDirectoryResponseNotification,
  ListDirectoryRequestNotification,
  FileCreateRequestNotification,
  FileCreateResponseNotification,
  FolderCreateRequestNotification,
  FolderCreateResponseNotification,
  FileDeleteRequestNotification,
  FileDeleteResponseNotification,
  FolderDeleteRequestNotification,
  FolderDeleteResponseNotification,
  FileEditRequestNotification,
  FileEditResponseNotification,
  AppendToFileRequestNotification,
  AppendToFileResponseNotification,
  CopyFileRequestNotification,
  CopyFileResponseNotification,
  MoveFileRequestNotification,
  MoveFileResponseNotification
} from "@codebolt/types/wstypes/agent-to-app-ws/notification/fsNotificationSchemas";
import type { ListDirectoryForSearchResult } from '@codebolt/types/wstypes/agent-to-app-ws/notification/searchNotificationSchemas';

/**
 * Service for handling file system notifications
 */
export class FileNotificationService extends BaseNotificationService {
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
      data: {
        content,
        filePath
      },
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
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
      data: {
        content: reason,
        filePath: filePath
      },
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
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
        filePath: filePath,
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

    const notification: ListDirectoryForSearchResult = {
      action: "listDirectoryForSearchResult",
      content: entries,
      data: {
        dirPath: path,
        entries: entries.map(entry => ({
          name: entry,
          type: 'file' as 'file' | 'directory',
          path: entry,
          size: 0,
          modified: undefined
        })),
        totalEntries: entries.length
      },
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
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
      data: {
        content: error,
        filePath: filePath
      },
      type: "fsnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
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
}
