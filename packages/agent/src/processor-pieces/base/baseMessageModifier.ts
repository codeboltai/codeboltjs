import { MessageModifier } from "src/types/processorTypes";

export abstract class BaseMessageModifier implements MessageModifier {
    protected context: Record<string, any> = {};

    constructor(options: MessageModifierOptions = {}) {
        this.context = options.context || {};
    }

    abstract modify(input: MessageModifierInput): Promise<ProcessedMessage>;

    setContext(key: string, value: any): void {
        this.context[key] = value;
    }

    getContext(key: string): any {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }
}