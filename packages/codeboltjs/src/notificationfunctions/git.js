"use strict";
/**
 * Git Notification Functions
 *
 * This module provides functions for sending git-related notifications,
 * including version control operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitNotifications = void 0;
exports.GitInitRequestNotify = GitInitRequestNotify;
exports.GitInitResponseNotify = GitInitResponseNotify;
exports.GitPullRequestNotify = GitPullRequestNotify;
exports.GitPullResponseNotify = GitPullResponseNotify;
exports.GitPushRequestNotify = GitPushRequestNotify;
exports.GitPushResponseNotify = GitPushResponseNotify;
exports.GitStatusRequestNotify = GitStatusRequestNotify;
exports.GitStatusResponseNotify = GitStatusResponseNotify;
exports.GitAddRequestNotify = GitAddRequestNotify;
exports.GitAddResponseNotify = GitAddResponseNotify;
exports.GitCommitRequestNotify = GitCommitRequestNotify;
exports.GitCommitResponseNotify = GitCommitResponseNotify;
exports.GitCheckoutRequestNotify = GitCheckoutRequestNotify;
exports.GitCheckoutResponseNotify = GitCheckoutResponseNotify;
exports.GitBranchRequestNotify = GitBranchRequestNotify;
exports.GitBranchResponseNotify = GitBranchResponseNotify;
exports.GitLogsRequestNotify = GitLogsRequestNotify;
exports.GitLogsResponseNotify = GitLogsResponseNotify;
exports.GitDiffRequestNotify = GitDiffRequestNotify;
exports.GitDiffResponseNotify = GitDiffResponseNotify;
exports.GitRemoteAddRequestNotify = GitRemoteAddRequestNotify;
exports.GitRemoteAddResponseNotify = GitRemoteAddResponseNotify;
exports.GitCloneRequestNotify = GitCloneRequestNotify;
exports.GitCloneResponseNotify = GitCloneResponseNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
// ===== GIT INIT FUNCTIONS =====
/**
 * Sends a git init request notification
 * @param path - Optional path where to initialize the git repository
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitInitRequestNotify(path, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.INIT_REQUEST,
        data: {
            path: path
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-init');
}
/**
 * Sends a git init response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitInitResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.INIT_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-init-response');
}
// ===== GIT PULL FUNCTIONS =====
/**
 * Sends a git pull request notification
 * @param path - Optional path where to perform the git pull
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitPullRequestNotify(path, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.PULL_REQUEST,
        data: {
            path: path
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-pull');
}
/**
 * Sends a git pull response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitPullResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.PULL_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-pull-response');
}
// ===== GIT PUSH FUNCTIONS =====
/**
 * Sends a git push request notification
 * @param path - Optional path where to perform the git push
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitPushRequestNotify(path, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.PUSH_REQUEST,
        data: {
            path: path
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-push');
}
/**
 * Sends a git push response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitPushResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.PUSH_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-push-response');
}
// ===== GIT STATUS FUNCTIONS =====
/**
 * Sends a git status request notification
 * @param path - Optional path where to check git status
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitStatusRequestNotify(path, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.STATUS_REQUEST,
        data: {
            path: path
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-status');
}
/**
 * Sends a git status response notification
 * @param content - The response content (status information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitStatusResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.STATUS_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-status-response');
}
// ===== GIT ADD FUNCTIONS =====
/**
 * Sends a git add request notification
 * @param path - Optional path where to perform git add
 * @param files - Optional array of files to add
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitAddRequestNotify(path, files, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.ADD_REQUEST,
        data: {
            path: path,
            files: files
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-add');
}
/**
 * Sends a git add response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitAddResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.ADD_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-add-response');
}
// ===== GIT COMMIT FUNCTIONS =====
/**
 * Sends a git commit request notification
 * @param path - Optional path where to perform git commit
 * @param message - Optional commit message
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitCommitRequestNotify(path, message, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.COMMIT_REQUEST,
        data: {
            path: path,
            message: message
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-commit');
}
/**
 * Sends a git commit response notification
 * @param content - The response content (commit information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitCommitResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.COMMIT_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-commit-response');
}
// ===== GIT CHECKOUT FUNCTIONS =====
/**
 * Sends a git checkout request notification
 * @param path - Optional path where to perform git checkout
 * @param branchName - Optional branch name to checkout
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitCheckoutRequestNotify(path, branchName, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.CHECKOUT_REQUEST,
        data: {
            path: path,
            branchName: branchName
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-checkout');
}
/**
 * Sends a git checkout response notification
 * @param content - The response content (checkout information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitCheckoutResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.CHECKOUT_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-checkout-response');
}
// ===== GIT BRANCH FUNCTIONS =====
/**
 * Sends a git branch request notification
 * @param path - Optional path where to perform git branch operation
 * @param branchName - Optional branch name to create or list
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitBranchRequestNotify(path, branchName, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.BRANCH_REQUEST,
        data: {
            path: path,
            branchName: branchName
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-branch');
}
/**
 * Sends a git branch response notification
 * @param content - The response content (branch information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitBranchResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.BRANCH_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-branch-response');
}
// ===== GIT LOGS FUNCTIONS =====
/**
 * Sends a git logs request notification
 * @param path - Optional path where to get git logs
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitLogsRequestNotify(path, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.LOGS_REQUEST,
        data: {
            path: path
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-logs');
}
/**
 * Sends a git logs response notification
 * @param content - The response content (log information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitLogsResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.LOGS_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-logs-response');
}
// ===== GIT DIFF FUNCTIONS =====
/**
 * Sends a git diff request notification
 * @param path - Optional path where to get git diff
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitDiffRequestNotify(path, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.DIFF_REQUEST,
        data: {
            path: path
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-diff');
}
/**
 * Sends a git diff response notification
 * @param content - The response content (diff information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitDiffResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.DIFF_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-diff-response');
}
// ===== GIT REMOTE ADD FUNCTIONS =====
/**
 * Sends a git remote add request notification
 * @param remoteName - Name of the remote to add
 * @param remoteUrl - URL of the remote repository
 * @param path - Optional path where to add the remote
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitRemoteAddRequestNotify(remoteName, remoteUrl, path, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.REMOTE_ADD_REQUEST,
        data: {
            path: path,
            remoteName: remoteName,
            remoteUrl: remoteUrl
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-remote-add');
}
/**
 * Sends a git remote add response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitRemoteAddResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.REMOTE_ADD_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-remote-add-response');
}
// ===== GIT CLONE FUNCTIONS =====
/**
 * Sends a git clone request notification
 * @param repoUrl - URL of the repository to clone
 * @param targetPath - Optional target path for the cloned repository
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GitCloneRequestNotify(repoUrl, targetPath, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.CLONE_REQUEST,
        data: {
            repoUrl: repoUrl,
            targetPath: targetPath
        }
    };
    (0, utils_1.sendNotification)(notification, 'git-clone');
}
/**
 * Sends a git clone response notification
 * @param content - The response content (clone information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GitCloneResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[GitNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.GIT_NOTIFY,
        action: enum_1.GitNotificationAction.CLONE_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'git-clone-response');
}
/**
 * Git notification functions object
 */
exports.gitNotifications = {
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
