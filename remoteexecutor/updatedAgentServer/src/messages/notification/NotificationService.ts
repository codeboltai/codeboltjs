import type { ClientConnection } from "../../types";
import type { TargetClient } from "../../shared/utils/ClientResolver";
import { BaseNotificationService } from "../../main/notificationManager/BaseNotificationService";
import { FileNotificationService } from "./FileNotificationService";
import { SearchNotificationService } from "./SearchNotificationService";
import { AiNotificationService } from "./AiNotificationService";
import { ChatNotificationService } from "./ChatNotificationService";

// Legacy interface for backward compatibility
export interface NotificationMessage {
  type: string;
  action: string;
  data?: any;
  timestamp: number;
}

/**
 * Main NotificationService that acts as a facade for all specialized notification services
 */
export class NotificationService extends BaseNotificationService {
  private static instance: NotificationService;
  private fileService: FileNotificationService;
  private searchService: SearchNotificationService;
  private aiService: AiNotificationService;
  private chatService: ChatNotificationService;

  private constructor() {
    super();
    this.fileService = new FileNotificationService();
    this.searchService = new SearchNotificationService();
    this.aiService = new AiNotificationService();
    this.chatService = new ChatNotificationService();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // File System Notifications
  sendFileWriteSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    filePath: string;
    content: string;
    originalContent?: string;
    diff?: string;
    targetClient?: TargetClient;
  }): void {
    this.fileService.sendFileWriteSuccess(params);
  }

  sendFileWriteRejection(params: {
    agent: ClientConnection;
    requestId: string;
    filePath: string;
    reason: string;
    targetClient?: TargetClient;
  }): void {
    this.fileService.sendFileWriteRejection(params);
  }

  sendFileReadSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    filePath: string;
    content: string;
    targetClient?: TargetClient;
  }): void {
    this.fileService.sendFileReadSuccess(params);
  }

  sendFolderReadSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    entries: string[];
    targetClient?: TargetClient;
  }): void {
    this.fileService.sendFolderReadSuccess(params);
  }

  sendFolderReadRejection(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    reason: string;
    targetClient?: TargetClient;
  }): void {
    this.fileService.sendFolderReadRejection(params);
  }

  sendFileWriteError(params: {
    agent: ClientConnection;
    requestId: string;
    filePath: string;
    error: string;
    originalContent?: string;
    diff?: string;
    targetClient?: TargetClient;
  }): void {
    this.fileService.sendFileWriteError(params);
  }

  sendFolderReadError(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.fileService.sendFolderReadError(params);
  }

  // Search Notifications
  sendSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    path: string;
    results: any[];
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendSearchSuccess(params);
  }

  sendSearchRejection(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    path: string;
    reason: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendSearchRejection(params);
  }

  sendSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    path: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendSearchError(params);
  }

  sendCodebaseSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    targetDirectories?: string[];
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendCodebaseSearchRequest(params);
  }

  sendCodebaseSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    results: Array<{
      file: string;
      content: string;
      line?: number;
      score?: number;
    }>;
    totalResults?: number;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendCodebaseSearchSuccess(params);
  }

  sendCodebaseSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendCodebaseSearchError(params);
  }

  sendFileSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    regex: string;
    filePattern?: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendFileSearchRequest(params);
  }

  sendFileSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    regex: string;
    results: Array<{
      file: string;
      matches: Array<{
        line: number;
        content: string;
        matchIndex?: number;
      }>;
    }>;
    totalMatches?: number;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendFileSearchSuccess(params);
  }

  sendFileSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    regex: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendFileSearchError(params);
  }

  sendMcpToolSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    tags?: string[];
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendMcpToolSearchRequest(params);
  }

  sendMcpToolSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    tools: Array<{
      name: string;
      description: string;
      category?: string;
      tags?: string[];
    }>;
    totalTools?: number;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendMcpToolSearchSuccess(params);
  }

  sendMcpToolSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendMcpToolSearchError(params);
  }

  sendGetFirstLinkRequest(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendGetFirstLinkRequest(params);
  }

  sendGetFirstLinkSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    url?: string;
    title?: string;
    snippet?: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendGetFirstLinkSuccess(params);
  }

  sendGetFirstLinkError(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendGetFirstLinkError(params);
  }

  sendFolderSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    folderPath: string;
    query: string;
    recursive?: boolean;
    fileTypes?: string[];
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendFolderSearchRequest(params);
  }

  sendFolderSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    folderPath: string;
    query: string;
    results: Array<{
      file: string;
      matches: Array<{
        line: number;
        content: string;
        matchIndex?: number;
      }>;
    }>;
    totalMatches?: number;
    filesSearched?: number;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendFolderSearchSuccess(params);
  }

  sendFolderSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    folderPath: string;
    query: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendFolderSearchError(params);
  }

  sendListDirectoryForSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    dirPath: string;
    includeHidden?: boolean;
    maxDepth?: number;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendListDirectoryForSearchRequest(params);
  }

  sendListDirectoryForSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    dirPath: string;
    entries: Array<{
      name: string;
      type: 'file' | 'directory';
      path: string;
      size?: number;
      modified?: string;
    }>;
    totalEntries?: number;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendListDirectoryForSearchSuccess(params);
  }

  sendListDirectoryForSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    dirPath: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendListDirectoryForSearchError(params);
  }

  sendGrepSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    pattern: string;
    path?: string;
    results: Array<{
      file: string;
      line: number;
      content: string;
    }>;
    totalMatches?: number;
    filesWithMatches?: number;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendGrepSearchSuccess(params);
  }

  sendGrepSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    pattern: string;
    path?: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendGrepSearchError(params);
  }

  sendGlobSearchSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    pattern: string;
    path?: string;
    results: Array<{
      path: string;
    }>;
    totalFiles?: number;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendGlobSearchSuccess(params);
  }

  sendGlobSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    pattern: string;
    path?: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    this.searchService.sendGlobSearchError(params);
  }

  // AI/LLM Notifications
  sendAiRequestNotification(params: {
    agent: ClientConnection;
    messageId: string;
    agentId: string;
    threadId: string;
    agentInstanceId: string;
    parentAgentInstanceId: string;
    message: string;
    parentId: string;
    requestId: string;
    targetClient?: TargetClient;
  }): void {
    this.aiService.sendAiRequestNotification(params);
  }

  sendAiRequestErrorNotification(params: {
    agent: ClientConnection;
    messageId: string;
    agentId: string;
    threadId: string;
    agentInstanceId: string;
    parentAgentInstanceId: string;
    message: string;
    parentId: string;
    requestId: string;
    targetClient?: TargetClient;
  }): void {
    this.aiService.sendAiRequestErrorNotification(params);
  }

  sendAiRequestSuccessNotification(params: {
    agent: ClientConnection;
    messageId: string;
    agentId: string;
    threadId: string;
    agentInstanceId: string;
    parentAgentInstanceId: string;
    message: string;
    parentId: string;
    requestId: string;
    targetClient?: TargetClient;
  }): void {
    this.aiService.sendAiRequestSuccessNotification(params);
  }

  // Chat and Todos Notifications
  sendChatMessageNotification(params: {
    agent: ClientConnection;
    messageId: string;
    agentId: string;
    threadId: string;
    agentInstanceId: string;
    parentAgentInstanceId: string;
    message: string;
    parentId: string;
    requestId: string;
    targetClient?: TargetClient;
  }): void {
    this.chatService.sendChatMessageNotification(params);
  }

  sendWriteTodosRequest(params: {
    agent: ClientConnection;
    requestId: string;
    todos: Array<{
      id: string;
      title: string;
      status: string;
      priority?: string;
      tags?: string[];
    }>;
    targetClient?: TargetClient;
  }): void {
    this.chatService.sendWriteTodosRequest(params);
  }

  sendWriteTodosResponse(params: {
    agent: ClientConnection;
    requestId: string;
    content: string | any;
    isError?: boolean;
    targetClient?: TargetClient;
  }): void {
    this.chatService.sendWriteTodosResponse(params);
  }
}
