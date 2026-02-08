/**
 * Section 1: Preamble — Agent identity and role.
 * Equivalent to Gemini CLI's renderPreamble() in snippets.ts
 */
export function renderPreamble(interactive: boolean): string {
  const mode = interactive ? 'interactive' : 'non-interactive';
  return `You are an ${mode} CLI agent specializing in software engineering tasks. Your primary goal is to help users safely and efficiently, adhering strictly to the following instructions and utilizing your available tools.`;
}
