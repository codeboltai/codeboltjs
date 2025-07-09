import { UserMessage } from "./usermessage";
import { SystemPrompt } from "./systemprompt";
import { TaskInstruction } from "./taskInstruction";
import { UserMessage as CLIUserMessage } from "../types/socketMessageTypes";
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

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
    /** List of mentioned files */
    mentionedFiles?: string[];
    /** List of mentioned MCPs */
    mentionedMCPs?: MCPTool[];
    /** List of mentioned agents */
    mentionedAgents?: Agent[];
}

/**
 * Interface for OpenAI message format
 */
interface OpenAIMessage {
    /** Role of the message sender */
    role: 'system' | 'user' | 'assistant' | 'tool';
    /** Content of the message */
    content: string | Array<{ type: string; text: string }>;
    /** Tool call ID for tool messages */
    tool_call_id?: string;
    /** Tool calls for assistant messages */
    tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
            name: string;
            arguments: string;
        };
    }>;
}

/**
 * Interface for OpenAI tool format
 */
interface OpenAITool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, {
                type: string;
                description: string;
            }>;
            required?: string[];
            additionalProperties?: boolean;
        };
        strict?: boolean;
    };
}

/**
 * Interface for conversation history entry
 */
interface ConversationEntry {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | Array<{ type: string; text: string }>;
    tool_call_id?: string;
    tool_calls?: any[];
}

/**
 * Interface for codebolt API (minimal definition for what we need)
 */
interface CodeboltAPI {
    mcp: {
        listMcpFromServers: (servers: string[]) => Promise<{ data: OpenAITool[] }>;
        getTools: (mcps: MCPTool[]) => Promise<{ data: OpenAITool[] }>;
    };
    fs: {
        readFile: (filepath: string) => Promise<string>;
        listFile: (path: string, recursive: boolean) => Promise<{ success: boolean; result: string }>;
    };
    project: {
        getProjectPath: () => Promise<{ projectPath: string }>;
    };
}

/**
 * PromptBuilder class for constructing prompts using a fluent interface.
 * Allows chaining methods to build complex prompts from user messages.
 */
class PromptBuilder {
    /** The main message text */
    private message: string;
    /** List of mentioned files */
    private mentionedFiles: string[];
    /** List of mentioned MCP tools */
    private mentionedMCPs: MCPTool[];
    /** List of mentioned agents */
    private mentionedAgents: Agent[];
    /** Array of prompt parts that will be joined */
    private promptParts: string[];
    /** System prompt text */
    private systemPromptText: string = "";
    /** Task instruction text */
    private taskInstructionText: string = "";
    /** Available tools */
    private tools: OpenAITool[] = [];
    /** Conversation history */
    private conversationHistory: ConversationEntry[] = [];
    /** Environment details */
    private environmentDetails: string = "";
    /** File contents cache */
    private fileContents: Map<string, string> = new Map();
    /** Codebolt API instance */
    private codebolt?: CodeboltAPI;

    /**
     * Creates a new PromptBuilder instance.
     * 
     * @param userMessage - The initial user message containing text and mentioned entities
     * @param codebolt - Optional codebolt API instance for automatic tool and environment loading
     */
    constructor(userMessage: InitialUserMessage | CLIUserMessage, codebolt?: CodeboltAPI) {
        // Handle both InitialUserMessage and CLIUserMessage types
        if ('content' in userMessage) {
            // This is a CLIUserMessage
            this.message = userMessage.content || userMessage.text || "";
            this.mentionedFiles = [];
            this.mentionedMCPs = [];
            this.mentionedAgents = [];
        } else {
            // This is an InitialUserMessage
            this.message = userMessage.messageText || userMessage.userMessage || "";
            this.mentionedFiles = userMessage.mentionedFiles || [];
            this.mentionedMCPs = userMessage.mentionedMCPs || [];
            this.mentionedAgents = userMessage.mentionedAgents || [];
        }
        
        this.promptParts = [this.message];
        this.codebolt = codebolt;
    }

    /**
     * Sets the codebolt API instance for automatic operations.
     * 
     * @param codebolt - The codebolt API instance
     * @returns The PromptBuilder instance for chaining
     */
    setCodeboltAPI(codebolt: CodeboltAPI): this {
        this.codebolt = codebolt;
        return this;
    }

    /**
     * Automatically loads and adds MCP tools from the mentioned MCPs in the user message.
     * Also loads default codebolt tools.
     * 
     * @param additionalServers - Additional MCP servers to load tools from
     * @returns The PromptBuilder instance for chaining
     */
    async addMCPTools(additionalServers: string[] = ["codebolt"]): Promise<this> {
        if (!this.codebolt) {
            console.warn("Codebolt API not available. Cannot load MCP tools automatically.");
            return this;
        }

        try {
            // Get default tools from specified servers
            const { data: defaultTools } = await this.codebolt.mcp.listMcpFromServers(additionalServers);
            this.tools = [...this.tools, ...defaultTools];

            // Get tools from mentioned MCPs
            if (this.mentionedMCPs && this.mentionedMCPs.length > 0) {
                const { data: mcpTools } = await this.codebolt.mcp.getTools(this.mentionedMCPs);
                this.tools = [...this.tools, ...mcpTools];
            }
        } catch (error) {
            console.error(`Error loading MCP tools: ${error}`);
        }

        return this;
    }

    /**
     * Automatically converts mentioned agents to OpenAI tool format and adds them.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    addAgentTools(): this {
        if (this.mentionedAgents && this.mentionedAgents.length > 0) {
            const agentTools: OpenAITool[] = this.mentionedAgents.map(agent => ({
                type: "function" as const,
                function: {
                    name: `subagent--${agent.unique_id}`,
                    description: agent.longDescription || agent.description || "Agent tool",
                    parameters: {
                        type: "object" as const,
                        properties: {
                            task: {
                                type: "string",
                                description: "The task to be executed by the tool."
                            }
                        },
                        required: ["task"]
                    }
                }
            }));
            
            this.tools = [...this.tools, ...agentTools];
        }
        return this;
    }

    /**
     * Automatically loads file contents for mentioned files and adds environment details.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    async addEnvironmentDetails(): Promise<this> {
        if (!this.codebolt) {
            console.warn("Codebolt API not available. Cannot load environment details automatically.");
            return this;
        }

        try {
            // Load mentioned file contents
            if (this.mentionedFiles && this.mentionedFiles.length > 0) {
                for (const file of this.mentionedFiles) {
                    try {
                        const fileData = await this.codebolt.fs.readFile(file);
                        this.fileContents.set(file, fileData);
                    } catch (error) {
                        console.error(`Error reading file ${file}: ${error}`);
                        this.fileContents.set(file, "[File could not be read]");
                    }
                }
            }

            // Get project path and file listing
            const { projectPath } = await this.codebolt.project.getProjectPath();
            if (projectPath) {
                const { success, result } = await this.codebolt.fs.listFile(projectPath, true);
                if (success) {
                    this.environmentDetails = `\n\n<environment_details>\n\n# Current Working Directory (${projectPath}) Files\n${result}\n</environment_details>`;
                }
            }
        } catch (error) {
            console.error(`Error loading environment details: ${error}`);
        }

        return this;
    }

    /**
     * Convenience method to automatically add all tools and environment details.
     * Equivalent to calling addMCPTools(), addAgentTools(), and addEnvironmentDetails().
     * 
     * @param additionalServers - Additional MCP servers to load tools from
     * @returns The PromptBuilder instance for chaining
     */
    async addAllAutomatic(additionalServers: string[] = ["codebolt"]): Promise<this> {
        await this.addMCPTools(additionalServers);
        this.addAgentTools();
        await this.addEnvironmentDetails();
        return this;
    }

    /**
     * Adds system prompt from a YAML file.
     * 
     * @param filepath - Path to the YAML file containing system prompts
     * @param key - Key identifier for the specific prompt
     * @param exampleFilePath - Optional path to example file to append
     * @returns The PromptBuilder instance for chaining
     */
    addSystemPrompt(filepath: string, key: string, exampleFilePath?: string): this {
        try {
            const systemPrompt = new SystemPrompt(filepath, key);
            this.systemPromptText = systemPrompt.toPromptText();
            
            // Add example file if provided
            if (exampleFilePath) {
                try {
                    const example = fs.readFileSync(path.resolve(exampleFilePath), 'utf8');
                    this.systemPromptText += `\n\n<example_agent>\n\n${example}\n</example_agent>`;
                } catch (error) {
                    console.error(`Error loading example file: ${error}`);
                }
            }
        } catch (error) {
            console.error(`Error loading system prompt: ${error}`);
        }
        return this;
    }

    /**
     * Adds task instruction from a YAML file.
     * 
     * @param filepath - Path to the YAML file containing task instructions
     * @param refsection - Section name within the YAML file
     * @returns The PromptBuilder instance for chaining
     */
    addTaskInstruction(filepath: string, refsection: string): this {
        try {
            const fileContents = fs.readFileSync(path.resolve(filepath), 'utf8');
            const data = yaml.load(fileContents) as any;
            const task = data[refsection];
            
            if (task) {
                this.taskInstructionText = `Task Description: ${task.description}\nExpected Output: ${task.expected_output}`;
            }
        } catch (error) {
            console.error(`Error loading task instruction: ${error}`);
        }
        return this;
    }

    /**
     * Manually adds environment details with file listing.
     * Use addEnvironmentDetails() for automatic loading instead.
     * 
     * @param projectPath - The project path
     * @param fileListResult - The file listing result
     * @returns The PromptBuilder instance for chaining
     */
    setEnvironmentDetails(projectPath: string, fileListResult: string): this {
        if (projectPath && fileListResult) {
            this.environmentDetails = `\n\n<environment_details>\n\n# Current Working Directory (${projectPath}) Files\n${fileListResult}\n</environment_details>`;
        }
        return this;
    }

    /**
     * Adds MCP tools information to the prompt.
     * Only adds content if there are mentioned MCPs.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    addMCPToolsToPrompt(): this {
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
    addAgentsToPrompt(): this {
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
     * Manually sets the available tools for the conversation.
     * Use addMCPTools() and addAgentTools() for automatic loading instead.
     * 
     * @param tools - Array of OpenAI tools
     * @returns The PromptBuilder instance for chaining
     */
    setTools(tools: OpenAITool[]): this {
        this.tools = [...tools];
        return this;
    }

    /**
     * Adds additional tools to the existing tool list.
     * 
     * @param tools - Array of OpenAI tools to add
     * @returns The PromptBuilder instance for chaining
     */
    addTools(tools: OpenAITool[]): this {
        this.tools = [...this.tools, ...tools];
        return this;
    }

    /**
     * Builds the user message content with files and environment details.
     * 
     * @returns Array of content blocks
     */
    private buildUserMessageContent(): Array<{ type: string; text: string }> {
        let finalPrompt = `
                    The user has sent the following query:
                   <user_query> ${this.message} </user_query>.
                `;
        
        // Attach files if mentioned
        if (this.mentionedFiles && this.mentionedFiles.length > 0) {
            finalPrompt += `The Attached files are:`;
            for (const file of this.mentionedFiles) {
                const fileData = this.fileContents.get(file) || "[File content not available]";
                finalPrompt += `File Name: ${file}, File Path: ${file}, Filedata: ${fileData}`;
            }
        }

        // Add environment details
        if (this.environmentDetails) {
            finalPrompt += this.environmentDetails;
        }

        const content: Array<{ type: string; text: string }> = [
            { type: "text", text: finalPrompt }
        ];

        // Add task instruction if available
        if (this.taskInstructionText) {
            content.push({
                type: "text",
                text: this.taskInstructionText
            });
        }

        return content;
    }

    /**
     * Builds the OpenAI conversation format.
     * 
     * @returns Array of OpenAI messages
     */
    buildOpenAIMessages(): OpenAIMessage[] {
        const messages: OpenAIMessage[] = [];

        // Add system message if available
        if (this.systemPromptText) {
            messages.push({
                role: "system",
                content: this.systemPromptText
            });
        }

        // Add user message
        const userContent = this.buildUserMessageContent();
        messages.push({
            role: "user",
            content: userContent
        });

        // Add any existing conversation history
        messages.push(...this.conversationHistory);

        return messages;
    }

    /**
     * Gets the available tools in OpenAI format.
     * 
     * @returns Array of OpenAI tools
     */
    getTools(): OpenAITool[] {
        return this.tools;
    }

    /**
     * Gets the loaded file contents.
     * 
     * @returns Map of file paths to their contents
     */
    getFileContents(): Map<string, string> {
        return new Map(this.fileContents);
    }

    /**
     * Adds a message to the conversation history.
     * 
     * @param role - The role of the message sender
     * @param content - The content of the message
     * @param toolCallId - Optional tool call ID for tool messages
     * @param toolCalls - Optional tool calls for assistant messages
     * @returns The PromptBuilder instance for chaining
     */
    addToConversationHistory(
        role: 'user' | 'assistant' | 'tool',
        content: string | Array<{ type: string; text: string }>,
        toolCallId?: string,
        toolCalls?: any[]
    ): this {
        const message: ConversationEntry = { role, content };
        
        if (toolCallId) {
            message.tool_call_id = toolCallId;
        }
        
        if (toolCalls) {
            message.tool_calls = toolCalls;
        }
        
        this.conversationHistory.push(message);
        return this;
    }

    /**
     * Gets the current conversation history.
     * 
     * @returns Array of conversation entries
     */
    getConversationHistory(): ConversationEntry[] {
        return [...this.conversationHistory];
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
        this.conversationHistory = [];
        this.systemPromptText = "";
        this.taskInstructionText = "";
        this.tools = [];
        this.environmentDetails = "";
        this.fileContents.clear();
        return this;
    }

    /**
     * Creates an LLM inference parameters object in the format expected by the sample code.
     * 
     * @returns Object with messages, tools, and other LLM parameters
     */
    buildInferenceParams() {
        return {
            full: true,
            messages: this.buildOpenAIMessages(),
            tools: this.getTools(),
            tool_choice: "auto" as const,
        };
    }
}

export { 
    PromptBuilder, 
    MCPTool, 
    Agent, 
    InitialUserMessage, 
    OpenAIMessage, 
    OpenAITool, 
    ConversationEntry,
    CodeboltAPI
};
