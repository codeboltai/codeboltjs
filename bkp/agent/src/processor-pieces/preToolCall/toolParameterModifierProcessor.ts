import { BaseProcessor, ProcessorInput, ProcessorOutput } from '../../processor';

export interface ToolParameterModificationInfo {
    toolName: string;
    originalParameters: any;
    modifiedParameters: any;
    modificationsApplied: string[];
    transformationsApplied: string[];
}

export interface ParameterTransformation {
    name: string;
    condition?: (toolName: string, params: any) => boolean;
    transform: (params: any, context?: Record<string, any>) => any;
    description?: string;
}

export interface ToolParameterModifierProcessorOptions {
    enableParameterTransformation?: boolean;
    enableParameterEnrichment?: boolean;
    enableParameterSanitization?: boolean;
    transformations?: ParameterTransformation[];
    defaultTransformations?: boolean;
    enableLogging?: boolean;
}

/**
 * Processor that modifies tool parameters before execution, applying transformations,
 * enrichments, and sanitization to improve tool execution.
 */
export class ToolParameterModifierProcessor extends BaseProcessor {
    private readonly enableParameterTransformation: boolean;
    private readonly enableParameterEnrichment: boolean;
    private readonly enableParameterSanitization: boolean;
    private readonly transformations: ParameterTransformation[];
    private readonly enableLogging: boolean;

    constructor(options: ToolParameterModifierProcessorOptions = {}) {
        super(options);
        this.enableParameterTransformation = options.enableParameterTransformation !== false;
        this.enableParameterEnrichment = options.enableParameterEnrichment !== false;
        this.enableParameterSanitization = options.enableParameterSanitization !== false;
        this.enableLogging = options.enableLogging !== false;
        
        this.transformations = [
            ...(options.transformations || []),
            ...(options.defaultTransformations !== false ? this.getDefaultTransformations() : [])
        ];
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            // Check if this is a pre-tool call processing
            if (!context?.preToolCallProcessing) {
                return [this.createEvent('ToolParameterModificationSkipped', {
                    reason: 'Not a pre-tool call processing context'
                })];
            }

            const toolName = context.toolName as string;
            const originalParameters = context.toolInput;
            const toolUseId = context.toolUseId as string;

            // Apply parameter modifications
            const modificationResult = await this.modifyParameters(toolName, originalParameters, context);

            if (modificationResult.modificationsApplied.length === 0) {
                return [this.createEvent('ToolParameterModificationSkipped', {
                    toolName,
                    reason: 'No modifications needed'
                })];
            }

            // Return modification results
            return [
                this.createEvent('ToolParametersModified', modificationResult),
                this.createEvent('ToolModified', {
                    toolName,
                    toolInput: modificationResult.modifiedParameters,
                    originalInput: originalParameters,
                    modifications: modificationResult.modificationsApplied
                })
            ];

        } catch (error) {
            console.error('Error in ToolParameterModifierProcessor:', error);
            return [this.createEvent('ToolParameterModificationError', {
                error: error instanceof Error ? error.message : String(error),
                toolName: input.context?.toolName
            })];
        }
    }

    private async modifyParameters(
        toolName: string, 
        originalParameters: any, 
        context: Record<string, any>
    ): Promise<ToolParameterModificationInfo> {
        let modifiedParameters = this.deepClone(originalParameters);
        const modificationsApplied: string[] = [];
        const transformationsApplied: string[] = [];

        // Apply sanitization
        if (this.enableParameterSanitization) {
            const sanitized = this.sanitizeParameters(toolName, modifiedParameters);
            if (sanitized.modified) {
                modifiedParameters = sanitized.parameters;
                modificationsApplied.push('sanitization');
            }
        }

        // Apply enrichment
        if (this.enableParameterEnrichment) {
            const enriched = await this.enrichParameters(toolName, modifiedParameters, context);
            if (enriched.modified) {
                modifiedParameters = enriched.parameters;
                modificationsApplied.push('enrichment');
            }
        }

        // Apply transformations
        if (this.enableParameterTransformation) {
            for (const transformation of this.transformations) {
                try {
                    // Check if transformation condition is met
                    if (transformation.condition && !transformation.condition(toolName, modifiedParameters)) {
                        continue;
                    }

                    const beforeTransform = this.deepClone(modifiedParameters);
                    modifiedParameters = transformation.transform(modifiedParameters, context);
                    
                    // Check if transformation actually changed something
                    if (JSON.stringify(beforeTransform) !== JSON.stringify(modifiedParameters)) {
                        transformationsApplied.push(transformation.name);
                        modificationsApplied.push(`transformation:${transformation.name}`);
                        
                        if (this.enableLogging) {
                            console.log(`[ToolParameterModifier] Applied transformation '${transformation.name}' to tool '${toolName}'`);
                        }
                    }
                } catch (error) {
                    if (this.enableLogging) {
                        console.error(`[ToolParameterModifier] Error applying transformation '${transformation.name}':`, error);
                    }
                }
            }
        }

        return {
            toolName,
            originalParameters,
            modifiedParameters,
            modificationsApplied,
            transformationsApplied
        };
    }

    private sanitizeParameters(toolName: string, parameters: any): { parameters: any; modified: boolean } {
        if (!parameters || typeof parameters !== 'object') {
            return { parameters, modified: false };
        }

        let modified = false;
        const sanitized = this.deepClone(parameters);

        // Sanitize string parameters
        for (const [key, value] of Object.entries(sanitized)) {
            if (typeof value === 'string') {
                const originalValue = value;
                let sanitizedValue = value;

                // Remove potentially dangerous characters
                sanitizedValue = sanitizedValue.replace(/[<>\"'&]/g, '');
                
                // Trim whitespace
                sanitizedValue = sanitizedValue.trim();
                
                // Remove null bytes
                sanitizedValue = sanitizedValue.replace(/\0/g, '');

                if (sanitizedValue !== originalValue) {
                    sanitized[key] = sanitizedValue;
                    modified = true;
                }
            }
        }

        // Tool-specific sanitization
        if (toolName.includes('file') || toolName.includes('path')) {
            const pathFields = ['filePath', 'path', 'file', 'directory'];
            for (const field of pathFields) {
                if (field in sanitized && typeof sanitized[field] === 'string') {
                    const originalPath = sanitized[field];
                    let sanitizedPath = originalPath;

                    // Normalize path separators
                    sanitizedPath = sanitizedPath.replace(/\\/g, '/');
                    
                    // Remove dangerous path components
                    sanitizedPath = sanitizedPath.replace(/\.\.\/|\.\.\\+/g, '');
                    
                    // Remove multiple slashes
                    sanitizedPath = sanitizedPath.replace(/\/+/g, '/');

                    if (sanitizedPath !== originalPath) {
                        sanitized[field] = sanitizedPath;
                        modified = true;
                    }
                }
            }
        }

        return { parameters: sanitized, modified };
    }

    private async enrichParameters(
        toolName: string, 
        parameters: any, 
        context: Record<string, any>
    ): Promise<{ parameters: any; modified: boolean }> {
        if (!parameters || typeof parameters !== 'object') {
            return { parameters, modified: false };
        }

        let modified = false;
        const enriched = this.deepClone(parameters);

        // Add timestamp if not present
        if (!enriched.timestamp) {
            enriched.timestamp = new Date().toISOString();
            modified = true;
        }

        // Add execution context
        if (!enriched.executionContext) {
            enriched.executionContext = {
                toolName,
                sessionId: context.sessionId || 'unknown',
                requestId: context.toolUseId || 'unknown'
            };
            modified = true;
        }

        // Tool-specific enrichment
        switch (toolName) {
            case 'file_read':
            case 'file_write':
                if (!enriched.encoding && !enriched.hasOwnProperty('encoding')) {
                    enriched.encoding = 'utf-8';
                    modified = true;
                }
                break;

            case 'http_request':
                if (!enriched.timeout) {
                    enriched.timeout = 30000; // 30 seconds
                    modified = true;
                }
                if (!enriched.headers) {
                    enriched.headers = {
                        'User-Agent': 'UnifiedAgent/1.0'
                    };
                    modified = true;
                }
                break;

            case 'database_query':
                if (!enriched.timeout) {
                    enriched.timeout = 60000; // 60 seconds
                    modified = true;
                }
                break;
        }

        // Add retry configuration if not present for network operations
        if (toolName.includes('http') || toolName.includes('api') || toolName.includes('request')) {
            if (!enriched.retryConfig) {
                enriched.retryConfig = {
                    maxRetries: 3,
                    retryDelay: 1000
                };
                modified = true;
            }
        }

        return { parameters: enriched, modified };
    }

    private getDefaultTransformations(): ParameterTransformation[] {
        return [
            {
                name: 'normalize-file-paths',
                condition: (toolName) => toolName.includes('file') || toolName.includes('path'),
                transform: (params) => {
                    const result = { ...params };
                    const pathFields = ['filePath', 'path', 'file', 'directory'];
                    
                    for (const field of pathFields) {
                        if (field in result && typeof result[field] === 'string') {
                            // Normalize path separators and resolve relative paths
                            result[field] = result[field].replace(/\\/g, '/');
                            
                            // Convert relative paths to absolute if they don't start with /
                            if (!result[field].startsWith('/') && !result[field].match(/^[a-zA-Z]:/)) {
                                result[field] = `./${result[field]}`;
                            }
                        }
                    }
                    
                    return result;
                },
                description: 'Normalize file paths for consistency'
            },
            {
                name: 'add-default-headers',
                condition: (toolName) => toolName.includes('http') || toolName.includes('api'),
                transform: (params) => {
                    const result = { ...params };
                    
                    if (!result.headers) {
                        result.headers = {};
                    }
                    
                    // Add default headers if not present
                    if (!result.headers['Content-Type'] && (result.body || result.data)) {
                        result.headers['Content-Type'] = 'application/json';
                    }
                    
                    if (!result.headers['Accept']) {
                        result.headers['Accept'] = 'application/json';
                    }
                    
                    return result;
                },
                description: 'Add default HTTP headers'
            },
            {
                name: 'validate-and-format-json',
                condition: (toolName, params) => {
                    return params && (params.json || params.data) && typeof params.data === 'string';
                },
                transform: (params) => {
                    const result = { ...params };
                    
                    try {
                        // Try to parse and reformat JSON
                        if (result.data && typeof result.data === 'string') {
                            const parsed = JSON.parse(result.data);
                            result.data = JSON.stringify(parsed, null, 2);
                        }
                        
                        if (result.json && typeof result.json === 'string') {
                            const parsed = JSON.parse(result.json);
                            result.json = JSON.stringify(parsed, null, 2);
                        }
                    } catch (error) {
                        // If JSON is invalid, leave it as is
                    }
                    
                    return result;
                },
                description: 'Validate and format JSON parameters'
            },
            {
                name: 'add-safety-limits',
                condition: () => true,
                transform: (params) => {
                    const result = { ...params };
                    
                    // Add timeout if not present
                    if (!result.timeout) {
                        result.timeout = 30000; // 30 seconds default
                    }
                    
                    // Add size limits for file operations
                    if (!result.maxSize && (result.filePath || result.path)) {
                        result.maxSize = 10 * 1024 * 1024; // 10MB
                    }
                    
                    return result;
                },
                description: 'Add safety limits to prevent resource exhaustion'
            },
            {
                name: 'convert-relative-urls',
                condition: (toolName) => toolName.includes('http') || toolName.includes('url'),
                transform: (params) => {
                    const result = { ...params };
                    
                    if (result.url && typeof result.url === 'string') {
                        // Convert relative URLs to absolute if a base URL is available
                        if (result.url.startsWith('/') && result.baseUrl) {
                            result.url = result.baseUrl.replace(/\/$/, '') + result.url;
                        }
                        
                        // Ensure protocol is present
                        if (!result.url.match(/^https?:\/\//)) {
                            result.url = 'https://' + result.url;
                        }
                    }
                    
                    return result;
                },
                description: 'Convert relative URLs to absolute URLs'
            }
        ];
    }

    private deepClone(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        const cloned: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        
        return cloned;
    }

    // Public methods for transformation management
    addTransformation(transformation: ParameterTransformation): void {
        this.transformations.push(transformation);
        if (this.enableLogging) {
            console.log(`[ToolParameterModifier] Added transformation: ${transformation.name}`);
        }
    }

    removeTransformation(name: string): boolean {
        const index = this.transformations.findIndex(t => t.name === name);
        if (index > -1) {
            this.transformations.splice(index, 1);
            if (this.enableLogging) {
                console.log(`[ToolParameterModifier] Removed transformation: ${name}`);
            }
            return true;
        }
        return false;
    }

    getTransformations(): string[] {
        return this.transformations.map(t => t.name);
    }

    hasTransformation(name: string): boolean {
        return this.transformations.some(t => t.name === name);
    }
}
