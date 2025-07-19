// ===== CRAWLER NOTIFICATIONS =====

// Request Notifications
// Add Search functions here

export type CrawlerSearchRequestNotification = {
    toolUseId: string;
    type: "crawlernotify";
    action: "crawlerSearchRequest";
    data: {
        url: string;
        searchQuery?: string;
        maxDepth?: number;
        maxPages?: number;
        includeSubdomains?: boolean;
        followRedirects?: boolean;
    };
}

export type CrawlerSearchResponseNotification = {
    toolUseId: string;
    type: "crawlernotify";
    action: "crawlerSearchResult";
    content: string | any;
    isError?: boolean;
    data?: {
        pages: Array<{
            url: string;
            title: string;
            content: string;
            depth: number;
            timestamp: string;
        }>;
        totalPages?: number;
        crawlTime?: number;
    };
}

export type CrawlerStartRequestNotification = {
    toolUseId: string;
    type: "crawlernotify";
    action: "crawlerStartRequest";
    data: {
        startUrl: string;
        options?: {
            userAgent?: string;
            timeout?: number;
            headers?: Record<string, string>;
        };
    };
}

export type CrawlerStartResponseNotification = {
    toolUseId: string;
    type: "crawlernotify";
    action: "crawlerStartResult";
    content: string | any;
    isError?: boolean;
    data?: {
        sessionId: string;
        status: string;
    };
} 