// ===== CHAT NOTIFICATIONS =====

// Request Notifications

export type UserMessageRequestNotification = {
    toolUseId: string;
    type: "chatnotify";
    action: "sendMessageRequest";
    data: {
        message: string;
        payload?: any;
    };
};

export type AgentTextResponseNotification = {
    toolUseId: string;
    type: "chatnotify";
    action: "agentTextResponse";
    content: string | any;
    isError?: boolean;
    data?: {
        message: string;
        timestamp?: string;
        agentId?: string;
        conversationId?: string;
    };
}

export type GetChatHistoryRequestNotification = {
    toolUseId: string;
    type: "chatnotify";
    action: "getChatHistoryRequest";
    data: {
        sessionId?: string;
    };
};

export type GetChatHistoryResultNotification = {
    toolUseId: string;
    type: "chatnotify";
    action: "getChatHistoryResult";
    content: string | any;
    isError?: boolean;
}; 