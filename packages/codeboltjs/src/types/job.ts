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
export type JobStatus = 'open' | 'working' | 'hold' | 'closed';

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
    parentJobId?: string; // For sub-jobs (hierarchical)
    notes?: string; // Additional notes
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
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
    sortBy?: 'priority' | 'createdAt' | 'updatedAt' | 'status';
    sortOrder?: 'asc' | 'desc';
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

export interface UpdateJobData extends Partial<CreateJobData> {}

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
