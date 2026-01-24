import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { getMentionedFiles } from '../../modules/user-message-manager';

export interface UserMessageGetMentionedFilesParams {
    // No parameters needed
}

class UserMessageGetMentionedFilesInvocation extends BaseToolInvocation<UserMessageGetMentionedFilesParams, ToolResult> {
    constructor(params: UserMessageGetMentionedFilesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const files = getMentionedFiles();
            
            return {
                llmContent: `Found ${files.length} mentioned file(s)`,
                returnDisplay: JSON.stringify(files, null, 2),
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

export class UserMessageGetMentionedFilesTool extends BaseDeclarativeTool<UserMessageGetMentionedFilesParams, ToolResult> {
    constructor() {
        super(
            'user_message_get_mentioned_files',
            'Get Mentioned Files',
            'Get mentioned files from current user message',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserMessageGetMentionedFilesParams): ToolInvocation<UserMessageGetMentionedFilesParams, ToolResult> {
        return new UserMessageGetMentionedFilesInvocation(params);
    }
}
