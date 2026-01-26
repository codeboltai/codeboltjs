import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { getUserMessageText } from '../../modules/user-message-manager';

export interface UserMessageGetTextParams {
    // No parameters needed
}

class UserMessageGetTextInvocation extends BaseToolInvocation<UserMessageGetTextParams, ToolResult> {
    constructor(params: UserMessageGetTextParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const text = getUserMessageText();
            
            return {
                llmContent: `User message text: ${text}`,
                returnDisplay: text,
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

export class UserMessageGetTextTool extends BaseDeclarativeTool<UserMessageGetTextParams, ToolResult> {
    constructor() {
        super(
            'user_message_get_text',
            'Get User Message Text',
            'Get the current user message text content',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserMessageGetTextParams): ToolInvocation<UserMessageGetTextParams, ToolResult> {
        return new UserMessageGetTextInvocation(params);
    }
}
