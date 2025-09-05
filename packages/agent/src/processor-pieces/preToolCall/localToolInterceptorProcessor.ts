import { BaseProcessor, ProcessorInput, ProcessorOutput, ProcessedMessage } from '../../processor';

export interface LocalToolInterceptorInfo {
    toolName: string;
    intercepted: boolean;
    executionMethod: 'local' | 'custom' | 'delegated';
    executionTime: number;
    result: string;
}

export interface LocalToolInterceptorProcessorOptions {
    localTools?: Map<string, LocalToolHandler>;
    enableCustomToolHandling?: boolean;
    enableToolDelegation?: boolean;
    defaultExecutionTimeout?: number;
    enableLogging?: boolean;
}

export interface LocalToolHandler {
    name: string;
    description?: string;
    execute: (params: any, context?: Record<string, any>) => Promise<string> | string;
    validate?: (params: any) => boolean;
    timeout?: number;
}

/**
 * Processor that intercepts specific tool calls and handles them locally
 * instead of sending them to external tool execution services.
 */
export class LocalToolInterceptorProcessor extends BaseProcessor {
    private readonly localTools: Map<string, LocalToolHandler>;
    private readonly enableCustomToolHandling: boolean;
    private readonly enableToolDelegation: boolean;
    private readonly defaultExecutionTimeout: number;
    private readonly enableLogging: boolean;

    constructor(options: LocalToolInterceptorProcessorOptions = {}) {
        super(options);
        this.localTools = options.localTools || new Map();
        this.enableCustomToolHandling = options.enableCustomToolHandling !== false;
        this.enableToolDelegation = options.enableToolDelegation !== false;
        this.defaultExecutionTimeout = options.defaultExecutionTimeout || 30000; // 30 seconds
        this.enableLogging = options.enableLogging !== false;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            // Check if this is a pre-tool call processing
            if (!context?.preToolCallProcessing) {
                return [this.createEvent('LocalToolInterceptionSkipped', {
                    reason: 'Not a pre-tool call processing context'
                })];
            }

            const toolName = context.toolName as string;
            const toolInput = context.toolInput;
            const toolUseId = context.toolUseId as string;

            // Check if we should intercept this tool
            const shouldIntercept = this.shouldInterceptTool(toolName, toolInput, context);
            
            if (!shouldIntercept) {
                return [this.createEvent('LocalToolInterceptionSkipped', {
                    toolName,
                    reason: 'Tool not configured for local interception'
                })];
            }

            // Execute the tool locally
            const startTime = Date.now();
            const result = await this.executeLocalTool(toolName, toolInput, context);
            const executionTime = Date.now() - startTime;

            const interceptorInfo: LocalToolInterceptorInfo = {
                toolName,
                intercepted: true,
                executionMethod: this.getExecutionMethod(toolName),
                executionTime,
                result
            };

            return [
                this.createEvent('LocalToolIntercepted', interceptorInfo),
                this.createEvent('ToolIntercepted', {
                    result,
                    toolName,
                    executionTime,
                    userRejected: false
                })
            ];

        } catch (error) {
            console.error('Error in LocalToolInterceptorProcessor:', error);
            return [this.createEvent('LocalToolInterceptionError', {
                error: error instanceof Error ? error.message : String(error),
                toolName: input.context?.toolName
            })];
        }
    }

    private shouldInterceptTool(toolName: string, toolInput: any, context: Record<string, any>): boolean {
        // Check if tool is in local tools registry
        if (this.localTools.has(toolName)) {
            return true;
        }

        // Check for custom tool patterns
        if (this.enableCustomToolHandling) {
            // Intercept tools with specific prefixes
            const customPrefixes = ['local--', 'custom--', 'internal--'];
            if (customPrefixes.some(prefix => toolName.startsWith(prefix))) {
                return true;
            }

            // Intercept specific tool types
            const localToolTypes = [
                'file_read_local',
                'file_write_local',
                'execute_script_local',
                'validate_data',
                'transform_data',
                'calculate',
                'format_output'
            ];
            
            if (localToolTypes.includes(toolName)) {
                return true;
            }
        }

        return false;
    }

    private async executeLocalTool(toolName: string, toolInput: any, context: Record<string, any>): Promise<string> {
        // Check if tool is in local registry
        if (this.localTools.has(toolName)) {
            const handler = this.localTools.get(toolName)!;
            return await this.executeToolHandler(handler, toolInput, context);
        }

        // Handle custom tool patterns
        if (toolName.startsWith('local--')) {
            return await this.handleLocalPrefixTool(toolName, toolInput, context);
        }

        if (toolName.startsWith('custom--')) {
            return await this.handleCustomPrefixTool(toolName, toolInput, context);
        }

        if (toolName.startsWith('internal--')) {
            return await this.handleInternalPrefixTool(toolName, toolInput, context);
        }

        // Handle specific local tool types
        switch (toolName) {
            case 'file_read_local':
                return await this.handleLocalFileRead(toolInput, context);
            case 'file_write_local':
                return await this.handleLocalFileWrite(toolInput, context);
            case 'execute_script_local':
                return await this.handleLocalScriptExecution(toolInput, context);
            case 'validate_data':
                return await this.handleDataValidation(toolInput, context);
            case 'transform_data':
                return await this.handleDataTransformation(toolInput, context);
            case 'calculate':
                return await this.handleCalculation(toolInput, context);
            case 'format_output':
                return await this.handleOutputFormatting(toolInput, context);
            default:
                throw new Error(`Unknown local tool: ${toolName}`);
        }
    }

    private async executeToolHandler(handler: LocalToolHandler, toolInput: any, context: Record<string, any>): Promise<string> {
        // Validate input if validator is provided
        if (handler.validate && !handler.validate(toolInput)) {
            throw new Error(`Invalid input for tool ${handler.name}`);
        }

        // Execute with timeout
        const timeout = handler.timeout || this.defaultExecutionTimeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Tool execution timeout: ${handler.name}`)), timeout);
        });

        const executionPromise = Promise.resolve(handler.execute(toolInput, context));
        
        try {
            const result = await Promise.race([executionPromise, timeoutPromise]);
            return typeof result === 'string' ? result : JSON.stringify(result);
        } catch (error) {
            throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async handleLocalPrefixTool(toolName: string, toolInput: any, context: Record<string, any>): Promise<string> {
        const actualToolName = toolName.replace('local--', '');
        
        if (this.enableLogging) {
            console.log(`[LocalToolInterceptor] Handling local tool: ${actualToolName}`);
        }

        // Simple local tool implementations
        switch (actualToolName) {
            case 'echo':
                return `Local echo: ${JSON.stringify(toolInput)}`;
            case 'timestamp':
                return `Current timestamp: ${new Date().toISOString()}`;
            case 'uuid':
                return `Generated UUID: ${this.generateUUID()}`;
            case 'hash':
                return `Hash of input: ${this.simpleHash(JSON.stringify(toolInput))}`;
            default:
                return `Local tool executed: ${actualToolName} with input: ${JSON.stringify(toolInput)}`;
        }
    }

    private async handleCustomPrefixTool(toolName: string, toolInput: any, context: Record<string, any>): Promise<string> {
        const actualToolName = toolName.replace('custom--', '');
        
        if (this.enableLogging) {
            console.log(`[LocalToolInterceptor] Handling custom tool: ${actualToolName}`);
        }

        // Custom tool implementations can be added here
        return `Custom tool ${actualToolName} executed with result: ${JSON.stringify(toolInput)}`;
    }

    private async handleInternalPrefixTool(toolName: string, toolInput: any, context: Record<string, any>): Promise<string> {
        const actualToolName = toolName.replace('internal--', '');
        
        if (this.enableLogging) {
            console.log(`[LocalToolInterceptor] Handling internal tool: ${actualToolName}`);
        }

        // Internal tool implementations
        switch (actualToolName) {
            case 'context_info':
                return `Context information: ${JSON.stringify(context, null, 2)}`;
            case 'memory_usage':
                return `Memory usage: ${JSON.stringify(process.memoryUsage(), null, 2)}`;
            case 'environment':
                return `Environment: ${process.env.NODE_ENV || 'development'}`;
            default:
                return `Internal tool ${actualToolName} executed`;
        }
    }

    private async handleLocalFileRead(toolInput: any, context: Record<string, any>): Promise<string> {
        const filePath = toolInput.filePath || toolInput.path;
        if (!filePath) {
            throw new Error('File path is required for local file read');
        }

        try {
            const fs = await import('fs/promises');
            const content = await fs.readFile(filePath, 'utf-8');
            return `File read successfully: ${filePath}\nContent length: ${content.length} characters`;
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async handleLocalFileWrite(toolInput: any, context: Record<string, any>): Promise<string> {
        const filePath = toolInput.filePath || toolInput.path;
        const content = toolInput.content;
        
        if (!filePath || content === undefined) {
            throw new Error('File path and content are required for local file write');
        }

        try {
            const fs = await import('fs/promises');
            await fs.writeFile(filePath, content, 'utf-8');
            return `File written successfully: ${filePath}\nContent length: ${content.length} characters`;
        } catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async handleLocalScriptExecution(toolInput: any, context: Record<string, any>): Promise<string> {
        const script = toolInput.script;
        const args = toolInput.args || [];
        
        if (!script) {
            throw new Error('Script is required for local script execution');
        }

        // For security, only allow specific safe scripts
        const allowedScripts = ['echo', 'date', 'pwd', 'ls'];
        if (!allowedScripts.includes(script)) {
            throw new Error(`Script not allowed for local execution: ${script}`);
        }

        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            
            const command = `${script} ${args.join(' ')}`;
            const { stdout, stderr } = await execAsync(command);
            
            return `Script executed: ${command}\nOutput: ${stdout}${stderr ? `\nError: ${stderr}` : ''}`;
        } catch (error) {
            throw new Error(`Script execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async handleDataValidation(toolInput: any, context: Record<string, any>): Promise<string> {
        const data = toolInput.data;
        const schema = toolInput.schema;
        
        if (!data) {
            throw new Error('Data is required for validation');
        }

        // Simple validation logic
        const validationResults = {
            isValid: true,
            errors: [] as string[],
            warnings: [] as string[]
        };

        if (schema) {
            // Basic schema validation
            if (schema.required && Array.isArray(schema.required)) {
                schema.required.forEach((field: string) => {
                    if (!(field in data)) {
                        validationResults.isValid = false;
                        validationResults.errors.push(`Required field missing: ${field}`);
                    }
                });
            }
        }

        return `Data validation completed: ${validationResults.isValid ? 'VALID' : 'INVALID'}\n${JSON.stringify(validationResults, null, 2)}`;
    }

    private async handleDataTransformation(toolInput: any, context: Record<string, any>): Promise<string> {
        const data = toolInput.data;
        const transformation = toolInput.transformation;
        
        if (!data || !transformation) {
            throw new Error('Data and transformation are required');
        }

        let result = data;

        // Apply transformations
        switch (transformation.type) {
            case 'uppercase':
                result = typeof data === 'string' ? data.toUpperCase() : JSON.stringify(data).toUpperCase();
                break;
            case 'lowercase':
                result = typeof data === 'string' ? data.toLowerCase() : JSON.stringify(data).toLowerCase();
                break;
            case 'reverse':
                result = typeof data === 'string' ? data.split('').reverse().join('') : JSON.stringify(data);
                break;
            case 'sort':
                if (Array.isArray(data)) {
                    result = [...data].sort();
                }
                break;
            default:
                result = data;
        }

        return `Data transformation completed: ${transformation.type}\nResult: ${JSON.stringify(result)}`;
    }

    private async handleCalculation(toolInput: any, context: Record<string, any>): Promise<string> {
        const expression = toolInput.expression;
        const values = toolInput.values || {};
        
        if (!expression) {
            throw new Error('Expression is required for calculation');
        }

        try {
            // Simple calculator for basic operations
            let result: number;
            
            if (expression.includes('+')) {
                const [a, b] = expression.split('+').map(x => parseFloat(x.trim()));
                result = a + b;
            } else if (expression.includes('-')) {
                const [a, b] = expression.split('-').map(x => parseFloat(x.trim()));
                result = a - b;
            } else if (expression.includes('*')) {
                const [a, b] = expression.split('*').map(x => parseFloat(x.trim()));
                result = a * b;
            } else if (expression.includes('/')) {
                const [a, b] = expression.split('/').map(x => parseFloat(x.trim()));
                result = a / b;
            } else {
                result = parseFloat(expression);
            }

            return `Calculation result: ${expression} = ${result}`;
        } catch (error) {
            throw new Error(`Calculation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async handleOutputFormatting(toolInput: any, context: Record<string, any>): Promise<string> {
        const data = toolInput.data;
        const format = toolInput.format || 'json';
        
        if (!data) {
            throw new Error('Data is required for output formatting');
        }

        try {
            let formattedOutput: string;

            switch (format.toLowerCase()) {
                case 'json':
                    formattedOutput = JSON.stringify(data, null, 2);
                    break;
                case 'yaml':
                    // Simple YAML-like formatting
                    formattedOutput = this.toYamlLike(data);
                    break;
                case 'csv':
                    formattedOutput = this.toCsv(data);
                    break;
                case 'table':
                    formattedOutput = this.toTable(data);
                    break;
                default:
                    formattedOutput = String(data);
            }

            return `Output formatted as ${format}:\n${formattedOutput}`;
        } catch (error) {
            throw new Error(`Output formatting failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private getExecutionMethod(toolName: string): 'local' | 'custom' | 'delegated' {
        if (this.localTools.has(toolName)) {
            return 'local';
        }
        if (toolName.startsWith('custom--')) {
            return 'custom';
        }
        return 'delegated';
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    private toYamlLike(data: any, indent = 0): string {
        const spaces = '  '.repeat(indent);
        if (typeof data === 'object' && data !== null) {
            if (Array.isArray(data)) {
                return data.map(item => `${spaces}- ${this.toYamlLike(item, indent + 1)}`).join('\n');
            } else {
                return Object.entries(data)
                    .map(([key, value]) => `${spaces}${key}: ${this.toYamlLike(value, indent + 1)}`)
                    .join('\n');
            }
        }
        return String(data);
    }

    private toCsv(data: any): string {
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const csvHeaders = headers.join(',');
            const csvRows = data.map(row => 
                headers.map(header => JSON.stringify(row[header] || '')).join(',')
            );
            return [csvHeaders, ...csvRows].join('\n');
        }
        return JSON.stringify(data);
    }

    private toTable(data: any): string {
        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const headerRow = '| ' + headers.join(' | ') + ' |';
            const separatorRow = '|' + headers.map(() => '---').join('|') + '|';
            const dataRows = data.map(row => 
                '| ' + headers.map(header => String(row[header] || '')).join(' | ') + ' |'
            );
            return [headerRow, separatorRow, ...dataRows].join('\n');
        }
        return JSON.stringify(data, null, 2);
    }

    // Public methods for tool management
    addLocalTool(handler: LocalToolHandler): void {
        this.localTools.set(handler.name, handler);
        if (this.enableLogging) {
            console.log(`[LocalToolInterceptor] Added local tool: ${handler.name}`);
        }
    }

    removeLocalTool(toolName: string): boolean {
        const removed = this.localTools.delete(toolName);
        if (removed && this.enableLogging) {
            console.log(`[LocalToolInterceptor] Removed local tool: ${toolName}`);
        }
        return removed;
    }

    getLocalTools(): string[] {
        return Array.from(this.localTools.keys());
    }

    hasLocalTool(toolName: string): boolean {
        return this.localTools.has(toolName);
    }
}
