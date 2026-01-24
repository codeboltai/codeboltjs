import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { userMessageUtilities } from '../../modules/user-message-utilities';

export interface UserUtilitiesGetMentionedMCPsParams {
    // No parameters needed
}

class UserUtilitiesGetMentionedMCPsInvocation extends BaseToolInvocation<UserUtilitiesGetMentionedMCPsParams, ToolResult> {
    constructor(params: UserUtilitiesGetMentionedMCPsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const mcps = userMessageUtilities.getMentionedMCPs();
            
            return {
                llmContent: `Found ${mcps.length} mentioned MCP(s)`,
                returnDisplay: JSON.stringify(mcps, null, 2),
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

export class UserUtilitiesGetMentionedMCPsTool extends BaseDeclarativeTool<UserUtilitiesGetMentionedMCPsParams, ToolResult> {
    constructor() {
        super(
            'user_utilities_get_mentioned_mcps',
            'Get Mentioned MCPs',
            'Get mentioned MCPs from current user message',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserUtilitiesGetMentionedMCPsParams): ToolInvocation<UserUtilitiesGetMentionedMCPsParams, ToolResult> {
        return new UserUtilitiesGetMentionedMCPsInvocation(params);
    }
}
