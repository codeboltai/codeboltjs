// ===== BROWSER NOTIFICATIONS =====

// Request Notifications
// WebFetch
export type WebFetchRequestNotification = {
    toolUseId: string;
    type: "browsernotify";
    action: "webFetchRequest";
    data: {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        body?: string;
        timeout?: number;
    };
}

export type WebFetchResponseNotification = {
    toolUseId: string;
    type: "browsernotify";
    action: "webFetchResult";
    content: string | any;
    isError?: boolean;
    data?: {
        status?: number;
        statusText?: string;
        headers?: Record<string, string>;
        url?: string;
    };
}

// WebSearch
export type WebSearchRequestNotification = {
    toolUseId: string;
    type: "browsernotify";
    action: "webSearchRequest";
    data: {
        query: string;
        maxResults?: number;
        searchEngine?: string;
        filters?: Record<string, any>;
    };
}

export type WebSearchResponseNotification = {
    toolUseId: string;
    type: "browsernotify";
    action: "webSearchResult";
    content: string | any;
    isError?: boolean;
    data?: {
        results: Array<{
            title: string;
            url: string;
            snippet: string;
            rank?: number;
        }>;
        totalResults?: number;
        searchTime?: number;
    };
} 