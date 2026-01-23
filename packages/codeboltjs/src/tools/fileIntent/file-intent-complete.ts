/**
 * File Intent Complete Tool - Marks a file update intent as completed
 * Wraps the SDK's fileUpdateIntentService.complete() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';

export interface FileIntentCompleteParams {
    /** ID of the intent to complete */
    id: string;
    /** Agent ID who is completing this intent */
    closedBy: string;
}

class FileIntentCompleteInvocation extends BaseToolInvocation<FileIntentCompleteParams, ToolResult> {
    constructor(params: FileIntentCompleteParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const intent = await fileUpdateIntentService.complete(this.params.id, this.params.closedBy);

            let output = `Completed file update intent: ${intent.id}`;
            output += `\nDescription: ${intent.description}`;
            output += `\nFiles: ${intent.files.map(f => f.filePath).join(', ')}`;
            output += `\nStatus: ${intent.status}`;
            output += `\nClosed by: ${intent.closedBy}`;
            output += `\nClosed at: ${intent.closedAt}`;

            return {
                llmContent: output,
                returnDisplay: `Completed intent: ${intent.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error completing file intent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentCompleteTool extends BaseDeclarativeTool<FileIntentCompleteParams, ToolResult> {
    static readonly Name: string = 'file_intent_complete';

    constructor() {
        super(
            FileIntentCompleteTool.Name,
            'FileIntentComplete',
            'Marks a file update intent as completed, releasing the reservation on the files.',
            Kind.Execute,
            {
                properties: {
                    id: {
                        description: 'The ID of the intent to complete.',
                        type: 'string',
                    },
                    closedBy: {
                        description: 'The agent ID who is completing this intent.',
                        type: 'string',
                    },
                },
                required: ['id', 'closedBy'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentCompleteParams): string | null {
        if (!params.id || params.id.trim() === '') {
            return "'id' is required";
        }
        if (!params.closedBy || params.closedBy.trim() === '') {
            return "'closedBy' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentCompleteParams): ToolInvocation<FileIntentCompleteParams, ToolResult> {
        return new FileIntentCompleteInvocation(params);
    }
}
