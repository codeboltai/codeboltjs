import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { userMessageUtilities } from '../../modules/user-message-utilities';

export interface UserUtilitiesGetMentionedFilesParams {
    // No parameters needed
}

class UserUtilitiesGetMentionedFilesInvocation extends BaseToolInvocation<UserUtilitiesGetMentionedFilesParams, ToolResult> {
    constructor(params: UserUtilitiesGetMentionedFilesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const files = userMessageUtilities.getMentionedFiles();
            
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

export class UserUtilitiesGetMentionedFilesTool extends BaseDeclarativeTool<UserUtilitiesGetMentionedFilesParams, ToolResult> {
    constructor() {
        super(
            'user_utilities_get_mentioned_files',
            'Get Mentioned Files (Utilities)',
            'Get mentioned files from current user message using utilities',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserUtilitiesGetMentionedFilesParams): ToolInvocation<UserUtilitiesGetMentionedFilesParams, ToolResult> {
        return new UserUtilitiesGetMentionedFilesInvocation(params);
    }
}
