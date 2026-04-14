import { BaseExecutor } from '../../base/BaseExecutor.js';
import type { CodexExecutorOptions } from './types.js';

/**
 * Executor for OpenAI Codex CLI.
 *
 * Spawns `codex` with JSONL output and passes the prompt via stdin.
 */
export class CodexExecutor extends BaseExecutor {
    private readonly codexOptions: CodexExecutorOptions;

    constructor(options: CodexExecutorOptions) {
        super(options);
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
        const args: string[] = [];

        if (this.codexOptions.model) {
            args.push('--model', this.codexOptions.model);
        }

        if (this.codexOptions.reasoningEffort) {
            args.push('--reasoning-effort', this.codexOptions.reasoningEffort);
        }

        if (this.codexOptions.fullAutoApprove) {
            args.push('--full-auto');
        }

        // Resume session
        if (this._sessionId) {
            args.push('--resume', this._sessionId);
        }

        // Prompt is passed via stdin; use '-' as placeholder
        args.push('-');

        return args;
    }

    protected getStdinInput(prompt: string): string | null {
        return prompt;
    }
}
