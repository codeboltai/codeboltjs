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

let systemPrompt = `You are Codebolt CLI, an expert AI assistant operating in a special 'Plan Mode'. Your sole purpose is to research, analyze, and create detailed implementation plans. You must operate in a strict read-only capacity.

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

    codebolt.chat.sendMessage("Planner agent started", {})
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
        initialUserMessage: reqMessage,
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

Analyze the plan and divide it into distinct, actionable items.
Items can be valid Tasks (at top level) or special Flow Groups (Parallel, Loop, If, WaitUntil).

## STRICT TYPE DEFINITIONS

### Top-Level Task (used directly in tasks array)
{
  "type": "task",
  "name": "Clear, concise name (max 60 chars)",
  "description": "Detailed explanation of what to do",
  "dependencies": ["task_name_1", "task_name_2"],
  "estimated_time": "15 minutes",
  "priority": "High" | "Medium" | "Low"
}

### TaskReference (REQUIRED wrapper for tasks INSIDE groups)
When placing tasks inside any group (parallelGroup, loopGroup, ifGroup, waitUntilGroup), 
you MUST wrap them in a TaskReference object:
{
  "type": "task",
  "task": {
    "name": "Task Name",
    "description": "Task description",
    "dependencies": [],
    "estimated_time": "5m",
    "priority": "Medium"
  }
}

### ParallelGroup
{
  "type": "parallelGroup",
  "name": "Optional Group Name",
  "groupItems": {
    "track1": [ /* array of TaskReference or nested StepGroup */ ],
    "track2": [ /* array of TaskReference or nested StepGroup */ ]
  }
}
REQUIRED: groupItems must be an object with at least one track. Each track value must be an array.

### LoopGroup
{
  "type": "loopGroup",
  "name": "Optional Group Name",
  "iterationListId": "list_id_to_iterate",
  "loopTasks": [ /* array of TaskReference or nested StepGroup */ ]
}
REQUIRED: iterationListId must be a non-empty string. loopTasks must be an array.

### IfGroup
{
  "type": "ifGroup",
  "name": "Optional Group Name",
  "condition": "condition_expression",
  "ifTasks": [ /* array of TaskReference or nested StepGroup */ ]
}
REQUIRED: condition must be a non-empty string. ifTasks must be an array.

### WaitUntilGroup
{
  "type": "waitUntilGroup",
  "name": "Optional Group Name",
  "waitSteps": ["step1", "step2"],
  "waitTasks": [ /* array of TaskReference or nested StepGroup */ ]
}
REQUIRED: waitSteps must be a non-empty array of strings. waitTasks must be an array.

## CRITICAL FORMATTING REQUIREMENTS
1. Output ONLY valid JSON - no markdown, no explanations, no extra text
2. Use double quotes for all keys and string values
3. No trailing commas after last array item
4. No newlines or whitespace inside JSON strings
5. Array must be properly closed: [...]
6. Tasks INSIDE groups MUST use TaskReference wrapper with "type": "task" and "task": {...}
7. Tasks at TOP LEVEL in tasks array do NOT need the wrapper

## COMPLETE EXAMPLE OUTPUT
{
  "plan": {
    "name": "Implementation Plan",
    "description": "Detailed description of the plan"
  },
  "tasks": [
    {
      "type": "task",
      "name": "Setup Project",
      "description": "Initialize project structure",
      "dependencies": [],
      "estimated_time": "10 minutes",
      "priority": "High"
    },
    {
      "type": "parallelGroup",
      "name": "Parallel Processing",
      "groupItems": {
        "frontend": [
          {
            "type": "task",
            "task": {
              "name": "Build UI Components",
              "description": "Create React components",
              "dependencies": ["Setup Project"],
              "estimated_time": "30m",
              "priority": "High"
            }
          }
        ],
        "backend": [
          {
            "type": "task",
            "task": {
              "name": "Create API Endpoints",
              "description": "Implement REST API",
              "dependencies": ["Setup Project"],
              "estimated_time": "30m",
              "priority": "High"
            }
          }
        ]
      }
    },
    {
      "type": "loopGroup",
      "name": "Process Files",
      "iterationListId": "files_to_process",
      "loopTasks": [
        {
          "type": "task",
          "task": {
            "name": "Process File",
            "description": "Process each file in the list",
            "dependencies": [],
            "estimated_time": "2m",
            "priority": "Medium"
          }
        }
      ]
    },
    {
      "type": "ifGroup",
      "name": "Conditional Deploy",
      "condition": "tests_passed == true",
      "ifTasks": [
        {
          "type": "task",
          "task": {
            "name": "Deploy to Production",
            "description": "Deploy if tests pass",
            "dependencies": [],
            "estimated_time": "5m",
            "priority": "High"
          }
        }
      ]
    },
    {
      "type": "waitUntilGroup",
      "name": "Wait for Server",
      "waitSteps": ["Check port 8080", "Verify health endpoint"],
      "waitTasks": [
        {
          "type": "task",
          "task": {
            "name": "Run Integration Tests",
            "description": "Execute integration test suite",
            "dependencies": [],
            "estimated_time": "10m",
            "priority": "High"
          }
        }
      ]
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
      if (content.startsWith('```json')) {
        content = content.replace('```json', '').replace('```', '');
      } else if (content.startsWith('```')) {
        content = content.replace('```', '').replace('```', '');
      }
      let taskPlan = JSON.parse(content);
      codebolt.chat.sendMessage(JSON.stringify(taskPlan))
      let { response } = await codebolt.actionPlan.createActionPlan({ name: taskPlan.plan.name, description: taskPlan.plan.description })
      for (const item of taskPlan.tasks) {
        if (item.type === 'parallelGroup' || item.type === 'loopGroup' || item.type === 'ifGroup' || item.type === 'waitUntilGroup') {
          await codebolt.actionPlan.addGroupToActionPlan(response.data.actionPlan.planId, item)
        } else {
          await codebolt.actionPlan.addTaskToActionPlan(response.data.actionPlan.planId, item)
        }
      }

      // Create a Requirement Plan document linking the spec and action plan
      try {
        const planName = taskPlan.plan.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const createResult: any = await codebolt.requirementPlan.create(planName);

        if (createResult.success && createResult.data) {
          const planFilePath = createResult.data.filePath;

          // Add overview section
          await codebolt.requirementPlan.addSection(planFilePath, {
            type: 'markdown',
            title: 'Overview',
            content: `# ${taskPlan.plan.name}\n\n${taskPlan.plan.description}`
          });

          // Add spec link section
          await codebolt.requirementPlan.addSection(planFilePath, {
            type: 'specs-link',
            title: 'Specification',
            linkedFile: `${projectPath}/specs/plan.specs`
          });

          // Add action plan link section
          await codebolt.requirementPlan.addSection(planFilePath, {
            type: 'actionplan-link',
            title: 'Action Plan',
            linkedFile: response.data.actionPlan.planId
          });

          codebolt.chat.sendMessage(`Created requirement plan: ${planFilePath}`, {});
        }
      } catch (reqPlanError) {
        console.error('Failed to create requirement plan:', reqPlanError);
      }
    }


  } catch (error) {

  }



})



