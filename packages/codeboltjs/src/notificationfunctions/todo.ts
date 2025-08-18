/**
 * Todo Notification Functions
 * 
 * This module provides functions for sending todo/task-related notifications,
 * including task operations and lifecycle management.
 */

import {
    AddTodoRequestNotification,
    AddTodoResponseNotification,
    GetTodoRequestNotification,
    GetTodoTasksResponseNotification,
    EditTodoTaskRequestNotification,
    EditTodoTaskResponseNotification
} from '../types/notifications/todo';

import { TodoNotifications } from '../types/notificationFunctions/todo';

import {
    sendNotification,
    generateToolUseId
} from './utils';
import { TaskNotificationAction, NotificationEventType } from '@codebolt/types/enum';


// ===== ADD TODO FUNCTIONS =====

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
export function AddTodoRequestNotify(
    title?: string,
    agentId?: string,
    description?: string,
    phase?: string,
    category?: string,
    priority?: string,
    tags?: string[],
    toolUseId?: string
): void {
    const notification: AddTodoRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.TASK_NOTIFY,
        action: TaskNotificationAction.ADD_TASK_REQUEST,
        data: {
            title: title,
            agentId: agentId,
            description: description,
            phase: phase,
            category: category,
            priority: priority,
            tags: tags
        }
    };

    sendNotification(notification, 'todo-add-task');
}

/**
 * Sends an add todo response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function AddTodoResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[TodoNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: AddTodoResponseNotification = {
        toolUseId,
        type: NotificationEventType.TASK_NOTIFY,
        action: TaskNotificationAction.ADD_TASK_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'todo-add-task-response');
}

// ===== GET TODO FUNCTIONS =====

/**
 * Sends a get todo request notification
 * @param filters - Optional filters for the todo request
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function GetTodoRequestNotify(
    filters?: any,
    toolUseId?: string
): void {
    const notification: GetTodoRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.TASK_NOTIFY,
        action: TaskNotificationAction.GET_TASKS_REQUEST,
        data: {
            filters: filters
        }
    };

    sendNotification(notification, 'todo-get-tasks');
}

/**
 * Sends a get todo response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function GetTodoResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[TodoNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: GetTodoTasksResponseNotification = {
        toolUseId,
        type: NotificationEventType.TASK_NOTIFY,
        action: TaskNotificationAction.GET_TASKS_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'todo-get-tasks-response');
}

// ===== EDIT TODO TASK FUNCTIONS =====

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
export function EditTodoTaskRequestNotify(
    taskId?: string,
    title?: string,
    description?: string,
    phase?: string,
    category?: string,
    priority?: string,
    tags?: string[],
    status?: string,
    toolUseId?: string
): void {
    const notification: EditTodoTaskRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.TASK_NOTIFY,
        action: TaskNotificationAction.UPDATE_TASK_REQUEST,
        data: {
            taskId: taskId,
            title: title,
            description: description,
            phase: phase,
            category: category,
            priority: priority,
            tags: tags,
            status: status
        }
    };

    sendNotification(notification, 'todo-edit-task');
}

/**
 * Sends an edit todo task response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
export function EditTodoTaskResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    if (!toolUseId) {
        console.error('[TodoNotifications] toolUseId is required for response notifications');
        return;
    }

    const notification: EditTodoTaskResponseNotification = {
        toolUseId,
        type: NotificationEventType.TASK_NOTIFY,
        action: TaskNotificationAction.UPDATE_TASK_RESULT,
        content,
        isError
    };

    sendNotification(notification, 'todo-edit-task-response');
}

/**
 * Todo notification functions object
 */
export const todoNotifications: TodoNotifications = {
    AddTodoRequestNotify,
    AddTodoResponseNotify,
    GetTodoRequestNotify,
    GetTodoResponseNotify,
    EditTodoTaskRequestNotify,
    EditTodoTaskResponseNotify
}; 