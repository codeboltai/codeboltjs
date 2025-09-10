/**
 * @fileoverview Message and Notification Helpers
 * @description Utilities for sending various types of notifications through CodeBolt WebSocket
 */

import codebolt from '@codebolt/codeboltjs';
import { AgentNotificationAction, FsNotificationAction, GitNotificationAction, NotificationEventType, SearchNotificationAction, TerminalNotificationAction } from '@codebolt/types/enum';

/**
 * Agent notification helper
 */
export function sendAgentNotification(action: string, data: any, isError: boolean = false): void {
  try {
    // Use codebolt notification system for agent notifications
    if (action === AgentNotificationAction.START_SUBAGENT_TASK_REQUEST && typeof data === 'object') {
      codebolt.notify.agent.StartSubagentTaskRequestNotify(
        data.parentAgentId || 'e2b-provider',
        data.subagentId || 'e2b-sandbox',
        data.task || 'E2B task',
        data.priority || 'normal',
        data.dependencies || []
      );
    } else if (action === AgentNotificationAction.START_SUBAGENT_TASK_RESULT) {
      // For task results, use a generic log since there might not be a direct equivalent
      console.log(`[E2B Provider] Agent task result:`, {
        parentAgentId: 'e2b-provider',
        subagentId: 'e2b-sandbox',
        result: typeof data === 'string' ? data : JSON.stringify(data),
        success: !isError
      });
    } else {
      // Fallback for other actions
      console.log(`[E2B Provider] Agent notification - ${action}:`, data);
    }
  } catch (error) {
    console.error('[E2B Provider] Failed to send agent notification:', error);
  }
}

/**
 * File system notification helper
 */
export function sendFsNotification(action: string, data: any, isError: boolean = false): void {
  try {
    // Use codebolt notification system for file system notifications
    if (action === FsNotificationAction.READ_FILE_REQUEST) {
      codebolt.notify.fs.FileReadRequestNotify(
        typeof data === 'string' ? data : data.path || 'unknown'
      );
    } else if (action === FsNotificationAction.READ_FILE_RESULT) {
      codebolt.notify.fs.FileReadResponseNotify(
        data.content || data,
        isError
      );
    } else if (action === FsNotificationAction.WRITE_TO_FILE_REQUEST) {
      codebolt.notify.fs.WriteToFileRequestNotify(
        data.path || 'unknown',
        data.content || data
      );
    } else if (action === FsNotificationAction.WRITE_TO_FILE_RESULT) {
      codebolt.notify.fs.WriteToFileResponseNotify(
        data.path || 'unknown',
        !isError
      );
    } else {
      // Fallback for other actions
      console.log(`[E2B Provider] FS notification - ${action}:`, data);
    }
  } catch (error) {
    console.error('[E2B Provider] Failed to send fs notification:', error);
  }
}

/**
 * Terminal notification helper
 */
export function sendTerminalNotification(action: string, data: any, isError: boolean = false): void {
  try {
    // Use codebolt notification system for terminal notifications
    if (action === TerminalNotificationAction.EXECUTE_COMMAND_REQUEST) {
      codebolt.notify.terminal.CommandExecutionRequestNotify(
        typeof data === 'string' ? data : data.command || 'unknown',
        data.workingDirectory || data.cwd || process.cwd()
      );
    } else if (action === TerminalNotificationAction.EXECUTE_COMMAND_RESULT) {
      codebolt.notify.terminal.CommandExecutionResponseNotify(
        typeof data === 'string' ? data : data.output || data.content || '',
        isError,
        `e2b-terminal-${Date.now()}`
      );
    } else {
      // Fallback for other actions
      console.log(`[E2B Provider] Terminal notification - ${action}:`, data);
    }
  } catch (error) {
    console.error('[E2B Provider] Failed to send terminal notification:', error);
  }
}

/**
 * Git notification helper
 */
export function sendGitNotification(action: string, data: any, isError: boolean = false): void {
  try {
    // Use codebolt notification system for git notifications
    switch (action) {
      // Git Init
      case GitNotificationAction.INIT_REQUEST:
        codebolt.notify.git.GitInitRequestNotify(
          typeof data === 'string' ? data : data.path || data.repositoryPath || process.cwd()
        );
        break;
      
      case GitNotificationAction.INIT_RESULT:
        codebolt.notify.git.GitInitResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Pull
      case GitNotificationAction.PULL_REQUEST:
        codebolt.notify.git.GitPullRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd()
        );
        break;
      
      case GitNotificationAction.PULL_RESULT:
        codebolt.notify.git.GitPullResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Push
      case GitNotificationAction.PUSH_REQUEST:
        codebolt.notify.git.GitPushRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd()
        );
        break;
      
      case GitNotificationAction.PUSH_RESULT:
        codebolt.notify.git.GitPushResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Status
      case GitNotificationAction.STATUS_REQUEST:
        codebolt.notify.git.GitStatusRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd()
        );
        break;
      
      case GitNotificationAction.STATUS_RESULT:
        codebolt.notify.git.GitStatusResponseNotify(
          data.status || data,
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Add
      case GitNotificationAction.ADD_REQUEST:
        codebolt.notify.git.GitAddRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd(),
          Array.isArray(data.files) ? data.files : (data.files ? [data.files] : ['.'])
        );
        break;
      
      case GitNotificationAction.ADD_RESULT:
        codebolt.notify.git.GitAddResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Commit
      case GitNotificationAction.COMMIT_REQUEST:
        codebolt.notify.git.GitCommitRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd(),
          data.message || 'E2B Provider commit',
          Array.isArray(data.files) ? data.files : (data.files ? [data.files] : [])
        );
        break;
      
      case GitNotificationAction.COMMIT_RESULT:
        codebolt.notify.git.GitCommitResponseNotify(
          data.commitHash || data.hash || JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Checkout
      case GitNotificationAction.CHECKOUT_REQUEST:
        codebolt.notify.git.GitCheckoutRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd(),
          data.branch || data.target || 'main',
          data.createBranch || false
        );
        break;
      
      case GitNotificationAction.CHECKOUT_RESULT:
        codebolt.notify.git.GitCheckoutResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Branch
      case GitNotificationAction.BRANCH_REQUEST:
        codebolt.notify.git.GitBranchRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd(),
          data.branchName || '',
          data.operation || 'list'
        );
        break;
      
      case GitNotificationAction.BRANCH_RESULT:
        codebolt.notify.git.GitBranchResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Logs
      case GitNotificationAction.LOGS_REQUEST:
        codebolt.notify.git.GitLogsRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd(),
          data.limit || 10
        );
        break;
      
      case GitNotificationAction.LOGS_RESULT:
        codebolt.notify.git.GitLogsResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Diff
      case GitNotificationAction.DIFF_REQUEST:
        codebolt.notify.git.GitDiffRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd(),
          data.comparison || 'HEAD'
        );
        break;
      
      case GitNotificationAction.DIFF_RESULT:
        codebolt.notify.git.GitDiffResponseNotify(
          data, // Pass data as-is since GitDiffResponseNotify now handles structured content
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Remote Add
      case GitNotificationAction.REMOTE_ADD_REQUEST:
        codebolt.notify.git.GitRemoteAddRequestNotify(
          typeof data === 'string' ? data : data.repositoryPath || process.cwd(),
          data.remoteName || 'origin',
          data.remoteUrl || ''
        );
        break;
      
      case GitNotificationAction.REMOTE_ADD_RESULT:
        codebolt.notify.git.GitRemoteAddResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      // Git Clone
      case GitNotificationAction.CLONE_REQUEST:
        codebolt.notify.git.GitCloneRequestNotify(
          data.url || '',
          data.destination || data.targetPath || process.cwd(),
          data.branch || ''
        );
        break;
      
      case GitNotificationAction.CLONE_RESULT:
        codebolt.notify.git.GitCloneResponseNotify(
          typeof data === 'string' ? data : JSON.stringify(data),
          isError,
          `e2b-git-${Date.now()}`
        );
        break;

      default:
        // Fallback for any unknown actions
        console.log(`[E2B Provider] Git notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
        break;
    }
  } catch (error) {
    console.error('[E2B Provider] Failed to send git notification:', error);
  }
}

/**
 * Browser notification helper
 */
export function sendBrowserNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] Browser notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send browser notification:', error);
  }
}

/**
 * Crawler notification helper
 */
export function sendCrawlerNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] Crawler notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send crawler notification:', error);
  }
}

/**
 * Search notification helper
 */
export function sendSearchNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] Search notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send search notification:', error);
  }
}

/**
 * Code utilities notification helper
 */
export function sendCodeUtilsNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] CodeUtils notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send codeutils notification:', error);
  }
}

/**
 * LLM notification helper
 */
export function sendLlmNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] LLM notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send llm notification:', error);
  }
}

/**
 * MCP notification helper
 */
export function sendMcpNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] MCP notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send mcp notification:', error);
  }
}

/**
 * Chat notification helper
 */
export function sendChatNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] Chat notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send chat notification:', error);
  }
}

/**
 * Task notification helper
 */
export function sendTaskNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] Task notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send task notification:', error);
  }
}

/**
 * Database memory notification helper
 */
export function sendDbMemoryNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] DbMemory notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send dbmemory notification:', error);
  }
}

/**
 * History notification helper
 */
export function sendHistoryNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] History notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send history notification:', error);
  }
}

/**
 * System notification helper
 */
export function sendSystemNotification(action: string, data: any, isError: boolean = false): void {
  try {
    console.log(`[E2B Provider] System notification - ${action}:`, data, isError ? '(Error)' : '(Success)');
  } catch (error) {
    console.error('[E2B Provider] Failed to send system notification:', error);
  }
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