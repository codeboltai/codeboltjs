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
    requirementPlanPath?: string;
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
            new ToolInjectionModifier({
                includeToolDescriptions: true,
                // allowedTools: [
                //     // FS tools
                //     'codebolt--fs_create_file', 'codebolt--fs_create_folder', 'codebolt--fs_read_file', 'codebolt--fs_update_file',
                //     'codebolt--fs_delete_file', 'codebolt--fs_delete_folder', 'codebolt--fs_list_file', 'codebolt--fs_grep_search',
                //     'codebolt--fs_file_search', 'codebolt--fs_search_files', 'codebolt--fs_read_many_files', 'codebolt--fs_list_directory',
                //     'codebolt--fs_list_code_definitions',
                //     // Search tools
                //     'codebolt--search_files', 'codebolt--codebase_search', 'codebolt--glob', 'codebolt--grep',
                //     'codebolt--search_mcp_tool', 'codebolt--list_code_definition_names',
                //     'codebolt--search_web', 'codebolt--search_get_first_link',
                //     // Action Plan tools
                //     'codebolt--actionPlan_getAll', 'codebolt--actionPlan_create', 'codebolt--actionPlan_addTask',
                //     // Requirement Plan tools
                //     'codebolt--requirement_plan_create', 'codebolt--requirement_plan_get', 'codebolt--requirement_plan_update',
                //     'codebolt--requirement_plan_list', 'codebolt--requirement_plan_add_section',
                //     'codebolt--requirement_plan_update_section', 'codebolt--requirement_plan_remove_section',
                //     'codebolt--requirement_plan_reorder_sections', 'codebolt--requirement_plan_review',
                //     'codebolt--attempt_completion'
                // ],
            })
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

        if (completed) {
            try {
                const { result } = JSON.parse(finalMessage);
                // codebolt.chat.sendMessage(`Completion result: ${JSON.stringify(result)}`);

                if (result.status == 'success' && result.requirementPlanPath) {
                    return {
                        success: true,
                        requirementPlanPath: result.requirementPlanPath,
                        // Optional fields if provided in result
                        specs_path: result.specs_path,
                        action_plan: result.action_plan,
                    };
                }
            } catch (error) {
                codebolt.chat.sendMessage(`Failed to parse completion result: ${error} ${finalMessage}`);
                console.error("Failed to parse completion result:", error);
            }

            // If we are here, text processing failed or requirementPlanPath was missing.
            // Force the agent to retry by adding a user message and setting completed = false.
            if (prompt.message && (prompt.message as any).messages) {
                (prompt.message as any).messages.push({
                    role: 'user',
                    content: "Missing 'requirementPlanPath' in the final completion result. You MUST call attempt_completion again with the following JSON structure:\n\n{\n  \"status\": \"success\",\n  \"requirementPlanPath\": \"<path_to_requirement_plan>\"\n}"
                });
                completed = false;
                continue;
            }

            break;
        }
    } while (!completed);

    // If loop ended without approval (e.g. LLM called attempt_completion before approval, or review was rejected)
    return {
        success: false,
        requirementPlanPath: createdRequirementPlanPath,
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
