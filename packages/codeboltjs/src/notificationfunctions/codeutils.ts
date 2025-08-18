/**
 * Code Utils Notification Functions
 * 
 * This module provides functions for sending code utilities-related notifications,
 * including grep search and glob search operations.
 */

import {
    GrepSearchRequestNotification,
    GrepSearchResponseNotification,
    GlobSearchRequestNotification,
    GlobSearchResponseNotification
} from '../types/notifications/codeutils';

import { CodeutilsNotifications } from '../types/notificationFunctions/codeutils';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';

import { CodeUtilsNotificationAction, NotificationEventType } from '@codebolt/types/enum';

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
export function GrepSearchRequestNotify(
    pattern: string,
    filePath?: string,
    recursive?: boolean,
    ignoreCase?: boolean,
    maxResults?: number,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ pattern }, ['pattern'], 'codeutils.GrepSearchRequestNotify')) {
        return;
    }

    // Create the notification
    const notification: GrepSearchRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CODEUTILS_NOTIFY,
        action: CodeUtilsNotificationAction.GREP_SEARCH_REQUEST,
        data: {
            pattern: pattern,
            filePath: filePath,
            recursive: recursive,
            ignoreCase: ignoreCase,
            maxResults: maxResults
        }
    };

    // Send the notification
    sendNotification(notification, 'codeutils.GrepSearchRequestNotify');
}

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
export function GrepSearchResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string,
    data?: GrepSearchResponseNotification['data']
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for codeutils.GrepSearchResponseNotify');
        return;
    }

    // Create the notification
    const notification: GrepSearchResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CODEUTILS_NOTIFY,
        action: CodeUtilsNotificationAction.GREP_SEARCH_RESULT,
        content: content,
        isError: isError,
        data: data
    };

    // Send the notification
    sendNotification(notification, 'codeutils.GrepSearchResponseNotify');
}

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
export function GlobSearchRequestNotify(
    pattern: string,
    basePath?: string,
    maxDepth?: number,
    includeDirectories?: boolean,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ pattern }, ['pattern'], 'codeutils.GlobSearchRequestNotify')) {
        return;
    }

    // Create the notification
    const notification: GlobSearchRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CODEUTILS_NOTIFY,
        action: CodeUtilsNotificationAction.GLOB_SEARCH_REQUEST,
        data: {
            pattern: pattern,
            basePath: basePath,
            maxDepth: maxDepth,
            includeDirectories: includeDirectories
        }
    };

    // Send the notification
    sendNotification(notification, 'codeutils.GlobSearchRequestNotify');
}

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
export function GlobSearchResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string,
    data?: GlobSearchResponseNotification['data']
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for codeutils.GlobSearchResponseNotify');
        return;
    }

    // Create the notification
    const notification: GlobSearchResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CODEUTILS_NOTIFY,
        action: CodeUtilsNotificationAction.GLOB_SEARCH_RESULT,
        content: content,
        isError: isError,
        data: data
    };

    // Send the notification
    sendNotification(notification, 'codeutils.GlobSearchResponseNotify');
}

/**
 * Codeutils notification functions object
 */
export const codeutilsNotifications: CodeutilsNotifications = {
    GrepSearchRequestNotify,
    GrepSearchResponseNotify,
    GlobSearchRequestNotify,
    GlobSearchResponseNotify
};

// Default export
export default codeutilsNotifications;