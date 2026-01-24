import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import kvStore from '../../modules/kvStore';

export interface KVGetParams {
    instanceId: string;
    namespace: string;
    key: string;
    explanation?: string;
}

class KVGetInvocation extends BaseToolInvocation<KVGetParams, ToolResult> {
    constructor(params: KVGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await kvStore.get(this.params.instanceId, this.params.namespace, this.params.key);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const value = response.data?.value !== undefined ? JSON.stringify(response.data.value, null, 2) : 'undefined';
            const content = `Value for "${this.params.key}":\n${value}`;
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

export class KVGetTool extends BaseDeclarativeTool<KVGetParams, ToolResult> {
    constructor() {
        super('kvStore_get', 'Get KV Store Value', 'Get a value from the KV store', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                namespace: { type: 'string', description: 'Namespace' },
                key: { type: 'string', description: 'Key' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['instanceId', 'namespace', 'key'],
        });
    }

    protected override createInvocation(params: KVGetParams): ToolInvocation<KVGetParams, ToolResult> {
        return new KVGetInvocation(params);
    }
}
