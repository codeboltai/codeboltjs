export interface AgentContext {
    swarmId: string;
    agentId: string;
    agentName: string;
}

export interface JobBlockingAnalysis {
    hasBlocker: boolean;
    blockingJobIds: string[];
    reason: string;
}

export interface Job {
    id: string;
    name: string;
    description: string;
    status: string;
    groupId: string;
}

export interface FindJobResult {
    success: boolean;
    job?: Job;
    error?: string;
}
