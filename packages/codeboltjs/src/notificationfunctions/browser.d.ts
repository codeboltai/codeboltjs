/**
 * Browser Notification Functions
 *
 * This module provides functions for sending browser-related notifications,
 * including web fetch and web search operations.
 */
import { WebFetchResponseNotification, WebSearchResponseNotification } from '../types/notifications/browser';
import { BrowserNotifications } from '../types/notificationFunctions/browser';
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
export declare function WebFetchRequestNotify(url: string, method?: string, headers?: Record<string, string>, body?: any, timeout?: number, toolUseId?: string): void;
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
export declare function WebFetchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: WebFetchResponseNotification['data']): void;
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
export declare function WebSearchRequestNotify(query: string, maxResults?: number, searchEngine?: string, filters?: any, toolUseId?: string): void;
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
export declare function WebSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: WebSearchResponseNotification['data']): void;
/**
 * Browser notification functions object
 */
export declare const browserNotifications: BrowserNotifications;
export default browserNotifications;
