

import codebolt from "@codebolt/codeboltjs";
import { FlatUserMessage } from "@codebolt/types/sdk";

const { createAgent } = require('@codebolt/agent/unified') as typeof import('@codebolt/agent/unified');

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  // await codebolt.chat.sendMessage("Testing LLM role: testing");

  // const response = await codebolt.llm.inference({
  //     formatVersion: "codebolt.llm.v2",
  //     input: [
  //         { role: "user", content: "hi" },
  //     ],
  //     llmrole: "testing",
  //     // llmrole: "codebolt.standard.text.fast",
  //     saveToContext: false,
  // });

  // await codebolt.chat.sendMessage(JSON.stringify(response));
  // return response;

  const agent = createAgent({
    name: 'creation-agent',
    instructions: "",
    tools: [],
    maxTurns: 15,
    includeDefaultModifiers: true,
    includeDefaultProcessors: true,
    enableLogging: true,
    llmRole:'my-testing-role'
  });
  const runResult = await agent.run({
    ...reqMessage,
    userMessage: reqMessage.userMessage.trim(),
  });

  if (!runResult.success) {
    const failureMessage = runResult.error || 'Creation agent failed before producing a final result.';
    codebolt.chat.sendMessage(failureMessage);
    return failureMessage;
  }

  const finalMessage = runResult.finalMessage || 'Creation agent finished. Review the generated files and validation output above.';
  codebolt.chat.sendMessage(finalMessage);
  return finalMessage;

});
