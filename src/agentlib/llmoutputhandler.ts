import chatlib from "../modules/chat";
import tools from "../modules/mcp";
import codeboltAgent from "../modules/agent";
import type { 
    OpenAIMessage, 
    OpenAITool, 
    ToolResult, 
    ToolDetails, 
    CodeboltAPI 
} from "../types/libFunctionTypes";
import type { LLMResponse } from "../types/socketMessageTypes";

/**
 * Handles LLM output processing, tool execution, and completion detection.
 * This class processes LLM responses and manages the conversation flow.
 */
class LLMOutputHandler {
    /** The LLM response to process */
    private llmResponse: Promise<{ completion: any }>;
    /** The resolved LLM response */
    private resolvedResponse: { completion: any } | null = null;
    /** Whether the task has been completed */
    private completed: boolean = false;
    /** Tool results from execution */
    private toolResults: ToolResult[] = [];
    /** Next user message to be added to conversation */
    private nextUserMessage: OpenAIMessage | null = null;
    /** Codebolt API instance */
    private codebolt?: CodeboltAPI;
    /** Whether tools have been executed */
    private toolsExecuted: boolean = false;

    /**
     * Creates a new LLMOutputHandler instance.
     * 
     * @param llmResponse - Promise that resolves to the LLM response
     * @param codebolt - Optional codebolt API instance
     */
    constructor(llmResponse: Promise<{ completion: any }>, codebolt?: CodeboltAPI) {
        this.llmResponse = llmResponse;
        this.codebolt = codebolt;
    }

    /**
     * Checks if the task has been completed.
     * 
     * @returns True if the task is completed, false otherwise
     */
    isCompleted(): boolean {
        return this.completed;
    }

    /**
     * Gets the tool execution results.
     * 
     * @returns Array of tool results
     */
    getToolResults(): ToolResult[] {
        return [...this.toolResults];
    }

    /**
     * Gets the next user message to be added to conversation.
     * 
     * @returns The next user message or null
     */
    getNextUserMessage(): OpenAIMessage | null {
        return this.nextUserMessage;
    }

    /**
     * Resolves the LLM response if not already resolved.
     * 
     * @returns Promise that resolves when the response is available
     */
    private async ensureResponseResolved(): Promise<void> {
        if (!this.resolvedResponse) {
            this.resolvedResponse = await this.llmResponse;
        }
    }

    /**
     * Sends the assistant's message to the user interface.
     * 
     * @returns Promise that resolves when the message is sent
     */
    async sendMessageToUser(): Promise<void> {
        await this.ensureResponseResolved();
        
        if (!this.resolvedResponse) {
            throw new Error("LLM response not available");
        }

        // Handle the response structure - it might have choices or direct content
        let messageContent = '';
        const completion = this.resolvedResponse.completion;
        
        if (completion && completion.choices && completion.choices.length > 0) {
            // OpenAI-style response with choices
            const choice = completion.choices[0];
            if (choice.message && choice.message.content) {
                messageContent = choice.message.content;
            }
        } else if (completion && completion.content) {
            // Direct content response
            messageContent = completion.content;
        }

        if (messageContent) {
            await chatlib.sendMessage(messageContent, {});
        }
    }

    /**
     * Executes all tool calls found in the LLM response.
     * 
     * @returns Promise that resolves when all tools are executed
     */
    async runTools(): Promise<ToolResult[]> {
        await this.ensureResponseResolved();
        
        if (!this.resolvedResponse || this.toolsExecuted) {
            return this.toolResults;
        }

        this.toolResults = [];
        this.toolsExecuted = true;
        let taskCompletedBlock: any = null;
        let userRejectedToolUse = false;

        // Check if response has tool calls
        const toolCalls = this.getToolCallsFromResponse();
        
        if (toolCalls && toolCalls.length > 0) {
            for (const tool of toolCalls) {
                try {
                    const { toolInput, toolName, toolUseId } = this.getToolDetail(tool);

                    if (!userRejectedToolUse) {
                        if (toolName.includes("attempt_completion")) {
                            taskCompletedBlock = tool;
                        } else {
                            const [didUserReject, result] = await this.executeTool(toolName, toolInput);
                            
                            const toolResult = this.getToolResult(toolUseId, result);
                            this.toolResults.push({
                                role: "tool",
                                tool_call_id: toolResult.tool_call_id,
                                content: toolResult.content,
                            });

                            if (toolResult.userMessage) {
                                this.nextUserMessage = {
                                    role: "user",
                                    content: toolResult.userMessage
                                };
                            }

                            if (didUserReject) {
                                userRejectedToolUse = true;
                            }
                        }
                    } else {
                        const toolResult = this.getToolResult(toolUseId, "Skipping tool execution due to previous tool user rejection.");
                        this.toolResults.push({
                            role: "tool",
                            tool_call_id: toolResult.tool_call_id,
                            content: toolResult.content,
                        });

                        if (toolResult.userMessage) {
                            this.nextUserMessage = {
                                role: "user",
                                content: toolResult.userMessage
                            };
                        }
                    }
                } catch (error) {
                    this.toolResults.push({
                        role: "tool",
                        tool_call_id: tool.id,
                        content: String(error),
                    });
                }
            }
        }

        // Handle completion tool call
        if (taskCompletedBlock) {
            const [_, result] = await this.executeTool(
                taskCompletedBlock.function.name,
                JSON.parse(taskCompletedBlock.function.arguments || "{}")
            );

            if (result === "") {
                this.completed = true;
            }

            const toolResult = this.getToolResult(taskCompletedBlock.id, result || "The user is satisfied with the result.");
            this.toolResults.push({
                role: "tool",
                tool_call_id: toolResult.tool_call_id,
                content: toolResult.content,
            });

            if (toolResult.userMessage) {
                this.nextUserMessage = {
                    role: "user",
                    content: toolResult.userMessage
                };
            }
        }

        // If no tools were executed, add a default message
        if (this.toolResults.length === 0) {
            this.nextUserMessage = {
                role: "user",
                content: [{
                    type: "text",
                    text: "If you have completed the user's task, use the attempt_completion tool. If you require additional information from the user, use the ask_followup_question tool. Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task. (This is an automated message, so do not respond to it conversationally.)"
                }]
            };
        }

        return this.toolResults;
    }

    /**
     * Extracts tool calls from the LLM response.
     * 
     * @returns Array of tool calls or null if none found
     */
    private getToolCallsFromResponse(): any[] | null {
        if (!this.resolvedResponse) return null;

        // Check OpenAI-style response structure
        const completion = this.resolvedResponse.completion;
        if (completion && completion.choices && completion.choices.length > 0) {
            const choice = completion.choices[0];
            if (choice.message && (choice.message as any).tool_calls) {
                return (choice.message as any).tool_calls;
            }
        }

        // Check direct tool_calls property
        if (completion && (completion as any).tool_calls) {
            return (completion as any).tool_calls;
        }

        return null;
    }

    /**
     * Extracts tool details from a tool call object.
     * 
     * @param tool - The tool call object from the LLM response
     * @returns ToolDetails object with name, input, and ID
     */
    private getToolDetail(tool: any): ToolDetails {
        return {
            toolName: tool.function.name,
            toolInput: JSON.parse(tool.function.arguments || "{}"),
            toolUseId: tool.id
        };
    }

    /**
     * Executes a tool with given name and input.
     * 
     * @param toolName - The name of the tool to execute
     * @param toolInput - The input parameters for the tool
     * @returns Promise with tuple [userRejected, result]
     */
    private async executeTool(toolName: string, toolInput: any): Promise<[boolean, any]> {
        console.log("Executing tool: ", toolName, toolInput);
        
        // Handle subagent tools
        if (toolName.startsWith('subagent--')) {
            const agentId = toolName.replace("subagent--", '');
            const agentResponse = await codeboltAgent.startAgent(agentId, toolInput.task);
            return [false, "tool result is successful"];
        }

        // Handle regular MCP tools
        const [toolboxName, actualToolName] = toolName.split('--');
        console.log("Toolbox name: ", toolboxName, "Actual tool name: ", actualToolName);
        
        const { data } = await tools.executeTool(toolboxName, actualToolName, toolInput);
        console.log("Tool result: ", data);
        
        return [false, data];
    }

    /**
     * Creates a tool result object from the tool execution response.
     * 
     * @param tool_call_id - The ID of the tool call
     * @param content - The content returned by the tool
     * @returns ToolResult object
     */
    private getToolResult(tool_call_id: string, content: string): ToolResult {
        let userMessage = undefined;
        
        try {
            const parsed = JSON.parse(content);
            console.log("Parsed Content: ", parsed);
            
            if (parsed.payload && parsed.payload.content) {
                content = `The browser action has been executed. The screenshot have been captured for your analysis. The tool response is provided in the next user message`;
                userMessage = parsed.payload.content;
            }
        } catch (error) {
            // Content is not JSON, use as-is
        }

        return {
            role: "tool",
            tool_call_id,
            content,
            userMessage
        };
    }

    /**
     * Checks if the response has tool calls.
     * 
     * @returns True if the response contains tool calls
     */
    hasToolCalls(): boolean {
        if (!this.resolvedResponse) return false;
        const toolCalls = this.getToolCallsFromResponse();
        return toolCalls !== null && toolCalls.length > 0;
    }

    /**
     * Gets the assistant's message content from the response.
     * 
     * @returns The assistant's message content or null
     */
    async getAssistantMessage(): Promise<string | null> {
        await this.ensureResponseResolved();
        
        if (!this.resolvedResponse) return null;

        const completion = this.resolvedResponse.completion;
        if (completion && completion.choices && completion.choices.length > 0) {
            const choice = completion.choices[0];
            if (choice.message && choice.message.content) {
                return choice.message.content;
            }
        } else if (completion && completion.content) {
            return completion.content;
        }

        return null;
    }

    /**
     * Resets the handler state for reuse.
     */
    reset(): void {
        this.completed = false;
        this.toolResults = [];
        this.nextUserMessage = null;
        this.toolsExecuted = false;
        this.resolvedResponse = null;
    }
}

export { LLMOutputHandler };
