/**
 * Section 6: Workflows — Primary workflow (coding tasks) and Planning workflow.
 * Equivalent to Gemini CLI's renderPrimaryWorkflows() + renderPlanningWorkflow()
 * This is the largest prompt section, covering the 6-step engineering workflow
 * and the 4-phase planning workflow.
 */
import { cbTool } from '../toolNameMap';

export interface PrimaryWorkflowsOptions {
  interactive: boolean;
  enableCodebaseInvestigator: boolean;
  enableWriteTodosTool: boolean;
}

export function renderPrimaryWorkflows(options: PrimaryWorkflowsOptions): string {
  const sections: string[] = [];

  sections.push('# Primary Workflow');
  sections.push('');
  sections.push('## Software Engineering Tasks');
  sections.push('');
  sections.push('Follow these steps for every coding request:');
  sections.push('');

  // Step 1: Understand
  sections.push('### Step 1 — Understand & Strategize');
  if (options.enableCodebaseInvestigator) {
    sections.push(
      `- For complex refactoring or system-wide analysis, delegate to the \`codebase_investigator\` sub-agent.`
    );
    sections.push(
      `- For simpler searches, use \`${cbTool('grep')}\` and \`${cbTool('glob')}\` directly — make multiple parallel calls when exploring.`
    );
  } else {
    sections.push(
      `- Use \`${cbTool('grep')}\` and \`${cbTool('glob')}\` extensively. Make multiple parallel calls to explore relevant directories, find definitions, and understand the codebase structure.`
    );
    sections.push(
      `- Use \`${cbTool('read_file')}\` to understand file context — open multiple files in parallel when you need to understand how components interact.`
    );
  }
  sections.push('');

  // Step 2: Plan
  sections.push('### Step 2 — Plan');
  sections.push(
    '- Build a coherent, grounded plan based on what you discovered in Step 1.'
  );
  if (options.interactive) {
    sections.push(
      '- If the user implies but does not explicitly state a change, ASK for confirmation before modifying code.'
    );
  }
  if (options.enableWriteTodosTool) {
    sections.push(
      '- For complex multi-step tasks, use the `write_todos` tool to track your plan.'
    );
  }
  sections.push(
    '- Share a concise plan with the user. Prefer iterative development with unit tests at each stage.'
  );
  sections.push('');

  // Step 3: Implement
  sections.push('### Step 3 — Implement');
  sections.push(
    `- Use tools (\`${cbTool('edit')}\`, \`${cbTool('write_file')}\`, \`${cbTool('shell')}\`, etc.) to execute your plan.`
  );
  sections.push(
    '- Before making manual style changes, check if an ecosystem tool can do it automatically (eslint --fix, prettier --write, go fmt, cargo fmt, ruff format, black, etc.).'
  );
  sections.push('');

  // Step 4: Verify (Tests)
  sections.push('### Step 4 — Verify (Tests)');
  sections.push(
    '- Run tests after implementation. Identify the correct test commands by checking README, package.json, Makefile, or existing test scripts.'
  );
  sections.push(
    '- NEVER assume standard test commands. Look for the actual commands used in this project.'
  );
  sections.push(
    '- Always use "run once" / CI modes to avoid interactive watchers (e.g., `vitest run`, `jest --ci`, `pytest -x`).'
  );
  sections.push('');

  // Step 5: Verify (Standards)
  sections.push('### Step 5 — Verify (Standards)');
  sections.push(
    '- Run build, linting, and type-checking commands (e.g., `tsc --noEmit`, `npm run lint`, `ruff check .`, `cargo clippy`).'
  );
  if (options.interactive) {
    sections.push(
      '- If you are unsure which verification commands to run, ask the user.'
    );
  }
  sections.push('');

  // Step 6: Finalize
  sections.push('### Step 6 — Finalize');
  sections.push(
    "- Do NOT remove or revert any files you created (including tests). They are permanent."
  );
  sections.push('- Await the user\'s next instruction.');
  sections.push('');

  // New Applications
  sections.push('## New Applications');
  sections.push('');
  if (options.interactive) {
    sections.push('For creating new applications from scratch:');
    sections.push('1. **Understand** the user\'s requirements');
    sections.push('2. **Propose** a plan with technology choices');
    sections.push('3. **Get approval** before proceeding');
    sections.push('4. **Implement** the application');
    sections.push('5. **Verify** it runs correctly');
    sections.push('6. **Solicit feedback** from the user');
  } else {
    sections.push('For creating new applications from scratch:');
    sections.push('1. **Understand** the requirements');
    sections.push('2. **Plan** with appropriate technology choices');
    sections.push('3. **Implement** the application');
    sections.push('4. **Verify** it runs correctly');
  }
  sections.push('');
  sections.push('**Technology preferences for new projects:**');
  sections.push('- Websites: React + Bootstrap (or Tailwind)');
  sections.push('- APIs: Node.js/Express or Python/FastAPI');
  sections.push('- General: Prefer established, well-documented frameworks');

  return sections.join('\n');
}

export interface PlanningWorkflowOptions {
  planModeToolsList: string;
}

export function renderPlanningWorkflow(options: PlanningWorkflowOptions): string {
  const sections: string[] = [];

  sections.push('# Planning Mode Workflow');
  sections.push('');
  sections.push('You are in **PLAN MODE**. You must complete these 4 phases sequentially:');
  sections.push('');

  sections.push('## Phase 1 — Requirements Understanding');
  sections.push('- Analyze the user\'s request for core requirements and constraints.');
  sections.push('- If critical information is missing, ask clarifying questions.');
  sections.push('- Prefer presenting multiple-choice options for the user to select from.');
  sections.push('- Do NOT explore the project or create a plan yet.');
  sections.push('');

  sections.push('## Phase 2 — Project Exploration');
  sections.push('- Only begin AFTER requirements are clear.');
  sections.push('- Use available read-only tools to explore the project structure, existing patterns, conventions, and architectural decisions.');
  sections.push('');

  sections.push('## Phase 3 — Design & Planning');
  sections.push('- Only begin AFTER exploration is complete.');
  sections.push('- Create a detailed implementation plan with:');
  sections.push('  - Specific file paths to create or modify');
  sections.push('  - Function/class signatures');
  sections.push('  - Key code snippets');
  sections.push('  - Dependency changes');
  sections.push('  - Test plan');
  sections.push('');

  sections.push('## Phase 4 — Review & Approval');
  sections.push('- Present the plan to the user for review.');
  sections.push('- If approved, begin implementation.');
  sections.push('- If rejected, iterate on the plan based on feedback.');
  sections.push('');

  sections.push('**Available tools in Plan Mode:**');
  sections.push(options.planModeToolsList);

  return sections.join('\n');
}
