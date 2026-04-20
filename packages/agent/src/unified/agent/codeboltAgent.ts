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
import { FlatUserMessage, LLMCompletion, Tool } from "@codebolt/types/sdk";
import codebolt from "@codebolt/codeboltjs";

import { InitialPromptGenerator } from "../base";
import { AgentStep } from "../base/agentStep";
import { ResponseExecutor } from "../base/responseExecutor";
import { getTranscriptMessages, replaceTranscriptMessages } from "../base/promptContext";
import { LoopDetectionService } from "../services/LoopDetectionService";
import { CompactionOrchestrator } from "../services/compaction/compactionOrchestrator";
import type { CompactionOrchestratorOptions } from "../services/compaction/types";
import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier
} from '../../processor-pieces';

export interface CodeboltAgentConfig extends AgentConfig {
    enableLogging?: boolean;
    context?: ProcessedMessage;
    allowedTools?: string[];
    compaction?: CompactionOrchestratorOptions;
    loopDetectionService?: LoopDetectionService;
    maxTurns?: number;
}

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
    private readonly compactionOrchestrator: CompactionOrchestrator;
    private readonly loopDetectionService: LoopDetectionService | undefined;
    private readonly maxTurns: number;

    constructor(config: CodeboltAgentConfig) {
        this.config = { ...config };
        this.enableLogging = config.enableLogging !== false;
        this.baseSystemPrompt = config.instructions || 'Based on User Message send reply';
        this.context = config.context;
        this.allowedTools = config.allowedTools;

        this.messageModifiers = config.processors?.messageModifiers?.length
            ? config.processors.messageModifiers
            : this.createDefaultMessageModifiers(this.baseSystemPrompt, this.allowedTools);

        this.preInferenceProcessors = config.processors?.preInferenceProcessors || [];
        this.postInferenceProcessors = config.processors?.postInferenceProcessors || [];
        this.preToolCallProcessors = config.processors?.preToolCallProcessors || [];
        this.postToolCallProcessors = config.processors?.postToolCallProcessors || [];
        this.compactionOrchestrator = new CompactionOrchestrator(config.compaction);
        this.loopDetectionService = config.loopDetectionService;
        this.maxTurns = config.maxTurns ?? 25;
    }

    private createDefaultMessageModifiers(systemPrompt: string, allowedTools?: string[]): MessageModifier[] {
        return [
            new ChatHistoryMessageModifier({ enableChatHistory: true }),
            new EnvironmentContextModifier({ enableFullContext: true }),
            new DirectoryContextModifier(),
            new IdeContextModifier({
                includeActiveFile: true,
                includeOpenFiles: true,
                includeCursorPosition: true,
                includeSelectedText: true
            }),
            new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
            new ToolInjectionModifier({
                includeToolDescriptions: true,
                ...(allowedTools && { allowedTools })
            }),
            new AtFileProcessorModifier({ enableRecursiveSearch: true })
        ];
    }

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

    public async processMessage(
        message: string | FlatUserMessage,
        context?: ProcessedMessage
    ): Promise<{ success: boolean; result: any; context: ProcessedMessage | null; finalMessage?: string; error?: string }> {
        try {
            const reqMessage: FlatUserMessage = typeof message === 'string'
                ? this.createDefaultUserMessage(message)
                : message;

            let prompt: ProcessedMessage;
            const contextToUse = context || this.context;

            if (contextToUse) {
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
            let turnNumber = 0;
            let finalMessage: string | undefined;

            while (!completed) {
                turnNumber += 1;
                if (turnNumber > this.maxTurns) {
                    throw new Error(`Agent exceeded the maximum turn limit of ${this.maxTurns}.`);
                }

                this.compactionOrchestrator.resetForTurn();
                prompt = await this.applyCompaction(prompt);
                prompt = await this.refreshAvailableTools(reqMessage, prompt);

                const agentStep = new AgentStep({
                    preInferenceProcessors: this.preInferenceProcessors,
                    postInferenceProcessors: this.postInferenceProcessors
                });

                let stepResult: AgentStepOutput | undefined;
                while (!stepResult) {
                    try {
                        const nextStepResult = await agentStep.executeStep(reqMessage, prompt);
                        const recoverableResponseError = this.getRecoverableResponseError(
                            nextStepResult.rawLLMResponse,
                        );

                        if (!recoverableResponseError) {
                            stepResult = nextStepResult;
                            break;
                        }

                        const recoveredPrompt = await this.tryRecoverPrompt(
                            prompt,
                            new Error(recoverableResponseError),
                        );
                        if (!recoveredPrompt) {
                            throw new Error(recoverableResponseError);
                        }

                        prompt = recoveredPrompt;
                    } catch (error) {
                        const recoveredPrompt = await this.tryRecoverPrompt(prompt, error);
                        if (!recoveredPrompt) {
                            throw error;
                        }

                        prompt = recoveredPrompt;
                    }
                }

                if (!stepResult) {
                    throw new Error('Agent step did not produce a response.');
                }

                const responseExecutor = new ResponseExecutor({
                    preToolCallProcessors: this.preToolCallProcessors,
                    postToolCallProcessors: this.postToolCallProcessors,
                    ...(this.loopDetectionService
                        ? { loopDetectionService: this.loopDetectionService }
                        : {}),
                });

                const executionResult = await responseExecutor.executeResponse({
                    initialUserMessage: reqMessage,
                    actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
                    rawLLMOutput: stepResult.rawLLMResponse,
                    nextMessage: stepResult.nextMessage
                });

                completed = executionResult.completed;
                prompt = executionResult.nextMessage;
                finalMessage = executionResult.finalMessage;
            }

            return {
                success: true,
                result: prompt,
                context: prompt,
                ...(finalMessage !== undefined ? { finalMessage } : {}),
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

    public getConfig(): CodeboltAgentConfig {
        return { ...this.config };
    }

    public getMessageModifiers(): MessageModifier[] {
        return [...this.messageModifiers];
    }

    public getPreInferenceProcessors(): PreInferenceProcessor[] {
        return [...this.preInferenceProcessors];
    }

    public getPostInferenceProcessors(): PostInferenceProcessor[] {
        return [...this.postInferenceProcessors];
    }

    public getPreToolCallProcessors(): PreToolCallProcessor[] {
        return [...this.preToolCallProcessors];
    }

    public getPostToolCallProcessors(): PostToolCallProcessor[] {
        return [...this.postToolCallProcessors];
    }

    private async applyCompaction(prompt: ProcessedMessage): Promise<ProcessedMessage> {
        const result = await this.compactionOrchestrator.compact(getTranscriptMessages(prompt));
        if (!result.wasCompacted) {
            return prompt;
        }

        return {
            ...replaceTranscriptMessages(prompt, result.messages),
            metadata: {
                ...prompt.metadata,
                compaction: {
                    totalTokensFreed: result.totalTokensFreed,
                    layersApplied: result.layersApplied,
                    boundaries: result.boundaries,
                    timestamp: new Date().toISOString(),
                },
            },
        };
    }

    private async tryRecoverPrompt(
        prompt: ProcessedMessage,
        error: unknown,
    ): Promise<ProcessedMessage | null> {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!this.compactionOrchestrator.getReactiveLayer().isRecoverableError(errorMessage)) {
            return null;
        }

        const recovery = await this.compactionOrchestrator.recoverFromError(
            getTranscriptMessages(prompt),
            error,
        );

        if (!recovery.wasCompacted) {
            return null;
        }

        return {
            ...replaceTranscriptMessages(prompt, recovery.messages),
            metadata: {
                ...prompt.metadata,
                reactiveCompaction: {
                    totalTokensFreed: recovery.totalTokensFreed,
                    layersApplied: recovery.layersApplied,
                    boundaries: recovery.boundaries,
                    timestamp: new Date().toISOString(),
                    error: errorMessage,
                },
            },
        };
    }

    private async refreshAvailableTools(
        originalRequest: FlatUserMessage,
        prompt: ProcessedMessage,
    ): Promise<ProcessedMessage> {
        if (
            prompt.metadata?.['toolsInjected'] !== true ||
            prompt.metadata?.['toolsLocation'] !== 'Tool'
        ) {
            return prompt;
        }

        const existingTools = Array.isArray(prompt.message.tools)
            ? prompt.message.tools
            : [];

        try {
            const toolsResponse: any = await codebolt.mcp.listMcpFromServers(['codebolt']);
            let refreshedTools: Tool[] = toolsResponse?.data?.tools || toolsResponse?.data || [];
            const mentionedMCPs = Array.isArray(originalRequest.mentionedMCPs)
                ? originalRequest.mentionedMCPs
                : [];

            if (mentionedMCPs.length > 0) {
                const { data: mentionedTools } = await (codebolt.mcp.getTools as any)(mentionedMCPs);
                refreshedTools = [...refreshedTools, ...((mentionedTools || []) as unknown as Tool[])];
            }

            const allowedToolNames = this.getAllowedToolNames(prompt);
            if (allowedToolNames && allowedToolNames.length > 0) {
                const allowed = new Set(allowedToolNames);
                refreshedTools = refreshedTools.filter(
                    (tool) => !!tool.function?.name && allowed.has(tool.function.name),
                );
            }

            const mergedTools = this.mergeTools(existingTools, refreshedTools);

            return {
                ...prompt,
                message: {
                    ...prompt.message,
                    tools: mergedTools,
                    ...(mergedTools.length > 0
                        ? { tool_choice: prompt.message.tool_choice ?? 'auto' }
                        : {}),
                },
                metadata: {
                    ...prompt.metadata,
                    toolsCount: mergedTools.length,
                    toolsRefreshedAt: new Date().toISOString(),
                },
            };
        } catch (error) {
            if (this.enableLogging) {
                console.error('[CodeboltAgent] Failed to refresh tools:', error);
            }

            return prompt;
        }
    }

    private mergeTools(existingTools: Tool[], refreshedTools: Tool[]): Tool[] {
        const mergedTools = new Map<string, Tool>();

        for (const tool of refreshedTools) {
            const toolName = tool.function?.name;
            if (toolName) {
                mergedTools.set(toolName, tool);
            }
        }

        for (const tool of existingTools) {
            const toolName = tool.function?.name;
            if (toolName && !mergedTools.has(toolName)) {
                mergedTools.set(toolName, tool);
            }
        }

        return Array.from(mergedTools.values());
    }

    private getAllowedToolNames(prompt: ProcessedMessage): string[] | undefined {
        const metadataAllowedTools = prompt.metadata?.['allowedTools'];
        if (Array.isArray(metadataAllowedTools)) {
            const allowedToolNames = metadataAllowedTools.filter(
                (toolName): toolName is string => typeof toolName === 'string' && toolName.length > 0,
            );

            if (allowedToolNames.length > 0) {
                return allowedToolNames;
            }
        }

        return this.allowedTools;
    }

    private getRecoverableResponseError(response: LLMCompletion): string | null {
        const reactiveLayer = this.compactionOrchestrator.getReactiveLayer();
        const candidateMessages = this.collectResponseMessages(response);
        const recoverableMessage = candidateMessages.find((message) =>
            reactiveLayer.isRecoverableError(message),
        );

        if (recoverableMessage) {
            return recoverableMessage;
        }

        const finishReasons = [
            response.finish_reason,
            ...(response.choices ?? []).map((choice) => choice.finish_reason),
        ].filter((reason): reason is string => typeof reason === 'string');
        const hasLengthFinishReason = finishReasons.some(
            (reason) => reason.toLowerCase() === 'length',
        );
        const hasToolCalls =
            (response.tool_calls?.length ?? 0) > 0 ||
            (response.choices ?? []).some(
                (choice) => (choice.message?.tool_calls?.length ?? 0) > 0,
            );

        if (hasLengthFinishReason && candidateMessages.length === 0 && !hasToolCalls) {
            return 'Too many tokens or token limit reached before producing usable output.';
        }

        return null;
    }

    private collectResponseMessages(response: LLMCompletion): string[] {
        const messages: string[] = [];

        if (typeof response.content === 'string' && response.content.trim().length > 0) {
            messages.push(response.content.trim());
        }

        for (const choice of response.choices ?? []) {
            if (
                typeof choice.message?.content === 'string' &&
                choice.message.content.trim().length > 0
            ) {
                messages.push(choice.message.content.trim());
            }
        }

        return messages;
    }
}

export function createCodeboltAgent(options: {
    systemPrompt: string;
    messageModifiers?: MessageModifier[];
    preInferenceProcessors?: PreInferenceProcessor[];
    postInferenceProcessors?: PostInferenceProcessor[];
    preToolCallProcessors?: PreToolCallProcessor[];
    postToolCallProcessors?: PostToolCallProcessor[];
    enableLogging?: boolean;
    compaction?: CompactionOrchestratorOptions;
    loopDetectionService?: LoopDetectionService;
    maxTurns?: number;
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
        enableLogging: options.enableLogging ?? true,
        ...(options.compaction ? { compaction: options.compaction } : {}),
        ...(options.loopDetectionService ? { loopDetectionService: options.loopDetectionService } : {}),
        ...(options.maxTurns !== undefined ? { maxTurns: options.maxTurns } : {}),
    });
}
