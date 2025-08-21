import { Tool } from '../types/interfaces';

export abstract class BaseTool implements Tool {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly parameters: Record<string, any>
    ) {}

    abstract execute(params: any, abortSignal?: AbortSignal): Promise<any>;

    protected checkAbortSignal(abortSignal?: AbortSignal): void {
        if (abortSignal?.aborted) {
            throw new Error('Operation was aborted');
        }
    }

    protected validateParameters(params: any): boolean {
        // Basic validation - can be overridden by subclasses
        return params && typeof params === 'object';
    }
}
