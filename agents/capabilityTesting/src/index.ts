import codebolt from '@codebolt/codeboltjs';
import {
    InitialPromptGenerator,
    ResponseExecutor,
    LoopDetectionService
} from '@codebolt/agent/unified'
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    AtFileProcessorModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier,
    ConversationCompactorModifier
} from '@codebolt/agent/processor-pieces';

import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';




codebolt.onMessage(async (reqMessage: FlatUserMessage) => {


    codebolt.chat.sendMessage("Capability Testing")
    codebolt.mcp.executeTool('codebolt', 'capability_list_skills', {})
    let response = await codebolt.capability.listCapabilitiesByType(`skill`)
    // let response = await codebolt.capability.startCapability("weather", 'skill')
    codebolt.chat.sendMessage(JSON.stringify(response));
    console.log(response)


})


