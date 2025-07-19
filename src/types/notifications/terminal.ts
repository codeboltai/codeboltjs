// ===== TERMINAL NOTIFICATIONS =====
export type CommandExecutionRequestNotification = {
    toolUseId: string;
    type: "terminalnotify";
    action: "executeCommandRequest";
    data: {
        command: string;
        returnEmptyStringOnSuccess?: boolean;
        executeInMain?: boolean;
    };
};

export type CommandExecutionResponseNotification = {
    toolUseId: string;
    type: "terminalnotify";
    action: "executeCommandResult";
    content: string | any;
    isError?: boolean;
}; 