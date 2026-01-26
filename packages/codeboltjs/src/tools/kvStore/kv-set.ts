import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import kvStore from '../../modules/kvStore';

export interface KVSetParams {
    instanceId: string;
    namespace: string;
    key: string;
    value: any;
    autoCreateInstance?: boolean;
    explanation?: string;
}

class KVSetInvocation extends BaseToolInvocation<KVSetParams, ToolResult> {
    constructor(params: KVSetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await kvStore.set(
                this.params.instanceId,
                this.params.namespace,
                this.params.key,
                this.params.value,
                this.params.autoCreateInstance ?? false
            );

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: { message: errorMsg, type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Value set for key "${this.params.key}" in namespace "${this.params.namespace}"`;
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

export class KVSetTool extends BaseDeclarativeTool<KVSetParams, ToolResult> {
    constructor() {
        super('kvStore_set', 'Set KV Store Value', 'Set a value in the KV store', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                namespace: { type: 'string', description: 'Namespace' },
                key: { type: 'string', description: 'Key' },
                value: { description: 'Value to store' },
                autoCreateInstance: { type: 'boolean', description: 'Auto-create instance' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['instanceId', 'namespace', 'key', 'value'],
        });
    }

    protected override createInvocation(params: KVSetParams): ToolInvocation<KVSetParams, ToolResult> {
        return new KVSetInvocation(params);
    }
}
