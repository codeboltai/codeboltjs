export type AgentSessionState =
    | 'pending'
    | 'active'
    | 'complete'
    | 'error'
    | 'awaitingInput'
    | 'stale';

export type AgentActivityType =
    | 'thought'
    | 'action'
    | 'response'
    | 'error'
    | 'elicitation';

export type AgentSignalType = 'stop' | 'auth' | 'select';

export interface AgentSessionIssue {
    id: string;
    identifier: string;
    title: string;
    description?: string;
    url: string;
    project?: { name: string };
    team?: { name: string; key: string };
    labels?: Array<{ name: string }>;
    priority: number;
    state?: { name: string };
}

export interface AgentSignal {
    type: AgentSignalType;
    data?: unknown;
}

export interface AgentPlanStep {
    content: string;
    status: 'pending' | 'inProgress' | 'completed' | 'canceled';
}

export interface AgentPlan {
    id: string;
    steps: AgentPlanStep[];
}

export interface AgentSession {
    id: string;
    state: AgentSessionState;
    promptContext: string;
    issueId: string;
    issue?: AgentSessionIssue;
    signals?: AgentSignal[];
    plan?: AgentPlan;
    createdAt: string;
    updatedAt: string;
}

export interface AgentActivity {
    type: AgentActivityType;
    content: string;
    metadata?: Record<string, unknown>;
}

export interface ConnectionValidation {
    valid: boolean;
    name?: string;
    error?: string;
}
