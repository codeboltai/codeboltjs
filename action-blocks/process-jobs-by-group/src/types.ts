// ================================
// INPUT/OUTPUT TYPES
// ================================

export interface ProcessJobsByGroupInput {
    jobGroupId: string;
    workerAgentId: string;
}

export interface ProcessJobsByGroupResult {
    success: boolean;
    error?: string;
    processedJobs: string[];
    failedJobs: string[];
    totalProcessed: number;
    message?: string;
}

// ================================
// JOB TYPES
// ================================

export interface JobDependency {
    targetJobId: string;
    type: 'blocks' | 'related' | 'parent-child' | 'discovered-from';
    createdAt: string;
}

export interface Job {
    id: string;
    groupId: string;
    sequenceNumber: number;
    name: string;
    description?: string;
    type: 'bug' | 'feature' | 'task' | 'epic' | 'chore';
    status: 'open' | 'working' | 'hold' | 'closed';
    priority: 1 | 2 | 3 | 4;
    assignees: string[];
    labels: string[];
    dependencies: JobDependency[];
    parentJobId?: string;
    notes?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
}

// ================================
// PROCESSING STATE TYPES
// ================================

export interface JobProcessingState {
    jobId: string;
    threadId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

export interface ProcessingContext {
    allJobs: Map<string, Job>;
    completedJobs: Set<string>;
    failedJobs: Set<string>;
    processingJobs: Map<string, JobProcessingState>;
    pendingJobs: Set<string>;
}

// ================================
// THREAD CONTEXT TYPES
// ================================

export interface ThreadContext {
    params?: Record<string, unknown>;
    threadId?: string;
    messageId?: string;
    [key: string]: unknown;
}

export interface ActionBlockInvocationMetadata {
    sideExecutionId: string;
    threadId: string;
    parentAgentId: string;
    parentAgentInstanceId: string;
    timestamp: string;
}
