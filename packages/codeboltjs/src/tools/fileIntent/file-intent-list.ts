/**
 * File Intent List Tool - Lists file update intents with optional filters
 * Wraps the SDK's fileUpdateIntentService.list() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';
import type { IntentStatus } from '../../types/fileUpdateIntent';

export interface FileIntentListParams {
    /** Filter by environment ID (optional) */
    environmentId?: string;
    /** Filter by status (optional) */
    status?: IntentStatus[];
    /** Filter by agent who claimed (optional) */
    claimedBy?: string;
    /** Filter by file path containing string (optional) */
    filePathContains?: string;
    /** Filter by creation date after (optional) */
    createdAfter?: string;
    /** Filter by creation date before (optional) */
    createdBefore?: string;
}

class FileIntentListInvocation extends BaseToolInvocation<FileIntentListParams, ToolResult> {
    constructor(params: FileIntentListParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const intents = await fileUpdateIntentService.list(this.params);

            if (!intents || intents.length === 0) {
                return {
                    llmContent: 'No file update intents found matching the filters.',
                    returnDisplay: 'No intents found',
                };
            }

            let output = `Found ${intents.length} file update intent(s):\n`;

            for (const intent of intents) {
                output += `\n---\nIntent: ${intent.id}`;
                output += `\n  Description: ${intent.description}`;
                output += `\n  Files: ${intent.files.map(f => f.filePath).join(', ')}`;
                output += `\n  Priority: ${intent.priority}`;
                output += `\n  Claimed by: ${intent.claimedByName || intent.claimedBy}`;
                output += `\n  Status: ${intent.status}`;
                output += `\n  Created: ${intent.createdAt}`;
            }

            return {
                llmContent: output,
                returnDisplay: `Found ${intents.length} intent(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing file intents: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentListTool extends BaseDeclarativeTool<FileIntentListParams, ToolResult> {
    static readonly Name: string = 'file_intent_list';

    constructor() {
        super(
            FileIntentListTool.Name,
            'FileIntentList',
            'Lists file update intents with optional filters for environment, status, agent, file path, and date range.',
            Kind.Read,
            {
                properties: {
                    environmentId: {
                        description: 'Filter by environment ID (optional).',
                        type: 'string',
                    },
                    status: {
                        description: "Filter by status array: 'active', 'completed', 'expired', 'cancelled' (optional).",
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['active', 'completed', 'expired', 'cancelled'],
                        },
                    },
                    claimedBy: {
                        description: 'Filter by agent ID who claimed the intent (optional).',
                        type: 'string',
                    },
                    filePathContains: {
                        description: 'Filter by file path containing this string (optional).',
                        type: 'string',
                    },
                    createdAfter: {
                        description: 'Filter by creation date after this ISO timestamp (optional).',
                        type: 'string',
                    },
                    createdBefore: {
                        description: 'Filter by creation date before this ISO timestamp (optional).',
                        type: 'string',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected createInvocation(params: FileIntentListParams): ToolInvocation<FileIntentListParams, ToolResult> {
        return new FileIntentListInvocation(params);
    }
}
