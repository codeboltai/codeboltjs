/**
 * Types for the Deliberation One-Out-of-N ActionBlock
 */

export interface DeliberationOptions {
    numberOfAgents: number;
    agentId?: string;
}

export interface DeliberationInput {
    task: string;
    taskDescription: string;
    options?: DeliberationOptions;
}

export interface AgentResponse {
    agentId: string;
    threadId: string;
    response: string;
    responseId?: string;
    timestamp: string;
}

export interface VoteRecord {
    voterId: string;
    voterName: string;
    responseId: string;
    timestamp: string;
}

export interface DeliberationResult {
    selectedResponse: string;
    agentResponses: AgentResponse[];
    votes: Record<string, number>;
    winningAgentId: string;
    winningResponseId: string;
    deliberationId: string;
}

export interface DeliberationOutput {
    success: boolean;
    result?: DeliberationResult;
    error?: string;
}

export interface DeliberationContext {
    deliberationId: string;
    task: string;
    taskDescription: string;
    numberOfAgents: number;
    creatorId: string;
    creatorName: string;
    groupId: string;
}
