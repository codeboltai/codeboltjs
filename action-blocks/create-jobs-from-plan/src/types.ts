// ================================
// INPUT/OUTPUT TYPES
// ================================

/**
 * Task information passed by the orchestrator
 */
export interface TaskToExecute {
    taskId: string;
    name: string;
    description: string;
    priority?: 'High' | 'Medium' | 'Low';
    dependencies?: string[];
    estimated_time?: string;
}

/**
 * Full plan structure for context
 */
export interface ActionPlan {
    planId: string;
    name: string;
    description: string;
    tasks: any[];
}

/**
 * Input parameters for the action block
 */
export interface CreateJobInput {
    /** The full action plan for context */
    plan: ActionPlan;

    /** Single task to create a job for */
    task: TaskToExecute;

    /** Job group ID where the job will be created */
    groupId: string;

    /** Worker agent ID to assign the job to */
    workerAgentId?: string;
}

/**
 * Result returned by the action block
 */
export interface CreateJobResult {
    success: boolean;
    error?: string;

    /** Created job ID */
    jobId?: string;

    /** Task ID that was processed */
    taskId?: string;

    /** Group ID where job was created */
    groupId: string;

    /** Created job details */
    job?: CreatedJob;
}

// ================================
// JOB TYPES
// ================================

export type JobType = 'bug' | 'feature' | 'task' | 'epic' | 'chore';
export type JobPriority = 1 | 2 | 3 | 4;
export type JobStatus = 'open' | 'working' | 'hold' | 'closed';

export interface CreatedJob {
    jobId: string;
    taskId: string;
    name: string;
    description: string;
    type: JobType;
    priority: JobPriority;
    status: JobStatus;
}

/**
 * LLM-generated job details
 */
export interface GeneratedJobDetails {
    name: string;
    description: string;
    type: JobType;
    priority: JobPriority;
    labels: string[];
    notes?: string;
}
