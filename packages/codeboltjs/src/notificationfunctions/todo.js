"use strict";
/**
 * Todo Notification Functions
 *
 * This module provides functions for sending todo/task-related notifications,
 * including task operations and lifecycle management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.todoNotifications = void 0;
exports.AddTodoRequestNotify = AddTodoRequestNotify;
exports.AddTodoResponseNotify = AddTodoResponseNotify;
exports.GetTodoRequestNotify = GetTodoRequestNotify;
exports.GetTodoResponseNotify = GetTodoResponseNotify;
exports.EditTodoTaskRequestNotify = EditTodoTaskRequestNotify;
exports.EditTodoTaskResponseNotify = EditTodoTaskResponseNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
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
function AddTodoRequestNotify(title, agentId, description, phase, category, priority, tags, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.TASK_NOTIFY,
        action: enum_1.TaskNotificationAction.ADD_TASK_REQUEST,
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
    (0, utils_1.sendNotification)(notification, 'todo-add-task');
}
/**
 * Sends an add todo response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function AddTodoResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[TodoNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.TASK_NOTIFY,
        action: enum_1.TaskNotificationAction.ADD_TASK_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'todo-add-task-response');
}
// ===== GET TODO FUNCTIONS =====
/**
 * Sends a get todo request notification
 * @param filters - Optional filters for the todo request
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function GetTodoRequestNotify(filters, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.TASK_NOTIFY,
        action: enum_1.TaskNotificationAction.GET_TASKS_REQUEST,
        data: {
            filters: filters
        }
    };
    (0, utils_1.sendNotification)(notification, 'todo-get-tasks');
}
/**
 * Sends a get todo response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function GetTodoResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[TodoNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.TASK_NOTIFY,
        action: enum_1.TaskNotificationAction.GET_TASKS_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'todo-get-tasks-response');
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
function EditTodoTaskRequestNotify(taskId, title, description, phase, category, priority, tags, status, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.TASK_NOTIFY,
        action: enum_1.TaskNotificationAction.UPDATE_TASK_REQUEST,
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
    (0, utils_1.sendNotification)(notification, 'todo-edit-task');
}
/**
 * Sends an edit todo task response notification
 * @param content - The response content or error details
 * @param isError - Whether this is an error response
 * @param toolUseId - The toolUseId from the original request
 */
function EditTodoTaskResponseNotify(content, isError = false, toolUseId) {
    if (!toolUseId) {
        console.error('[TodoNotifications] toolUseId is required for response notifications');
        return;
    }
    const notification = {
        toolUseId,
        type: enum_1.NotificationEventType.TASK_NOTIFY,
        action: enum_1.TaskNotificationAction.UPDATE_TASK_RESULT,
        content,
        isError
    };
    (0, utils_1.sendNotification)(notification, 'todo-edit-task-response');
}
/**
 * Todo notification functions object
 */
exports.todoNotifications = {
    AddTodoRequestNotify,
    AddTodoResponseNotify,
    GetTodoRequestNotify,
    GetTodoResponseNotify,
    EditTodoTaskRequestNotify,
    EditTodoTaskResponseNotify
};
