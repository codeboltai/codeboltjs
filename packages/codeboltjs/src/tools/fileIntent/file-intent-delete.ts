/**
 * File Intent Delete Tool - Deletes a file update intent
 * Wraps the SDK's fileUpdateIntentService.delete() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';

export interface FileIntentDeleteParams {
    /** ID of the intent to delete */
    id: string;
}

class FileIntentDeleteInvocation extends BaseToolInvocation<FileIntentDeleteParams, ToolResult> {
    constructor(params: FileIntentDeleteParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const result = await fileUpdateIntentService.delete(this.params.id);

            if (result.success) {
                return {
                    llmContent: `Successfully deleted file update intent: ${this.params.id}`,
                    returnDisplay: `Deleted intent: ${this.params.id}`,
                };
            } else {
                return {
                    llmContent: `Failed to delete file update intent: ${this.params.id}`,
                    returnDisplay: `Failed to delete intent`,
                    error: {
                        message: `Failed to delete intent ${this.params.id}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error deleting file intent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentDeleteTool extends BaseDeclarativeTool<FileIntentDeleteParams, ToolResult> {
    static readonly Name: string = 'file_intent_delete';

    constructor() {
        super(
            FileIntentDeleteTool.Name,
            'FileIntentDelete',
            'Deletes a file update intent permanently, removing it from the system.',
            Kind.Delete,
            {
                properties: {
                    id: {
                        description: 'The ID of the intent to delete.',
                        type: 'string',
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentDeleteParams): string | null {
        if (!params.id || params.id.trim() === '') {
            return "'id' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentDeleteParams): ToolInvocation<FileIntentDeleteParams, ToolResult> {
        return new FileIntentDeleteInvocation(params);
    }
}
