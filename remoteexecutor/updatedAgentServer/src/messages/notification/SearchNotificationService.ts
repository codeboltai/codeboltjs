import type { ClientConnection } from "../../types";
import type { TargetClient } from "../../shared/utils/ClientResolver";
import { BaseNotificationService } from "./BaseNotificationService";
import type {
  WebSearchResult,
  CodebaseSearchResult,
  SearchFilesResult,
  SearchMcpToolResult,
  GetFirstLinkResult,
  FolderSearchResult,
  ListDirectoryForSearchResult,
  WebSearchRequest,
  CodebaseSearchRequest,
  SearchFilesRequest,
  SearchMcpToolRequest,
  GetFirstLinkRequest,
  FolderSearchRequest,
  ListDirectoryForSearchRequest,
  GrepSearchResult,
  GlobSearchResult
} from '@codebolt/types/wstypes/agent-to-app-ws/notification/searchNotificationSchemas';

/**
 * Service for handling search-related notifications
 */
export class SearchNotificationService extends BaseNotificationService {
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

    const notification: WebSearchResult = {
      action: "webSearchResult",
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

    const notification: WebSearchResult = {
      action: "webSearchResult",
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

    const notification: WebSearchResult = {
      action: "webSearchResult",
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
   * Send codebase search request notification
   */
  sendCodebaseSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    targetDirectories?: string[];
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, targetDirectories, targetClient } = params;

    const notification: CodebaseSearchRequest = {
      action: "codebaseSearchRequest",
      data: {
        query: query,
        target_directories: targetDirectories
      },
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send codebase search success notification
   */
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
    const { agent, requestId, query, results, totalResults, targetClient } = params;

    const notification: CodebaseSearchResult = {
      action: "codebaseSearchResult",
      content: results,
      data: {
        query: query,
        results: results,
        totalResults: totalResults
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
   * Send codebase search error notification
   */
  sendCodebaseSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, error, targetClient } = params;

    const notification: CodebaseSearchResult = {
      action: "codebaseSearchResult",
      content: error,
      data: {
        query: query,
        results: [],
        totalResults: 0
      },
      type: "searchnotify",
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
   * Send file search request notification
   */
  sendFileSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    regex: string;
    filePattern?: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, path, regex, filePattern, targetClient } = params;

    const notification: SearchFilesRequest = {
      action: "searchFilesRequest",
      data: {
        path: path,
        regex: regex,
        filePattern: filePattern
      },
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send file search success notification
   */
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
    const { agent, requestId, path, regex, results, totalMatches, targetClient } = params;

    const notification: SearchFilesResult = {
      action: "searchFilesResult",
      content: results,
      data: {
        path: path,
        regex: regex,
        results: results,
        totalMatches: totalMatches
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
   * Send file search error notification
   */
  sendFileSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    path: string;
    regex: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, path, regex, error, targetClient } = params;

    const notification: SearchFilesResult = {
      action: "searchFilesResult",
      content: error,
      data: {
        path: path,
        regex: regex,
        results: [],
        totalMatches: 0
      },
      type: "searchnotify",
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
   * Send MCP tool search request notification
   */
  sendMcpToolSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    tags?: string[];
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, tags, targetClient } = params;

    const notification: SearchMcpToolRequest = {
      action: "searchMcpToolRequest",
      data: {
        query: query,
        tags: tags
      },
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send MCP tool search success notification
   */
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
    const { agent, requestId, query, tools, totalTools, targetClient } = params;

    const notification: SearchMcpToolResult = {
      action: "searchMcpToolResult",
      content: tools,
      data: {
        query: query,
        tools: tools,
        totalTools: totalTools
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
   * Send MCP tool search error notification
   */
  sendMcpToolSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, error, targetClient } = params;

    const notification: SearchMcpToolResult = {
      action: "searchMcpToolResult",
      content: error,
      data: {
        query: query,
        tools: [],
        totalTools: 0
      },
      type: "searchnotify",
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
   * Send get first link request notification
   */
  sendGetFirstLinkRequest(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, targetClient } = params;

    const notification: GetFirstLinkRequest = {
      action: "getFirstLinkRequest",
      data: {
        query: query
      },
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send get first link success notification
   */
  sendGetFirstLinkSuccess(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    url?: string;
    title?: string;
    snippet?: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, url, title, snippet, targetClient } = params;

    const notification: GetFirstLinkResult = {
      action: "getFirstLinkResult",
      content: {
        url: url,
        title: title,
        snippet: snippet
      },
      data: {
        query: query,
        url: url,
        title: title,
        snippet: snippet
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
   * Send get first link error notification
   */
  sendGetFirstLinkError(params: {
    agent: ClientConnection;
    requestId: string;
    query: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, query, error, targetClient } = params;

    const notification: GetFirstLinkResult = {
      action: "getFirstLinkResult",
      content: error,
      data: {
        query: query,
        url: "",
        title: "",
        snippet: ""
      },
      type: "searchnotify",
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
   * Send folder search request notification
   */
  sendFolderSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    folderPath: string;
    query: string;
    recursive?: boolean;
    fileTypes?: string[];
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, folderPath, query, recursive, fileTypes, targetClient } = params;

    const notification: FolderSearchRequest = {
      action: "folderSearchRequest",
      data: {
        folderPath: folderPath,
        query: query,
        recursive: recursive,
        fileTypes: fileTypes
      },
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send folder search success notification
   */
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
    const { agent, requestId, folderPath, query, results, totalMatches, filesSearched, targetClient } = params;

    const notification: FolderSearchResult = {
      action: "folderSearchResult",
      content: results,
      data: {
        folderPath: folderPath,
        query: query,
        results: results,
        totalMatches: totalMatches,
        filesSearched: filesSearched
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
   * Send folder search error notification
   */
  sendFolderSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    folderPath: string;
    query: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, folderPath, query, error, targetClient } = params;

    const notification: FolderSearchResult = {
      action: "folderSearchResult",
      content: error,
      data: {
        folderPath: folderPath,
        query: query,
        results: [],
        totalMatches: 0,
        filesSearched: 0
      },
      type: "searchnotify",
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
   * Send list directory for search request notification
   */
  sendListDirectoryForSearchRequest(params: {
    agent: ClientConnection;
    requestId: string;
    dirPath: string;
    includeHidden?: boolean;
    maxDepth?: number;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, dirPath, includeHidden, maxDepth, targetClient } = params;

    const notification: ListDirectoryForSearchRequest = {
      action: "listDirectoryForSearchRequest",
      data: {
        dirPath: dirPath,
        includeHidden: includeHidden,
        maxDepth: maxDepth
      },
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send list directory for search success notification
   */
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
    const { agent, requestId, dirPath, entries, totalEntries, targetClient } = params;

    const notification: ListDirectoryForSearchResult = {
      action: "listDirectoryForSearchResult",
      content: entries,
      data: {
        dirPath: dirPath,
        entries: entries,
        totalEntries: totalEntries
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
   * Send list directory for search error notification
   */
  sendListDirectoryForSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    dirPath: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, dirPath, error, targetClient } = params;

    const notification: ListDirectoryForSearchResult = {
      action: "listDirectoryForSearchResult",
      content: error,
      data: {
        dirPath: dirPath,
        entries: [],
        totalEntries: 0
      },
      type: "searchnotify",
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
   * Send grep search success notification
   */
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
    const { agent, requestId, pattern, path, results, totalMatches, filesWithMatches, targetClient } = params;

    const notification: GrepSearchResult = {
      action: "grepSearchResult",
      content: results,
      data: {
        pattern: pattern,
        path: path,
        results: results,
        totalMatches: totalMatches,
        filesWithMatches: filesWithMatches
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
   * Send grep search error notification
   */
  sendGrepSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    pattern: string;
    path?: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, pattern, path, error, targetClient } = params;

    const notification: GrepSearchResult = {
      action: "grepSearchResult",
      content: error,
      data: {
        pattern: pattern,
        path: path,
        results: [],
        totalMatches: 0,
        filesWithMatches: 0
      },
      type: "searchnotify",
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
   * Send glob search success notification
   */
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
    const { agent, requestId, pattern, path, results, totalFiles, targetClient } = params;

    const notification: GlobSearchResult = {
      action: "globSearchResult",
      content: results,
      data: {
        pattern: pattern,
        path: path,
        results: results,
        totalFiles: totalFiles
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
   * Send glob search error notification
   */
  sendGlobSearchError(params: {
    agent: ClientConnection;
    requestId: string;
    pattern: string;
    path?: string;
    error: string;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, pattern, path, error, targetClient } = params;

    const notification: GlobSearchResult = {
      action: "globSearchResult",
      content: error,
      data: {
        pattern: pattern,
        path: path,
        results: [],
        totalFiles: 0
      },
      type: "searchnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }
}
