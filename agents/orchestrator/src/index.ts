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
    ORCHESTRATOR_SYSTEM_PROMPT,
    appendWorkerAgentId,
    appendActionPlanContext
} from './prompts';
import { runWhileLoop, AgentLoopResult } from './agentLoop';
import { processExternalEvent } from './eventHandlers';

// Use agentEventQueue for centralized event handling
const eventQueue = codebolt.agentEventQueue;
// Use backgroundChildThreads for tracking running agent count
const agentTracker = codebolt.backgroundChildThreads;

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
    let sessionSystemPrompt = ORCHESTRATOR_SYSTEM_PROMPT;

    // Phase 0: Configure system prompt with worker agent
    try {
        const orchestratorId = additionalVariable?.orchestratorId || 'orchestrator';
        const orchestratorConfig = await codebolt.orchestrator.getOrchestrator(orchestratorId);
        const defaultWorkerAgentId = orchestratorConfig.data.orchestrator.defaultWorkerAgentId;

        if (defaultWorkerAgentId) {
            sessionSystemPrompt = appendWorkerAgentId(sessionSystemPrompt, defaultWorkerAgentId);
        }
    } catch (error) {
        // Keep default system prompt on error
    }

    // Phase 1: Create plan using action block
    codebolt.chat.sendMessage("Creating implementation plan...", {});
    try {
        const planResult = await codebolt.actionBlock.start('create-plan-for-given-task', {
            userMessage: reqMessage
        });

        if (planResult.success && planResult.result) {
            const { planId, requirementPlanPath } = planResult.result;
            codebolt.chat.sendMessage(`Plan created successfully. Plan ID: ${planId}`, {});

            if (planId) {
                sessionSystemPrompt = appendActionPlanContext(
                    sessionSystemPrompt,
                    planId,
                    requirementPlanPath
                );
            }
        } else {
            codebolt.chat.sendMessage("Plan creation skipped or failed, proceeding with direct orchestration...", {});
        }
    } catch (planError) {
        console.error('Plan creation failed:', planError);
        codebolt.chat.sendMessage("Plan creation failed, proceeding with direct orchestration...", {});
    }

    return;

    // Phase 2: Run agent loop
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
    let continueLoop = false;

    do {
        continueLoop = false;

        const result = await runWhileLoop(reqMessage, prompt);

        if (result instanceof Error) {
            console.error('Agent loop error:', result);
            break;
        }

        const loopResult = result as AgentLoopResult;
        executionResult = loopResult.executionResult;
        prompt = loopResult.prompt;

        if (agentTracker.getRunningAgentCount() > 0 || eventQueue.getPendingExternalEventCount() > 0) {
            continueLoop = true;
            const event = await eventQueue.waitForAnyExternalEvent();
            processExternalEvent(event, prompt);
        }

    } while (continueLoop);

    return executionResult?.finalMessage || "No response generated";
});
