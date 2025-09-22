import { ChildProcess } from 'child_process';
import WebSocket from 'ws';
import { FlatUserMessage } from '@codebolt/types/sdk';

/**
 * Provider initialization variables
 */
export interface ProviderInitVars {
  environmentName: string;
}

/**
 * Agent start message structure
 */
export interface AgentStartMessage {
  type: string;
  userMessage?: string;
  task?: string;
  context?: any;
  timestamp?: number;
  agentId:string;
}

/**
 * WebSocket message structure for agent server communication
 */
export interface AgentServerMessage {
  type: string;
  action?: string;
  data?: any;
  messageId?: string;
  timestamp: number;
}

/**
 * Provider start result
 */
export interface ProviderStartResult {
  success: boolean;
  worktreePath: string;
  environmentName: string;
  agentServerUrl: string;
}

/**
 * Diff file information
 */
export interface DiffFile {
  file: string;
  changes: number;
  insertions: number;
  deletions: number;
  binary: boolean;
  status?: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';
  oldFile?: string;
  diff?: string;
}

/**
 * Diff result containing all changed files
 */
export interface DiffResult {
  files: DiffFile[];
  insertions: number;
  deletions: number;
  changed: number;
  rawDiff?: string;
}

/**
 * Agent server connection info
 */
export interface AgentServerConnection {
  process: ChildProcess | null;
  wsConnection: WebSocket | null;
  serverUrl: string;
  isConnected: boolean;
}

/**
 * Git worktree information
 */
export interface WorktreeInfo {
  path: string | null;
  branch: string | null;
  isCreated: boolean;
}

/**
 * Provider cleanup result
 */
export interface CleanupResult {
  worktreeRemoved: boolean;
  branchDeleted: boolean;
  agentServerStopped: boolean;
  wsConnectionClosed: boolean;
}

/**
 * Main interface for Git WorkTree Provider Service
 */
export interface IProviderService {
  // Core provider lifecycle methods
  onProviderStart(initvars: ProviderInitVars): Promise<ProviderStartResult>;
  onProviderAgentStart(initvars: AgentStartMessage): Promise<void>;
  onGetDiffFiles(): Promise<DiffResult>;
  onCloseSignal(): Promise<void>;
  onCreatePatchRequest(): void | Promise<void>;
  onCreatePullRequestRequest(): void | Promise<void>;
  onMessage(userMessage: FlatUserMessage): Promise<void>;

  // Agent server management
  startAgentServer(): Promise<void>;
  connectToAgentServer(worktreePath: string, environmentName: string): Promise<void>;
  stopAgentServer(): Promise<boolean>;

  // Message forwarding
  sendMessageToAgent(message: AgentServerMessage): Promise<boolean>;

  // Worktree management
  createWorktree(projectPath: string, environmentName: string): Promise<WorktreeInfo>;
  removeWorktree(projectPath: string): Promise<boolean>;

  // Utility methods
  getWorktreeInfo(): WorktreeInfo;
  getAgentServerConnection(): AgentServerConnection;
  isInitialized(): boolean;
}

/**
 * Configuration interface for the provider
 */
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
