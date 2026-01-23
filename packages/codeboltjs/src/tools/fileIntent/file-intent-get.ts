/**
 * File Intent Get Tool - Gets a single file update intent by ID
 * Wraps the SDK's fileUpdateIntentService.get() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';

export interface FileIntentGetParams {
    /** ID of the intent to retrieve */
    id: string;
}

class FileIntentGetInvocation extends BaseToolInvocation<FileIntentGetParams, ToolResult> {
    constructor(params: FileIntentGetParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const intent = await fileUpdateIntentService.get(this.params.id);

            if (!intent) {
                return {
                    llmContent: `File intent not found: ${this.params.id}`,
                    returnDisplay: `Intent not found: ${this.params.id}`,
                    error: {
                        message: `Intent with ID ${this.params.id} not found`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            let output = `File Update Intent: ${intent.id}`;
            output += `\nEnvironment: ${intent.environmentId}`;
            output += `\nDescription: ${intent.description}`;
            output += `\nFiles:`;
            for (const file of intent.files) {
                output += `\n  - ${file.filePath} (Level ${file.intentLevel})`;
                if (file.targetSections && file.targetSections.length > 0) {
                    output += ` [Sections: ${file.targetSections.join(', ')}]`;
                }
            }
            output += `\nPriority: ${intent.priority}`;
            output += `\nClaimed by: ${intent.claimedByName || intent.claimedBy}`;
            output += `\nStatus: ${intent.status}`;
            output += `\nCreated: ${intent.createdAt}`;
            output += `\nUpdated: ${intent.updatedAt}`;
            if (intent.expiresAt) {
                output += `\nExpires: ${intent.expiresAt}`;
            }
            if (intent.closedAt) {
                output += `\nClosed: ${intent.closedAt} by ${intent.closedBy}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Retrieved intent: ${intent.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting file intent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentGetTool extends BaseDeclarativeTool<FileIntentGetParams, ToolResult> {
    static readonly Name: string = 'file_intent_get';

    constructor() {
        super(
            FileIntentGetTool.Name,
            'FileIntentGet',
            'Retrieves a single file update intent by its ID, including all details about files, status, and ownership.',
            Kind.Read,
            {
                properties: {
                    id: {
                        description: 'The ID of the intent to retrieve.',
                        type: 'string',
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentGetParams): string | null {
        if (!params.id || params.id.trim() === '') {
            return "'id' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentGetParams): ToolInvocation<FileIntentGetParams, ToolResult> {
        return new FileIntentGetInvocation(params);
    }
}
