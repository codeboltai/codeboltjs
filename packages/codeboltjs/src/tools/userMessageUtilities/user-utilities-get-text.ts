import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { userMessageUtilities } from '../../modules/user-message-utilities';

export interface UserUtilitiesGetTextParams {
    // No parameters needed
}

class UserUtilitiesGetTextInvocation extends BaseToolInvocation<UserUtilitiesGetTextParams, ToolResult> {
    constructor(params: UserUtilitiesGetTextParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const text = userMessageUtilities.getText();
            
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

export class UserUtilitiesGetTextTool extends BaseDeclarativeTool<UserUtilitiesGetTextParams, ToolResult> {
    constructor() {
        super(
            'user_utilities_get_text',
            'Get User Message Text (Utilities)',
            'Get the user message text content using utilities',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserUtilitiesGetTextParams): ToolInvocation<UserUtilitiesGetTextParams, ToolResult> {
        return new UserUtilitiesGetTextInvocation(params);
    }
}
