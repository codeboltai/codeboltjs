import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import persistentMemory from '../../modules/persistentMemory';
import type { CreatePersistentMemoryParams } from '../../types/persistentMemory';

export interface PersistentMemoryValidateParams {
    memory: CreatePersistentMemoryParams;
}

class PersistentMemoryValidateInvocation extends BaseToolInvocation<PersistentMemoryValidateParams, ToolResult> {
    constructor(params: PersistentMemoryValidateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await persistentMemory.validate(this.params.memory);
            if (!response.success) {
                return {
                    llmContent: `Validation failed: ${response.error}`,
                    returnDisplay: `Validation failed: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Memory configuration validated successfully: ${JSON.stringify(response.data)}`,
                returnDisplay: `Memory configuration is valid`,
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

export class PersistentMemoryValidateTool extends BaseDeclarativeTool<PersistentMemoryValidateParams, ToolResult> {
    constructor() {
        super('persistent_memory_validate', 'Validate Memory Configuration', 'Validate a memory configuration', Kind.Other, {
            type: 'object',
            properties: {
                memory: { 
                    type: 'object',
                    description: 'Memory configuration to validate',
                },
            },
            required: ['memory'],
        });
    }

    protected override createInvocation(params: PersistentMemoryValidateParams): ToolInvocation<PersistentMemoryValidateParams, ToolResult> {
        return new PersistentMemoryValidateInvocation(params);
    }
}
