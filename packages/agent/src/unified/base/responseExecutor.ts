import {
    AgentResponseExecutor,
    PostToolCallProcessor,
    PreToolCallProcessor,
    ProcessedMessage,
    ResponseInput,
    ResponseOutput,
    ToolResult
} from '@codebolt/types/agent';
import { LLMCompletion, MessageObject, ToolCall } from '@codebolt/types/sdk';
import codebolt from '@codebolt/codeboltjs';

import { LoopDetectionService } from '../services/LoopDetectionService';
import {
    appendTranscriptMessages,
    getTranscriptMessages,
    reconcileRuntimePromptContext,
} from './promptContext';

interface ParsedToolCall {
    tool: ToolCall;
    toolInput: Record<string, unknown>;
    toolName: string;
    toolUseId: string;
    waitForPrevious: boolean;
}

interface ToolExecutionOutcome {
    toolResults: ToolResult[];
    followUpMessages: MessageObject[];
    completed: boolean;
    finalMessage: string | undefined;
    hadToolCalls: boolean;
}

interface SingleToolExecutionResult {
    toolResult: ToolResult;
    followUpMessages: MessageObject[];
    didUserReject: boolean;
}

export class ResponseExecutor implements AgentResponseExecutor {

    private preToolCallProcessors: PreToolCallProcessor[] = [];
    private postToolCallProcessors: PostToolCallProcessor[] = [];
    private completed = false;
    private finalMessage: string | undefined = undefined;
    private loopDetectionService: LoopDetectionService | undefined;

    constructor(options: {
        preToolCallProcessors: PreToolCallProcessor[];
        postToolCallProcessors: PostToolCallProcessor[];
        loopDetectionService?: LoopDetectionService;
    }) {
        this.preToolCallProcessors = options.preToolCallProcessors;
        this.postToolCallProcessors = options.postToolCallProcessors;
        this.loopDetectionService = options.loopDetectionService;
    }

    async executeResponse(input: ResponseInput): Promise<ResponseOutput> {
        this.completed = false;
        this.finalMessage = undefined;

        let nextMessage: ProcessedMessage = reconcileRuntimePromptContext(input.nextMessage);

        for (const preToolCallProcessor of this.preToolCallProcessors) {
            try {
                const { nextPrompt, shouldExit } = await preToolCallProcessor.modify({
                    llmMessageSent: input.actualMessageSentToLLM,
                    rawLLMResponseMessage: input.rawLLMOutput,
                    nextPrompt: nextMessage,
                });

                nextMessage = reconcileRuntimePromptContext(nextPrompt);
                if (shouldExit) {
                    this.completed = true;
                    break;
                }
            } catch (error) {
                console.error(`[ResponseExecutor] Error in pre tool call processor:`, error);
            }
        }

        const toolExecution = await this.executeTools(input.rawLLMOutput);
        this.completed = this.completed || toolExecution.completed;
        this.finalMessage = toolExecution.finalMessage ?? this.finalMessage;

        this.injectDiscoveredTools(
            input.rawLLMOutput,
            toolExecution.toolResults,
            nextMessage,
        );

        if (toolExecution.toolResults.length > 0 || toolExecution.followUpMessages.length > 0) {
            nextMessage = appendTranscriptMessages(nextMessage, [
                ...toolExecution.toolResults.map((toolResult) => ({
                    role: toolResult.role,
                    content: typeof toolResult.content === 'string'
                        ? toolResult.content
                        : JSON.stringify(toolResult.content),
                    tool_call_id: toolResult.tool_call_id,
                })),
                ...toolExecution.followUpMessages,
            ]);
        }

        const transcriptLengthBeforePostToolProcessors = getTranscriptMessages(nextMessage).length;
        for (const postToolCallProcessor of this.postToolCallProcessors) {
            try {
                const { nextPrompt, shouldExit } = await postToolCallProcessor.modify({
                    llmMessageSent: input.actualMessageSentToLLM,
                    rawLLMResponseMessage: input.rawLLMOutput,
                    nextPrompt: nextMessage,
                    toolResults: toolExecution.toolResults,
                    tokenLimit: input.rawLLMOutput?.tokenLimit,
                    maxOutputTokens: input.rawLLMOutput?.maxOutputTokens
                });

                nextMessage = reconcileRuntimePromptContext(nextPrompt);

                if (shouldExit) {
                    this.completed = true;
                    break;
                }
            } catch (error) {
                console.error(`[ResponseExecutor] Error in post tool call processor:`, error);
            }
        }

        const transcriptLengthAfterPostToolProcessors = getTranscriptMessages(nextMessage).length;
        if (
            !toolExecution.hadToolCalls &&
            transcriptLengthAfterPostToolProcessors > transcriptLengthBeforePostToolProcessors
        ) {
            this.completed = false;
            this.finalMessage = undefined;
        }

        const output: ResponseOutput = {
            completed: this.completed,
            nextMessage,
            toolResults: toolExecution.toolResults,
        };
        if (this.finalMessage !== undefined) {
            output.finalMessage = this.finalMessage;
        }

        return output;
    }

    private parseToolCall(tool: ToolCall): ParsedToolCall {
        let toolInput: Record<string, unknown> = {};
        if (tool.function.arguments) {
            try {
                const parsedArguments = JSON.parse(tool.function.arguments);
                if (parsedArguments && typeof parsedArguments === 'object' && !Array.isArray(parsedArguments)) {
                    toolInput = parsedArguments as Record<string, unknown>;
                }
            } catch (parseError) {
                throw new Error(`Failed to parse tool arguments: ${parseError}`);
            }
        }

        return {
            tool,
            toolInput,
            toolName: tool.function.name,
            toolUseId: tool.id,
            waitForPrevious: toolInput['waitForPreviousTools'] === true,
        };
    }

    private extractLastMessageContent(llmResponse: LLMCompletion): string | undefined {
        for (const choice of llmResponse.choices ?? []) {
            if (choice.message?.content) {
                return choice.message.content;
            }

            const reasoningContent = (choice.message as MessageObject & {
                reasoning_content?: string;
            } | undefined)?.reasoning_content;
            if (reasoningContent) {
                return reasoningContent;
            }
        }

        return undefined;
    }

    private getToolCalls(llmResponse: LLMCompletion): ToolCall[] {
        const toolCallsById = new Map<string, ToolCall>();

        for (const toolCall of llmResponse.tool_calls ?? []) {
            if (toolCall?.id) {
                toolCallsById.set(toolCall.id, toolCall);
            }
        }

        for (const choice of llmResponse.choices ?? []) {
            for (const toolCall of choice.message?.tool_calls ?? []) {
                if (toolCall?.id && !toolCallsById.has(toolCall.id)) {
                    toolCallsById.set(toolCall.id, toolCall);
                }
            }
        }

        return Array.from(toolCallsById.values());
    }

    private async executeTools(
        llmResponse: LLMCompletion
    ): Promise<ToolExecutionOutcome> {
        const lastMessageContent = this.extractLastMessageContent(llmResponse);
        const toolCalls = this.getToolCalls(llmResponse);

        if (toolCalls.length === 0) {
            return {
                toolResults: [],
                followUpMessages: [],
                completed: true,
                finalMessage: lastMessageContent,
                hadToolCalls: false,
            };
        }

        const parsedToolCalls = toolCalls.map((tool) => this.parseToolCall(tool));
        const completionToolCalls = parsedToolCalls.filter((toolCall) =>
            toolCall.toolName.includes('attempt_completion'),
        );
        const executionToolCalls = parsedToolCalls.filter((toolCall) =>
            !toolCall.toolName.includes('attempt_completion'),
        );

        if (this.loopDetectionService) {
            for (const toolCall of executionToolCalls) {
                const loopDetected = this.loopDetectionService.checkToolCallLoop(
                    toolCall.toolName,
                    toolCall.toolInput,
                );

                if (loopDetected) {
                    const loopMessage = `Loop detected while calling "${toolCall.toolName}". Execution stopped to prevent infinite recurrence.`;
                    return {
                        toolResults: [{
                            role: 'tool',
                            tool_call_id: 'system-loop-detection',
                            content: JSON.stringify({ error: loopMessage }),
                        }],
                        followUpMessages: [],
                        completed: true,
                        finalMessage: loopMessage,
                        hadToolCalls: true,
                    };
                }
            }
        }

        const toolResults: ToolResult[] = [];
        const followUpMessages: MessageObject[] = [];
        let userRejectedToolUse = false;

        let currentIndex = 0;
        while (currentIndex < executionToolCalls.length) {
            const currentToolCall = executionToolCalls[currentIndex];
            if (!currentToolCall) {
                currentIndex += 1;
                continue;
            }

            if (userRejectedToolUse) {
                const skippedResult = this.parseToolResult(
                    currentToolCall.toolUseId,
                    'Skipping tool execution due to previous tool user rejection.',
                );
                toolResults.push(skippedResult);
                currentIndex += 1;
                continue;
            }

            if (!this.isConcurrencySafe(currentToolCall)) {
                const executionResult = await this.executeSingleToolCall(currentToolCall);
                toolResults.push(executionResult.toolResult);
                followUpMessages.push(...executionResult.followUpMessages);
                userRejectedToolUse = executionResult.didUserReject;
                currentIndex += 1;
                continue;
            }

            const parallelBatch: ParsedToolCall[] = [];
            while (currentIndex < executionToolCalls.length) {
                const candidateToolCall = executionToolCalls[currentIndex];
                if (
                    !candidateToolCall ||
                    candidateToolCall.waitForPrevious ||
                    !this.isConcurrencySafe(candidateToolCall)
                ) {
                    break;
                }

                parallelBatch.push(candidateToolCall);
                currentIndex += 1;
            }

            const batchResults = await Promise.all(
                parallelBatch.map((toolCall) => this.executeSingleToolCall(toolCall)),
            );

            for (const batchResult of batchResults) {
                toolResults.push(batchResult.toolResult);
                followUpMessages.push(...batchResult.followUpMessages);
                userRejectedToolUse = userRejectedToolUse || batchResult.didUserReject;
            }
        }

        if (completionToolCalls.length > 0) {
            const completionToolCall = completionToolCalls.at(-1);
            if (completionToolCall) {
                const completionArguments = completionToolCall.toolInput;
                this.finalMessage = JSON.stringify(completionArguments);

                const [, completionResult] = await this.executeTool(
                    completionToolCall.toolName,
                    completionArguments,
                );
                const parsedCompletionResult = this.parseToolResult(
                    completionToolCall.toolUseId,
                    completionResult === '' ? 'The user is satisfied with the result.' : completionResult,
                );
                toolResults.push(parsedCompletionResult);
            }
        }

        return {
            toolResults,
            followUpMessages,
            completed: completionToolCalls.length > 0,
            finalMessage: this.finalMessage,
            hadToolCalls: true,
        };
    }

    private isConcurrencySafe(toolCall: ParsedToolCall): boolean {
        if (toolCall.waitForPrevious) {
            return false;
        }

        const normalizedToolName = toolCall.toolName.toLowerCase();
        if (
            normalizedToolName.startsWith('subagent--') ||
            normalizedToolName.includes('thread_management')
        ) {
            return false;
        }

        const actualToolName = normalizedToolName.split('--').at(-1) ?? normalizedToolName;
        const toolNameTokens = actualToolName
            .split(/[^a-z0-9]+/)
            .filter((token) => token.length > 0);

        const mutatingKeywords = new Set([
            'write',
            'edit',
            'create',
            'delete',
            'remove',
            'rename',
            'move',
            'copy',
            'apply',
            'shell',
            'command',
            'run',
            'exec',
            'thread_management',
            'attempt_completion',
            'completion',
            'todo',
            'spawn',
            'start',
        ]);

        if (toolNameTokens.some((token) => mutatingKeywords.has(token))) {
            return false;
        }

        const readOnlyKeywords = new Set([
            'read',
            'search',
            'list',
            'find',
            'glob',
            'grep',
            'view',
            'stat',
            'inspect',
            'get',
            'show',
            'query',
            'ls',
            'cat',
        ]);

        return toolNameTokens.some((token) => readOnlyKeywords.has(token));
    }

    private async executeSingleToolCall(
        toolCall: ParsedToolCall,
    ): Promise<SingleToolExecutionResult> {
        try {
            let resultTuple: [boolean, unknown];
            if (toolCall.toolName === 'codebolt--thread_management') {
                resultTuple = [
                    false,
                    await codebolt.thread.createThreadInBackground({
                        title: String(toolCall.toolInput['title'] || toolCall.toolInput['task'] || 'Background Thread'),
                        description: String(toolCall.toolInput['description'] || toolCall.toolInput['task'] || ''),
                        userMessage: String(toolCall.toolInput['task'] || toolCall.toolInput['userMessage'] || ''),
                        selectedAgent: toolCall.toolInput['selectedAgent'],
                        isGrouped: Boolean(toolCall.toolInput['isGrouped']),
                        ...(typeof toolCall.toolInput['groupId'] === 'string'
                            ? { groupId: toolCall.toolInput['groupId'] }
                            : {}),
                    })
                ];
            } else if (toolCall.toolName.startsWith('subagent--')) {
                const task = toolCall.toolInput['task'];
                await codebolt.agent.startAgent(
                    toolCall.toolName.replace('subagent--', ''),
                    typeof task === 'string' ? task : JSON.stringify(task),
                );
                resultTuple = [false, 'tool result is successful'];
            } else {
                resultTuple = await this.executeTool(
                    toolCall.toolName,
                    toolCall.toolInput as Record<string, unknown>,
                );
            }

            const [didUserReject, result] = resultTuple;
            const parsedResult = this.parseToolResult(toolCall.toolUseId, result);
            return {
                toolResult: parsedResult,
                followUpMessages: parsedResult.userMessage ? [{
                    role: 'user',
                    content: parsedResult.userMessage.toString(),
                }] : [],
                didUserReject,
            };
        } catch (error) {
            return {
                toolResult: {
                    role: 'tool',
                    tool_call_id: toolCall.toolUseId,
                    content: String(error),
                },
                followUpMessages: [],
                didUserReject: false,
            };
        }
    }

    private async executeTool(toolName: string, toolInput: Record<string, unknown>): Promise<[boolean, unknown]> {
        const parts = toolName.split('--');
        const toolboxName = parts.length > 1 ? (parts[0] ?? '') : 'codebolt';
        const actualToolName = parts.length > 1 ? (parts[1] ?? '') : (parts[0] ?? '');

        const { data } = await codebolt.mcp.executeTool(toolboxName, actualToolName, toolInput);

        if (Array.isArray(data) && data.length >= 2) {
            const [didUserReject, content] = data;
            return [Boolean(didUserReject), content];
        }

        return [false, data];
    }

    private parseToolResult(tool_call_id: string, content: unknown): ToolResult {
        let serializedContent = typeof content === 'string'
            ? content
            : JSON.stringify(content);
        let userMessage: string | undefined;

        try {
            const parsedContent = typeof serializedContent === 'string'
                ? JSON.parse(serializedContent)
                : serializedContent;

            if (
                parsedContent &&
                typeof parsedContent === 'object' &&
                'payload' in parsedContent &&
                parsedContent.payload &&
                typeof parsedContent.payload === 'object' &&
                'content' in parsedContent.payload &&
                typeof parsedContent.payload.content === 'string'
            ) {
                serializedContent = 'The browser action has been executed. The screenshot has been captured for your analysis. The tool response is provided in the next user message.';
                userMessage = parsedContent.payload.content;
            }
        } catch {
            // Preserve the raw tool result when it is not JSON.
        }

        return {
            role: 'tool',
            tool_call_id,
            content: serializedContent,
            userMessage,
        };
    }

    setPreToolCallProcessors(processors: PreToolCallProcessor[]): void {
        this.preToolCallProcessors = processors;
    }

    setPostToolCallProcessors(processors: PostToolCallProcessor[]): void {
        this.postToolCallProcessors = processors;
    }

    getPreToolCallProcessors(): PreToolCallProcessor[] {
        return this.preToolCallProcessors;
    }

    getPostToolCallProcessors(): PostToolCallProcessor[] {
        return this.postToolCallProcessors;
    }

    private injectDiscoveredTools(
        llmResponse: LLMCompletion,
        toolResults: ToolResult[],
        nextMessage: ProcessedMessage
    ): void {
        try {
            const toolCalls = this.getToolCalls(llmResponse);
            if (!toolCalls || !nextMessage?.message?.tools) return;

            for (const toolCall of toolCalls) {
                if (!toolCall) continue;
                const toolName = toolCall.function?.name || '';
                const isToolSearch = toolName === 'tool_search' ||
                    toolName === 'codebolt--tool_search' ||
                    toolName.endsWith('--tool_search');

                if (!isToolSearch) continue;

                const toolCallId = toolCall.id;
                const toolResult = toolResults.find(r => r.tool_call_id === toolCallId);
                if (!toolResult?.content) continue;

                const content = typeof toolResult.content === 'string'
                    ? toolResult.content
                    : JSON.stringify(toolResult.content);

                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (!jsonMatch) continue;

                let discoveredSchemas: Array<Record<string, unknown>>;
                try {
                    discoveredSchemas = JSON.parse(jsonMatch[0]) as Array<Record<string, unknown>>;
                } catch {
                    continue;
                }

                if (!Array.isArray(discoveredSchemas)) continue;

                const existingToolNames = new Set(
                    nextMessage.message.tools.map((tool) => tool.function?.name)
                );

                for (const schema of discoveredSchemas) {
                    const schemaFunction = schema['function'] as { name?: string } | undefined;
                    const rawName = schemaFunction?.name;
                    if (!rawName) continue;

                    const prefixedName = rawName.startsWith('codebolt--') ? rawName : `codebolt--${rawName}`;
                    if (existingToolNames.has(prefixedName)) continue;

                    const prefixedSchema = {
                        ...schema,
                        function: {
                            ...schemaFunction,
                            name: prefixedName
                        }
                    };
                    nextMessage.message.tools.push(prefixedSchema as typeof nextMessage.message.tools[number]);
                    existingToolNames.add(prefixedName);
                }
            }
        } catch (error) {
            console.error('[ResponseExecutor] Error injecting discovered tools:', error);
        }
    }
}
