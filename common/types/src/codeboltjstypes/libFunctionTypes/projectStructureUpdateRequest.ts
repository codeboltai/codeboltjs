/**
 * Project Structure Update Request Types
 * For multi-agent coordination when proposing changes to project structure
 */

import {
    ApiRoute,
    UiRoute,
    DatabaseTable,
    Dependency,
    RunCommand,
    DeploymentConfig,
    FrameworkInfo,
    DesignGuidelines,
} from './projectStructure';

// ============================================================================
// Change Action Types
// ============================================================================

/**
 * Action to be performed on an item
 */
export type ChangeAction = 'create' | 'update' | 'delete' | 'none';

/**
 * Wraps an item with change metadata
 * @template T - The type of item being wrapped
 */
export interface ChangeWrapper<T> {
    /** Unique identifier for this change */
    id: string;
    /** The action to perform */
    action: ChangeAction;
    /** The item data (new state for create/update, current state for delete) */
    item: T;
    /** Original item before change (for update/delete actions) */
    originalItem?: T;
}

// ============================================================================
// Update Request Status
// ============================================================================

/**
 * Status of an update request
 */
export type UpdateRequestStatus =
    | 'draft'                    // Just created, not submitted
    | 'waiting_for_dispute'      // Submitted, waiting for others to review
    | 'disputed'                 // Someone raised a dispute
    | 'actively_being_worked'    // Work in progress, no disputes
    | 'waiting_to_merge'         // Work complete, ready to merge
    | 'merged';                  // Successfully merged into project structure

// ============================================================================
// Update Request Change - Mirrors PackageMetadata
// ============================================================================

export type PackageType = 'frontend' | 'backend' | 'shared' | 'library' | 'service';

/**
 * Package-level info changes
 */
export interface PackageInfoChange {
    name?: string;
    description?: string;
    version?: string;
    type?: PackageType;
    language?: string;
    languageVersion?: string;
    runtime?: string;
}

/**
 * Database changes including tables and ORM config
 */
export interface DatabaseChange {
    tables?: ChangeWrapper<DatabaseTable>[];
    // orm?: ChangeWrapper<OrmConfig>; // OrmConfig not defined in projectStructure yet
    type?: string;
    connectionString?: string;
}

/**
 * Represents all changes to a single package
 * Mirrors PackageMetadata structure with ChangeWrapper for each section
 */
export interface UpdateRequestChange {
    /** Target package ID (existing or new) */
    packageId: string;
    /** Action for the package itself */
    packageAction: ChangeAction;
    /** Package name (for display and create) */
    packageName?: string;
    /** Package path (for create) */
    packagePath?: string;

    /** Package-level info changes */
    packageInfo?: ChangeWrapper<PackageInfoChange>;

    // All sections from PackageMetadata wrapped with ChangeWrapper

    /** API routes changes */
    apiRoutes?: ChangeWrapper<ApiRoute>[];

    /** UI routes changes */
    uiRoutes?: ChangeWrapper<UiRoute>[];

    /** Database changes */
    database?: DatabaseChange;

    /** Dependency changes */
    dependencies?: ChangeWrapper<Dependency>[];

    /** Run command changes */
    runCommands?: ChangeWrapper<RunCommand>[];

    /** Deployment config changes */
    deploymentConfigs?: ChangeWrapper<DeploymentConfig>[];

    /** Frontend framework change */
    frontendFramework?: ChangeWrapper<FrameworkInfo>;

    /** Design guidelines change */
    designGuidelines?: ChangeWrapper<DesignGuidelines>;

    // DataStore, InterfaceDefinition, ApplicationLayer, BuildTool not defined in projectStructure yet
}

// ============================================================================
// Dispute Types
// ============================================================================

/**
 * Who raised the dispute or comment
 */
export type ActorType = 'user' | 'agent';

/**
 * Comment on a dispute
 */
export interface DisputeComment {
    id: string;
    author: string;
    authorType: ActorType;
    content: string;
    createdAt: string;
}

/**
 * Dispute status
 */
export type DisputeStatus = 'open' | 'resolved';

/**
 * A dispute raised against an update request
 */
export interface Dispute {
    id: string;
    /** Who raised the dispute */
    raisedBy: string;
    raisedByType: ActorType;
    /** Reason for the dispute */
    reason: string;
    /** Current status */
    status: DisputeStatus;
    /** Comments on this dispute */
    comments: DisputeComment[];
    /** When the dispute was raised */
    createdAt: string;
    /** When the dispute was resolved */
    resolvedAt?: string;
    /** Resolution summary */
    resolutionSummary?: string;
}

// ============================================================================
// Watcher Types
// ============================================================================

/**
 * An agent or user watching for updates
 */
export interface Watcher {
    id: string;
    /** Agent ID or user ID */
    watcherId: string;
    watcherType: ActorType;
    /** When they started watching */
    createdAt: string;
}

// ============================================================================
// Main Update Request Type
// ============================================================================

/**
 * Complete Project Structure Update Request
 */
export interface ProjectStructureUpdateRequest {
    /** Unique identifier */
    id: string;

    /** Short title describing the change */
    title: string;

    /** Detailed description of what and why */
    description?: string;

    /** Current status */
    status: UpdateRequestStatus;

    /** Who created the request */
    author: string;
    authorType: ActorType;

    /** All changes to be applied */
    changes: UpdateRequestChange[];

    /** Disputes against this request */
    disputes: Dispute[];

    /** Agents/users watching this request */
    watchers: Watcher[];

    /** Timestamps */
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
    mergedAt?: string;
}

// ============================================================================
// Request/Response Types for API
// ============================================================================

export interface CreateUpdateRequestData {
    title: string;
    description?: string;
    author: string;
    authorType: ActorType;
    changes: UpdateRequestChange[];
}

export interface UpdateUpdateRequestData {
    title?: string;
    description?: string;
    changes?: UpdateRequestChange[];
}

export interface CreateDisputeData {
    raisedBy: string;
    raisedByType: ActorType;
    reason: string;
}

export interface AddCommentData {
    author: string;
    authorType: ActorType;
    content: string;
}

export interface AddWatcherData {
    watcherId: string;
    watcherType: ActorType;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export type UpdateRequestEventType =
    | 'updateRequest:created'
    | 'updateRequest:updated'
    | 'updateRequest:statusChanged'
    | 'updateRequest:disputed'
    | 'updateRequest:disputeResolved'
    | 'updateRequest:commentAdded'
    | 'updateRequest:watcherAdded'
    | 'updateRequest:watcherRemoved'
    | 'updateRequest:merged';

export interface UpdateRequestWebSocketEvent {
    type: UpdateRequestEventType;
    requestId: string;
    data: any;
    timestamp: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface UpdateRequestFilters {
    status?: UpdateRequestStatus[];
    author?: string;
    search?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface UpdateRequestResponse {
    success: boolean;
    data?: ProjectStructureUpdateRequest;
    message?: string;
    error?: any;
}

export interface UpdateRequestListResponse {
    success: boolean;
    data: ProjectStructureUpdateRequest[];
    message?: string;
    error?: any;
}
