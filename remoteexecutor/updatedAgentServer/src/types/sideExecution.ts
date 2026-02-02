import { ChildProcess } from 'child_process';

// ============================================================================
// ActionBlock Types
// ============================================================================

/**
 * Represents a modular code unit that performs specific tasks.
 * ActionBlocks connect to the application via WebSocket like an agent,
 * but are not full agents - they perform specific, reusable tasks.
 */
export interface ActionBlock {
    /** Unique identifier for the ActionBlock */
    id: string;
    /** Human-readable name */
    name: string;
    /** Description of functionality */
    description: string;
    /** Semantic version */
    version: string;
    /** Main file (e.g., index.js) */
    entryPoint: string;
    /** Filesystem path to the ActionBlock */
    path: string;
    /** Type of ActionBlock */
    type: ActionBlockType;
    /** Additional metadata */
    metadata: ActionBlockMetadata;
}

export enum ActionBlockType {
    /** ActionBlock loaded from filesystem (.codebolt/actionblocks) */
    FILESYSTEM = 'filesystem',
    /** ActionBlock created from runtime-generated code */
    RUNTIME = 'runtime',
    /** Built-in ActionBlock provided by the system */
    BUILTIN = 'builtin'
}

export interface ActionBlockMetadata {
    author?: string;
    tags?: string[];
    dependencies?: string[];
    inputs?: ActionBlockInput[];
    outputs?: ActionBlockOutput[];
    /** Source of the ActionBlock: builtin, global, or project */
    source?: 'builtin' | 'global' | 'project';
}

export interface ActionBlockInput {
    name: string;
    type: string;
    required: boolean;
    description?: string;
}

export interface ActionBlockOutput {
    name: string;
    type: string;
    description?: string;
}

/**
 * ActionBlock configuration file structure (actionblock.yaml)
 */
export interface ActionBlockConfig {
    name: string;
    description: string;
    version: string;
    entryPoint: string;
    metadata?: ActionBlockMetadata;
}

// ============================================================================
// Thread Context Types
// ============================================================================

/**
 * The current state and history of a chat thread passed to ActionBlocks.
 * This allows ActionBlocks to access conversation history and thread state.
 */
export interface ThreadContext {
    /** The thread ID (same as parent agent) */
    threadId: string;
    /** Conversation history */
    messages: ChatMessage[];
    /** Current step information */
    currentStep?: ThreadStep;
    /** Project path */
    projectPath: string;
    /** Parent agent ID */
    agentId: string;
    /** Parent agent instance ID */
    agentInstanceId: string;
    /** Parent ID (if child agent) */
    parentId?: string;
    /** Parent agent instance ID (if child agent) */
    parentAgentInstanceId?: string;
    /** Additional metadata */
    metadata: Record<string, any>;
}

export interface ChatMessage {
    messageId: string;
    threadId: string;
    content: string;
    sender: string;
    timestamp: string;
    templateType?: string;
    payload?: any;
}

export interface ThreadStep {
    stepId: string;
    type: string;
    userMessage: string;
    status: string;
    metadata?: any;
}

// ============================================================================
// Side Execution Types
// ============================================================================

/**
 * Status of a Side Execution
 */
export enum SideExecutionStatus {
    STARTING = 'starting',
    RUNNING = 'running',
    STOPPING = 'stopping',
    STOPPED = 'stopped',
    COMPLETED = 'completed',
    FAILED = 'failed',
    TIMEOUT = 'timeout'
}

/**
 * Metadata for tracking a Side Execution
 */
export interface SideExecutionMetadata {
    /** Unique identifier for this side execution */
    id: string;
    /** Type identifier */
    type: 'actionblock';
    /** Name of the ActionBlock or runtime code */
    name: string;
    /** ActionBlock ID (if from registry) */
    actionBlockId?: string;
    /** Thread ID (same as parent agent) */
    threadId: string;
    /** Parent agent ID */
    parentAgentId: string;
    /** Parent agent instance ID */
    parentAgentInstanceId: string;
    /** Start timestamp */
    startTime: number;
    /** Current status */
    status: SideExecutionStatus;
    /** Child process reference */
    process?: ChildProcess;
    /** Whether this is runtime-generated code */
    isRuntimeCode: boolean;
    /** Path to temporary file (for runtime code) */
    tempFilePath?: string;
    /** Timeout timer reference */
    timeoutTimer?: NodeJS.Timeout;
    /** Parameters passed to the ActionBlock */
    params?: Record<string, any>;
    /** Thread context passed to the ActionBlock */
    threadContext?: ThreadContext;
}

/**
 * Options for starting a Side Execution with an ActionBlock
 */
export interface StartSideExecutionOptions {
    /** Path to the ActionBlock */
    actionBlockPath: string;
    /** Thread ID to use */
    threadId: string;
    /** Parent agent ID */
    parentAgentId: string;
    /** Parent agent instance ID */
    parentAgentInstanceId: string;
    /** Thread context to pass */
    threadContext: ThreadContext;
    /** Additional parameters */
    params?: Record<string, any>;
    /** Execution timeout in ms */
    timeout?: number;
}

/**
 * Options for starting a Side Execution with runtime code
 */
export interface RuntimeExecutionOptions {
    /** Inline code to execute */
    inlineCode: string;
    /** Thread ID to use */
    threadId: string;
    /** Parent agent ID */
    parentAgentId: string;
    /** Parent agent instance ID */
    parentAgentInstanceId: string;
    /** Thread context to pass */
    threadContext: ThreadContext;
    /** Additional parameters */
    params?: Record<string, any>;
    /** Execution timeout in ms */
    timeout?: number;
}

// ============================================================================
// CLI Request/Response Types
// ============================================================================

/**
 * ActionBlock CLI actions
 */
export enum ActionBlockActions {
    ListActionBlocks = 'listActionBlocks',
    GetActionBlockDetail = 'getActionBlockDetail',
    StartActionBlock = 'startActionBlock'
}

/**
 * Request to list ActionBlocks
 */
export interface ListActionBlocksRequest {
    type: 'actionBlock';
    action: ActionBlockActions.ListActionBlocks;
    projectPath?: string;
    filterType?: ActionBlockType;
    requestId?: string;
}

/**
 * Response to list ActionBlocks request
 */
export interface ListActionBlocksResponse {
    type: 'listActionBlocksResponse';
    success: boolean;
    actionBlocks: ActionBlock[];
    error?: string;
    requestId?: string;
}

/**
 * Request to get ActionBlock detail
 */
export interface GetActionBlockDetailRequest {
    type: 'actionBlock';
    action: ActionBlockActions.GetActionBlockDetail;
    actionBlockName: string;
    requestId?: string;
}

/**
 * Response to get ActionBlock detail
 */
export interface GetActionBlockDetailResponse {
    type: 'getActionBlockDetailResponse';
    success: boolean;
    actionBlock?: ActionBlock;
    error?: string;
    path?: string;
    requestId?: string;
}

/**
 * Request to start an ActionBlock
 */
export interface StartActionBlockRequest {
    type: 'actionBlock';
    action: ActionBlockActions.StartActionBlock;
    actionBlockName: string;
    params?: Record<string, any>;
    threadId: string;
    agentId: string;
    agentInstanceId: string;
    requestId?: string;
}

/**
 * Response to start ActionBlock request
 */
export interface StartActionBlockResponse {
    type: 'startActionBlockResponse';
    success: boolean;
    sideExecutionId?: string;
    result?: any;
    error?: string;
    path?: string;
    requestId?: string;
}

/**
 * Event emitted when a Side Execution completes
 */
export interface SideExecutionResultEvent {
    type: 'sideExecutionResult';
    sideExecutionId: string;
    threadId: string;
    success: boolean;
    result?: any;
    error?: string;
    timestamp: string;
}

/**
 * Result returned when waiting for Side Execution completion
 */
export interface SideExecutionResult {
    success: boolean;
    sideExecutionId: string;
    result?: any;
    error?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export enum SideExecutionErrorCode {
    ACTION_BLOCK_NOT_FOUND = 'ACTION_BLOCK_NOT_FOUND',
    INVALID_ACTION_BLOCK = 'INVALID_ACTION_BLOCK',
    SYNTAX_ERROR = 'SYNTAX_ERROR',
    EXECUTION_TIMEOUT = 'EXECUTION_TIMEOUT',
    PROCESS_CRASHED = 'PROCESS_CRASHED',
    CONNECTION_FAILED = 'CONNECTION_FAILED',
    INVALID_REQUEST = 'INVALID_REQUEST'
}

export interface SideExecutionError {
    code: SideExecutionErrorCode;
    message: string;
    details?: Record<string, any>;
    sideExecutionId?: string;
    timestamp: string;
}

// ============================================================================
// Environment Variables for Side Execution Process
// ============================================================================

export interface SideExecutionEnv {
    SOCKET_PORT: string;
    IS_SIDE_EXECUTION: 'true';
    SIDE_EXECUTION_ID: string;
    THREAD_ID: string;
    PARENT_AGENT_ID: string;
    PARENT_AGENT_INSTANCE_ID: string;
    ACTION_BLOCK_ID?: string;
    ACTION_BLOCK_PATH?: string;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ActionBlockValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Union type for ActionBlock requests
 */
export type ActionBlockRequest =
    | ListActionBlocksRequest
    | GetActionBlockDetailRequest
    | StartActionBlockRequest;

/**
 * Union type for ActionBlock responses
 */
export type ActionBlockResponse =
    | ListActionBlocksResponse
    | GetActionBlockDetailResponse
    | StartActionBlockResponse;
