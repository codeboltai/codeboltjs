// ===== TASK NOTIFICATIONS =====

// Add Task
export type AddTodoRequestNotification = {
    toolUseId: string;
    type: "tasknotify";
    action: "addTaskRequest";
    data: {
        title?: string;
        agentId?: string;
        description?: string;
        phase?: string;
        category?: string;
        priority?: string;
        tags?: string[];
    };
};

export type AddTodoResponseNotification = {
    toolUseId: string;
    type: "tasknotify";
    action: "addTaskResult";
    content: string | any;
    isError?: boolean;
};


// Get Tasks
export type GetTodoRequestNotification = {
    toolUseId: string;
    type: "tasknotify";
    action: "getTasksRequest";
    data: {
        filters?: any;
    };
};

export type GetTodoTasksResponseNotification = {
    toolUseId: string;
    type: "tasknotify";
    action: "getTasksResult";
    content: string | any;
    isError?: boolean;
};

// Update Task
export type EditTodoTaskRequestNotification = {
    toolUseId: string;
    type: "tasknotify";
    action: "updateTaskRequest";
    data: {
        taskId?: string;
        title?: string;
        description?: string;
        phase?: string;
        category?: string;
        priority?: string;
        tags?: string[];
        status?: string;
    };
};

export type EditTodoTaskResponseNotification = {
    toolUseId: string;
    type: "tasknotify";
    action: "updateTaskResult";
    content: string | any;
    isError?: boolean;
};


// Union types for convenience
export type TodoTaskNotification =
    | AddTodoRequestNotification
    | GetTodoRequestNotification
    | EditTodoTaskRequestNotification;

export type TaskResponseNotification =
    | AddTodoResponseNotification
    | GetTodoTasksResponseNotification
    | EditTodoTaskResponseNotification; 