/**
 * File Intent Cancel Tool - Cancels a file update intent
 * Wraps the SDK's fileUpdateIntentService.cancel() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';

export interface FileIntentCancelParams {
    /** ID of the intent to cancel */
    id: string;
    /** Agent ID who is cancelling this intent */
    cancelledBy: string;
}

class FileIntentCancelInvocation extends BaseToolInvocation<FileIntentCancelParams, ToolResult> {
    constructor(params: FileIntentCancelParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const intent = await fileUpdateIntentService.cancel(this.params.id, this.params.cancelledBy);

            let output = `Cancelled file update intent: ${intent.id}`;
            output += `\nDescription: ${intent.description}`;
            output += `\nFiles: ${intent.files.map(f => f.filePath).join(', ')}`;
            output += `\nStatus: ${intent.status}`;
            output += `\nCancelled by: ${this.params.cancelledBy}`;

            return {
                llmContent: output,
                returnDisplay: `Cancelled intent: ${intent.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error cancelling file intent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentCancelTool extends BaseDeclarativeTool<FileIntentCancelParams, ToolResult> {
    static readonly Name: string = 'file_intent_cancel';

    constructor() {
        super(
            FileIntentCancelTool.Name,
            'FileIntentCancel',
            'Cancels a file update intent, releasing the reservation on the files without marking as completed.',
            Kind.Execute,
            {
                properties: {
                    id: {
                        description: 'The ID of the intent to cancel.',
                        type: 'string',
                    },
                    cancelledBy: {
                        description: 'The agent ID who is cancelling this intent.',
                        type: 'string',
                    },
                },
                required: ['id', 'cancelledBy'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentCancelParams): string | null {
        if (!params.id || params.id.trim() === '') {
            return "'id' is required";
        }
        if (!params.cancelledBy || params.cancelledBy.trim() === '') {
            return "'cancelledBy' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentCancelParams): ToolInvocation<FileIntentCancelParams, ToolResult> {
        return new FileIntentCancelInvocation(params);
    }
}
