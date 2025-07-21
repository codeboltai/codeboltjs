/**
 * Search Notification Functions
 * 
 * This module provides functions for sending search-related notifications,
 * including search initialization and query operations.
 */

import {
    SearchInitRequest,
    SearchInitResult,
    SearchRequest,
    SearchResult,
    GetFirstLinkRequest,
    GetFirstLinkResult
} from '../types/notifications/search';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';

/**
 * Interface for search notification functions
 */
export interface SearchNotifications {
    SearchInitRequestNotify(engine?: string, toolUseId?: string): void;
    SearchInitResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    SearchRequestNotify(query: string, toolUseId?: string): void;
    SearchResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GetFirstLinkRequestNotify(query: string, toolUseId?: string): void;
    GetFirstLinkResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

// ===== SEARCH INIT FUNCTIONS =====

/**
 * Sends a search init request notification
 * @param engine - Optional search engine to initialize
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function SearchInitRequestNotify(
    engine?: string,
    toolUseId?: string
): void {
    const notification: SearchInitRequest = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "searchnotify",
        action: "searchInitRequest",
        data: {
            engine: engine
        }
    };

    sendNotification(notification, 'search-init');
}

/**
 * Sends a search init result notification
 * @param content - The result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function SearchInitResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[SearchNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: SearchInitResult = {
        toolUseId,
        type: "searchnotify",
        action: "searchInitResult",
        content,
        isError
    };

    sendNotification(notification, 'search-init-result');
}

// ===== SEARCH REQUEST FUNCTIONS =====

/**
 * Sends a search request notification
 * @param query - The search query string
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function SearchRequestNotify(
    query: string,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ query }, ['query'], 'search-request')) {
        return;
    }

    const notification: SearchRequest = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "searchnotify",
        action: "searchRequest",
        data: {
            query: query
        }
    };

    sendNotification(notification, 'search-request');
}

/**
 * Sends a search result notification
 * @param content - The search result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function SearchResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[SearchNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: SearchResult = {
        toolUseId,
        type: "searchnotify",
        action: "searchResult",
        content,
        isError
    };

    sendNotification(notification, 'search-result');
}

// ===== GET FIRST LINK FUNCTIONS =====

/**
 * Sends a get first link request notification
 * @param query - The search query to get the first link for
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GetFirstLinkRequestNotify(
    query: string,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ query }, ['query'], 'get-first-link')) {
        return;
    }

    const notification: GetFirstLinkRequest = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "searchnotify",
        action: "getFirstLinkRequest",
        data: {
            query: query
        }
    };

    sendNotification(notification, 'search-get-first-link');
}

/**
 * Sends a get first link result notification
 * @param content - The first link result content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GetFirstLinkResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[SearchNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GetFirstLinkResult = {
        toolUseId,
        type: "searchnotify",
        action: "getFirstLinkResult",
        content,
        isError
    };

    sendNotification(notification, 'search-get-first-link-result');
}

/**
 * Search notification functions object
 */
export const searchNotifications: SearchNotifications = {
    SearchInitRequestNotify,
    SearchInitResultNotify,
    SearchRequestNotify,
    SearchResultNotify,
    GetFirstLinkRequestNotify,
    GetFirstLinkResultNotify
}; 