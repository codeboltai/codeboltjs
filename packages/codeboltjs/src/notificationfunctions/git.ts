/**
 * Git Notification Functions
 * 
 * This module provides functions for sending git-related notifications,
 * including version control operations.
 */

import {
    GitInitRequestNotification,
    GitInitResponseNotification,
    GitPullRequestNotification,
    GitPullResponseNotification,
    GitPushRequestNotification,
    GitPushResponseNotification,
    GitStatusRequestNotification,
    GitStatusResponseNotification,
    GitAddRequestNotification,
    GitAddResponseNotification,
    GitCommitRequestNotification,
    GitCommitResponseNotification,
    GitCheckoutRequestNotification,
    GitCheckoutResponseNotification,
    GitBranchRequestNotification,
    GitBranchResponseNotification,
    GitLogsRequestNotification,
    GitLogsResponseNotification,
    GitDiffRequestNotification,
    GitDiffResponseNotification,
    GitRemoteAddRequestNotification,
    GitRemoteAddResponseNotification,
    GitCloneRequestNotification,
    GitCloneResponseNotification
} from '../types/notifications/git';

import { GitNotifications } from '../types/notificationFunctions/git';

import {
    sendNotification,
    generateToolUseId
} from './utils';
import { GitNotificationAction, NotificationEventType } from '@codebolt/types/enum';


// ===== GIT INIT FUNCTIONS =====

/**
 * Sends a git init request notification
 * @param path - Optional path where to initialize the git repository
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitInitRequestNotify(
    path?: string,
    toolUseId?: string
): void {
    const notification: GitInitRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.INIT_REQUEST,
        data: {
            path: path
        }
    };

    sendNotification(notification, 'git-init');
}

/**
 * Sends a git init response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitInitResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitInitResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.INIT_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-init-response');
}

// ===== GIT PULL FUNCTIONS =====

/**
 * Sends a git pull request notification
 * @param path - Optional path where to perform the git pull
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitPullRequestNotify(
    path?: string,
    toolUseId?: string
): void {
    const notification: GitPullRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.PULL_REQUEST,
        data: {
            path: path
        }
    };

    sendNotification(notification, 'git-pull');
}

/**
 * Sends a git pull response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitPullResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitPullResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.PULL_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-pull-response');
}

// ===== GIT PUSH FUNCTIONS =====

/**
 * Sends a git push request notification
 * @param path - Optional path where to perform the git push
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitPushRequestNotify(
    path?: string,
    toolUseId?: string
): void {
    const notification: GitPushRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.PUSH_REQUEST,
        data: {
            path: path
        }
    };

    sendNotification(notification, 'git-push');
}

/**
 * Sends a git push response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitPushResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitPushResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.PUSH_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-push-response');
}

// ===== GIT STATUS FUNCTIONS =====

/**
 * Sends a git status request notification
 * @param path - Optional path where to check git status
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitStatusRequestNotify(
    path?: string,
    toolUseId?: string
): void {
    const notification: GitStatusRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.STATUS_REQUEST,
        data: {
            path: path
        }
    };

    sendNotification(notification, 'git-status');
}

/**
 * Sends a git status response notification
 * @param content - The response content (status information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitStatusResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitStatusResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.STATUS_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-status-response');
}

// ===== GIT ADD FUNCTIONS =====

/**
 * Sends a git add request notification
 * @param path - Optional path where to perform git add
 * @param files - Optional array of files to add
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitAddRequestNotify(
    path?: string,
    files?: string[],
    toolUseId?: string
): void {
    const notification: GitAddRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.ADD_REQUEST,
        data: {
            path: path,
            files: files
        }
    };

    sendNotification(notification, 'git-add');
}

/**
 * Sends a git add response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitAddResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitAddResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.ADD_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-add-response');
}

// ===== GIT COMMIT FUNCTIONS =====

/**
 * Sends a git commit request notification
 * @param path - Optional path where to perform git commit
 * @param message - Optional commit message
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitCommitRequestNotify(
    path?: string,
    message?: string,
    toolUseId?: string
): void {
    const notification: GitCommitRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.COMMIT_REQUEST,
        data: {
            path: path,
            message: message
        }
    };

    sendNotification(notification, 'git-commit');
}

/**
 * Sends a git commit response notification
 * @param content - The response content (commit information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitCommitResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitCommitResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.COMMIT_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-commit-response');
}

// ===== GIT CHECKOUT FUNCTIONS =====

/**
 * Sends a git checkout request notification
 * @param path - Optional path where to perform git checkout
 * @param branchName - Optional branch name to checkout
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitCheckoutRequestNotify(
    path?: string,
    branchName?: string,
    toolUseId?: string
): void {
    const notification: GitCheckoutRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.CHECKOUT_REQUEST,
        data: {
            path: path,
            branchName: branchName
        }
    };

    sendNotification(notification, 'git-checkout');
}

/**
 * Sends a git checkout response notification
 * @param content - The response content (checkout information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitCheckoutResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitCheckoutResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.CHECKOUT_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-checkout-response');
}

// ===== GIT BRANCH FUNCTIONS =====

/**
 * Sends a git branch request notification
 * @param path - Optional path where to perform git branch operation
 * @param branchName - Optional branch name to create or list
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitBranchRequestNotify(
    path?: string,
    branchName?: string,
    toolUseId?: string
): void {
    const notification: GitBranchRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.BRANCH_REQUEST,
        data: {
            path: path,
            branchName: branchName
        }
    };

    sendNotification(notification, 'git-branch');
}

/**
 * Sends a git branch response notification
 * @param content - The response content (branch information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitBranchResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitBranchResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.BRANCH_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-branch-response');
}

// ===== GIT LOGS FUNCTIONS =====

/**
 * Sends a git logs request notification
 * @param path - Optional path where to get git logs
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitLogsRequestNotify(
    path?: string,
    toolUseId?: string
): void {
    const notification: GitLogsRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.LOGS_REQUEST,
        data: {
            path: path
        }
    };

    sendNotification(notification, 'git-logs');
}

/**
 * Sends a git logs response notification
 * @param content - The response content (log information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitLogsResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitLogsResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.LOGS_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-logs-response');
}

// ===== GIT DIFF FUNCTIONS =====

/**
 * Sends a git diff request notification
 * @param path - Optional path where to get git diff
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitDiffRequestNotify(
    path?: string,
    toolUseId?: string
): void {
    const notification: GitDiffRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.DIFF_REQUEST,
        data: {
            path: path
        }
    };

    sendNotification(notification, 'git-diff');
}

/**
 * Sends a git diff response notification with comprehensive diff data
 * @param content - The response content (raw diff string, structured GitDiffResult, or wrapped response)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitDiffResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    // Process and validate content based on schema expectations
    let processedContent: any;
    
    if (typeof content === 'string') {
        // Raw diff string - pass through as-is
        processedContent = content;
    } else if (content && typeof content === 'object') {
        // Check if it's a structured GitDiffResult
        if (content.files && Array.isArray(content.files)) {
            // Validate GitDiffResult structure
            processedContent = {
                files: content.files.map((file: any) => ({
                    file: file.file || file.path || '',
                    changes: file.changes || 0,
                    insertions: file.insertions || file.additions || 0,
                    deletions: file.deletions || 0,
                    binary: file.binary || false,
                    status: file.status,
                    oldFile: file.oldFile
                })),
                insertions: content.insertions || content.additions || 0,
                deletions: content.deletions || 0,
                changed: content.changed || content.files?.length || 0,
                diff: content.diff,
                stats: content.stats,
                metadata: content.metadata ? {
                    totalChanges: content.metadata.totalChanges || 0,
                    additions: content.metadata.additions || content.metadata.insertions || 0,
                    deletions: content.metadata.deletions || 0,
                    commitHash: content.metadata.commitHash,
                    parentCommit: content.metadata.parentCommit
                } : undefined
            };
        } else if (content.success !== undefined || content.data !== undefined) {
            // Wrapped response format
            processedContent = {
                success: content.success || !isError,
                data: content.data || content.diff || content.content || '',
                commitHash: content.commitHash || content.hash,
                message: content.message || content.error
            };
        } else {
            // Generic object - try to extract useful information
            processedContent = {
                success: !isError,
                data: content.diff || content.content || JSON.stringify(content),
                message: content.message || content.error
            };
        }
    } else {
        // Fallback for unexpected content types
        processedContent = isError ? 
            { success: false, message: 'Git diff operation failed', data: '' } :
            { success: true, data: content || '', message: 'Git diff completed' };
    }

    const notification: GitDiffResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.DIFF_RESULT,
        content: processedContent,
        isError
    };

    sendNotification(notification, 'git-diff-response');
}

// ===== GIT REMOTE ADD FUNCTIONS =====

/**
 * Sends a git remote add request notification
 * @param remoteName - Name of the remote to add
 * @param remoteUrl - URL of the remote repository
 * @param path - Optional path where to add the remote
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitRemoteAddRequestNotify(
    remoteName: string,
    remoteUrl: string,
    path?: string,
    toolUseId?: string
): void {
    const notification: GitRemoteAddRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.REMOTE_ADD_REQUEST,
        data: {
            path: path,
            remoteName: remoteName,
            remoteUrl: remoteUrl
        }
    };

    sendNotification(notification, 'git-remote-add');
}

/**
 * Sends a git remote add response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitRemoteAddResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitRemoteAddResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.REMOTE_ADD_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-remote-add-response');
}

// ===== GIT CLONE FUNCTIONS =====

/**
 * Sends a git clone request notification
 * @param repoUrl - URL of the repository to clone
 * @param targetPath - Optional target path for the cloned repository
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GitCloneRequestNotify(
    repoUrl: string,
    targetPath?: string,
    toolUseId?: string
): void {
    const notification: GitCloneRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.CLONE_REQUEST,
        data: {
            repoUrl: repoUrl,
            targetPath: targetPath
        }
    };

    sendNotification(notification, 'git-clone');
}

/**
 * Sends a git clone response notification
 * @param content - The response content (clone information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GitCloneResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GitCloneResponseNotification = {
        toolUseId,
        type: NotificationEventType.GIT_NOTIFY,
        action: GitNotificationAction.CLONE_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'git-clone-response');
}

/**
 * Git notification functions object
 */
export const gitNotifications: GitNotifications = {
    GitInitRequestNotify,
    GitInitResponseNotify,
    GitPullRequestNotify,
    GitPullResponseNotify,
    GitPushRequestNotify,
    GitPushResponseNotify,
    GitStatusRequestNotify,
    GitStatusResponseNotify,
    GitAddRequestNotify,
    GitAddResponseNotify,
    GitCommitRequestNotify,
    GitCommitResponseNotify,
    GitCheckoutRequestNotify,
    GitCheckoutResponseNotify,
    GitBranchRequestNotify,
    GitBranchResponseNotify,
    GitLogsRequestNotify,
    GitLogsResponseNotify,
    GitDiffRequestNotify,
    GitDiffResponseNotify,
    GitRemoteAddRequestNotify,
    GitRemoteAddResponseNotify,
    GitCloneRequestNotify,
    GitCloneResponseNotify
};