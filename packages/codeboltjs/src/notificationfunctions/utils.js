"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationErrorCodes = exports.NotificationError = void 0;
exports.generateToolUseId = generateToolUseId;
exports.validateNotificationStructure = validateNotificationStructure;
exports.sendNotification = sendNotification;
exports.validateRequiredFields = validateRequiredFields;
exports.createErrorResponse = createErrorResponse;
exports.createSuccessResponse = createSuccessResponse;
exports.safeStringify = safeStringify;
const websocket_1 = __importDefault(require("../core/websocket"));
/**
 * Error class for notification-related errors
 */
class NotificationError extends Error {
    constructor(message, code, category, originalError) {
        super(message);
        this.code = code;
        this.category = category;
        this.originalError = originalError;
        this.name = 'NotificationError';
    }
}
exports.NotificationError = NotificationError;
/**
 * Error codes for notification operations
 */
var NotificationErrorCodes;
(function (NotificationErrorCodes) {
    NotificationErrorCodes["CONNECTION_NOT_READY"] = "CONNECTION_NOT_READY";
    NotificationErrorCodes["INVALID_DATA"] = "INVALID_DATA";
    NotificationErrorCodes["TIMEOUT"] = "TIMEOUT";
    NotificationErrorCodes["WEBSOCKET_ERROR"] = "WEBSOCKET_ERROR";
    NotificationErrorCodes["VALIDATION_FAILED"] = "VALIDATION_FAILED";
})(NotificationErrorCodes || (exports.NotificationErrorCodes = NotificationErrorCodes = {}));
/**
 * Generates a unique toolUseId for notifications
 * @returns {string} A unique identifier in the format 'tool_timestamp_randomstring'
 */
function generateToolUseId() {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    return `tool_${timestamp}_${randomString}`;
}
/**
 * Validates the basic structure of a notification
 * @param notification The notification to validate
 * @returns {boolean} True if the notification has required fields
 */
function validateNotificationStructure(notification) {
    if (!notification) {
        return false;
    }
    // Check required fields
    if (!notification.toolUseId || typeof notification.toolUseId !== 'string') {
        return false;
    }
    if (!notification.type || typeof notification.type !== 'string') {
        return false;
    }
    if (!notification.action || typeof notification.action !== 'string') {
        return false;
    }
    return true;
}
/**
 * Sends a notification through the WebSocket connection
 * This is a fire-and-forget operation that handles errors gracefully
 * @param notification The notification to send
 * @param category The category of notification for error reporting
 */
function sendNotification(notification, category = 'unknown') {
    try {
        // Generate toolUseId if not provided
        if (!notification.toolUseId) {
            notification.toolUseId = generateToolUseId();
        }
        // Validate notification structure
        if (!validateNotificationStructure(notification)) {
            const error = new NotificationError(`Invalid notification structure for ${category}`, NotificationErrorCodes.VALIDATION_FAILED, category);
            console.error('[NotificationFunctions]', error.message, notification);
            return;
        }
        // Check if WebSocket is ready
        if (!websocket_1.default.isInitialized) {
            const warning = `WebSocket not ready, ${category} notification may not be sent`;
            console.warn('[NotificationFunctions]', warning, notification);
            // Still attempt to send - the message manager will handle the error
        }
        // Send via WebSocket (fire and forget)
        websocket_1.default.messageManager.send(notification);
        // Log successful send (only in debug mode to avoid spam)
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
            console.log(`[NotificationFunctions] Sent ${category} notification:`, {
                toolUseId: notification.toolUseId,
                type: notification.type,
                action: notification.action
            });
        }
    }
    catch (error) {
        const notificationError = new NotificationError(`Failed to send ${category} notification: ${error instanceof Error ? error.message : 'Unknown error'}`, NotificationErrorCodes.WEBSOCKET_ERROR, category, error instanceof Error ? error : undefined);
        console.error('[NotificationFunctions]', notificationError.message, notification);
    }
}
/**
 * Validates that required data fields are present and not empty
 * @param data The data object to validate
 * @param requiredFields Array of field names that must be present
 * @param category The category for error reporting
 * @returns {boolean} True if all required fields are present
 */
function validateRequiredFields(data, requiredFields, category = 'unknown') {
    if (!data || typeof data !== 'object') {
        console.error(`[NotificationFunctions] Invalid data object for ${category}:`, data);
        return false;
    }
    for (const field of requiredFields) {
        if (!(field in data) || data[field] === null || data[field] === undefined || data[field] === '') {
            console.error(`[NotificationFunctions] Missing required field '${field}' for ${category}:`, data);
            return false;
        }
    }
    return true;
}
/**
 * Creates a standardized error response notification
 * @param toolUseId The toolUseId to use for the response
 * @param type The notification type
 * @param action The response action
 * @param error The error that occurred
 * @returns A standardized error response notification
 */
function createErrorResponse(toolUseId, type, action, error) {
    return {
        toolUseId,
        type,
        action,
        content: error instanceof Error ? error.message : error,
        isError: true
    };
}
/**
 * Creates a standardized success response notification
 * @param toolUseId The toolUseId to use for the response
 * @param type The notification type
 * @param action The response action
 * @param content The success content
 * @returns A standardized success response notification
 */
function createSuccessResponse(toolUseId, type, action, content) {
    return {
        toolUseId,
        type,
        action,
        content,
        isError: false
    };
}
/**
 * Utility function to safely stringify objects for logging
 * @param obj The object to stringify
 * @param maxLength Maximum length of the resulting string
 * @returns A safe string representation
 */
function safeStringify(obj, maxLength = 200) {
    try {
        const str = JSON.stringify(obj);
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }
    catch (error) {
        return '[Object - could not stringify]';
    }
}
