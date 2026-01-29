/**
 * Example demonstrating how to use pre-tool call processors
 * with the Unified Agent Framework
 */

import { 
    createUnifiedAgent,
    createUnifiedResponseExecutor,
    UnifiedAgentConfig 
} from '../index';
import {
    LocalToolInterceptorProcessor,
    ToolValidationProcessor,
    ToolParameterModifierProcessor,
    type LocalToolHandler,
    type ParameterTransformation
} from '../processors';
import type { CodeboltAPI, OpenAITool } from '../types/libTypes';

/**
 * Example 1: Basic Local Tool Interception
 */
export async function basicLocalToolInterceptionExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    // Define custom local tools
    const customCalculator: LocalToolHandler = {
        name: 'local--calculator',
        description: 'Performs basic mathematical calculations locally',
        execute: async (params: { expression: string }) => {
            const { expression } = params;
            try {
                // Simple expression evaluator (for demo purposes)
                const result = eval(expression.replace(/[^0-9+\-*/().\s]/g, ''));
                return `Calculation result: ${expression} = ${result}`;
            } catch (error) {
                return `Calculation error: ${error}`;
            }
        },
        validate: (params) => params && typeof params.expression === 'string',
        timeout: 5000
    };

    const dataFormatter: LocalToolHandler = {
        name: 'local--format_data',
        description: 'Formats data in various formats locally',
        execute: async (params: { data: any; format: string }) => {
            const { data, format } = params;
            switch (format.toLowerCase()) {
                case 'json':
                    return JSON.stringify(data, null, 2);
                case 'csv':
                    if (Array.isArray(data)) {
                        const headers = Object.keys(data[0] || {});
                        const csvData = [
                            headers.join(','),
                            ...data.map(row => headers.map(h => row[h] || '').join(','))
                        ];
                        return csvData.join('\n');
                    }
                    return JSON.stringify(data);
                default:
                    return String(data);
            }
        }
    };

    // Create local tool interceptor
    const localToolInterceptor = new LocalToolInterceptorProcessor({
        localTools: new Map([
            [customCalculator.name, customCalculator],
            [dataFormatter.name, dataFormatter]
        ]),
        enableCustomToolHandling: true,
        enableLogging: true
    });

    // Create response executor with pre-tool processors
    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        preToolCallProcessors: [localToolInterceptor]
    });

    // Create unified agent
    const agent = createUnifiedAgent({
        codebolt,
        maxIterations: 5,
        enableLogging: true
    });

    agent.setResponseExecutor(responseExecutor);

    // Execute agent with local tool calls
    const result = await agent.execute({
        userMessage: "Calculate 15 * 8 + 32 and format the result as JSON",
        tools: [...tools, {
            type: 'function',
            function: {
                name: 'local--calculator',
                description: 'Performs mathematical calculations',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: { type: 'string', description: 'Mathematical expression to evaluate' }
                    },
                    required: ['expression']
                }
            }
        }]
    });

    console.log('Local tool interception result:', result.response);
    return result;
}

/**
 * Example 2: Tool Validation and Parameter Modification
 */
export async function toolValidationAndModificationExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    // Create tool validation processor
    const toolValidator = new ToolValidationProcessor({
        enableParameterValidation: true,
        enableSecurityValidation: true,
        enableTypeValidation: true,
        strictMode: false,
        allowedTools: ['file_read', 'file_write', 'http_request', 'local--calculator'],
        blockedTools: ['rm', 'delete', 'format'],
        maxParameterSize: 1024 * 100, // 100KB
        enableLogging: true
    });

    // Create custom parameter transformations
    const customTransformations: ParameterTransformation[] = [
        {
            name: 'add-project-context',
            condition: (toolName) => toolName.includes('file'),
            transform: (params, context) => {
                const result = { ...params };
                if (result.filePath && !result.filePath.startsWith('/')) {
                    result.filePath = `./project/${result.filePath}`;
                }
                result.projectContext = {
                    sessionId: context?.sessionId || 'unknown',
                    timestamp: new Date().toISOString()
                };
                return result;
            },
            description: 'Add project context to file operations'
        },
        {
            name: 'enhance-http-requests',
            condition: (toolName) => toolName.includes('http'),
            transform: (params) => {
                const result = { ...params };
                if (!result.headers) {
                    result.headers = {};
                }
                result.headers['X-Agent-Version'] = '1.0';
                result.headers['X-Request-ID'] = Math.random().toString(36).substr(2, 9);
                
                if (!result.timeout) {
                    result.timeout = 30000;
                }
                
                return result;
            },
            description: 'Enhance HTTP requests with additional headers and timeout'
        }
    ];

    // Create parameter modifier processor
    const parameterModifier = new ToolParameterModifierProcessor({
        enableParameterTransformation: true,
        enableParameterEnrichment: true,
        enableParameterSanitization: true,
        transformations: customTransformations,
        defaultTransformations: true,
        enableLogging: true
    });

    // Create response executor with multiple pre-tool processors
    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        preToolCallProcessors: [
            toolValidator,      // Validate first
            parameterModifier   // Then modify parameters
        ],
        enableLogging: true
    });

    const agent = createUnifiedAgent({ codebolt });
    agent.setResponseExecutor(responseExecutor);

    // Execute with validation and modification
    const result = await agent.execute({
        userMessage: "Read the config.json file and make an HTTP request to the API endpoint specified in it",
        tools
    });

    return result;
}

/**
 * Example 3: Advanced Local Tool Handling with Custom Business Logic
 */
export async function advancedLocalToolHandlingExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    // Create business logic tools
    const businessLogicTools = new Map<string, LocalToolHandler>([
        ['custom--validate_user', {
            name: 'custom--validate_user',
            description: 'Validates user data according to business rules',
            execute: async (params: { userData: any }) => {
                const { userData } = params;
                const errors: string[] = [];
                
                if (!userData.email || !userData.email.includes('@')) {
                    errors.push('Invalid email format');
                }
                
                if (!userData.age || userData.age < 18) {
                    errors.push('User must be at least 18 years old');
                }
                
                if (!userData.name || userData.name.length < 2) {
                    errors.push('Name must be at least 2 characters long');
                }
                
                return errors.length === 0 
                    ? 'User validation passed'
                    : `User validation failed: ${errors.join(', ')}`;
            }
        }],
        ['custom--process_order', {
            name: 'custom--process_order',
            description: 'Processes order with business logic',
            execute: async (params: { order: any }) => {
                const { order } = params;
                
                // Simulate order processing
                const total = order.items?.reduce((sum: number, item: any) => 
                    sum + (item.price * item.quantity), 0) || 0;
                
                const tax = total * 0.08; // 8% tax
                const finalTotal = total + tax;
                
                return `Order processed successfully:
                Subtotal: $${total.toFixed(2)}
                Tax: $${tax.toFixed(2)}
                Total: $${finalTotal.toFixed(2)}
                Order ID: ORD-${Date.now()}`;
            }
        }],
        ['internal--get_system_info', {
            name: 'internal--get_system_info',
            description: 'Gets internal system information',
            execute: async () => {
                return `System Information:
                Node Version: ${process.version}
                Platform: ${process.platform}
                Architecture: ${process.arch}
                Memory Usage: ${JSON.stringify(process.memoryUsage(), null, 2)}
                Uptime: ${process.uptime()} seconds`;
            }
        }]
    ]);

    // Create advanced local tool interceptor
    const advancedInterceptor = new LocalToolInterceptorProcessor({
        localTools: businessLogicTools,
        enableCustomToolHandling: true,
        enableToolDelegation: true,
        defaultExecutionTimeout: 10000,
        enableLogging: true
    });

    // Create comprehensive validation
    const comprehensiveValidator = new ToolValidationProcessor({
        enableParameterValidation: true,
        enableSecurityValidation: true,
        strictMode: true,
        allowedTools: Array.from(businessLogicTools.keys()).concat(['file_read', 'http_request']),
        enableLogging: true
    });

    // Create response executor
    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        preToolCallProcessors: [
            comprehensiveValidator,
            advancedInterceptor
        ]
    });

    const agent = createUnifiedAgent({
        codebolt,
        maxIterations: 8,
        enableLogging: true
    });

    agent.setResponseExecutor(responseExecutor);

    // Execute complex business logic
    const result = await agent.execute({
        userMessage: "Validate this user data: {email: 'john@example.com', age: 25, name: 'John Doe'} and then process an order with items: [{name: 'Widget', price: 10.99, quantity: 2}, {name: 'Gadget', price: 15.50, quantity: 1}]",
        tools: [...tools, ...Array.from(businessLogicTools.keys()).map(toolName => ({
            type: 'function' as const,
            function: {
                name: toolName,
                description: businessLogicTools.get(toolName)?.description || '',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            }
        }))]
    });

    return result;
}

/**
 * Example 4: Dynamic Processor Management
 */
export async function dynamicProcessorManagementExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    // Create response executor without initial processors
    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        enableLogging: true
    });

    const agent = createUnifiedAgent({ codebolt });
    agent.setResponseExecutor(responseExecutor);

    console.log('Starting without pre-tool processors...');
    
    // Execute without processors
    let result = await agent.step({
        userMessage: "Calculate 10 + 5",
        tools
    });

    // Add local tool interceptor dynamically
    console.log('Adding local tool interceptor...');
    const localInterceptor = new LocalToolInterceptorProcessor({
        enableCustomToolHandling: true,
        enableLogging: true
    });
    
    // Add a simple calculator tool
    localInterceptor.addLocalTool({
        name: 'local--simple_calc',
        execute: (params: { a: number; b: number; operation: string }) => {
            const { a, b, operation } = params;
            switch (operation) {
                case 'add': return `${a} + ${b} = ${a + b}`;
                case 'subtract': return `${a} - ${b} = ${a - b}`;
                case 'multiply': return `${a} * ${b} = ${a * b}`;
                case 'divide': return `${a} / ${b} = ${a / b}`;
                default: return 'Unknown operation';
            }
        }
    });

    responseExecutor.addPreToolCallProcessor(localInterceptor);

    result = await agent.step({
        userMessage: "Use the local calculator to add 15 and 25",
        tools: [...tools, {
            type: 'function',
            function: {
                name: 'local--simple_calc',
                description: 'Simple calculator',
                parameters: {
                    type: 'object',
                    properties: {
                        a: { type: 'number' },
                        b: { type: 'number' },
                        operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] }
                    },
                    required: ['a', 'b', 'operation']
                }
            }
        }],
        conversationHistory: result.conversationHistory
    });

    // Add validation processor
    console.log('Adding validation processor...');
    const validator = new ToolValidationProcessor({
        strictMode: true,
        allowedTools: ['local--simple_calc'],
        enableLogging: true
    });
    
    responseExecutor.addPreToolCallProcessor(validator);

    // Check active processors
    const activeProcessors = responseExecutor.getPreToolCallProcessors();
    console.log(`Active pre-tool processors: ${activeProcessors.length}`);

    // Remove interceptor
    console.log('Removing local interceptor...');
    responseExecutor.removePreToolCallProcessor(localInterceptor);

    const remainingProcessors = responseExecutor.getPreToolCallProcessors();
    console.log(`Remaining processors: ${remainingProcessors.length}`);

    return result;
}

/**
 * Example 5: Custom Processor with Monitoring
 */
export class CustomToolMonitoringProcessor extends LocalToolInterceptorProcessor {
    private toolExecutionMetrics: Map<string, {
        count: number;
        totalTime: number;
        errors: number;
        lastExecution: string;
    }> = new Map();

    async processInput(input: any): Promise<any[]> {
        const toolName = input.context?.toolName;
        const startTime = Date.now();
        
        try {
            const results = await super.processInput(input);
            
            // Update metrics on success
            this.updateMetrics(toolName, Date.now() - startTime, false);
            
            // Add monitoring event
            results.push(this.createEvent('ToolExecutionMonitored', {
                toolName,
                executionTime: Date.now() - startTime,
                status: 'success',
                metrics: this.getToolMetrics(toolName)
            }));
            
            return results;
        } catch (error) {
            // Update metrics on error
            this.updateMetrics(toolName, Date.now() - startTime, true);
            
            return [this.createEvent('ToolExecutionMonitoringError', {
                toolName,
                error: String(error),
                metrics: this.getToolMetrics(toolName)
            })];
        }
    }

    private updateMetrics(toolName: string, executionTime: number, isError: boolean): void {
        if (!this.toolExecutionMetrics.has(toolName)) {
            this.toolExecutionMetrics.set(toolName, {
                count: 0,
                totalTime: 0,
                errors: 0,
                lastExecution: new Date().toISOString()
            });
        }

        const metrics = this.toolExecutionMetrics.get(toolName)!;
        metrics.count++;
        metrics.totalTime += executionTime;
        metrics.lastExecution = new Date().toISOString();
        
        if (isError) {
            metrics.errors++;
        }
    }

    private getToolMetrics(toolName: string) {
        const metrics = this.toolExecutionMetrics.get(toolName);
        if (!metrics) return null;

        return {
            ...metrics,
            averageTime: metrics.totalTime / metrics.count,
            errorRate: metrics.errors / metrics.count
        };
    }

    getAllMetrics() {
        const result: Record<string, any> = {};
        for (const [toolName, metrics] of this.toolExecutionMetrics) {
            result[toolName] = {
                ...metrics,
                averageTime: metrics.totalTime / metrics.count,
                errorRate: metrics.errors / metrics.count
            };
        }
        return result;
    }
}

export async function customMonitoringProcessorExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    const monitoringProcessor = new CustomToolMonitoringProcessor({
        enableCustomToolHandling: true,
        enableLogging: true
    });

    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        preToolCallProcessors: [monitoringProcessor]
    });

    const agent = createUnifiedAgent({ codebolt });
    agent.setResponseExecutor(responseExecutor);

    const result = await agent.loop({
        userMessage: "Perform several file operations and calculations to test monitoring",
        tools,
        maxIterations: 10
    });

    // Get monitoring metrics
    const metrics = monitoringProcessor.getAllMetrics();
    console.log('Tool execution metrics:', metrics);

    return { result, metrics };
}
