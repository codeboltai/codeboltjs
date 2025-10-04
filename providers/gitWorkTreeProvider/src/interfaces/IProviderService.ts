import type {

  ProviderInitVars,
  ProviderStartResult,
  AgentServerConnection as BaseAgentServerConnection,

} from '@codebolt/provider';
import { AgentStartMessage, RawMessageForAgent } from '@codebolt/types/provider';
import { FlatUserMessage } from '@codebolt/types/sdk-types';
import type { ChildProcess } from 'child_process';
import type WebSocket from 'ws';

export type {
  ProviderInitVars,
  ProviderStartResult
} from '@codebolt/provider';

export interface DiffFile {
  file: string;
  changes: number;
  insertions: number;
  deletions: number;
  binary: boolean;
  status?: "added" | "modified" | "deleted" | "renamed" | "copied";
  oldFile?: string;
  diff?: string;
}

export interface DiffResult {
  files: DiffFile[];
  insertions: number;
  deletions: number;
  changed: number;
  rawDiff?: string;
}

export interface AgentServerConnection extends BaseAgentServerConnection {
  process: ChildProcess | null;
  wsConnection: WebSocket | null;
}

export interface WorktreeInfo {
  path: string | null;
  branch: string | null;
  isCreated: boolean;
}

export interface CleanupResult {
  worktreeRemoved: boolean;
  branchDeleted: boolean;
  agentServerStopped: boolean;
  wsConnectionClosed: boolean;
}

export interface ProviderConfig {
  agentServerPort?: number;
  agentServerHost?: string;
  worktreeBaseDir?: string;
  timeouts?: {
    agentServerStartup?: number;
    wsConnection?: number;
    gitOperations?: number;
    cleanup?: number;
  };
}

export interface IProviderService {
  onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult>;
  onProviderAgentStart(initvars: AgentStartMessage): Promise<void>;
  onGetDiffFiles(): Promise<DiffResult>;
  onCloseSignal(): Promise<void>;
  onCreatePatchRequest(): void | Promise<void>;
  onCreatePullRequestRequest(): void | Promise<void>;
  onUserMessage(userMessage: RawMessageForAgent): Promise<void>;
  startAgentServer(): Promise<void>;
  connectToAgentServer(worktreePath: string, environmentName: string): Promise<void>;
  stopAgentServer(): Promise<boolean>;
  sendMessageToAgent(message: RawMessageForAgent | AgentStartMessage): Promise<boolean>;
  createWorktree(projectPath: string, environmentName: string): Promise<WorktreeInfo>;
  removeWorktree(projectPath: string): Promise<boolean>;
  getWorktreeInfo(): WorktreeInfo;
  getAgentServerConnection(): AgentServerConnection;
  isInitialized(): boolean;
}
