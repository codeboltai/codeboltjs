import chatlib from "../modules/chat";
import tools from "../modules/mcp";
import codeboltAgent from "../modules/agent";
import type {
    OpenAIMessage,
    OpenAITool,
    ToolResult,
    ToolDetails,
    CodeboltAPI,
    Message
} from "../types/libFunctionTypes";
import type { LLMResponse } from "../types/socketMessageTypes";

/**
 * Handles LLM output processing, tool execution, and completion detection.
 * This class processes LLM responses and manages the conversation flow.
 */
class LLMOutputHandler {
    /** The LLM response to process */
    private llmResponse: { completion: any };
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
     * @param llmResponse - The LLM response object
     * @param codebolt - Optional codebolt API instance
     */
    constructor(llmResponse: any, codebolt?: CodeboltAPI) {
        // Validate llmResponse structure
        if (!llmResponse) {
            throw new Error("LLM response is null or undefined");
        }
        
        if (!llmResponse.completion) {
            throw new Error("LLM response completion is missing");
        }
        
        if (!llmResponse.completion.choices || !Array.isArray(llmResponse.completion.choices)) {
            throw new Error("LLM response choices array is missing or invalid");
        }
        
        this.llmResponse = llmResponse;
        this.codebolt = codebolt;
       
        // Check if any message has tool_calls, if none do, mark as completed
        let hasToolCalls = false;
        try {
            this.llmResponse.completion.choices.forEach((message: any) => {
                if (message.message?.tool_calls && message.message.tool_calls.length > 0) {
                    hasToolCalls = true;
                }
            });
        } catch (error) {
            console.error("Error checking for tool calls:", error);
            hasToolCalls = false;
        }
        
        // If no messages have tool_calls, mark as completed
        if (!hasToolCalls) {
            try {
                this.sendMessageToUser();
            } catch (error) {
                console.error("Error sending message to user:", error);
            }
            this.completed = true;
        }
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
     * Sends the assistant's message to the user interface.
     * 
     * @returns Promise that resolves when the message is sent
     */
    async sendMessageToUser(): Promise<void> {
       
        if (!this.llmResponse) {
            throw new Error("LLM response not available");
        }

        // Handle the response structure - it might have choices or direct content
        let messageContent = '';
        const completion = this.llmResponse.completion;

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
            this.codebolt?.chat?.sendMessage(messageContent, {});
        }
    }

    /**
     * Executes all tool calls found in the LLM response.
     * 
     * @returns Promise that resolves when all tools are executed
     */
    async runTools(): Promise<ToolResult[]> {
        try {
            // Validate llmResponse structure
            if (!this.llmResponse || !this.llmResponse.completion) {
                throw new Error("Invalid LLM response structure");
            }
            
            if (!this.llmResponse.completion.choices || !Array.isArray(this.llmResponse.completion.choices)) {
                throw new Error("LLM response choices array is missing or invalid");
            }
            
            if (this.llmResponse.completion.choices.length === 0) {
                console.warn("No choices found in LLM response");
                return this.toolResults;
            }
            
            let toolResults: ToolResult[] = [];
            let taskCompletedBlock: any;
            let userRejectedToolUse = false;
            console.log("Calling run tool: ", JSON.stringify (this.llmResponse.completion));
            
            const contentBlock = this.llmResponse.completion.choices[0];
            
            // Validate contentBlock structure
            if (!contentBlock || !contentBlock.message) {
                console.warn("Invalid content block structure");
                return this.toolResults;
            }

            if (contentBlock.message?.tool_calls) {
                for (const tool of contentBlock.message.tool_calls) {
                    try {
                        const { toolInput, toolName, toolUseId } = this.getToolDetail(tool);

                        if (!userRejectedToolUse) {
                            if (toolName.includes("attempt_completion")) {
                                taskCompletedBlock = tool;
                            } else {

                                let [serverName] = toolName.replace('--', ':').split(':');


                                if (serverName == 'subagent') {

                                    const agentResponse = await codeboltAgent.startAgent(toolName.replace("subagent--", ''), toolInput.task);
                                    const [didUserReject, result] = [false, "tool result is successful"];
                                    let toolResult = this.getToolResult(toolUseId, result)
                                    this.toolResults.push({
                                        role: "tool",
                                        tool_call_id: toolResult.tool_call_id,
                                        content: toolResult.content,

                                    });
                                    if (toolResult.userMessage) {
                                        this.nextUserMessage = {
                                            role: "user",
                                            content: toolResult.userMessage
                                        }
                                    }
                                    if (didUserReject) {
                                        userRejectedToolUse = true;
                                    }

                                }
                                else {
                                    console.log("Executing tool: ", toolName, toolInput);
                                    const [didUserReject, result] = await this.executeTool(toolName, toolInput);
                                    console.log("Tool result: ", result);
                                    // toolResults.push(this.getToolResult(toolUseId, result));
                                    let toolResult = this.getToolResult(toolUseId, result);

                                    console.log("tool result after parsing",toolResult);
                                 
                                    this.toolResults.push({
                                        role: "tool",
                                        tool_call_id: toolResult.tool_call_id,
                                        content: toolResult.content,

                                    });
                                    if (toolResult.userMessage) {
                                        this.nextUserMessage = {
                                            role: "user",
                                            content: toolResult.userMessage
                                        }
                                    }
                                    if (didUserReject) {
                                        userRejectedToolUse = true;
                                    }
                                }

                            }
                        } else {
                            let toolResult = this.getToolResult(toolUseId, "Skipping tool execution due to previous tool user rejection.")

                            this.toolResults.push({
                                role: "tool",
                                tool_call_id: toolResult.tool_call_id,
                                content: toolResult.content,

                            });
                            if (toolResult.userMessage) {
                                this.nextUserMessage = {
                                    role: "user",
                                    content: toolResult.userMessage
                                }
                            }

                        }
                    } catch (error) {
                      
                        this.toolResults.push({
                            role: "tool",
                            tool_call_id: tool?.id || "unknown",
                            content: String(error),

                        });

                    }
                }
            }

            if (taskCompletedBlock) {
                let taskArgs = {};
                try {
                    // Validate taskCompletedBlock structure
                    if (!taskCompletedBlock.function) {
                        throw new Error("Task completed block function is missing");
                    }
                    
                    if (!taskCompletedBlock.function.name) {
                        throw new Error("Task completed block function name is missing");
                    }
                    
                    // Parse arguments safely
                    const argumentsString = taskCompletedBlock.function.arguments || "{}";
                    if (typeof argumentsString !== 'string') {
                        throw new Error("Task completed block arguments must be a string");
                    }
                    
                    taskArgs = JSON.parse(argumentsString);
                } catch (parseError) {
                    const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
                    console.error("Failed to parse taskCompletedBlock arguments:", errorMessage);
                    taskArgs = {};
                }
                
                let [_, result] = await this.executeTool(
                    taskCompletedBlock.function.name,
                    taskArgs
                );

                if (result === "") {
                    this.completed = true;
                    result = "The user is satisfied with the result.";
                }
                let toolResult = this.getToolResult(taskCompletedBlock?.id || "unknown", result)
                this.toolResults.push({
                    role: "tool",
                    tool_call_id: toolResult.tool_call_id,
                    content: toolResult.content,

                });
                if (toolResult.userMessage) {
                    this.nextUserMessage = {
                        role: "user",
                        content: toolResult.userMessage
                    }
                }

            }

            // this.apiConversationHistory.push(...toolResults);
            // if (this.nextUserMessage) {
            //     this.apiConversationHistory.push(this.nextUserMessage);
            // }
            let nextUserMessage: Message[] = this.toolResults;

            if (this.toolResults.length === 0) {
                nextUserMessage = [{
                    role: "user",
                    content: [{
                        type: "text",
                        text: "If you have completed the user's task, use the attempt_completion tool. If you require additional information from the user, use the ask_followup_question tool. Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task. (This is an automated message, so do not respond to it conversationally.)"
                    }]
                }];

               
            }
            return this.toolResults
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`Error in runTools: ${errorMessage}`, error);
            
            // Add error information to tool results for debugging
            this.toolResults.push({
                role: "tool",
                tool_call_id: "error",
                content: `Error executing tools: ${errorMessage}`
            });
            
            return this.toolResults;
        }
    }

    /**
     * Extracts tool calls from the LLM response.
     * 
     * @returns Array of tool calls or null if none found
     */
    private getToolCallsFromResponse(): any[] | null {
        if (!this.llmResponse) return null;

        // Check OpenAI-style response structure
        const completion = this.llmResponse.completion;
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
        try {
            // Validate tool object
            if (!tool) {
                throw new Error("Tool object is null or undefined");
            }

            // Validate tool.function
            if (!tool.function) {
                throw new Error("Tool function is null or undefined");
            }

            // Validate tool.function.name
            if (!tool.function.name || typeof tool.function.name !== 'string') {
                throw new Error("Tool function name is missing or invalid");
            }

            // Validate tool.id
            if (!tool.id || typeof tool.id !== 'string') {
                throw new Error("Tool ID is missing or invalid");
            }

            // Parse tool arguments safely
            let toolInput: any = {};
            if (tool.function.arguments) {
                try {
                    toolInput = JSON.parse(tool.function.arguments);
                } catch (parseError) {
                    throw new Error(`Failed to parse tool arguments: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`);
                }
            }

            return {
                toolName: tool.function.name,
                toolInput: toolInput,
                toolUseId: tool.id
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to extract tool details: ${errorMessage}`);
        }
    }

    /**
     * Executes a tool with given name and input.
     * 
     * @param toolName - The name of the tool to execute
     * @param toolInput - The input parameters for the tool
     * @returns Promise with tuple [userRejected, result]
     */
    private async executeTool(toolName: string, toolInput: any): Promise<any> {
        //codebolttools--readfile
        const [toolboxName, actualToolName] = toolName.split('--');
        console.log("Toolbox name: ", toolboxName, "Actual tool name: ", actualToolName);
        const data = await this.codebolt?.mcp.executeTool(toolboxName, actualToolName, toolInput);
        console.log("Tool result: ", data);
        return data;
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
            // Validate content before parsing
            if (typeof content !== 'string') {
                throw new Error("Content must be a string");
            }
            
            // Only attempt to parse if content looks like JSON
            if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                const parsed = JSON.parse(content);
                console.log("Parsed Content: ", parsed);

                if (parsed && typeof parsed === 'object' && parsed.payload && parsed.payload.content) {
                    content = `The browser action has been executed. The screenshot have been captured for your analysis. The tool response is provided in the next user message`;
                    userMessage = parsed.payload.content;
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parsing error';
            console.warn(`Failed to parse tool result content as JSON: ${errorMessage}. Using content as-is.`);
            // Content is not valid JSON, use as-is
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
        if (!this.llmResponse) return false;
        const toolCalls = this.getToolCallsFromResponse();
        return toolCalls !== null && toolCalls.length > 0;
    }

    /**
     * Gets the assistant's message content from the response.
     * 
     * @returns The assistant's message content or null
     */
    getAssistantMessage(): string | null {
        if (!this.llmResponse) return null;

        const completion = this.llmResponse.completion;
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
    }
}

export { LLMOutputHandler };
