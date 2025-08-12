/**
 * Crawler Notification Functions
 * 
 * This module provides functions for sending crawler-related notifications,
 * including web crawling search operations and crawler initialization.
 */

import {
    CrawlerSearchRequestNotification,
    CrawlerSearchResponseNotification,
    CrawlerStartRequestNotification,
    CrawlerStartResponseNotification
} from '../types/notifications/crawler';

import { CrawlerNotifications } from '../types/notificationFunctions/crawler';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';
import { CrawlerNotificationAction, NotificationEventType } from '@codebolt/types';


/**
 * Sends a request to perform a crawler search
 * 
 * @param url - The URL to crawl
 * @param searchQuery - Optional search query
 * @param maxDepth - Optional maximum crawl depth
 * @param maxPages - Optional maximum pages to crawl
 * @param includeSubdomains - Optional flag to include subdomains
 * @param followRedirects - Optional flag to follow redirects
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 5.1 - WHEN I call `codebolt.notify.crawler.CrawlerSearchRequestNotify()` THEN the system SHALL send a CrawlerSearchRequestNotification via WebSocket
 */
export function CrawlerSearchRequestNotify(
    url: string,
    searchQuery?: string,
    maxDepth?: number,
    maxPages?: number,
    includeSubdomains?: boolean,
    followRedirects?: boolean,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ url }, ['url'], 'crawler.CrawlerSearchRequestNotify')) {
        return;
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (error) {
        console.error('[NotificationFunctions] Invalid URL format for crawler.CrawlerSearchRequestNotify:', url);
        return;
    }

    // Create the notification
    const notification: CrawlerSearchRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CRAWLER_NOTIFY,
        action: CrawlerNotificationAction.CRAWLER_SEARCH_REQUEST,
        data: {
            url: url,
            searchQuery: searchQuery,
            maxDepth: maxDepth,
            maxPages: maxPages,
            includeSubdomains: includeSubdomains,
            followRedirects: followRedirects
        }
    };

    // Send the notification
    sendNotification(notification, 'crawler.CrawlerSearchRequestNotify');
}

/**
 * Sends a response to a crawler search request
 * 
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * @param data - Optional response data containing pages, totalPages, and crawlTime
 * 
 * Requirements: 5.2 - WHEN I call `codebolt.notify.crawler.CrawlerSearchResponseNotify()` THEN the system SHALL send a CrawlerSearchResponseNotification via WebSocket
 */
export function CrawlerSearchResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string,
    data?: CrawlerSearchResponseNotification['data']
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for crawler.CrawlerSearchResponseNotify');
        return;
    }

    // Create the notification
    const notification: CrawlerSearchResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CRAWLER_NOTIFY,
        action: CrawlerNotificationAction.CRAWLER_SEARCH_RESULT,
        content: content,
        isError: isError,
        data: data
    };

    // Send the notification
    sendNotification(notification, 'crawler.CrawlerSearchResponseNotify');
}

/**
 * Sends a request to start a crawler
 * 
 * @param startUrl - The URL to start crawling from
 * @param options - Optional crawler configuration options
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 5.3 - WHEN I call `codebolt.notify.crawler.CrawlerStartRequestNotify()` THEN the system SHALL send a CrawlerStartRequestNotification via WebSocket
 */
export function CrawlerStartRequestNotify(
    startUrl: string,
    options?: any,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ startUrl }, ['startUrl'], 'crawler.CrawlerStartRequestNotify')) {
        return;
    }

    // Validate URL format
    try {
        new URL(startUrl);
    } catch (error) {
        console.error('[NotificationFunctions] Invalid URL format for crawler.CrawlerStartRequestNotify:', startUrl);
        return;
    }

    // Create the notification
    const notification: CrawlerStartRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CRAWLER_NOTIFY,
        action: CrawlerNotificationAction.CRAWLER_START_REQUEST,
        data: {
            startUrl: startUrl,
            options: options
        }
    };

    // Send the notification
    sendNotification(notification, 'crawler.CrawlerStartRequestNotify');
}

/**
 * Sends a response to a crawler start request
 * 
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * @param data - Optional response data containing sessionId and status
 * 
 * Requirements: 5.4 - WHEN I call `codebolt.notify.crawler.CrawlerStartResponseNotify()` THEN the system SHALL send a CrawlerStartResponseNotification via WebSocket
 */
export function CrawlerStartResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string,
    data?: CrawlerStartResponseNotification['data']
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for crawler.CrawlerStartResponseNotify');
        return;
    }

    // Create the notification
    const notification: CrawlerStartResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CRAWLER_NOTIFY,
        action: CrawlerNotificationAction.CRAWLER_START_RESULT,
        content: content,
        isError: isError,
        data: data
    };

    // Send the notification
    sendNotification(notification, 'crawler.CrawlerStartResponseNotify');
}

/**
 * Crawler notification functions object
 */
export const crawlerNotifications: CrawlerNotifications = {
    CrawlerSearchRequestNotify,
    CrawlerSearchResponseNotify,
    CrawlerStartRequestNotify,
    CrawlerStartResponseNotify
};

// Default export
export default crawlerNotifications;