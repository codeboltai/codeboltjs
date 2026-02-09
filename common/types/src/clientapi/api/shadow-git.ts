// Shadow Git API types

export interface ShadowGitInitializeRequest {
  path?: string;
}

export interface ShadowGitCheckpointRequest {
  message?: string;
}

export interface ShadowGitDiffRequest {
  from?: string;
  to?: string;
}

export interface ShadowGitRestoreRequest {
  checkpointId: string;
}

export interface ShadowGitCheckpoint {
  id: string;
  message?: string;
  hash: string;
  createdAt: string;
}

export interface ShadowGitCleanupRequest {
  olderThan?: string;
}

export interface ShadowGitReadFileRequest {
  checkpointId: string;
  path: string;
}
