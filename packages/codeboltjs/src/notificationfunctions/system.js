"use strict";
/**
 * System Notification Functions
 *
 * This module provides functions for sending system-related notifications,
 * including agent initialization and completion states.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemNotifications = void 0;
exports.AgentInitNotify = AgentInitNotify;
exports.AgentCompletionNotify = AgentCompletionNotify;
const utils_1 = require("./utils");
const enum_1 = require("@codebolt/types/enum");
// ===== AGENT INIT FUNCTIONS =====
/**
 * Sends an agent init notification
 * @param onStopClicked - Optional flag indicating if stop was clicked
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function AgentInitNotify(onStopClicked, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CHAT_NOTIFY,
        action: enum_1.SystemNotificationAction.PROCESS_STARTED_REQUEST,
        data: {
            onStopClicked: onStopClicked
        }
    };
    (0, utils_1.sendNotification)(notification, 'agent-init');
}
// ===== AGENT COMPLETION FUNCTIONS =====
/**
 * Sends an agent completion notification
 * @param resultString - The result string from the agent
 * @param sessionId - Optional session ID
 * @param duration - Optional duration string
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
function AgentCompletionNotify(resultString, sessionId, duration, toolUseId) {
    const notification = {
        toolUseId: toolUseId || (0, utils_1.generateToolUseId)(),
        type: enum_1.NotificationEventType.CHAT_NOTIFY,
        action: enum_1.SystemNotificationAction.PROCESS_STOPPED_REQUEST,
        data: {
            sessionId: sessionId,
            duration: duration || "0ms",
            result: {
                resultString: resultString
            }
        }
    };
    (0, utils_1.sendNotification)(notification, 'agent-completion');
}
/**
 * System notification functions object
 */
exports.systemNotifications = {
    AgentInitNotify,
    AgentCompletionNotify
};
