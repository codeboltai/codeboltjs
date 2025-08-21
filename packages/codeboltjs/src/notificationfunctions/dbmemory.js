"use strict";
/**
 * Database Memory Notification Functions
 *
 * This module provides functions for sending database memory-related notifications,
 * including knowledge storage and retrieval operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbmemoryNotifications = void 0;
exports.AddMemoryRequestNotify = AddMemoryRequestNotify;
exports.AddMemoryResultNotify = AddMemoryResultNotify;
exports.GetMemoryRequestNotify = GetMemoryRequestNotify;
exports.GetMemoryResultNotify = GetMemoryResultNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
/**
 * Sends a request to add knowledge to memory
 *
 * @param key - The memory key
 * @param value - The memory value
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 6.1 - WHEN I call `codebolt.notify.dbmemory.AddMemoryRequestNotify()` THEN the system SHALL send an AddMemoryRequestNotification via WebSocket
 */
function AddMemoryRequestNotify(key, value, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ key }, ['key'], 'dbmemory.AddMemoryRequestNotify')) {
        return;
    }
    // Validate that value is provided (can be any type including null, but not undefined)
    if (value === undefined) {
        console.error('[NotificationFunctions] Value is required for dbmemory.AddMemoryRequestNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.DBMEMORY_NOTIFY,
        action: enum_1.DbMemoryNotificationAction.ADD_KNOWLEDGE_REQUEST,
        data: {
            key: key,
            value: value
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'dbmemory.AddMemoryRequestNotify');
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
function AddMemoryResultNotify(content, isError = false, toolUseId) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for dbmemory.AddMemoryResultNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.DBMEMORY_NOTIFY,
        action: enum_1.DbMemoryNotificationAction.ADD_KNOWLEDGE_RESULT,
        content: content,
        isError: isError
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'dbmemory.AddMemoryResultNotify');
}
/**
 * Sends a request to get knowledge from memory
 *
 * @param key - The memory key to retrieve
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 6.3 - WHEN I call `codebolt.notify.dbmemory.GetMemoryRequestNotify()` THEN the system SHALL send a GetMemoryRequestNotification via WebSocket
 */
function GetMemoryRequestNotify(key, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ key }, ['key'], 'dbmemory.GetMemoryRequestNotify')) {
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.DBMEMORY_NOTIFY,
        action: enum_1.DbMemoryNotificationAction.GET_KNOWLEDGE_REQUEST,
        data: {
            key: key
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'dbmemory.GetMemoryRequestNotify');
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
function GetMemoryResultNotify(content, isError = false, toolUseId) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for dbmemory.GetMemoryResultNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.DBMEMORY_NOTIFY,
        action: enum_1.DbMemoryNotificationAction.GET_KNOWLEDGE_RESULT,
        content: content,
        isError: isError
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'dbmemory.GetMemoryResultNotify');
}
/**
 * Database memory notification functions object
 */
exports.dbmemoryNotifications = {
    AddMemoryRequestNotify,
    AddMemoryResultNotify,
    GetMemoryRequestNotify,
    GetMemoryResultNotify
};
