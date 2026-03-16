// ===== AGENT NOTIFICATIONS =====

//Subagent Tasks
export type StartSubagentTaskRequestNotification = {
    toolUseId: string;
    type: "agentnotify";
    action: "startSubagentTaskRequest";
    data: {
        parentAgentId: string;
        subagentId: string;
        task: string;
        priority?: string;
        dependencies?: string[];
    };
}

export type StartSubagentTaskResponseNotification = {
    toolUseId: string;
    type: "agentnotify";
    action: "startSubagentTaskResult";
    content: string | any;
    isError?: boolean;
}

export type SubagentTaskCompletedNotification = {
    toolUseId: string;
    type: "agentnotify";
    action: "subagentTaskCompleted";
    data: {
        parentAgentId: string;
        subagentId: string;
        taskId: string;
        result: any;
        status: string;
    };
}
