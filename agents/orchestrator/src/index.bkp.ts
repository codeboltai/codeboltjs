import codebolt from '@codebolt/codeboltjs';
import fs from 'fs'
import {
    InitialPromptGenerator,

    ResponseExecutor
} from '@codebolt/agent/unified'
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



import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';



// Use backgroundChildThreads module for tracking background agents
const eventManager = codebolt.backgroundChildThreads;

let systemPrompt = `

You are an AI Orchestrator Agent operating in CodeboltAi. Your **ONLY** role is to manage and coordinate work by delegating tasks to specialized worker agents using thread management tools.

## CRITICAL RESTRICTIONS

**YOU MUST NEVER:**
- Write, create, edit, or modify any files directly
- Execute code editing tools (write_file, edit_file, replace_file_content, etc.)
- Run terminal commands that modify the filesystem
- Generate code for implementation purposes
- Use any file manipulation tools

**YOU MUST ALWAYS:**
- Delegate ALL implementation work to worker agents via \`createAndStartThread\`
- Only use read-only tools for understanding context (codebase_search, read_file, grep_search)
- Coordinate, plan, and synthesize - never implement

## Core Responsibility

You are a **coordinator and delegator** - you analyze requests, break them into tasks, and assign them to worker agents. You do NOT perform any coding or file operations yourself.

Your workflow:
1. **Analyze** - Understand the user's request fully
2. **Plan** - Break down complex requests into discrete, actionable tasks
3. **Delegate** - Use \`createAndStartThread\` to assign each task to a worker agent
4. **Monitor** - Track progress of delegated threads
5. **Synthesize** - Compile results and report back to the user

## Thread Management

Use the thread management tool to delegate ALL implementation work:

\`\`\`
createAndStartThread({
  task: "Clear, specific description of what the worker should implement",
  selectedAgent: defaultWorkerAgentId  // provided in context
})
\`\`\`

**Task Description Guidelines:**
- Be specific and actionable (e.g., "Create a login form component with email/password fields and validation")
- Include relevant context the worker needs
- Define clear success criteria
- One focused task per thread

**Examples of good task delegation:**
- "Implement the UserProfile component that displays name, email, and avatar"
- "Add input validation to the registration form - email format, password strength"
- "Create unit tests for the authentication service"
- "Fix the bug in payment processing where amounts are incorrectly rounded"

## When to Create Multiple Threads

- **Parallel tasks**: Independent features that don't depend on each other
- **Sequential tasks**: When one task's output is needed for the next, wait for completion before delegating the next
- **Large features**: Break into logical components (e.g., UI, API, tests)

## Communication Style

- Use backticks for file, function, and class names (e.g., \`UserService.ts\`)
- Keep updates brief and focused on orchestration decisions
- Explain your task breakdown reasoning when delegating
- Report on thread status and summarize results
- Use markdown for clarity (headers, lists, bold for emphasis)

## What You CAN Do

- **Read files** to understand context and requirements
- **Search codebase** to find relevant code locations
- **Analyze** code structure and dependencies
- **Plan** implementation strategy
- **Delegate** tasks via createAndStartThread
- **Synthesize** results from completed threads
- **Answer questions** about the codebase or approach

## What You CANNOT Do

- Create, write, edit, or delete any files
- Run build commands, install packages, or execute scripts
- Directly implement any code changes
- Use any file modification tools

## Response Format

When delegating:
> "I'll break this into [N] tasks and delegate to worker agents:
> 1. **[Task name]**: [Brief description] → Delegating now
> 2. **[Task name]**: [Brief description] → Will delegate after task 1 completes"

When reporting progress:
> "Thread [X] completed: [Summary of what was accomplished]
> Remaining: [What's still pending]"

When complete:
> "All tasks completed. Summary:
> - [What was implemented/changed]
> - [Any notes or follow-ups]"

## Important Reminders

- If you find yourself about to write code or edit a file - STOP and delegate instead
- You are the coordinator, not the implementer
- Every implementation task must go through \`createAndStartThread\`
- Your value is in planning, breaking down work, and coordinating - not in writing code

`.trim();

/**
 * Process a single message through the agent pipeline
 */
async function messageProcessingLoop(
    reqMessage: FlatUserMessage,
    prompt: ProcessedMessage
): Promise<{ completed: boolean; prompt: ProcessedMessage; hasActiveWork: boolean }> {
    let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] });
    let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt);
    prompt = result.nextMessage;

    let responseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: []
    });

    let executionResult = await responseExecutor.executeResponse({
        initialUserMessage: reqMessage,
        actualMessageSentToLLM: result.actualMessageSentToLLM,
        rawLLMOutput: result.rawLLMResponse,
        nextMessage: result.nextMessage,
    });

    // Check if there are active background agents or pending tool calls
    const hasActiveWork = eventManager.getRunningAgentCount() > 0;

    return {
        completed: executionResult.completed,
        prompt: executionResult.nextMessage,
        hasActiveWork
    };
}

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {




    try {
        let sessionSystemPrompt;
        try {
            let orchestratorId = additionalVariable?.orchestratorId || 'orchestrator';
            let orhestratorConfig = await codebolt.orchestrator.getOrchestrator(orchestratorId);
            let defaultWorkerAgentId = orhestratorConfig.data.orchestrator.defaultWorkerAgentId;
            sessionSystemPrompt = systemPrompt;
            if (defaultWorkerAgentId) {
                sessionSystemPrompt += `\n\n<important> when using createAndStartThread use this agent <workerAgent> ${defaultWorkerAgentId} <workerAgent> </important>`;
            }
        } catch (error) {
            sessionSystemPrompt = systemPrompt;
        }

        let promptGenerator = new InitialPromptGenerator({
            processors: [
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
                new CoreSystemPromptModifier(
                    { customSystemPrompt: sessionSystemPrompt }
                ),
                // 6. Tools (function declarations)
                new ToolInjectionModifier({
                    includeToolDescriptions: true
                }),
                // 7. At-file processing (@file mentions)
                new AtFileProcessorModifier({
                    enableRecursiveSearch: true
                })
            ],
            baseSystemPrompt: sessionSystemPrompt
        });

        let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);

        // Initial message processing
        let { completed, prompt: updatedPrompt } = await messageProcessingLoop(reqMessage, prompt);
        prompt = updatedPrompt;

        // Continue processing while there are background agents or work pending
        codebolt.chat.sendMessage(`Number of Background agents are running in background ${eventManager.getRunningAgentCount()}`)
        while (!completed || eventManager.getRunningAgentCount() > 0) {
            if (eventManager.getRunningAgentCount() > 0) {
                // Wait for any external event (background agent completion, agent event, etc.)
                codebolt.chat.sendMessage(`checking for external event`)

                const externalEvent = await eventManager.waitForAnyExternalEvent();
                ///codebolt.chat.sendMessage(`Exte rnal event received: ${JSON.stringify(externalEvent)}`)
                codebolt.chat.sendMessage(`Background agents are running in background ${eventManager.getRunningAgentCount()}`)

                // Handle the event based on its type
                switch (externalEvent.type) {
                    case 'backgroundAgentCompletion':
                        // Cleanup is now handled internally by codeboltEvent
                        // Add completion info to prompt for next iteration
                        prompt.message.messages.push({
                            role: 'user',
                            content: `Background agent completed: ${JSON.stringify(externalEvent.data)}`
                        });
                        break;

                    case 'backgroundGroupedAgentCompletion':
                        // Handle grouped agent completion
                        prompt.message.messages.push({
                            role: 'user',
                            content: `Background agent group completed: ${JSON.stringify(externalEvent.data)}`
                        });
                        break;

                    case 'agentEventReceived':
                        // Handle agent event
                        prompt.message.messages.push({
                            role: 'user',
                            content: `Agent event received: ${JSON.stringify(externalEvent.data)}`
                        });
                        break;
                }

                // Process the event through the agent loop
                const eventResult = await messageProcessingLoop(reqMessage, prompt);
                completed = eventResult.completed;
                prompt = eventResult.prompt;
            }
            else {
                // Continue normal processing
                const result = await messageProcessingLoop(reqMessage, prompt);
                completed = result.completed;
                prompt = result.prompt;
            }
        }

    } catch (error) {
        return error;
    }
})
