import { BaseExecutor } from '../../base/BaseExecutor.js';
import type { CursorExecutorOptions } from './types.js';

/**
 * Executor for Cursor Agent CLI.
 *
 * Spawns `agent` with `-p --output-format stream-json --workspace <cwd> --yolo`
 * and passes the prompt via stdin.
 */
export class CursorExecutor extends BaseExecutor {
    private readonly cursorOptions: CursorExecutorOptions;

    constructor(options: CursorExecutorOptions) {
        super(options);
        this.cursorOptions = options;
    }

    protected resolveCommand(): string {
        if (this.options.command) {
            return this.options.command;
        }
        return this.resolveCommandPath('agent', [
            '/usr/local/bin/agent',
            `${process.env['HOME']}/.npm-global/bin/agent`,
            `${process.env['HOME']}/.local/bin/agent`,
        ]);
    }

    protected buildArgs(_prompt: string): string[] {
        const args: string[] = [
            '-p',
            '--output-format', 'stream-json',
        ];

        // Workspace directory
        const cwd = this.options.cwd || process.cwd();
        args.push('--workspace', cwd);

        if (this.cursorOptions.model) {
            args.push('--model', this.cursorOptions.model);
        }

        if (this.cursorOptions.mode) {
            args.push('--mode', this.cursorOptions.mode);
        }

        // Auto-trust by default
        if (this.cursorOptions.yolo !== false) {
            args.push('--yolo');
        }

        // Resume session
        if (this._sessionId) {
            args.push('--resume', this._sessionId);
        }

        return args;
    }

    protected getStdinInput(prompt: string): string | null {
        return prompt;
    }
}
