import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { getCurrentUserMessage } from '../../modules/user-message-manager';

export interface UserMessageGetCurrentParams {
    // No parameters needed
}

class UserMessageGetCurrentInvocation extends BaseToolInvocation<UserMessageGetCurrentParams, ToolResult> {
    constructor(params: UserMessageGetCurrentParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const message = getCurrentUserMessage();
            
            if (!message) {
                return {
                    llmContent: 'No current user message available',
                    returnDisplay: 'No current user message',
                };
            }
            
            return {
                llmContent: `Current user message retrieved`,
                returnDisplay: JSON.stringify(message, null, 2),
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class UserMessageGetCurrentTool extends BaseDeclarativeTool<UserMessageGetCurrentParams, ToolResult> {
    constructor() {
        super(
            'user_message_get_current',
            'Get Current User Message',
            'Get the current user message object',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserMessageGetCurrentParams): ToolInvocation<UserMessageGetCurrentParams, ToolResult> {
        return new UserMessageGetCurrentInvocation(params);
    }
}
