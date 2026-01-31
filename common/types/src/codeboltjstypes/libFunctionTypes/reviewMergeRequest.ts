/**
 * Review/Merge Request Types
 * Type definitions for the Review and Merge Request Board feature
 */

/**
 * Request status types representing the lifecycle of a review request
 */
export type ReviewRequestStatus =
    | 'draft'              // Initial state, not yet submitted for review
    | 'pending_review'     // Submitted, waiting for reviewer
    | 'in_review'          // Currently being reviewed
    | 'changes_requested'  // Reviewer requested changes
    | 'approved'           // Approved by reviewer
    | 'review_completed'   // Review finished, ready for merge decision
    | 'merged'             // Successfully merged
    | 'rejected'           // Rejected by reviewer
    | 'closed';            // Closed without merge

/**
 * Request type - review only or review with merge
 */
export type ReviewRequestType = 'review' | 'review_merge';

/**
 * Merge strategy types
 */
export type MergeStrategy = 'patch' | 'git_worktree';

/**
 * Worktree details for git worktree merge strategy
 */
export interface WorktreeDetails {
    worktreePath: string;       // Path to the worktree directory
    branchName: string;         // Branch name in the worktree
    baseBranch?: string;        // Base branch to merge into
    commitHash?: string;        // Commit hash of the changes
}

/**
 * Merge configuration for the request
 */
export interface MergeConfig {
    strategy: MergeStrategy;
    worktreeDetails?: WorktreeDetails;  // Required for git_worktree strategy
    patchContent?: string;              // The diff/patch content for patch strategy
}

/**
 * Result of a merge operation
 */
export interface MergeResult {
    success: boolean;
    message?: string;
    conflictFiles?: string[];    // Files with conflicts if any
    appliedAt?: string;          // Timestamp when merge was applied
}

/**
 * Review feedback from reviewing agents
 */
export interface ReviewFeedback {
    id: string;
    agentId: string;
    agentName: string;
    type: 'approve' | 'request_changes' | 'comment';
    comment: string;
    createdAt: string;
}

/**
 * Core Review/Merge Request interface
 */
export interface ReviewMergeRequest {
    id: string;
    type: ReviewRequestType;
    status: ReviewRequestStatus;

    // Task context
    initialTask: string;           // Original task description
    taskDescription?: string;      // Extended description

    // Agent info
    agentId: string;               // Agent that created the request
    agentName: string;
    swarmId?: string;              // Optional swarm reference

    // Change details
    title: string;
    description: string;
    majorFilesChanged: string[];   // Main files referenced
    diffPatch: string;             // Unified diff format
    changesFilePath?: string;      // Link to changes summary file

    // Merge configuration
    mergeConfig?: MergeConfig;     // Merge strategy and details

    // Optional details
    issuesFaced?: string[];        // Problems encountered
    remainingTasks?: string[];     // Tasks still to be done

    // Review data
    reviews: ReviewFeedback[];
    linkedJobIds: string[];        // Jobs/issues created from review

    // Merge info
    mergedBy?: string;             // Agent ID or 'user' who merged
    mergeResult?: MergeResult;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    mergedAt?: string;
    closedAt?: string;
}

/**
 * Data for creating a new review/merge request
 */
export interface CreateReviewMergeRequest {
    type: ReviewRequestType;
    initialTask: string;
    title: string;
    description: string;
    majorFilesChanged: string[];
    diffPatch: string;
    agentId: string;
    agentName: string;
    swarmId?: string;
    issuesFaced?: string[];
    remainingTasks?: string[];
    mergeConfig?: MergeConfig;
    changesFilePath?: string;
    taskDescription?: string;
}

/**
 * Data for updating an existing request
 */
export interface UpdateReviewMergeRequest {
    type?: ReviewRequestType;
    status?: ReviewRequestStatus;
    title?: string;
    description?: string;
    majorFilesChanged?: string[];
    diffPatch?: string;
    issuesFaced?: string[];
    remainingTasks?: string[];
    mergeConfig?: MergeConfig;
    changesFilePath?: string;
    taskDescription?: string;
    mergedBy?: string;
    mergeResult?: MergeResult;
    mergedAt?: string;
    closedAt?: string;
}

/**
 * Data for adding a review feedback
 */
export interface AddReviewFeedback {
    agentId: string;
    agentName: string;
    type: 'approve' | 'request_changes' | 'comment';
    comment: string;
}

/**
 * Filter options for listing requests
 */
export interface ReviewMergeRequestFilters {
    status?: ReviewRequestStatus[];
    type?: ReviewRequestType[];
    agentId?: string;
    swarmId?: string;
    createdAfter?: string;
    createdBefore?: string;
    updatedAfter?: string;
    updatedBefore?: string;
    titleContains?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'status';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Display settings for UI
 */
export interface ReviewMergeRequestDisplaySettings {
    grouping: 'status' | 'type' | 'agent' | 'swarm' | 'none';
    ordering: 'createdAt' | 'updatedAt' | 'status';
    orderDirection: 'asc' | 'desc';
    showClosedRequests: boolean;
    showMergedRequests: boolean;
}
