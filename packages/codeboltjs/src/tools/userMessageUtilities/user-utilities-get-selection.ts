import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { userMessageUtilities } from '../../modules/user-message-utilities';

export interface UserUtilitiesGetSelectionParams {
    // No parameters needed
}

class UserUtilitiesGetSelectionInvocation extends BaseToolInvocation<UserUtilitiesGetSelectionParams, ToolResult> {
    constructor(params: UserUtilitiesGetSelectionParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const selection = userMessageUtilities.getSelection();
            
            if (!selection) {
                return {
                    llmContent: 'No text selection available',
                    returnDisplay: 'No text selection',
                };
            }
            
            return {
                llmContent: `Text selection retrieved`,
                returnDisplay: selection,
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

export class UserUtilitiesGetSelectionTool extends BaseDeclarativeTool<UserUtilitiesGetSelectionParams, ToolResult> {
    constructor() {
        super(
            'user_utilities_get_selection',
            'Get Text Selection',
            'Get text selection from current user message',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserUtilitiesGetSelectionParams): ToolInvocation<UserUtilitiesGetSelectionParams, ToolResult> {
        return new UserUtilitiesGetSelectionInvocation(params);
    }
}
