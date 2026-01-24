// ================================
// TYPE DEFINITIONS
// ================================

export interface AgentContext {
    swarmId: string;
    swarmName?: string;
    agentId: string;
    agentName: string;
    capabilities?: string[];
    requirements?: string;
}

export interface JobSplitAnalysis {
    shouldSplit: boolean;
    reason: string;
    proposedJobs?: { name: string; description: string }[];
}

export interface JobBlockerAnalysis {
    hasBlocker: boolean;
    blockerReason?: string;
    blockerType?: string;
}

export interface JobBlockingAnalysis {
    hasBlocker: boolean;
    blockingJobIds: string[];
    reason: string;
}

// ================================
// JOB INTERFACES
// ================================

export interface Job {
    id: string;
    name: string;
    description?: string;
    type?: string;
    status: string;
    groupId?: string;
    dependencies?: { targetJobId: string; type: string }[];
    parentJobId?: string;
    pheromones: any[];
    splitProposals?: { id: string; status: string; description: string; proposedJobs: any[] }[];
    lock?: any;
}

export interface PheromoneDeposit {
    type: string;
    intensity?: number;
    depositedBy?: string;
    depositedByName?: string;
    depositedAt?: string;
}

// ================================
// PHEROMONE CONSTANTS
// ================================

export const PHEROMONE_TYPES = {
    SPLIT_THIS_JOB: 'request_split',
    IS_BLOCKED: 'isblocked',
    TASK_NOT_READY: 'task_not_ready',
    MIGHT_BE_COMPLETED: 'mightbecompleted',
    IMPORTANCE: 'importance'
} as const;

export interface SwarmConfig {
    isJobSelfSplittingEnabled: boolean;
    minimumJobSplitProposalRequired: number;
    isJobSplitDeliberationRequired: boolean;
    selectJobSplitDeliberationType: string;
}

export const BLOCKED_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// ================================
// ACTION BLOCK RESULT TYPES
// ================================

export type JobPickAction = 'implement' | 'split' | 'terminate' | 'free-request' | null;

export interface JobPickResult {
    job: Job | null;
    action: JobPickAction;
}

// Simplified job output for action block results (without internal fields like pheromones)
export interface JobOutput {
    id: string;
    name: string;
    description?: string;
    status: string;
    groupId: string;
}

export interface FindJobResult {
    success: boolean;
    job?: JobOutput;
    action?: JobPickAction;
    error?: string;
}
