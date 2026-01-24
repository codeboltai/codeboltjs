/**
 * File Intent Get By Agent Tool - Gets all intents claimed by a specific agent
 * Wraps the SDK's fileUpdateIntentService.getByAgent() method
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import fileUpdateIntentService from '../../modules/fileUpdateIntent';

export interface FileIntentGetByAgentParams {
    /** Agent ID to get intents for */
    agentId: string;
}

class FileIntentGetByAgentInvocation extends BaseToolInvocation<FileIntentGetByAgentParams, ToolResult> {
    constructor(params: FileIntentGetByAgentParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const intents = await fileUpdateIntentService.getByAgent(this.params.agentId);

            if (!intents || intents.length === 0) {
                return {
                    llmContent: `No file update intents found for agent: ${this.params.agentId}`,
                    returnDisplay: 'No intents found for agent',
                };
            }

            let output = `File Update Intents for Agent: ${this.params.agentId}`;
            output += `\nCount: ${intents.length}`;

            for (const intent of intents) {
                output += `\n\n---\nIntent: ${intent.id}`;
                output += `\n  Environment: ${intent.environmentId}`;
                output += `\n  Description: ${intent.description}`;
                output += `\n  Files: ${intent.files.map(f => f.filePath).join(', ')}`;
                output += `\n  Priority: ${intent.priority}`;
                output += `\n  Status: ${intent.status}`;
                output += `\n  Created: ${intent.createdAt}`;
            }

            return {
                llmContent: output,
                returnDisplay: `${intents.length} intent(s) for agent ${this.params.agentId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting intents by agent: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

export class FileIntentGetByAgentTool extends BaseDeclarativeTool<FileIntentGetByAgentParams, ToolResult> {
    static readonly Name: string = 'file_intent_get_by_agent';

    constructor() {
        super(
            FileIntentGetByAgentTool.Name,
            'FileIntentGetByAgent',
            'Gets all file update intents claimed by a specific agent, useful for seeing what files an agent has reserved.',
            Kind.Read,
            {
                properties: {
                    agentId: {
                        description: 'The agent ID to get intents for.',
                        type: 'string',
                    },
                },
                required: ['agentId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(params: FileIntentGetByAgentParams): string | null {
        if (!params.agentId || params.agentId.trim() === '') {
            return "'agentId' is required";
        }
        return null;
    }

    protected createInvocation(params: FileIntentGetByAgentParams): ToolInvocation<FileIntentGetByAgentParams, ToolResult> {
        return new FileIntentGetByAgentInvocation(params);
    }
}
