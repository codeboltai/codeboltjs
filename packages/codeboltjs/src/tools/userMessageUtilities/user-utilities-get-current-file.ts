import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import { userMessageUtilities } from '../../modules/user-message-utilities';

export interface UserUtilitiesGetCurrentFileParams {
    // No parameters needed
}

class UserUtilitiesGetCurrentFileInvocation extends BaseToolInvocation<UserUtilitiesGetCurrentFileParams, ToolResult> {
    constructor(params: UserUtilitiesGetCurrentFileParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const currentFile = userMessageUtilities.getCurrentFile();
            
            if (!currentFile) {
                return {
                    llmContent: 'No current file available',
                    returnDisplay: 'No current file',
                };
            }
            
            return {
                llmContent: `Current file: ${currentFile}`,
                returnDisplay: currentFile,
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

export class UserUtilitiesGetCurrentFileTool extends BaseDeclarativeTool<UserUtilitiesGetCurrentFileParams, ToolResult> {
    constructor() {
        super(
            'user_utilities_get_current_file',
            'Get Current File',
            'Get current file path from user message',
            Kind.Other,
            {
                type: 'object',
                properties: {},
            }
        );
    }

    protected override createInvocation(params: UserUtilitiesGetCurrentFileParams): ToolInvocation<UserUtilitiesGetCurrentFileParams, ToolResult> {
        return new UserUtilitiesGetCurrentFileInvocation(params);
    }
}
