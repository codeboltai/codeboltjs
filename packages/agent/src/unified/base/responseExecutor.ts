
import { AgentResponseExecutor, PostInferenceProcessor, PostToolCallProcessor, PreToolCallProcessor, ProcessedMessage, ResponseInput, ResponseOutput, ToolResult } from '@codebolt/types/agent';
import { LLMCompletion, MessageObject, Tool, ToolCall } from '@codebolt/types/sdk';
import codebolt from '@codebolt/codeboltjs';

export class ResponseExecutor implements AgentResponseExecutor {

    private preToolCalProcessors: PreToolCallProcessor[] = []
    private postToolCallProcessors: PostToolCallProcessor[] = []
    private completed: boolean = false;

    constructor(options: {
        preToolCalProcessors: PreToolCallProcessor[]
        postToolCallProcessors: PostToolCallProcessor[],

    }) {

        this.preToolCalProcessors = options.preToolCalProcessors
        this.postToolCallProcessors = options.postToolCallProcessors

    }
    async executeResponse(input: ResponseInput): Promise<ResponseOutput> {

        let nextMessage: ProcessedMessage = input.nextMessage;

        for (const preToolCallProcessor of this.preToolCalProcessors) {
            try {
                // TODO: Extract required properties from input for PreToolCallProcessorInput
                let { nextPrompt, shouldExit } = await preToolCallProcessor.modify({ llmMessageSent: input.actualMessageSentToLLM, rawLLMResponseMessage: input.rawLLMOutput, nextPrompt: input.nextMessage });
                nextMessage = nextPrompt;
                if (shouldExit) {
                    this.completed = true
                    Promise.resolve({
                        nextPrompt,
                        completed: this.completed
                    })
                }

            } catch (error) {
                console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                // Continue with other modifiers
            }
        }
        //ToolCall here

        let toolResults = await this.executeTools(input.rawLLMOutput);

        // INSERT_YOUR_CODE
        if (nextMessage && toolResults && toolResults.length > 0 && nextMessage && nextMessage.message && Array.isArray(nextMessage.message.messages)) {
            for (const toolResult of toolResults) {
                const messageObject: MessageObject = {
                    role: toolResult.role,
                    content: typeof toolResult.content === 'string' ? toolResult.content : JSON.stringify(toolResult.content),
                    tool_call_id: toolResult.tool_call_id
                };
                nextMessage.message.messages.push(messageObject);
            }
        }

        for (const postToolCallProcessor of this.postToolCallProcessors) {
            try {

                // TODO: Extract required properties from input for PreToolCallProcessorInput
                let { nextPrompt, shouldExit } = await postToolCallProcessor.modify({
                    llmMessageSent: input.actualMessageSentToLLM,
                    rawLLMResponseMessage: input.rawLLMOutput,
                    nextPrompt: input.nextMessage,
                    toolResults: []
                });
                if (shouldExit) {
                    this.completed = true
                    Promise.resolve({
                        nextPrompt,
                        completed: this.completed
                    })
                }
            } catch (error) {
                console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                // Continue with other modifiers
            }
        }
        return {
            completed: this.completed,
            nextMessage: nextMessage,
            toolResults: toolResults
        }

    }
    /**
   * Extract tool details from tool call
   */
    private getToolDetail(tool: ToolCall) {

        let toolInput: any = {};
        if (tool.function.arguments) {
            try {
                toolInput = JSON.parse(tool.function.arguments);
            } catch (parseError) {
                throw new Error(`Failed to parse tool arguments: ${parseError}`);
            }
        }
        return {
            toolName: tool.function.name,
            toolInput: toolInput,
            toolUseId: tool.id
        };
    }

    private async executeTools(
        llmResponse: LLMCompletion
    ): Promise<ToolResult[]> {
        try {
            let fallBackMessages: MessageObject[] = []
            for (const contentBlock of llmResponse.choices || []) {
                if (contentBlock.message) {

                    if (contentBlock.message.content != null) {
                        await codebolt.chat.sendMessage(contentBlock.message.content, {});
                    }
                }
            }
            try {
                let toolResults: ToolResult[] = [];
                let taskCompletedBlock: any;
                let userRejectedToolUse = false;
                const contentBlock = llmResponse.choices?.[0];

                if (contentBlock && contentBlock.message?.tool_calls) {
                    for (const tool of contentBlock.message.tool_calls) {
                        try {
                            const { toolInput, toolName, toolUseId } = this.getToolDetail(tool);

                            if (!userRejectedToolUse) {
                                if (toolName.includes("attempt_completion")) {
                                    taskCompletedBlock = tool;
                                } else {

                                    let [serverName] = toolName.replace('--', ':').split(':');

                                    if (serverName == 'subagent') {
                                        const agentResponse = await codebolt.agent.startAgent(toolName.replace("subagent--", ''), toolInput.task);
                                        const [didUserReject, result] = [false, "tool result is successful"];
                                        let toolResult = this.parseToolResult(toolUseId, result)
                                        toolResults.push({
                                            role: "tool",
                                            tool_call_id: toolResult.tool_call_id,
                                            content: toolResult.content,

                                        });
                                        if (toolResult.userMessage) {
                                            fallBackMessages.push({
                                                role: "user",
                                                content: toolResult.userMessage.toString()
                                            })
                                        }
                                        if (didUserReject) {
                                            userRejectedToolUse = true;
                                        }

                                    }
                                    else {
                                        console.log("Executing tool: ", toolName, toolInput);
                                        const [didUserReject, result] = await this.executeTool(toolName, toolInput);
                                        console.log("Tool result: ", result);
                                        // toolResults.push(this.parseToolResult(toolUseId, result));
                                        let toolResult = this.parseToolResult(toolUseId, result)

                                        toolResults.push({
                                            role: "tool",
                                            tool_call_id: toolResult.tool_call_id,
                                            content: toolResult.content,

                                        });
                                        if (toolResult.userMessage) {
                                            fallBackMessages.push({
                                                role: "user",
                                                content: toolResult.userMessage.toString()
                                            })
                                        }
                                        if (didUserReject) {
                                            userRejectedToolUse = true;
                                        }
                                    }

                                }
                            } else {
                                let toolResult = this.parseToolResult(toolUseId, "Skipping tool execution due to previous tool user rejection.")
                                toolResults.push({
                                    role: "tool",
                                    tool_call_id: toolResult.tool_call_id,
                                    content: toolResult.content,

                                });
                                if (toolResult.userMessage) {
                                    fallBackMessages.push({
                                        role: "user",
                                        content: toolResult.userMessage.toString()
                                    })
                                }

                            }
                        } catch (error) {

                            toolResults.push({
                                role: "tool",
                                tool_call_id: tool.id,
                                content: String(error),

                            });

                        }
                    }
                }

                if (taskCompletedBlock) {
                    let [_, result] = await this.executeTool(
                        taskCompletedBlock.function.name,
                        JSON.parse(taskCompletedBlock.function.arguments || "{}")
                    );

                    if (result === "") {
                        this.completed = true;
                        result = "The user is satisfied with the result.";
                    }
                    let toolResult = this.parseToolResult(taskCompletedBlock.id, result)
                    toolResults.push({
                        role: "tool",
                        tool_call_id: toolResult.tool_call_id,
                        content: toolResult.content,

                    });
                    if (toolResult.userMessage) {
                        fallBackMessages.push({
                            role: "user",
                            content: toolResult.userMessage.toString()
                        })
                    }

                }

                if (toolResults.length === 0) {
                    fallBackMessages = [{
                        role: "user",
                        content: [{
                            type: "text",
                            text: "If you have completed the user's task, use the attempt_completion tool. If you require additional information from the user, use the ask_followup_question tool. Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task. (This is an automated message, so do not respond to it conversationally.)"
                        }]
                    }];


                }
                return toolResults
            }
            catch (error) {

            }
        } catch (error) {

        }
        return [];
    }


    /**
     * Executes a tool with given name and input.
     * 
     * @param toolName - The name of the tool to execute
     * @param toolInput - The input parameters for the tool
     * @returns Promise with tuple [userRejected, result]
     */
    private async executeTool(toolName: string, toolInput: any): Promise<[boolean, any]> {
        //codebolttools--readfile
        console.log("Executing tool: ", toolName, toolInput);
        const [toolboxName, actualToolName] = toolName.split('--');
        console.log("Toolbox name: ", toolboxName, "Actual tool name: ", actualToolName);
        const { data } = await codebolt.mcp.executeTool(toolboxName, actualToolName, toolInput);
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
    private parseToolResult(tool_call_id: string, content: string): ToolResult {
        let userMessage = undefined
        try {
            let parsed = JSON.parse(content);

            console.log("Parsed Content: ", parsed);
            if (parsed.payload && parsed.payload.content) {
                content = `The browser action has been executed. The  screenshot have been captured for your analysis. The tool response is provided in the next user message`
                // this.apiConversationHistory.push()
                userMessage = parsed.payload.content
            }
        } catch (error) {

        }
        return {
            role: "tool",
            tool_call_id,
            content,
            userMessage
        };
    }




    setPreToolCallProcessors(processors: PreToolCallProcessor[]): void {
        this.preToolCalProcessors = processors
    }
    setPostToolCallProcessors(processors: PostToolCallProcessor[]): void {
        this.postToolCallProcessors = processors

    }
    getPreToolCallProcessors(): PreToolCallProcessor[] {
        return this.preToolCalProcessors
    }
    getPostToolCallProcessors(): PostToolCallProcessor[] {
        return this.postToolCallProcessors
    }

}