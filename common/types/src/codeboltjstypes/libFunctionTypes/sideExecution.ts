/**
 * Side Execution Type Definitions
 * 
 * Defines types for the Side Execution system that enables running
 * ActionBlocks and inline code in isolated child processes.
 */

// ============================================================================
// ActionBlock Types
// ============================================================================

/**
 * ActionBlock representation
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
    /** Main entry point file */
    entryPoint: string;
    /** Filesystem path to the ActionBlock */
    path: string;
    /** Type of ActionBlock */
    type: string;
    /** Additional metadata */
    metadata: Record<string, any>;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response to start side execution request
 */
export interface StartSideExecutionResponse {
    type: 'startSideExecutionResponse';
    success: boolean;
    sideExecutionId?: string;
    error?: string;
    requestId?: string;
}

/**
 * Response to stop side execution request
 */
export interface StopSideExecutionResponse {
    type: 'stopSideExecutionResponse';
    success: boolean;
    error?: string;
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
 * Response to get side execution status request
 */
export interface GetSideExecutionStatusResponse {
    type: 'getSideExecutionStatusResponse';
    success: boolean;
    sideExecutionId?: string;
    status?: string;
    name?: string;
    threadId?: string;
    startTime?: number;
    isRuntimeCode?: boolean;
    error?: string;
    requestId?: string;
}
