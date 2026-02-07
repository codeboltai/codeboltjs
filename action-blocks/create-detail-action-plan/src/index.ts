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
    requirementplan?: string;
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

        // VALIDATION CHECK: Ensure all planning artifacts were created
        // This ActionBlock is for PLANNING ONLY - we check that plans were created, not executed
        if (completed) {
            let reqPlanCreated = false;
            let reqPlanReviewed = false;

            if (prompt.message && Array.isArray(prompt.message.messages)) {
                for (const msg of prompt.message.messages) {
                    if (msg.role === 'assistant' && (msg as any).tool_calls) {
                        for (const toolCall of (msg as any).tool_calls) {
                            if (toolCall.function && toolCall.function.name) {
                                if (toolCall.function.name.includes('requirement_plan_create')) reqPlanCreated = true;
                                if (toolCall.function.name.includes('requirement_review')) reqPlanReviewed = true;
                            }
                        }
                    }
                }
            }

            if (!reqPlanCreated || !reqPlanReviewed) {
                console.log("Validation failed: Required planning artifacts missing. Forcing continuation.");
                // If missing mandatory planning steps, force continuation
                completed = false;

                const missingSteps = [];
                if (!reqPlanCreated) missingSteps.push("generate the requirement plan (using requirement_plan_create)");
                if (!reqPlanReviewed) missingSteps.push("send it for review (using requirement_review)");

                prompt.message.messages.push({
                    role: 'user',
                    content: `CRITICAL SYSTEM ALERT: You have attempted to complete the task without finishing mandatory PLANNING steps. 
You MUST ${missingSteps.join(' AND ')}.
Remember: Your job is to CREATE PLANS, not execute them. Complete these planning steps and then use attempt_completion.`
                } as any);
            }
        }

        if (completed) {
            break;
        }
    } while (!completed);

    let createdSpecsPath: string | undefined;
    let createdActionPlanId: string | undefined;
    let createdRequirementPlanPath: string | undefined;

    if (prompt.message && prompt.message.messages) {
        for (const msg of prompt.message.messages) {
            if (msg.role === 'tool') {
                const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
                const planIdMatch = content.match(/ID:\s*([a-zA-Z0-9_-]+)/);
                if (planIdMatch) createdActionPlanId = planIdMatch[1];

                const reqPlanPathMatch = content.match(/requirement plan.*at:\s*(\S+)/i);
                if (reqPlanPathMatch) createdRequirementPlanPath = reqPlanPathMatch[1];
            } else if (msg.role === 'assistant') {
                const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
                const specsPathMatch = content.match(/specs\/[a-zA-Z0-9_-]+\.specs/);
                if (specsPathMatch) createdSpecsPath = specsPathMatch[0];
            }
        }
    }

    if (createdSpecsPath) {
        return {
            success: true,
            specs_path: createdSpecsPath,
            action_plan: createdActionPlanId,
            requirementplan: createdRequirementPlanPath
        };
    } else {
        return {
            success: completed,
            specs_path: createdSpecsPath,
            action_plan: createdActionPlanId,
            requirementplan: createdRequirementPlanPath
        };
    }
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
