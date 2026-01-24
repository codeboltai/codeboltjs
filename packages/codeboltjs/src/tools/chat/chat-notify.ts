/**
 * Chat Notify Tool - Sends a notification event
 * Wraps the SDK's cbchat.sendNotificationEvent() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbchat from '../../modules/chat';

/**
 * Valid notification types
 */
export type NotificationType = 'debug' | 'git' | 'planner' | 'browser' | 'editor' | 'terminal' | 'preview';

/**
 * Parameters for the ChatNotify tool
 */
export interface ChatNotifyToolParams {
    /**
     * The notification message to send
     */
    message: string;

    /**
     * The type of notification
     */
    type: NotificationType;
}

const VALID_NOTIFICATION_TYPES: NotificationType[] = [
    'debug',
    'git',
    'planner',
    'browser',
    'editor',
    'terminal',
    'preview',
];

class ChatNotifyToolInvocation extends BaseToolInvocation<
    ChatNotifyToolParams,
    ToolResult
> {
    constructor(params: ChatNotifyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            cbchat.sendNotificationEvent(this.params.message, this.params.type);

            return {
                llmContent: `Notification sent successfully: [${this.params.type}] "${this.params.message}"`,
                returnDisplay: `Successfully sent ${this.params.type} notification`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error sending notification: ${errorMessage}`,
                returnDisplay: `Error sending notification: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ChatNotify tool logic
 */
export class ChatNotifyTool extends BaseDeclarativeTool<
    ChatNotifyToolParams,
    ToolResult
> {
    static readonly Name: string = 'chat_notify';

    constructor() {
        super(
            ChatNotifyTool.Name,
            'ChatNotify',
            `Sends a notification event to the server. The notification type determines how the message is categorized and displayed.`,
            Kind.Execute,
            {
                properties: {
                    message: {
                        description: 'The notification message to send',
                        type: 'string',
                    },
                    type: {
                        description: "The type of notification. Must be one of: 'debug', 'git', 'planner', 'browser', 'editor', 'terminal', 'preview'",
                        type: 'string',
                        enum: VALID_NOTIFICATION_TYPES,
                    },
                },
                required: ['message', 'type'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ChatNotifyToolParams,
    ): string | null {
        if (!params.message || params.message.trim() === '') {
            return "The 'message' parameter must be a non-empty string.";
        }

        if (!params.type || !VALID_NOTIFICATION_TYPES.includes(params.type)) {
            return `The 'type' parameter must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`;
        }

        return null;
    }

    protected createInvocation(
        params: ChatNotifyToolParams,
    ): ToolInvocation<ChatNotifyToolParams, ToolResult> {
        return new ChatNotifyToolInvocation(params);
    }
}
