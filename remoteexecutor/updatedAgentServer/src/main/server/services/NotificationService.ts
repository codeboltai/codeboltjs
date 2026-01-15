/**
 * Notification service for broadcasting events to clients
 */

import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { formatLogMessage } from '../../../types';
import type {
  ChatNotification,
  AgentTextResponseNotification,
  UserMessageRequestNotification

} from '@codebolt/types/agent-to-app-ws-types';
import { logger } from '../../utils/logger';
import type  {FileReadResponseNotification, WriteTodosResponseNotification} from '@codebolt/types/wstypes/agent-to-app-ws/notification';
import type {
  ListDirectoryForSearchResult,
  GrepSearchResult,
  GlobSearchResult,
  CodebaseSearchResult,
  SearchFilesResult
} from '@codebolt/types/wstypes/agent-to-app-ws/notification/searchNotificationSchemas';

// Add the missing interfaces for the search notification parameters
export interface ListDirectoryForSearchSuccessParams {
  agent: any;
  requestId: string;
  dirPath: string;
  entries: Array<{
    name: string;
    type: 'file' | 'directory';
    size?: number;
    modified?: string;
    path: string;
  }>;
  totalEntries: number;
}

export interface ListDirectoryForSearchErrorParams {
  agent: any;
  requestId: string;
  dirPath: string;
  error: string;
}

export interface GrepSearchSuccessParams {
  agent: any;
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
}

export interface GrepSearchErrorParams {
  agent: any;
  requestId: string;
  pattern: string;
  path?: string;
  error: string;
}

export interface GlobSearchSuccessParams {
  agent: any;
  requestId: string;
  pattern: string;
  path?: string;
  results: Array<{
    path: string;
  }>;
  totalFiles?: number;
}

export interface GlobSearchErrorParams {
  agent: any;
  requestId: string;
  pattern: string;
  path?: string;
  error: string;
}

export interface CodebaseSearchSuccessParams {
  agent: any;
  requestId: string;
  query: string;
  results: Array<{
    file: string;
    content: string;
    line?: number;
    score?: number;
  }>;
  totalResults?: number;
}

export interface CodebaseSearchErrorParams {
  agent: any;
  requestId: string;
  query: string;
  error: string;
}

export interface SearchFilesSuccessParams {
  agent: any;
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
}

export interface SearchFilesErrorParams {
  agent: any;
  requestId: string;
  path: string;
  regex: string;
  error: string;
}

// Add new interfaces for the raw data that comes from tool execution
export interface GlobToolResult {
  name?: string;
  path?: string;
  file?: string;
  type?: 'file' | 'directory';
  isDirectory?: boolean;
  size?: number;
  modified?: string;
  mtime?: string;
}

export interface SearchFilesToolResult {
  file?: string;
  path?: string;
  content?: string;
  text?: string;
  line?: number;
  score?: number;
}

export interface ListFilesToolResult {
  name?: string;
  path?: string;
  file?: string;
  type?: 'file' | 'directory';
  isDirectory?: boolean;
  size?: number;
  modified?: string;
  mtime?: string;
}

export interface FileSearchToolResult {
  entries?: Array<{
    file: string;
    matches: Array<{
      line: number;
      content: string;
    }>;
  }>;
}

// Add new interfaces for todo write notification parameters
export interface WriteTodosSuccessParams {
  agent: any;
  requestId: string;
  todos: Array<{
    id: string;
    title: string;
    status: string;
    priority?: string;
    tags?: string[];
  }>;
  message?: string;
}

export interface WriteTodosErrorParams {
  agent: any;
  requestId: string;
  error: string;
  message?: string;
}

// Legacy interface for backward compatibility
export interface NotificationMessage {
  type: string;
  action: string;
  data?: any;
  timestamp: number;
}
export class NotificationService {
  private static instance: NotificationService;
  private connectionManager: ConnectionManager;
  private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (error: any) => void }> = new Map();

  private constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Broadcast notification to all apps (not agents)
   */
  broadcast(notification:any): void {
    logger.info(formatLogMessage('info', 'NotificationService', `Broadcasting notification: ${notification.action}`));
    
    const connections = this.connectionManager.getAllConnections();
    const apps = connections.filter(conn => conn.type === 'app');

    apps.forEach(app => {
      try {
        app.ws.send(JSON.stringify(notification));
      } catch (error) {
        logger.error(formatLogMessage('error', 'NotificationService', `Failed to send notification to ${app.id}: ${error}`));
      }
    });
  }

  /**
   * Send notification to the specific app that started this agent
   */
  sendToAppRelatedToAgentId(agentId: string, notification: NotificationMessage, waitForResponse?: boolean): Promise<any> | void {
    logger.info(formatLogMessage('info', 'NotificationService', `Sending notification to app related to agent: ${agentId}`));
    
    // Get the parent app ID for this agent
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const parentId = agentManager.getParentByAgent(agentId);
    if (!parentId) {
      logger.warn(formatLogMessage('warn', 'NotificationService', `No parent app found for agent ${agentId}, falling back to broadcast`));
      this.broadcast(notification);
      if (waitForResponse) {
        return Promise.reject(new Error(`No parent app found for agent ${agentId}`));
      }
      return;
    }

    // Get the parent app connection
    const parentConnection = this.connectionManager.getConnection(parentId);
    if (!parentConnection) {
      logger.warn(formatLogMessage('warn', 'NotificationService', `Parent app ${parentId} not found for agent ${agentId}`));
      if (waitForResponse) {
        return Promise.reject(new Error(`Parent app ${parentId} not found for agent ${agentId}`));
      }
      return;
    }

    if (parentConnection.type !== 'app') {
      logger.warn(formatLogMessage('warn', 'NotificationService', `Parent ${parentId} is not an app connection, type: ${parentConnection.type}`));
      if (waitForResponse) {
        return Promise.reject(new Error(`Parent ${parentId} is not an app connection`));
      }
      return;
    }

    try {
      parentConnection.ws.send(JSON.stringify(notification));
      logger.info(formatLogMessage('info', 'NotificationService', `Notification sent to parent app ${parentId} for agent ${agentId}`));
      
      // If waiting for response and notification has a requestId, create a promise
      if (waitForResponse && (notification as any).requestId) {
        return this.createPendingRequest((notification as any).requestId);
      }
    } catch (error) {
      logger.error(formatLogMessage('error', 'NotificationService', `Failed to send notification to parent app ${parentId}: ${error}`));
      if (waitForResponse) {
        return Promise.reject(error);
      }
    }
  }

  /**
   * Send notification to specific app
   */
  sendToApp(appId: string, notification: NotificationMessage): void {
    const connection = this.connectionManager.getConnection(appId);
    if (!connection) {
      logger.warn(formatLogMessage('warn', 'NotificationService', `App ${appId} not found`));
      return;
    }

    if (connection.type === 'agent') {
      logger.warn(formatLogMessage('warn', 'NotificationService', `Cannot send notification to agent ${appId}`));
      return;
    }

    try {
      connection.ws.send(JSON.stringify(notification));
    } catch (error) {
      logger.error(formatLogMessage('error', 'NotificationService', `Failed to send notification to ${appId}: ${error}`));
    }
  }

  /**
   * Notify about file operations
   */
  notifyFileOperation(notification:FileReadResponseNotification): void {
    this.broadcast(notification);
  }

  /**
   * Notify about AI operations
   */
  notifyAIOperation(operation: 'request' | 'response', prompt?: string, response?: string, error?: string): void {
    this.broadcast({
      type: 'notification',
      action: `ai-${operation}`,
      data: { prompt, response, error },
      timestamp: Date.now()
    });
  }

  /**
   * Notify about agent activity
   */
  notifyAgentActivity(agentId: string, activity: string, data?: any): void {
    this.broadcast({
      type: 'notification',
      action: 'agent-activity',
      data: { agentId, activity, ...data },
      timestamp: Date.now()
    });
  }

  /**
   * Send typed chat notification to app
   */
  sendChatNotification(agentId: string, notification: ChatNotification): void {
    logger.info(formatLogMessage('info', 'NotificationService', `Sending chat notification: ${notification.action} from agent ${agentId}`));
    this.sendToAppRelatedToAgentId(agentId, notification as any);
  }

  /**
   * Send agent text response to app
   */
  sendAgentTextResponse(agentId: string, requestId: string, message: string, conversationId?: string): void {
    const notification: AgentTextResponseNotification = {
      requestId,
      toolUseId: requestId,
      type: 'chatnotify',
      action: 'agentTextResponse',
      content: message,
      agentId,
      data: {
        message,
        timestamp: new Date().toISOString(),
        agentId,
        conversationId
      }
    };

    this.sendChatNotification(agentId, notification);
  }

  /**
   * Send user message request notification
   */
  sendUserMessageRequest(agentId: string, requestId: string, message: string, payload?: any): void {
    const notification: UserMessageRequestNotification = {
      requestId,
      toolUseId: requestId,
      type: 'chatnotify',
      action: 'sendMessageRequest',
      agentId,
      data: {
        message,
        payload
      }
    };

    this.sendChatNotification(agentId, notification);
  }

  /**
   * Send typed notification (replaces legacy methods)
   */
  sendTypedNotification(agentId: string, notification: unknown): void {
    const action = (notification as any)?.action ?? 'unknown';
    logger.info(formatLogMessage('info', 'NotificationService', `Sending typed notification: ${action} from agent ${agentId}`));
    this.sendToAppRelatedToAgentId(agentId, notification as any);
  }

  /**
   * Create a pending request that waits for a response
   */
  private createPendingRequest(requestId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Store the pending request
      this.pendingRequests.set(requestId, {
        resolve,
        reject
      });

      logger.info(formatLogMessage('info', 'NotificationService', `Created pending request ${requestId}`));
    });
  }

  /**
   * Handle incoming response from app socket
   * This should be called when a response message is received from the app
   */
  handleResponse(requestId: string, response: any): void {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      logger.warn(formatLogMessage('warn', 'NotificationService', `No pending request found for requestId: ${requestId}`));
      return;
    }

    // Remove from pending requests
    this.pendingRequests.delete(requestId);

    // Resolve the promise
    pendingRequest.resolve(response);
    logger.info(formatLogMessage('info', 'NotificationService', `Resolved pending request ${requestId}`));
  }

  /**
   * Handle error for a pending request
   */
  handleRequestError(requestId: string, error: any): void {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      logger.warn(formatLogMessage('warn', 'NotificationService', `No pending request found for requestId: ${requestId}`));
      return;
    }

    // Remove from pending requests
    this.pendingRequests.delete(requestId);

    // Reject the promise
    pendingRequest.reject(error);
    logger.info(formatLogMessage('error', 'NotificationService', `Rejected pending request ${requestId}: ${error}`));
  }

  /**
   * Get count of pending requests (for debugging)
   */
  getPendingRequestCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Clean up all pending requests (useful for shutdown)
   */
  cleanup(): void {
    for (const [requestId, pendingRequest] of this.pendingRequests) {
      pendingRequest.reject(new Error('NotificationService is shutting down'));
    }
    this.pendingRequests.clear();
    logger.info(formatLogMessage('info', 'NotificationService', 'Cleaned up all pending requests'));
  }

  /**
   * Send list directory for search success notification
   */
  sendListDirectoryForSearchSuccess(params: ListDirectoryForSearchSuccessParams): void {
    const { agent, requestId, dirPath, entries, totalEntries } = params;
    
    const notification: ListDirectoryForSearchResult = {
      requestId,
      toolUseId: requestId,
      type: 'searchnotify',
      action: 'listDirectoryForSearchResult',
      content: `Directory listing completed: ${dirPath}`,
      data: {
        dirPath,
        entries,
        totalEntries
      }
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send list directory for search success notification from raw results
   */
  sendListDirectoryForSearchSuccessFromRaw(params: { 
    agent: any; 
    requestId: string; 
    dirPath: string; 
    results: Array<{ 
      name?: string; 
      path?: string; 
      file?: string; 
      type?: 'file' | 'directory'; 
      isDirectory?: boolean; 
      size?: number; 
      modified?: string; 
      mtime?: string; 
    }> 
  }): void {
    const { agent, requestId, dirPath, results } = params;
    
    const formattedEntries = results.map((item) => ({
      name: item.name || item.path?.split('/').pop() || 'unknown',
      type: item.type || (item.isDirectory ? 'directory' : 'file') as 'file' | 'directory',
      path: item.path || item.file || 'unknown',
      size: item.size || 0,
      modified: item.modified || item.mtime || undefined
    }));
    
    this.sendListDirectoryForSearchSuccess({
      agent,
      requestId,
      dirPath,
      entries: formattedEntries,
      totalEntries: formattedEntries.length
    });
  }

  /**
   * Send list directory for search error notification
   */
  sendListDirectoryForSearchError(params: ListDirectoryForSearchErrorParams): void {
    const { agent, requestId, dirPath, error } = params;
    
    const notification: ListDirectoryForSearchResult = {
      requestId,
      toolUseId: requestId,
      type: 'searchnotify',
      action: 'listDirectoryForSearchResult',
      content: `Directory listing failed: ${dirPath}`,
      isError: true,
      data: {
        dirPath,
        entries: [],
        totalEntries: 0
      }
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send grep search success notification
   */
  sendGrepSearchSuccess(params: GrepSearchSuccessParams): void {
    const { agent, requestId, pattern, path, results, totalMatches, filesWithMatches } = params;
    
    const notification: GrepSearchResult = {
      requestId,
      toolUseId: requestId,
      type: 'searchnotify',
      action: 'grepSearchResult',
      content: `Grep search completed for pattern: ${pattern}`,
      data: {
        pattern,
        path,
        results,
        totalMatches,
        filesWithMatches
      }
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send grep search success notification from raw results
   */
  sendGrepSearchSuccessFromRaw(params: { 
    agent: any; 
    requestId: string; 
    path: string; 
    regex: string; 
    results: { 
      entries?: Array<{ 
        file: string; 
        matches: Array<{ 
          line: number; 
          content: string; 
        }> 
      }> 
    } 
  }): void {
    const { agent, requestId, path, regex, results } = params;
    
    const formattedResults = (results.entries || []).map(entry => ({
      file: entry.file,
      matches: entry.matches
    }));
    
    const totalMatches = formattedResults.reduce((sum, r) => sum + r.matches.length, 0);
    
    this.sendGrepSearchSuccess({
      agent,
      requestId,
      pattern: regex,
      path,
      results: formattedResults.flatMap(entry => 
        entry.matches.map(match => ({
          file: entry.file,
          line: match.line,
          content: match.content
        }))
      ),
      totalMatches,
      filesWithMatches: formattedResults.length
    });
  }

  /**
   * Send grep search error notification
   */
  sendGrepSearchError(params: GrepSearchErrorParams): void {
    const { agent, requestId, pattern, path, error } = params;
    
    const notification: GrepSearchResult = {
      requestId,
      toolUseId: requestId,
      type: 'searchnotify',
      action: 'grepSearchResult',
      content: `Grep search failed for pattern: ${pattern}`,
      isError: true,
      data: {
        pattern,
        path,
        results: [],
        totalMatches: 0,
        filesWithMatches: 0
      }
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send codebase search success notification
   */
  sendCodebaseSearchSuccess(params: CodebaseSearchSuccessParams): void {
    const { agent, requestId, query, results, totalResults } = params;
    
    const notification: CodebaseSearchResult = {
      requestId,
      toolUseId: requestId,
      type: 'searchnotify',
      action: 'codebaseSearchResult',
      content: `Codebase search completed for query: ${query}`,
      data: {
        query,
        results,
        totalResults
      }
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send codebase search success notification from raw results
   */
  sendCodebaseSearchSuccessFromRaw(params: { 
    agent: any; 
    requestId: string; 
    query: string; 
    results: Array<{ 
      file?: string; 
      path?: string; 
      content?: string; 
      text?: string; 
      line?: number; 
      score?: number; 
    }> 
  }): void {
    const { agent, requestId, query, results } = params;
    
    const formattedResults = results.map((item) => ({
      file: item.file || item.path || 'unknown',
      content: item.content || item.text || '',
      line: item.line || 0,
      score: item.score || 1.0
    }));
    
    this.sendCodebaseSearchSuccess({
      agent,
      requestId,
      query,
      results: formattedResults,
      totalResults: formattedResults.length
    });
  }

  /**
   * Send codebase search error notification
   */
  sendCodebaseSearchError(params: CodebaseSearchErrorParams): void {
    const { agent, requestId, query, error } = params;
    
    const notification: CodebaseSearchResult = {
      requestId,
      toolUseId: requestId,
      type: 'searchnotify',
      action: 'codebaseSearchResult',
      content: `Codebase search failed for query: ${query}`,
      isError: true,
      data: {
        query,
        results: [],
        totalResults: 0
      }
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send search files success notification
   */
  sendSearchFilesSuccess(params: SearchFilesSuccessParams): void {
    const { agent, requestId, path, regex, results, totalMatches } = params;
    
    const notification: SearchFilesResult = {
      requestId,
      toolUseId: requestId,
      type: 'searchnotify',
      action: 'searchFilesResult',
      content: `File search completed for regex: ${regex} in path: ${path}`,
      data: {
        path,
        regex,
        results,
        totalMatches
      }
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send search files error notification
   */
  sendSearchFilesError(params: SearchFilesErrorParams): void {
    const { agent, requestId, path, regex, error } = params;
    
    const notification: SearchFilesResult = {
      requestId,
      toolUseId: requestId,
      type: 'searchnotify',
      action: 'searchFilesResult',
      content: `File search failed for regex: ${regex} in path: ${path}`,
      isError: true,
      data: {
        path,
        regex,
        results: [],
        totalMatches: 0
      }
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send file search success notification (alias for sendSearchFilesSuccess)
   */
  sendFileSearchSuccess(params: SearchFilesSuccessParams): void {
    this.sendSearchFilesSuccess(params);
  }

  /**
   * Send file search error notification (alias for sendSearchFilesError)
   */
  sendFileSearchError(params: SearchFilesErrorParams): void {
    this.sendSearchFilesError(params);
  }

  /**
   * Send list directory for search success notification from raw glob results
   */
  sendWriteTodosSuccess(params: WriteTodosSuccessParams): void {
    const { agent, requestId, todos, message } = params;
    
    const notification:WriteTodosResponseNotification = {
      requestId,
      toolUseId: requestId,
      type: 'writetodosnotify',
      action: 'writeTodosResult',
      content: todos || 'Todos updated successfully',
    };

    this.sendTypedNotification(agent.id, notification);
  }

  /**
   * Send write todos error notification
   */
  sendWriteTodosError(params: WriteTodosErrorParams): void {
    const { agent, requestId, error, message } = params;
    
    const notification = {
      requestId,
      toolUseId: requestId,
      type: 'writetodosnotify',
      action: 'writeTodosResult',
      content: message || 'Failed to update todos',
      isError: true,
      error: error
    };

    this.sendTypedNotification(agent.id, notification);
  }
}
