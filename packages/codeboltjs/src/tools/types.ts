/**
 * Core types and interfaces for the codeboltjs tools framework
 */

/**
 * OpenAI tool schema format - primary format for LLM tool calls
 */
export interface OpenAIToolSchema {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, any>;
            required?: string[];
            additionalProperties?: boolean;
        };
    };
}

/**
 * OpenAI function call format
 */
export interface OpenAIFunctionCall {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
        additionalProperties?: boolean;
    };
}

/**
 * Generic type for LLM content parts
 */
export interface Part {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
}

/**
 * Union type for content that can be sent to LLMs
 */
export type PartListUnion = string | Part | (string | Part)[];

/**
 * Enum representing tool categories for permissions and organization
 */
export enum Kind {
    Read = 'read',
    Edit = 'edit',
    Delete = 'delete',
    Move = 'move',
    Search = 'search',
    Execute = 'execute',
    Think = 'think',
    Fetch = 'fetch',
    Other = 'other',
}

/**
 * Error types for tool operations
 */
export enum ToolErrorType {
    // General Errors
    INVALID_TOOL_PARAMS = 'invalid_tool_params',
    UNKNOWN = 'unknown',
    UNHANDLED_EXCEPTION = 'unhandled_exception',
    TOOL_NOT_REGISTERED = 'tool_not_registered',
    EXECUTION_FAILED = 'execution_failed',

    // File System Errors
    FILE_NOT_FOUND = 'file_not_found',
    FILE_WRITE_FAILURE = 'file_write_failure',
    READ_CONTENT_FAILURE = 'read_content_failure',
    ATTEMPT_TO_CREATE_EXISTING_FILE = 'attempt_to_create_existing_file',
    FILE_TOO_LARGE = 'file_too_large',
    PERMISSION_DENIED = 'permission_denied',
    NO_SPACE_LEFT = 'no_space_left',
    TARGET_IS_DIRECTORY = 'target_is_directory',
    PATH_NOT_IN_WORKSPACE = 'path_not_in_workspace',
    SEARCH_PATH_NOT_FOUND = 'search_path_not_found',
    SEARCH_PATH_NOT_A_DIRECTORY = 'search_path_not_a_directory',

    // Edit Tool Specific Errors
    EDIT_NO_CHANGE_LLM_JUDGEMENT = 'edit_no_change_llm_judgement',
    EDIT_PREPARATION_FAILURE = 'edit_preparation_failure',
    EDIT_NO_OCCURRENCE_FOUND = 'edit_no_occurrence_found',
    EDIT_EXPECTED_OCCURRENCE_MISMATCH = 'edit_expected_occurrence_mismatch',
    EDIT_NO_CHANGE = 'edit_no_change',

    // Tool-specific Errors
    GLOB_EXECUTION_ERROR = 'glob_execution_error',
    GREP_EXECUTION_ERROR = 'grep_execution_error',
    LS_EXECUTION_ERROR = 'ls_execution_error',
    PATH_IS_NOT_A_DIRECTORY = 'path_is_not_a_directory',
    MCP_TOOL_ERROR = 'mcp_tool_error',
    MEMORY_TOOL_EXECUTION_ERROR = 'memory_tool_execution_error',
    READ_MANY_FILES_SEARCH_ERROR = 'read_many_files_search_error',
    SHELL_EXECUTE_ERROR = 'shell_execute_error',
    DISCOVERED_TOOL_EXECUTION_ERROR = 'discovered_tool_execution_error',
    WEB_FETCH_NO_URL_IN_PROMPT = 'web_fetch_no_url_in_prompt',
    WEB_FETCH_FALLBACK_FAILED = 'web_fetch_fallback_failed',
    WEB_FETCH_PROCESSING_ERROR = 'web_fetch_processing_error',
    WEB_SEARCH_FAILED = 'web_search_failed',

    // Git Errors
    GIT_EXECUTION_ERROR = 'git_execution_error',

    // Browser Errors
    BROWSER_EXECUTION_ERROR = 'browser_execution_error',

    // Terminal Errors
    TERMINAL_EXECUTION_ERROR = 'terminal_execution_error',
    COMMAND_TIMEOUT = 'command_timeout',

    // Agent/Thread Errors
    AGENT_NOT_FOUND = 'agent_not_found',
    THREAD_NOT_FOUND = 'thread_not_found',
    TASK_NOT_FOUND = 'task_not_found',
}

/**
 * File system location reference
 */
export interface ToolLocation {
    /** Absolute path to the file */
    path: string;
    /** Which line (if known) */
    line?: number;
}

/**
 * Result of a tool execution
 */
export interface ToolResult {
    /**
     * Content meant to be included in LLM history.
     * This should represent the factual outcome of the tool execution.
     */
    llmContent: PartListUnion;

    /**
     * Markdown string for user display.
     * This provides a user-friendly summary or visualization of the result.
     */
    returnDisplay: ToolResultDisplay;

    /**
     * If this property is present, the tool call is considered a failure.
     */
    error?: {
        message: string;
        type?: ToolErrorType;
    };
}

/**
 * Display format for tool results
 */
export type ToolResultDisplay = string | FileDiff;

/**
 * File difference information
 */
export interface FileDiff {
    fileDiff: string;
    fileName: string;
    originalContent: string | null;
    newContent: string;
    diffStat?: DiffStat;
}

/**
 * Statistics about differences between content versions
 */
export interface DiffStat {
    model_added_lines: number;
    model_removed_lines: number;
    model_added_chars: number;
    model_removed_chars: number;
    user_added_lines: number;
    user_removed_lines: number;
    user_added_chars: number;
    user_removed_chars: number;
}

/**
 * Confirmation outcome types
 */
export enum ToolConfirmationOutcome {
    ProceedOnce = 'proceed_once',
    ProceedAlways = 'proceed_always',
    ProceedAlwaysServer = 'proceed_always_server',
    ProceedAlwaysTool = 'proceed_always_tool',
    ModifyWithEditor = 'modify_with_editor',
    Cancel = 'cancel',
}

/**
 * Base confirmation details
 */
export interface BaseConfirmationDetails {
    type: string;
    title: string;
    onConfirm: (outcome: ToolConfirmationOutcome, payload?: any) => Promise<void>;
}

/**
 * Edit confirmation details
 */
export interface ToolEditConfirmationDetails extends BaseConfirmationDetails {
    type: 'edit';
    fileName: string;
    filePath: string;
    fileDiff: string;
    originalContent: string | null;
    newContent: string;
    isModifying?: boolean;
}

/**
 * Execute confirmation details
 */
export interface ToolExecuteConfirmationDetails extends BaseConfirmationDetails {
    type: 'exec';
    command: string;
    rootCommand: string;
}

/**
 * MCP confirmation details
 */
export interface ToolMcpConfirmationDetails extends BaseConfirmationDetails {
    type: 'mcp';
    serverName: string;
    toolName: string;
    toolDisplayName: string;
}

/**
 * Info confirmation details
 */
export interface ToolInfoConfirmationDetails extends BaseConfirmationDetails {
    type: 'info';
    prompt: string;
    urls?: string[];
}

/**
 * Union type for all confirmation details
 */
export type ToolCallConfirmationDetails =
    | ToolEditConfirmationDetails
    | ToolExecuteConfirmationDetails
    | ToolMcpConfirmationDetails
    | ToolInfoConfirmationDetails;

/**
 * Represents a validated and ready-to-execute tool call
 */
export interface ToolInvocation<
    TParams extends object,
    TResult extends ToolResult,
> {
    /** The validated parameters for this specific invocation */
    params: TParams;

    /** Determines what file system paths the tool will affect */
    toolLocations(): ToolLocation[];

    /** Determines if the tool should prompt for confirmation before execution */
    shouldConfirmExecute(
        abortSignal: AbortSignal,
    ): Promise<ToolCallConfirmationDetails | false>;

    /** Executes the tool with the validated parameters */
    execute(
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<TResult>;
}

/**
 * Interface for a tool builder that validates parameters and creates invocations
 */
export interface ToolBuilder<
    TParams extends object,
    TResult extends ToolResult,
> {
    /** The internal name of the tool (used for API calls) */
    name: string;

    /** The user-friendly display name of the tool */
    displayName: string;

    /** Description of what the tool does */
    description: string;

    /** The kind of tool for categorization and permissions */
    kind: Kind;

    /** Primary schema format (OpenAI tool schema) */
    schema: OpenAIToolSchema;

    /** Whether the tool's output should be rendered as markdown */
    isOutputMarkdown: boolean;

    /** Whether the tool supports live (streaming) output */
    canUpdateOutput: boolean;

    /** Validates raw parameters and builds a ready-to-execute invocation */
    build(params: TParams): ToolInvocation<TParams, TResult>;

    /** Validates tool parameters */
    validateToolParams(params: TParams): string | null;

    /** Builds and executes tool in one step */
    buildAndExecute(
        params: TParams,
        signal: AbortSignal,
        updateOutput?: (output: string) => void,
    ): Promise<TResult>;

    /** Validates, builds, and executes tool in one step. Never throws. */
    validateBuildAndExecute(
        params: TParams,
        abortSignal: AbortSignal,
    ): Promise<ToolResult>;
}

/**
 * Type aliases for convenience
 */
export type AnyToolInvocation = ToolInvocation<object, ToolResult>;
export type AnyDeclarativeTool = ToolBuilder<object, ToolResult>;

/**
 * Type guard to check if an object is a Tool
 */
export function isTool(obj: unknown): obj is AnyDeclarativeTool {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'name' in obj &&
        'build' in obj &&
        typeof (obj as AnyDeclarativeTool).build === 'function'
    );
}
