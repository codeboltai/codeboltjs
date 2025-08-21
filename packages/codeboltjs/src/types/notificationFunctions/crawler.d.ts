import { CrawlerSearchResponseNotification, CrawlerStartResponseNotification } from '../notifications/crawler';
/**
 * Interface for crawler notification functions
 */
export interface CrawlerNotifications {
    CrawlerSearchRequestNotify(url: string, searchQuery?: string, maxDepth?: number, maxPages?: number, includeSubdomains?: boolean, followRedirects?: boolean, toolUseId?: string): void;
    CrawlerSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: CrawlerSearchResponseNotification['data']): void;
    CrawlerStartRequestNotify(startUrl: string, options?: any, toolUseId?: string): void;
    CrawlerStartResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: CrawlerStartResponseNotification['data']): void;
}
