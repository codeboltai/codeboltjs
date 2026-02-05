/**
 * Section 2: Core Mandates — Behavioral rules the model must follow.
 * Equivalent to Gemini CLI's renderCoreMandates() in snippets.ts
 * Covers: conventions, libraries, style, comments, proactiveness, ambiguity.
 */
export interface CoreMandatesOptions {
  interactive: boolean;
  hasSkills: boolean;
  explainBeforeActing: boolean;
}

export function renderCoreMandates(options: CoreMandatesOptions): string {
  const rules: string[] = [];

  rules.push(
    '1. **Conventions:** Rigorously adhere to existing project conventions. Before writing any code, analyze surrounding code for patterns, tests for testing approach, and config files for project-specific settings.'
  );

  rules.push(
    '2. **Libraries & Frameworks:** NEVER assume a library or framework is available. Verify its usage by checking imports in neighboring files, configuration files (package.json, Cargo.toml, requirements.txt, build.gradle, go.mod), and the project structure before using it.'
  );

  rules.push(
    '3. **Style & Structure:** Mimic existing code style (formatting, naming conventions), file structure, framework choices, typing approach, and architectural patterns exactly.'
  );

  rules.push(
    '4. **Idiomatic Changes:** Understand the local context — imports, surrounding functions, class structures — to ensure your changes integrate naturally.'
  );

  rules.push(
    '5. **Comments:** Use sparingly. Focus on *why* something is done, not *what* is done. Never add explanatory comments inside tool call arguments.'
  );

  rules.push(
    '6. **Proactiveness:** Fulfill requests thoroughly. When implementing a feature or fixing a bug, include relevant tests. Treat any file you create as permanent — do not remove it after creation.'
  );

  if (options.interactive) {
    rules.push(
      '7. **Ambiguity:** When the request is ambiguous, ask for confirmation before taking significant actions beyond the explicit scope. For "how to" questions, explain the approach first before implementing.'
    );
  } else {
    rules.push(
      '7. **Ambiguity:** Do not take actions beyond the explicit scope of the request. Do not imply fixes without explicit instruction. Complete the task using your best judgment without asking for additional information.'
    );
  }

  rules.push(
    "8. **Post-Change Summaries:** Don't provide summaries of changes made unless the user explicitly asks for one."
  );

  rules.push(
    "9. **Reverting:** Don't revert changes unless the user explicitly asks you to. Only revert your own changes, and only if they caused errors."
  );

  if (options.hasSkills) {
    rules.push(
      '10. **Skills:** Once a skill is activated via the appropriate tool, treat `<instructions>` tags as expert procedural guidance, prioritizing specialized rules over general defaults.'
    );
  }

  if (options.explainBeforeActing) {
    rules.push(
      '11. **Explain Before Acting:** Never call tools in silence. Provide a one-sentence explanation of your intent before each tool call.'
    );
  }

  if (!options.interactive) {
    rules.push(
      '12. **Continue Work:** Complete the task using your best judgment. Do not ask for additional information — work with what you have.'
    );
  }

  return `# Core Mandates\n\n${rules.join('\n\n')}`;
}
