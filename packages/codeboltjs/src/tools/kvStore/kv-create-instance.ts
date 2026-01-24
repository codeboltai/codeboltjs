import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import kvStore from '../../modules/kvStore';

export interface CreateKVInstanceParams {
    name: string;
    description?: string;
    explanation?: string;
}

class CreateKVInstanceInvocation extends BaseToolInvocation<CreateKVInstanceParams, ToolResult> {
    constructor(params: CreateKVInstanceParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await kvStore.createInstance(this.params.name, this.params.description);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const instance = response.data;
            const content = `KV store instance created: ${instance?.id || this.params.name}`;
            return { llmContent: content, returnDisplay: content };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class CreateKVInstanceTool extends BaseDeclarativeTool<CreateKVInstanceParams, ToolResult> {
    constructor() {
        super('kvStore_createInstance', 'Create KV Store Instance', 'Create a new KV store instance', Kind.Other, {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Instance name' },
                description: { type: 'string', description: 'Instance description' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['name'],
        });
    }

    protected override createInvocation(params: CreateKVInstanceParams): ToolInvocation<CreateKVInstanceParams, ToolResult> {
        return new CreateKVInstanceInvocation(params);
    }
}
