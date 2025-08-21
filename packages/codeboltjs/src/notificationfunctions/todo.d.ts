/**
 * Todo Notification Functions
 *
 * This module provides functions for sending todo/task-related notifications,
 * including task operations and lifecycle management.
 */
import { TodoNotifications } from '../types/notificationFunctions/todo';
/**
 * Sends an add todo request notification
 * @param title - Optional task title
 * @param agentId - Optional agent ID
 * @param description - Optional task description
 * @param phase - Optional task phase
 * @param category - Optional task category
 * @param priority - Optional task priority
 * @param tags - Optional array of tags
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function AddTodoRequestNotify(title?: string, agentId?: string, description?: string, phase?: string, category?: string, priority?: string, tags?: string[], toolUseId?: string): void;
/**
 * Sends an add todo response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function AddTodoResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends a get todo request notification
 * @param filters - Optional filters for the todo request
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function GetTodoRequestNotify(filters?: any, toolUseId?: string): void;
/**
 * Sends a get todo response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function GetTodoResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Sends an edit todo task request notification
 * @param taskId - Optional task ID to edit
 * @param title - Optional new task title
 * @param description - Optional new task description
 * @param phase - Optional new task phase
 * @param category - Optional new task category
 * @param priority - Optional new task priority
 * @param tags - Optional new array of tags
 * @param status - Optional new task status
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function EditTodoTaskRequestNotify(taskId?: string, title?: string, description?: string, phase?: string, category?: string, priority?: string, tags?: string[], status?: string, toolUseId?: string): void;
/**
 * Sends an edit todo task response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export declare function EditTodoTaskResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
/**
 * Todo notification functions object
 */
export declare const todoNotifications: TodoNotifications;
