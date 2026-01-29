/**
 * Tool Validation Modifier
 * Pre-Tool Call processor for validating tool parameters before execution
 */

import { BasePreToolCallProcessor } from '../base/basePreToolCallProcessor';
import {
    PreToolCallProcessorInput,
    PreToolCallProcessorOutput,
    ToolValidationRule,
    ProcessedMessage
} from '@codebolt/types/agent';

export interface ToolValidationModifierOptions {
    validationRules: ToolValidationRule[];
    strictMode?: boolean;
    allowPartialValidation?: boolean;
}

export class ToolValidationModifier extends BasePreToolCallProcessor {
    private options: ToolValidationModifierOptions;

    constructor(options: ToolValidationModifierOptions) {
        super();
        this.options = {
            strictMode: false,
            allowPartialValidation: true,
            ...options
        };
    }

    async modify(input: PreToolCallProcessorInput): Promise<PreToolCallProcessorOutput> {
        // For now, pass through unchanged since we need to understand the exact structure
        // TODO: Implement tool validation logic once we understand the message format

        // Add metadata to track that this processor was applied
        const modifiedNextPrompt: ProcessedMessage = {
            ...input.nextPrompt,
            metadata: {
                ...input.nextPrompt.metadata,
                validatedBy: 'ToolValidationModifier',
                validatedAt: new Date().toISOString(),
                validationMode: this.options.strictMode ? 'strict' : 'lenient'
            }
        };

        return {
            nextPrompt: modifiedNextPrompt,
            shouldExit: false
        };
    }
}