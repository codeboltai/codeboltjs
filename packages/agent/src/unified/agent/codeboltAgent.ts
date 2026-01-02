import codebolt from '@codebolt/codeboltjs';
import {
    AgentConfig,
    AgentStepOutput,
    MessageModifier,
    PostInferenceProcessor,
    PostToolCallProcessor,
    PreInferenceProcessor,
    PreToolCallProcessor,
    ProcessedMessage
} from "@codebolt/types/agent";
import { FlatUserMessage } from "@codebolt/types/sdk";
import { InitialPromptGenerator } from "../base";
import { ResponseExecutor } from "../base/responseExecutor";
import { AgentStep } from "../base/agentStep";

/**
 * Configuration options for CodeboltAgent
 */
export interface CodeboltAgentConfig extends AgentConfig {
    /** 
     * Whether to automatically start listening for messages on construction.
     * Defaults to true.
     */
    autoListen?: boolean;

    /**
     * Enable logging for debugging purposes.
     * Defaults to true.
     */
    enableLogging?: boolean;
}

/**
 * CodeboltAgent is a high-level agent class that:
 * - Sets up a message listener via codebolt.onMessage
 * - Uses InitialPromptGenerator with configurable processors/modifiers
 * - Runs an agent loop with AgentStep and ResponseExecutor
 * - Handles tool execution and conversation flow automatically
 * 
 * @example
 * ```typescript
 * import { CodeboltAgent } from '@codebolt/agent/unified';
 * import { 
 *     EnvironmentContextModifier,
 *     CoreSystemPromptModifier,
 *     DirectoryContextModifier,
 *     IdeContextModifier,
 *     AtFileProcessorModifier,
 *     ToolInjectionModifier,
 *     ChatHistoryMessageModifier
 * } from '@codebolt/agent/processor-pieces';
 * 
 * const systemPrompt = `You are an AI coding assistant...`;
 * 
 * const agent = new CodeboltAgent({
 *     instructions: systemPrompt,
 *     processors: {
 *         messageModifiers: [
 *             new ChatHistoryMessageModifier({ enableChatHistory: true }),
 *             new EnvironmentContextModifier({ enableFullContext: true }),
 *             new DirectoryContextModifier(),
 *             new IdeContextModifier({
 *                 includeActiveFile: true,
 *                 includeOpenFiles: true,
 *                 includeCursorPosition: true,
 *                 includeSelectedText: true
 *             }),
 *             new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
 *             new ToolInjectionModifier({ includeToolDescriptions: true }),
 *             new AtFileProcessorModifier({ enableRecursiveSearch: true })
 *         ],
 *         preInferenceProcessors: [],
 *         postInferenceProcessors: [],
 *         preToolCallProcessors: [],
 *         postToolCallProcessors: []
 *     }
 * });
 * ```
 */
export class CodeboltAgent {
    private readonly config: CodeboltAgentConfig;
    private readonly messageModifiers: MessageModifier[];
    private readonly preInferenceProcessors: PreInferenceProcessor[];
    private readonly postInferenceProcessors: PostInferenceProcessor[];
    private readonly preToolCallProcessors: PreToolCallProcessor[];
    private readonly postToolCallProcessors: PostToolCallProcessor[];
    private readonly enableLogging: boolean;
    private readonly baseSystemPrompt: string;
    private isListening: boolean = false;

    constructor(config: CodeboltAgentConfig) {
        this.config = { ...config };
        this.messageModifiers = config.processors?.messageModifiers || [];
        this.preInferenceProcessors = config.processors?.preInferenceProcessors || [];
        this.postInferenceProcessors = config.processors?.postInferenceProcessors || [];
        this.preToolCallProcessors = config.processors?.preToolCallProcessors || [];
        this.postToolCallProcessors = config.processors?.postToolCallProcessors || [];
        this.enableLogging = config.enableLogging !== false;
        this.baseSystemPrompt = config.instructions || 'Based on User Message send reply';

        // Auto-start listening if configured (default: true)
        if (config.autoListen !== false) {
            this.startListening();
        }
    }

    /**
     * Start listening for incoming messages via codebolt.onMessage
     */
    public startListening(): void {
        if (this.isListening) {
            if (this.enableLogging) {
                console.log('[CodeboltAgent] Already listening for messages');
            }
            return;
        }

        codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
            if (this.isListening) {
                await this.handleMessage(reqMessage);
            }
        });

        this.isListening = true;
        if (this.enableLogging) {
            console.log('[CodeboltAgent] Started listening for messages');
        }
    }

    /**
     * Stop listening for incoming messages
     */
    public stopListening(): void {
        if (!this.isListening) {
            return;
        }

        // Note: codebolt.onMessage doesn't return a cleanup function,
        // so we use the isListening flag to control message handling

        this.isListening = false;
        if (this.enableLogging) {
            console.log('[CodeboltAgent] Stopped listening for messages');
        }
    }

    /**
     * Handle an incoming message - processes through the agent pipeline
     */
    private async handleMessage(reqMessage: FlatUserMessage): Promise<void> {
        try {
            if (this.enableLogging) {
                console.log('[CodeboltAgent] Received message, starting processing');
            }

            // Create prompt generator with configured processors
            const promptGenerator = new InitialPromptGenerator({
                processors: this.messageModifiers,
                baseSystemPrompt: this.baseSystemPrompt,
                enableLogging: this.enableLogging
            });

            // Generate initial processed message
            let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
            let completed = false;

            // Agent loop - continue until task is complete
            do {
                // Execute agent step (LLM inference)
                const agentStep = new AgentStep({
                    preInferenceProcessors: this.preInferenceProcessors,
                    postInferenceProcessors: this.postInferenceProcessors
                });

                const stepResult: AgentStepOutput = await agentStep.executeStep(reqMessage, prompt);
                prompt = stepResult.nextMessage;

                if (this.enableLogging) {
                    // console.log('[CodeboltAgent] Agent step completed, executing response');
                }

                // Execute response (tool calls, etc.)
                const responseExecutor = new ResponseExecutor({
                    preToolCallProcessors: this.preToolCallProcessors,
                    postToolCallProcessors: this.postToolCallProcessors
                });

                const executionResult = await responseExecutor.executeResponse({
                    initialUserMessage: reqMessage,
                    actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
                    rawLLMOutput: stepResult.rawLLMResponse,
                    nextMessage: stepResult.nextMessage
                });

                completed = executionResult.completed;
                prompt = executionResult.nextMessage;

                if (completed) {
                    break;
                }
            } while (!completed);

            if (this.enableLogging) {
                console.log('[CodeboltAgent] Message processing completed');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            if (this.enableLogging) {
                console.error('[CodeboltAgent] Error processing message:', error);
            }

            // Optionally send error message to user
            try {
                await codebolt.chat.sendMessage(`An error occurred: ${errorMessage}`, {});
            } catch (sendError) {
                console.error('[CodeboltAgent] Failed to send error message:', sendError);
            }
        }
    }

    /**
     * Process a single message directly (without the listener)
     * Useful for testing or manual invocation
     */
    public async processMessage(reqMessage: FlatUserMessage): Promise<{ success: boolean; result: any; error?: string }> {
        try {
            const promptGenerator = new InitialPromptGenerator({
                processors: this.messageModifiers,
                baseSystemPrompt: this.baseSystemPrompt,
                enableLogging: this.enableLogging
            });

            let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
            let completed = false;

            while (!completed) {
                const agentStep = new AgentStep({
                    preInferenceProcessors: this.preInferenceProcessors,
                    postInferenceProcessors: this.postInferenceProcessors
                });

                const stepResult: AgentStepOutput = await agentStep.executeStep(reqMessage, prompt);
                prompt = stepResult.nextMessage;

                const responseExecutor = new ResponseExecutor({
                    preToolCallProcessors: this.preToolCallProcessors,
                    postToolCallProcessors: this.postToolCallProcessors
                });

                const executionResult = await responseExecutor.executeResponse({
                    initialUserMessage: reqMessage,
                    actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
                    rawLLMOutput: stepResult.rawLLMResponse,
                    nextMessage: stepResult.nextMessage
                });

                completed = executionResult.completed;
                prompt = executionResult.nextMessage;
            }

            return {
                success: true,
                result: prompt,
                error: undefined
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            if (this.enableLogging) {
                console.error('[CodeboltAgent] Execution failed:', error);
            }

            return {
                success: false,
                result: null,
                error: errorMessage
            };
        }
    }

    /**
     * Check if the agent is currently listening for messages
     */
    public isCurrentlyListening(): boolean {
        return this.isListening;
    }

    /**
     * Get the current configuration
     */
    public getConfig(): CodeboltAgentConfig {
        return { ...this.config };
    }

    /**
     * Get all message modifiers
     */
    public getMessageModifiers(): MessageModifier[] {
        return [...this.messageModifiers];
    }

    /**
     * Get all pre-inference processors
     */
    public getPreInferenceProcessors(): PreInferenceProcessor[] {
        return [...this.preInferenceProcessors];
    }

    /**
     * Get all post-inference processors
     */
    public getPostInferenceProcessors(): PostInferenceProcessor[] {
        return [...this.postInferenceProcessors];
    }

    /**
     * Get all pre-tool-call processors
     */
    public getPreToolCallProcessors(): PreToolCallProcessor[] {
        return [...this.preToolCallProcessors];
    }

    /**
     * Get all post-tool-call processors
     */
    public getPostToolCallProcessors(): PostToolCallProcessor[] {
        return [...this.postToolCallProcessors];
    }
}

/**
 * Factory function to create a CodeboltAgent with common defaults
 */
export function createCodeboltAgent(options: {
    systemPrompt: string;
    messageModifiers?: MessageModifier[];
    preInferenceProcessors?: PreInferenceProcessor[];
    postInferenceProcessors?: PostInferenceProcessor[];
    preToolCallProcessors?: PreToolCallProcessor[];
    postToolCallProcessors?: PostToolCallProcessor[];
    autoListen?: boolean;
    enableLogging?: boolean;
}): CodeboltAgent {
    return new CodeboltAgent({
        instructions: options.systemPrompt,
        processors: {
            messageModifiers: options.messageModifiers || [],
            preInferenceProcessors: options.preInferenceProcessors || [],
            postInferenceProcessors: options.postInferenceProcessors || [],
            preToolCallProcessors: options.preToolCallProcessors || [],
            postToolCallProcessors: options.postToolCallProcessors || []
        },
        autoListen: options.autoListen,
        enableLogging: options.enableLogging
    });
}
