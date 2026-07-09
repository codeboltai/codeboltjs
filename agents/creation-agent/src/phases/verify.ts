import { z } from "zod";
import { agentPlanSchema, buildResultSchema, type AgentPlan, type BuildResult } from "../artifacts";
import { runSubAgentPhase } from "./subagent";

const { createTool } = require("@codebolt/agent/unified/tools") as typeof import("@codebolt/agent/unified/tools");
const {
  validateAgentManifestTool,
  validateApiUsageTool,
  testRunAgentSandboxTool,
} = require("@codebolt/api-docs-index/tools") as typeof import("@codebolt/api-docs-index/tools");

const verificationReportSchema = z.object({
  passed: z.boolean(),
  manifestValid: z.boolean(),
  apiUsageValid: z.boolean(),
  buildOrTypecheckPassed: z.boolean(),
  planDriftIssues: z.array(z.string()).describe("Ways the implementation deviates from the approved plan. Empty when faithful."),
  otherIssues: z.array(z.string()),
  summary: z.string().describe("Short human-readable verification summary for the user."),
});

const VERIFY_INSTRUCTIONS = `You are the verification phase of the CodeBolt Creation Agent.

Verify a generated agent project against its approved plan:
1. validate_agent_manifest on the project's codeboltagent.yaml.
2. validate_api_usage on the project path (flags unknown codebolt.<module>.<method> usages).
3. test_run_agent_sandbox for typecheck/build (report the blocker honestly if dependencies are missing).
4. Drift check: read src/index.ts and compare against the plan's mermaidFlow and capabilities. Does the code actually implement the promised flow? List every deviation in planDriftIssues.

Report results faithfully - a failed check with a clear reason is more useful than an optimistic pass.`;

export const verifyAgentTool = createTool({
  id: "verify_agent",
  description: "Phase 4: verify a generated agent - manifest validation, API-usage validation, typecheck/build, and a drift check of the code against the approved plan. Requires the BuildResult from write_agent_code and the plan.",
  inputSchema: z.object({
    buildResult: buildResultSchema,
    plan: agentPlanSchema,
  }),
  execute: async ({ input }: { input: { buildResult: BuildResult; plan: AgentPlan } }) => {
    return runSubAgentPhase({
      phaseName: "verify",
      instructions: VERIFY_INSTRUCTIONS,
      task: [
        `<approved_plan>\n${JSON.stringify(input.plan, null, 2)}\n</approved_plan>`,
        `<build_result>\n${JSON.stringify(input.buildResult, null, 2)}\n</build_result>`,
        `Verify the agent project at: ${input.buildResult.projectPath}`,
      ].join("\n\n"),
      artifactSchema: verificationReportSchema,
      tools: [validateAgentManifestTool, validateApiUsageTool, testRunAgentSandboxTool],
      maxTurns: 12,
      includeDefaults: true,
    });
  },
});
