/**
 * System Notification Functions
 * 
 * This module provides functions for sending system-related notifications,
 * including agent initialization and completion states.
 */

import {
    agentInitNotification,
    agentCompletionNotification
} from '../types/notifications/system';

import { SystemNotifications } from '../types/notificationFunctions/system';

import {
    sendNotification,
    generateToolUseId
} from './utils';
import { SystemNotificationAction, NotificationEventType } from '@codebolt/types/enum';




// ===== AGENT INIT FUNCTIONS =====

/**
 * Sends an agent init notification
 * @param onStopClicked - Optional flag indicating if stop was clicked
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function AgentInitNotify(
    onStopClicked?: boolean,
    toolUseId?: string
): void {
    const notification: agentInitNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CHAT_NOTIFY,
        action: SystemNotificationAction.PROCESS_STARTED_REQUEST,
        data: {
            onStopClicked: onStopClicked
        }
    };

    sendNotification(notification, 'agent-init');
}

// ===== AGENT COMPLETION FUNCTIONS =====

/**
 * Sends an agent completion notification
 * @param resultString - The result string from the agent
 * @param sessionId - Optional session ID
 * @param duration - Optional duration string
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export function AgentCompletionNotify(
    resultString: string,
    sessionId?: string,
    duration?: string,
    toolUseId?: string
): void {
    const notification: agentCompletionNotification = {
        toolUseId: toolUseId || generateToolUseId(),
        type: NotificationEventType.CHAT_NOTIFY,
        action: SystemNotificationAction.PROCESS_STOPPED_REQUEST,
        data: {
            sessionId: sessionId,
            duration: duration || "0ms",
            result: {
                resultString: resultString
            }
        }
    };

    sendNotification(notification, 'agent-completion');
}

/**
 * System notification functions object
 */
export const systemNotifications: SystemNotifications = {
    AgentInitNotify,
    AgentCompletionNotify
}; 