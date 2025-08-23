/**
 * @fileoverview Message and Notification Helpers
 * @description Utilities for sending various types of notifications through CodeBolt WebSocket
 */

// @ts-ignore
const cbws = require('../../../../packages/codeboltjs/src/core/websocket');

const { 
  NotificationEventType,
  AgentNotificationAction,
  BrowserNotificationAction,
  ChatNotificationAction,
  CodeUtilsNotificationAction,
  CrawlerNotificationAction,
  DbMemoryNotificationAction,
  FsNotificationAction,
  GitNotificationAction,
  HistoryNotificationAction,
  LlmNotificationAction,
  McpNotificationAction,
  SearchNotificationAction,
  SystemNotificationAction,
  TerminalNotificationAction,
  TaskNotificationAction
} = require('../../../../common/types/dist/codeboltjstypes/notification.enum');

/**
 * Agent notification helper
 */
export function sendAgentNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-agent-${Date.now()}`,
    type: NotificationEventType.AGENT_NOTIFY,
    action: action,
    data: data,
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * File system notification helper
 */
export function sendFsNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-fs-${Date.now()}`,
    type: NotificationEventType.FS_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Terminal notification helper
 */
export function sendTerminalNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-terminal-${Date.now()}`,
    type: NotificationEventType.TERMINAL_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Git notification helper
 */
export function sendGitNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-git-${Date.now()}`,
    type: NotificationEventType.GIT_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Browser notification helper
 */
export function sendBrowserNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-browser-${Date.now()}`,
    type: NotificationEventType.BROWSER_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Crawler notification helper
 */
export function sendCrawlerNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-crawler-${Date.now()}`,
    type: NotificationEventType.CRAWLER_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Search notification helper
 */
export function sendSearchNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-search-${Date.now()}`,
    type: NotificationEventType.SEARCH_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Code utilities notification helper
 */
export function sendCodeUtilsNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-codeutils-${Date.now()}`,
    type: NotificationEventType.CODEUTILS_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * LLM notification helper
 */
export function sendLlmNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-llm-${Date.now()}`,
    type: NotificationEventType.LLM_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * MCP notification helper
 */
export function sendMcpNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-mcp-${Date.now()}`,
    type: NotificationEventType.MCP_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Chat notification helper
 */
export function sendChatNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-chat-${Date.now()}`,
    type: NotificationEventType.CHAT_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Task notification helper
 */
export function sendTaskNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-task-${Date.now()}`,
    type: NotificationEventType.TASK_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Database memory notification helper
 */
export function sendDbMemoryNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-dbmemory-${Date.now()}`,
    type: NotificationEventType.DBMEMORY_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * History notification helper
 */
export function sendHistoryNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-history-${Date.now()}`,
    type: NotificationEventType.HISTORY_NOTIFY,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * System notification helper
 */
export function sendSystemNotification(action: string, data: any, isError: boolean = false): void {
  const notification = {
    toolUseId: `e2b-system-${Date.now()}`,
    type: NotificationEventType.AGENT_NOTIFY, // Using AGENT_NOTIFY for system notifications
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
  cbws.messageManager.send(notification);
}

/**
 * Legacy notification function for backward compatibility
 */
export function sendNotification(type: 'info' | 'success' | 'warning' | 'error', message: string): void {
  try {
    switch (type) {
      case 'success':
        sendTerminalNotification(TerminalNotificationAction.EXECUTE_COMMAND_RESULT, 
          `[E2B Success] ${message}`);
        break;
      case 'warning':
        sendAgentNotification(AgentNotificationAction.START_SUBAGENT_TASK_RESULT, 
          `[E2B Warning] ${message}`);
        break;
      case 'error':
        sendTerminalNotification(TerminalNotificationAction.EXECUTE_COMMAND_RESULT, 
          `[E2B Error] ${message}`, true);
        break;
      case 'info':
      default:
        sendAgentNotification(AgentNotificationAction.START_SUBAGENT_TASK_REQUEST, {
          parentAgentId: 'e2b-provider',
          subagentId: 'e2b-sandbox',
          task: `[E2B Info] ${message}`,
          priority: 'normal',
          dependencies: []
        });
        break;
    }
  } catch (error) {
    console.error('[E2B Provider] Failed to send notification:', error);
  }
}

/**
 * Create notification with standard format
 */
export function createNotification(type: string, action: string, data: any, isError: boolean = false) {
  return {
    toolUseId: `e2b-${type}-${Date.now()}`,
    type: type,
    action: action,
    ...(typeof data === 'string' ? { content: data } : { data: data }),
    isError: isError
  };
}