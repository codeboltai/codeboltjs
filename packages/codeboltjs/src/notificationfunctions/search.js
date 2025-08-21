"use strict";
/**
 * Search Notification Functions
 *
 * This module provides functions for sending search-related notifications,
 * including search initialization and query operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchNotifications = void 0;
exports.SearchInitRequestNotify = SearchInitRequestNotify;
exports.SearchInitResultNotify = SearchInitResultNotify;
exports.SearchRequestNotify = SearchRequestNotify;
exports.SearchResultNotify = SearchResultNotify;
exports.GetFirstLinkRequestNotify = GetFirstLinkRequestNotify;
exports.GetFirstLinkResultNotify = GetFirstLinkResultNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
// ===== SEARCH INIT FUNCTIONS =====
/**
 * Sends a search init request notification
 * @param engine - Optional search engine to initialize
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function SearchInitRequestNotify(engine, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.SEARCH_NOTIFY,
        action: enum_1.SearchNotificationAction.SEARCH_INIT_REQUEST,
        data: {
            engine: engine
        }
    };
    (0, utils_1.sendNotification)(notification, 'search-init');
}
/**
 * Sends a search init result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function SearchInitResultNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[SearchNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.SEARCH_NOTIFY,
        action: enum_1.SearchNotificationAction.SEARCH_INIT_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'search-init-result');
}
// ===== SEARCH REQUEST FUNCTIONS =====
/**
 * Sends a search request notification
 * @param query - The search query string
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function SearchRequestNotify(query, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ query }, ['query'], 'search-request')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.SEARCH_NOTIFY,
        action: enum_1.SearchNotificationAction.SEARCH_REQUEST,
        data: {
            query: query
        }
    };
    (0, utils_1.sendNotification)(notification, 'search-request');
}
/**
 * Sends a search result notification
 * @param content - The search result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function SearchResultNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[SearchNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.SEARCH_NOTIFY,
        action: enum_1.SearchNotificationAction.SEARCH_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'search-result');
}
// ===== GET FIRST LINK FUNCTIONS =====
/**
 * Sends a get first link request notification
 * @param query - The search query to get the first link for
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GetFirstLinkRequestNotify(query, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ query }, ['query'], 'get-first-link')) {
        return;
    }
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.SEARCH_NOTIFY,
        action: enum_1.SearchNotificationAction.GET_FIRST_LINK_REQUEST,
        data: {
            query: query
        }
    };
    (0, utils_1.sendNotification)(notification, 'search-get-first-link');
}
/**
 * Sends a get first link result notification
 * @param content - The first link result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GetFirstLinkResultNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[SearchNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.SEARCH_NOTIFY,
        action: enum_1.SearchNotificationAction.GET_FIRST_LINK_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'search-get-first-link-result');
}
/**
 * Search notification functions object
 */
exports.searchNotifications = {
    SearchInitRequestNotify,
    SearchInitResultNotify,
    SearchRequestNotify,
    SearchResultNotify,
    GetFirstLinkRequestNotify,
    GetFirstLinkResultNotify
};
