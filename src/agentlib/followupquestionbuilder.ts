import { chatSummary } from "../modules/history";
import type { 
    OpenAIMessage, 
    OpenAITool, 
    ToolResult, 
    ConversationEntry,
    CodeboltAPI 
} from "../types/libFunctionTypes";

/**
 * Builds follow-up prompts for continuing conversations with tool results.
 * Manages conversation history and summarization when conversations get too long.
 */
class FollowUpQuestionBuilder {
    /** Previous conversation messages */
    private previousConversation: OpenAIMessage[] = [];
    /** Tool results to add to the conversation */
    private toolResults: ToolResult[] = [];
    /** Available tools for the conversation */
    private tools: OpenAITool[] = [];
    /** Maximum conversation length before summarization */
    private maxConversationLength: number = 50;
    /** Whether to force summarization */
    private forceSummarization: boolean = false;
    /** Codebolt API instance */
    private codebolt?: CodeboltAPI;

    /**
     * Creates a new FollowUpQuestionBuilder instance.
     * 
     * @param codebolt - Optional codebolt API instance
     */
    constructor(codebolt?: CodeboltAPI) {
        this.codebolt = codebolt;
    }

    /**
     * Adds the previous conversation to the builder.
     * 
     * @param previousPrompt - The previous prompt object containing messages and tools
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addPreviousConversation(previousPrompt: { messages: OpenAIMessage[]; tools: OpenAITool[]; tool_choice?: string }): this {
        this.previousConversation = [...previousPrompt.messages];
        this.tools = [...previousPrompt.tools];
        return this;
    }

    /**
     * Adds tool execution results to the conversation.
     * 
     * @param toolResults - Array of tool execution results
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addToolResult(toolResults: ToolResult[]): this {
        this.toolResults = [...toolResults];
        return this;
    }

    /**
     * Adds a single tool result to the conversation.
     * 
     * @param toolResult - A single tool execution result
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addSingleToolResult(toolResult: ToolResult): this {
        this.toolResults.push(toolResult);
        return this;
    }

    /**
     * Adds multiple tool results to the conversation.
     * 
     * @param toolResults - Array of tool execution results to add
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addMultipleToolResults(toolResults: ToolResult[]): this {
        this.toolResults.push(...toolResults);
        return this;
    }

    /**
     * Sets the maximum conversation length before summarization is triggered.
     * 
     * @param maxLength - Maximum number of messages before summarization
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    setMaxConversationLength(maxLength: number): this {
        this.maxConversationLength = maxLength;
        return this;
    }

    /**
     * Forces summarization regardless of conversation length.
     * 
     * @param force - Whether to force summarization
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    forceSummarize(force: boolean = true): this {
        this.forceSummarization = force;
        return this;
    }

    /**
     * Checks if the conversation is too long and summarizes if needed.
     * 
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    checkAndSummarizeConversationIfLong(): this {
        // This method sets up the summarization to happen during build()
        // The actual summarization is async and happens in build()
        return this;
    }

    /**
     * Adds a custom message to the conversation.
     * 
     * @param role - The role of the message sender
     * @param content - The content of the message
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addMessage(role: 'user' | 'assistant' | 'system', content: string | Array<{ type: string; text: string }>): this {
        this.previousConversation.push({
            role,
            content
        });
        return this;
    }

    /**
     * Adds a user message to the conversation.
     * 
     * @param content - The content of the user message
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addUserMessage(content: string): this {
        return this.addMessage('user', content);
    }

    /**
     * Adds an assistant message to the conversation.
     * 
     * @param content - The content of the assistant message
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addAssistantMessage(content: string): this {
        return this.addMessage('assistant', content);
    }

    /**
     * Adds a system message to the conversation.
     * 
     * @param content - The content of the system message
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addSystemMessage(content: string): this {
        return this.addMessage('system', content);
    }

    /**
     * Adds tools to the conversation.
     * 
     * @param tools - Array of tools to add
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addTools(tools: OpenAITool[]): this {
        this.tools.push(...tools);
        return this;
    }

    /**
     * Replaces the current tools with new ones.
     * 
     * @param tools - Array of tools to replace with
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    setTools(tools: OpenAITool[]): this {
        this.tools = [...tools];
        return this;
    }

    /**
     * Performs conversation summarization if needed.
     * 
     * @returns Promise that resolves to the summarized messages
     */
    private async performSummarization(): Promise<OpenAIMessage[]> {
        const shouldSummarize = this.forceSummarization || 
                               this.previousConversation.length > this.maxConversationLength;

        if (!shouldSummarize) {
            return this.previousConversation;
        }

        try {
            console.log("Summarizing conversation due to length:", this.previousConversation.length);
            
            // Convert OpenAI messages to the format expected by chatSummary
            const messagesToSummarize = this.previousConversation.map(msg => ({
                role: msg.role,
                content: typeof msg.content === 'string' ? msg.content : 
                        Array.isArray(msg.content) ? msg.content.map(c => c.text).join(' ') : 
                        String(msg.content)
            }));

            // Use the chat summary service to summarize the conversation
            const summaryResponse = await chatSummary.summarize(messagesToSummarize, Math.floor(this.maxConversationLength / 2));
            
            if (summaryResponse.payload || summaryResponse.summary) {
                const summaryText = summaryResponse.payload || summaryResponse.summary || '';
                
                // Keep the system message if it exists, and replace the rest with summary
                const systemMessage = this.previousConversation.find(msg => msg.role === 'system');
                const summarizedMessages: OpenAIMessage[] = [];
                
                if (systemMessage) {
                    summarizedMessages.push(systemMessage);
                }
                
                // Add the summary as a system message
                summarizedMessages.push({
                    role: 'system',
                    content: `Previous conversation summary: ${summaryText}`
                });
                
                // Keep the last few messages for context
                const recentMessages = this.previousConversation.slice(-5);
                summarizedMessages.push(...recentMessages);
                
                return summarizedMessages;
            }
        } catch (error) {
            console.error("Error summarizing conversation:", error);
        }

        // If summarization fails, just return the original conversation
        return this.previousConversation;
    }

    /**
     * Builds the follow-up conversation prompt with tool results.
     * 
     * @returns Promise that resolves to the conversation prompt object
     */
    async build(): Promise<{ messages: OpenAIMessage[]; tools: OpenAITool[]; tool_choice: "auto" }> {
        // Perform summarization if needed
        let messages = await this.performSummarization();

        // Add tool results to the conversation
        if (this.toolResults.length > 0) {
            // Convert tool results to OpenAI message format
            const toolMessages: OpenAIMessage[] = this.toolResults.map(result => ({
                role: result.role,
                content: result.content,
                tool_call_id: result.tool_call_id
            }));

            messages = [...messages, ...toolMessages];
        }

        return {
            messages,
            tools: this.tools,
            tool_choice: "auto"
        };
    }

    /**
     * Builds the follow-up conversation prompt for LLM inference.
     * 
     * @returns Promise that resolves to the inference parameters
     */
    async buildInferenceParams(): Promise<{ full: boolean; messages: OpenAIMessage[]; tools: OpenAITool[]; tool_choice: "auto" }> {
        const result = await this.build();
        
        return {
            full: true,
            messages: result.messages,
            tools: result.tools,
            tool_choice: result.tool_choice
        };
    }

    /**
     * Gets the current conversation length.
     * 
     * @returns The number of messages in the conversation
     */
    getConversationLength(): number {
        return this.previousConversation.length;
    }

    /**
     * Checks if the conversation needs summarization.
     * 
     * @returns True if the conversation should be summarized
     */
    shouldSummarize(): boolean {
        return this.forceSummarization || this.previousConversation.length > this.maxConversationLength;
    }

    /**
     * Gets the current conversation messages.
     * 
     * @returns Array of conversation messages
     */
    getConversationMessages(): OpenAIMessage[] {
        return [...this.previousConversation];
    }

    /**
     * Gets the current tools.
     * 
     * @returns Array of tools
     */
    getTools(): OpenAITool[] {
        return [...this.tools];
    }

    /**
     * Gets the current tool results.
     * 
     * @returns Array of tool results
     */
    getToolResults(): ToolResult[] {
        return [...this.toolResults];
    }

    /**
     * Clears all conversation data.
     * 
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    clear(): this {
        this.previousConversation = [];
        this.toolResults = [];
        this.tools = [];
        this.forceSummarization = false;
        return this;
    }

    /**
     * Resets the builder to initial state.
     * 
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    reset(): this {
        return this.clear();
    }
}

export { FollowUpQuestionBuilder };
