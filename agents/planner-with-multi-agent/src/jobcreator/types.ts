// ================================
// INPUT/OUTPUT TYPES
// ================================

export interface CreateJobsFromPlanInput {
    requirementPlanId: string;
    workerAgentId?: string;
}

export interface CreateJobsFromPlanResult {
    success: boolean;
    error?: string;
    groupId?: string;
    jobGroupId?: string;
    jobsCreated: string[];
    totalJobs: number;
    message?: string;
}

// ================================
// REQUIREMENT PLAN TYPES
// ================================

export interface RequirementPlanSection {
    id: string;
    type: 'markdown' | 'specs-link' | 'actionplan-link' | 'uiflow-link' | 'code-block';
    title?: string;
    content?: string;
    linkedFile?: string;
    order?: number;
}

export interface RequirementPlanDocument {
    version: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    sections: RequirementPlanSection[];
}

// ================================
// ACTION PLAN TYPES
// ================================

export interface ActionPlanTask {
    taskId: string;
    name: string;
    description?: string;
    status: string;
    priority?: string;
    threadId?: string;
    statusUpdatedAt?: string;
    updatedAt?: string;
}

export interface ActionPlan {
    planId: string;
    name: string;
    description?: string;
    items: ActionPlanTask[];
    status: string;
    createdAt: string;
    updatedAt: string;
}

// ================================
// LLM JOB GENERATION TYPES
// ================================

export interface GeneratedJob {
    name: string;
    description: string;
    type: 'bug' | 'feature' | 'task' | 'epic' | 'chore';
    priority: 'High' | 'Medium' | 'Low';
    estimatedEffort: 'small' | 'medium' | 'large';
    labels: string[];
    dependencies: string[];
}

export interface LLMJobBreakdownResponse {
    jobs: GeneratedJob[];
    reasoning?: string;
}

// ================================
// JOB CREATION TYPES
// ================================

export interface JobCreationResult {
    jobId: string;
    jobName: string;
    dependencies: string[];
}

export interface JobDependencyMap {
    [jobName: string]: string;
}
