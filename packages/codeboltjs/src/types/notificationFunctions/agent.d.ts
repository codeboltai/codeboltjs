/**
 * Interface for agent notification functions
 */
export interface AgentNotifications {
    StartSubagentTaskRequestNotify(parentAgentId: string, subagentId: string, task: string, priority?: string, dependencies?: string[], toolUseId?: string): void;
    StartSubagentTaskResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    SubagentTaskCompletedNotify(parentAgentId: string, subagentId: string, taskId: string, result: any, status: string, toolUseId?: string): void;
}
