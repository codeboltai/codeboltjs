/**
 * Capability System Type Definitions
 * 
 * Defines types for the unified Capability framework that encompasses
 * Skills, Powers, Talents, and other extensible capability types.
 */

// ============================================================================
// Capability Types
// ============================================================================

/**
 * Capability type classification (extensible)
 * Examples: 'skill', 'power', 'talent'
 */
export type CapabilityType = 'skill' | 'power' | 'talent' | string;

/**
 * Capability input parameter definition
 */
export interface CapabilityInput {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    default?: any;
}

/**
 * Capability output definition
 */
export interface CapabilityOutput {
    name: string;
    type: string;
    description?: string;
}

/**
 * Capability metadata
 */
export interface CapabilityMetadata {
    author?: string;
    tags?: string[];
    inputs?: CapabilityInput[];
    outputs?: CapabilityOutput[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Runtime capability representation
 */
export interface Capability {
    /** Unique identifier for the capability */
    id: string;
    /** Human-readable name */
    name: string;
    /** Capability type (skill, power, talent, etc.) */
    type: CapabilityType;
    /** Semantic version */
    version: string;
    /** Description of functionality */
    description: string;
    /** Filesystem path to the capability */
    path: string;
    /** Additional metadata */
    metadata: CapabilityMetadata;
}

/**
 * Filter options for listing capabilities
 */
export interface CapabilityFilter {
    type?: CapabilityType;
    tags?: string[];
    author?: string;
}

/**
 * Runtime executor representation
 */
export interface CapabilityExecutor {
    /** Unique identifier for the executor */
    id: string;
    /** Human-readable name */
    name: string;
    /** Semantic version */
    version: string;
    /** Description of functionality */
    description: string;
    /** Capability types this executor can handle */
    supportedTypes: CapabilityType[];
    /** Main entry point file */
    entryPoint: string;
    /** Filesystem path to the executor */
    path: string;
}

/**
 * Capability execution metadata
 */
export interface CapabilityExecutionMetadata {
    /** Unique identifier for this execution */
    id: string;
    /** Name of the capability being executed */
    capabilityName: string;
    /** Type of the capability */
    capabilityType: CapabilityType;
    /** Name of the executor running the capability */
    executorName: string;
    /** ID of the underlying side execution */
    sideExecutionId: string;
    /** Thread ID (same as parent agent) */
    threadId: string;
    /** Parent agent ID */
    parentAgentId: string;
    /** Parent agent instance ID */
    parentAgentInstanceId: string;
    /** Start timestamp */
    startTime: number;
    /** Current status */
    status: 'starting' | 'running' | 'stopping' | 'stopped' | 'completed' | 'failed' | 'timeout';
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response to list capabilities request
 */
export interface ListCapabilitiesResponse {
    type: 'listCapabilitiesResponse';
    success: boolean;
    capabilities: Capability[];
    error?: string;
    requestId?: string;
}

/**
 * Response to get capability detail request
 */
export interface GetCapabilityDetailResponse {
    type: 'getCapabilityDetailResponse';
    success: boolean;
    capability?: Capability;
    error?: string;
    requestId?: string;
}

/**
 * Response to list executors request
 */
export interface ListExecutorsResponse {
    type: 'listExecutorsResponse';
    success: boolean;
    executors: CapabilityExecutor[];
    error?: string;
    requestId?: string;
}

/**
 * Response to start capability request
 */
export interface StartCapabilityResponse {
    type: 'startCapabilityResponse';
    success: boolean;
    executionId?: string;
    error?: string;
    requestId?: string;
}

/**
 * Response to stop capability request
 */
export interface StopCapabilityResponse {
    type: 'stopCapabilityResponse';
    success: boolean;
    error?: string;
    requestId?: string;
}

/**
 * Response to get execution status request
 */
export interface GetExecutionStatusResponse {
    type: 'getExecutionStatusResponse';
    success: boolean;
    execution?: CapabilityExecutionMetadata;
    error?: string;
    requestId?: string;
}
