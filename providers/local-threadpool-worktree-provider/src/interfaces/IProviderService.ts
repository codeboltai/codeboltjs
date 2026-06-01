import type { ProviderStartResult } from '@codebolt/provider';
import type { ProviderInitVars } from '@codebolt/types/provider';

export type { ProviderStartResult } from '@codebolt/provider';

export type LocalThreadpoolSyncMode = 'git' | 'workspace_sync' | 'none';
export type LocalThreadpoolPathSource = 'provider_proposed' | 'user_override' | 'existing' | 'auto_default';

export interface LocalThreadpoolSyncPolicyMode {
  value: LocalThreadpoolSyncMode;
  label: string;
  description: string;
  pathFolder?: string;
  createsGitWorktree?: boolean;
  usesWorkspaceSync?: boolean;
  cleanup: 'none' | 'git_worktree' | 'filesystem' | 'runtime_provider';
}

export interface LocalThreadpoolSyncPolicy {
  defaultSyncMode: LocalThreadpoolSyncMode;
  modes: LocalThreadpoolSyncPolicyMode[];
}

export interface LocalThreadpoolProspectivePathRequest {
  environmentName?: string;
  projectPath?: string;
  parentPath?: string;
  parentProjectPath?: string;
  parentBasePath?: string;
  environmentPath?: string;
  requestedPath?: string;
  resolvedPath?: string;
  path?: string;
  syncMode?: LocalThreadpoolSyncMode | string;
  sync_mode?: LocalThreadpoolSyncMode | string;
  mergeStrategy?: LocalThreadpoolSyncMode | string;
  merge_strategy?: LocalThreadpoolSyncMode | string;
  [key: string]: unknown;
}

export interface LocalThreadpoolProspectivePathResponse {
  resolvedPath: string;
  environmentPath: string;
  requestedPath?: string;
  pathSource: LocalThreadpoolPathSource;
  syncMode: LocalThreadpoolSyncMode;
  mergeStrategy: LocalThreadpoolSyncMode;
  parentPath?: string;
  syncPolicy: LocalThreadpoolSyncPolicy;
  supportedSyncModes: LocalThreadpoolSyncMode[];
  defaultSyncMode: LocalThreadpoolSyncMode;
}

export interface DiffFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  changes?: {
    additions: number;
    deletions: number;
    changes: number;
  };
  diff?: string;
}

export interface DiffResult {
  files: DiffFile[];
  summary?: {
    totalFiles: number;
    totalAdditions: number;
    totalDeletions: number;
    totalChanges: number;
  };
  rawDiff?: string;
}

export interface LocalEnvironmentInfo {
  path: string | null;
  tag: string | null;
  isCreated: boolean;
  syncMode?: LocalThreadpoolSyncMode;
}

export type WorktreeInfo = LocalEnvironmentInfo;

export interface ProviderConfig {
  cleanupEnvironmentPath?: boolean;
  executionMode?: 'local_thread_pool';
  timeouts?: {
    wsConnection?: number;
    gitOperations?: number;
    cleanup?: number;
  };
}

export interface IProviderService {
  onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult>;
  onProviderStop(initvars: ProviderInitVars): Promise<void>;
  onGetDiffFiles(): Promise<DiffResult>;
  onCloseSignal(): Promise<void>;
  onReadFile(path: string): Promise<string>;
  onWriteFile(path: string, content: string): Promise<void>;
  onDeleteFile(path: string): Promise<void>;
  onDeleteFolder(path: string): Promise<void>;
  onRenameItem(oldPath: string, newPath: string): Promise<void>;
  onCreateFolder(path: string): Promise<void>;
  onGetProject(): Promise<any>;
  onMergeAsPatch(): Promise<string>;
  onSendPR(): Promise<void>;
  onCreatePatchRequest(): void | Promise<void>;
  onCreatePullRequestRequest(): void | Promise<void>;
  createWorktree(projectPath: string, environmentName: string, targetPath?: string): Promise<WorktreeInfo>;
  removeWorktree(projectPath: string): Promise<boolean>;
  getProspectivePath(request: LocalThreadpoolProspectivePathRequest): LocalThreadpoolProspectivePathResponse;
  getWorktreeInfo(): WorktreeInfo;
  isInitialized(): boolean;
}
