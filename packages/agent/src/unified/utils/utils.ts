import type { 
    CodeboltAPI,
    OpenAITool 
} from '../types/libTypes';
import type {  MessageModifier} from '@codebolt/types/agent';

import type {
    UnifiedAgent,
    UnifiedAgentConfig,
    LLMConfig
} from '../types/types';
import { 
    createUnifiedAgent,
    createUnifiedMessageModifier,
    createUnifiedAgentStep,
    createUnifiedResponseExecutor
} from '../index';

/**
 * Quick agent creation for simple use cases
 */
export function createQuickAgent(options: {
    userMessage: string;
    tools?: OpenAITool[];
    codebolt?: CodeboltAPI;
}): Promise<string> {
    const agent = createUnifiedAgent({
        codebolt: options.codebolt,
        enableLogging: false,
        maxIterations: 5
    });

    return agent.execute({
        userMessage: options.userMessage,
        tools: options.tools
    }).then((result: any) => result.response);
}

/**
 * Advanced agent creation with full configuration
 */
export function createAdvancedAgent(config: {
    llmConfig: LLMConfig;
    codebolt: CodeboltAPI;
    processors?: MessageModifier[];
    maxIterations?: number;
    maxConversationLength?: number;
    enableLogging?: boolean;
}): UnifiedAgent {
    const agentConfig: UnifiedAgentConfig = {
        llmConfig: config.llmConfig,
        codebolt: config.codebolt,
        maxIterations: config.maxIterations || 15,
        maxConversationLength: config.maxConversationLength || 100,
        enableLogging: config.enableLogging !== false
    };

    const agent = createUnifiedAgent(agentConfig);

    // Add custom processors if provided
    if (config.processors && config.processors.length > 0) {
        const messageModifier = createUnifiedMessageModifier({
            processors: config.processors,
            enableLogging: config.enableLogging
        });
        agent.addMessageModifier(messageModifier);
    }

    return agent;
}

/**
 * Create agent with custom components
 */
export function createCustomAgent(config: {
    messageModifier?: any;
    agentStep?: any;
    responseExecutor?: any;
    agentConfig?: UnifiedAgentConfig;
}): UnifiedAgent {
    const agent = createUnifiedAgent(config.agentConfig);

    if (config.messageModifier) {
        agent.addMessageModifier(config.messageModifier);
    }

    if (config.agentStep) {
        agent.setAgentStep(config.agentStep);
    }

    if (config.responseExecutor) {
        agent.setResponseExecutor(config.responseExecutor);
    }

    return agent;
}

/**
 * Utility to create a development agent with verbose logging
 */
export function createDevelopmentAgent(codebolt?: CodeboltAPI): UnifiedAgent {
    const agent = createUnifiedAgent({
        codebolt,
        enableLogging: true,
        maxIterations: 10,
        maxConversationLength: 30,
        llmConfig: {
            llmname: 'DevelopmentLLM',
            temperature: 0.8
        }
    });

    // Add development event listeners
    agent.addEventListener('step_started', (event: any) => {
        console.log('🚀 [Dev] Step started:', event.data);
    });

    agent.addEventListener('tool_execution_started', (event: any) => {
        console.log('🔧 [Dev] Tool execution started:', event.data);
    });

    agent.addEventListener('agent_error', (event: any) => {
        console.error('❌ [Dev] Agent error:', event.data);
    });

    agent.addEventListener('agent_completed', (event: any) => {
        console.log('✅ [Dev] Agent completed:', event.data);
    });

    return agent;
}

/**
 * Utility to create a testing agent with minimal configuration
 */
export function createTestingAgent(): UnifiedAgent {
    return createUnifiedAgent({
        enableLogging: false,
        maxIterations: 3,
        maxConversationLength: 10,
        llmConfig: {
            llmname: 'TestLLM',
            temperature: 0.1
        }
    });
}

/**
 * Utility to validate agent configuration
 */
export function validateAgentConfig(config: UnifiedAgentConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (config.maxIterations !== undefined && config.maxIterations < 1) {
        errors.push('maxIterations must be at least 1');
    }

    if (config.maxConversationLength !== undefined && config.maxConversationLength < 5) {
        errors.push('maxConversationLength must be at least 5');
    }

    // Check LLM config
    if (config.llmConfig) {
        if (!config.llmConfig.llmname) {
            warnings.push('llmname not specified, using default');
        }

        if (config.llmConfig.temperature !== undefined && 
            (config.llmConfig.temperature < 0 || config.llmConfig.temperature > 2)) {
            warnings.push('temperature should be between 0 and 2');
        }

        if (config.llmConfig.maxTokens !== undefined && config.llmConfig.maxTokens < 1) {
            errors.push('maxTokens must be at least 1');
        }
    }

    // Check retry config
    if (config.retryConfig) {
        if (config.retryConfig.maxRetries !== undefined && config.retryConfig.maxRetries < 0) {
            errors.push('maxRetries must be non-negative');
        }

        if (config.retryConfig.retryDelay !== undefined && config.retryConfig.retryDelay < 0) {
            errors.push('retryDelay must be non-negative');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Utility to create agent from environment variables
 */
export function createAgentFromEnv(codebolt?: CodeboltAPI): UnifiedAgent {
    const config: UnifiedAgentConfig = {
        codebolt,
        maxIterations: parseInt(process.env.AGENT_MAX_ITERATIONS || '10'),
        maxConversationLength: parseInt(process.env.AGENT_MAX_CONVERSATION_LENGTH || '50'),
        enableLogging: process.env.AGENT_ENABLE_LOGGING !== 'false',
        llmConfig: {
            llmname: process.env.AGENT_LLM_NAME || 'DefaultLLM',
            model: process.env.AGENT_LLM_MODEL,
            temperature: parseFloat(process.env.AGENT_LLM_TEMPERATURE || '0.7'),
            maxTokens: process.env.AGENT_LLM_MAX_TOKENS ? parseInt(process.env.AGENT_LLM_MAX_TOKENS) : undefined,
            apiKey: process.env.AGENT_LLM_API_KEY,
            baseUrl: process.env.AGENT_LLM_BASE_URL
        },
        retryConfig: {
            maxRetries: parseInt(process.env.AGENT_MAX_RETRIES || '3'),
            retryDelay: parseInt(process.env.AGENT_RETRY_DELAY || '1000')
        }
    };

    return createUnifiedAgent(config);
}

/**
 * Utility to benchmark agent performance
 */
export async function benchmarkAgent(
    agent: UnifiedAgent,
    testCases: Array<{
        name: string;
        input: any;
        expectedOutput?: any;
    }>
): Promise<{
    results: Array<{
        name: string;
        success: boolean;
        duration: number;
        output: any;
        error?: string;
    }>;
    summary: {
        totalTests: number;
        passed: number;
        failed: number;
        averageDuration: number;
    };
}> {
    const results = [];
    let totalDuration = 0;

    for (const testCase of testCases) {
        const startTime = Date.now();
        let success = false;
        let output: any;
        let error: string | undefined;

        try {
            output = await agent.execute({
                userMessage: testCase.input
            });
            success = true;
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            success = false;
        }

        const duration = Date.now() - startTime;
        totalDuration += duration;

        results.push({
            name: testCase.name,
            success,
            duration,
            output,
            error
        });
    }

    const summary = {
        totalTests: testCases.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        averageDuration: totalDuration / testCases.length
    };

    return { results, summary };
}
