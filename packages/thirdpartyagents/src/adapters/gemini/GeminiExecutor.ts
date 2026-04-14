import { BaseExecutor } from '../../base/BaseExecutor.js';
import type { GeminiExecutorOptions } from './types.js';

/**
 * Executor for Google Gemini CLI.
 *
 * Spawns `gemini` with `--output-format stream-json --approval-mode yolo`
 * and passes the prompt via `--prompt` arg.
 */
export class GeminiExecutor extends BaseExecutor {
    private readonly geminiOptions: GeminiExecutorOptions;

    constructor(options: GeminiExecutorOptions) {
        super(options);
        this.geminiOptions = options;
    }

    protected resolveCommand(): string {
        if (this.options.command) {
            return this.options.command;
        }
        return this.resolveCommandPath('gemini', [
            '/usr/local/bin/gemini',
            `${process.env['HOME']}/.npm-global/bin/gemini`,
            `${process.env['HOME']}/.local/bin/gemini`,
        ]);
    }

    protected buildArgs(prompt: string): string[] {
        const args: string[] = [
            '--output-format', 'stream-json',
            '--approval-mode', 'yolo',
        ];

        if (this.geminiOptions.model) {
            args.push('--model', this.geminiOptions.model);
        }

        if (this.geminiOptions.sandbox === false) {
            args.push('--sandbox=none');
        } else if (this.geminiOptions.sandbox === true) {
            args.push('--sandbox');
        }

        // Resume session
        if (this._sessionId) {
            args.push('--resume', this._sessionId);
        }

        // Prompt passed as arg
        args.push('--prompt', prompt);

        return args;
    }
}
