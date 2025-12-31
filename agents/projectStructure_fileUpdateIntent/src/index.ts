import codebolt from '@codebolt/codeboltjs';
import { TestRunner } from './testRunner';
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





codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  console.log("Message received:", reqMessage.userMessage);
  codebolt.chat.sendMessage("Message received: " + reqMessage.userMessage);
  // if (reqMessage.userMessage.includes("/test")) {
  await TestRunner.runAllTests();
  await codebolt.chat.sendMessage("Tests completed. Check terminal logs for details.");
  // }
})



