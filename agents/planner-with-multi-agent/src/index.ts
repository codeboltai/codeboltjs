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
import { runWhileLoop } from './agentLoop';
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

    // Run the initial agent loop
    const result = await runWhileLoop(reqMessage, prompt);

    if (result instanceof Error) {
        codebolt.chat.sendMessage(`Error in agent loop: ${result.message}`);
        return "Error occurred";
    }

    executionResult = result.executionResult;
    prompt = result.prompt;

    // If background agents were started, wait for all of them to finish
    // Using waitForAnyExternalEvent() to block instead of polling in a while loop
    while (agentTracker.getRunningAgentCount() > 0 || eventQueue.getPendingExternalEventCount() > 0) {
        // Block and wait for an external event (no busy polling)
        const event = await eventQueue.waitForAnyExternalEvent();
        codebolt.chat.sendMessage(`Event received: ${event.type}`);
        if (event.type === 'agentQueueEvent' || event.type === 'backgroundGroupedAgentCompletion') {
            // Process the received event
            processExternalEvent(event, prompt);

            // Run the agent loop again to process the event result
            const loopResult = await runWhileLoop(reqMessage, prompt);

            if (loopResult instanceof Error) {
                codebolt.chat.sendMessage(`Error processing event: ${loopResult.message}`);
                continue;
            }

            executionResult = loopResult.executionResult;
            prompt = loopResult.prompt;
        }
    }

    return executionResult?.finalMessage || "No response generated";
});
