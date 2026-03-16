// ===== LLM NOTIFICATIONS =====
export type LLMRequestNotification = {
    toolUseId: string;
    type: "llmnotify";
    action: "inferenceRequest";
    data: {
        messages?: any[];
        tools?: any[];
        tool_choice?: string;
        full?: boolean;
        llmrole?: string;
        max_tokens?: number;
        temperature?: number;
        stream?: boolean;
        prompt?: string;
    };
};

export type LLMResponseNotification = {
    toolUseId: string;
    type: "llmnotify";
    action: "inferenceResult";
    content: string | any;
    isError?: boolean;
};

export type LLMGetTokenCountRequestNotification = {
    toolUseId: string;
    type: "llmnotify";
    action: "getTokenCountRequest";
    data: {
        text: string;
        model?: string;
        encoding?: string;
    };
}

export type LLMGetTokenCountResponseNotification = {
    toolUseId: string;
    type: "llmnotify";
    action: "getTokenCountResult";
    content: string | any;
    isError?: boolean;
    data?: {
        tokenCount: number;
        model?: string;
        encoding?: string;
    };
}