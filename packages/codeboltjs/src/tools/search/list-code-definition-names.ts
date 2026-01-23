/**
 * List Code Definition Names Tool - Lists code definitions in a file/directory
 * Wraps the SDK's cbfs.listCodeDefinitionNames() method
 */

import * as path from 'path';
import type {
    ToolInvocation,
    ToolLocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbfs from '../../modules/fs';
import cbchat from '../../modules/chat';

/**
 * Parameters for the ListCodeDefinitionNames tool
 */
export interface ListCodeDefinitionNamesToolParams {
    /**
     * One sentence explanation of why this tool is being used
     */
    explanation?: string;

    /**
     * The path to search for code definitions
     */
    path: string;
}

class ListCodeDefinitionNamesToolInvocation extends BaseToolInvocation<
    ListCodeDefinitionNamesToolParams,
    ToolResult
> {
    constructor(params: ListCodeDefinitionNamesToolParams) {
        super(params);
    }

    override toolLocations(): ToolLocation[] {
        return [{ path: this.params.path }];
    }

    async execute(): Promise<ToolResult> {
        try {
            if (this.params.explanation) {
                cbchat.sendMessage(this.params.explanation);
            }
            // Call the SDK's fs module
            const response = await cbfs.listCodeDefinitionNames(this.params.path);

            if (!response.success) {
                const errorMsg = typeof response.error === 'string'
                    ? response.error
                    : (response.error as any)?.message || 'Unknown error';
                return {
                    llmContent: `Error listing code definitions: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            // Format the results
            // ListCodeDefinitionsResponse has definitions?: string[] and result?: string
            const definitions = response.definitions || [];

            if (definitions.length === 0) {
                // Check if there's a result string
                if (response.result) {
                    return {
                        llmContent: `Code definitions in: ${this.params.path}\n\n${response.result}`,
                        returnDisplay: `Found definitions`,
                    };
                }
                return {
                    llmContent: `No code definitions found in: ${this.params.path}`,
                    returnDisplay: `No definitions found`,
                };
            }

            let output = `Found ${definitions.length} code definition(s) in: ${this.params.path}\n\n`;

            // definitions is string[], so just list them
            for (const def of definitions) {
                output += `  ${def}\n`;
            }

            return {
                llmContent: output,
                returnDisplay: `Found ${definitions.length} definition(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing code definitions: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the ListCodeDefinitionNames tool logic
 */
export class ListCodeDefinitionNamesTool extends BaseDeclarativeTool<
    ListCodeDefinitionNamesToolParams,
    ToolResult
> {
    static readonly Name: string = 'list_code_definition_names';

    constructor() {
        super(
            ListCodeDefinitionNamesTool.Name,
            'ListCodeDefinitionNames',
            `Lists code definitions (functions, classes, interfaces, variables, etc.) in a file or directory. Useful for understanding the structure and API of a codebase without reading full file contents.`,
            Kind.Search,
            {
                properties: {
                    explanation: {
                        description:
                            "One sentence explanation as to why this tool is being used, and how it contributes to the goal.",
                        type: 'string',
                    },
                    path: {
                        description:
                            'The absolute path to the file or directory to analyze for code definitions.',
                        type: 'string',
                    },
                },
                required: ['path'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: ListCodeDefinitionNamesToolParams,
    ): string | null {
        if (params.path.trim() === '') {
            return "The 'path' parameter must be non-empty.";
        }

        if (!path.isAbsolute(params.path)) {
            return `Path must be absolute, but was relative: ${params.path}.`;
        }

        return null;
    }

    protected createInvocation(
        params: ListCodeDefinitionNamesToolParams,
    ): ToolInvocation<ListCodeDefinitionNamesToolParams, ToolResult> {
        return new ListCodeDefinitionNamesToolInvocation(params);
    }
}
