// ===== SEARCH NOTIFICATIONS =====

// Request Notifications
export type SearchInitRequest = {
    toolUseId: string;
    type: "searchnotify";
    action: "searchInitRequest";
    data: {
        engine?: string;
    };
};

export type SearchRequest = {
    toolUseId: string;
    type: "searchnotify";
    action: "searchRequest";
    data: {
        query: string;
    };
};

export type GetFirstLinkRequest = {
    toolUseId: string;
    type: "searchnotify";
    action: "getFirstLinkRequest";
    data: {
        query: string;
    };
};

// Response Notifications
export type SearchInitResult = {
    toolUseId: string;
    type: "searchnotify";
    action: "searchInitResult";
    content: string | any;
    isError?: boolean;
};

export type SearchResult = {
    toolUseId: string;
    type: "searchnotify";
    action: "searchResult";
    content: string | any;
    isError?: boolean;
};

export type GetFirstLinkResult = {
    toolUseId: string;
    type: "searchnotify";
    action: "getFirstLinkResult";
    content: string | any;
    isError?: boolean;
};

// Union Types for Convenience
export type SearchNotification = 
    | SearchInitRequest
    | SearchRequest
    | GetFirstLinkRequest;

export type SearchResponseNotification = 
    | SearchInitResult
    | SearchResult
    | GetFirstLinkResult; 