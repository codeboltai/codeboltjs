import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';

export interface PersistentMemoryGetStepSpecsParams {
    // No parameters needed
}

class PersistentMemoryGetStepSpecsInvocation extends BaseToolInvocation<PersistentMemoryGetStepSpecsParams, ToolResult> {
    constructor(params: PersistentMemoryGetStepSpecsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await persistentMemory.getStepSpecs();
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Step specifications retrieved: ${JSON.stringify(response.data)}`,
                returnDisplay: `Retrieved step specifications`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class PersistentMemoryGetStepSpecsTool extends BaseDeclarativeTool<PersistentMemoryGetStepSpecsParams, ToolResult> {
    constructor() {
        super('persistent_memory_get_step_specs', 'Get Step Specifications', 'Get available step specifications', Kind.Other, {
            type: 'object',
            properties: {},
            required: [],
        });
    }

    protected override createInvocation(params: PersistentMemoryGetStepSpecsParams): ToolInvocation<PersistentMemoryGetStepSpecsParams, ToolResult> {
        return new PersistentMemoryGetStepSpecsInvocation(params);
    }
}
