import codebolt from '@codebolt/codeboltjs';
import {
    InitialPromptGenerator,
    ResponseExecutor
} from '@codebolt/agent/unified';
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
import { JobDetails, PlanResult } from './types';
import { findLatestSpecsFile } from './helpers';
import { PLAN_GENERATOR_SYSTEM_PROMPT } from './prompts';

// ================================
// SPECIFICATION GENERATION WITH AGENT LOOP
// ================================

export async function generateSpecWithAgentLoop(jobDetails: JobDetails): Promise<PlanResult> {
    try {
        codebolt.chat.sendMessage(`Creating specification for job: ${jobDetails.title}`, {});

        // Create a comprehensive user message for spec generation
        const userMessage: FlatUserMessage = {
            userMessage: `Create a detailed implementation specification for the following job:

## Job Details
- **Title:** ${jobDetails.title}
- **Description:** ${jobDetails.description}
- **Priority:** ${jobDetails.priority}
- **Requirements:** ${jobDetails.requirements.length > 0 ? jobDetails.requirements.map(req => `\n  - ${req}`).join('') : 'None specified'}
- **Tags:** ${(jobDetails.tags || []).join(', ') || 'None'}
- **Dependencies:** ${(jobDetails.dependencies || []).join(', ') || 'None'}

Please analyze the codebase, understand the current project structure, and create a comprehensive implementation specification. The specification should be detailed, follow best practices, and consider the project's existing architecture.`,
            selectedAgent: {
                id: 'job-planner-agent',
                name: 'Job Planner Agent'
            },
            mentionedFiles: [],
            mentionedFullPaths: [],
            mentionedFolders: [],
            mentionedMCPs: [],
            uploadedImages: [],
            mentionedAgents: [],
            messageId: `job-spec-${jobDetails.id}-${Date.now()}`,
            threadId: `job-thread-${jobDetails.id}`
        };

        // Initialize the prompt generator with all necessary modifiers
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
                new CoreSystemPromptModifier({ customSystemPrompt: PLAN_GENERATOR_SYSTEM_PROMPT }),
                new ToolInjectionModifier({ includeToolDescriptions: true }),
                new AtFileProcessorModifier({ enableRecursiveSearch: true })
            ],
            baseSystemPrompt: PLAN_GENERATOR_SYSTEM_PROMPT
        });

        // Process the initial message
        let prompt: ProcessedMessage = await promptGenerator.processMessage(userMessage);
        let completed = false;
        let iterationCount = 0;
        const MAX_ITERATIONS = 20;

        // Agent loop - runs until the agent creates the specs file and completes
        do {
            iterationCount++;
            if (iterationCount > MAX_ITERATIONS) {
                codebolt.chat.sendMessage("Maximum iterations reached, finalizing specification...", {});
                break;
            }

            const agent = new AgentStep({
                preInferenceProcessors: [],
                postInferenceProcessors: []
            });

            const result: AgentStepOutput = await agent.executeStep(userMessage, prompt);
            prompt = result.nextMessage;

            const responseExecutor = new ResponseExecutor({
                preToolCallProcessors: [],
                postToolCallProcessors: []
            });

            const executionResult = await responseExecutor.executeResponse({
                initialUserMessage: userMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });

            completed = executionResult.completed;
            prompt = executionResult.nextMessage;

            if (completed) {
                break;
            }
        } while (!completed);

        // Find the specs file that was created
        const specsFilePath = await findLatestSpecsFile();

        if (!specsFilePath) {
            return { success: false, error: 'Failed to create specification file' };
        }
        

        codebolt.chat.sendMessage(`Specification created: ${specsFilePath}`, {});
        return { success: true, specsFilePath };
    } catch (error) {
        console.error('Error creating specification:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
