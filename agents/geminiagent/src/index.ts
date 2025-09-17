import codebolt from '@codebolt/codeboltjs';
// Import from unified framework (adjust path as needed for your build system)
import {
    createAgent,
    createTool,
    HandleUrlMessageModifier,
    BaseContextMessageModifier,
    WorkingDirectoryMessageModifier,
    BaseSystemInstructionMessageModifier,
    ImageAttachmentMessageModifier,
    AddToolsListMessageModifier,
    LoopDetectionProcessor,
    AdvancedLoopDetectionProcessor,
    TokenManagementProcessor,
    ResponseValidationProcessor,
    ChatRecordingProcessor,
    TelemetryProcessor,
    ConversationCompactorProcessor,
    ContextManagementProcessor,
    FileReadTool,
    FileWriteTool,
    FileDeleteTool,
    FileMoveTool,
    FileCopyTool
} from '../../../packages/agent/src/unified/index';

// Zod for schema validation
import { z } from 'zod';

// Create unified tools using the new framework
const fileTools = [
    new FileReadTool(),
    new FileWriteTool(),
    new FileDeleteTool(),
    new FileMoveTool(),
    new FileCopyTool()
];

// Create the unified Gemini agent
const geminiAgent = createAgent({
    name: 'Gemini Agent',
    instructions: `You are a helpful AI assistant powered by Google's Gemini model. You can:
    - Answer questions and provide information
    - Help with coding and development tasks
    - Read, write, and manage files
    - Analyze images and documents
    - Browse web content from URLs
    
    Always be helpful, accurate, and provide clear explanations for your actions.`,
    
    description: 'Gemini-powered AI assistant with file operations and web browsing capabilities',
    
    tools: fileTools,
    
    // LLM Configuration for Gemini
    llmConfig: {
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 8192
    },
    
    // Execution settings
    maxIterations: 10,
    maxConversationLength: 50,
    enableLogging: true,
    
    // Enhanced processors for Gemini agent
    processors: {
        // Message modification processors
        messageModifiers: [
            new BaseContextMessageModifier({
                prependmessage: "This is Codebolt Agent. Setting up the Context.",
                datetime: true,
                osInfo: true,
                workingdir: true
            }),
            new WorkingDirectoryMessageModifier({
                showFolderStructureSummary: true,
                listFiles: true,
                listFilesDepth: 2,
                listFilesLimit: 200,
                listFilesIgnoreFromGitignore: true,
                listFilesIgnore: ["node_modules"]
            }),
            new BaseSystemInstructionMessageModifier({
                systemInstruction: "You are a helpful assistant that can answer questions and help with tasks."
            }),
            new HandleUrlMessageModifier({
                fetchUrlContent: true
            }),
            new ImageAttachmentMessageModifier({
                passImageAs: "URL"
            }),
            new AddToolsListMessageModifier({
                toolsList: fileTools,
                addToolsLocation: "InsidePrompt",
                giveToolExamples: true,
                maxToolExamples: 2
            })
        ],
        
        // Follow-up conversation processors
        followUpConversation: [
            // Core safety and performance
            new AdvancedLoopDetectionProcessor({
                toolCallThreshold: 5,
                contentLoopThreshold: 10,
                enableLLMDetection: false
            }),
            new TokenManagementProcessor({
                maxTokens: 128000,
                warningThreshold: 0.8,
                enableCompression: true
            }),
            
            // Context and intelligence
            new ContextManagementProcessor({
                enableProjectContext: true,
                enableIdeContext: true,
                enableDirectoryContext: true
            }),
            new ConversationCompactorProcessor({
                maxConversationLength: 30,
                compactionThreshold: 0.7,
                preserveRecentMessages: 5,
                enableSummarization: true
            }),
            
            // Legacy compatibility
            new LoopDetectionProcessor({ maxLoops: 10 }),
            
            // Monitoring and recording
            new ChatRecordingProcessor({
                enableTokenTracking: true,
                exportFormat: 'json',
                autoExport: false
            }),
            new TelemetryProcessor({
                enablePerformanceTracking: true,
                enableErrorTracking: true,
                enableUsageTracking: true,
                sampleRate: 1.0
            })
        ],
        
        // Pre-tool call processors
        preToolCall: [
            new ResponseValidationProcessor({
                validateToolCalls: true,
                validateContent: true,
                validateStructure: true
            })
        ]
    }
});

// Main message handler for CodeBolt using unified framework
codebolt.onMessage(async (message: any): Promise<any> => {
    try {
        console.log('[GeminiAgent] Processing message with unified framework:', message);
        
        // Extract the user message content
        let userMessage = '';
        if (typeof message === 'string') {
            userMessage = message;
        } else if (message.content) {
            userMessage = message.content;
        } else if (message.messages && message.messages.length > 0) {
            const lastMessage = message.messages[message.messages.length - 1];
            userMessage = lastMessage.content || '';
        } else {
            userMessage = JSON.stringify(message);
        }
        
        console.log('[GeminiAgent] Extracted user message:', userMessage);
        
        // Execute the unified agent
        const result = await geminiAgent.execute(userMessage, {
            maxIterations: 10,
            includeHistory: true,
            context: {
                sessionId: `gemini-${Date.now()}`,
                timestamp: new Date().toISOString(),
                originalMessage: message
            }
        });
        
        console.log('[GeminiAgent] Agent execution completed:', {
            success: result.success,
            iterations: result.iterations,
            toolsUsed: result.toolResults?.length || 0
        });
        
        // Send response to user
        if (result.success && result.response) {
            await codebolt.chat.sendMessage(result.response, {});
        } else if (result.error) {
            await codebolt.chat.sendMessage(`Sorry, I encountered an error: ${result.error}`, {});
        } else {
            await codebolt.chat.sendMessage('I was unable to process your request. Please try again.', {});
        }
        
        console.log('[GeminiAgent] Processing complete');
        return {
            success: result.success,
            iterations: result.iterations,
            response: result.response,
            error: result.error,
            toolResults: result.toolResults,
            conversationHistory: result.conversationHistory,
            executionTime: result.executionTime
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[GeminiAgent] Unexpected error:', errorMessage);
        
        // Send error message to user
        try {
            await codebolt.chat.sendMessage(`Sorry, I encountered an unexpected error: ${errorMessage}`, {});
        } catch (chatError) {
            console.error('[GeminiAgent] Failed to send error message to chat:', chatError);
        }
        
        return {
            success: false,
            error: errorMessage
        };
    }
});

// Export unified framework components for external use
export {
    createAgent,
    createTool,
    createWorkflow,
    createOrchestrator,
    Agent,
    Tool,
    UnifiedWorkflow,
    UnifiedOrchestrator
} from '../../../packages/agent/src/unified/index';

// Export the configured Gemini agent for external use
export { geminiAgent };

// Export utility functions for Gemini agent
export const getGeminiAgentStatus = () => ({
    name: geminiAgent.config.name,
    tools: geminiAgent.listTools().length,
    processors: {
        messageModifiers: geminiAgent.config.processors?.messageModifiers?.length || 0,
        followUpConversation: geminiAgent.config.processors?.followUpConversation?.length || 0,
        preToolCall: geminiAgent.config.processors?.preToolCall?.length || 0
    },
    llmConfig: geminiAgent.config.llmConfig
});

export const executeGeminiAgent = async (message: string, options?: any) => {
    return await geminiAgent.execute(message, options);
};
