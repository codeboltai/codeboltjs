import { FlatUserMessage } from "@codebolt/types/sdk";
import { AgentStep } from '@codebolt/agent/unified';
import { ResponseExecutor } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

export interface AgentLoopResult {
    executionResult: any;
    prompt: ProcessedMessage;
}

/**
 * Process a single message through the agent pipeline
 * Runs the agent step loop until completion
 */
export async function runWhileLoop(
    reqMessage: FlatUserMessage,
    prompt: ProcessedMessage
): Promise<AgentLoopResult | Error> {
    try {
        let completed = false;
        let executionResult;

        do {
            const agent = new AgentStep({
                preInferenceProcessors: [],
                postInferenceProcessors: []
            });

            const result: AgentStepOutput = await agent.executeStep(reqMessage, prompt);
            prompt = result.nextMessage;

            const responseExecutor = new ResponseExecutor({
                preToolCallProcessors: [],
                postToolCallProcessors: []
            });

            executionResult = await responseExecutor.executeResponse({
                initialUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });

            completed = executionResult.completed;
            prompt = executionResult.nextMessage;

        } while (!completed);

        return {
            executionResult,
            prompt
        };

    } catch (error) {
        console.error(error);
        return error as Error;
    }
}
