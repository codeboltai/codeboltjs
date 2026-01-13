/**
 * Hook Types
 * Type definitions for hook operations
 */

export interface HookBaseResponse {
    type: string;
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
}

export type HookTrigger =
    | 'file.created'
    | 'file.modified'
    | 'file.deleted'
    | 'git.commit'
    | 'git.push'
    | 'git.pull'
    | 'terminal.command'
    | 'agent.start'
    | 'agent.end'
    | 'message.received'
    | 'custom';

export type HookAction =
    | 'notify'
    | 'execute'
    | 'log'
    | 'webhook'
    | 'agent';

export interface HookConfig {
    id?: string;
    name: string;
    description?: string;
    trigger: HookTrigger;
    triggerConfig?: {
        pattern?: string;
        path?: string;
        command?: string;
        eventType?: string;
    };
    action: HookAction;
    actionConfig?: {
        message?: string;
        command?: string;
        url?: string;
        agentId?: string;
        payload?: Record<string, any>;
    };
    enabled?: boolean;
    priority?: number;
    conditions?: HookCondition[];
}

export interface HookCondition {
    field: string;
    operator: 'eq' | 'neq' | 'contains' | 'startsWith' | 'endsWith' | 'matches';
    value: string;
}

export interface Hook extends HookConfig {
    id: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    lastTriggeredAt?: string;
    triggerCount: number;
}

// Response types
export interface HookResponse extends HookBaseResponse {
    data?: Hook;
}

export interface HookListResponse extends HookBaseResponse {
    data?: Hook[];
}

export interface HookInitializeResponse extends HookBaseResponse {
    type: 'hookInitializeResponse';
}

export interface HookDeleteResponse extends HookBaseResponse {
    type: 'hookDeleteResponse';
}
