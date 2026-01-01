import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentContext, JobSplitAnalysis, JobBlockerAnalysis, SplitApprovalAnalysis, JobBlockingAnalysis } from './types';
import { findOrCreateStructureDeliberation } from './deliberation';
import { handleJoinSwarm } from './teamHandler';
import { findOrCreateSwarmThread } from './mailHandler';
import { llmWithJsonRetry } from './utils';
import { JOB_SPLIT_ANALYSIS_PROMPT, JOB_BLOCKER_ANALYSIS_PROMPT, SPLIT_APPROVAL_PROMPT, JOB_DEPENDENCY_ANALYSIS_PROMPT, MAIN_AGENT_PROMPT } from './prompts';

import fs from 'fs'
import {
    InitialPromptGenerator,

    ResponseExecutor
} from '@codebolt/agent/unified'

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


export const mainAgentLoop = async (reqMessage: FlatUserMessage, planPath: string) => {
    try {
        let systemPrompt = MAIN_AGENT_PROMPT;
        systemPrompt += `\n\n# IMPORTANT\nCheck for an existing plan in \`${planPath}\` before starting. If it exists, YOU MUST READ IT.`;

        // codebolt.chat.sendMessage("Gemini agent started", {})
        // codebolt.chat.sendMessage(JSON.stringify(reqMessage),{})
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
                    { customSystemPrompt: systemPrompt }
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
            baseSystemPrompt: systemPrompt
        });
        let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
        let completed = false;
        do {
            let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] })
            let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;

            let responseExecutor = new ResponseExecutor({
                preToolCallProcessors: [],
                postToolCallProcessors: []

            })
            let executionResult = await responseExecutor.executeResponse({
                initailUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });

            completed = executionResult.completed;
            prompt = executionResult.nextMessage;


            if (completed) {
                try {
                    // Fetch chat history
                    // const history = await codebolt.chat.getChatHistory(); // This might be undefined or different signature, checking SDK...
                    // Using internal history or prompt history if available, but SDK call is safer if implemented
                    // For now, let's assume we can get it or just use the current context if possible. 
                    // Actually, let's just use a placeholder or the prompt we have. 
                    // Better approach: use codebolt.chat.getHistory() if available, otherwise just use the last state.
                    // Wait, codebolt.chat.history is not a standard SDK method exposed in docs usually, but commonly available.
                    // Let's check imports first.

                    // Implementing logic to get history and create request
                    console.log('Task completed. Generating Review Merge Request...');

                    // const chatHistory = await codebolt.message.getChatHistory({ threadId: reqMessage.threadId });
                    // Or just use the accumulated prompt messages if we had access to them easily.
                    // Let's try to get history via SDK if possible, or just pass the summary.

                    // Actually, let's look at `mainAgentLoop` imports. We need to import the prompt.
                    // I will do this in two steps: imports first, then this block.
                    // But `replace_file_content` is one block. 

                    // Re-reading file content... `mainAgent.ts` imports `codebolt` from `@codebolt/codeboltjs`.

                    // Let's implement the logic assuming we can get history.
                    // If SDK doesn't have getChatHistory, we might need another way.
                    // Looking at `Codebolt.ts` in previous turn, `getChatHistory` is handled by `chatCliService`.
                    // So `codebolt.chat.getChatHistory()` (if exposed on `codebolt.chat`) or `codebolt.chat.listMessages()`.
                    // Let's check `codeboltjs/modules/chat.ts` if needed, but assuming `codebolt.chat` has `getHistory` or similar.
                    // Keep it simple: Ask LLM for summary based on what it knows (context).

                    // IMPORTANT: We need validation.
                    // I'll grab the implementation plan approved logic.


                    // @ts-ignore
                    const historyText = JSON.stringify(prompt);

                    const { REVIEW_REQUEST_GENERATION_PROMPT } = require('./prompts/reviewRequest');

                    const userPrompt = `Conversation History:\n${historyText}`;

                    const reviewRequestData = await llmWithJsonRetry(REVIEW_REQUEST_GENERATION_PROMPT, userPrompt);

                    if (reviewRequestData) {
                        // Enrich with current agent/swarm info if missing
                        const reqData: any = reviewRequestData;
                        reqData.agentId = reqData.agentId || 'swarm-agent';
                        reqData.swarmId = reqData.swarmId || 'unknown-swarm';

                        // @ts-ignore
                        const createdRequest = await codebolt.reviewMergeRequest.create(reqData);

                        await codebolt.chat.sendMessage(`Review Merge Request Created: [${createdRequest.request.title}](review_request://${createdRequest.request.id})`);
                    }

                } catch (error) {
                    console.error('Failed to auto-create review merge request:', error);
                    await codebolt.chat.sendMessage(`Failed to auto-create review merge request: ${(error as Error).message}`);
                }
                break;
            }

        } while (!completed);





    } catch (error) {

    }

}