import { UserMessage } from "./usermessage";

/**
 * Interface for MCP (Model Context Protocol) tool structure
 */
interface MCPTool {
    /** Name of the MCP */
    name?: string;
    /** Toolbox name */
    toolbox?: string;
    /** Tool name */
    toolName?: string;
    /** Available tools */
    tools?: any[];
}

/**
 * Interface for Agent structure
 */
interface Agent {
    /** Agent name */
    name?: string;
    /** Agent ID */
    id?: string | number;
    /** Agent description */
    description?: string;
    /** Agent title */
    title?: string;
    /** Agent identifier string */
    agent_id?: string;
    /** Unique identifier for the agent */
    unique_id?: string;
    /** Detailed description of the agent and its capabilities */
    longDescription?: string;
}

/**
 * Interface for initial user message structure
 */
interface InitialUserMessage {
    /** The message text */
    messageText?: string;
    /** The actual text content of the user message */
    userMessage?: string;
    /** List of mentioned MCPs */
    mentionedMCPs?: MCPTool[];
    /** List of mentioned agents */
    mentionedAgents?: Agent[];
}

/**
 * PromptBuilder class for constructing prompts using a fluent interface.
 * Allows chaining methods to build complex prompts from user messages.
 */
class PromptBuilder {
    /** The main message text */
    private message: string;
    /** List of mentioned MCP tools */
    private mentionedMCPs: MCPTool[];
    /** List of mentioned agents */
    private mentionedAgents: Agent[];
    /** Array of prompt parts that will be joined */
    private promptParts: string[];

    /**
     * Creates a new PromptBuilder instance.
     * 
     * @param userMessage - The initial user message containing text and mentioned entities
     */
    constructor(userMessage: InitialUserMessage) {
        this.message = userMessage.messageText || userMessage.userMessage || "";
        this.mentionedMCPs = userMessage.mentionedMCPs || [];
        this.mentionedAgents = userMessage.mentionedAgents || [];
        this.promptParts = [this.message];
    }

    /**
     * Adds MCP tools information to the prompt.
     * Only adds content if there are mentioned MCPs.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    addMCPTools(): this {
        if (this.mentionedMCPs.length > 0) {
            const mcpTools = this.mentionedMCPs.map(mcp => {
                const name = mcp.name || mcp.toolbox || "Unknown";
                const toolName = mcp.toolName || "";
                const tools = mcp.tools ? JSON.stringify(mcp.tools) : "[]";
                
                let mcpInfo = `MCP: ${name}`;
                if (toolName) {
                    mcpInfo += `, Tool: ${toolName}`;
                }
                mcpInfo += `, Tools: ${tools}`;
                
                return mcpInfo;
            }).join("\n");
            
            this.promptParts.push(`[MCP Tools]\n${mcpTools}`);
        }
        return this;
    }

    /**
     * Adds agent information to the prompt.
     * Only adds content if there are mentioned agents.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    addAgents(): this {
        if (this.mentionedAgents.length > 0) {
            const agentList = this.mentionedAgents.map(agent => {
                const identifier = agent.name || agent.title || agent.id || agent.agent_id || "Unknown";
                let agentInfo = `Agent: ${identifier}`;
                
                if (agent.description) {
                    agentInfo += ` - ${agent.description}`;
                }
                
                return agentInfo;
            }).join("\n");
            
            this.promptParts.push(`[Agents]\n${agentList}`);
        }
        return this;
    }

    /**
     * Adds a custom text section to the prompt.
     * 
     * @param title - Optional title for the section
     * @param content - The content to add
     * @returns The PromptBuilder instance for chaining
     */
    addCustomSection(title: string, content: string): this {
        if (content.trim()) {
            const section = title ? `[${title}]\n${content}` : content;
            this.promptParts.push(section);
        }
        return this;
    }

    /**
     * Adds a system instruction to the prompt.
     * 
     * @param instruction - The system instruction to add
     * @returns The PromptBuilder instance for chaining
     */
    addSystemInstruction(instruction: string): this {
        if (instruction.trim()) {
            this.promptParts.push(`[System Instruction]\n${instruction}`);
        }
        return this;
    }

    /**
     * Adds context information to the prompt.
     * 
     * @param context - The context information to add
     * @returns The PromptBuilder instance for chaining
     */
    addContext(context: string): this {
        if (context.trim()) {
            this.promptParts.push(`[Context]\n${context}`);
        }
        return this;
    }

    /**
     * Builds and returns the final prompt string.
     * Joins all prompt parts with double newlines.
     * 
     * @returns The complete prompt string
     */
    build(): string {
        return this.promptParts.join("\n\n");
    }

    /**
     * Gets the current prompt parts without building the final string.
     * Useful for debugging or inspection.
     * 
     * @returns Array of current prompt parts
     */
    getPromptParts(): string[] {
        return [...this.promptParts];
    }

    /**
     * Clears all prompt parts except the initial message.
     * Useful for starting over with the same message.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    reset(): this {
        this.promptParts = [this.message];
        return this;
    }
}

export { PromptBuilder, MCPTool, Agent, InitialUserMessage };
