/**
 * Database Memory Notification Functions
 * 
 * This module provides functions for sending database memory-related notifications,
 * including knowledge storage and retrieval operations.
 */

import {
    AddMemoryRequestNotification,
    AddMemoryResultNotification,
    GetMemoryRequestNotification,
    GetMemoryResultNotification
} from '../types/notifications/dbmemory';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields,
    createErrorResponse,
    createSuccessResponse
} from './utils';

/**
 * Interface for database memory notification functions
 */
export interface DbmemoryNotifications {
    AddMemoryRequestNotify(key: string, value: any, toolUseId?: string): void;
    AddMemoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
    GetMemoryRequestNotify(key: string, toolUseId?: string): void;
    GetMemoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
}

/**
 * Sends a request to add knowledge to memory
 * 
 * @param key - The memory key
 * @param value - The memory value
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 6.1 - WHEN I call `codebolt.notify.dbmemory.AddMemoryRequestNotify()` THEN the system SHALL send an AddMemoryRequestNotification via WebSocket
 */
export function AddMemoryRequestNotify(
    key: string,
    value: any,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ key }, ['key'], 'dbmemory.AddMemoryRequestNotify')) {
        return;
    }

    // Validate that value is provided (can be any type including null, but not undefined)
    if (value === undefined) {
        console.error('[NotificationFunctions] Value is required for dbmemory.AddMemoryRequestNotify');
        return;
    }

    // Create the notification
    const notification: AddMemoryRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "dbmemorynotify",
        action: "addKnowledgeRequest",
        data: {
            key: key,
            value: value
        }
    };

    // Send the notification
    sendNotification(notification, 'dbmemory.AddMemoryRequestNotify');
}

/**
 * Sends a result response for an add memory operation
 * 
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 6.2 - WHEN I call `codebolt.notify.dbmemory.AddMemoryResultNotify()` THEN the system SHALL send an AddMemoryResultNotification via WebSocket
 */
export function AddMemoryResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for dbmemory.AddMemoryResultNotify');
        return;
    }

    // Create the notification
    const notification: AddMemoryResultNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "dbmemorynotify",
        action: "addKnowledgeResult",
        content: content,
        isError: isError
    };

    // Send the notification
    sendNotification(notification, 'dbmemory.AddMemoryResultNotify');
}

/**
 * Sends a request to get knowledge from memory
 * 
 * @param key - The memory key to retrieve
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 6.3 - WHEN I call `codebolt.notify.dbmemory.GetMemoryRequestNotify()` THEN the system SHALL send a GetMemoryRequestNotification via WebSocket
 */
export function GetMemoryRequestNotify(
    key: string,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ key }, ['key'], 'dbmemory.GetMemoryRequestNotify')) {
        return;
    }

    // Create the notification
    const notification: GetMemoryRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "dbmemorynotify",
        action: "getKnowledgeRequest",
        data: {
            key: key
        }
    };

    // Send the notification
    sendNotification(notification, 'dbmemory.GetMemoryRequestNotify');
}

/**
 * Sends a result response for a get memory operation
 * 
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 * 
 * Requirements: 6.4 - WHEN I call `codebolt.notify.dbmemory.GetMemoryResultNotify()` THEN the system SHALL send a GetMemoryResultNotification via WebSocket
 */
export function GetMemoryResultNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for dbmemory.GetMemoryResultNotify');
        return;
    }

    // Create the notification
    const notification: GetMemoryResultNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: "dbmemorynotify",
        action: "getKnowledgeResult",
        content: content,
        isError: isError
    };

    // Send the notification
    sendNotification(notification, 'dbmemory.GetMemoryResultNotify');
}

/**
 * Database memory notification functions object
 */
export const dbmemoryNotifications: DbmemoryNotifications = {
    AddMemoryRequestNotify,
    AddMemoryResultNotify,
    GetMemoryRequestNotify,
    GetMemoryResultNotify
};