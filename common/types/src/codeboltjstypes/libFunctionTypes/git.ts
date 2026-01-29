/**
 * Git SDK Function Types
 * Types for the cbgit module functions
 */

import { GitStatusData, GitCommitSummary, GitDiffResult } from './baseappResponse';

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
  data?: GitStatusData;
}

export interface GitLogsResponse extends BaseGitSDKResponse {
  data?: GitCommitSummary[];
}

export interface GitDiffResponse extends BaseGitSDKResponse {
  data?: GitDiffResult | string;
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
