/**
 * Agent Notification Functions
 *
 * This module provides functions for sending agent-related notifications,
 * including subagent task operations and completions.
 */
import { AgentNotifications } from '../types/notificationFunctions/agent';
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
export declare function StartSubagentTaskRequestNotify(parentAgentId: string, subagentId: string, task: string, priority?: string, dependencies?: string[], toolUseId?: string): void;
/**
 * Sends a response to a subagent task request
 *
 * @param content - The response content (string or any object)
 * @param isError - Whether this is an error response (default: false)
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 *
 * Requirements: 1.2 - WHEN I call `codebolt.notify.agent.StartSubagentTaskResponseNotify()` THEN the system SHALL send a StartSubagentTaskResponseNotification via WebSocket
 */
export declare function StartSubagentTaskResponseNotify(content: string | any, isError?: boolean, toolUseId?: string): void;
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
export declare function SubagentTaskCompletedNotify(parentAgentId: string, subagentId: string, taskId: string, result: any, status: string, toolUseId?: string): void;
/**
 * Agent notification functions object
 */
export declare const agentNotifications: AgentNotifications;
export default agentNotifications;
