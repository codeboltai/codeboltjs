/**
 * Example demonstrating how to use follow-up conversation processors
 * with the Unified Agent Framework
 */

import { 
    createUnifiedAgent,
    createUnifiedResponseExecutor,
    UnifiedAgentConfig 
} from '../index';
import {
    ConversationCompactorProcessor,
    FollowUpConversationProcessor,
    ConversationContinuityProcessor
} from '../processors';
import type { CodeboltAPI, OpenAITool } from '../types/libTypes';

/**
 * Example 1: Basic Follow-Up Processor Usage
 */
export async function basicFollowUpProcessorExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    // Create processors
    const compactorProcessor = new ConversationCompactorProcessor({
        maxConversationLength: 30,
        enableSummarization: true,
        enableSmartRemoval: true,
        preserveRecentMessages: 8
    });

    const followUpProcessor = new FollowUpConversationProcessor({
        processingMode: 'guided',
        enableToolResultEnhancement: true,
        addFollowUpPrompts: true
    });

    // Create response executor with processors
    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        maxConversationLength: 50,
        followUpConversationProcessors: [
            compactorProcessor,
            followUpProcessor
        ]
    });

    // Create unified agent
    const agent = createUnifiedAgent({
        codebolt,
        maxIterations: 10,
        enableLogging: true
    });

    // Set the enhanced response executor
    agent.setResponseExecutor(responseExecutor);

    // Execute agent with a complex task
    const result = await agent.loop({
        userMessage: "Please read the package.json file, analyze its dependencies, and suggest optimizations",
        tools,
        maxIterations: 15
    });

    console.log('Agent completed with enhanced follow-up processing:', result.response);
    return result;
}

/**
 * Example 2: Advanced Processor Configuration
 */
export async function advancedFollowUpProcessorExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    // Create conversation compactor with custom settings
    const compactorProcessor = new ConversationCompactorProcessor({
        maxConversationLength: 40,
        compactionThreshold: 0.75, // Compact when 75% full
        preserveRecentMessages: 12,
        preserveSystemMessages: true,
        preserveToolMessages: true,
        enableSummarization: true,
        enableSmartRemoval: true,
        compressionRatio: 0.5 // Target 50% compression
    });

    // Create follow-up processor with automatic mode
    const followUpProcessor = new FollowUpConversationProcessor({
        processingMode: 'automatic',
        enableToolResultEnhancement: true,
        addFollowUpPrompts: true,
        addContextualHints: true,
        maxFollowUpMessages: 2
    });

    // Create continuity processor
    const continuityProcessor = new ConversationContinuityProcessor({
        enableContextLinking: true,
        enableReferenceResolution: true,
        enableGapDetection: true,
        maxContextLinks: 3,
        contextLookbackWindow: 15,
        enableProactiveContext: true
    });

    // Create response executor with all processors
    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        maxConversationLength: 60,
        enableLogging: true,
        followUpConversationProcessors: [
            compactorProcessor,
            followUpProcessor,
            continuityProcessor
        ]
    });

    // Create agent configuration
    const agentConfig: UnifiedAgentConfig = {
        codebolt,
        maxIterations: 20,
        maxConversationLength: 60,
        enableLogging: true,
        llmConfig: {
            llmname: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000
        }
    };

    const agent = createUnifiedAgent(agentConfig);
    agent.setResponseExecutor(responseExecutor);

    // Add event listeners to monitor processor activity
    agent.addEventListener('response_generated', (event) => {
        console.log('Response generated with processor enhancements:', event.data);
    });

    agent.addEventListener('tool_execution_completed', (event) => {
        console.log('Tool execution completed, processors will enhance follow-up:', event.data);
    });

    // Execute a multi-step task
    const result = await agent.loop({
        userMessage: "Help me set up a new React project with TypeScript, configure ESLint and Prettier, and create a basic component structure",
        tools,
        maxIterations: 25
    });

    return result;
}

/**
 * Example 3: Dynamic Processor Management
 */
export async function dynamicProcessorManagementExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    // Create response executor without initial processors
    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        maxConversationLength: 50,
        enableLogging: true
    });

    const agent = createUnifiedAgent({ codebolt });
    agent.setResponseExecutor(responseExecutor);

    // Start with basic processing
    console.log('Starting with no processors...');
    
    let result = await agent.step({
        userMessage: "List the files in the current directory",
        tools
    });

    // Add compactor processor when conversation gets longer
    console.log('Adding compactor processor...');
    const compactorProcessor = new ConversationCompactorProcessor({
        maxConversationLength: 20,
        enableSummarization: true
    });
    responseExecutor.addFollowUpConversationProcessor(compactorProcessor);

    result = await agent.step({
        userMessage: "Now read the README.md file and summarize it",
        tools,
        conversationHistory: result.conversationHistory
    });

    // Add follow-up processor for better guidance
    console.log('Adding follow-up processor...');
    const followUpProcessor = new FollowUpConversationProcessor({
        processingMode: 'guided',
        enableToolResultEnhancement: true
    });
    responseExecutor.addFollowUpConversationProcessor(followUpProcessor);

    result = await agent.step({
        userMessage: "Based on the README, what are the next steps I should take?",
        tools,
        conversationHistory: result.conversationHistory
    });

    // Remove processors if needed
    console.log('Removing compactor processor...');
    responseExecutor.removeFollowUpConversationProcessor(compactorProcessor);

    // Check active processors
    const activeProcessors = responseExecutor.getFollowUpConversationProcessors();
    console.log(`Active processors: ${activeProcessors.length}`);

    return result;
}

/**
 * Example 4: Processor Event Monitoring
 */
export async function processorEventMonitoringExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    // Create processors with logging
    const compactorProcessor = new ConversationCompactorProcessor({
        maxConversationLength: 25,
        enableSummarization: true,
        enableSmartRemoval: true
    });

    const followUpProcessor = new FollowUpConversationProcessor({
        processingMode: 'automatic',
        enableToolResultEnhancement: true,
        addFollowUpPrompts: true
    });

    // Monitor processor events by extending the processors
    class MonitoredCompactorProcessor extends ConversationCompactorProcessor {
        async processInput(input: any): Promise<any[]> {
            console.log('🔄 Compactor processor starting...');
            const results = await super.processInput(input);
            
            results.forEach(result => {
                switch (result.type) {
                    case 'ConversationCompacted':
                        console.log('✂️ Conversation compacted:', result.value);
                        break;
                    case 'ConversationCompactionSkipped':
                        console.log('⏭️ Compaction skipped:', result.value.reason);
                        break;
                    case 'ConversationCompactionError':
                        console.log('❌ Compaction error:', result.value.error);
                        break;
                }
            });
            
            return results;
        }
    }

    class MonitoredFollowUpProcessor extends FollowUpConversationProcessor {
        async processInput(input: any): Promise<any[]> {
            console.log('💬 Follow-up processor starting...');
            const results = await super.processInput(input);
            
            results.forEach(result => {
                switch (result.type) {
                    case 'FollowUpConversationProcessed':
                        console.log('🎯 Follow-up processed:', result.value);
                        break;
                    case 'FollowUpProcessingSkipped':
                        console.log('⏭️ Follow-up processing skipped:', result.value.reason);
                        break;
                }
            });
            
            return results;
        }
    }

    // Create response executor with monitored processors
    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        maxConversationLength: 40,
        enableLogging: true,
        followUpConversationProcessors: [
            new MonitoredCompactorProcessor(),
            new MonitoredFollowUpProcessor()
        ]
    });

    const agent = createUnifiedAgent({ codebolt, enableLogging: true });
    agent.setResponseExecutor(responseExecutor);

    // Execute with monitoring
    const result = await agent.loop({
        userMessage: "Help me debug this JavaScript code and fix any issues you find",
        tools,
        maxIterations: 15
    });

    return result;
}

/**
 * Example 5: Custom Processor Creation
 */
export class CustomMetricsProcessor extends ConversationCompactorProcessor {
    private metricsCollected: Array<{
        timestamp: string;
        messageCount: number;
        toolCount: number;
        processingTime: number;
    }> = [];

    async processInput(input: any): Promise<any[]> {
        const startTime = Date.now();
        const results = await super.processInput(input);
        const processingTime = Date.now() - startTime;

        // Collect metrics
        this.metricsCollected.push({
            timestamp: new Date().toISOString(),
            messageCount: input.message.messages.length,
            toolCount: input.context?.toolResults?.length || 0,
            processingTime
        });

        // Add metrics event
        results.push(this.createEvent('MetricsCollected', {
            totalProcessingTime: processingTime,
            averageProcessingTime: this.getAverageProcessingTime(),
            totalInteractions: this.metricsCollected.length
        }));

        return results;
    }

    private getAverageProcessingTime(): number {
        if (this.metricsCollected.length === 0) return 0;
        const total = this.metricsCollected.reduce((sum, metric) => sum + metric.processingTime, 0);
        return total / this.metricsCollected.length;
    }

    getMetrics() {
        return [...this.metricsCollected];
    }
}

export async function customProcessorExample(codebolt: CodeboltAPI, tools: OpenAITool[]) {
    const customProcessor = new CustomMetricsProcessor({
        maxConversationLength: 30,
        enableSummarization: true
    });

    const responseExecutor = createUnifiedResponseExecutor({
        codebolt,
        followUpConversationProcessors: [customProcessor]
    });

    const agent = createUnifiedAgent({ codebolt });
    agent.setResponseExecutor(responseExecutor);

    const result = await agent.loop({
        userMessage: "Analyze the performance of this application and suggest improvements",
        tools,
        maxIterations: 10
    });

    // Get collected metrics
    const metrics = customProcessor.getMetrics();
    console.log('Collected metrics:', metrics);

    return { result, metrics };
}
