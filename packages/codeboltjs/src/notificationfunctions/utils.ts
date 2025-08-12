import cbws from '../core/websocket';

/**
 * Error class for notification-related errors
 */
export class NotificationError extends Error {
    constructor(
        message: string,
        public code: string,
        public category: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'NotificationError';
    }
}

/**
 * Error codes for notification operations
 */
export enum NotificationErrorCodes {
    CONNECTION_NOT_READY = 'CONNECTION_NOT_READY',
    INVALID_DATA = 'INVALID_DATA',
    TIMEOUT = 'TIMEOUT',
    WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
    VALIDATION_FAILED = 'VALIDATION_FAILED'
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
export function generateToolUseId(): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    return `tool_${timestamp}_${randomString}`;
}

/**
 * Validates the basic structure of a notification
 * @param notification The notification to validate
 * @returns {boolean} True if the notification has required fields
 */
export function validateNotificationStructure<T extends BaseNotification>(notification: T): boolean {
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
export function sendNotification<T extends BaseNotification>(
    notification: T, 
    category: string = 'unknown'
): void {
    try {
        // Generate toolUseId if not provided
        if (!notification.toolUseId) {
            notification.toolUseId = generateToolUseId();
        }
        
        // Validate notification structure
        if (!validateNotificationStructure(notification)) {
            const error = new NotificationError(
                `Invalid notification structure for ${category}`,
                NotificationErrorCodes.VALIDATION_FAILED,
                category
            );
            console.error('[NotificationFunctions]', error.message, notification);
            return;
        }
        
        // Check if WebSocket is ready
        if (!cbws.isInitialized) {
            const warning = `WebSocket not ready, ${category} notification may not be sent`;
            console.warn('[NotificationFunctions]', warning, notification);
            // Still attempt to send - the message manager will handle the error
        }
        
        // Send via WebSocket (fire and forget)
        cbws.messageManager.send(notification);
        
        // Log successful send (only in debug mode to avoid spam)
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
            console.log(`[NotificationFunctions] Sent ${category} notification:`, {
                toolUseId: notification.toolUseId,
                type: notification.type,
                action: notification.action
            });
        }
        
    } catch (error) {
        const notificationError = new NotificationError(
            `Failed to send ${category} notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
            NotificationErrorCodes.WEBSOCKET_ERROR,
            category,
            error instanceof Error ? error : undefined
        );
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
export function validateRequiredFields(
    data: any, 
    requiredFields: string[], 
    category: string = 'unknown'
): boolean {
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
export function createErrorResponse(
    toolUseId: string,
    type: string,
    action: string,
    error: Error | string
): BaseNotification {
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
export function createSuccessResponse(
    toolUseId: string,
    type: string,
    action: string,
    content: string | any
): BaseNotification {
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
export function safeStringify(obj: any, maxLength: number = 200): string {
    try {
        const str = JSON.stringify(obj);
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    } catch (error) {
        return '[Object - could not stringify]';
    }
}