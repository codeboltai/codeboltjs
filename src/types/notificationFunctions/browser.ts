import {
    WebFetchResponseNotification,
    WebSearchResponseNotification
} from '../notifications/browser';

/**
 * Interface for browser notification functions
 */
export interface BrowserNotifications {
    WebFetchRequestNotify(url: string, method?: string, headers?: Record<string, string>, body?: any, timeout?: number, toolUseId?: string): void;
    WebFetchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: WebFetchResponseNotification['data']): void;
    WebSearchRequestNotify(query: string, maxResults?: number, searchEngine?: string, filters?: any, toolUseId?: string): void;
    WebSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: WebSearchResponseNotification['data']): void;
}