/**
 * Code Utils Notification Functions
 *
 * This module provides functions for sending code utilities-related notifications,
 * including grep search and glob search operations.
 */
import { GrepSearchResponseNotification, GlobSearchResponseNotification } from '../types/notifications/codeutils';
import { CodeutilsNotifications } from '../types/notificationFunctions/codeutils';
/**
 * Sends a grep search request
 *
 * @param pattern - The search pattern
 * @param filePath - Optional file path to search in
 * @param recursive - Optional recursive search flag
 * @param ignoreCase - Optional ignore case flag
 * @param maxResults - Optional maximum number of results
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 4.1 - WHEN I call `codebolt.notify.codeutils.GrepSearchRequestNotify()` THEN the system SHALL send a GrepSearchRequestNotification via WebSocket
 */
export declare function GrepSearchRequestNotify(pattern: string, filePath?: string, recursive?: boolean, ignoreCase?: boolean, maxResults?: number, toolUseId?: string): void;
/**
 * Sends a response to a grep search request
 *
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * @param data - Optional response data with matches and totalMatches
 *
 * Requirements: 4.2 - WHEN I call `codebolt.notify.codeutils.GrepSearchResponseNotify()` THEN the system SHALL send a GrepSearchResponseNotification via WebSocket
 */
export declare function GrepSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: GrepSearchResponseNotification['data']): void;
/**
 * Sends a glob search request
 *
 * @param pattern - The glob pattern
 * @param basePath - Optional base path to search in
 * @param maxDepth - Optional maximum search depth
 * @param includeDirectories - Optional flag to include directories
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 4.3 - WHEN I call `codebolt.notify.codeutils.GlobSearchRequestNotify()` THEN the system SHALL send a GlobSearchRequestNotification via WebSocket
 */
export declare function GlobSearchRequestNotify(pattern: string, basePath?: string, maxDepth?: number, includeDirectories?: boolean, toolUseId?: string): void;
/**
 * Sends a response to a glob search request
 *
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * @param data - Optional response data with files and totalFiles
 *
 * Requirements: 4.4 - WHEN I call `codebolt.notify.codeutils.GlobSearchResponseNotify()` THEN the system SHALL send a GlobSearchResponseNotification via WebSocket
 */
export declare function GlobSearchResponseNotify(content: string | any, isError?: boolean, toolUseId?: string, data?: GlobSearchResponseNotification['data']): void;
/**
 * Codeutils notification functions object
 */
export declare const codeutilsNotifications: CodeutilsNotifications;
export default codeutilsNotifications;
