import { FlatUserMessage } from "../../sdk-types";
import { ProcessedMessage } from "../common";
import { MessageModifier } from "../processorTypes";

/**
 * Unified message processor interface specifically for message modifiers
 * Processes FlatUserMessage through a chain of MessageModifiers and returns OpenAI-formatted messages
 */
export interface InitialPromptGeneratorInterface {
    /** Process and modify input messages */
    processMessage(input: FlatUserMessage): Promise<ProcessedMessage>;
    /** Add a message modifier */
    updateProcessors(processors: MessageModifier[]): void;

    getProcessors(): MessageModifier[];

    /** Set context value */
    setMetaData(key: string, value: unknown): void;
    /** Get context value */
    getMetaData(key: string): unknown;
    /** Clear all context */
    clearMetaData(): void;
}