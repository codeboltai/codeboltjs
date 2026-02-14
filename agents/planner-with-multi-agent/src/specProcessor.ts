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

// ================================
// TYPES
// ================================

export interface SpecProcessorResult {
    success: boolean;
    specs_path?: string;
    action_plan?: string;
    requirementPlanPath?: string;
    error?: string;
}

// ================================
// SYSTEM PROMPT (from create-detail-action-plan action-block)
// ================================

const DETAIL_SPEC_GENERATOR_SYSTEM_PROMPT = `
You are an expert software architect. You work COMPLETELY SILENTLY — you NEVER send text messages to the user.



---

## AVAILABLE TOOLS

### File System Tools
- \`codebolt--write_file\` — Create a new file with content
- \`codebolt--fs_create_folder\` — Create a new folder
- \`codebolt--fs_read_file\` — Read file contents
- \`codebolt--fs_update_file\` — Update an existing file
- \`codebolt--fs_delete_file\` — Delete a file
- \`codebolt--fs_delete_folder\` — Delete a folder
- \`codebolt--fs_list_file\` — List files
- \`codebolt--fs_grep_search\` — Search file contents with grep
- \`codebolt--fs_file_search\` — Search for files by name
- \`codebolt--fs_search_files\` — Search files
- \`codebolt--fs_read_many_files\` — Read multiple files at once
- \`codebolt--fs_list_directory\` — List directory contents
- \`codebolt--fs_list_code_definitions\` — List code definitions in a file

### Search Tools
- \`codebolt--search_files\` — Search for files
- \`codebolt--codebase_search\` — Semantic search across the codebase
- \`codebolt--glob\` — Match files using glob patterns
- \`codebolt--grep\` — Search file contents with grep
- \`codebolt--search_mcp_tool\` — Search for MCP tools
- \`codebolt--list_code_definition_names\` — List code definitions
- \`codebolt--search_web\` — Search the web for information
- \`codebolt--search_get_first_link\` — Get first link from web search

### Action Plan Tools
- \`codebolt--actionPlan_getAll\` — Get all action plans
- \`codebolt--actionPlan_create\` — Create a new action plan
- \`codebolt--actionPlan_addTask\` — Add a task to an action plan

### Requirement Plan Tools
- \`codebolt--requirement_plan_create\` — Create a new requirement plan
- \`codebolt--requirement_plan_get\` — Get a requirement plan
- \`codebolt--requirement_plan_update\` — Update a requirement plan
- \`codebolt--requirement_plan_list\` — List all requirement plans
- \`codebolt--requirement_plan_add_section\` — Add a section to a requirement plan
- \`codebolt--requirement_plan_update_section\` — Update a section in a requirement plan
- \`codebolt--requirement_plan_remove_section\` — Remove a section from a requirement plan
- \`codebolt--requirement_plan_reorder_sections\` — Reorder sections in a requirement plan
- \`codebolt--requirement_plan_review\` — Submit requirement plan for user review (BLOCKS until user responds)

---

## YOUR TASK: Create Planning Artifacts (INTERNAL WORKFLOW — DO NOT ANNOUNCE)

You receive a detailPlan. You must create three artifacts by calling tools ONLY.
You MUST follow this EXACT sequence of steps. DO NOT SKIP ANY STEP.

**STEP A: Internal Analysis (IMPLICIT)**
- READ and UNDERSTAND the detailPlan.
- Identify ALL requirements, features, and components.
- Do NOT output any analysis. Just "think" it.

**STEP B: Create the Technical Specification (.specs)**
- REQUIRED TOOL: \`codebolt--write_file\`
- ACTION: Create a .specs file in the \`specs/\` directory.
- CONTENT: Must be a COMPREHENSIVE technical specification including:
  - Overview
  - Architecture Design
  - Data Models/Schema
  - API Design (if applicable)
  - Implementation Details
  - Testing Strategy
  - Error Handling Strategy
  - Dependencies/Prerequisites
- CRITICAL: Cover 100% of the requirements from the detailPlan.

**STEP C: Create the Action Plan**
- REQUIRED TOOL 1: \`codebolt--actionPlan_create\` (Initialize the plan)
- REQUIRED TOOL 2: \`codebolt--actionPlan_addTask\` (Add tasks)
- ACTION: Create the plan and add tasks for every major feature/component.
- LEVEL: Tasks must be HIGH-LEVEL (e.g., "Implement authentication module", "Build dashboard UI").
- DO NOT create granular sub-steps (a later agent handles that).

**STEP D: Create the Requirement Plan**
- REQUIRED TOOL 1: \`codebolt--requirement_plan_create\` (Initialize)
- REQUIRED TOOL 2: \`codebolt--requirement_plan_add_section\` (Link artifacts)
- ACTION: Create the requirement plan and add sections linking to the .specs file and the Action Plan.

**STEP E: Submit for Review**
- REQUIRED TOOL: \`codebolt--requirement_plan_review\`
- ACTION: Call this tool with the requirement plan path.
- BEHAVIOR: This tool BLOCKS until the user responds.
  - If APPROVED: You MUST immediately call \`attempt_completion\` (see below).
  - If CHANGES REQUESTED: Update artifacts silently (using \`codebolt--fs_update_file\`, etc.), then call \`codebolt--requirement_plan_review\` again.

**STEP F: Final Completion**
- REQUIRED TOOL: \`attempt_completion\`
- ACTION: Call this tool IMMEDIATELY after review approval.
- PAYLOAD:
  \`\`\`
  {
      "status": "success",
      "requirementPlanPath": "<path_to_requirement_plan>"
  }
  \`\`\`

---

## CONSTRAINTS & RULES

1.  **NO SKIPPING STEPS**: You MUST perform Step B (specs), Step C (action plan), and Step D (req plan) in order.
2.  **SILENT EXECUTION**: You are a headless agent. Do NOT output text. ONLY use tools.
3.  **NO "PLANNING" MESSAGES**: Do not say "I will now create...". Just CALL THE TOOL.
4.  **COMPREHENSIVE SPECS**: The .specs file is the source of truth for the coder agent. It must be detailed.
5.  **HIGH-LEVEL ACTION PLAN**: The action plan guides the workflow. Keep it feature-focused.
6.  **MANDATORY FINAL STEP**: The process is NOT complete until \`attempt_completion\` is called.

## INTERNAL CHECKLIST (DO NOT OUTPUT)

Before calling \`codebolt--requirement_plan_review\`, verify:
- [ ] Did I create the .specs file? (Step B)
- [ ] Did I create the Action Plan? (Step C)
- [ ] Did I add tasks to the Action Plan? (Step C)
- [ ] Did I create the Requirement Plan? (Step D)
- [ ] Did I link the specs and action plan in the Requirement Plan? (Step D)

**REMEMBER: A -> B -> C -> D -> E -> F. No shortcuts.**
`;

// ================================
// SPEC GENERATOR (copied from create-detail-action-plan action-block)
// ================================

/**
 * Runs the spec generation agent loop directly (no action-block).
 * Takes a detail plan and user message, creates specs, action plan, and requirement plan.
 */
export async function runSpecGenerator(reqMessage: FlatUserMessage, detailPlan: any): Promise<SpecProcessorResult> {
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
            new ToolInjectionModifier({ includeToolDescriptions: true }),
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

        if (completed) {
            let parsedResult: any;
            try {
                const parsed = JSON.parse(finalMessage);
                parsedResult = parsed?.result;
            } catch (error) {
                // LLM returned plain text instead of JSON — ask it to retry with proper JSON
                codebolt.chat.sendMessage(`Spec generator returned a text response instead of structured JSON. Retrying...`);
                console.error("Failed to parse completion result:", error);
                parsedResult = null;
            }

            if (parsedResult?.status == 'success' && parsedResult?.requirementPlanPath) {
                return {
                    success: true,
                    requirementPlanPath: parsedResult.requirementPlanPath,
                    specs_path: parsedResult.specs_path,
                    action_plan: parsedResult.action_plan,
                };
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

    return {
        success: false,
        error: 'Spec generation did not complete successfully',
    };
}
