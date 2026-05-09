import { AgentStep, ResponseExecutor } from '@codebolt/agent/unified';

async function runWhileLoop(reqMessage, prompt) {
  try {
    let completed = false;
    let executionResult = null;

    do {
      const agent = new AgentStep({
        preInferenceProcessors: [],
        postInferenceProcessors: [],
      });

      const result = await agent.executeStep(reqMessage, prompt);
      prompt = result.nextMessage;

      const responseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: [],
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

    return { executionResult, prompt };
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

export { runWhileLoop };
