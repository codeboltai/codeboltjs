import { AgentConfig, AgentInterface, AgentStepOutput, MessageModifier, PostInferenceProcessor, PostToolCallProcessor, PreInferenceProcessor, PreToolCallProcessor, ProcessedMessage } from "@codebolt/types/agent";
import { InitialPromptGenerator } from "../base";
import { FlatUserMessage } from "@codebolt/types/sdk";
import { ResponseExecutor } from "../base/responseExecutor";
import { AgentStep } from "../base/agentStep";
import { CompactionOrchestrator } from "../services/compaction/compactionOrchestrator";
import type { CompactionOrchestratorOptions } from "../services/compaction/types";



export class Agent implements AgentInterface {
    private readonly config: AgentConfig;
    private readonly messageModifiers: MessageModifier[];
    private readonly preInferenceProcessors: PreInferenceProcessor[];
    private readonly postInferenceProcessors: PostInferenceProcessor[];
    private readonly preToolCallProcessors: PreToolCallProcessor[];
    private readonly postToolCallProcessors: PostToolCallProcessor[];
    private readonly enableLogging: boolean;
    private readonly compactionOrchestrator: CompactionOrchestrator;

    constructor(config: AgentConfig) {
        this.config = { ...config };
        this.messageModifiers = config.processors?.messageModifiers || [];
        this.preInferenceProcessors = config.processors?.preInferenceProcessors || [];
        this.postInferenceProcessors = config.processors?.postInferenceProcessors || [];
        this.preToolCallProcessors = config.processors?.preToolCallProcessors || [];
        this.postToolCallProcessors = config.processors?.postToolCallProcessors || [];
        this.enableLogging = config.enableLogging !== false;
        this.compactionOrchestrator = new CompactionOrchestrator(
            ((config as AgentConfig & { compaction?: CompactionOrchestratorOptions }).compaction) || {},
        );
    }

    async execute(reqMessage: FlatUserMessage): Promise<{ success: boolean; result: any; error?: string; }> {
        if (!reqMessage) {
            return {
                success: false,
                result: null,
                error: 'Request message is required'
            };
        }

        try {
            const promptGenerator = new InitialPromptGenerator({
                processors: this.messageModifiers,
                baseSystemPrompt: this.config.instructions || 'Based on User Message send reply',
                enableLogging: this.enableLogging
            });

            let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
            let completed = false;

            while (!completed) {
                this.compactionOrchestrator.resetForTurn();
                prompt = await this.applyCompaction(prompt);

                const agentStep = new AgentStep({
                    preInferenceProcessors: this.preInferenceProcessors,
                    postInferenceProcessors: this.postInferenceProcessors
                });

                let stepResult: AgentStepOutput;
                try {
                    stepResult = await agentStep.executeStep(reqMessage, prompt);
                } catch (error) {
                    const recoveredPrompt = await this.tryRecoverPrompt(prompt, error);
                    if (!recoveredPrompt) {
                        throw error;
                    }

                    prompt = recoveredPrompt;
                    stepResult = await agentStep.executeStep(reqMessage, prompt);
                }
                prompt = stepResult.nextMessage;

                if (this.enableLogging) {
                    // console.log('[Agent] Step completed, processing response');
                }

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
                prompt = await this.applyCompaction(executionResult.nextMessage);
            }

            if (this.enableLogging) {
                // console.log('[Agent] Execution completed successfully');
            }

            return {
                success: true,
                result: prompt
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            if (this.enableLogging) {
                console.error('[Agent] Execution failed:', error);
            }

            return {
                success: false,
                result: null,
                error: errorMessage
            };
        }
    }

    private async applyCompaction(prompt: ProcessedMessage): Promise<ProcessedMessage> {
        const result = await this.compactionOrchestrator.compact(prompt.message.messages);
        if (!result.wasCompacted) {
            return prompt;
        }

        return {
            ...prompt,
            message: {
                ...prompt.message,
                messages: result.messages,
            },
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
            prompt.message.messages,
            error,
        );

        if (!recovery.wasCompacted) {
            return null;
        }

        return {
            ...prompt,
            message: {
                ...prompt.message,
                messages: recovery.messages,
            },
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

}
