/**
 * Git Notification Functions
 *
 * This module provides functions for sending git-related notifications,
 * including version control operations.
 */
import { GitNotifications } from '../types/notificationFunctions/git';
/**
 * Sends a git init request notification
 * @param path - Optional path where to initialize the git repository
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitInitRequestNotify(path?: string, toolUseId?: string): void;
/**
 * Sends a git init response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitInitResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git pull request notification
 * @param path - Optional path where to perform the git pull
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitPullRequestNotify(path?: string, toolUseId?: string): void;
/**
 * Sends a git pull response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitPullResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git push request notification
 * @param path - Optional path where to perform the git push
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitPushRequestNotify(path?: string, toolUseId?: string): void;
/**
 * Sends a git push response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitPushResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git status request notification
 * @param path - Optional path where to check git status
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitStatusRequestNotify(path?: string, toolUseId?: string): void;
/**
 * Sends a git status response notification
 * @param content - The response content (status information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitStatusResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git add request notification
 * @param path - Optional path where to perform git add
 * @param files - Optional array of files to add
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitAddRequestNotify(path?: string, files?: string[], toolUseId?: string): void;
/**
 * Sends a git add response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitAddResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git commit request notification
 * @param path - Optional path where to perform git commit
 * @param message - Optional commit message
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitCommitRequestNotify(path?: string, message?: string, toolUseId?: string): void;
/**
 * Sends a git commit response notification
 * @param content - The response content (commit information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitCommitResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git checkout request notification
 * @param path - Optional path where to perform git checkout
 * @param branchName - Optional branch name to checkout
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitCheckoutRequestNotify(path?: string, branchName?: string, toolUseId?: string): void;
/**
 * Sends a git checkout response notification
 * @param content - The response content (checkout information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitCheckoutResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git branch request notification
 * @param path - Optional path where to perform git branch operation
 * @param branchName - Optional branch name to create or list
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitBranchRequestNotify(path?: string, branchName?: string, toolUseId?: string): void;
/**
 * Sends a git branch response notification
 * @param content - The response content (branch information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitBranchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git logs request notification
 * @param path - Optional path where to get git logs
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitLogsRequestNotify(path?: string, toolUseId?: string): void;
/**
 * Sends a git logs response notification
 * @param content - The response content (log information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitLogsResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git diff request notification
 * @param path - Optional path where to get git diff
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitDiffRequestNotify(path?: string, toolUseId?: string): void;
/**
 * Sends a git diff response notification
 * @param content - The response content (diff information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitDiffResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git remote add request notification
 * @param remoteName - Name of the remote to add
 * @param remoteUrl - URL of the remote repository
 * @param path - Optional path where to add the remote
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitRemoteAddRequestNotify(remoteName: string, remoteUrl: string, path?: string, toolUseId?: string): void;
/**
 * Sends a git remote add response notification
 * @param content - The response content (success message or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitRemoteAddResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a git clone request notification
 * @param repoUrl - URL of the repository to clone
 * @param targetPath - Optional target path for the cloned repository
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GitCloneRequestNotify(repoUrl: string, targetPath?: string, toolUseId?: string): void;
/**
 * Sends a git clone response notification
 * @param content - The response content (clone information or error details)
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GitCloneResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Git notification functions object
 */
export declare const gitNotifications: GitNotifications;
