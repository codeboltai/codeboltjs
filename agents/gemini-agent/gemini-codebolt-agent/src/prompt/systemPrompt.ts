/**
 * System Prompt Builder — Composes all 10+ sections into the full Gemini-style prompt.
 * Equivalent to Gemini CLI's PromptProvider + snippets.getCoreSystemPrompt()
 *
 * Sections concatenated in order:
 *  1. Preamble (agent identity)
 *  2. Core Mandates (behavioral rules)
 *  3. Primary Workflows OR Planning Workflow (conditional)
 *  4. Operational Guidelines (tone, security, tool usage)
 *  5. Sandbox (environment context)
 *  6. Git Repo (git guidelines)
 *  7. Final Reminder (closing instructions)
 */
import { renderPreamble } from './sections/preamble';
import { renderCoreMandates, type CoreMandatesOptions } from './sections/coreMandates';
import {
  renderPrimaryWorkflows,
  renderPlanningWorkflow,
  type PrimaryWorkflowsOptions,
  type PlanningWorkflowOptions,
} from './sections/workflows';
import { renderOperationalGuidelines, type OperationalGuidelinesOptions } from './sections/guidelines';
import { renderGitRepo } from './sections/gitRepo';
import { renderSandbox, type SandboxMode } from './sections/sandbox';
import { renderFinalReminder } from './sections/finalReminder';

export interface GeminiPromptOptions {
  interactive: boolean;
  hasSkills: boolean;
  explainBeforeActing: boolean;
  enableCodebaseInvestigator: boolean;
  enableWriteTodosTool: boolean;
  enableShellEfficiency: boolean;
  sandbox: SandboxMode;
  isGitRepo: boolean;
  isPlanMode: boolean;
  planModeToolsList?: string;
}

export function buildGeminiSystemPrompt(options: GeminiPromptOptions): string {
  const sections: string[] = [];

  // 1. Preamble
  sections.push(renderPreamble(options.interactive));

  // 2. Core Mandates
  const mandateOpts: CoreMandatesOptions = {
    interactive: options.interactive,
    hasSkills: options.hasSkills,
    explainBeforeActing: options.explainBeforeActing,
  };
  sections.push(renderCoreMandates(mandateOpts));

  // 3. Workflows (conditional: primary vs. planning)
  if (options.isPlanMode && options.planModeToolsList) {
    const planOpts: PlanningWorkflowOptions = {
      planModeToolsList: options.planModeToolsList,
    };
    sections.push(renderPlanningWorkflow(planOpts));
  } else {
    const workflowOpts: PrimaryWorkflowsOptions = {
      interactive: options.interactive,
      enableCodebaseInvestigator: options.enableCodebaseInvestigator,
      enableWriteTodosTool: options.enableWriteTodosTool,
    };
    sections.push(renderPrimaryWorkflows(workflowOpts));
  }

  // 4. Operational Guidelines
  const guideOpts: OperationalGuidelinesOptions = {
    interactive: options.interactive,
    enableShellEfficiency: options.enableShellEfficiency,
  };
  sections.push(renderOperationalGuidelines(guideOpts));

  // 5. Sandbox
  sections.push(renderSandbox(options.sandbox));

  // 6. Git Repo
  if (options.isGitRepo) {
    sections.push(renderGitRepo(options.interactive));
  }

  // 7. Final Reminder
  sections.push(renderFinalReminder());

  // Join, collapse triple+ newlines, trim
  return sections
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
