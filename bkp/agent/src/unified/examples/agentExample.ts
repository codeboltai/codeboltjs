/**
 * Examples demonstrating how to use the high-level Agent class
 * with the Unified Agent Framework
 */

import { z } from 'zod';
import codeboltjs from '@codebolt/codeboltjs';
import { 
    Agent, 
    createAgent, 
    createTool, 
    createTextTool, 
    createFileTool, 
    createHttpTool,
    createValidationTool,
    createTransformTool,
    type AgentConfig,
    type Tool
} from '../index';

import {
    ConversationCompactorProcessor,
    FollowUpConversationProcessor,
    LocalToolInterceptorProcessor,
    ToolValidationProcessor
} from '../processors';

/**
 * Example 1: Basic Agent with Default Processors
 */
export async function basicAgentExample() {
    // Create a simple calculator tool
    const calculatorTool = createTool({
        id: 'calculator',
        name: 'Calculator',
        description: 'Performs basic mathematical calculations',
        inputSchema: z.object({
            expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 3 * 4")')
        }),
        outputSchema: z.object({
            result: z.number(),
            expression: z.string()
        }),
        execute: async ({ input }) => {
            // Simple expression evaluator (in production, use a proper math parser)
            try {
                // Remove any non-math characters for safety
                const sanitized = input.expression.replace(/[^0-9+\-*/().\s]/g, '');
                const result = eval(sanitized);
                
                if (typeof result !== 'number' || !isFinite(result)) {
                    throw new Error('Invalid calculation result');
                }
                
                return {
                    result,
                    expression: input.expression
                };
            } catch (error) {
                throw new Error(`Calculation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    });

    // Create agent with default processors
    const agent = createAgent({
        name: 'Math Assistant',
        instructions: `You are a helpful math assistant. Use the calculator tool to perform calculations when needed.
        Always show your work and explain the steps clearly.`,
        model: 'gpt-4',
        tools: [calculatorTool],
        maxIterations: 5,
        enableLogging: true,
        defaultProcessors: true // This enables default processors
    });

    console.log('=== Basic Agent Example ===');
    
    // Execute a simple calculation
    const result1 = await agent.execute("What is 15 * 8 + 32?");
    console.log('Result 1:', result1.message);
    
    // Execute a more complex request
    const result2 = await agent.execute("Calculate the area of a circle with radius 5, then add 10% to it");
    console.log('Result 2:', result2.message);
    
    return { result1, result2 };
}

/**
 * Example 2: Agent with Custom Tools and Processors
 */
export async function customAgentExample() {
    // Create multiple custom tools
    const weatherTool = createTool({
        id: 'get_weather',
        name: 'Weather Tool',
        description: 'Gets current weather information for a location',
        inputSchema: z.object({
            location: z.string().describe('City name or coordinates'),
            units: z.enum(['celsius', 'fahrenheit']).optional().describe('Temperature units')
        }),
        outputSchema: z.object({
            location: z.string(),
            temperature: z.number(),
            condition: z.string(),
            humidity: z.number(),
            windSpeed: z.number()
        }),
        execute: async ({ input }) => {
            // Mock weather data (in production, call a real weather API)
            return {
                location: input.location,
                temperature: input.units === 'fahrenheit' ? 72 : 22,
                condition: 'Partly cloudy',
                humidity: 65,
                windSpeed: 8
            };
        }
    });

    const textAnalysisTool = createTextTool({
        id: 'analyze_text',
        name: 'Text Analyzer',
        description: 'Analyzes text for sentiment, keywords, and statistics',
        execute: async (text) => {
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            
            // Simple sentiment analysis (mock)
            const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
            const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
            
            const positive = positiveWords.filter(word => 
                text.toLowerCase().includes(word)
            ).length;
            const negative = negativeWords.filter(word => 
                text.toLowerCase().includes(word)
            ).length;
            
            let sentiment = 'neutral';
            if (positive > negative) sentiment = 'positive';
            else if (negative > positive) sentiment = 'negative';
            
            return `Text Analysis Results:
            - Word count: ${words.length}
            - Sentence count: ${sentences.length}
            - Average words per sentence: ${(words.length / sentences.length).toFixed(1)}
            - Sentiment: ${sentiment}
            - Character count: ${text.length}`;
        }
    });

    const fileOperationTool = createFileTool({
        id: 'read_file',
        name: 'File Reader',
        description: 'Reads content from a file',
        operation: 'read',
        execute: async (params) => {
            // Mock file reading (in production, use actual file system)
            return `Mock file content from: ${params.filePath}`;
        }
    });

    // Create custom processors
    const customValidationProcessor = new ToolValidationProcessor({
        enableParameterValidation: true,
        enableSecurityValidation: true,
        strictMode: false,
        allowedTools: ['get_weather', 'analyze_text', 'read_file'],
        maxParameterSize: 1024 * 10, // 10KB
        enableLogging: true
    });

    const customConversationProcessor = new ConversationCompactorProcessor({
        maxConversationLength: 20,
        enableSummarization: true,
        enableSmartRemoval: true,
        enableLogging: true
    });

    // Create agent with custom tools and processors
    const agent = createAgent({
        name: 'Multi-Tool Assistant',
        instructions: `You are a versatile assistant that can help with weather, text analysis, and file operations.
        Always use the appropriate tools for each task and provide comprehensive responses.`,
        model: 'gpt-4',
        tools: [weatherTool, textAnalysisTool, fileOperationTool],
        processors: {
            preToolCall: [customValidationProcessor],
            followUpConversation: [customConversationProcessor]
        },
        maxIterations: 8,
        enableLogging: true,
        defaultProcessors: true // Also include default processors
    });

    console.log('\n=== Custom Agent Example ===');
    
    // Execute multiple tasks
    const result1 = await agent.execute("What's the weather in New York and analyze the sentiment of this text: 'Today is a wonderful day!'");
    console.log('Result 1:', result1.message);
    
    const result2 = await agent.execute("Read the config.json file and tell me about its content");
    console.log('Result 2:', result2.message);
    
    return { result1, result2 };
}

/**
 * Example 3: Agent with Local Tool Interception
 */
export async function localToolInterceptionExample() {
    // Create local tools that will be intercepted
    const localCalculatorTool = createTool({
        id: 'local--advanced_calc',
        name: 'Advanced Calculator',
        description: 'Performs advanced mathematical calculations locally',
        inputSchema: z.object({
            operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt']),
            a: z.number().describe('First number'),
            b: z.number().optional().describe('Second number (not needed for sqrt)')
        }),
        execute: async ({ input }) => {
            const { operation, a, b } = input;
            
            switch (operation) {
                case 'add':
                    return { result: a + (b || 0), operation: `${a} + ${b}` };
                case 'subtract':
                    return { result: a - (b || 0), operation: `${a} - ${b}` };
                case 'multiply':
                    return { result: a * (b || 1), operation: `${a} * ${b}` };
                case 'divide':
                    if (b === 0) throw new Error('Division by zero');
                    return { result: a / (b || 1), operation: `${a} / ${b}` };
                case 'power':
                    return { result: Math.pow(a, b || 2), operation: `${a} ^ ${b}` };
                case 'sqrt':
                    return { result: Math.sqrt(a), operation: `√${a}` };
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }
        }
    });

    // Create local tool interceptor
    const localInterceptor = new LocalToolInterceptorProcessor({
        enableCustomToolHandling: true,
        enableLogging: true
    });

    // Add the local calculator to the interceptor
    localInterceptor.addLocalTool({
        name: 'local--advanced_calc',
        execute: async (params) => {
            const { operation, a, b } = params;
            console.log(`[Local Execution] Performing ${operation} with ${a} and ${b}`);
            
            switch (operation) {
                case 'add': return `Local calculation: ${a} + ${b} = ${a + b}`;
                case 'subtract': return `Local calculation: ${a} - ${b} = ${a - b}`;
                case 'multiply': return `Local calculation: ${a} * ${b} = ${a * b}`;
                case 'divide': 
                    if (b === 0) throw new Error('Division by zero');
                    return `Local calculation: ${a} / ${b} = ${a / b}`;
                case 'power': return `Local calculation: ${a} ^ ${b} = ${Math.pow(a, b)}`;
                case 'sqrt': return `Local calculation: √${a} = ${Math.sqrt(a)}`;
                default: throw new Error(`Unknown operation: ${operation}`);
            }
        }
    });

    // Create agent with local tool interception
    const agent = createAgent({
        name: 'Local Calculator Agent',
        instructions: `You are a calculator assistant that performs mathematical operations.
        Use the advanced_calc tool for calculations. The tool will be executed locally for better performance.`,
        model: 'gpt-4',
        tools: [localCalculatorTool],
        processors: {
            preToolCall: [localInterceptor]
        },
        maxIterations: 5,
        enableLogging: true
    });

    console.log('\n=== Local Tool Interception Example ===');
    
    const result1 = await agent.execute("Calculate 25 to the power of 3, then take the square root of the result");
    console.log('Result 1:', result1.message);
    
    const result2 = await agent.execute("Divide 144 by 12, then multiply by 5");
    console.log('Result 2:', result2.message);
    
    return { result1, result2 };
}

/**
 * Example 4: Data Processing Agent with Validation and Transformation
 */
export async function dataProcessingAgentExample() {
    // Create validation tool
    const userValidationTool = createValidationTool({
        id: 'validate_user',
        name: 'User Validator',
        description: 'Validates user data according to business rules',
        schema: z.object({
            name: z.string().min(2, 'Name must be at least 2 characters'),
            email: z.string().email('Invalid email format'),
            age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Age seems unrealistic'),
            role: z.enum(['admin', 'user', 'moderator'])
        }),
        onValid: (data) => {
            return {
                ...data,
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
                status: 'active'
            };
        },
        onInvalid: (errors) => {
            return {
                message: 'Validation failed',
                errors,
                suggestions: 'Please check the required fields and try again'
            };
        }
    });

    // Create transformation tool
    const dataTransformTool = createTransformTool({
        id: 'transform_data',
        name: 'Data Transformer',
        description: 'Transforms data between different formats',
        inputSchema: z.object({
            data: z.any(),
            fromFormat: z.enum(['json', 'csv', 'xml']),
            toFormat: z.enum(['json', 'csv', 'xml'])
        }),
        outputSchema: z.object({
            transformedData: z.string(),
            originalFormat: z.string(),
            targetFormat: z.string()
        }),
        transform: async (input) => {
            const { data, fromFormat, toFormat } = input;
            
            // Mock transformation logic
            let transformedData: string;
            
            if (toFormat === 'json') {
                transformedData = JSON.stringify(data, null, 2);
            } else if (toFormat === 'csv') {
                if (Array.isArray(data) && data.length > 0) {
                    const headers = Object.keys(data[0]);
                    const csvData = [
                        headers.join(','),
                        ...data.map(row => headers.map(h => row[h] || '').join(','))
                    ];
                    transformedData = csvData.join('\n');
                } else {
                    transformedData = 'No data to transform to CSV';
                }
            } else {
                transformedData = `<data>${JSON.stringify(data)}</data>`;
            }
            
            return {
                transformedData,
                originalFormat: fromFormat,
                targetFormat: toFormat
            };
        }
    });

    // Create HTTP tool for API interactions
    const apiTool = createHttpTool({
        id: 'api_request',
        name: 'API Client',
        description: 'Makes HTTP requests to external APIs',
        method: 'GET',
        defaultHeaders: {
            'User-Agent': 'DataProcessingAgent/1.0',
            'Accept': 'application/json'
        },
        execute: async ({ input }) => {
            // Mock API response
            return {
                status: 200,
                data: {
                    message: `API request to ${input.url} completed successfully`,
                    method: input.method || 'GET',
                    timestamp: new Date().toISOString()
                },
                headers: {
                    'content-type': 'application/json'
                }
            };
        }
    });

    // Create agent for data processing
    const agent = createAgent({
        name: 'Data Processing Agent',
        instructions: `You are a data processing specialist. You can validate user data, transform between formats, and interact with APIs.
        Always validate data before processing and provide clear feedback about any issues.`,
        model: 'gpt-4',
        tools: [userValidationTool, dataTransformTool, apiTool],
        maxIterations: 6,
        enableLogging: true,
        defaultProcessors: true
    });

    console.log('\n=== Data Processing Agent Example ===');
    
    // Test user validation
    const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        role: 'user'
    };
    
    const result1 = await agent.execute(`Validate this user data: ${JSON.stringify(userData)}`);
    console.log('Validation Result:', result1.message);
    
    // Test data transformation
    const sampleData = [
        { id: 1, name: 'Alice', score: 95 },
        { id: 2, name: 'Bob', score: 87 },
        { id: 3, name: 'Charlie', score: 92 }
    ];
    
    const result2 = await agent.execute(`Transform this JSON data to CSV format: ${JSON.stringify(sampleData)}`);
    console.log('Transformation Result:', result2.message);
    
    return { result1, result2 };
}

/**
 * Example 5: Dynamic Agent Configuration
 */
export async function dynamicAgentExample() {
    // Start with basic agent
    const agent = createAgent({
        name: 'Dynamic Agent',
        instructions: 'You are a flexible assistant that can be configured dynamically.',
        model: 'gpt-4',
        tools: [],
        maxIterations: 5,
        enableLogging: true
    });

    console.log('\n=== Dynamic Agent Example ===');
    
    // Add tools dynamically
    console.log('Adding calculator tool...');
    const calcTool = createTool({
        id: 'dynamic_calc',
        name: 'Dynamic Calculator',
        description: 'Calculator added dynamically',
        inputSchema: z.object({
            expression: z.string()
        }),
        execute: async ({ input }) => {
            const result = eval(input.expression.replace(/[^0-9+\-*/().\s]/g, ''));
            return `Calculation: ${input.expression} = ${result}`;
        }
    });
    
    agent.addTool(calcTool);
    
    const result1 = await agent.execute("Calculate 10 * 5 + 3");
    console.log('With calculator:', result1.message);
    
    // Add text tool dynamically
    console.log('Adding text tool...');
    const textTool = createTextTool({
        id: 'text_processor',
        name: 'Text Processor',
        description: 'Processes text in various ways',
        execute: async (text) => {
            return `Processed text: "${text}" (${text.length} characters, ${text.split(' ').length} words)`;
        }
    });
    
    agent.addTool(textTool);
    
    const result2 = await agent.execute("Process this text: 'Hello, world! This is a test.'");
    console.log('With text processor:', result2.message);
    
    // Add processor dynamically
    console.log('Adding validation processor...');
    const validator = new ToolValidationProcessor({
        enableParameterValidation: true,
        strictMode: true,
        allowedTools: ['dynamic_calc', 'text_processor'],
        enableLogging: true
    });
    
    agent.addProcessor('preToolCall', validator);
    
    const result3 = await agent.execute("Calculate 20 / 4 and process the text 'Dynamic configuration works!'");
    console.log('With validation:', result3.message);
    
    // Show current tools
    const tools = agent.getTools();
    console.log('Current tools:', tools.map(t => t.id));
    
    return { result1, result2, result3, tools };
}

/**
 * Run all examples
 */
export async function runAllExamples() {
    try {
        console.log('🚀 Running Agent Examples...\n');
        
        await basicAgentExample();
        await customAgentExample();
        await localToolInterceptionExample();
        await dataProcessingAgentExample();
        await dynamicAgentExample();
        
        console.log('\n✅ All examples completed successfully!');
    } catch (error) {
        console.error('❌ Error running examples:', error);
    }
}

// Export for individual testing
export {
    basicAgentExample,
    customAgentExample,
    localToolInterceptionExample,
    dataProcessingAgentExample,
    dynamicAgentExample
};
