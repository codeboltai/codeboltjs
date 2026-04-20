import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";
import codebolt from "@codebolt/codeboltjs";
import type {
    ContextAssemblyRequest,
    ContextConstraints,
    MemoryContribution
} from "@codebolt/types/lib";
import {
    appendSystemContextMessage,
    appendUserContextMessage,
} from "../../unified/base/promptContext";

export interface ContextAssemblyModifierOptions {
    /** Scope variables to pass to the context assembly engine */
    scopeVariables?: Record<string, any>;
    /** Additional variables for memory resolution */
    additionalVariables?: Record<string, any> | undefined;
    /** Explicit memory IDs to include */
    explicitMemory?: string[] | undefined;
    /** Rule engine IDs to use for filtering */
    ruleEngineIds?: string[] | undefined;
    /** Constraints for context assembly */
    constraints?: ContextConstraints | undefined;
    /** Whether to include the user's input in the context request */
    includeUserInput?: boolean;
    /** Whether to inject context as system or user message */
    messageRole?: 'system' | 'user';
    /** Whether to validate the request before assembling */
    validateBeforeAssembly?: boolean;
    /** Custom formatter for memory contributions */
    formatContribution?: ((contribution: MemoryContribution) => string) | undefined;
}

export class ContextAssemblyModifier extends BaseMessageModifier {
    private readonly options: ContextAssemblyModifierOptions;

    constructor(options: ContextAssemblyModifierOptions = {}) {
        super();
        this.options = {
            scopeVariables: options.scopeVariables || {},
            additionalVariables: options.additionalVariables,
            explicitMemory: options.explicitMemory,
            ruleEngineIds: options.ruleEngineIds,
            constraints: options.constraints,
            includeUserInput: options.includeUserInput !== false,
            messageRole: options.messageRole || 'system',
            validateBeforeAssembly: options.validateBeforeAssembly || false,
            formatContribution: options.formatContribution,
        };
    }

    async modify(_originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            const request = this.buildRequest(createdMessage);

            // Optionally validate first
            if (this.options.validateBeforeAssembly) {
                const validation = await codebolt.contextAssembly.validate(request);
                if (!validation.success || (validation.data?.validation && !validation.data.validation.valid)) {
                    console.warn('Context assembly validation failed:', validation.data?.validation?.errors);
                    return createdMessage;
                }
            }

            const response = await codebolt.contextAssembly.getContext(request);

            if (!response.success || !response.data?.context) {
                console.warn('Context assembly failed:', response.error || response.message);
                return createdMessage;
            }

            const { context } = response.data;
            const contextContent = this.formatContext(context.contributions);

            if (!contextContent.trim()) {
                return createdMessage;
            }

            const contextMessage: MessageObject = {
                role: this.options.messageRole!,
                content: contextContent,
            };
            const updatedMessage = this.options.messageRole === 'user'
                ? appendUserContextMessage(createdMessage, contextMessage)
                : appendSystemContextMessage(createdMessage, contextMessage);

            return {
                ...updatedMessage,
                metadata: {
                    ...createdMessage.metadata,
                    contextAssemblyAdded: true,
                    contextAssemblyStats: {
                        totalTokens: context.total_tokens,
                        assemblyTimeMs: context.assembly_time_ms,
                        contributionCount: context.contributions.length,
                        appliedRules: context.applied_rules,
                        warnings: context.warnings,
                    },
                },
            };
        } catch (error) {
            console.error('Error in ContextAssemblyModifier:', error);
            return createdMessage;
        }
    }

    private buildRequest(createdMessage: ProcessedMessage): ContextAssemblyRequest {
        const request: ContextAssemblyRequest = {
            scope_variables: { ...this.options.scopeVariables },
        };

        if (this.options.includeUserInput) {
            const userMessage = createdMessage.message.messages.find(msg => msg.role === 'user');
            if (userMessage && typeof userMessage.content === 'string') {
                request.input = userMessage.content;
            }
        }

        if (this.options.additionalVariables) {
            request.additional_variables = this.options.additionalVariables;
        }

        if (this.options.explicitMemory) {
            request.explicit_memory = this.options.explicitMemory;
        }

        if (this.options.constraints) {
            request.constraints = this.options.constraints;
        }

        if (this.options.ruleEngineIds) {
            request.rule_engine_ids = this.options.ruleEngineIds;
        }

        return request;
    }

    private formatContext(contributions: MemoryContribution[]): string {
        if (contributions.length === 0) return '';

        const formatter = this.options.formatContribution || this.defaultFormatContribution;
        const parts = contributions.map(formatter);

        return `## Assembled Context\n\n${parts.join('\n\n')}`;
    }

    private defaultFormatContribution(contribution: MemoryContribution): string {
        return `### ${contribution.memory_label}\n${contribution.content}`;
    }

    /** Update scope variables at runtime */
    public setScopeVariables(variables: Record<string, any>): void {
        this.options.scopeVariables = { ...this.options.scopeVariables, ...variables };
    }

    /** Update additional variables at runtime */
    public setAdditionalVariables(variables: Record<string, any>): void {
        this.options.additionalVariables = { ...this.options.additionalVariables, ...variables };
    }

    /** Set explicit memory IDs to include */
    public setExplicitMemory(memoryIds: string[]): void {
        this.options.explicitMemory = memoryIds;
    }

    /** Set constraints for context assembly */
    public setConstraints(constraints: ContextConstraints): void {
        this.options.constraints = constraints;
    }
}


export interface RuleBasedContextModifierOptions {
    /** Scope variables for rule evaluation */
    scopeVariables?: Record<string, any>;
    /** Specific rule engine IDs to evaluate */
    ruleEngineIds?: string[] | undefined;
    /** Whether to inject context as system or user message */
    messageRole?: 'system' | 'user';
    /** Constraints for the final context assembly */
    constraints?: ContextConstraints | undefined;
}

export class RuleBasedContextModifier extends BaseMessageModifier {
    private readonly options: RuleBasedContextModifierOptions;

    constructor(options: RuleBasedContextModifierOptions = {}) {
        super();
        this.options = {
            scopeVariables: options.scopeVariables || {},
            ruleEngineIds: options.ruleEngineIds,
            messageRole: options.messageRole || 'system',
            constraints: options.constraints,
        };
    }

    async modify(_originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            // First evaluate rules to determine which memories to include
            const userMessage = createdMessage.message.messages.find(msg => msg.role === 'user');
            const input = userMessage && typeof userMessage.content === 'string' ? userMessage.content : undefined;

            const request: ContextAssemblyRequest = {
                scope_variables: { ...this.options.scopeVariables },
            };
            if (input) {
                request.input = input;
            }

            const ruleResult = await codebolt.contextAssembly.evaluateRules(request, this.options.ruleEngineIds);

            if (!ruleResult.success || !ruleResult.data) {
                console.warn('Rule evaluation failed:', ruleResult.error || ruleResult.message);
                return createdMessage;
            }

            const { included_memories, forced_memories } = ruleResult.data;
            const memoriesToFetch = [...new Set([...included_memories, ...forced_memories])];

            if (memoriesToFetch.length === 0) {
                return createdMessage;
            }

            // Now assemble context with only the rule-determined memories
            const assemblyRequest: ContextAssemblyRequest = {
                scope_variables: { ...this.options.scopeVariables },
                explicit_memory: memoriesToFetch,
            };
            if (input) {
                assemblyRequest.input = input;
            }
            if (this.options.constraints) {
                assemblyRequest.constraints = this.options.constraints;
            }

            const response = await codebolt.contextAssembly.getContext(assemblyRequest);

            if (!response.success || !response.data?.context) {
                console.warn('Context assembly failed after rule evaluation:', response.error);
                return createdMessage;
            }

            const { context } = response.data;
            const parts = context.contributions.map(
                (c: MemoryContribution) => `### ${c.memory_label}\n${c.content}`
            );
            const contextContent = `## Rule-Based Context\n\n${parts.join('\n\n')}`;

            if (!contextContent.trim()) {
                return createdMessage;
            }

            const contextMessage: MessageObject = {
                role: this.options.messageRole!,
                content: contextContent,
            };

            const messages = [...createdMessage.message.messages, contextMessage];

            return {
                message: {
                    ...createdMessage.message,
                    messages,
                },
                metadata: {
                    ...createdMessage.metadata,
                    ruleBasedContextAdded: true,
                    ruleEvaluation: {
                        matchedRules: ruleResult.data.matched_rules,
                        includedMemories: included_memories,
                        excludedMemories: ruleResult.data.excluded_memories,
                        forcedMemories: forced_memories,
                    },
                    contextAssemblyStats: {
                        totalTokens: context.total_tokens,
                        assemblyTimeMs: context.assembly_time_ms,
                        contributionCount: context.contributions.length,
                    },
                },
            };
        } catch (error) {
            console.error('Error in RuleBasedContextModifier:', error);
            return createdMessage;
        }
    }

    /** Update scope variables at runtime */
    public setScopeVariables(variables: Record<string, any>): void {
        this.options.scopeVariables = { ...this.options.scopeVariables, ...variables };
    }

    /** Set specific rule engine IDs to evaluate */
    public setRuleEngineIds(ruleEngineIds: string[]): void {
        this.options.ruleEngineIds = ruleEngineIds;
    }
}


export interface MemoryTypeContextModifierOptions {
    /** Specific memory type names to fetch */
    memoryNames: string[];
    /** Scope variables for context assembly */
    scopeVariables?: Record<string, any>;
    /** Whether to auto-resolve required variables from the message */
    autoResolveVariables?: boolean;
    /** Whether to inject context as system or user message */
    messageRole?: 'system' | 'user';
    /** Constraints for context assembly */
    constraints?: ContextConstraints | undefined;
}

export class MemoryTypeContextModifier extends BaseMessageModifier {
    private readonly options: MemoryTypeContextModifierOptions;

    constructor(options: MemoryTypeContextModifierOptions) {
        super();
        this.options = {
            memoryNames: options.memoryNames,
            scopeVariables: options.scopeVariables || {},
            autoResolveVariables: options.autoResolveVariables || false,
            messageRole: options.messageRole || 'system',
            constraints: options.constraints,
        };
    }

    async modify(_originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            let additionalVariables: Record<string, any> | undefined;

            // Auto-resolve required variables if enabled
            if (this.options.autoResolveVariables) {
                const requiredVarsResponse = await codebolt.contextAssembly.getRequiredVariables(this.options.memoryNames);
                if (requiredVarsResponse.success && requiredVarsResponse.data) {
                    additionalVariables = this.resolveVariables(requiredVarsResponse.data, createdMessage);
                }
            }

            const userMessage = createdMessage.message.messages.find(msg => msg.role === 'user');
            const input = userMessage && typeof userMessage.content === 'string' ? userMessage.content : undefined;

            const request: ContextAssemblyRequest = {
                scope_variables: { ...this.options.scopeVariables },
                explicit_memory: this.options.memoryNames,
            };
            if (input) {
                request.input = input;
            }
            if (additionalVariables) {
                request.additional_variables = additionalVariables;
            }
            if (this.options.constraints) {
                request.constraints = this.options.constraints;
            }

            const response = await codebolt.contextAssembly.getContext(request);

            if (!response.success || !response.data?.context) {
                console.warn('Memory type context assembly failed:', response.error || response.message);
                return createdMessage;
            }

            const { context } = response.data;
            const parts = context.contributions.map(
                (c: MemoryContribution) => `### ${c.memory_label}\n${c.content}`
            );
            const contextContent = parts.join('\n\n');

            if (!contextContent.trim()) {
                return createdMessage;
            }

            const contextMessage: MessageObject = {
                role: this.options.messageRole!,
                content: contextContent,
            };

            const messages = [...createdMessage.message.messages, contextMessage];

            return {
                message: {
                    ...createdMessage.message,
                    messages,
                },
                metadata: {
                    ...createdMessage.metadata,
                    memoryTypeContextAdded: true,
                    memoryNames: this.options.memoryNames,
                    contextAssemblyStats: {
                        totalTokens: context.total_tokens,
                        assemblyTimeMs: context.assembly_time_ms,
                        contributionCount: context.contributions.length,
                    },
                },
            };
        } catch (error) {
            console.error('Error in MemoryTypeContextModifier:', error);
            return createdMessage;
        }
    }

    private resolveVariables(
        requiredVars: { scope_variables: string[]; additional_variables: Record<string, { type: string; required: boolean; from_memory: string }> },
        createdMessage: ProcessedMessage
    ): Record<string, any> {
        const resolved: Record<string, any> = {};

        for (const [key, _spec] of Object.entries(requiredVars.additional_variables)) {
            // Try to resolve from existing metadata
            if (createdMessage.metadata && key in createdMessage.metadata) {
                resolved[key] = createdMessage.metadata[key];
            }
        }

        return resolved;
    }

    /** Update memory names to fetch */
    public setMemoryNames(memoryNames: string[]): void {
        this.options.memoryNames = memoryNames;
    }

    /** Update scope variables at runtime */
    public setScopeVariables(variables: Record<string, any>): void {
        this.options.scopeVariables = { ...this.options.scopeVariables, ...variables };
    }
}
