import {
    GrepSearchResponseNotification,
    GlobSearchResponseNotification
} from '../notifications/codeutils';

/**
 * Interface for code utils notification functions
 */
export interface CodeutilsNotifications {
    GrepSearchRequestNotify(pattern: string, filePath?: string, recursive?: boolean, ignoreCase?: boolean, maxResults?: number, toolUseId?: string): void;
    GrepSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: GrepSearchResponseNotification['data']): void;
    GlobSearchRequestNotify(pattern: string, basePath?: string, maxDepth?: number, includeDirectories?: boolean, toolUseId?: string): void;
    GlobSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: GlobSearchResponseNotification['data']): void;
}