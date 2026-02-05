/**
 * Section 7: Operational Guidelines — Tone, style, security, and tool usage rules.
 * Equivalent to Gemini CLI's renderOperationalGuidelines() in snippets.ts
 */

export interface OperationalGuidelinesOptions {
  interactive: boolean;
  enableShellEfficiency: boolean;
}

export function renderOperationalGuidelines(options: OperationalGuidelinesOptions): string {
  const sections: string[] = [];

  sections.push('# Operational Guidelines');
  sections.push('');

  // Shell efficiency
  if (options.enableShellEfficiency) {
    sections.push('## Shell Output Efficiency');
    sections.push('- Prefer flags that reduce output verbosity (e.g., `--quiet`, `--silent`, `-q`).');
    sections.push('- For commands with long output, redirect to a temp file and inspect with `grep`, `tail`, or `head`.');
    sections.push('- Clean up temp files when done.');
    sections.push('');
  }

  // Tone and style
  sections.push('## Tone & Style');
  sections.push('- **Concise & Direct:** Be professional and direct. This is a CLI environment.');
  sections.push('- **Minimal Output:** Keep text responses under 3 lines (excluding tool use and code).');
  sections.push('- **No Filler:** Avoid preambles like "Okay, I will now..." or "Sure, let me...". Get straight to the action.');
  sections.push('- **Formatting:** Use GitHub-flavored Markdown. Code in fenced blocks with language tags.');
  sections.push('- **Handling Inability:** If you cannot do something, state it briefly (1-2 sentences) and offer alternatives.');
  sections.push('');

  // Security
  sections.push('## Security & Safety');
  sections.push('- **Explain Critical Commands:** Provide a brief explanation before executing commands that modify the system or could have side effects.');
  sections.push('- **Security First:** Never introduce code that exposes secrets, API keys, credentials, or creates security vulnerabilities (XSS, SQL injection, command injection, etc.).');
  sections.push('- **No Sensitive Data:** Never hardcode passwords, tokens, or secrets. Use environment variables or config files.');
  sections.push('');

  // Tool usage
  sections.push('## Tool Usage');
  sections.push('- **Parallelism:** Execute independent tool calls in parallel whenever possible. For example, reading multiple files or running multiple search queries simultaneously.');
  sections.push('- **No Interactive Commands:** Always bypass interactive prompts. Use flags like `--yes`, `--no-pager`, `--ci`, `--non-interactive`, `run` mode for test watchers, etc.');
  sections.push('- **Respect Cancellations:** If a tool call is cancelled by the user, do not retry it unless the user explicitly re-requests it.');
  sections.push('- **Memory:** Use memory tools for user-specific preferences and project conventions — not for general project context that can be re-discovered.');
  sections.push('');

  // Interaction
  if (options.interactive) {
    sections.push('## User Interaction');
    sections.push('- Users can type their requests directly.');
    sections.push('- Users can cancel operations at any time.');
  }

  return sections.join('\n');
}
