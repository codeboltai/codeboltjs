/**
 * Submit Merge Request ActionBlock Types
 *
 * For remote agents (AgentFS Provider) running in separate filesystems.
 * Diff is calculated from git changes in the project path.
 */

// ============================================
// Merge Strategy Types
// ============================================

/**
 * Merge strategy types
 */
export type MergeStrategy = 'patch' | 'git_worktree';

/**
 * Merge configuration
 */
export interface MergeConfig {
    /** Merge strategy: 'patch' applies diff directly */
    strategy: MergeStrategy;

    /** Base branch to compare against (default: main) */
    baseBranch?: string;
}

// ============================================
// ActionBlock Input/Output Types
// ============================================

/**
 * Input parameters for the Submit Merge Request ActionBlock
 *
 * Called by remote agents (AgentFS Provider) running in separate filesystems.
 * Diff is calculated from git changes in the projectPath.
 */
export interface SubmitMergeRequestInput {
    /** Path where the agent made changes (mounted agentfs path or project root) */
    projectPath: string;

    /** Overlay/environment name (for reference) */
    overlayName?: string;

    /** Merge configuration */
    mergeConfig?: MergeConfig;

    /** Agent ID creating the request */
    agentId: string;

    /** Agent name creating the request */
    agentName: string;

    /** Title for the merge request (optional - derived from commit/changes if not provided) */
    title?: string;

    /** Description of changes (optional - derived from commit message if not provided) */
    description?: string;

    /** The original task that led to these changes */
    initialTask?: string;

    /** Optional swarm ID if part of a swarm */
    swarmId?: string;

    /** Whether to start a background review agent (default: true) */
    startReviewAgent?: boolean;

    /** Agent ID to use for the review agent */
    reviewAgentId?: string;

    /** Whether to wait for review completion (default: false) */
    waitForReview?: boolean;

    /** Timeout for waiting for review in ms (default: 300000 = 5 min) */
    reviewTimeout?: number;
}

/**
 * Output from the Submit Merge Request ActionBlock
 */
export interface SubmitMergeRequestOutput {
    /** Whether the operation was successful */
    success: boolean;

    /** ID of the created merge request */
    mergeRequestId?: string;

    /** The created merge request details */
    mergeRequest?: {
        id: string;
        title: string;
        status: string;
        diffPatch: string;
        majorFilesChanged: string[];
    };

    /** Review result (if waitForReview was true or review completed) */
    reviewResult?: {
        completed: boolean;
        approved?: boolean;
        status?: string;
        reviewThreadId?: string;
    };

    /** Error message if failed */
    error?: string;
}

/**
 * Review event received from the review agent
 */
export interface ReviewEvent {
    type: 'backgroundAgentCompletion' | 'agentQueueEvent';
    data: {
        threadId?: string;
        status?: string;
    };
}

// ============================================
// Internal Types (for API calls)
// ============================================

/**
 * Data for creating a merge request (internal use)
 */
export interface CreateReviewMergeRequest {
    type: 'review' | 'review_merge';
    initialTask: string;
    title: string;
    description: string;
    majorFilesChanged: string[];
    diffPatch: string;
    agentId: string;
    agentName: string;
    swarmId?: string;
    mergeConfig?: MergeConfig;
}
