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
    GitDiffResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitRemoteAddRequestNotify(remoteName: string, remoteUrl: string, path?: string, toolUseId?: string): void;
    GitRemoteAddResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GitCloneRequestNotify(repoUrl: string, targetPath?: string, toolUseId?: string): void;
    GitCloneResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}
