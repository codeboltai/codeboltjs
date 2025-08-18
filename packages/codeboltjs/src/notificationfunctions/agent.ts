/**
 * Agent Notification Functions
 * 
 * This module provides functions for sending agent-related notifications,
 * including subagent task operations and completions.
 */

import {
    StartSubagentTaskRequestNotification,
    StartSubagentTaskResponseNotification,
    SubagentTaskCompletedNotification
} from '../types/notifications/agent';

import { AgentNotifications } from '../types/notificationFunctions/agent';

import {
    sendNotification,
    generateToolUseId,
    validateRequiredFields
} from './utils';
import { AgentNotificationAction, NotificationEventType } from '@codebolt/types/enum';

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
export function StartSubagentTaskRequestNotify(
    parentAgentId: string,
    subagentId: string,
    task: string,
    priority?: string,
    dependencies?: string[],
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ parentAgentId, subagentId, task }, ['parentAgentId', 'subagentId', 'task'], 'agent.StartSubagentTaskRequestNotify')) {
        return;
    }

    // Create the notification
    const notification: StartSubagentTaskRequestNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.AGENT_NOTIFY,
        action: AgentNotificationAction.START_SUBAGENT_TASK_REQUEST,
        data: {
            parentAgentId: parentAgentId,
            subagentId: subagentId,
            task: task,
            priority: priority,
            dependencies: dependencies
        }
    };

    // Send the notification
    sendNotification(notification, 'agent.StartSubagentTaskRequestNotify');
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
export function StartSubagentTaskResponseNotify(
    content: string | any,
    isError: boolean = false,
    toolUseId?: string
): void {
    // Validate content is provided
    if (content === null || content === undefined) {
        console.error('[NotificationFunctions] Content is required for agent.StartSubagentTaskResponseNotify');
        return;
    }

    // Create the notification
    const notification: StartSubagentTaskResponseNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.AGENT_NOTIFY,
        action: AgentNotificationAction.START_SUBAGENT_TASK_RESULT,
        content: content,
        isError: isError
    };

    // Send the notification
    sendNotification(notification, 'agent.StartSubagentTaskResponseNotify');
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
export function SubagentTaskCompletedNotify(
    parentAgentId: string,
    subagentId: string,
    taskId: string,
    result: any,
    status: string,
    toolUseId?: string
): void {
    // Validate required fields
    if (!validateRequiredFields({ parentAgentId, subagentId, taskId, result, status }, ['parentAgentId', 'subagentId', 'taskId', 'result', 'status'], 'agent.SubagentTaskCompletedNotify')) {
        return;
    }

    // Create the notification
    const notification: SubagentTaskCompletedNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.AGENT_NOTIFY,
        action: AgentNotificationAction.SUBAGENT_TASK_COMPLETED,
        data: {
            parentAgentId: parentAgentId,
            subagentId: subagentId,
            taskId: taskId,
            result: result,
            status: status
        }
    };

    // Send the notification
    sendNotification(notification, 'agent.SubagentTaskCompletedNotify');
}

/**
 * Agent notification functions object
 */
export const agentNotifications: AgentNotifications = {
    StartSubagentTaskRequestNotify,
    StartSubagentTaskResponseNotify,
    SubagentTaskCompletedNotify
};

// Default export
export default agentNotifications;