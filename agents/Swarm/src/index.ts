import codebolt from '@codebolt/codeboltjs';
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



codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    //Detail Planner Agent
    try {

        codebolt.chat.sendMessage("Swarm test agent started", {})
       



    } catch (error) {

    }




})



