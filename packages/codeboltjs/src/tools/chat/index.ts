/**
 * Chat operation tools
 */

export { ChatGetHistoryTool, type ChatGetHistoryToolParams } from './chat-get-history';
export { ChatSendTool, type ChatSendToolParams } from './chat-send';
export { ChatWaitReplyTool, type ChatWaitReplyToolParams } from './chat-wait-reply';
export { ChatConfirmTool, type ChatConfirmToolParams } from './chat-confirm';
export { ChatAskTool, type ChatAskToolParams } from './chat-ask';
export { ChatNotifyTool, type ChatNotifyToolParams, type NotificationType } from './chat-notify';
export { ChatStopProcessTool, type ChatStopProcessToolParams } from './chat-stop-process';

// Create instances for convenience
import { ChatGetHistoryTool } from './chat-get-history';
import { ChatSendTool } from './chat-send';
import { ChatWaitReplyTool } from './chat-wait-reply';
import { ChatConfirmTool } from './chat-confirm';
import { ChatAskTool } from './chat-ask';
import { ChatNotifyTool } from './chat-notify';
import { ChatStopProcessTool } from './chat-stop-process';

/**
 * All chat operation tools
 */
export const chatTools = [
    new ChatGetHistoryTool(),
    new ChatSendTool(),
    new ChatWaitReplyTool(),
    new ChatConfirmTool(),
    new ChatAskTool(),
    new ChatNotifyTool(),
    new ChatStopProcessTool(),
];
