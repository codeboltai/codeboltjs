"use strict";
/**
 * Agent Notification Functions
 *
 * This module provides functions for sending agent-related notifications,
 * including subagent task operations and completions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentNotifications = void 0;
exports.StartSubagentTaskRequestNotify = StartSubagentTaskRequestNotify;
exports.StartSubagentTaskResponseNotify = StartSubagentTaskResponseNotify;
exports.SubagentTaskCompletedNotify = SubagentTaskCompletedNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
/**
 * Sends a request to start a subagent task
 *
 * @param parentAgentId - The parent agent ID
 * @param subagentId - The subagent ID
 * @param task - The task description
 * @param priority - Optional task priority
 * @param dependencies - Optional array of dependencies
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 1.1 - WHEN I call `codebolt.notify.agent.StartSubagentTaskRequestNotify()` THEN the system SHALL send a StartSubagentTaskRequestNotification via WebSocket
 */
function StartSubagentTaskRequestNotify(parentAgentId, subagentId, task, priority, dependencies, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ parentAgentId, subagentId, task }, ['parentAgentId', 'subagentId', 'task'], 'agent.StartSubagentTaskRequestNotify')) {
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.AGENT_NOTIFY,
        action: enum_1.AgentNotificationAction.START_SUBAGENT_TASK_REQUEST,
        data: {
            parentAgentId: parentAgentId,
            subagentId: subagentId,
            task: task,
            priority: priority,
            dependencies: dependencies
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'agent.StartSubagentTaskRequestNotify');
}
/**
 * Sends a response to a subagent task request
 *
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 1.2 - WHEN I call `codebolt.notify.agent.StartSubagentTaskResponseNotify()` THEN the system SHALL send a StartSubagentTaskResponseNotification via WebSocket
 */
function StartSubagentTaskResponseNotify(content, isError = false, toolUseId) {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for agent.StartSubagentTaskResponseNotify');
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.AGENT_NOTIFY,
        action: enum_1.AgentNotificationAction.START_SUBAGENT_TASK_RESULT,
        content: content,
        isError: isError
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'agent.StartSubagentTaskResponseNotify');
}
/**
 * Notifies that a subagent task has been completed
 *
 * @param parentAgentId - The parent agent ID
 * @param subagentId - The subagent ID
 * @param taskId - The task ID
 * @param result - The task result
 * @param status - The task status
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 1.3 - WHEN I call `codebolt.notify.agent.SubagentTaskCompletedNotify()` THEN the system SHALL send a SubagentTaskCompletedNotification via WebSocket
 */
function SubagentTaskCompletedNotify(parentAgentId, subagentId, taskId, result, status, toolUseId) {
    // Validate required fields
    if (!(0, utils_1.validateRequiredFields)({ parentAgentId, subagentId, taskId, result, status }, ['parentAgentId', 'subagentId', 'taskId', 'result', 'status'], 'agent.SubagentTaskCompletedNotify')) {
        return;
    }
    // Create the notification
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.AGENT_NOTIFY,
        action: enum_1.AgentNotificationAction.SUBAGENT_TASK_COMPLETED,
        data: {
            parentAgentId: parentAgentId,
            subagentId: subagentId,
            taskId: taskId,
            result: result,
            status: status
        }
    };
    // Send the notification
    (0, utils_1.sendNotification)(notification, 'agent.SubagentTaskCompletedNotify');
}
/**
 * Agent notification functions object
 */
exports.agentNotifications = {
    StartSubagentTaskRequestNotify,
    StartSubagentTaskResponseNotify,
    SubagentTaskCompletedNotify
};
// Default export
exports.default = exports.agentNotifications;
