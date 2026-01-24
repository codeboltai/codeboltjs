import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { getUserProcessingConfig } from '../../modules/user-message-manager';

export interface UserMessageGetConfigParams {
    // No parameters needed
}

class UserMessageGetConfigInvocation extends BaseToolInvocation<UserMessageGetConfigParams, ToolResult> {
    constructor(params: UserMessageGetConfigParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const config = getUserProcessingConfig();
            
            return {
                llmContent: `User processing configuration retrieved`,
                returnDisplay: JSON.stringify(config, null, 2),
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

export class UserMessageGetConfigTool extends BaseDeclarativeTool<UserMessageGetConfigParams, ToolResult> {
    constructor() {
        super(
            'user_message_get_config',
            'Get User Processing Config',
            'Get user processing configuration',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserMessageGetConfigParams): ToolInvocation<UserMessageGetConfigParams, ToolResult> {
        return new UserMessageGetConfigInvocation(params);
    }
}
