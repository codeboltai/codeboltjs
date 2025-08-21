/**
 * Database Memory Notification Functions
 *
 * This module provides functions for sending database memory-related notifications,
 * including knowledge storage and retrieval operations.
 */
import { DbmemoryNotifications } from '../types/notificationFunctions/dbmemory';
/**
 * Sends a request to add knowledge to memory
 *
 * @param key - The memory key
 * @param value - The memory value
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 6.1 - WHEN I call `codebolt.notify.dbmemory.AddMemoryRequestNotify()` THEN the system SHALL send an AddMemoryRequestNotification via WebSocket
 */
export declare function AddMemoryRequestNotify(key: string, value: any, toolUseId?: string): void;
/**
 * Sends a result response for an add memory operation
 *
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 6.2 - WHEN I call `codebolt.notify.dbmemory.AddMemoryResultNotify()` THEN the system SHALL send an AddMemoryResultNotification via WebSocket
 */
export declare function AddMemoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a request to get knowledge from memory
 *
 * @param key - The memory key to retrieve
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 6.3 - WHEN I call `codebolt.notify.dbmemory.GetMemoryRequestNotify()` THEN the system SHALL send a GetMemoryRequestNotification via WebSocket
 */
export declare function GetMemoryRequestNotify(key: string, toolUseId?: string): void;
/**
 * Sends a result response for a get memory operation
 *
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 6.4 - WHEN I call `codebolt.notify.dbmemory.GetMemoryResultNotify()` THEN the system SHALL send a GetMemoryResultNotification via WebSocket
 */
export declare function GetMemoryResultNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Database memory notification functions object
 */
export declare const dbmemoryNotifications: DbmemoryNotifications;
