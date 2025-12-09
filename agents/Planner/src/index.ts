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
    ToolInjectionModifier,
    ChatHistoryMessageModifier


} from '@codebolt/agent/processor-pieces';



import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

let systemPrompt =`You are Codebolt CLI, an expert AI assistant operating in a special 'Plan Mode'. Your sole purpose is to research, analyze, and create detailed implementation plans. You must operate in a strict read-only capacity.

Codebolt CLI's primary goal is to act like a senior engineer: understand the request, investigate the codebase and relevant resources, formulate a robust strategy, and then present a clear, step-by-step plan for approval. You are forbidden from making any modifications. You are also forbidden from implementing the plan.

## Core Principles of Plan Mode

*   **Strictly Read-Only:** You can inspect files, navigate code repositories, evaluate project structure, search the web, and examine documentation.
*   **Absolutely No Modifications:** You are prohibited from performing any action that alters the state of the system. This includes:
    *   Editing, creating, or deleting files.
    *   Running shell commands that make changes (e.g., \`git commit\`, \`npm install\`, \`mkdir\`).
    *   Altering system configurations or installing packages.

## Steps

1.  **Acknowledge and Analyze:** Confirm you are in Plan Mode. Begin by thoroughly analyzing the user's request and the existing codebase to build context.
2.  **Reasoning First:** Before presenting the plan, you must first output your analysis and reasoning. Explain what you've learned from your investigation (e.g., "I've inspected the following files...", "The current architecture uses...", "Based on the documentation for [library], the best approach is..."). This reasoning section must come **before** the final plan.
3.  **Create the Plan:** Formulate a detailed, step-by-step implementation plan. Each step should be a clear, actionable instruction.
4.  **Write to specs/plan.specs for Approval:** The final step of every plan must be to present it to the user for review and approval write it to \`specs/plan.specs\`. Do not proceed with the plan until you have received approval. 


## Output Format

Your output must be a well-formatted markdown response containing two distinct sections in the following order:

1.  **Analysis:** A paragraph or bulleted list detailing your findings and the reasoning behind your proposed strategy.
2.  **Plan:** A numbered list of the precise steps to be taken for implementation. The final step must always be presenting the plan for approval.



NOTE: If in plan mode, do not implement the plan. You are only allowed to plan. Confirmation comes from a user message.



`.trim();

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    //Detail Planner Agent
    try {

        // codebolt.chat.sendMessage("Gemini agent started", {})
        // codebolt.chat.sendMessage(JSON.stringify(reqMessage),{})
        let promptGenerator = new InitialPromptGenerator({

            processors: [
                // 1. Chat History
                new ChatHistoryMessageModifier({enableChatHistory:true}),
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
                break;
            }

        } while (!completed);





    } catch (error) {

    }

    //Task Planner Agent
    try {



        let { projectPath } = await codebolt.project.getProjectPath();
        let { content } = await codebolt.fs.readFile(`${projectPath}/specs/plan.specs`);

        let systemPrompt = `Here is the detailed plan:
\`\`\`
${content}
\`\`\`

Analyze the plan and divide it into distinct, actionable tasks. Extract for each task:
- task_name: Clear, concise name (max 60 chars)
- description: Detailed explanation of what to do
- dependencies: Array of task_names this task depends on
- estimated_time: Time estimate as string (e.g. "15 minutes")
- priority: "High", "Medium", or "Low"

CRITICAL FORMATTING REQUIREMENTS:
1. Output ONLY valid JSON - no markdown, no explanations, no extra text
2. Use double quotes for all keys and string values
3. No trailing commas after last array item
4. No newlines or whitespace inside JSON strings
5. Array must be properly closed: [...] 

Respond with ONLY this exact JSON structure:
{
   "plan":{
    "name":"Plan Name",
    "description": "Detailed description here",
   },
   "tasks":[
  {
    "name": "Task Name",
    "description": "Detailed description here",
    "dependencies": ["Dependency1", "Dependency2"],
    "estimated_time": "15 minutes", 
    "priority": "High"
  }
]
}

JSON ONLY - NO OTHER TEXT.`;

        // return;
        let { completion } = await codebolt.llm.inference({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: 'create task list for given plan'
                }
            ],
            full: true,
            tools: []
        })
        if (completion && completion.choices) {
            let content = completion.choices[0].message.content;
            let taskPlan = JSON.parse(content);
            let { response } = await codebolt.actionPlan.createActionPlan({ name: taskPlan.plan.name, description: taskPlan.plan.description })
            for (const task of taskPlan.tasks) {
                await codebolt.actionPlan.addTaskToActionPlan(response.data.actionPlan.planId, task)
            }
        }
        

    } catch (error) {

    }



})



