/**
 * Browser Notification Functions
 * 
 * This module provides functions for sending browser-related notifications,
 * including web fetch and web search operations.
 */

import {
    WebFetchRequestNotification,
    WebFetchResponseNotification,
    WebSearchRequestNotification,
    WebSearchResponseNotification
} from '../types/notifications/browser';

import { BrowserNotifications } from '../types/notificationFunctions/browser';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';


/**
 * Sends a web fetch request notification
 * 
 * @param url - The URL to fetch
 * @param method - Optional HTTP method
 * @param headers - Optional headers object
 * @param body - Optional request body
 * @param timeout - Optional timeout in milliseconds
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 2.1 - WHEN I call `codebolt.notify.browser.WebFetchRequestNotify()` THEN the system SHALL send a WebFetchRequestNotification via WebSocket
 */
export function WebFetchRequestNotify(
    url: string,
    method?: string,
    headers?: Record<string, string>,
    body?: any,
    timeout?: number,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ url }, ['url'], 'browser.WebFetchRequestNotify')) {
        return;
    }

    // Create the notification
    const notification: WebFetchRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "browsernotify",
        action: "webFetchRequest",
        data: {
            url: url,
            method: method,
            headers: headers,
            body: body,
            timeout: timeout
        }
    };

    // Send the notification
    sendNotification(notification, 'browser.WebFetchRequestNotify');
}

/**
 * Sends a web fetch response notification
 * 
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * @param data - Optional response data including status, statusText, headers, and url
 * 
 * Requirements: 2.2 - WHEN I call `codebolt.notify.browser.WebFetchResponseNotify()` THEN the system SHALL send a WebFetchResponseNotification via WebSocket
 */
export function WebFetchResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string,
    data?: WebFetchResponseNotification['data']
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for browser.WebFetchResponseNotify');
        return;
    }

    // Create the notification
    const notification: WebFetchResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "browsernotify",
        action: "webFetchResult",
        content: content,
        isError: isError,
        data: data
    };

    // Send the notification
    sendNotification(notification, 'browser.WebFetchResponseNotify');
}

/**
 * Sends a web search request notification
 * 
 * @param query - The search query string
 * @param maxResults - Optional maximum number of results
 * @param searchEngine - Optional search engine to use
 * @param filters - Optional search filters
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 2.3 - WHEN I call `codebolt.notify.browser.WebSearchRequestNotify()` THEN the system SHALL send a WebSearchRequestNotification via WebSocket
 */
export function WebSearchRequestNotify(
    query: string,
    maxResults?: number,
    searchEngine?: string,
    filters?: any,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ query }, ['query'], 'browser.WebSearchRequestNotify')) {
        return;
    }

    // Create the notification
    const notification: WebSearchRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "browsernotify",
        action: "webSearchRequest",
        data: {
            query: query,
            maxResults: maxResults,
            searchEngine: searchEngine,
            filters: filters
        }
    };

    // Send the notification
    sendNotification(notification, 'browser.WebSearchRequestNotify');
}

/**
 * Sends a web search response notification
 * 
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * @param data - Optional response data including results, totalResults, and searchTime
 * 
 * Requirements: 2.4 - WHEN I call `codebolt.notify.browser.WebSearchResponseNotify()` THEN the system SHALL send a WebSearchResponseNotification via WebSocket
 */
export function WebSearchResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string,
    data?: WebSearchResponseNotification['data']
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for browser.WebSearchResponseNotify');
        return;
    }

    // Create the notification
    const notification: WebSearchResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "browsernotify",
        action: "webSearchResult",
        content: content,
        isError: isError,
        data: data
    };

    // Send the notification
    sendNotification(notification, 'browser.WebSearchResponseNotify');
}

/**
 * Browser notification functions object
 */
export const browserNotifications: BrowserNotifications = {
    WebFetchRequestNotify,
    WebFetchResponseNotify,
    WebSearchRequestNotify,
    WebSearchResponseNotify
};

// Default export
export default browserNotifications;