import { BaseExecutor } from '../../base/BaseExecutor.js';
import type { OpenCodeExecutorOptions } from './types.js';

/**
 * Executor for OpenCode CLI.
 *
 * Spawns `opencode run --format json` and passes the prompt via stdin.
 */
export class OpenCodeExecutor extends BaseExecutor {
    private readonly opencodeOptions: OpenCodeExecutorOptions;

    constructor(options: OpenCodeExecutorOptions) {
        super(options);
        this.opencodeOptions = options;
    }

    protected resolveCommand(): string {
        if (this.options.command) {
            return this.options.command;
        }
        return this.resolveCommandPath('opencode', [
            '/usr/local/bin/opencode',
            `${process.env['HOME']}/.npm-global/bin/opencode`,
            `${process.env['HOME']}/.local/bin/opencode`,
        ]);
    }

    protected buildArgs(_prompt: string): string[] {
        const args: string[] = ['run', '--format', 'json'];

        if (this.opencodeOptions.model) {
            args.push('--model', this.opencodeOptions.model);
        }

        if (this.opencodeOptions.variant) {
            args.push('--variant', this.opencodeOptions.variant);
        }

        // Resume session
        if (this._sessionId) {
            args.push('--session', this._sessionId);
        }

        return args;
    }

    protected getStdinInput(prompt: string): string | null {
        return prompt;
    }
}
