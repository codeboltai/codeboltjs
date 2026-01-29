/**
 * Base Application Response Types
 * Generic base types for all SDK responses
 */

/**
 * Generic base application response - use with a type parameter for typed data
 * @template T - The type of the data payload
 */
export interface BaseApplicationResponse<T = unknown> {
    type: string;
    requestId: string;
    message?: string;
    success?: boolean;
    data?: T;
    error?: string;
}

// ============================================
// Git Common Types
// ============================================

/**
 * Git file status entry
 */
export interface GitFileStatus {
    path: string;
    index: string;
    working_dir: string;
}

/**
 * Git rename entry
 */
export interface GitRenameEntry {
    from: string;
    to: string;
}

/**
 * Git status result data structure
 */
export interface GitStatusData {
    not_added: string[];
    conflicted: string[];
    created: string[];
    deleted: string[];
    modified: string[];
    renamed: GitRenameEntry[];
    staged: string[];
    files: GitFileStatus[];
    ahead: number;
    behind: number;
    current: string;
    tracking: string | null;
}

/**
 * Git commit summary structure
 */
export interface GitCommitSummary {
    author_name: string;
    author_email: string;
    date: string;
    message: string;
    hash: string;
}

/**
 * Git diff result structure
 */
export interface GitDiffResult {
    files: string[];
    insertions: number;
    deletions: number;
    changed: number;
}

// ============================================
// Agent Common Types
// ============================================

/**
 * Basic agent information
 */
export interface AgentInfo {
    id: string;
    name: string;
    description?: string;
    type?: string;
    capabilities?: string[];
}

/**
 * Detailed agent information
 */
export interface AgentDetail extends AgentInfo {
    metadata?: Record<string, unknown>;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Task execution result
 */
export interface TaskResult {
    success: boolean;
    output?: string;
    error?: string;
    data?: unknown;
}