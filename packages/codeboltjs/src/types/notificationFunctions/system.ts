/**
 * Interface for system notification functions
 */
export interface SystemNotifications {
    AgentInitNotify(onStopClicked?: boolean, toolUseId?: string): void;
    AgentCompletionNotify(resultString: string, sessionId?: string, duration?: string, toolUseId?: string): void;
}