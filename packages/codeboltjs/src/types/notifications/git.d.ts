export type GitInitRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "initRequest";
    data: {
        path?: string;
    };
};
export type GitInitResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "initResult";
    content: string | any;
    isError?: boolean;
};
export type GitPullRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "pullRequest";
    data: {
        path?: string;
    };
};
export type GitPullResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "pullResult";
    content: string | any;
    isError?: boolean;
};
export type GitPushRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "pushRequest";
    data: {
        path?: string;
    };
};
export type GitPushResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "pushResult";
    content: string | any;
    isError?: boolean;
};
export type GitStatusRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "statusRequest";
    data: {
        path?: string;
    };
};
export type GitStatusResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "statusResult";
    content: string | any;
    isError?: boolean;
};
export type GitAddRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "addRequest";
    data: {
        path?: string;
        files?: string[];
    };
};
export type GitAddResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "addResult";
    content: string | any;
    isError?: boolean;
};
export type GitCommitRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "commitRequest";
    data: {
        path?: string;
        message?: string;
    };
};
export type GitCommitResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "commitResult";
    content: string | any;
    isError?: boolean;
};
export type GitCheckoutRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "checkoutRequest";
    data: {
        path?: string;
        branchName?: string;
    };
};
export type GitCheckoutResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "checkoutResult";
    content: string | any;
    isError?: boolean;
};
export type GitBranchRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "branchRequest";
    data: {
        path?: string;
        branchName?: string;
    };
};
export type GitBranchResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "branchResult";
    content: string | any;
    isError?: boolean;
};
export type GitLogsRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "logsRequest";
    data: {
        path?: string;
    };
};
export type GitLogsResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "logsResult";
    content: string | any;
    isError?: boolean;
};
export type GitDiffRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "diffRequest";
    data: {
        path?: string;
    };
};
export type GitDiffResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "diffResult";
    content: string | any;
    isError?: boolean;
};
export type GitRemoteAddRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "remoteAddRequest";
    data: {
        path?: string;
        remoteName?: string;
        remoteUrl?: string;
    };
};
export type GitRemoteAddResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "remoteAddResult";
    content: string | any;
    isError?: boolean;
};
export type GitRemoteRemoveRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "remoteRemoveRequest";
    data: {
        path?: string;
        remoteName?: string;
    };
};
export type GitRemoteRemoveResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "remoteRemoveResult";
    content: string | any;
    isError?: boolean;
};
export type GitCloneRequestNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "cloneRequest";
    data: {
        repoUrl?: string;
        targetPath?: string;
    };
};
export type GitCloneResponseNotification = {
    toolUseId: string;
    type: "gitnotify";
    action: "cloneResult";
    content: string | any;
    isError?: boolean;
};
export type GitNotification = GitInitRequestNotification | GitPullRequestNotification | GitPushRequestNotification | GitStatusRequestNotification | GitAddRequestNotification | GitCommitRequestNotification | GitCheckoutRequestNotification | GitBranchRequestNotification | GitLogsRequestNotification | GitDiffRequestNotification | GitRemoteAddRequestNotification | GitRemoteRemoveRequestNotification | GitCloneRequestNotification;
export type GitResponseNotification = GitInitResponseNotification | GitPullResponseNotification | GitPushResponseNotification | GitStatusResponseNotification | GitAddResponseNotification | GitCommitResponseNotification | GitCheckoutResponseNotification | GitBranchResponseNotification | GitLogsResponseNotification | GitDiffResponseNotification | GitRemoteAddResponseNotification | GitRemoteRemoveResponseNotification | GitCloneResponseNotification;
