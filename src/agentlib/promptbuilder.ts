import { UserMessage } from "./usermessage";
import { SystemPrompt } from "./systemprompt";
import { TaskInstruction } from "./taskInstruction";
import { UserMessage as CLIUserMessage } from "../types/socketMessageTypes";
import type {
    OpenAIMessage,
    OpenAITool,
    ConversationEntry,
    UserMessageContent,
    CodeboltAPI,
    ToolResult
} from "../types/libFunctionTypes";
import type {
    MCPTool,
    Agent,
    InitialUserMessage
} from "../types/commonTypes";
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// All interfaces moved to appropriate type files

/**
 * PromptBuilder class for constructing prompts using a fluent interface.
 * Allows chaining methods to build complex prompts from user messages.
 */
class InitialPromptBuilder {
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

    // Flags for what needs to be loaded during build
    private shouldLoadMCPTools: boolean = false;
    private mcpAdditionalServers: string[] = ["codebolt"];
    private shouldLoadAgentTools: boolean = false;
    private shouldLoadEnvironmentDetails: boolean = false;
    private shouldLoadAll: boolean = false;

    /**
     * Creates a new PromptBuilder instance.
     * 
     * @param userMessage - The initial user message containing text and mentioned entities
     * @param codebolt - Optional codebolt API instance for automatic tool and environment loading
     */
    constructor(userMessage: InitialUserMessage | CLIUserMessage, codebolt?: CodeboltAPI) {
        // Handle both InitialUserMessage and CLIUserMessage types
        if ('message' in userMessage && typeof userMessage.message === 'object') {
            // This is a CLIUserMessage with nested message structure
            this.message = userMessage.message.userMessage || userMessage.data?.text.trim() || "";
            this.mentionedFiles = userMessage.message.mentionedFiles || [];
            // Convert string array to MCPTool array for CLIUserMessage
            this.mentionedMCPs = (userMessage.message.mentionedMCPs || []).map((name: string) => ({ name }));
            this.mentionedAgents = userMessage.message.mentionedAgents || [];
        } else {
            // This is an InitialUserMessage
            this.message = (userMessage as InitialUserMessage).messageText || (userMessage as InitialUserMessage).userMessage || "";
            this.mentionedFiles = (userMessage as InitialUserMessage).mentionedFiles || [];
            this.mentionedMCPs = (userMessage as InitialUserMessage).mentionedMCPs || [];
            this.mentionedAgents = (userMessage as InitialUserMessage).mentionedAgents || [];
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
     * Marks MCP tools to be loaded during build from the mentioned MCPs and additional servers.
     * 
     * @param additionalServers - Additional MCP servers to load tools from
     * @returns The PromptBuilder instance for chaining
     */
    addMCPTools(additionalServers: string[] = ["codebolt"]): this {
        this.shouldLoadMCPTools = true;
        this.mcpAdditionalServers = additionalServers;
        return this;
    }

    /**
     * Marks mentioned agents to be converted to OpenAI tool format during build.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    addAgentTools(): this {
        this.shouldLoadAgentTools = true;
        return this;
    }

    /**
     * Marks environment details to be loaded during build.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    addEnvironmentDetails(): this {
        this.shouldLoadEnvironmentDetails = true;
        return this;
    }

    /**
     * Convenience method to mark all tools and environment details to be loaded during build.
     * Equivalent to calling addMCPTools(), addAgentTools(), and addEnvironmentDetails().
     * 
     * @param additionalServers - Additional MCP servers to load tools from
     * @returns The PromptBuilder instance for chaining
     */
    addAllAutomatic(additionalServers: string[] = ["codebolt"]): this {
        this.shouldLoadAll = true;
        this.mcpAdditionalServers = additionalServers;
        return this;
    }

    /**
     * Loads MCP tools from the codebolt API.
     * Internal method called during build.
     */
    private async loadMCPTools(): Promise<void> {
        if (!this.codebolt) {
            console.warn("Codebolt API not available. Cannot load MCP tools automatically.");
            return;
        }

        try {
            // Get default tools from specified servers
            const { data: defaultTools } = await this.codebolt.mcp.listMcpFromServers(this.mcpAdditionalServers);
            this.tools = [...this.tools, ...defaultTools];

            // Get tools from mentioned MCPs
            if (this.mentionedMCPs && this.mentionedMCPs.length > 0) {
                const { data: mcpTools } = await this.codebolt.mcp.getTools(this.mentionedMCPs);
                this.tools = [...this.tools, ...mcpTools];
            }
        } catch (error) {
            console.error(`Error loading MCP tools: ${error}`);
        }
    }

    /**
     * Converts mentioned agents to OpenAI tool format.
     * Internal method called during build.
     */
    private loadAgentTools(): void {
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
    }

    /**
     * Loads file contents and environment details from the codebolt API.
     * Internal method called during build.
     */
    private async loadEnvironmentDetails(): Promise<void> {
        if (!this.codebolt) {
            console.warn("Codebolt API not available. Cannot load environment details automatically.");
            return;
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
                    this.systemPromptText += `\n\n<example_agent>\n\`\`\`\n${example}\n\`\`\`\n</example_agent>`;
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
     * Builds the user message content with files (without environment details).
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



        const content: Array<{ type: string; text: string }> = [
            { type: "text", text: finalPrompt }
        ];
        // Add environment details
        if (this.environmentDetails) {
            content.push(
                { type: "text", text: this.environmentDetails })
        }

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
     * Adds an LLM response to the conversation history.
     * This method processes the LLM response and adds the assistant's message to the conversation.
     * It handles both resolved responses and promises that resolve to responses.
     * 
     * @param llmResponse - The LLM response (can be a promise or resolved response)
     * @returns The PromptBuilder instance for chaining
     * 
     * @example
     * ```typescript
     * // Example of using addLLMResponse in an agent workflow loop
     * import { PromptBuilder } from './promptbuilder';
     * import llm from '../modules/llm';
     * 
     * async function agentWorkflowWithLLMResponse(userMessage: any, codebolt: CodeboltAPI) {
     *     // Step 1: Build initial prompt
     *     const promptBuilder = new PromptBuilder(userMessage, codebolt);
     *     let currentPrompt = await promptBuilder
     *         .addMCPTools()
     *         .addAgentTools()
     *         .addEnvironmentDetails()
     *         .buildInferenceParams();
     * 
     *     let completed = false;
     *     let maxTurns = 20;
     *     let turn = 0;
     * 
     *     // Step 2: Main conversation loop (similar to agent.ts while loop)
     *     while (!completed && turn < maxTurns) {
     *         // Get LLM response
     *         const llmResponse = llm.inference(currentPrompt);
     *         
     *         // Add LLM response to conversation history
     *         await promptBuilder.addLLMResponse(llmResponse);
     *         
     *         // Process the response using LLMOutputHandler
     *         const outputHandler = new LLMOutputHandler(llmResponse, codebolt);
     *         await outputHandler.sendMessageToUser();
     *         
     *         // Check if task is completed
     *         if (outputHandler.isCompleted()) {
     *             completed = true;
     *             break;
     *         }
     *         
     *         // Execute tools and get results
     *         const toolResults = await outputHandler.runTools();
     *         
     *         // Add tool results to conversation
     *         if (toolResults.length > 0) {
     *             promptBuilder.addToolResults(toolResults);
     *         } else {
     *             // Add default continuation message when no tools executed
     *             promptBuilder.addDefaultContinuationMessage();
     *         }
     *         
     *         // Build next prompt for the loop
     *         currentPrompt = await promptBuilder.buildInferenceParams();
     *         turn++;
     *     }
     * }
     * ```
     */
    async addLLMResponse(llmResponse: Promise<{ completion: any }> | { completion: any }): Promise<this> {
        try {
            // Resolve the response if it's a promise
            const resolvedResponse = await Promise.resolve(llmResponse);

            if (!resolvedResponse || !resolvedResponse.completion) {
                console.warn("Invalid LLM response provided");
                return this;
            }

            const completion = resolvedResponse.completion;
            let assistantMessage: ConversationEntry | null = null;

            // Handle different response formats
            if (completion.choices && completion.choices.length > 0) {
                // OpenAI-style response with choices
                const choice = completion.choices[0];
                if (choice.message) {
                    assistantMessage = {
                        role: "assistant",
                        content: choice.message.content || "",
                        tool_calls: choice.message.tool_calls || undefined
                    };
                }
            } else if (completion.content) {
                // Direct content response
                assistantMessage = {
                    role: "assistant",
                    content: completion.content
                };
            } else if (completion.message) {
                // Message format response
                assistantMessage = {
                    role: "assistant",
                    content: completion.message.content || "",
                    tool_calls: completion.message.tool_calls || undefined
                };
            }

            // Add the assistant message to conversation history
            if (assistantMessage) {
                this.conversationHistory.push(assistantMessage);
            } else {
                // Fallback for cases where no valid message is found
                this.conversationHistory.push({
                    role: "assistant",
                    content: "I apologize, but I was unable to provide a proper response."
                });
            }

        } catch (error) {
            console.error("Error adding LLM response to conversation:", error);
            // Add error message to conversation history
            this.conversationHistory.push({
                role: "assistant",
                content: "An error occurred while processing my response."
            });
        }

        return this;
    }

    /**
     * Adds tool results to the conversation history.
     * This method is typically used after executing tools from an LLM response.
     * 
     * @param toolResults - Array of tool results to add to the conversation
     * @returns The PromptBuilder instance for chaining
     */
    addToolResults(toolResults: ToolResult[]): this {
        if (toolResults && toolResults.length > 0) {
            // Add each tool result as a separate message
            toolResults.forEach(toolResult => {
                this.conversationHistory.push({
                    role: "tool",
                    content: toolResult.content,
                    tool_call_id: toolResult.tool_call_id
                });
            });
        }
        return this;
    }

    /**
     * Adds a user message to the conversation history.
     * Useful for adding follow-up questions or additional context during the conversation.
     * 
     * @param message - The user message to add
     * @returns The PromptBuilder instance for chaining
     */
    addUserMessage(message: string | Array<{ type: string; text: string }>): this {
        const userMessage: ConversationEntry = {
            role: "user",
            content: message
        };

        this.conversationHistory.push(userMessage);
        return this;
    }

    /**
     * Adds a default continuation message when no tools were executed.
     * This is used in the agent workflow to prompt the LLM to either complete the task
     * or ask for more information.
     * 
     * @returns The PromptBuilder instance for chaining
     */
    addDefaultContinuationMessage(): this {
        const defaultMessage = "If you have completed the user's task, use the attempt_completion tool. If you require additional information from the user, use the ask_followup_question tool. Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task. (This is an automated message, so do not respond to it conversationally.)";

        this.addUserMessage([{
            type: "text",
            text: defaultMessage
        }]);

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
     * Builds and returns the OpenAI message format with tools.
     * This method performs all async operations that were marked during setup.
     * 
     * @returns Object with messages, tools, and other LLM parameters
     */
    async build() {
        // Perform all async operations based on what was requested
        if (this.shouldLoadAll) {
            await this.loadMCPTools();
            this.loadAgentTools();
            await this.loadEnvironmentDetails();
        } else {
            if (this.shouldLoadMCPTools) {
                await this.loadMCPTools();
            }
            if (this.shouldLoadAgentTools) {
                this.loadAgentTools();
            }
            if (this.shouldLoadEnvironmentDetails) {
                await this.loadEnvironmentDetails();
            }
        }

        return {
            messages: this.buildOpenAIMessages(),
            tools: this.getTools(),
            full: true,
            tool_choice: "auto" as const,
        };
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

        // Reset async loading flags
        this.shouldLoadMCPTools = false;
        this.shouldLoadAgentTools = false;
        this.shouldLoadEnvironmentDetails = false;
        this.shouldLoadAll = false;
        this.mcpAdditionalServers = ["codebolt"];

        return this;
    }

    /**
     * Creates an LLM inference parameters object in the format expected by the sample code.
     * This method performs all async operations that were marked during setup.
     * 
     * @returns Object with messages, tools, and other LLM parameters
     */
    async buildInferenceParams() {
        // Perform all async operations based on what was requested
        if (this.shouldLoadAll) {
            await this.loadMCPTools();
            this.loadAgentTools();
            await this.loadEnvironmentDetails();
        } else {
            if (this.shouldLoadMCPTools) {
                await this.loadMCPTools();
            }
            if (this.shouldLoadAgentTools) {
                this.loadAgentTools();
            }
            if (this.shouldLoadEnvironmentDetails) {
                await this.loadEnvironmentDetails();
            }
        }

        return {
            full: true,
            messages: this.buildOpenAIMessages(),
            tools: this.getTools(),
            tool_choice: "auto" as const,
        };
    }
    /**
     * Creates a minimal LLM inference parameters object with only the user message.
     * This is useful for simple completions or when no tools/context are needed.
     * 
     * @returns Object with messages (user only), no tools, and default tool_choice
     */
    //TODO: implement this
    buildDefaultInferenceParams() {
        return {
            full: false,
            messages: [this.message],
            tools: [],
            tool_choice: "auto" as const,
        };
    }

    /**
     * Checks if the last LLM response indicates task completion.
     * This method examines the conversation history for completion signals.
     * 
     * @returns Boolean indicating if the task appears to be completed
     */
    isTaskCompleted(): boolean {
        if (this.conversationHistory.length === 0) {
            return false;
        }

        // Get the last assistant message
        const lastAssistantMessage = this.conversationHistory
            .slice()
            .reverse()
            .find(msg => msg.role === 'assistant');

        if (!lastAssistantMessage) {
            return false;
        }

        // Check if the message has tool calls with completion tools
        if (lastAssistantMessage.tool_calls) {
            const hasCompletionTool = lastAssistantMessage.tool_calls.some(toolCall =>
                toolCall.function && toolCall.function.name.includes('attempt_completion')
            );

            if (hasCompletionTool) {
                return true;
            }
        }

        // Check for completion keywords in the message content
        const content = typeof lastAssistantMessage.content === 'string'
            ? lastAssistantMessage.content
            : '';

        const completionKeywords = [
            'task completed',
            'task is completed',
            'successfully completed',
            'finished the task',
            'task has been completed'
        ];

        return completionKeywords.some(keyword =>
            content.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    /**
     * Gets the current conversation length (number of messages).
     * Useful for determining when to summarize the conversation.
     * 
     * @returns Number of messages in the conversation history
     */
    getConversationLength(): number {
        return this.conversationHistory.length;
    }

    /**
     * Checks if the conversation should be summarized based on length.
     * 
     * @param maxLength - Maximum conversation length before summarization (default: 50)
     * @returns Boolean indicating if summarization is needed
     */
    shouldSummarizeConversation(maxLength: number = 50): boolean {
        return this.getConversationLength() > maxLength;
    }
}



export {
    InitialPromptBuilder,
    MCPTool,
    Agent,
    InitialUserMessage,
    OpenAIMessage,
    OpenAITool,
    ConversationEntry,
    CodeboltAPI
};

