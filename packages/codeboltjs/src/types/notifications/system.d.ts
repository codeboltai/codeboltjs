export type agentInitNotification = {
    toolUseId: string;
    type: "chatnotify";
    action: "processStartedRequest";
    data: {
        onStopClicked?: boolean;
    };
};
export type agentCompletionNotification = {
    toolUseId: string;
    type: "chatnotify";
    action: "processStoppedRequest";
    data: {
        sessionId?: string;
        duration: string;
        result: {
            resultString: string;
        };
    };
};
