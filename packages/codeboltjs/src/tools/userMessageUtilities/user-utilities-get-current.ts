import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { userMessageUtilities } from '../../modules/user-message-utilities';

export interface UserUtilitiesGetCurrentParams {
    // No parameters needed
}

class UserUtilitiesGetCurrentInvocation extends BaseToolInvocation<UserUtilitiesGetCurrentParams, ToolResult> {
    constructor(params: UserUtilitiesGetCurrentParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const message = userMessageUtilities.getCurrent();
            
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

export class UserUtilitiesGetCurrentTool extends BaseDeclarativeTool<UserUtilitiesGetCurrentParams, ToolResult> {
    constructor() {
        super(
            'user_utilities_get_current',
            'Get Current User Message (Utilities)',
            'Get the current user message object using utilities',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserUtilitiesGetCurrentParams): ToolInvocation<UserUtilitiesGetCurrentParams, ToolResult> {
        return new UserUtilitiesGetCurrentInvocation(params);
    }
}
