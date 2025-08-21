/**
 * @codebolt/types/enum - Enum Types Export
 * 
 * This module provides TypeScript enums for WebSocket communication.
 * These enums are used for internal WebSocket message types and actions.
 * 
 * Usage Examples:
 * 
 * // Import WebSocket enums
 * import { EventType, FSAction, BrowserAction } from '@codebolt/types/enum';
 * 
 * // Import specific response types
 * import { FSResponseType, BrowserResponseType } from '@codebolt/types/enum';
 * 
 * Available Enums:
 * - EventType: WebSocket event types
 * - FSAction, FSResponseType: File system actions and responses
 * - BrowserAction, BrowserResponseType: Browser actions and responses
 * - GitAction, GitResponseType: Git actions and responses
 * - And many more for different modules
 */

// Export all WebSocket message enums
export * from './codeboltjstypes/message.enum';
export * from './codeboltjstypes/notification.enum';
