import codebolt from '@codebolt/codeboltjs';
import {
    InitialPromptGenerator,
    ResponseExecutor,
    AgentStep,
} from '@codebolt/agent/unified';
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    DirectoryContextModifier,
    ChatHistoryMessageModifier,
    ToolInjectionModifier,
} from '@codebolt/agent/processor-pieces';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';
import { DETAIL_SPEC_GENERATOR_SYSTEM_PROMPT } from './prompts';

interface ActionBlockResult {
    success: boolean;
    specs_path?: string;
    action_plan?: string;
    createdRequirementPlanPath?: string;
    error?: string;
}

// ================================
// SPEC GENERATOR
// ================================

async function runSpecGenerator(reqMessage: FlatUserMessage, detailPlan: any): Promise<ActionBlockResult> {
    const planContent = typeof detailPlan === 'string' ? detailPlan : JSON.stringify(detailPlan, null, 2);

    const systemPrompt = `${DETAIL_SPEC_GENERATOR_SYSTEM_PROMPT}

## Detailed Plan to Analyze:
${planContent}`;

    const promptGenerator = new InitialPromptGenerator({
        processors: [
            new ChatHistoryMessageModifier({ enableChatHistory: true }),
            new EnvironmentContextModifier({ enableFullContext: true }),
            new DirectoryContextModifier(),
            new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
            new ToolInjectionModifier({ includeToolDescriptions: true })
        ],
        baseSystemPrompt: systemPrompt
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let completed = false;
    let finalMessage = "";

    // Track artifacts as they are created across iterations
    let createdSpecsPath: string | undefined;
    let createdActionPlanId: string | undefined;
    let createdRequirementPlanPath: string | undefined;
    let reviewApproved = false;

    do {
        const agent = new AgentStep({
            preInferenceProcessors: [],
            postInferenceProcessors: []
        });

        const result: AgentStepOutput = await agent.executeStep(reqMessage, prompt);

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

        if (executionResult.finalMessage) {
            finalMessage = executionResult.finalMessage;
        }

        // Check tool results from this iteration for requirement_plan_review approval
        if (executionResult.toolResults && executionResult.toolResults.length > 0) {
            for (const toolResult of executionResult.toolResults) {
                const content = typeof toolResult.content === 'string' ? toolResult.content : JSON.stringify(toolResult.content);

                // Track requirement_plan_create path
                const reqPlanCreateMatch = content.match(/[Rr]equirement plan created at:\s*(\S+)/);
                if (reqPlanCreateMatch) createdRequirementPlanPath = reqPlanCreateMatch[1];

                // Track filePath from JSON responses (e.g. {"filePath":"..."})
                try {
                    const parsed = JSON.parse(content);
                    if (parsed.filePath && !createdRequirementPlanPath) {
                        createdRequirementPlanPath = parsed.filePath;
                    }
                } catch { /* not JSON, skip */ }

                // Track action plan ID
                const planIdMatch = content.match(/ID:\s*([a-zA-Z0-9_-]+)/);
                if (planIdMatch) createdActionPlanId = planIdMatch[1];

                // Detect requirement_plan_review approval
                const reviewStatusMatch = content.match(/review status:\s*(approved|rejected)/i);
                if (reviewStatusMatch && reviewStatusMatch[1].toLowerCase() === 'approved') {
                    reviewApproved = true;
                }
            }
        }

        // Also scan conversation messages for any missed artifacts
        if (prompt.message && prompt.message.messages) {
            for (const msg of prompt.message.messages) {
                if (msg.role === 'tool') {
                    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
                    if (!createdRequirementPlanPath) {
                        const reqPlanCreateMatch = content.match(/[Rr]equirement plan created at:\s*(\S+)/);
                        if (reqPlanCreateMatch) createdRequirementPlanPath = reqPlanCreateMatch[1];
                    }
                }
            }
        }

        // If review was approved, return immediately — don't wait for attempt_completion
        if (reviewApproved && createdRequirementPlanPath) {
            codebolt.chat.sendMessage(`Requirement plan created successfully ${createdRequirementPlanPath}`);
            return {
                success: true,
                specs_path: createdSpecsPath,
                action_plan: createdActionPlanId,
                createdRequirementPlanPath: createdRequirementPlanPath,
            };
        }

        if (completed) {
            break;
        }
    } while (!completed);

    // If loop ended without approval (e.g. LLM called attempt_completion before approval, or review was rejected)
    return {
        success: false,
        specs_path: createdSpecsPath,
        action_plan: createdActionPlanId,
        error: !reviewApproved
            ? 'Requirement plan was not approved by user'
            : 'Requirement plan path not found',
    };
}

// ================================
// MAIN ACTION BLOCK HANDLER
// ================================

codebolt.onActionBlockInvocation(async (threadContext, _metadata): Promise<ActionBlockResult> => {
    try {
        const params = threadContext?.params || {};
        const detailPlan = params.detailPlan;
        const userMessage = params.userMessage as FlatUserMessage || { userMessage: "Create detailed specification from plan", projectPath: "" };

        if (!detailPlan) {
            return { success: false, error: 'No detailPlan provided' };
        }

        return await runSpecGenerator(userMessage, detailPlan);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Spec creation failed:', error);
        return { success: false, error: errorMessage };
    }
});
