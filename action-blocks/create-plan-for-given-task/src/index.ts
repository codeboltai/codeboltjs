import codebolt from '@codebolt/codeboltjs';
import {
    InitialPromptGenerator,
    ResponseExecutor
} from '@codebolt/agent/unified';
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
import { PlanResult, TaskPlan, TaskItem } from './types';
import { DETAIL_PLANNER_SYSTEM_PROMPT, TASK_PLANNER_SYSTEM_PROMPT } from './prompts';

// ================================
// HELPER FUNCTIONS
// ================================

function parseJsonContent(content: string): TaskPlan | null {
    try {
        let jsonStr = content;
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace('```json', '').replace('```', '');
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace('```', '').replace('```', '');
        }
        return JSON.parse(jsonStr.trim()) as TaskPlan;
    } catch (e) {
        console.error('JSON parse error:', e);
        return null;
    }
}

function isGroupItem(item: TaskItem): boolean {
    return item.type === 'parallelGroup' ||
           item.type === 'loopGroup' ||
           item.type === 'ifGroup' ||
           item.type === 'waitUntilGroup';
}

async function findLatestSpecsFile(): Promise<string | null> {
    const { projectPath } = await codebolt.project.getProjectPath();
    const specsDir = `${projectPath}/specs`;

    try {
        const result = await codebolt.fs.listDirectory({ path: specsDir });
        const entries = result.entries || [];

        if (entries.length === 0) {
            return null;
        }

        // Filter for .specs files
        const specsFiles = entries
            .filter((entry: any) => {
                const name = entry.name || entry;
                return name?.endsWith('.specs');
            })
            .map((entry: any) => entry.name || entry);

        if (specsFiles.length === 0) {
            return null;
        }

        // Return the latest specs file (last in list)
        const latestSpecsFile = specsFiles[specsFiles.length - 1];
        return `${specsDir}/${latestSpecsFile}`;
    } catch (error) {
        console.error('Error finding specs files:', error);
        return null;
    }
}

// ================================
// DETAIL PLANNER
// ================================

async function runDetailPlanner(reqMessage: FlatUserMessage): Promise<boolean> {
    codebolt.chat.sendMessage("Starting detail planning phase...", {});

    const promptGenerator = new InitialPromptGenerator({
        processors: [
            new ChatHistoryMessageModifier({ enableChatHistory: true }),
            new EnvironmentContextModifier({ enableFullContext: true }),
            new DirectoryContextModifier(),
            new IdeContextModifier({
                includeActiveFile: true,
                includeOpenFiles: true,
                includeCursorPosition: true,
                includeSelectedText: true
            }),
            new CoreSystemPromptModifier({ customSystemPrompt: DETAIL_PLANNER_SYSTEM_PROMPT }),
            new ToolInjectionModifier({ includeToolDescriptions: true }),
            new AtFileProcessorModifier({ enableRecursiveSearch: true })
        ],
        baseSystemPrompt: DETAIL_PLANNER_SYSTEM_PROMPT
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let completed = false;

    do {
        const agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] });
        const result: AgentStepOutput = await agent.executeStep(reqMessage, prompt);
        prompt = result.nextMessage;

        const responseExecutor = new ResponseExecutor({
            preToolCallProcessors: [],
            postToolCallProcessors: []
        });

        const executionResult = await responseExecutor.executeResponse({
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

    return true;
}

// ================================
// TASK PLANNER
// ================================

async function runTaskPlanner(specsFilePath: string): Promise<PlanResult> {
    const { content } = await codebolt.fs.readFile(specsFilePath);

    if (!content) {
        return { success: false, error: `No specs file found at ${specsFilePath}` };
    }

    const systemPrompt = TASK_PLANNER_SYSTEM_PROMPT.replace('{{PLAN_CONTENT}}', content);
    codebolt.chat.sendMessage("Creating task plan from specification...")

    const { completion } = await codebolt.llm.inference({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'create task list for given plan' }
        ],
        full: true,
        tools: []
    });

    if (!completion || !completion.choices) {
        return { success: false, error: 'LLM inference failed' };
    }

    const llmContent = completion.choices[0].message.content;
    const taskPlan = parseJsonContent(llmContent);

    if (!taskPlan) {
        return { success: false, error: 'Failed to parse task plan JSON' };
    }

    // Create action plan
    const { response } = await codebolt.actionPlan.createActionPlan({
        name: taskPlan.plan.name,
        description: taskPlan.plan.description
    });

    const planId = response.data.actionPlan.planId;

    // Add tasks to action plan
    for (const item of taskPlan.tasks) {
        if (isGroupItem(item)) {
            await codebolt.actionPlan.addGroupToActionPlan(planId, item as any);
        } else {
            await codebolt.actionPlan.addTaskToActionPlan(planId, item as any);
        }
    }

    // Create requirement plan document
    let requirementPlanPath: string | undefined;
    try {
        const planName = taskPlan.plan.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const createResult: any = await codebolt.requirementPlan.create(planName);

        if (createResult.success && createResult.data) {
            const filePath = createResult.data.filePath as string;
            requirementPlanPath = filePath;

           

         

            // Add action plan link section
            await codebolt.requirementPlan.addSection(filePath, {
                type: 'actionplan-link',
                title: 'Action Plan',
                linkedFile: planId
            });

               // Add spec link section
               await codebolt.requirementPlan.addSection(filePath, {
                type: 'specs-link',
                title: 'Specification',
                linkedFile: specsFilePath
            });

             // Add overview section
             await codebolt.requirementPlan.addSection(filePath, {
              type: 'markdown',
              title: 'Overview',
              content: `# ${taskPlan.plan.name}\n\n${taskPlan.plan.description}`
          });
            // codebolt.chat.sendMessage(`Created requirement plan: ${filePath}`, {});

            // Request review for the plan
            await codebolt.requirementPlan.review(filePath);
        }
    } catch (reqPlanError) {
        console.error('Failed to create requirement plan:', reqPlanError);
    }

    return {
        success: true,
        planId,
        requirementPlanPath
    };
}

// ================================
// MAIN ACTION BLOCK HANDLER
// ================================

codebolt.onActionBlockInvocation(async (threadContext, _metadata): Promise<PlanResult> => {
    try {
  
        // Extract parameters from threadContext
        const params = threadContext?.params || {};
        const userMessage = params.userMessage as FlatUserMessage;

        if (!userMessage) {
            return { success: false, error: 'No user message provided' };
        }

        // Phase 1: Run Detail Planner
        try {
            await runDetailPlanner(userMessage);
        } catch (error) {
            codebolt.chat.sendMessage(error);
        }

        // Find the specs file created by detail planner
        const specsFilePath = await findLatestSpecsFile();
        if (!specsFilePath) {
            return { success: false, error: 'No specs file was created by the detail planner' };
        }

        // Phase 2: Run Task Planner
        const result = await runTaskPlanner(specsFilePath);

        if (result.success) {
            codebolt.chat.sendMessage("Plan creation completed successfully", {});
        }

        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Plan creation failed:', error);
        return { success: false, error: errorMessage };
    }
});
