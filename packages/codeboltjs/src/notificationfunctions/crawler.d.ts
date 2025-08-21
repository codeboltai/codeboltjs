/**
 * Crawler Notification Functions
 *
 * This module provides functions for sending crawler-related notifications,
 * including web crawling search operations and crawler initialization.
 */
import { CrawlerSearchResponseNotification, CrawlerStartResponseNotification } from '../types/notifications/crawler';
import { CrawlerNotifications } from '../types/notificationFunctions/crawler';
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
export declare function CrawlerSearchRequestNotify(url: string, searchQuery?: string, maxDepth?: number, maxPages?: number, includeSubdomains?: boolean, followRedirects?: boolean, toolUseId?: string): void;
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
export declare function CrawlerSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: CrawlerSearchResponseNotification['data']): void;
/**
 * Sends a request to start a crawler
 *
 * @param startUrl - The URL to start crawling from
 * @param options - Optional crawler configuration options
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 5.3 - WHEN I call `codebolt.notify.crawler.CrawlerStartRequestNotify()` THEN the system SHALL send a CrawlerStartRequestNotification via WebSocket
 */
export declare function CrawlerStartRequestNotify(startUrl: string, options?: any, toolUseId?: string): void;
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
export declare function CrawlerStartResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: CrawlerStartResponseNotification['data']): void;
/**
 * Crawler notification functions object
 */
export declare const crawlerNotifications: CrawlerNotifications;
export default crawlerNotifications;
