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
import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier
} from '../../processor-pieces';

/**
 * Configuration options for CodeboltAgent
 */
export interface CodeboltAgentConfig extends AgentConfig {
    /**
     * Enable logging for debugging purposes.
     * Defaults to true.
     */
    enableLogging?: boolean;

    /**
     * Agent context to continue from.
     * When provided, the agent will skip initial prompt generation
     * and continue from where the previous agent left off.
     */
    context?: ProcessedMessage;

    /**
     * List of allowed tool names. If provided, only these tools will be available to the agent.
     * If not provided, all tools will be available.
     * Example: ['readFile', 'writeFile', 'executeCommand']
     */
    allowedTools?: string[];
}

/**
 * CodeboltAgent is a high-level agent class that:
 * - Uses InitialPromptGenerator with configurable processors/modifiers
 * - Runs an agent loop with AgentStep and ResponseExecutor
 * - Handles tool execution and conversation flow automatically
 * - Is triggered via processMessage (not via onMessage listener)
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
 * 
 * // Process a message (triggered from graph node)
 * const result = await agent.processMessage(userMessage);
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
    private readonly context: ProcessedMessage | undefined;
    private readonly allowedTools: string[] | undefined;

    constructor(config: CodeboltAgentConfig) {
        this.config = { ...config };
        this.enableLogging = config.enableLogging !== false;
        this.baseSystemPrompt = config.instructions || 'Based on User Message send reply';
        this.context = config.context;
        this.allowedTools = config.allowedTools;

        // Use provided modifiers or default ones
        this.messageModifiers = config.processors?.messageModifiers?.length
            ? config.processors.messageModifiers
            : this.createDefaultMessageModifiers(this.baseSystemPrompt, this.allowedTools);

        this.preInferenceProcessors = config.processors?.preInferenceProcessors || [];
        this.postInferenceProcessors = config.processors?.postInferenceProcessors || [];
        this.preToolCallProcessors = config.processors?.preToolCallProcessors || [];
        this.postToolCallProcessors = config.processors?.postToolCallProcessors || [];
    }

    /**
     * Creates default message modifiers when none are provided
     */
    private createDefaultMessageModifiers(systemPrompt: string, allowedTools?: string[]): MessageModifier[] {
        return [
            // 1. Chat History
            new ChatHistoryMessageModifier({ enableChatHistory: true }),
            // 2. Environment Context (date, OS)
            new EnvironmentContextModifier({ enableFullContext: true }),
            // 3. Directory Context (folder structure)
            new DirectoryContextModifier(),
            // 4. IDE Context (active file, opened files)
            new IdeContextModifier({
                includeActiveFile: true,
                includeOpenFiles: true,
                includeCursorPosition: true,
                includeSelectedText: true
            }),
            // 5. Core System Prompt (instructions)
            new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
            // 6. Tools (function declarations)
            new ToolInjectionModifier({
                includeToolDescriptions: true,
                ...(allowedTools && { allowedTools })
            }),
            // 7. At-file processing (@file mentions)
            new AtFileProcessorModifier({ enableRecursiveSearch: true })
        ];
    }

    /**
     * Creates a default FlatUserMessage from a string
     */
    private createDefaultUserMessage(message: string): FlatUserMessage {
        return {
            userMessage: message,
            selectedAgent: {
                id: 'codebolt-agent',
                name: 'Codebolt Agent'
            },
            mentionedFiles: [],
            mentionedFullPaths: [],
            mentionedFolders: [],
            mentionedMCPs: [],
            uploadedImages: [],
            mentionedAgents: [],
            messageId: `msg-${Date.now()}`,
            threadId: `thread-${Date.now()}`
        };
    }

    /**
     * Process a message through the agent pipeline.
     * This is the main entry point - triggered from graph nodes.
     * @param message - Either a string message or a FlatUserMessage object
     * @param context - Optional context from a previous agent to continue from
     */
    public async processMessage(
        message: string | FlatUserMessage,
        context?: ProcessedMessage
    ): Promise<{ success: boolean; result: any; context: ProcessedMessage | null; error?: string }> {
        try {
            if (this.enableLogging) {
                console.log('[CodeboltAgent] Processing message');
            }

            const reqMessage: FlatUserMessage = typeof message === 'string'
                ? this.createDefaultUserMessage(message)
                : message;

            // Use provided context, config context, or generate new one
            const contextToUse = context || this.context;
            let prompt: ProcessedMessage;

            if (contextToUse) {
                if (this.enableLogging) {
                    console.log('[CodeboltAgent] Continuing from previous context');
                }
                prompt = contextToUse;
            } else {
                const promptGenerator = new InitialPromptGenerator({
                    processors: this.messageModifiers,
                    baseSystemPrompt: this.baseSystemPrompt,
                    enableLogging: this.enableLogging
                });
                prompt = await promptGenerator.processMessage(reqMessage);
            }

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

            if (this.enableLogging) {
                console.log('[CodeboltAgent] Message processing completed');
            }

            return {
                success: true,
                result: prompt,
                context: prompt
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            if (this.enableLogging) {
                console.error('[CodeboltAgent] Execution failed:', error);
            }

            return {
                success: false,
                result: null,
                context: null,
                error: errorMessage
            };
        }
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
        enableLogging: options.enableLogging ?? true
    });
}
