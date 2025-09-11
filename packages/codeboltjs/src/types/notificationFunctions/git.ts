/**
 * Git diff file schema with comprehensive metadata
 */
export interface GitDiffFile {
    file: string; // File path
    changes: number; // Total number of changes
    insertions: number; // Lines added
    deletions: number; // Lines removed
    binary?: boolean; // Whether file is binary
    status?: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied'; // File change status
    oldFile?: string; // Original file path (for renames)
}

/**
 * Comprehensive git diff result schema
 */
export interface GitDiffResult {
    files: GitDiffFile[]; // Array of changed files with details
    insertions: number; // Total insertions across all files
    deletions: number; // Total deletions across all files
    changed: number; // Total number of files changed
    diff?: string; // Raw diff text
    stats?: string; // Git stats summary
    metadata?: {
        totalChanges: number;
        additions: number;
        deletions: number;
        commitHash?: string;
        parentCommit?: string;
    };
}

/**
 * Git diff response content (wrapped format)
 */
export interface GitDiffResponseContent {
    success: boolean;
    data: string | GitDiffResult;
    commitHash?: string;
    message?: string;
}

/**
 * Interface for git notification functions
 */
export interface GitNotifications {
    GitInitRequestNotify(path?: string, toolUseId?: string): void;
    GitInitResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitPullRequestNotify(path?: string, toolUseId?: string): void;
    GitPullResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitPushRequestNotify(path?: string, toolUseId?: string): void;
    GitPushResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitStatusRequestNotify(path?: string, toolUseId?: string): void;
    GitStatusResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitAddRequestNotify(path?: string, files?: string[], toolUseId?: string): void;
    GitAddResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitCommitRequestNotify(path?: string, message?: string, toolUseId?: string): void;
    GitCommitResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitCheckoutRequestNotify(path?: string, branchName?: string, toolUseId?: string): void;
    GitCheckoutResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitBranchRequestNotify(path?: string, branchName?: string, toolUseId?: string): void;
    GitBranchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitLogsRequestNotify(path?: string, toolUseId?: string): void;
    GitLogsResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitDiffRequestNotify(path?: string, toolUseId?: string): void;
    GitDiffResponseNotify(content: string | GitDiffResult | GitDiffResponseContent, isError?: boolean, toolUseId?: string): void;
    GitRemoteAddRequestNotify(remoteName: string, remoteUrl: string, path?: string, toolUseId?: string): void;
    GitRemoteAddResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitCloneRequestNotify(repoUrl: string, targetPath?: string, toolUseId?: string): void;
    GitCloneResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}