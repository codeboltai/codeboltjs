// Git API types

export type GitFileStatus = 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'conflicted';

export interface GitFileChange {
  path: string;
  status: GitFileStatus;
  oldPath?: string;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: GitFileChange[];
  unstaged: GitFileChange[];
  untracked: string[];
  conflicted: string[];
  isClean: boolean;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  authorEmail?: string;
  date: string;
  parents?: string[];
}

export interface GitBranch {
  name: string;
  current: boolean;
  remote?: string;
  lastCommit?: string;
  lastCommitDate?: string;
}

export interface GitDiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
}

export interface GitDiff {
  filePath: string;
  oldPath?: string;
  additions: number;
  deletions: number;
  hunks: GitDiffHunk[];
}

export interface GitInitRequest {
  path?: string;
}

export interface GitGraphRequest {
  path?: string;
}

export interface GitDiffRequest {
  path?: string;
  file?: string;
}

export interface GitRevertRequest {
  files?: string[];
  path?: string;
}

export interface GitCommitRequest {
  message: string;
  files?: string[];
}

export interface GitStatusRequest {
  path?: string;
}

export interface GitDownloadRequest {
  url: string;
  path?: string;
}

export interface GitPublishRemoteRequest {
  url: string;
  name?: string;
}

export interface GitPushRequest {
  remote?: string;
  branch?: string;
}

export interface GitPullRequest {
  remote?: string;
  branch?: string;
}

export interface GitBranchRequest {
  name?: string;
  action?: string;
}

export interface GitCheckoutRequest {
  branch: string;
  create?: boolean;
}

export interface GitCreateBranchRequest {
  name: string;
  from?: string;
}

export interface GitRemoteUrlResponse {
  url: string;
}
