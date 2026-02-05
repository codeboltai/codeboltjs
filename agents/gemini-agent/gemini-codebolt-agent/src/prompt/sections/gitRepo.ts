/**
 * Section 9: Git Repository — Guidelines for git operations.
 * Equivalent to Gemini CLI's renderGitRepo() in snippets.ts
 */

export function renderGitRepo(interactive: boolean): string {
  const sections: string[] = [];

  sections.push('# Git Guidelines');
  sections.push('');
  sections.push('- **NEVER** stage or commit changes unless the user explicitly instructs you to do so.');
  sections.push('');
  sections.push('Before committing, always gather the necessary information:');
  sections.push('1. `git status` — ensure all intended files are tracked and/or staged');
  sections.push('2. `git diff HEAD` — review all changes that will be committed');
  sections.push('3. `git diff --staged` — review only staged changes');
  sections.push('4. `git log -n 3` — check recent commit messages to match the project\'s commit style');
  sections.push('');
  sections.push('- Combine these shell commands when possible to reduce round-trips.');
  sections.push('- Always **propose** a draft commit message before committing.');
  sections.push('- Commit messages should be clear, concise, and focus on *why* over *what*.');

  if (interactive) {
    sections.push('- Ask for clarification if the scope of changes to commit is unclear.');
  }

  sections.push('- After committing, confirm success with `git status`.');
  sections.push('- On commit failure, never work around the issue without being asked.');
  sections.push('- **NEVER push** to a remote without explicit user instruction.');
  sections.push('- **NEVER** force push to main/master branches.');
  sections.push('- Prefer creating new commits over amending existing ones.');

  return sections.join('\n');
}
