/**
 * File Intent Update Tool - Updates an existing file update intent
 * Wraps the SDK's fileUpdateIntentService.update() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';
import type { IntentLevel } from '../../types/fileUpdateIntent';

export interface FileIntentUpdateParams {
    /** ID of the intent to update */
    id: string;
    /** Updated list of files with their intent levels (optional) */
    files?: Array<{
        filePath: string;
        intentLevel: IntentLevel;
        targetSections?: string[];
    }>;
    /** Updated description (optional) */
    description?: string;
    /** Updated estimated duration in minutes (optional) */
    estimatedDuration?: number;
    /** Updated priority 1-10 (optional) */
    priority?: number;
    /** Updated auto-expire setting (optional) */
    autoExpire?: boolean;
    /** Updated max auto-expire minutes (optional) */
    maxAutoExpireMinutes?: number;
}

class FileIntentUpdateInvocation extends BaseToolInvocation<FileIntentUpdateParams, ToolResult> {
    constructor(params: FileIntentUpdateParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const { id, ...updateData } = this.params;
            const intent = await fileUpdateIntentService.update(id, updateData);

            let output = `Updated file update intent: ${intent.id}`;
            output += `\nEnvironment: ${intent.environmentId}`;
            output += `\nDescription: ${intent.description}`;
            output += `\nFiles: ${intent.files.map(f => f.filePath).join(', ')}`;
            output += `\nPriority: ${intent.priority}`;
            output += `\nStatus: ${intent.status}`;
            output += `\nUpdated at: ${intent.updatedAt}`;

            return {
                llmContent: output,
                returnDisplay: `Updated file intent: ${intent.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating file intent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentUpdateTool extends BaseDeclarativeTool<FileIntentUpdateParams, ToolResult> {
    static readonly Name: string = 'file_intent_update';

    constructor() {
        super(
            FileIntentUpdateTool.Name,
            'FileIntentUpdate',
            'Updates an existing file update intent with new values for files, description, priority, or other fields.',
            Kind.Edit,
            {
                properties: {
                    id: {
                        description: 'The ID of the intent to update.',
                        type: 'string',
                    },
                    files: {
                        description: 'Updated list of files with their intent levels (optional).',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                filePath: { type: 'string' },
                                intentLevel: { type: 'number', minimum: 1, maximum: 4 },
                                targetSections: { type: 'array', items: { type: 'string' } },
                            },
                            required: ['filePath', 'intentLevel'],
                        },
                    },
                    description: {
                        description: 'Updated description of the intended change (optional).',
                        type: 'string',
                    },
                    estimatedDuration: {
                        description: 'Updated estimated duration in minutes (optional).',
                        type: 'number',
                    },
                    priority: {
                        description: 'Updated priority 1-10 (optional).',
                        type: 'number',
                        minimum: 1,
                        maximum: 10,
                    },
                    autoExpire: {
                        description: 'Updated auto-expire setting (optional).',
                        type: 'boolean',
                    },
                    maxAutoExpireMinutes: {
                        description: 'Updated max auto-expire minutes (optional).',
                        type: 'number',
                    },
                },
                required: ['id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentUpdateParams): string | null {
        if (!params.id || params.id.trim() === '') {
            return "'id' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentUpdateParams): ToolInvocation<FileIntentUpdateParams, ToolResult> {
        return new FileIntentUpdateInvocation(params);
    }
}
