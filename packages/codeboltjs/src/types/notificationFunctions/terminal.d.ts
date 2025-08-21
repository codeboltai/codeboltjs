/**
 * Interface for terminal notification functions
 */
export interface TerminalNotifications {
    CommandExecutionRequestNotify(command: string, returnEmptyStringOnSuccess?: boolean, executeInMain?: boolean, toolUseId?: string): void;
    CommandExecutionResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}
