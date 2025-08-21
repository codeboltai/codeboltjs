/**
 * Error class for notification-related errors
 */
export declare class NotificationError extends Error {
    code: string;
    category: string;
    originalError?: Error | undefined;
    constructor(message: string, code: string, category: string, originalError?: Error | undefined);
}
/**
 * Error codes for notification operations
 */
export declare enum NotificationErrorCodes {
    CONNECTION_NOT_READY = "CONNECTION_NOT_READY",
    INVALID_DATA = "INVALID_DATA",
    TIMEOUT = "TIMEOUT",
    WEBSOCKET_ERROR = "WEBSOCKET_ERROR",
    VALIDATION_FAILED = "VALIDATION_FAILED"
}
/**
 * Base interface for all notifications
 */
export interface BaseNotification {
    toolUseId: string;
    type: string;
    action: string;
    data?: any;
    content?: string | any;
    isError?: boolean;
}
/**
 * Generates a unique toolUseId for notifications
 * @returns {string} A unique identifier in the format 'tool_timestamp_randomstring'
 */
export declare function generateToolUseId(): string;
/**
 * Validates the basic structure of a notification
 * @param notification The notification to validate
 * @returns {boolean} True if the notification has required fields
 */
export declare function validateNotificationStructure<T extends BaseNotification>(notification: T): boolean;
/**
 * Sends a notification through the WebSocket connection
 * This is a fire-and-forget operation that handles errors gracefully
 * @param notification The notification to send
 * @param category The category of notification for error reporting
 */
export declare function sendNotification<T extends BaseNotification>(notification: T, category?: string): void;
/**
 * Validates that required data fields are present and not empty
 * @param data The data object to validate
 * @param requiredFields Array of field names that must be present
 * @param category The category for error reporting
 * @returns {boolean} True if all required fields are present
 */
export declare function validateRequiredFields(data: any, requiredFields: string[], category?: string): boolean;
/**
 * Creates a standardized error response notification
 * @param toolUseId The toolUseId to use for the response
 * @param type The notification type
 * @param action The response action
 * @param error The error that occurred
 * @returns A standardized error response notification
 */
export declare function createErrorResponse(toolUseId: string, type: string, action: string, error: Error | string): BaseNotification;
/**
 * Creates a standardized success response notification
 * @param toolUseId The toolUseId to use for the response
 * @param type The notification type
 * @param action The response action
 * @param content The success content
 * @returns A standardized success response notification
 */
export declare function createSuccessResponse(toolUseId: string, type: string, action: string, content: string | any): BaseNotification;
/**
 * Utility function to safely stringify objects for logging
 * @param obj The object to stringify
 * @param maxLength Maximum length of the resulting string
 * @returns A safe string representation
 */
export declare function safeStringify(obj: any, maxLength?: number): string;
