import { BaseProcessor, ProcessorInput, ProcessorOutput } from '../../processor';

export interface ToolValidationInfo {
    toolName: string;
    isValid: boolean;
    validationErrors: string[];
    validationWarnings: string[];
    parameterValidation: {
        required: string[];
        missing: string[];
        invalid: string[];
    };
    securityChecks: {
        passed: boolean;
        issues: string[];
    };
}

export interface ToolValidationProcessorOptions {
    enableParameterValidation?: boolean;
    enableSecurityValidation?: boolean;
    enableTypeValidation?: boolean;
    strictMode?: boolean;
    allowedTools?: string[];
    blockedTools?: string[];
    maxParameterSize?: number;
    enableLogging?: boolean;
}

/**
 * Processor that validates tool calls before execution, checking parameters,
 * security constraints, and tool availability.
 */
export class ToolValidationProcessor extends BaseProcessor {
    private readonly enableParameterValidation: boolean;
    private readonly enableSecurityValidation: boolean;
    private readonly enableTypeValidation: boolean;
    private readonly strictMode: boolean;
    private readonly allowedTools: Set<string>;
    private readonly blockedTools: Set<string>;
    private readonly maxParameterSize: number;
    private readonly enableLogging: boolean;

    constructor(options: ToolValidationProcessorOptions = {}) {
        super(options);
        this.enableParameterValidation = options.enableParameterValidation !== false;
        this.enableSecurityValidation = options.enableSecurityValidation !== false;
        this.enableTypeValidation = options.enableTypeValidation !== false;
        this.strictMode = options.strictMode || false;
        this.allowedTools = new Set(options.allowedTools || []);
        this.blockedTools = new Set(options.blockedTools || []);
        this.maxParameterSize = options.maxParameterSize || 1024 * 1024; // 1MB
        this.enableLogging = options.enableLogging !== false;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            // Check if this is a pre-tool call processing
            if (!context?.preToolCallProcessing) {
                return [this.createEvent('ToolValidationSkipped', {
                    reason: 'Not a pre-tool call processing context'
                })];
            }

            const toolName = context.toolName as string;
            const toolInput = context.toolInput;
            const toolUseId = context.toolUseId as string;

            // Perform validation
            const validationResult = await this.validateTool(toolName, toolInput, context);

            if (!validationResult.isValid) {
                // Tool validation failed - intercept and return error
                const errorMessage = this.formatValidationErrors(validationResult);
                
                return [
                    this.createEvent('ToolValidationFailed', validationResult),
                    this.createEvent('ToolIntercepted', {
                        result: errorMessage,
                        toolName,
                        userRejected: false,
                        validationFailed: true
                    })
                ];
            }

            // Validation passed
            return [
                this.createEvent('ToolValidationPassed', validationResult)
            ];

        } catch (error) {
            console.error('Error in ToolValidationProcessor:', error);
            return [this.createEvent('ToolValidationError', {
                error: error instanceof Error ? error.message : String(error),
                toolName: input.context?.toolName
            })];
        }
    }

    private async validateTool(toolName: string, toolInput: any, context: Record<string, any>): Promise<ToolValidationInfo> {
        const validationResult: ToolValidationInfo = {
            toolName,
            isValid: true,
            validationErrors: [],
            validationWarnings: [],
            parameterValidation: {
                required: [],
                missing: [],
                invalid: []
            },
            securityChecks: {
                passed: true,
                issues: []
            }
        };

        // Tool availability validation
        if (!this.validateToolAvailability(toolName, validationResult)) {
            validationResult.isValid = false;
        }

        // Parameter validation
        if (this.enableParameterValidation) {
            if (!this.validateParameters(toolName, toolInput, validationResult)) {
                validationResult.isValid = false;
            }
        }

        // Security validation
        if (this.enableSecurityValidation) {
            if (!this.validateSecurity(toolName, toolInput, validationResult)) {
                validationResult.isValid = false;
            }
        }

        // Type validation
        if (this.enableTypeValidation) {
            if (!this.validateTypes(toolName, toolInput, validationResult)) {
                validationResult.isValid = false;
            }
        }

        // Size validation
        if (!this.validateSize(toolInput, validationResult)) {
            validationResult.isValid = false;
        }

        return validationResult;
    }

    private validateToolAvailability(toolName: string, result: ToolValidationInfo): boolean {
        let isValid = true;

        // Check if tool is explicitly blocked
        if (this.blockedTools.has(toolName)) {
            result.validationErrors.push(`Tool '${toolName}' is blocked and cannot be executed`);
            isValid = false;
        }

        // Check if tool is in allowed list (if allowlist is configured)
        if (this.allowedTools.size > 0 && !this.allowedTools.has(toolName)) {
            result.validationErrors.push(`Tool '${toolName}' is not in the allowed tools list`);
            isValid = false;
        }

        // Check for dangerous tool patterns
        const dangerousPatterns = [
            /^(rm|del|delete)$/i,
            /^(format|fdisk)$/i,
            /^(sudo|su)$/i,
            /^(chmod|chown).*777/i,
            /eval|exec|system/i
        ];

        if (dangerousPatterns.some(pattern => pattern.test(toolName))) {
            result.validationWarnings.push(`Tool '${toolName}' matches potentially dangerous pattern`);
            if (this.strictMode) {
                result.validationErrors.push(`Tool '${toolName}' is considered dangerous in strict mode`);
                isValid = false;
            }
        }

        return isValid;
    }

    private validateParameters(toolName: string, toolInput: any, result: ToolValidationInfo): boolean {
        let isValid = true;

        // Get expected parameters for known tools
        const expectedParams = this.getExpectedParameters(toolName);
        
        if (expectedParams) {
            result.parameterValidation.required = expectedParams.required || [];
            
            // Check required parameters
            for (const requiredParam of expectedParams.required || []) {
                if (!toolInput || !(requiredParam in toolInput)) {
                    result.parameterValidation.missing.push(requiredParam);
                    result.validationErrors.push(`Required parameter '${requiredParam}' is missing for tool '${toolName}'`);
                    isValid = false;
                }
            }

            // Check parameter types
            if (expectedParams.types && toolInput) {
                for (const [paramName, expectedType] of Object.entries(expectedParams.types)) {
                    if (paramName in toolInput) {
                        const actualType = typeof toolInput[paramName];
                        if (actualType !== expectedType) {
                            result.parameterValidation.invalid.push(paramName);
                            result.validationErrors.push(
                                `Parameter '${paramName}' should be of type '${expectedType}' but got '${actualType}'`
                            );
                            isValid = false;
                        }
                    }
                }
            }

            // Check for unexpected parameters in strict mode
            if (this.strictMode && expectedParams.allowed && toolInput) {
                for (const paramName of Object.keys(toolInput)) {
                    if (!expectedParams.allowed.includes(paramName)) {
                        result.validationWarnings.push(`Unexpected parameter '${paramName}' for tool '${toolName}'`);
                    }
                }
            }
        }

        return isValid;
    }

    private validateSecurity(toolName: string, toolInput: any, result: ToolValidationInfo): boolean {
        let isValid = true;

        // Check for injection patterns in parameters
        if (toolInput && typeof toolInput === 'object') {
            for (const [key, value] of Object.entries(toolInput)) {
                if (typeof value === 'string') {
                    // SQL injection patterns
                    const sqlInjectionPatterns = [
                        /('|\\'|;|\\;|--|\s*or\s+|union\s+select)/i,
                        /(drop\s+table|delete\s+from|insert\s+into)/i
                    ];

                    // Command injection patterns
                    const commandInjectionPatterns = [
                        /[;&|`$(){}[\]]/,
                        /(rm\s+-rf)|(sudo\s+)|(chmod\s+)/i
                    ];

                    // Path traversal patterns
                    const pathTraversalPatterns = [
                        /\.\.\//,
                        /\.\.\\/, // fixed: properly closed regex for Windows path traversal
                        /%2[eE]%2[eE]%2[fF]/i
                    ];

                    const allPatterns = [
                        ...sqlInjectionPatterns,
                        ...commandInjectionPatterns,
                        ...pathTraversalPatterns
                    ];

                    for (const pattern of allPatterns) {
                        if (pattern.test(value)) {
                            result.securityChecks.issues.push(
                                `Potential security issue in parameter '${key}': suspicious pattern detected`
                            );
                            result.securityChecks.passed = false;
                            
                            if (this.strictMode) {
                                result.validationErrors.push(
                                    `Security validation failed for parameter '${key}' in tool '${toolName}'`
                                );
                                isValid = false;
                            } else {
                                result.validationWarnings.push(
                                    `Security warning for parameter '${key}' in tool '${toolName}'`
                                );
                            }
                        }
                    }
                }
            }
        }

        // Check for sensitive file operations
        if (toolName.includes('file') || toolName.includes('read') || toolName.includes('write')) {
            const sensitiveFiles = [
                '/etc/passwd',
                '/etc/shadow',
                '~/.ssh/',
                '.env',
                'config.json',
                'secrets.json'
            ];

            const filePath = toolInput?.filePath || toolInput?.path || toolInput?.file;
            if (typeof filePath === 'string') {
                for (const sensitiveFile of sensitiveFiles) {
                    if (filePath.includes(sensitiveFile)) {
                        result.securityChecks.issues.push(
                            `Attempt to access sensitive file: ${filePath}`
                        );
                        result.securityChecks.passed = false;
                        
                        if (this.strictMode) {
                            result.validationErrors.push(
                                `Access to sensitive file '${filePath}' is not allowed`
                            );
                            isValid = false;
                        } else {
                            result.validationWarnings.push(
                                `Warning: accessing potentially sensitive file '${filePath}'`
                            );
                        }
                    }
                }
            }
        }

        return isValid;
    }

    private validateTypes(toolName: string, toolInput: any, result: ToolValidationInfo): boolean {
        let isValid = true;

        if (toolInput === null || toolInput === undefined) {
            if (this.strictMode) {
                result.validationErrors.push(`Tool input cannot be null or undefined for '${toolName}'`);
                isValid = false;
            }
            return isValid;
        }

        // Validate input is serializable
        try {
            JSON.stringify(toolInput);
        } catch (error) {
            result.validationErrors.push(`Tool input for '${toolName}' is not serializable`);
            isValid = false;
        }

        // Check for circular references
        if (typeof toolInput === 'object' && this.hasCircularReference(toolInput)) {
            result.validationErrors.push(`Tool input for '${toolName}' contains circular references`);
            isValid = false;
        }

        return isValid;
    }

    private validateSize(toolInput: any, result: ToolValidationInfo): boolean {
        try {
            const serialized = JSON.stringify(toolInput);
            const size = new Blob([serialized]).size;
            
            if (size > this.maxParameterSize) {
                result.validationErrors.push(
                    `Tool input size (${size} bytes) exceeds maximum allowed size (${this.maxParameterSize} bytes)`
                );
                return false;
            }
        } catch (error) {
            result.validationWarnings.push('Could not determine tool input size');
        }

        return true;
    }

    private getExpectedParameters(toolName: string): {
        required?: string[];
        optional?: string[];
        types?: Record<string, string>;
        allowed?: string[];
    } | null {
        // Define expected parameters for common tools
        const toolSchemas: Record<string, any> = {
            'file_read': {
                required: ['filePath'],
                types: { filePath: 'string' },
                allowed: ['filePath', 'encoding']
            },
            'file_write': {
                required: ['filePath', 'content'],
                types: { filePath: 'string', content: 'string' },
                allowed: ['filePath', 'content', 'encoding', 'append']
            },
            'execute_command': {
                required: ['command'],
                types: { command: 'string' },
                allowed: ['command', 'args', 'cwd', 'timeout']
            },
            'http_request': {
                required: ['url'],
                types: { url: 'string' },
                allowed: ['url', 'method', 'headers', 'body', 'timeout']
            },
            'database_query': {
                required: ['query'],
                types: { query: 'string' },
                allowed: ['query', 'parameters', 'database']
            }
        };

        return toolSchemas[toolName] || null;
    }

    private hasCircularReference(obj: any, seen = new WeakSet()): boolean {
        if (obj === null || typeof obj !== 'object') {
            return false;
        }

        if (seen.has(obj)) {
            return true;
        }

        seen.add(obj);

        for (const value of Object.values(obj)) {
            if (this.hasCircularReference(value, seen)) {
                return true;
            }
        }

        seen.delete(obj);
        return false;
    }

    private formatValidationErrors(result: ToolValidationInfo): string {
        const errors = result.validationErrors;
        const warnings = result.validationWarnings;
        
        let message = `Tool validation failed for '${result.toolName}':\n`;
        
        if (errors.length > 0) {
            message += '\nErrors:\n' + errors.map(error => `- ${error}`).join('\n');
        }
        
        if (warnings.length > 0) {
            message += '\nWarnings:\n' + warnings.map(warning => `- ${warning}`).join('\n');
        }

        if (result.parameterValidation.missing.length > 0) {
            message += `\nMissing required parameters: ${result.parameterValidation.missing.join(', ')}`;
        }

        if (result.securityChecks.issues.length > 0) {
            message += '\nSecurity issues:\n' + result.securityChecks.issues.map(issue => `- ${issue}`).join('\n');
        }

        return message;
    }

    // Public methods for configuration
    addAllowedTool(toolName: string): void {
        this.allowedTools.add(toolName);
        if (this.enableLogging) {
            console.log(`[ToolValidation] Added allowed tool: ${toolName}`);
        }
    }

    removeAllowedTool(toolName: string): boolean {
        const removed = this.allowedTools.delete(toolName);
        if (removed && this.enableLogging) {
            console.log(`[ToolValidation] Removed allowed tool: ${toolName}`);
        }
        return removed;
    }

    addBlockedTool(toolName: string): void {
        this.blockedTools.add(toolName);
        if (this.enableLogging) {
            console.log(`[ToolValidation] Added blocked tool: ${toolName}`);
        }
    }

    removeBlockedTool(toolName: string): boolean {
        const removed = this.blockedTools.delete(toolName);
        if (removed && this.enableLogging) {
            console.log(`[ToolValidation] Removed blocked tool: ${toolName}`);
        }
        return removed;
    }

    getAllowedTools(): string[] {
        return Array.from(this.allowedTools);
    }

    getBlockedTools(): string[] {
        return Array.from(this.blockedTools);
    }

    isToolAllowed(toolName: string): boolean {
        if (this.blockedTools.has(toolName)) {
            return false;
        }
        if (this.allowedTools.size > 0) {
            return this.allowedTools.has(toolName);
        }
        return true;
    }
}
