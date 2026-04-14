import { BaseExecutor } from '../../base/BaseExecutor.js';
import type { PiExecutorOptions } from './types.js';

/**
 * Executor for Pi AI Agent CLI.
 *
 * Spawns `pi` with `--mode json -p` and passes the prompt as the last arg.
 */
export class PiExecutor extends BaseExecutor {
    private readonly piOptions: PiExecutorOptions;

    constructor(options: PiExecutorOptions) {
        super(options);
        this.piOptions = options;
    }

    protected resolveCommand(): string {
        if (this.options.command) {
            return this.options.command;
        }
        return this.resolveCommandPath('pi', [
            '/usr/local/bin/pi',
            `${process.env['HOME']}/.npm-global/bin/pi`,
            `${process.env['HOME']}/.local/bin/pi`,
        ]);
    }

    protected buildArgs(prompt: string): string[] {
        const args: string[] = [
            '--mode', 'json',
            '-p',
            '--tools', 'read,bash,edit,write,grep,find,ls',
        ];

        // Parse provider/model format
        if (this.piOptions.model) {
            const parts = this.piOptions.model.split('/');
            if (parts.length === 2) {
                args.push('--provider', parts[0]);
                args.push('--model', parts[1]);
            } else {
                args.push('--model', this.piOptions.model);
            }
        }

        if (this.piOptions.thinking) {
            args.push('--thinking', this.piOptions.thinking);
        }

        // Session file path
        if (this._sessionId) {
            args.push('--session', this._sessionId);
        }

        // Prompt as last arg
        args.push(prompt);

        return args;
    }
}
