import codeboltjs from "@codebolt/codeboltjs";
const { chatSummary } = codeboltjs;
import type { 
    OpenAIMessage, 
    OpenAITool, 
    ToolResult, 
    ConversationEntry,
    CodeboltAPI 
} from "./types/libFunctionTypes";

/**
 * Builds follow-up prompts for continuing conversations with tool results.
 * Manages conversation history and summarization when conversations get too long.
 */
class FollowUpPromptBuilder {
    /** Previous conversation messages */
    private previousConversation: OpenAIMessage[] = [];
    /** Tool results to add to the conversation */
    private toolResults: ToolResult[] = [];
    /** Available tools for the conversation */
    private tools: OpenAITool[] = [];
    /** The last LLM response, if available */
    private llmResponse?: OpenAIMessage;
    
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
    addPreviousConversation(previousPrompt: { messages: OpenAIMessage[]; tools: OpenAITool[]; tool_choice?: string },llmResponse: { completion: any }): this {
        this.previousConversation = [...previousPrompt.messages];
        
        this.tools = [...previousPrompt.tools];
        try {
            // Resolve the response if it's a promise
            const resolvedResponse = llmResponse
            
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
                this.previousConversation.push(assistantMessage);
            } else {
                // Fallback for cases where no valid message is found
                this.previousConversation.push({
                    role: "assistant",
                    content: "I apologize, but I was unable to provide a proper response."
                });
            }

        } catch (error) {
            console.error("Error adding LLM response to conversation:", error);
            // Add error message to conversation history
            this.previousConversation.push({
                role: "assistant",
                content: "An error occurred while processing my response."
            });
        }

        return this;
    }
     addLLMResponseToConverstaion(llmResponse: { completion: any }): this {
       
        return this;
    }

    /**
     * Adds tool execution results to the conversation.
     * 
     * @param toolResults - Array of tool execution results
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    addToolResult(toolResults: ToolResult[]): this {
          toolResults.forEach(toolResult=>{
            this.previousConversation.push(toolResult)
          })
          if(!toolResults.length){
            this.previousConversation.push({
                role: "user",
                content: [{
                    type: "text",
                    text: "If you have completed the user's task, use the attempt_completion tool. If you require additional information from the user, use the ask_followup_question tool. Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task. (This is an automated message, so do not respond to it conversationally.)"
                }]
            })
          }
        return this;
    }

    /**
     * Checks if the conversation is too long and sets up summarization with custom max length.
     * 
     * @param maxLength - Maximum number of messages before summarization
     * @returns The FollowUpQuestionBuilder instance for chaining
     */
    checkAndSummarizeConversationIfLong(maxLength: number): this {
        this.maxConversationLength = maxLength;
        this.forceSummarization = this.previousConversation.length > maxLength;
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
    async build(): Promise<{ messages: OpenAIMessage[]; tools: OpenAITool[]; tool_choice: "auto",full:boolean }> {
        // Perform summarization if needed
        let messages = this.previousConversation;
        return {
            messages,
            tools: this.tools,
            full:true,
            tool_choice: "auto"
        };
    }
}

export { FollowUpPromptBuilder };
