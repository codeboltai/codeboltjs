import { BaseExecutor } from '../../base/BaseExecutor.js';
import type { ClaudeExecutorOptions } from './types.js';

/**
 * Executor for Claude Code CLI.
 *
 * Spawns `claude` with `--print --output-format stream-json --verbose`
 * and yields raw stdout lines for the formatter to parse.
 */
export class ClaudeExecutor extends BaseExecutor {
    private readonly claudeOptions: ClaudeExecutorOptions;

    constructor(options: ClaudeExecutorOptions) {
        super(options);
        this.claudeOptions = options;
    }

    protected resolveCommand(): string {
        if (this.options.command) {
            return this.options.command;
        }
        return this.resolveCommandPath('claude', [
            '/usr/local/bin/claude',
            `${process.env['HOME']}/.npm-global/bin/claude`,
            `${process.env['HOME']}/.local/bin/claude`,
        ]);
    }

    protected buildArgs(prompt: string): string[] {
        const args: string[] = [
            '--print',
            '--output-format', 'stream-json',
            '--verbose',
        ];

        const mode = this.claudeOptions.permissionMode || 'bypassPermissions';
        args.push('--permission-mode', mode);

        if (mode === 'bypassPermissions' || this.claudeOptions.dangerouslySkipPermissions) {
            args.push('--dangerously-skip-permissions');
        }

        if (this.claudeOptions.model) {
            args.push('--model', this.claudeOptions.model);
        }

        if (this.claudeOptions.maxTurns) {
            args.push('--max-turns', String(this.claudeOptions.maxTurns));
        }

        // Resume session
        if (this._sessionId) {
            args.push('--resume', this._sessionId);
        }

        // Add the prompt
        args.push(prompt);

        return args;
    }
}
