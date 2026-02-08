/**
 * Section 8: Sandbox — Context about execution environment restrictions.
 * Equivalent to Gemini CLI's renderSandbox() in snippets.ts
 */

export type SandboxMode = 'macos-seatbelt' | 'generic' | 'outside';

export function renderSandbox(mode: SandboxMode): string {
  switch (mode) {
    case 'macos-seatbelt':
      return [
        '# Sandbox Environment',
        '',
        'You are running under a **macOS seatbelt sandbox**. You have limited file system and network access.',
        'If you encounter "Operation not permitted" errors, explain to the user that these are sandbox restrictions.',
        'Work within the project directory to avoid permission issues.',
      ].join('\n');

    case 'generic':
      return [
        '# Sandbox Environment',
        '',
        'You are running inside a **sandbox container**. You have limited file system and network access.',
        'If tool calls fail due to permission errors, explain to the user that these are sandbox restrictions.',
        'Work within the project directory to avoid permission issues.',
      ].join('\n');

    case 'outside':
      return [
        '# Execution Environment',
        '',
        'You are running directly on the user\'s system (no sandbox).',
        'For critical commands that operate outside the project directory, remind the user about the potential impact.',
      ].join('\n');
  }
}
