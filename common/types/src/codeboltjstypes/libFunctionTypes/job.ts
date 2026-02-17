// Job Group - Container for related jobs
export interface JobGroup {
    id: string; // UUID
    shortName: string; // 3-4 letter unique public shortname (e.g., "COD2")
    name?: string; // Optional display name
    parentId?: string; // Optional parent group ID
    createdAt: string;
    updatedAt: string;
}

// Job Status
export type JobStatus = 'open' | 'working' | 'hold' | 'review' | 'closed';

// Job Type
export type JobType = 'bug' | 'feature' | 'task' | 'epic' | 'chore';

// Job Priority (1-4, with 4 being urgent)
export type JobPriority = 1 | 2 | 3 | 4;

// Dependency Type
export type DependencyType = 'blocks' | 'related' | 'parent-child' | 'discovered-from';

// Job Dependency
export interface JobDependency {
    targetJobId: string; // The job this depends on
    type: DependencyType;
    createdAt: string;
}

// Main Job Interface
export interface Job {
    id: string; // Format: {GroupShortName}-{number} e.g., "COD2-5"
    groupId: string; // Reference to JobGroup
    sequenceNumber: number; // Auto-incrementing within group
    name: string; // Job title/name
    description?: string; // Detailed description
    type: JobType;
    status: JobStatus;
    priority: JobPriority;
    assignees: string[]; // List of assignee names/IDs
    labels: string[]; // Tags/labels
    dependencies: JobDependency[];
    pheromones: PheromoneDeposit[];
    parentJobId?: string; // For sub-jobs (hierarchical)
    notes?: string; // Additional notes
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    splitProposals?: SplitProposal[];
    splitStatus?: 'not_split' | 'partial_split' | 'split_up';
}

// Filter options for list command
export interface JobListFilters {
    status?: JobStatus[];
    priority?: JobPriority[];
    priorityMin?: JobPriority;
    priorityMax?: JobPriority;
    assignee?: string[];
    labels?: string[]; // AND - all labels must match
    labelsAny?: string[]; // OR - any label matches
    titleContains?: string;
    descContains?: string;
    notesContain?: string;
    ids?: string[]; // Specific job IDs
    groupId?: string;
    type?: JobType[];
    // Date filters
    createdAfter?: string;
    createdBefore?: string;
    updatedAfter?: string;
    updatedBefore?: string;
    closedAfter?: string;
    closedBefore?: string;
    // Null checks
    emptyDescription?: boolean;
    noAssignee?: boolean;
    noLabels?: boolean;
    // Pagination
    limit?: number;
    offset?: number;
    // Sorting
    sortBy?: 'priority' | 'createdAt' | 'updatedAt' | 'status' | 'importance';
    sortOrder?: 'asc' | 'desc';
    filterOutBlockers?: boolean;
}

// Input types for create/update
export interface CreateJobData {
    name: string;
    type: JobType;
    priority: JobPriority;
    description?: string;
    status?: JobStatus;
    assignees?: string[];
    labels?: string[];
    dependencies?: JobDependency[];
    parentJobId?: string;
    notes?: string;
    dueDate?: string;
}

export interface UpdateJobData extends Partial<CreateJobData> { }

export interface CreateJobGroupData {
    name?: string;
    shortName?: string;
    parentId?: string;
}

// Response types (mirroring jobService CLI responses)
export interface JobShowResponse {
    job?: Job | null;
}

export interface JobListResponse {
    jobs: Job[];
    totalCount?: number;
}

export interface JobUpdateResponse {
    job?: Job | null;
}

export interface JobCreateResponse {
    job: Job;
}

export interface JobDeleteResponse {
    deleted: boolean;
}

export interface JobDeleteBulkResponse {
    removed: number;
}

export interface JobDependencyResponse {
    job?: Job | null;
}

export interface JobReadyBlockedResponse {
    jobs: Job[];
}

export interface JobLabelsResponse {
    labels: string[];
}

export interface JobGroupCreateResponse {
    group: JobGroup;
}

// ================================
// Pheromone Types
// ================================

// Pheromone Type Configuration
export interface PheromoneType {
    name: string;
    displayName: string;
    description?: string;
    color?: string;
}

// Pheromone Deposit on a Job
export interface PheromoneDeposit {
    id?: string;
    type: string;
    intensity?: number;
    depositedBy?: string;
    depositedByName?: string;
    depositedAt?: string;
}

// Aggregated Pheromone Data
export interface PheromoneAggregation {
    type: string;
    totalIntensity: number;
    count: number;
    depositors: string[];
}

// ================================
// Split Proposal Types
// ================================

export interface ProposedJob {
    name: string;
    description?: string;
    type?: JobType;
    priority?: JobPriority;
}

export interface SplitProposal {
    id: string;
    description: string;
    proposedJobs: ProposedJob[];
    proposedBy?: string;
    proposedByName?: string;
    proposedAt: string;
    status: 'pending' | 'accepted' | 'rejected';
}

// ================================
// Job Lock Types
// ================================

export interface JobLock {
    lockedBy: string;
    lockedByName?: string;
    lockedAt: string;
}

export interface JobLockStatus {
    isLocked: boolean;
    lock?: JobLock;
}

// ================================
// Unlock Request Types
// ================================

export interface UnlockRequest {
    id: string;
    requestedBy: string;
    requestedByName?: string;
    reason: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    respondedBy?: string;
    respondedAt?: string;
}

// ================================
// Job Bidding Types
// ================================

export interface JobBid {
    id: string;
    agentId: string;
    agentName?: string;
    reason: string;
    priority: number;
    bidAt: string;
    status: 'pending' | 'accepted' | 'withdrawn';
}

// ================================
// Job Blocker Types
// ================================

export interface JobBlocker {
    id: string;
    text: string;
    addedBy: string;
    addedByName?: string;
    addedAt: string;
    blockerJobIds?: string[];
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: string;
}

// ================================
// Input Types for New Operations
// ================================

export interface AddPheromoneTypeData {
    name: string;
    displayName: string;
    description?: string;
    color?: string;
}

export interface DepositPheromoneData {
    type: string;
    intensity?: number;
    depositedBy?: string;
    depositedByName?: string;
    deliberationId?: string;
}

export interface AddSplitProposalData {
    description: string;
    proposedJobs: ProposedJob[];
    proposedBy?: string;
    proposedByName?: string;
}

export interface AddUnlockRequestData {
    requestedBy: string;
    requestedByName?: string;
    reason: string;
}

export interface AddBidData {
    agentId: string;
    agentName?: string;
    reason: string;
    priority: number;
}

export interface AddBlockerData {
    text: string;
    addedBy: string;
    addedByName?: string;
    blockerJobIds?: string[];
}

// ================================
// Response Types for New Operations
// ================================

// Pheromone Responses
export interface JobPheromoneTypesResponse {
    types: PheromoneType[];
}

export interface JobPheromoneTypeResponse {
    types: PheromoneType[];
}

export interface JobPheromoneDepositResponse {
    job?: Job | null;
}

export interface JobPheromoneRemoveResponse {
    job?: Job | null;
}

export interface JobPheromoneListResponse {
    pheromones: PheromoneDeposit[];
}

export interface JobPheromoneAggregatedResponse {
    aggregations: PheromoneAggregation[];
}

export interface JobPheromoneSearchResponse {
    jobs: Job[];
    totalCount: number;
}

// Split Proposal Responses
export interface JobSplitProposeResponse {
    job?: Job | null;
}

export interface JobSplitDeleteResponse {
    job?: Job | null;
}

export interface JobSplitAcceptResponse {
    job?: Job | null;
}

// Lock Responses
export interface JobLockAcquireResponse {
    job?: Job | null;
}

export interface JobLockReleaseResponse {
    job?: Job | null;
}

export interface JobLockCheckResponse extends JobLockStatus { }

// Unlock Request Responses
export interface JobUnlockRequestAddResponse {
    job?: Job | null;
}

export interface JobUnlockRequestApproveResponse {
    job?: Job | null;
}

export interface JobUnlockRequestRejectResponse {
    job?: Job | null;
}

export interface JobUnlockRequestDeleteResponse {
    job?: Job | null;
}

// Bid Responses
export interface JobBidAddResponse {
    job?: Job | null;
}

export interface JobBidWithdrawResponse {
    job?: Job | null;
}

export interface JobBidAcceptResponse {
    job?: Job | null;
}

export interface JobBidListResponse {
    bids: JobBid[];
}

// Blocker Responses
export interface JobBlockerAddResponse {
    job?: Job | null;
}

export interface JobBlockerRemoveResponse {
    job?: Job | null;
}

export interface JobBlockerResolveResponse {
    job?: Job | null;
}
