/**
 * Crawler SDK Function Types
 * Types for the cbcrawler module functions
 */

// Base response interface for crawler operations
export interface BaseCrawlerSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

/**
 * Scroll directions for the crawler
 */
export type ScrollDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Crawler click response
 */
export interface CrawlerClickResponse extends BaseCrawlerSDKResponse {
  elementId?: string;
  clicked?: boolean;
}

/**
 * Crawler screenshot response
 */
export interface CrawlerScreenshotResponse extends BaseCrawlerSDKResponse {
  screenshot?: string;
  format?: string;
}

/**
 * Crawler navigation response
 */
export interface CrawlerGoToPageResponse extends BaseCrawlerSDKResponse {
  url?: string;
  loaded?: boolean;
}

/**
 * Crawler scroll response
 */
export interface CrawlerScrollResponse extends BaseCrawlerSDKResponse {
  direction?: ScrollDirection;
  scrolled?: boolean;
}
