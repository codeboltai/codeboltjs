export interface MessageModifier {
    modify(input: MessageModifierInput): Promise<ProcessedMessage>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}