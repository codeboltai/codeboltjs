/**
 * Common TypeScript types and interfaces shared across the codeboltjs library
 *
 * This file contains:
 * - Shared data structures
 * - Common enums
 * - Utility types
 * - Application state types
 * - Git-related types
 * - Vector database types
 * - General purpose interfaces
 */
export interface ApplicationState {
    currentProject?: string;
    workingDirectory?: string;
    openFiles?: string[];
    recentProjects?: string[];
    userPreferences?: Record<string, any>;
    sessionData?: Record<string, any>;
}
export interface GitFileStatus {
    path: string;
    index: string;
    working_dir: string;
}
export interface StatusResult {
    not_added: string[];
    conflicted: string[];
    created: string[];
    deleted: string[];
    modified: string[];
    renamed: string[];
    files: GitFileStatus[];
    staged: string[];
    ahead: number;
    behind: number;
    current: string | null;
    tracking: string | null;
    detached: boolean;
}
export interface CommitSummary {
    hash: string;
    date: string;
    message: string;
    refs: string;
    body: string;
    author_name: string;
    author_email: string;
}
export interface DiffResult {
    files: Array<{
        file: string;
        changes: number;
        insertions: number;
        deletions: number;
        binary: boolean;
    }>;
    insertions: number;
    deletions: number;
    changed: number;
}
export interface AgentFunction {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, {
                type: string;
                description: string;
            }>;
            required?: string[];
            additionalProperties?: boolean;
        };
        strict?: boolean;
    };
}
export interface AgentDetail {
    id: string;
    name: string;
    description: string;
    capabilities?: string[];
    isLocal: boolean;
    version: string;
    status: string;
    unique_id: string;
}
export interface SubTask {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    requirements?: string[];
}
export interface Task {
    id: string;
    title: string;
    description?: string;
    phase?: string;
    category?: string;
    agentId: string;
    subtasks: SubTask[];
    completed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
}
export interface TaskResponse {
    success: boolean;
    data?: Task | Task[] | SubTask | string[] | string;
    message?: string;
    error?: string;
    agentId?: string;
    count?: number;
}
export interface VectorItem {
    id: string;
    vector: number[];
    metadata: Record<string, any>;
    content?: string;
}
export interface VectorQueryResult {
    items: VectorItem[];
    scores?: number[];
    distances?: number[];
}
export interface FileStateInfo {
    type: 'file' | 'folder' | 'search' | 'fileSearch' | 'mcp';
    path?: string;
    content?: string | string[];
    query?: string;
    stateEvent: 'ASK_FOR_CONFIRMATION' | 'FILE_READ' | 'FILE_READ_ERROR' | 'REJECTED' | 'SEARCHING' | 'ASK_FOR_CONFIRMATION' | 'APPLYING_EDIT' | 'EDIT_STARTING' | 'FILE_WRITE' | 'FILE_WRITE_ERROR';
    originalContent?: string;
    results?: any[];
    includePattern?: string;
    excludePattern?: string;
    caseSensitive?: boolean;
    toolName?: string;
    serverName?: string;
    params?: any;
}
export declare enum LogType {
    /** Informational messages */
    info = "info",
    /** Error messages */
    error = "error",
    /** Warning messages */
    warning = "warning"
}
export interface PendingRequest {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    messageTypes: string[];
    requestId?: string;
}
export interface ServiceResponseTypeMap {
    filesystem: any;
    fsService: any;
    browser: any;
    terminal: any;
    git: any;
    memory: any;
    tasks: any;
    vectordb: any;
    debug: any;
    codeutils: any;
    agents: any;
    state: any;
    chat: any;
    crawler: any;
    mcp: any;
    project: any;
    notification: any;
    problemMatcher: any;
    jsTreeParser: any;
}
export type SuccessResponse<T = any> = {
    success: true;
    data?: T;
};
export type FailureResponse = {
    success: false;
    error: string;
};
export type WebSocketMessageHandler<T = any> = (response: T) => void | Promise<void>;
export type ServiceWebSocketHandler<K extends keyof ServiceResponseTypeMap> = WebSocketMessageHandler<ServiceResponseTypeMap[K]>;
/**
 * Makes all properties of T optional recursively
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * Makes all properties of T required recursively
 */
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
/**
 * Extract keys from T that have values assignable to U
 */
export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
/**
 * Make specific properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/**
 * Make specific properties required
 */
export type Required<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};
export interface EventMap {
    [key: string]: (...args: any[]) => void;
}
export interface TypedEventEmitter<T extends EventMap> {
    on<K extends keyof T>(event: K, listener: T[K]): this;
    off<K extends keyof T>(event: K, listener: T[K]): this;
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean;
    removeAllListeners<K extends keyof T>(event?: K): this;
}
export interface Config {
    websocket?: {
        url?: string;
        timeout?: number;
        reconnectInterval?: number;
        maxReconnectAttempts?: number;
    };
    logging?: {
        level?: 'debug' | 'info' | 'warn' | 'error';
        enabled?: boolean;
    };
    [key: string]: any;
}
export interface CodeboltError extends Error {
    code?: string;
    details?: any;
    timestamp?: string;
}
export declare class CodeboltError extends Error {
    code?: string | undefined;
    details?: any | undefined;
    constructor(message: string, code?: string | undefined, details?: any | undefined);
}
export interface FileEntry {
    name: string;
    isDirectory: boolean;
    size?: number;
    modified?: string;
    created?: string;
    permissions?: string;
}
export interface SearchMatch {
    line: number;
    content: string;
    lineNumber: number;
}
export interface SearchResult {
    path: string;
    matches: SearchMatch[];
}
export interface BrowserElement {
    id: string;
    tag: string;
    text: string;
    attributes: Record<string, string>;
}
export interface CodeIssue {
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    file: string;
    line: number;
    column?: number;
}
export interface CodeAnalysis {
    complexity: number;
    maintainability: number;
    issues: CodeIssue[];
}
export interface CodeMatcher {
    name: string;
    description: string;
    language: string;
    pattern: string;
    examples?: string[];
}
export interface MCPTool {
    /** Name of the MCP */
    name?: string;
    /** Toolbox name */
    toolbox?: string;
    /** Tool name */
    toolName?: string;
    /** Available tools */
    tools?: any[];
    /** Description */
    description?: string;
    /** Parameters */
    parameters?: Record<string, any>;
}
export interface MCPServer {
    name: string;
    enabled: boolean;
    tools: MCPTool[];
    configuration?: Record<string, any>;
}
/**
 * Interface for Agent structure
 */
export interface Agent {
    /** Agent name */
    name?: string;
    /** Agent ID */
    id?: string | number;
    /** Agent description */
    description?: string;
    /** Agent title */
    title?: string;
    /** Agent identifier string */
    agent_id?: string;
    /** Unique identifier for the agent */
    unique_id?: string;
    /** Detailed description of the agent and its capabilities */
    longDescription?: string;
}
/**
 * Interface for initial user message structure
 */
export interface InitialUserMessage {
    /** The message text */
    messageText?: string;
    /** The actual text content of the user message */
    userMessage?: string;
    /** List of mentioned files */
    mentionedFiles?: string[];
    /** List of mentioned MCPs */
    mentionedMCPs?: MCPTool[];
    /** List of mentioned agents */
    mentionedAgents?: Agent[];
}
/**
 * Type definition for an AST node.
 */
export interface ASTNode {
    type: string;
    text: string;
    startPosition: {
        row: number;
        column: number;
    };
    endPosition: {
        row: number;
        column: number;
    };
    children: ASTNode[];
}
export interface Notification {
    id?: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title?: string;
    message: string;
    timestamp?: string;
    duration?: number;
}
