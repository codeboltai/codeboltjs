"use strict";
/**
 * Browser Notification Functions
 *
 * This module provides functions for sending browser-related notifications,
 * including web fetch and web search operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserNotifications = void 0;
exports.WebFetchRequestNotify = WebFetchRequestNotify;
exports.WebFetchResponseNotify = WebFetchResponseNotify;
exports.WebSearchRequestNotify = WebSearchRequestNotify;
exports.WebSearchResponseNotify = WebSearchResponseNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
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
function WebFetchRequestNotify(url, method, headers, body, timeout, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ url }, ['url'], 'browser.WebFetchRequestNotify')) {
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.BROWSER_NOTIFY,
        action: enum_1.BrowserNotificationAction.WEB_FETCH_REQUEST,
        data: {
            url: url,
            method: method,
            headers: headers,
            body: body,
            timeout: timeout
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'browser.WebFetchRequestNotify');
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
function WebFetchResponseNotify(content, isError = false, toolUseId, data) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for browser.WebFetchResponseNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.BROWSER_NOTIFY,
        action: enum_1.BrowserNotificationAction.WEB_FETCH_RESULT,
        content: content,
        isError: isError,
        data: data
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'browser.WebFetchResponseNotify');
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
function WebSearchRequestNotify(query, maxResults, searchEngine, filters, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ query }, ['query'], 'browser.WebSearchRequestNotify')) {
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.BROWSER_NOTIFY,
        action: enum_1.BrowserNotificationAction.WEB_SEARCH_REQUEST,
        data: {
            query: query,
            maxResults: maxResults,
            searchEngine: searchEngine,
            filters: filters
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'browser.WebSearchRequestNotify');
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
function WebSearchResponseNotify(content, isError = false, toolUseId, data) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for browser.WebSearchResponseNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.BROWSER_NOTIFY,
        action: enum_1.BrowserNotificationAction.WEB_SEARCH_RESULT,
        content: content,
        isError: isError,
        data: data
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'browser.WebSearchResponseNotify');
}
/**
 * Browser notification functions object
 */
exports.browserNotifications = {
    WebFetchRequestNotify,
    WebFetchResponseNotify,
    WebSearchRequestNotify,
    WebSearchResponseNotify
};
// Default export
exports.default = exports.browserNotifications;
