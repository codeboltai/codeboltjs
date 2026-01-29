# Feature Comparison: Builder Pattern vs Unified Library
Builder Pattern Feature	Unified Library Equivalent	Status
PROMPT BUILDING		
PromptBuilder.addMCPTools()	ToolInjectionModifier	✅ Available
PromptBuilder.addAgentTools()	ToolInjectionModifier (via mentionedMCPs)	✅ Available
PromptBuilder.addEnvironmentDetails()	EnvironmentContextModifier	✅ Available
PromptBuilder.addSystemPrompt(yaml, key, example)	CoreSystemPromptModifier	⚠️ Partial - no YAML loading
PromptBuilder.addTaskInstruction(yaml, section)	N/A	❌ Missing
PromptBuilder.addAllAutomatic()	CodeboltAgent default modifiers	✅ Available
PromptBuilder.addMCPToolsToPrompt()	ToolInjectionModifier with toolsLocation: 'InsidePrompt'	✅ Available
PromptBuilder.addAgentsToPrompt()	N/A	❌ Missing
PromptBuilder.setTools(tools)	Direct on ProcessedMessage.message.tools	✅ Available
PromptBuilder.addTools(tools)	Push to ProcessedMessage.message.tools	✅ Available
PromptBuilder.addToConversationHistory()	Push to ProcessedMessage.message.messages	✅ Available
PromptBuilder.addUserMessage()	Push to messages array	✅ Available
PromptBuilder.addLLMResponse()	AgentStep does this automatically	✅ Available
PromptBuilder.addToolResults()	ResponseExecutor does this automatically	✅ Available
PromptBuilder.addDefaultContinuationMessage()	ResponseExecutor adds this automatically	✅ Available
PromptBuilder.addCustomSection()	Custom MessageModifier	✅ Extensible
PromptBuilder.addSystemInstruction()	CoreSystemPromptModifier	✅ Available
PromptBuilder.addContext()	addUserContext() helper	✅ Available
PromptBuilder.reset()	Create new InitialPromptGenerator	✅ Available
PromptBuilder.buildInferenceParams()	InitialPromptGenerator.processMessage()	✅ Available
PromptBuilder.getConversationHistory()	ProcessedMessage.message.messages	✅ Available
PromptBuilder.getTools()	ProcessedMessage.message.tools	✅ Available
PromptBuilder.isTaskCompleted()	ResponseOutput.completed	✅ Available
PromptBuilder.shouldSummarizeConversation()	ChatCompressionModifier	✅ Available
LLM OUTPUT HANDLING		
LLMOutputHandler.isCompleted()	ResponseOutput.completed	✅ Available
LLMOutputHandler.sendMessageToUser()	ResponseExecutor.executeTools() does this	✅ Automatic
LLMOutputHandler.runTools()	ResponseExecutor.executeResponse()	✅ Available
LLMOutputHandler.getToolResults()	ResponseOutput.toolResults	✅ Available
LLMOutputHandler.hasToolCalls()	Check rawLLMOutput.choices[0].message.tool_calls	✅ Available
LLMOutputHandler.getAssistantMessage()	ResponseOutput.finalMessage	✅ Available
FOLLOW-UP BUILDING		
FollowUpQuestionBuilder.addPreviousConversation()	Automatic in ResponseOutput.nextMessage	✅ Automatic
FollowUpQuestionBuilder.addToolResult()	Automatic in ResponseOutput.nextMessage	✅ Automatic
FollowUpQuestionBuilder.checkAndSummarizeConversationIfLong()	ChatCompressionModifier	✅ Available
SPECIAL FEATURES		
Sub-agent execution (subagent--)	ResponseExecutor.executeTools()	✅ Available
Thread management (codebolt--thread_management)	ResponseExecutor.executeTools()	✅ Available
attempt_completion detection	ResponseExecutor.executeTools()	✅ Available
User rejection handling	ResponseExecutor.executeTools()	✅ Available
Browser payload handling	ResponseExecutor.parseToolResult()	✅ Available
ADDITIONAL IN UNIFIED		
N/A	AtFileProcessorModifier (@file processing)	✅ New
N/A	DirectoryContextModifier (tree view)	✅ New
N/A	IdeContextModifier (IDE state)	✅ New
N/A	ChatHistoryMessageModifier (thread history)	✅ New
N/A	LoopDetectionModifier (loop prevention)	✅ New
N/A	MemoryImportModifier (@file memory)	✅ New
N/A	ChatRecordingModifier (conversation logging)	✅ New
N/A	ShellProcessorModifier (shell injection)	✅ New
N/A	ToolValidationModifier	✅ New
N/A	Tool class with Zod validation	✅ New
Missing Features in Unified
1. YAML-based System Prompt Loading ❌
The old addSystemPrompt('agent.yaml', 'test', 'example.md') loaded prompts from YAML files with key lookup. The unified library's CoreSystemPromptModifier only accepts raw strings.

2. YAML-based Task Instruction Loading ❌
The old addTaskInstruction('task.yaml', 'main_task') is completely missing.

3. Agent Tools to Prompt ❌
The old addAgentsToPrompt() which converted agent definitions to prompt text is missing.

Updated Manual Orchestration Example (Complete)

import { 
    InitialPromptGenerator, 
    AgentStep, 
    ResponseExecutor 
} from '@codebolt/agent/unified';
import {
    ToolInjectionModifier,
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    ChatHistoryMessageModifier,
    DirectoryContextModifier,
    AtFileProcessorModifier,
    ChatCompressionModifier
} from '@codebolt/agent/processor-pieces';
import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage } from '@codebolt/types/sdk';

async function runAgentWorkflow(userMessage: FlatUserMessage, codebolt: CodeboltAPI) {
    
    // Step 1: Build initial prompt with all modifiers
    // This replaces: PromptBuilder with addMCPTools, addAgentTools, addEnvironmentDetails, addSystemPrompt
    const promptGenerator = new InitialPromptGenerator({
        processors: [
            new ChatHistoryMessageModifier({ enableChatHistory: true }),   // Previous conversation
            new EnvironmentContextModifier({ enableFullContext: false }), // Environment details
            new DirectoryContextModifier({}),                             // Directory tree
            new AtFileProcessorModifier({}),                              // @file references
            new CoreSystemPromptModifier({ 
                customSystemPrompt: 'Your system prompt here'             // System prompt (NOTE: no YAML support)
            }),
            new ToolInjectionModifier({                                   // MCP + Agent tools
                toolsLocation: 'Tool',
                giveToolExamples: true
            }),
        ],
        enableLogging: true
    });

    let processedMessage: ProcessedMessage = await promptGenerator.processMessage(userMessage);

    // Step 2: Create AgentStep for LLM inference
    const agentStep = new AgentStep({
        preInferenceProcessors: [
            new ChatCompressionModifier({ enableCompression: true })      // Auto-summarize if long
        ],
        postInferenceProcessors: [],
        llmRole: 'default'
    });

    // Step 3: Create ResponseExecutor for tool execution
    const responseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: []
    });

    // Step 4: Main conversation loop
    let completed = false;

    while (!completed) {
        // LLM Inference (replaces llm.inference)
        const stepOutput = await agentStep.executeStep(userMessage, processedMessage);
        
        // Tool Execution (replaces LLMOutputHandler.runTools + FollowUpQuestionBuilder)
        const responseOutput = await responseExecutor.executeResponse({
            initialUserMessage: userMessage,
            actualMessageSentToLLM: stepOutput.actualMessageSentToLLM,
            rawLLMOutput: stepOutput.rawLLMResponse,
            nextMessage: stepOutput.nextMessage
        });

        // Check completion (replaces llmOutputObject.isCompleted())
        completed = responseOutput.completed;
        
        // Update for next iteration (replaces addPreviousConversation + addToolResult)
        processedMessage = responseOutput.nextMessage;

        if (completed && responseOutput.finalMessage) {
            console.log("Final response:", responseOutput.finalMessage);
        }
    }

    console.log("Agent workflow completed successfully!");
}
Summary
All core functionality is available in the unified library for manual orchestration. The only missing pieces are:

YAML loading utilities for system prompts and task instructions - you'd need to load the YAML yourself and pass the string to CoreSystemPromptModifier
addAgentsToPrompt() - converting agent definitions to prompt text (rarely used)
The unified library actually provides more functionality through its processor system, including loop detection, IDE context, @file processing, and chat recording that weren't in the old builder pattern.