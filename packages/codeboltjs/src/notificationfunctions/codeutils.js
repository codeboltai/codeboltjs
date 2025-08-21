"use strict";
/**
 * Code Utils Notification Functions
 *
 * This module provides functions for sending code utilities-related notifications,
 * including grep search and glob search operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeutilsNotifications = void 0;
exports.GrepSearchRequestNotify = GrepSearchRequestNotify;
exports.GrepSearchResponseNotify = GrepSearchResponseNotify;
exports.GlobSearchRequestNotify = GlobSearchRequestNotify;
exports.GlobSearchResponseNotify = GlobSearchResponseNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
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
function GrepSearchRequestNotify(pattern, filePath, recursive, ignoreCase, maxResults, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ pattern }, ['pattern'], 'codeutils.GrepSearchRequestNotify')) {
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CODEUTILS_NOTIFY,
        action: enum_1.CodeUtilsNotificationAction.GREP_SEARCH_REQUEST,
        data: {
            pattern: pattern,
            filePath: filePath,
            recursive: recursive,
            ignoreCase: ignoreCase,
            maxResults: maxResults
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'codeutils.GrepSearchRequestNotify');
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
function GrepSearchResponseNotify(content, isError = false, toolUseId, data) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for codeutils.GrepSearchResponseNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CODEUTILS_NOTIFY,
        action: enum_1.CodeUtilsNotificationAction.GREP_SEARCH_RESULT,
        content: content,
        isError: isError,
        data: data
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'codeutils.GrepSearchResponseNotify');
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
function GlobSearchRequestNotify(pattern, basePath, maxDepth, includeDirectories, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ pattern }, ['pattern'], 'codeutils.GlobSearchRequestNotify')) {
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CODEUTILS_NOTIFY,
        action: enum_1.CodeUtilsNotificationAction.GLOB_SEARCH_REQUEST,
        data: {
            pattern: pattern,
            basePath: basePath,
            maxDepth: maxDepth,
            includeDirectories: includeDirectories
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'codeutils.GlobSearchRequestNotify');
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
function GlobSearchResponseNotify(content, isError = false, toolUseId, data) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for codeutils.GlobSearchResponseNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CODEUTILS_NOTIFY,
        action: enum_1.CodeUtilsNotificationAction.GLOB_SEARCH_RESULT,
        content: content,
        isError: isError,
        data: data
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'codeutils.GlobSearchResponseNotify');
}
/**
 * Codeutils notification functions object
 */
exports.codeutilsNotifications = {
    GrepSearchRequestNotify,
    GrepSearchResponseNotify,
    GlobSearchRequestNotify,
    GlobSearchResponseNotify
};
// Default export
exports.default = exports.codeutilsNotifications;
