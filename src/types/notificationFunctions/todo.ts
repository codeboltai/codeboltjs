/**
 * Interface for todo notification functions
 */
export interface TodoNotifications {
    AddTodoRequestNotify(title?: string, agentId?: string, description?: string, phase?: string, category?: string, priority?: string, tags?: string[], toolUseId?: string): void;
    AddTodoResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GetTodoRequestNotify(filters?: any, toolUseId?: string): void;
    GetTodoResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    EditTodoTaskRequestNotify(taskId?: string, title?: string, description?: string, phase?: string, category?: string, priority?: string, tags?: string[], status?: string, toolUseId?: string): void;
    EditTodoTaskResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}