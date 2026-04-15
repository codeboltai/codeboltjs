import { BaseExecutor } from '../../base/BaseExecutor.js';
import type { CodexExecutorOptions } from './types.js';

/**
 * Executor for OpenAI Codex CLI.
 *
 * Uses `codex exec --json` for non-interactive JSONL output and passes
 * the prompt via stdin. This avoids the TUI requirement that causes
 * Codex to refuse startup when TERM=dumb or when no TTY is available.
 */
export class CodexExecutor extends BaseExecutor {
    private readonly codexOptions: CodexExecutorOptions;

    constructor(options: CodexExecutorOptions) {
        // Override TERM to avoid "Refusing to start the interactive TUI" errors.
        // The `exec` subcommand is non-interactive, but some Codex versions
        // still check the TERM env var during startup.
        super({
            ...options,
            env: {
                TERM: 'xterm-256color',
                ...options.env,
            },
        });
        this.codexOptions = options;
    }

    protected resolveCommand(): string {
        if (this.options.command) {
            return this.options.command;
        }
        return this.resolveCommandPath('codex', [
            '/usr/local/bin/codex',
            `${process.env['HOME']}/.npm-global/bin/codex`,
            `${process.env['HOME']}/.local/bin/codex`,
        ]);
    }

    protected buildArgs(_prompt: string): string[] {
        // Use the `exec` subcommand for non-interactive JSONL output.
        // When resuming, the correct syntax is: codex exec resume --json <SESSION_ID> -
        // For a new session: codex exec --json -
        const args: string[] = ['exec'];

        if (this._sessionId) {
            // Resume is a sub-subcommand under exec: "codex exec resume ..."
            args.push('resume', this._sessionId);
        }

        // --json must come after the subcommand path
        args.push('--json');

        if (this.codexOptions.model) {
            args.push('--model', this.codexOptions.model);
        }

        if (this.codexOptions.fullAutoApprove) {
            args.push('--full-auto');
        }

        // Prompt is passed via stdin; use '-' as placeholder
        args.push('-');

        return args;
    }

    protected getStdinInput(prompt: string): string | null {
        return prompt;
    }
}
