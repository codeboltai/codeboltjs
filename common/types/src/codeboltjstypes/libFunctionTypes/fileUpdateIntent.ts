/**
 * File Update Intent Types for Multi-Agent Coordination
 * Allows agents to declare files they intend to modify before starting work
 */

/**
 * Intent Level - determines behavior on overlap
 * 1 = Advisory/Notification - Just informs others; no enforcement. Overlapping agents proceed but log warning.
 * 2 = Soft Reservation - Prefer avoidance: Agents should pick another task or negotiate if overlap.
 * 3 = Priority-Based - Higher-priority intent wins; lower one backs off or escalates.
 * 4 = Hard Lock - Blocks others entirely (fallback to traditional locking).
 */
export type IntentLevel = 1 | 2 | 3 | 4;

export const INTENT_LEVEL_INFO: Record<IntentLevel, { name: string; behavior: string; useCase: string; color: string }> = {
    1: {
        name: 'Advisory/Notification',
        behavior: 'Just informs others; no enforcement. Overlapping agents proceed but log warning.',
        useCase: 'Low-risk, exploratory tasks',
        color: '#3B82F6', // Blue
    },
    2: {
        name: 'Soft Reservation',
        behavior: 'Prefer avoidance: Agents should pick another task or negotiate if overlap.',
        useCase: 'Default for most coding swarms',
        color: '#F59E0B', // Amber
    },
    3: {
        name: 'Priority-Based',
        behavior: 'Higher-priority intent wins; lower one backs off or escalates.',
        useCase: 'Urgent fixes vs. features',
        color: '#8B5CF6', // Purple
    },
    4: {
        name: 'Hard Lock',
        behavior: 'Blocks others entirely (fallback to traditional locking).',
        useCase: 'Critical/shared resources',
        color: '#DC2626', // Red
    },
};

/**
 * File-level intent detail
 */
export interface FileIntent {
    filePath: string;          // Absolute or relative path
    intentLevel: IntentLevel;  // Intent level for this specific file
    targetSections?: string[]; // Specific functions/classes targeted (optional)
}

/**
 * Intent status
 */
export type IntentStatus = 'active' | 'completed' | 'expired' | 'cancelled';

/**
 * Main File Update Intent
 */
export interface FileUpdateIntent {
    id: string;                    // UUID
    environmentId: string;         // Environment this intent belongs to
    files: FileIntent[];           // List of files with their intent levels
    description: string;           // Description of the change
    estimatedDuration?: number;    // Estimated duration in minutes
    priority: number;              // 1-10, higher = more important
    claimedBy: string;             // Agent ID who claimed this intent
    claimedByName?: string;        // Display name of the agent
    createdAt: string;             // ISO timestamp
    updatedAt: string;             // ISO timestamp
    expiresAt?: string;            // Auto-expire timestamp (if autoExpire is true)
    autoExpire: boolean;           // Whether to auto-expire
    maxAutoExpireMinutes?: number; // Max duration before auto-expire (in minutes)
    status: IntentStatus;          // Current status
    closedAt?: string;             // When the intent was closed
    closedBy?: string;             // Who closed the intent
}

/**
 * Request to create a file update intent
 */
export interface CreateFileUpdateIntentRequest {
    environmentId: string;
    files: FileIntent[];
    description: string;
    estimatedDuration?: number;
    priority?: number;             // Default: 5
    autoExpire?: boolean;          // Default: false
    maxAutoExpireMinutes?: number; // Default: 60
}

/**
 * Request to update a file update intent
 */
export interface UpdateFileUpdateIntentRequest {
    files?: FileIntent[];
    description?: string;
    estimatedDuration?: number;
    priority?: number;
    autoExpire?: boolean;
    maxAutoExpireMinutes?: number;
}

/**
 * Overlapping intent info
 */
export interface OverlappingIntentInfo {
    intentId: string;
    claimedBy: string;
    claimedByName?: string;
    files: string[];
    intentLevels: IntentLevel[];
    priority: number;
}

/**
 * Response for overlap detection
 */
export interface IntentOverlapResult {
    hasOverlap: boolean;
    overlappingIntents: OverlappingIntentInfo[];
    blockedFiles: string[];        // Files that are hard-locked (level 4)
    canProceed: boolean;           // Whether the agent can proceed despite overlap
    message?: string;              // Human-readable message
}

/**
 * Filter options for listing intents
 */
export interface FileUpdateIntentFilters {
    environmentId?: string;
    status?: IntentStatus[];
    claimedBy?: string;
    filePathContains?: string;
    createdAfter?: string;
    createdBefore?: string;
}

/**
 * Response types for API calls
 */
export interface FileUpdateIntentResponse {
    intent?: FileUpdateIntent;
    overlap?: IntentOverlapResult;
}

export interface FileUpdateIntentListResponse {
    intents: FileUpdateIntent[];
}

export interface FileUpdateIntentOverlapResponse {
    result: IntentOverlapResult;
}

export interface FileUpdateIntentBlockedFilesResponse {
    blockedFiles: string[];
}

export interface FileWithIntent {
    filePath: string;
    intentId: string;
    claimedBy: string;
    claimedByName?: string;
    intentLevel: IntentLevel;
    priority: number;
}
