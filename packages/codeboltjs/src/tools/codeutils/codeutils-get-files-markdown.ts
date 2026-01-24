/**
 * CodeUtils Get Files Markdown Tool - Gets all files as markdown
 * Wraps the SDK's cbcodeutils.getAllFilesAsMarkDown() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcodeutils from '../../modules/codeutils';

export interface CodeUtilsGetFilesMarkdownParams {
    // No required parameters
}

class CodeUtilsGetFilesMarkdownInvocation extends BaseToolInvocation<CodeUtilsGetFilesMarkdownParams, ToolResult> {
    constructor(params: CodeUtilsGetFilesMarkdownParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbcodeutils.getAllFilesAsMarkDown();

            return {
                llmContent: response || 'No files found',
                returnDisplay: 'Files retrieved as markdown',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting files as markdown: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class CodeUtilsGetFilesMarkdownTool extends BaseDeclarativeTool<CodeUtilsGetFilesMarkdownParams, ToolResult> {
    static readonly Name: string = 'codeutils_get_files_markdown';

    constructor() {
        super(
            CodeUtilsGetFilesMarkdownTool.Name,
            'CodeUtilsGetFilesMarkdown',
            'Retrieves all files in the project as markdown format.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: CodeUtilsGetFilesMarkdownParams): ToolInvocation<CodeUtilsGetFilesMarkdownParams, ToolResult> {
        return new CodeUtilsGetFilesMarkdownInvocation(params);
    }
}
