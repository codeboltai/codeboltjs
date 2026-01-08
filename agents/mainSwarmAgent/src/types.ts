// ================================
// TYPE DEFINITIONS
// ================================

export interface RoleDecision {
    action: 'assign_role' | 'create_role';
    roleId?: string;
    roleName: string;
    roleDescription?: string;
    reasoning: string;
}

export interface StructureProposal {
    roles: string[];
    teams: string[];
    teamVacancies: Record<string, string[]>;
    myRole: string;
    myTeam: string;
    summary: string;
}

export interface DeliberationReview {
    action: 'vote' | 'respond';
    responseId?: string;
    reason?: string;
    roles?: string[];
    teams?: string[];
    teamVacancies?: Record<string, string[]>;
    myRole?: string;
    myTeam?: string;
    summary?: string;
}

export interface TeamDecision {
    action: 'apply_vacancy' | 'propose_team' | 'join_team' | 'wait';
    vacancyId?: string;
    teamId?: string;
    teamName?: string;
    teamDescription?: string;
    neededRoles?: string[];
    message?: string;
    reasoning: string;
}

export interface AgentContext {
    swarmId: string;
    swarmName: string;
    agentId: string;
    agentName: string;
    capabilities: string[];
    requirements: string;
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

export interface SplitApprovalAnalysis {
    action: 'approve' | 'reject';
    reason: string;
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
    type: string;
    status: string;
    dependencies?: { targetJobId: string; type: string }[];
    parentJobId?: string;
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
    SPLIT_THIS_JOB: 'split-this-job',
    IS_BLOCKED: 'isblocked',
    MIGHT_BE_COMPLETED: 'mightbecompleted'
} as const;


export interface SwarmConfig {
    isJobSelfSplittingEnabled: boolean;
    minimumJobSplitProposalRequired: number;
    isJobSplitDeliberationRequired: boolean;
    selectJobSplitDeliberationType: string;
}

export const BLOCKED_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
