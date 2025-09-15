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
    ToolInjectionModifier


} from '@codebolt/agent/processor-pieces';



import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';
let systemPrompt = `You are an interactive AI agent specializing in software engineering tasks. Your primary goal is to help users safely and efficiently, adhering strictly to the following instructions and utilizing your available tools.

# Core Mandates

- **Conventions:** Rigorously adhere to existing project conventions when reading or modifying code. Analyze surrounding code, tests, and configuration first.
- **Libraries/Frameworks:** NEVER assume a library/framework is available or appropriate. Verify its established usage within the project before employing it.
- **Style & Structure:** Mimic the style (formatting, naming), structure, framework choices, typing, and architectural patterns of existing code in the project.
- **Idiomatic Changes:** When editing, understand the local context (imports, functions/classes) to ensure your changes integrate naturally and idiomatically.
- **Comments:** Add code comments sparingly. Focus on *why* something is done, especially for complex logic, rather than *what* is done.
- **Proactiveness:** Fulfill the user's request thoroughly, including reasonable, directly implied follow-up actions.
- **Confirm Ambiguity/Expansion:** Do not take significant actions beyond the clear scope of the request without confirming with the user.
- **Explaining Changes:** After completing a code modification or file operation *do not* provide summaries unless asked.

# Primary Workflows

## Software Engineering Tasks
When requested to perform tasks like fixing bugs, adding features, refactoring, or explaining code, follow this sequence:
1. **Understand:** Think about the user's request and the relevant codebase context. Use search tools extensively to understand file structures, existing code patterns, and conventions.
2. **Plan:** Build a coherent and grounded plan for how you intend to resolve the user's task. Share a concise yet clear plan with the user if it would help.
3. **Implement:** Use the available tools to act on the plan, strictly adhering to the project's established conventions.
4. **IMPORTANT:** Always send response with tool  without tool that will be treated as end of process .
5. **Verify:** If applicable and feasible, verify the changes using the project's testing procedures and build/lint commands.

# Operational Guidelines

## Tone and Style
- **Concise & Direct:** Adopt a professional, direct, and concise tone.
- **Minimal Output:** Aim for fewer than 3 lines of text output per response whenever practical.
- **Clarity over Brevity:** While conciseness is key, prioritize clarity for essential explanations.
- **No Chitchat:** Avoid conversational filler. Get straight to the action or answer.
- **Formatting:** Use GitHub-flavored Markdown.


## Security and Safety Rules
- **Security First:** Always apply security best practices. Never introduce code that exposes, logs, or commits secrets, API keys, or other sensitive information.
- **File Operations:** Always use absolute paths when referring to files with tools.

# Final Reminder
Your core function is efficient and safe assistance. Balance extreme conciseness with the crucial need for clarity, especially regarding safety and potential system modifications. Always prioritize user control and project conventions.

`

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {

    try {


        codebolt.chat.sendMessage("Gemini agent started", {})
        // codebolt.chat.sendMessage(JSON.stringify(reqMessage),{})
        let promptGenerator = new InitialPromptGenerator({
            processors: [
                // 1. Environment Context (date, OS)
                new EnvironmentContextModifier({ enableFullContext: true }),

                // 2. Directory Context (folder structure)  
                new DirectoryContextModifier(),

                // 3. IDE Context (active file, opened files)
                new IdeContextModifier({
                    includeActiveFile: true,
                    includeOpenFiles: true,
                    includeCursorPosition: true,
                    includeSelectedText: true
                }),
                // 4. Core System Prompt (instructions)
                new CoreSystemPromptModifier(
                    { customSystemPrompt: systemPrompt }
                ),

                // 5. Tools (function declarations)
                new ToolInjectionModifier({
                    includeToolDescriptions: true
                }),

                // 6. At-file processing (@file mentions)
                new AtFileProcessorModifier({
                    enableRecursiveSearch: true
                })
            ],
            baseSystemPrompt: systemPrompt
        });
        let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
        // codebolt.chat.sendMessage(JSON.stringify(prompt),{})
        // await fs.promises.writeFile('prompt_output.json', JSON.stringify(prompt, null, 2), 'utf-8');
        // return
        let completed = false;
        do {
            let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] })
            let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;
            console.log(prompt)
            let responseExecutor = new ResponseExecutor({
                preToolCalProcessors: [],
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
                break;
            }

        } while (!completed);





    } catch (error) {
        console.log(error)
    }
})



async function test() {
    await new Promise(resolve => setTimeout(resolve, 4000));
    try {
        let reqMessage: FlatUserMessage = {
            "userMessage": "hi\n\n",
            "currentFile": "", "mentionedFiles": ["/Users/ravirawat/Documents/codeboltai/codeboltjs/Readme.md"],
            "mentionedFullPaths": [],
            "mentionedFolders": [],
            "uploadedImages": [],
            "mentionedMCPs": [],
            "selectedAgent": { "id": "", "name": "" },
            "messageId": "", "threadId": "6536c82f-c7d1-4dbd-8e68-c90f7ef5ebc3",
            "selection": null, "mentionedAgents": [], 
            "activeFile": "/Users/ravirawat/Documents/cbtest/geminiAgentTest/.gitignore",
             "openedFiles": ["/Users/ravirawat/Documents/cbtest/geminiAgentTest/.gitignore"]
        }


        // codebolt.chat.sendMessage("Gemini agent started", {})
        codebolt.chat.sendMessage(JSON.stringify(reqMessage), {})

        let promptGenerator = new InitialPromptGenerator({
            processors: [
                // 1. Environment Context (date, OS)
                new EnvironmentContextModifier({ enableFullContext: false }),

                // 2. Directory Context (folder structure)  
                new DirectoryContextModifier(),

                // 3. IDE Context (active file, opened files)
                new IdeContextModifier({
                    includeActiveFile: true,
                    includeOpenFiles: true,
                    includeCursorPosition: true,
                    includeSelectedText: true
                }),
                // 4. Core System Prompt (instructions)
                new CoreSystemPromptModifier(
                    { customSystemPrompt: systemPrompt }
                ),

                // 5. Tools (function declarations)
                new ToolInjectionModifier({
                    includeToolDescriptions: true
                }),

                // 6. At-file processing (@file mentions)
                new AtFileProcessorModifier({
                    enableRecursiveSearch: true
                })
            ],
            baseSystemPrompt: systemPrompt
        });
        let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
        // codebolt.chat.sendMessage(JSON.stringify(prompt),{})
        console.log(JSON.stringify(prompt))
        let completed = false;
        do {
            let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] })
            let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;
            console.log(prompt)
            let responseExecutor = new ResponseExecutor({
                preToolCalProcessors: [],
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
                break;
            }

        } while (!completed);





    } catch (error) {
        console.log(error)
    }
}
test();
