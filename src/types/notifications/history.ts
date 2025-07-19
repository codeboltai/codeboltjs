// ===== HISTORY NOTIFICATIONS =====

// Request Notifications
export type SummarizePreviousConversationRequestNotification = {
    toolUseId: string;
    type: "historynotify";
    action: "summarizeAllRequest";
    data: {};
};

export type SummarizePreviousConversationResultNotification = {
    toolUseId: string;
    type: "historynotify";
    action: "summarizeAllResult";
    content: string | any;
    isError?: boolean;
};


export type SummarizeCurentMessageRequestNotification = {
    toolUseId: string;
    type: "historynotify";
    action: "summarizeRequest";
    data: {
        messages: {
            role: string;
            content: string;
        }[];
        depth: number;
    };
};


export type SummarizeCurrentMessageResultNotification = {
    toolUseId: string;
    type: "historynotify";
    action: "summarizeResult";
    content: string | any;
    isError?: boolean;
}; 