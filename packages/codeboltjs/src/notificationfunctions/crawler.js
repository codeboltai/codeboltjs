"use strict";
/**
 * Crawler Notification Functions
 *
 * This module provides functions for sending crawler-related notifications,
 * including web crawling search operations and crawler initialization.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlerNotifications = void 0;
exports.CrawlerSearchRequestNotify = CrawlerSearchRequestNotify;
exports.CrawlerSearchResponseNotify = CrawlerSearchResponseNotify;
exports.CrawlerStartRequestNotify = CrawlerStartRequestNotify;
exports.CrawlerStartResponseNotify = CrawlerStartResponseNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
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
function CrawlerSearchRequestNotify(url, searchQuery, maxDepth, maxPages, includeSubdomains, followRedirects, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ url }, ['url'], 'crawler.CrawlerSearchRequestNotify')) {
        return;
    }
    // Validate URL format
    try {
        new URL(url);
    }
    catch (error) {
        console.error('[NotificationFunctions] Invalid URL format for crawler.CrawlerSearchRequestNotify:', url);
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CRAWLER_NOTIFY,
        action: enum_1.CrawlerNotificationAction.CRAWLER_SEARCH_REQUEST,
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
    (0, utils_1.sendNotification)(notification, 'crawler.CrawlerSearchRequestNotify');
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
function CrawlerSearchResponseNotify(content, isError = false, toolUseId, data) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for crawler.CrawlerSearchResponseNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CRAWLER_NOTIFY,
        action: enum_1.CrawlerNotificationAction.CRAWLER_SEARCH_RESULT,
        content: content,
        isError: isError,
        data: data
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'crawler.CrawlerSearchResponseNotify');
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
function CrawlerStartRequestNotify(startUrl, options, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ startUrl }, ['startUrl'], 'crawler.CrawlerStartRequestNotify')) {
        return;
    }
    // Validate URL format
    try {
        new URL(startUrl);
    }
    catch (error) {
        console.error('[NotificationFunctions] Invalid URL format for crawler.CrawlerStartRequestNotify:', startUrl);
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CRAWLER_NOTIFY,
        action: enum_1.CrawlerNotificationAction.CRAWLER_START_REQUEST,
        data: {
            startUrl: startUrl,
            options: options
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'crawler.CrawlerStartRequestNotify');
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
function CrawlerStartResponseNotify(content, isError = false, toolUseId, data) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for crawler.CrawlerStartResponseNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CRAWLER_NOTIFY,
        action: enum_1.CrawlerNotificationAction.CRAWLER_START_RESULT,
        content: content,
        isError: isError,
        data: data
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'crawler.CrawlerStartResponseNotify');
}
/**
 * Crawler notification functions object
 */
exports.crawlerNotifications = {
    CrawlerSearchRequestNotify,
    CrawlerSearchResponseNotify,
    CrawlerStartRequestNotify,
    CrawlerStartResponseNotify
};
// Default export
exports.default = exports.crawlerNotifications;
