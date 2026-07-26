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

function extractPlanId(response: any): string | undefined {
    return response?.planId ||
        response?.executionPlan?.planId ||
        response?.plan?.planId ||
        response?.data?.planId ||
        response?.data?.executionPlan?.planId ||
        response?.data?.plan?.planId ||
        response?.response?.planId ||
        response?.response?.executionPlan?.planId ||
        response?.response?.plan?.planId ||
        response?.response?.data?.planId ||
        response?.response?.data?.executionPlan?.planId ||
        response?.response?.data?.plan?.planId;
}

async function findLatestNoteFile(): Promise<string | null> {
    const { projectPath } = await codebolt.project.getProjectPath();
    const notesDir = `${projectPath}/notes`;

    try {
        const result = await codebolt.fs.listDirectory({ path: notesDir });
        const entries = result.entries || [];

        if (entries.length === 0) {
            return null;
        }

        // Filter for .note files
        const noteFiles = entries
            .filter((entry: any) => {
                const name = entry.name || entry;
                return name?.endsWith('.note');
            })
            .map((entry: any) => entry.name || entry);

        if (noteFiles.length === 0) {
            return null;
        }

        // Return the latest note file (last in list)
        const latestNoteFile = noteFiles[noteFiles.length - 1];
        return `${notesDir}/${latestNoteFile}`;
    } catch (error) {
        console.error('Error finding note files:', error);
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

async function runTaskPlanner(noteFilePath: string): Promise<PlanResult> {
    const { content } = await codebolt.fs.readFile(noteFilePath);

    if (!content) {
        return { success: false, error: `No note file found at ${noteFilePath}` };
    }

    const systemPrompt = TASK_PLANNER_SYSTEM_PROMPT.replace('{{PLAN_CONTENT}}', content);
    codebolt.chat.sendMessage("Creating feature plan from notes...")

    const input = [
        { type: 'message', role: 'system', content: systemPrompt },
        { type: 'message', role: 'user', content: 'create task list for given plan' }
    ];
    const { completion } = await codebolt.llm.inference({
        input,
        full: true,
        tools: []
    });

    const llmContent = completion?.content || completion?.output_text;
    if (!llmContent) {
        return { success: false, error: 'LLM inference failed' };
    }

    const taskPlan = parseJsonContent(llmContent);

    if (!taskPlan) {
        return { success: false, error: 'Failed to parse task plan JSON' };
    }

    // Create execution plan
    const createResponse = await codebolt.executionPlan.create({
        name: taskPlan.plan.name,
        description: taskPlan.plan.description
    });

    const planId = extractPlanId(createResponse);

    if (!planId) {
        console.error('Failed to extract execution plan ID from response:', JSON.stringify(createResponse, null, 2));
        return { success: false, error: 'Failed to create execution plan' };
    }

    // Add tasks to execution plan
    for (const item of taskPlan.tasks) {
        if (isGroupItem(item)) {
            await codebolt.executionPlan.addGroup(planId, item as any);
        } else {
            await codebolt.executionPlan.addTask(planId, item as any);
        }
    }

    // Create feature plan document
    let featurePlanPath: string | undefined;
    try {
        const planName = taskPlan.plan.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const createResult: any = await codebolt.featurePlan.create(planName);

        if (createResult.success && createResult.data) {
            const filePath = createResult.data.filePath as string;
            featurePlanPath = filePath;

           

         

            // Add execution plan link section
            await codebolt.featurePlan.addSection(filePath, {
                type: 'execution-plan-link',
                title: 'Execution Plan',
                linkedFile: planId
            });

               // Add note link section
               await codebolt.featurePlan.addSection(filePath, {
                type: 'note-link',
                title: 'Planning Note',
                linkedFile: noteFilePath
            });

             // Add overview section
             await codebolt.featurePlan.addSection(filePath, {
              type: 'markdown',
              title: 'Overview',
              content: `# ${taskPlan.plan.name}\n\n${taskPlan.plan.description}`
          });
            // codebolt.chat.sendMessage(`Created feature plan: ${filePath}`, {});

            // Request review for the plan
            await codebolt.featurePlan.review(filePath);
        }
    } catch (featurePlanError) {
        console.error('Failed to create feature plan:', featurePlanError);
    }

    return {
        success: true,
        planId,
        featurePlanPath,
        requirementPlanPath: featurePlanPath
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

        // Find the note file created by detail planner
        const noteFilePath = await findLatestNoteFile();
        if (!noteFilePath) {
            return { success: false, error: 'No note file was created by the detail planner' };
        }

        // Phase 2: Run Task Planner
        const result = await runTaskPlanner(noteFilePath);

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
