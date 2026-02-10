import codebolt from '@codebolt/codeboltjs';
import { InitialPromptGenerator } from '@codebolt/agent/unified';
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier
} from '@codebolt/agent/processor-pieces';
import { ProcessedMessage } from '@codebolt/types/agent';

import {
    PLANNER_SYSTEM_PROMPT
} from './prompts';
import { runMainAgentLoop } from './agentLoop';
import { processExternalEvent } from './eventHandlers';


const eventQueue = codebolt.agentEventQueue;
const agentTracker = codebolt.backgroundChildThreads;

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
    let sessionSystemPrompt = PLANNER_SYSTEM_PROMPT + `
    <important>
    When starting child worker agents using the \`thread_create_background\` tool, you MUST use:
    - agentId: "b29a9229-a76c-4d8c-acfc-e00a4511fb8c"
    </important>`;
    const promptGenerator = new InitialPromptGenerator({
        processors: [
            new ChatHistoryMessageModifier({ enableChatHistory: true }),
            new EnvironmentContextModifier({ enableFullContext: true }),
            new DirectoryContextModifier(),
            new IdeContextModifier({
                includeActiveFile: true,
                includeOpenFiles: true,
                includeCursorPosition: true,
                includeSelectedText: true
            }),
            new CoreSystemPromptModifier({ customSystemPrompt: sessionSystemPrompt }),
            new ToolInjectionModifier({ includeToolDescriptions: true }),
            new AtFileProcessorModifier({ enableRecursiveSearch: true })
        ],
        baseSystemPrompt: sessionSystemPrompt
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let executionResult: any;

    // Run the agent loop - this includes research delegation, planning,
    // calling create-detail-action-plan ActionBlock, and waiting for user approval.
    // The agent returns AFTER the requirement is approved by the user.
    const result = await runMainAgentLoop(reqMessage, prompt);

    if (result instanceof Error) {
        console.error(`Error in agent loop: ${result.message}`);
        return "Error occurred";
    }

    executionResult = result.executionResult;
    prompt = result.prompt;

    // If background research agents were started, wait for them to finish
    // before the planning loop can synthesize findings
    // Process background research agent events (if any were spawned).
    // Once the LLM processes event results and calls attempt_completion,
    // the planner's job is done — break out immediately.
    while (agentTracker.getRunningAgentCount() > 0 || eventQueue.getPendingExternalEventCount() > 0) {
        const event = await eventQueue.waitForAnyExternalEvent();
        if (event.type === 'agentQueueEvent' || event.type === 'backgroundGroupedAgentCompletion') {
            processExternalEvent(event, prompt);

            const loopResult = await runMainAgentLoop(reqMessage, prompt);

            if (loopResult instanceof Error) {
                console.error(`Error processing event: ${loopResult.message}`);
                continue;
            }

            executionResult = loopResult.executionResult;
            prompt = loopResult.prompt;

        }
    }


    codebolt.chat.sendMessage(executionResult.finalMessage)
    // Planner agent returns after requirement is approved by user.
    // It does NOT process the requirement - that is handled separately.
    return executionResult?.finalMessage || "No response generated";
});

