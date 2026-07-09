import { z } from "zod";
import { inspectionSchema } from "../artifacts";
import { runSubAgentPhase } from "./subagent";

const { createTool } = require("@codebolt/agent/unified/tools") as typeof import("@codebolt/agent/unified/tools");

const INSPECT_INSTRUCTIONS = `You are the inspection phase of the CodeBolt Creation Agent.

Read an existing CodeBolt agent project and summarize how it works so the planning phase can modify it safely. Read codeboltagent.yaml and every file under src/ with the file tools. Report:
- agentType: "llm-loop" if it uses createAgent/CodeboltAgent from @codebolt/agent; "procedural" if it is direct codebolt.onMessage SDK calls; "unknown" otherwise.
- modulesUsed: every codebolt.<module> referenced in the source.
- summary: entry point, runtime flow, notable patterns (processors, local tools, event handling).
- issues: anything broken or odd you noticed. Do not fix anything - inspection is read-only.`;

export const inspectAgentTool = createTool({
  id: "inspect_agent",
  description: "Reads an existing CodeBolt agent project (yaml + source) and returns a structured summary of how it works. Always call this first when the user asks to update or modify an existing agent.",
  inputSchema: z.object({
    projectPath: z.string().describe("Path to the existing agent project (absolute, or relative to the workspace root)."),
  }),
  execute: async ({ input }: { input: { projectPath: string } }) => {
    return runSubAgentPhase({
      phaseName: "inspect",
      instructions: INSPECT_INSTRUCTIONS,
      task: `Inspect the CodeBolt agent project at: ${input.projectPath}`,
      artifactSchema: inspectionSchema,
      maxTurns: 10,
      includeDefaults: true,
    });
  },
});
