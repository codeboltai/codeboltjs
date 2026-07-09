import type { z } from "zod";
import type { AgentLocalTool } from "@codebolt/types/agent";
import { parseArtifact } from "../artifacts";

const { createAgent } = require("@codebolt/agent/unified") as typeof import("@codebolt/agent/unified");

export interface SubAgentPhaseOptions<T> {
  phaseName: string;
  instructions: string;
  task: string;
  artifactSchema: z.ZodType<T>;
  tools?: AgentLocalTool[];
  maxTurns?: number;
  /** Include default modifiers/processors (gives the sub-agent platform fs/terminal tools). Default false: artifact phases should stay lean. */
  includeDefaults?: boolean;
}

/**
 * Runs one phase as a fresh-context sub-agent and returns only its parsed
 * artifact. The orchestrator never sees the sub-agent's transcript - this is
 * what keeps lookup noise out of the top-level context.
 *
 * On artifact parse/validation failure the phase is retried once with the
 * validation error appended to the task.
 */
export async function runSubAgentPhase<T>(options: SubAgentPhaseOptions<T>): Promise<T> {
  const jsonInstruction = "\n\nEnd your final message with the artifact as a single fenced ```json code block matching the required schema exactly. No trailing commentary after the block.";

  let task = options.task;
  let lastError = "";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const subAgent = createAgent({
      name: `creation-${options.phaseName}`,
      instructions: options.instructions + jsonInstruction,
      tools: options.tools || [],
      maxTurns: options.maxTurns ?? 12,
      includeDefaultModifiers: options.includeDefaults ?? false,
      includeDefaultProcessors: options.includeDefaults ?? false,
      enableLogging: true,
    });

    const runResult = await subAgent.run(task);
    if (!runResult.success) {
      throw new Error(`${options.phaseName} phase failed: ${runResult.error || "no result"}`);
    }

    const parsed = parseArtifact(options.artifactSchema, runResult.finalMessage || "");
    if (parsed.artifact !== undefined) {
      return parsed.artifact;
    }

    lastError = parsed.error || "unknown artifact error";
    task = `${options.task}\n\nYour previous response did not contain a valid artifact. Error: ${lastError}\nRespond again with ONLY the corrected \`\`\`json artifact block.`;
  }

  throw new Error(`${options.phaseName} phase produced no valid artifact after retry: ${lastError}`);
}
