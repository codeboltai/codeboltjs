/**
 * Interface representing an agent that can be referenced in user messages.
 */
interface agent {
    /** Short description of the agent */
    description: string;
    /** Title/name of the agent */
    title: string;
    /** Numeric ID of the agent */
    id: number;
    /** Agent identifier string */
    agent_id: string;
    /** Unique identifier for the agent */
    unique_id: string;
    /** Detailed description of the agent and its capabilities */
    longDescription: string;
}
/**
 * Interface for the user message structure.
 */
interface Message {
    /** The actual text content of the user message */
    userMessage: string;
    /** Optional list of files mentioned in the message */
    mentionedFiles?: string[];
    /** List of MCP (Model Context Protocol) tools mentioned */
    mentionedMCPs: string[];
    /** List of agents mentioned in the message */
    mentionedAgents: agent[];
}
/**
 * Interface for a single content block within a user message.
 */
export interface UserMessageContent {
    /** Type of content (e.g., "text", "image") */
    type: string;
    /** The text content */
    text: string;
}
/**
 * Class that processes and manages user messages.
 * Handles converting messages to prompts and extracting mentioned entities.
 */
declare class UserMessage {
    /** The message content and metadata */
    message: Message;
    /** Whether to override the default prompt generation */
    promptOverride: boolean;
    /** Array of content blocks for the user message */
    userMessages: UserMessageContent[];
    /** List of MCP tools mentioned in the message */
    mentionedMCPs: string[];
    /**
     * Creates a new UserMessage instance.
     *
     * @param message - The message content and metadata
     * @param promptOverride - Whether to override default prompt generation
     */
    constructor(message: Message, promptOverride?: boolean);
    /**
     * Gets files mentioned in the message.
     * Currently a placeholder for implementation.
     */
    getFiles(): void;
    /**
     * Converts the user message to a prompt format.
     *
     * @param bAttachFiles - Whether to attach file contents
     * @param bAttachImages - Whether to attach images
     * @param bAttachEnvironment - Whether to attach environment details
     * @returns Promise with an array of content blocks for the prompt
     */
    toPrompt(bAttachFiles?: boolean, bAttachImages?: boolean, bAttachEnvironment?: boolean): Promise<UserMessageContent[]>;
    /**
     * Gets agents mentioned in the message.
     *
     * @returns Array of agent objects
     */
    getMentionedAgents(): agent[];
    /**
     * Gets MCP tools mentioned in the message.
     *
     * @returns Array of MCP tool names
     */
    getMentionedMcps(): string[];
    /**
     * Gets MCP tools in a format suitable for the LLM.
     *
     * @returns Promise with an array of MCP tools
     */
    getMentionedMcpsTools(): Promise<any>;
    /**
     * Gets environment details for the current working directory.
     *
     * @param cwd - The current working directory path
     * @returns Promise with a string containing environment details
     */
    private getEnvironmentDetail;
}
export { UserMessage };
