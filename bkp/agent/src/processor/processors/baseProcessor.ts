import { Processor, ProcessorInput, ProcessorOutput } from '../types/interfaces';

export abstract class BaseProcessor implements Processor {
    protected context: Record<string, any> = {};

    constructor(options?: Record<string, any>) {
        if (options) {
            this.context = { ...options };
        }
    }

    abstract processInput(input: ProcessorInput): Promise<ProcessorOutput[]>;

    setContext(key: string, value: any): void {
        this.context[key] = value;
    }

    getContext(key: string): any {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }

    // Helper method to create events
    protected createEvent(type: string, value?: any): ProcessorOutput {
        return { type, value };
    }

    // Helper method to create multiple events
    protected createEvents(...events: Array<{ type: string; value?: any }>): ProcessorOutput[] {
        return events.map(event => this.createEvent(event.type, event.value));
    }
}
