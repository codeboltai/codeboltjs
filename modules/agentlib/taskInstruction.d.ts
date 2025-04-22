import { UserMessage, UserMessageContent } from "./usermessage";
/**
 * Interface for tools that can be used within tasks.
 * Each tool has a description and usage example.
 */
interface Tools {
    [key: string]: {
        /** Description of what the tool does */
        description: string;
        /** How to use the tool correctly */
        usage: string;
        /** Optional example demonstrating tool usage */
        example?: string;
    };
}
/**
 * Interface for user message structure.
 * Contains message type and text content.
 */
interface UserMessages {
    /** The type of user message */
    type: string;
    /** The text content of the message */
    text: string;
}
/**
 * Class representing a task instruction.
 * Handles loading task data and converting it to prompts.
 */
declare class TaskInstruction {
    /** Available tools for the task */
    tools: Tools;
    /** Messages from the user for this task */
    userMessages: UserMessageContent[];
    /** The user message object containing input */
    userMessage: UserMessage;
    /** Path to the YAML file with task instructions */
    filepath: string;
    /** The section reference within the YAML file */
    refsection: string;
    /**
     * Creates a new TaskInstruction instance.
     *
     * @param tools - Tools available for this task
     * @param userMessage - User message containing task instructions
     * @param filepath - Path to the YAML file with task data
     * @param refsection - Section name within the YAML file
     */
    constructor(tools: Tools | undefined, userMessage: UserMessage, filepath?: string, refsection?: string);
    /**
     * Converts the task instruction to a prompt format.
     * Loads data from YAML file and combines with user message.
     *
     * @returns Promise with an array of user message content blocks
     * @throws Error if there's an issue processing the task instruction
     */
    toPrompt(): Promise<UserMessages[]>;
}
export { TaskInstruction };
