/**
 * System Notification Functions
 *
 * This module provides functions for sending system-related notifications,
 * including agent initialization and completion states.
 */
import { SystemNotifications } from '../types/notificationFunctions/system';
/**
 * Sends an agent init notification
 * @param onStopClicked - Optional flag indicating if stop was clicked
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function AgentInitNotify(onStopClicked?: boolean, toolUseId?: string): void;
/**
 * Sends an agent completion notification
 * @param resultString - The result string from the agent
 * @param sessionId - Optional session ID
 * @param duration - Optional duration string
 * @param toolUseId - Optional custom toolUseId, will be generated if not provided
 */
export declare function AgentCompletionNotify(resultString: string, sessionId?: string, duration?: string, toolUseId?: string): void;
/**
 * System notification functions object
 */
export declare const systemNotifications: SystemNotifications;
