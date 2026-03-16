/**
 * Base interface for all messages
 */
export interface BaseMessage {
  id: string;
  type: string;
  clientId?: string;
}

/**
 * Message for registering a client or agent
 */
export interface RegisterMessage extends BaseMessage {
  type: 'register';
  clientType: 'client' | 'agent';
}

/**
 * Message for reading a file
 */
export interface ReadFileMessage extends BaseMessage {
  type: 'readfile';
  filepath: string;
}

/**
 * Message for writing a file
 */
export interface WriteFileMessage extends BaseMessage {
  type: 'writefile';
  filepath: string;
  content: string;
}

/**
 * Message for AI requests
 */
export interface AskAIMessage extends BaseMessage {
  type: 'askAI';
  prompt: string;
}

/**
 * Response message from server or agent
 */
export interface ResponseMessage extends BaseMessage {
  type: 'messageResponse';
  success: boolean;
  data?: any;
  error?: string;
  originalRequest?: unknown;
}



/**
 * Connection establishment message
 */
export interface ConnectionMessage extends BaseMessage {
  type: 'connection';
  message: string;
}

/**
 * Registration confirmation message
 */
export interface RegisteredMessage extends BaseMessage {
  type: 'registered';
  clientType: 'client' | 'agent';
  message: string;
}

/**
 * Custom operation message
 */
export interface CustomOperationMessage extends BaseMessage {
  type: 'custom-operation';
  operation: string;
  data?: unknown;
}

// --- Snapshot archive import/export messages ---

/**
 * Import: Server/Provider → Remote Executor
 */
export interface SnapshotArchiveImportMessage extends BaseMessage {
  type: 'snapshotArchiveImport';
  archiveData: string;          // base64-encoded .tar.gz
  environmentId: string;
  environmentName: string;
  snapshotId?: string;          // server-side snapshot ID for diff base
  workspacePath?: string;       // target workspace path
  narrativeContext?: {           // parent server's narrative hierarchy IDs
    objective_id: string;
    narrative_thread_id: string;
    agent_run_id: string;
  };
}

/**
 * Import result: Remote Executor → Server/Provider
 */
export interface SnapshotArchiveImportResult extends BaseMessage {
  type: 'snapshotArchiveImportResult';
  success: boolean;
  snapshotId?: string;
  treeHash?: string;
  environmentId: string;
  error?: string;
}

/**
 * Export request: Server → Remote Executor
 */
export interface SnapshotExportRequest extends BaseMessage {
  type: 'snapshotExportRequest';
  environmentId: string;
}

/**
 * Export result: Remote Executor → Server
 */
export interface SnapshotBundleExport extends BaseMessage {
  type: 'snapshotBundleExport';
  bundleData: string;           // base64-encoded .bundle file
  snapshotId: string;
  baseSnapshotId: string | null;
  environmentId: string;
  success: boolean;
  error?: string;
  narrativeContext?: {           // echoed back from import for parent to complete agent run
    objective_id: string;
    narrative_thread_id: string;
    agent_run_id: string;
  };
}

/**
 * Union type of all possible messages
 */
export type Message =
  | RegisterMessage
  | ReadFileMessage
  | WriteFileMessage
  | AskAIMessage
  | ResponseMessage
  | ConnectionMessage
  | RegisteredMessage
  | CustomOperationMessage
  | SnapshotArchiveImportMessage
  | SnapshotArchiveImportResult
  | SnapshotExportRequest
  | SnapshotBundleExport;

/**
 * Union type of messages that can be sent by clients
 */
export type ClientMessage = 
  | RegisterMessage
  | ReadFileMessage
  | WriteFileMessage
  | AskAIMessage
  | CustomOperationMessage;

/**
 * Union type of messages that can be sent by agents
 */
export type AgentMessage = 
  | RegisterMessage
  | ResponseMessage
  | CustomOperationMessage;

/**
 * Union type of messages that can be sent by the server
 */
export type ServerMessage = 
  | ResponseMessage
  | ConnectionMessage
  | RegisteredMessage;