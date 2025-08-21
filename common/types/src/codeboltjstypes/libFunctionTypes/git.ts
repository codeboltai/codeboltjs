/**
 * Git SDK Function Types
 * Types for the cbgit module functions
 */

// Base response interface for git operations
export interface BaseGitSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Git operation responses
export interface GitInitResponse extends BaseGitSDKResponse {}

export interface GitCommitResponse extends BaseGitSDKResponse {
  content?: string;
  hash?: string;
}

export interface GitPushResponse extends BaseGitSDKResponse {}

export interface GitPullResponse extends BaseGitSDKResponse {
  changes?: number;
  insertions?: number;
  deletions?: number;
}

export interface GitStatusResponse extends BaseGitSDKResponse {
  data?: any; // StatusResult from commonTypes
}

export interface GitLogsResponse extends BaseGitSDKResponse {
  data?: any[]; // CommitSummary[] from commonTypes
}

export interface GitDiffResponse extends BaseGitSDKResponse {
  data?: any; // DiffResult | string from commonTypes
  commitHash?: string;
}

export interface GitCheckoutResponse extends BaseGitSDKResponse {
  branch?: string;
}

export interface GitBranchResponse extends BaseGitSDKResponse {
  branch?: string;
}

export interface GitCloneResponse extends BaseGitSDKResponse {
  url?: string;
}

export interface AddResponse extends BaseGitSDKResponse {
  content?: string;
}
