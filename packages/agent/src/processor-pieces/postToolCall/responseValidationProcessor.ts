import { BaseProcessor, ProcessorInput, ProcessorOutput } from '../../processor';

export interface ResponseValidationProcessorOptions {
    validateToolCalls?: boolean;
    validateContent?: boolean;
    validateStructure?: boolean;
    allowEmptyContent?: boolean;
    maxContentLength?: number;
    requiredFields?: string[];
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    fixes: string[];
}

export class ResponseValidationProcessor extends BaseProcessor {
    private readonly enableToolCallValidation: boolean;
    private readonly validateContent: boolean;
    private readonly validateStructure: boolean;
    private readonly allowEmptyContent: boolean;
    private readonly maxContentLength: number;
    private readonly requiredFields: string[];

    constructor(options: ResponseValidationProcessorOptions = {}) {
        super();
        this.enableToolCallValidation = options.validateToolCalls !== false;
        this.validateContent = options.validateContent !== false;
        this.validateStructure = options.validateStructure !== false;
        this.allowEmptyContent = options.allowEmptyContent || false;
        this.maxContentLength = options.maxContentLength || 100000;
        this.requiredFields = options.requiredFields || ['role'];
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        const { message } = input;
        
        const validationResult = this.validateMessage(message);
        
        const results: ProcessorOutput[] = [
            this.createEvent('ValidationCompleted', {
                result: validationResult,
                messageId: message.metadata?.id || 'unknown'
            })
        ];

        if (!validationResult.isValid) {
            results.push(this.createEvent('ValidationFailed', {
                errors: validationResult.errors,
                warnings: validationResult.warnings,
                fixes: validationResult.fixes
            }));
        }

        if (validationResult.warnings.length > 0) {
            results.push(this.createEvent('ValidationWarnings', {
                warnings: validationResult.warnings
            }));
        }

        return results;
    }

    private validateMessage(message: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const fixes: string[] = [];

        // Structure validation
        if (this.validateStructure) {
            const structureValidation = this.validateMessageStructure(message);
            errors.push(...structureValidation.errors);
            warnings.push(...structureValidation.warnings);
            fixes.push(...structureValidation.fixes);
        }

        // Content validation
        if (this.validateContent && message.messages) {
            for (let i = 0; i < message.messages.length; i++) {
                const msg = message.messages[i];
                const contentValidation = this.validateMessageContent(msg, i);
                errors.push(...contentValidation.errors);
                warnings.push(...contentValidation.warnings);
                fixes.push(...contentValidation.fixes);
            }
        }

        // Tool calls validation
        if (this.enableToolCallValidation && message.messages) {
            for (let i = 0; i < message.messages.length; i++) {
                const msg = message.messages[i];
                if (msg.tool_calls) {
                    const toolValidation = this.validateToolCallsInMessage(msg.tool_calls, i);
                    errors.push(...toolValidation.errors);
                    warnings.push(...toolValidation.warnings);
                    fixes.push(...toolValidation.fixes);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            fixes
        };
    }

    private validateMessageStructure(message: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const fixes: string[] = [];

        // Check if message exists
        if (!message) {
            errors.push('Message is null or undefined');
            fixes.push('Provide a valid message object');
            return { isValid: false, errors, warnings, fixes };
        }

        // Check if messages array exists
        if (!message.messages) {
            errors.push('Message object missing required "messages" array');
            fixes.push('Add a "messages" array to the message object');
        } else if (!Array.isArray(message.messages)) {
            errors.push('Messages field must be an array');
            fixes.push('Convert messages field to an array');
        } else if (message.messages.length === 0) {
            warnings.push('Messages array is empty');
        }

        // Check metadata structure
        if (message.metadata && typeof message.metadata !== 'object') {
            warnings.push('Metadata should be an object');
            fixes.push('Convert metadata to an object or remove it');
        }

        return { isValid: errors.length === 0, errors, warnings, fixes };
    }

    private validateMessageContent(msg: any, index: number): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const fixes: string[] = [];

        // Check required fields
        for (const field of this.requiredFields) {
            if (!(field in msg)) {
                errors.push(`Message at index ${index} missing required field: ${field}`);
                fixes.push(`Add ${field} field to message at index ${index}`);
            }
        }

        // Validate role
        if (msg.role) {
            const validRoles = ['user', 'assistant', 'system', 'tool'];
            if (!validRoles.includes(msg.role)) {
                errors.push(`Invalid role "${msg.role}" at index ${index}. Must be one of: ${validRoles.join(', ')}`);
                fixes.push(`Change role to one of: ${validRoles.join(', ')}`);
            }
        }

        // Validate content
        if (msg.content !== undefined) {
            if (typeof msg.content === 'string') {
                // String content validation
                if (!this.allowEmptyContent && msg.content.trim() === '') {
                    warnings.push(`Empty content in message at index ${index}`);
                    fixes.push('Provide meaningful content or remove the message');
                }
                
                if (msg.content.length > this.maxContentLength) {
                    warnings.push(`Content too long at index ${index}: ${msg.content.length} chars (max: ${this.maxContentLength})`);
                    fixes.push('Truncate or compress the content');
                }
            } else if (Array.isArray(msg.content)) {
                // Array content validation (for multimodal messages)
                for (let partIndex = 0; partIndex < msg.content.length; partIndex++) {
                    const part = msg.content[partIndex];
                    if (!part || (typeof part !== 'object' && typeof part !== 'string')) {
                        errors.push(`Invalid content part at message ${index}, part ${partIndex}`);
                        fixes.push('Ensure all content parts are valid objects or strings');
                    }
                }
            } else if (typeof msg.content !== 'object') {
                warnings.push(`Unexpected content type at index ${index}: ${typeof msg.content}`);
            }
        }

        // Validate name field
        if (msg.name && typeof msg.name !== 'string') {
            warnings.push(`Name field should be a string at index ${index}`);
            fixes.push('Convert name field to string');
        }

        return { isValid: errors.length === 0, errors, warnings, fixes };
    }

    private validateToolCallsInMessage(toolCalls: any[], messageIndex: number): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const fixes: string[] = [];

        if (!Array.isArray(toolCalls)) {
            errors.push(`Tool calls must be an array at message index ${messageIndex}`);
            fixes.push('Convert tool_calls to an array');
            return { isValid: false, errors, warnings, fixes };
        }

        for (let i = 0; i < toolCalls.length; i++) {
            const toolCall = toolCalls[i];
            
            // Check required tool call fields
            if (!toolCall.id) {
                errors.push(`Tool call at message ${messageIndex}, call ${i} missing required "id" field`);
                fixes.push('Add unique id to tool call');
            }

            if (!toolCall.function) {
                errors.push(`Tool call at message ${messageIndex}, call ${i} missing required "function" field`);
                fixes.push('Add function object to tool call');
            } else {
                // Validate function object
                if (!toolCall.function.name) {
                    errors.push(`Tool call function at message ${messageIndex}, call ${i} missing "name" field`);
                    fixes.push('Add function name to tool call');
                }

                if (toolCall.function.arguments === undefined) {
                    warnings.push(`Tool call function at message ${messageIndex}, call ${i} missing "arguments" field`);
                    fixes.push('Add arguments field (can be empty object)');
                } else {
                    // Validate arguments
                    if (typeof toolCall.function.arguments === 'string') {
                        try {
                            JSON.parse(toolCall.function.arguments);
                        } catch (e) {
                            errors.push(`Invalid JSON in tool call arguments at message ${messageIndex}, call ${i}`);
                            fixes.push('Ensure arguments are valid JSON string or object');
                        }
                    } else if (typeof toolCall.function.arguments !== 'object') {
                        warnings.push(`Tool call arguments should be object or JSON string at message ${messageIndex}, call ${i}`);
                    }
                }
            }
        }

        return { isValid: errors.length === 0, errors, warnings, fixes };
    }

    // Utility method to get validation summary
    getValidationSummary(validationResult: ValidationResult): string {
        const summary = [];
        
        if (validationResult.isValid) {
            summary.push('✅ Validation passed');
        } else {
            summary.push('❌ Validation failed');
        }

        if (validationResult.errors.length > 0) {
            summary.push(`${validationResult.errors.length} error(s)`);
        }

        if (validationResult.warnings.length > 0) {
            summary.push(`${validationResult.warnings.length} warning(s)`);
        }

        return summary.join(' - ');
    }
}
